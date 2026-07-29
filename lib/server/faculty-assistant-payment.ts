import type { SupabaseClient } from '@supabase/supabase-js'
import {
  createPayNexusCheckoutSession,
  facultyAssistantPaymentReference,
  initiatePayNexusStk,
  normalizeKenyanPhone,
  payNexusConfigured,
} from './paynexus'

type StartPaymentOptions = {
  supabase: SupabaseClient
  requestId: string
  amountKes: number
  phone: string
  billingPeriod: 'monthly' | 'annual'
}

export type FacultyAssistantPaymentSummary = {
  orderId: string
  accountReference: string
  amountKes: number
  status: string
  stkStatus: 'initiated' | 'failed' | 'not_configured'
  checkoutUrl: string
  checkoutSessionId: string
  error: string
}

export async function startFacultyAssistantProfessionalPayment(
  options: StartPaymentOptions,
): Promise<FacultyAssistantPaymentSummary | null> {
  if (!payNexusConfigured()) return null
  const phone = normalizeKenyanPhone(options.phone)
  if (!phone) throw new Error('invalid_kenyan_mpesa_phone')

  const { data: existing, error: lookupError } = await options.supabase
    .from('faculty_assistant_payment_orders')
    .select('*')
    .eq('request_id', options.requestId)
    .maybeSingle()
  if (lookupError) throw new Error(`payment_order_lookup_failed:${lookupError.message}`)
  if (existing) return paymentSummary(existing)

  const accountReference = facultyAssistantPaymentReference(options.requestId)
  const { data: order, error: insertError } = await options.supabase
    .from('faculty_assistant_payment_orders')
    .insert({
      request_id: options.requestId,
      account_reference: accountReference,
      amount_kes: options.amountKes,
      currency: 'KES',
      phone,
      status: 'created',
    })
    .select('*')
    .single()
  if (insertError || !order) {
    throw new Error(`payment_order_create_failed:${insertError?.message || 'no_order'}`)
  }

  const returnOrigin = facultyAssistantPaymentReturnOrigin()
  const description = `Faculty Assistant Professional ${options.billingPeriod} - ${accountReference}`
  const [checkoutResult, stkResult] = await Promise.allSettled([
    createPayNexusCheckoutSession({
      amount: options.amountKes,
      description,
      reference: accountReference,
      returnUrl: `${returnOrigin}/payment/success`,
      cancelUrl: `${returnOrigin}/payment/cancelled`,
    }),
    initiatePayNexusStk({
      amount: options.amountKes,
      phone,
      description,
    }),
  ])

  const checkout = checkoutResult.status === 'fulfilled'
    ? checkoutResult.value
    : null
  const stk = stkResult.status === 'fulfilled' ? stkResult.value : null
  const failures = [
    checkoutResult.status === 'rejected' ? errorMessage(checkoutResult.reason) : '',
    stkResult.status === 'rejected' ? errorMessage(stkResult.reason) : '',
  ].filter(Boolean)
  const status = checkout || stk ? 'pending' : 'failed'
  const { data: updated, error: updateError } = await options.supabase
    .from('faculty_assistant_payment_orders')
    .update({
      status,
      checkout_session_id: checkout?.session_id || null,
      checkout_url: checkout?.checkout_url || null,
      stk_reference: stk?.reference || null,
      stk_checkout_request_id: stk?.checkout_request_id || null,
      last_provider_status: stk?.status || (checkout ? 'checkout_created' : 'failed'),
      failure_reason: failures.join(' | ').slice(0, 1000),
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .select('*')
    .single()
  if (updateError || !updated) {
    throw new Error(`payment_order_update_failed:${updateError?.message || 'no_order'}`)
  }
  return paymentSummary(updated)
}

function paymentSummary(order: Record<string, unknown>): FacultyAssistantPaymentSummary {
  return {
    orderId: String(order.id || ''),
    accountReference: String(order.account_reference || ''),
    amountKes: Number(order.amount_kes || 0),
    status: String(order.status || 'created'),
    stkStatus: order.stk_reference ? 'initiated' : order.failure_reason
      ? 'failed'
      : 'not_configured',
    checkoutUrl: String(order.checkout_url || ''),
    checkoutSessionId: String(order.checkout_session_id || ''),
    error: String(order.failure_reason || ''),
  }
}

function facultyAssistantPaymentReturnOrigin() {
  const configured =
    process.env.FACULTY_ASSISTANT_PAYMENT_RETURN_ORIGIN?.trim()
    || 'https://facultyassistant.org'
  const parsed = new URL(configured)
  if (parsed.protocol !== 'https:') throw new Error('payment_return_https_required')
  return parsed.origin
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || 'unknown_provider_error')
}

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  createPayNexusCheckoutSession,
  facultyAssistantPaymentReference,
  initiatePayNexusStk,
  normalizeKenyanPhone,
  payNexusConfigured,
} from './paynexus'
import { eversendConfigured, initiateEversendCollection } from './eversend'

type StartPaymentOptions = {
  supabase: SupabaseClient
  requestId: string
  amountKes: number
  phone: string
  billingPeriod: 'monthly' | 'annual'
  email: string
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
  provider: 'eversend' | 'paynexus'
}

export async function startFacultyAssistantProfessionalPayment(
  options: StartPaymentOptions,
): Promise<FacultyAssistantPaymentSummary | null> {
  const provider = facultyAssistantPaymentProvider()
  if (!provider) return null
  const phone = normalizeKenyanPhone(options.phone)
  if (!phone) throw new Error('invalid_kenyan_mpesa_phone')

  const { data: existing, error: lookupError } = await options.supabase
    .from('faculty_assistant_payment_orders')
    .select('*')
    .eq('request_id', options.requestId)
    .maybeSingle()
  if (lookupError) throw new Error(`payment_order_lookup_failed:${lookupError.message}`)
  if (existing && !isRetryableFacultyAssistantPayment(existing.status, existing.updated_at)) {
    return paymentSummary(existing)
  }

  const generatedReference = facultyAssistantPaymentReference(options.requestId)
  const accountReference = provider === 'eversend'
    ? generatedReference.replace(/[^A-Za-z0-9]/g, '')
    : generatedReference
  const order = existing
    ? await resetPaymentOrder(options, existing.id, phone, provider, accountReference)
    : await createPaymentOrder(options, accountReference, phone, provider)

  if (provider === 'eversend') {
    return startEversendPayment(options, order, accountReference, phone)
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
      provider,
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

async function startEversendPayment(
  options: StartPaymentOptions,
  order: Record<string, unknown>,
  accountReference: string,
  phone: string,
) {
  try {
    const collection = await initiateEversendCollection({
      amount: options.amountKes,
      phone,
      email: options.email,
      transactionRef: accountReference,
    })
    const providerStatus = collection.status.toLowerCase()
    const rejected = ['failed', 'declined', 'rejected', 'error'].some((value) =>
      providerStatus.includes(value),
    )
    const { data, error } = await options.supabase
      .from('faculty_assistant_payment_orders')
      .update({
        provider: 'eversend',
        status: rejected ? 'failed' : 'pending',
        stk_reference: collection.reference || null,
        last_provider_status: collection.status,
        failure_reason: rejected ? `Eversend collection ${collection.status}`.slice(0, 1000) : '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select('*')
      .single()
    if (error || !data) throw new Error(`payment_order_update_failed:${error?.message || 'no_order'}`)
    return paymentSummary(data)
  } catch (error) {
    const failure = errorMessage(error)
    const { data, error: updateError } = await options.supabase
      .from('faculty_assistant_payment_orders')
      .update({
        provider: 'eversend',
        status: 'failed',
        last_provider_status: 'initiation_failed',
        failure_reason: failure.slice(0, 1000),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select('*')
      .single()
    if (updateError || !data) throw error
    return paymentSummary(data)
  }
}

export function isRetryableFacultyAssistantPayment(status: unknown, updatedAt?: unknown) {
  const normalizedStatus = String(status || '').toLowerCase()
  if (['failed', 'cancelled', 'expired'].includes(normalizedStatus)) return true
  if (normalizedStatus !== 'created') return false

  const updatedTime = new Date(String(updatedAt || '')).getTime()
  return Number.isFinite(updatedTime) && Date.now() - updatedTime >= 2 * 60 * 1000
}

async function createPaymentOrder(
  options: StartPaymentOptions,
  accountReference: string,
  phone: string,
  provider: 'eversend' | 'paynexus',
) {
  const { data, error } = await options.supabase
    .from('faculty_assistant_payment_orders')
    .insert({
      request_id: options.requestId,
      account_reference: accountReference,
      amount_kes: options.amountKes,
      currency: 'KES',
      phone,
      status: 'created',
      provider,
    })
    .select('*')
    .single()
  if (error || !data) {
    throw new Error(`payment_order_create_failed:${error?.message || 'no_order'}`)
  }
  return data
}

async function resetPaymentOrder(
  options: StartPaymentOptions,
  orderId: unknown,
  phone: string,
  provider: 'eversend' | 'paynexus',
  accountReference: string,
) {
  const { data, error } = await options.supabase
    .from('faculty_assistant_payment_orders')
    .update({
      amount_kes: options.amountKes,
      phone,
      status: 'created',
      stk_reference: null,
      stk_checkout_request_id: null,
      checkout_session_id: null,
      checkout_url: null,
      last_provider_status: 'retrying',
      failure_reason: '',
      provider,
      account_reference: accountReference,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*')
    .single()
  if (error || !data) {
    throw new Error(`payment_order_retry_failed:${error?.message || 'no_order'}`)
  }
  return data
}

function paymentSummary(order: Record<string, unknown>): FacultyAssistantPaymentSummary {
  const status = String(order.status || 'created')
  const initiated = Boolean(order.stk_reference) || status === 'pending'
  return {
    orderId: String(order.id || ''),
    accountReference: String(order.account_reference || ''),
    amountKes: Number(order.amount_kes || 0),
    status,
    stkStatus: initiated ? 'initiated' : order.failure_reason
      ? 'failed'
      : 'not_configured',
    checkoutUrl: String(order.checkout_url || ''),
    checkoutSessionId: String(order.checkout_session_id || ''),
    error: String(order.failure_reason || ''),
    provider: String(order.provider || 'paynexus') === 'eversend' ? 'eversend' : 'paynexus',
  }
}

export function facultyAssistantPaymentProvider(): 'eversend' | 'paynexus' | null {
  const requested = process.env.FACULTY_ASSISTANT_PAYMENT_PROVIDER?.trim().toLowerCase()
  if (requested === 'eversend') return eversendConfigured() ? 'eversend' : null
  if (requested === 'paynexus') return payNexusConfigured() ? 'paynexus' : null
  if (eversendConfigured()) return 'eversend'
  if (payNexusConfigured()) return 'paynexus'
  return null
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

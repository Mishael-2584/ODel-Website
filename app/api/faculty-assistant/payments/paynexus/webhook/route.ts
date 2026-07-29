import { NextRequest, NextResponse } from 'next/server'
import { sendFacultyAssistantActivationEmail } from '@/lib/server/faculty-assistant-invoice'
import { verifyPayNexusWebhook } from '@/lib/server/paynexus'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type PayNexusWebhook = {
  event?: string
  timestamp?: string
  data?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  if (rawBody.length > 65_536) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 })
  }
  const signature = request.headers.get('x-paynexus-signature') || ''
  if (!verifyPayNexusWebhook(rawBody, signature)) {
    return NextResponse.json({ error: 'invalid_webhook_signature' }, { status: 401 })
  }

  const payload = parseWebhook(rawBody)
  if (!payload) {
    return NextResponse.json({ error: 'invalid_webhook_payload' }, { status: 400 })
  }
  const event = String(payload.event || '')
  const data = payload.data || {}
  if (!['payment.completed', 'payment.failed', 'payment.initiated'].includes(event)) {
    return NextResponse.json({ received: true, ignored: true })
  }

  const providerReference = safeProviderValue(data.reference)
  const accountReference = safeProviderValue(data.account_reference)
  const checkoutRequestId = safeProviderValue(data.checkout_request_id)
  const supabase = getSupabaseAdmin()
  const filters = [
    providerReference && `stk_reference.eq.${providerReference}`,
    providerReference && `completed_reference.eq.${providerReference}`,
    accountReference && `account_reference.eq.${accountReference}`,
    checkoutRequestId && `stk_checkout_request_id.eq.${checkoutRequestId}`,
  ].filter(Boolean)
  if (!filters.length) {
    return NextResponse.json({ received: true, matched: false })
  }

  const { data: order, error: lookupError } = await supabase
    .from('faculty_assistant_payment_orders')
    .select('*')
    .or(filters.join(','))
    .maybeSingle()
  if (lookupError) {
    console.error('PayNexus payment order lookup failed:', lookupError)
    return NextResponse.json({ error: 'payment_lookup_failed' }, { status: 500 })
  }
  if (!order) return NextResponse.json({ received: true, matched: false })

  if (event !== 'payment.completed') {
    const providerStatus = event === 'payment.failed' ? 'failed' : 'initiated'
    const keepPending = event === 'payment.failed' && Boolean(order.checkout_url)
    const { error } = await supabase
      .from('faculty_assistant_payment_orders')
      .update({
        status: keepPending ? 'pending' : providerStatus,
        last_provider_status: providerStatus,
        failure_reason: event === 'payment.failed'
          ? String(data.failure_reason || data.user_message || 'Payment failed').slice(0, 1000)
          : '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
    if (error) {
      console.error('PayNexus payment status update failed:', error)
      return NextResponse.json({ error: 'payment_update_failed' }, { status: 500 })
    }
    return NextResponse.json({ received: true, status: keepPending ? 'pending' : providerStatus })
  }

  const amount = Number(data.amount)
  const currency = String(data.currency || '')
  if (!Number.isFinite(amount) || amount <= 0 || currency.toUpperCase() !== 'KES') {
    await markActivationFailure(order.id, 'Invalid payment amount or currency')
    return NextResponse.json({ received: true, rejected: 'amount_or_currency_invalid' })
  }

  const { data: activation, error: activationError } = await supabase.rpc(
    'faculty_assistant_complete_paynexus_payment',
    {
      p_order_id: order.id,
      p_provider_reference: providerReference || accountReference,
      p_amount: amount,
      p_currency: currency,
      p_transaction_id: safeProviderValue(data.transaction_id),
      p_provider_transaction_id: safeProviderValue(data.provider_transaction_id),
      p_phone: safePhone(data.phone),
    },
  )
  if (activationError || !activation) {
    const failure = activationError?.message || 'No activation result returned'
    console.error('PayNexus automatic activation failed:', failure)
    await markActivationFailure(order.id, failure)
    return NextResponse.json({ error: 'automatic_activation_failed' }, { status: 500 })
  }

  const result = activation as Record<string, unknown>
  if (result.activated === true) {
    try {
      await sendFacultyAssistantActivationEmail({
        requestId: String(result.requestId || order.request_id),
        email: String(result.email || ''),
        displayName: String(result.displayName || ''),
        billingPeriod: String(result.billingPeriod || ''),
        expiresAt: String(result.expiresAt || ''),
        paymentReference: providerReference || accountReference,
      })
      await supabase
        .from('faculty_assistant_payment_orders')
        .update({
          activation_email_status: 'sent',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
    } catch (emailError) {
      console.error('Faculty Assistant activation email failed:', emailError)
      await supabase
        .from('faculty_assistant_payment_orders')
        .update({
          activation_email_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
    }
  }

  return NextResponse.json({
    received: true,
    activated: result.activated === true,
    alreadyProcessed: result.alreadyProcessed === true,
  })

  async function markActivationFailure(orderId: string, failure: string) {
    const { error } = await supabase
      .from('faculty_assistant_payment_orders')
      .update({
        status: 'activation_failed',
        last_provider_status: 'completed',
        failure_reason: failure.slice(0, 1000),
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
    if (error) console.error('PayNexus activation failure persistence failed:', error)
  }
}

function parseWebhook(rawBody: string): PayNexusWebhook | null {
  try {
    const value = JSON.parse(rawBody)
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as PayNexusWebhook
      : null
  } catch {
    return null
  }
}

function safeProviderValue(value: unknown) {
  const normalized = String(value || '').trim().slice(0, 120)
  return /^[A-Za-z0-9_.:/-]{3,120}$/.test(normalized) ? normalized : ''
}

function safePhone(value: unknown) {
  const normalized = String(value || '').replace(/\D/g, '').slice(0, 20)
  return normalized.length >= 10 ? normalized : ''
}

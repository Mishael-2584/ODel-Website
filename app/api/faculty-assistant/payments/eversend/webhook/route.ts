import { NextRequest, NextResponse } from 'next/server'
import { sendFacultyAssistantActivationEmail } from '@/lib/server/faculty-assistant-invoice'
import { getEversendTransaction, verifyEversendWebhook } from '@/lib/server/eversend'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  if (rawBody.length > 65_536) return NextResponse.json({ error: 'payload_too_large' }, { status: 413 })
  const signature = request.headers.get('x-eversend-signature') || ''
  if (!verifyEversendWebhook(rawBody, signature)) {
    return NextResponse.json({ error: 'invalid_webhook_signature' }, { status: 401 })
  }
  const payload = parsePayload(rawBody)
  if (!payload) return NextResponse.json({ error: 'invalid_webhook_payload' }, { status: 400 })
  const nested = objectValue(payload.data)
  const data = Object.keys(nested).length ? nested : payload
  const eventType = String(data.eventType || payload.eventType || '')
  const type = String(data.type || '').toLowerCase()
  const isCollection = type === 'collection' || eventType.toLowerCase().includes('collection')
  if (!isCollection) {
    return NextResponse.json({ received: true, ignored: true })
  }

  const successful = eventType === 'transaction.eversendCollectionSuccessful'
    || (eventType === 'transaction.addMoneySuccess' && type === 'collection')
    || String(data.status || '').toLowerCase() === 'successful'
  const failed = eventType === 'transaction.eversendCollectionDeclined'
    || ['failed', 'declined'].includes(String(data.status || '').toLowerCase())
  if (!successful && !failed) return NextResponse.json({ received: true, ignored: true })

  const references = await resolvedReferences(data)
  const supabase = getSupabaseAdmin()
  const { orders, error: lookupError } = references.length
    ? await ordersByReference(supabase, references)
    : { orders: [], error: null }
  if (lookupError) {
    console.error('Eversend payment order lookup failed:', lookupError)
    return NextResponse.json({ error: 'payment_lookup_failed' }, { status: 500 })
  }
  if (!orders?.length) return NextResponse.json({ received: true, matched: false })
  if (orders.length !== 1) {
    console.error('Eversend webhook matched more than one payment order', references)
    return NextResponse.json({ error: 'ambiguous_payment_reference' }, { status: 409 })
  }
  const order = orders[0]

  if (failed) {
    const { error } = await supabase.from('faculty_assistant_payment_orders').update({
      status: 'failed',
      last_provider_status: String(data.status || eventType).slice(0, 120),
      failure_reason: String(data.reason || data.message || 'Payment was declined').slice(0, 1000),
      updated_at: new Date().toISOString(),
    }).eq('id', order.id)
    if (error) return NextResponse.json({ error: 'payment_update_failed' }, { status: 500 })
    return NextResponse.json({ received: true, status: 'failed' })
  }

  const amount = Number(data.amount)
  const currency = String(data.currency || '').toUpperCase()
  if (!Number.isFinite(amount) || amount <= 0 || currency !== 'KES') {
    await markActivationFailure(order.id, 'Invalid Eversend payment amount or currency')
    return NextResponse.json({ received: true, rejected: 'amount_or_currency_invalid' })
  }
  const providerReference = references.find((reference) => reference !== order.account_reference) || references[0]
  const { data: activation, error: activationError } = await supabase.rpc(
    'faculty_assistant_complete_payment',
    {
      p_order_id: order.id,
      p_provider: 'eversend',
      p_provider_reference: providerReference,
      p_amount: amount,
      p_currency: currency,
      p_transaction_id: safeReference(data.transactionId || data.transaction_id),
      p_provider_transaction_id: safeReference(data.reference),
      p_phone: safePhone(data.phoneNumber || data.PhoneNumber || data.phone),
    },
  )
  if (activationError || !activation) {
    const failure = activationError?.message || 'No activation result returned'
    console.error('Eversend automatic activation failed:', failure)
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
        paymentReference: providerReference,
        paymentProvider: 'eversend',
      })
      await supabase.from('faculty_assistant_payment_orders').update({
        activation_email_status: 'sent', updated_at: new Date().toISOString(),
      }).eq('id', order.id)
    } catch (error) {
      console.error('Faculty Assistant Eversend activation email failed:', error)
      await supabase.from('faculty_assistant_payment_orders').update({
        activation_email_status: 'failed', updated_at: new Date().toISOString(),
      }).eq('id', order.id)
    }
  }
  return NextResponse.json({
    received: true,
    activated: result.activated === true,
    alreadyProcessed: result.alreadyProcessed === true,
  })

  async function markActivationFailure(orderId: string, failure: string) {
    const { error } = await supabase.from('faculty_assistant_payment_orders').update({
      status: 'activation_failed',
      last_provider_status: 'successful',
      failure_reason: failure.slice(0, 1000),
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', orderId)
    if (error) console.error('Eversend activation failure persistence failed:', error)
  }
}

async function ordersByReference(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  references: string[],
) {
  const filters = references.flatMap((reference) => [
    `account_reference.eq.${reference}`,
    `stk_reference.eq.${reference}`,
    `completed_reference.eq.${reference}`,
    `transaction_id.eq.${reference}`,
    `provider_transaction_id.eq.${reference}`,
  ])
  const { data, error } = await supabase
    .from('faculty_assistant_payment_orders')
    .select('*')
    .eq('provider', 'eversend')
    .or(filters.join(','))
    .limit(2)
  return { orders: data || [], error }
}

function parsePayload(rawBody: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(rawBody)
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null
  } catch {
    return null
  }
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function uniqueReferences(data: Record<string, unknown>) {
  return Array.from(new Set([
    data.transactionRef, data.transaction_ref, data.reference,
    data.transactionId, data.transaction_id, data.transactionReference,
  ].map(safeReference).filter(Boolean)))
}

async function resolvedReferences(data: Record<string, unknown>) {
  const references = uniqueReferences(data)
  for (const reference of [...references]) {
    try {
      const transaction = await getEversendTransaction(reference)
      if (transaction.transactionRef) references.push(transaction.transactionRef)
      if (transaction.transactionId) references.push(transaction.transactionId)
    } catch {
      // A webhook reference may already be the client reference; direct matching still applies.
    }
  }
  return Array.from(new Set(references))
}

function safeReference(value: unknown) {
  const reference = String(value || '').trim().slice(0, 120)
  return /^[A-Za-z0-9_.:/-]{3,120}$/.test(reference) ? reference : ''
}

function safePhone(value: unknown) {
  const phone = String(value || '').replace(/\D/g, '').slice(0, 20)
  return phone.length >= 10 ? phone : ''
}

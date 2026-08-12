import { NextRequest, NextResponse } from 'next/server'
import { facultyAssistantMoodleInstance } from '@/lib/server/faculty-assistant-auth'
import { sendFacultyAssistantActivationEmail } from '@/lib/server/faculty-assistant-invoice'
import { EversendApiError, getEversendTransaction } from '@/lib/server/eversend'
import { requireOdelSession } from '@/lib/server/odel-session'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await requireOdelSession(request)
  if (!session) return NextResponse.json({ error: 'sign_in_required' }, { status: 401 })

  const requestId = new URL(request.url).searchParams.get('requestId') || ''
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(requestId)) {
    return NextResponse.json({ error: 'invalid_request_id' }, { status: 400 })
  }
  const supabase = getSupabaseAdmin()
  const { data: upgradeRequestData, error: requestError } = await supabase
    .from('faculty_assistant_upgrade_requests')
    .select('id, email, display_name, status, requested_plan, billing_period, activated_at')
    .eq('id', requestId)
    .eq('moodle_instance', facultyAssistantMoodleInstance())
    .eq('moodle_user_id', session.moodleUserId)
    .maybeSingle()
  if (requestError) return NextResponse.json({ error: 'request_lookup_failed' }, { status: 500 })
  if (!upgradeRequestData) return NextResponse.json({ error: 'request_not_found' }, { status: 404 })
  let upgradeRequest = upgradeRequestData as unknown as Record<string, unknown>

  const { data: orderData, error: paymentError } = await supabase
    .from('faculty_assistant_payment_orders')
    .select(
      'id, provider, account_reference, amount_kes, currency, status, checkout_url, '
      + 'stk_reference, last_provider_status, failure_reason, '
      + 'transaction_id, provider_transaction_id, activation_email_status, '
      + 'paid_at, activated_at, updated_at, otp_expires_at',
    )
    .eq('request_id', requestId)
    .maybeSingle()
  if (paymentError) return NextResponse.json({ error: 'payment_lookup_failed' }, { status: 500 })
  let order = orderData as unknown as Record<string, unknown> | null

  if (
    order?.provider === 'eversend'
    && ['pending', 'failed', 'activation_failed'].includes(String(order.status || ''))
  ) {
    const reconciled = await reconcileEversendPayment(supabase, order, upgradeRequest)
    if (reconciled.error) {
      return NextResponse.json({ error: reconciled.error }, { status: reconciled.status })
    }
    if (reconciled.changed) {
      const [{ data: refreshedRequest }, { data: refreshedOrder }] = await Promise.all([
        supabase.from('faculty_assistant_upgrade_requests')
          .select('id, email, display_name, status, requested_plan, billing_period, activated_at')
          .eq('id', requestId).single(),
        supabase.from('faculty_assistant_payment_orders')
          .select(
            'id, provider, account_reference, amount_kes, currency, status, checkout_url, '
            + 'stk_reference, last_provider_status, failure_reason, transaction_id, '
            + 'provider_transaction_id, activation_email_status, paid_at, activated_at, '
            + 'updated_at, otp_expires_at',
          )
          .eq('request_id', requestId).single(),
      ])
      if (refreshedRequest) upgradeRequest = refreshedRequest as unknown as Record<string, unknown>
      if (refreshedOrder) order = refreshedOrder as unknown as Record<string, unknown>
    }
  }
  const payment = order as unknown as Record<string, unknown> | null

  return NextResponse.json({
    request: upgradeRequest,
    payment: payment ? {
      orderId: payment.id,
      provider: payment.provider,
      accountReference: payment.account_reference,
      amountKes: payment.amount_kes,
      currency: payment.currency,
      status: payment.status,
      checkoutUrl: payment.checkout_url,
      stkStatus: payment.stk_reference || payment.status === 'pending' ? 'initiated' : 'not_initiated',
      providerStatus: payment.last_provider_status,
      failureReason: payment.failure_reason,
      activationEmailStatus: payment.activation_email_status,
      paidAt: payment.paid_at,
      activatedAt: payment.activated_at,
      updatedAt: payment.updated_at,
      otpRequired: payment.last_provider_status === 'otp_required',
      otpExpiresAt: payment.otp_expires_at,
    } : null,
  })
}

async function reconcileEversendPayment(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  order: Record<string, unknown>,
  upgradeRequest: Record<string, unknown>,
) {
  let transaction
  try {
    transaction = await getEversendTransaction(String(order.account_reference || ''))
  } catch (error) {
    if (error instanceof EversendApiError && error.status === 404) return { changed: false }
    console.error('Eversend payment status reconciliation failed:', error)
    return { changed: false }
  }

  if (
    transaction.transactionRef !== order.account_reference
    || transaction.type !== 'collection'
    || transaction.currency !== 'KES'
    || transaction.amount !== Number(order.amount_kes)
  ) {
    console.error('Eversend transaction did not match payment order', order.id)
    return { changed: false, error: 'provider_transaction_mismatch', status: 409 }
  }

  if (['failed', 'declined', 'cancelled', 'canceled', 'rejected'].includes(transaction.status)) {
    const { error } = await supabase.from('faculty_assistant_payment_orders').update({
      status: 'failed',
      transaction_id: transaction.transactionId || null,
      provider_transaction_id: transaction.transactionId || null,
      last_provider_status: transaction.status,
      failure_reason: 'Eversend confirmed that the M-Pesa collection was not completed.',
      updated_at: new Date().toISOString(),
    }).eq('id', order.id)
    if (error) return { changed: false, error: 'payment_update_failed', status: 500 }
    return { changed: true }
  }
  if (transaction.status !== 'successful') return { changed: false }

  const { data: activation, error: activationError } = await supabase.rpc(
    'faculty_assistant_complete_payment',
    {
      p_order_id: order.id,
      p_provider: 'eversend',
      p_provider_reference: transaction.transactionId || transaction.transactionRef,
      p_amount: transaction.amount,
      p_currency: transaction.currency,
      p_transaction_id: transaction.transactionId,
      p_provider_transaction_id: transaction.transactionId,
      p_phone: transaction.phone,
    },
  )
  if (activationError || !activation) {
    console.error('Eversend reconciled payment activation failed:', activationError)
    return { changed: false, error: 'automatic_activation_failed', status: 500 }
  }

  const result = activation as Record<string, unknown>
  if (result.activated === true) {
    try {
      await sendFacultyAssistantActivationEmail({
        requestId: String(result.requestId || order.request_id),
        email: String(result.email || upgradeRequest.email || ''),
        displayName: String(result.displayName || upgradeRequest.display_name || ''),
        billingPeriod: String(result.billingPeriod || upgradeRequest.billing_period || ''),
        expiresAt: String(result.expiresAt || ''),
        paymentReference: transaction.transactionId || transaction.transactionRef,
        paymentProvider: 'eversend',
      })
      await supabase.from('faculty_assistant_payment_orders').update({
        activation_email_status: 'sent', updated_at: new Date().toISOString(),
      }).eq('id', order.id)
    } catch (error) {
      console.error('Faculty Assistant reconciled activation email failed:', error)
      await supabase.from('faculty_assistant_payment_orders').update({
        activation_email_status: 'failed', updated_at: new Date().toISOString(),
      }).eq('id', order.id)
    }
  }
  return { changed: true }
}

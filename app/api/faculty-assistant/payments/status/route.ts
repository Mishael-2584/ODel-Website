import { NextRequest, NextResponse } from 'next/server'
import { facultyAssistantMoodleInstance } from '@/lib/server/faculty-assistant-auth'
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
  const { data: upgradeRequest, error: requestError } = await supabase
    .from('faculty_assistant_upgrade_requests')
    .select('id, status, requested_plan, billing_period, activated_at')
    .eq('id', requestId)
    .eq('moodle_instance', facultyAssistantMoodleInstance())
    .eq('moodle_user_id', session.moodleUserId)
    .maybeSingle()
  if (requestError) return NextResponse.json({ error: 'request_lookup_failed' }, { status: 500 })
  if (!upgradeRequest) return NextResponse.json({ error: 'request_not_found' }, { status: 404 })

  const { data: order, error: paymentError } = await supabase
    .from('faculty_assistant_payment_orders')
    .select(
      'id, account_reference, amount_kes, currency, status, checkout_url, '
      + 'stk_reference, last_provider_status, failure_reason, '
      + 'activation_email_status, paid_at, activated_at, updated_at',
    )
    .eq('request_id', requestId)
    .maybeSingle()
  if (paymentError) return NextResponse.json({ error: 'payment_lookup_failed' }, { status: 500 })
  const payment = order as unknown as Record<string, unknown> | null

  return NextResponse.json({
    request: upgradeRequest,
    payment: payment ? {
      orderId: payment.id,
      accountReference: payment.account_reference,
      amountKes: payment.amount_kes,
      currency: payment.currency,
      status: payment.status,
      checkoutUrl: payment.checkout_url,
      stkStatus: payment.stk_reference ? 'initiated' : 'not_initiated',
      providerStatus: payment.last_provider_status,
      failureReason: payment.failure_reason,
      activationEmailStatus: payment.activation_email_status,
      paidAt: payment.paid_at,
      activatedAt: payment.activated_at,
      updatedAt: payment.updated_at,
    } : null,
  })
}

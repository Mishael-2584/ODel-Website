import { NextRequest, NextResponse } from 'next/server'
import {
  facultyAssistantMoodleInstance,
  facultyAssistantPublicOrigin,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import { requireOdelSession } from '@/lib/server/odel-session'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'
import {
  EversendApiError,
  initiateEversendCollection,
  requestEversendCollectionOtp,
} from '@/lib/server/eversend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const otpLifetimeMs = 10 * 60 * 1000
const resendDelayMs = 60 * 1000

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && origin !== facultyAssistantPublicOrigin()) {
    return NextResponse.json({ error: 'invalid_origin' }, { status: 403 })
  }
  const session = await requireOdelSession(request)
  if (!session) return NextResponse.json({ error: 'sign_in_required' }, { status: 401 })
  const authenticatedSession = session

  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const requestId = String(body?.requestId || '')
  const action = String(body?.action || 'verify')
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(requestId)) {
    return NextResponse.json({ error: 'invalid_request_id' }, { status: 400 })
  }
  if (!['verify', 'resend'].includes(action)) {
    return NextResponse.json({ error: 'invalid_verification_action' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: upgradeRequest, error: requestError } = await supabase
    .from('faculty_assistant_upgrade_requests')
    .select('id, email, status')
    .eq('id', requestId)
    .eq('moodle_instance', facultyAssistantMoodleInstance())
    .eq('moodle_user_id', session.moodleUserId)
    .maybeSingle()
  if (requestError) return NextResponse.json({ error: 'request_lookup_failed' }, { status: 500 })
  if (!upgradeRequest) return NextResponse.json({ error: 'request_not_found' }, { status: 404 })
  const ownedUpgradeRequest = upgradeRequest
  if (!['pending', 'contacted', 'paid'].includes(String(upgradeRequest.status || ''))) {
    return NextResponse.json({ error: 'verification_not_allowed' }, { status: 409 })
  }

  const { data: order, error: orderError } = await supabase
    .from('faculty_assistant_payment_orders')
    .select('*')
    .eq('request_id', requestId)
    .eq('provider', 'eversend')
    .maybeSingle()
  if (orderError) return NextResponse.json({ error: 'payment_lookup_failed' }, { status: 500 })
  if (!order) return NextResponse.json({ error: 'payment_not_found' }, { status: 404 })
  if (order.status === 'completed') return NextResponse.json({ payment: publicPayment(order) })
  if (String(order.last_provider_status || '') !== 'otp_required') {
    return NextResponse.json({ error: 'verification_not_required' }, { status: 409 })
  }

  if (action === 'resend') return resendOtp(order)
  return verifyOtp(order)

  async function resendOtp(paymentOrder: Record<string, unknown>) {
    const sendCount = Number(paymentOrder.otp_send_count || 0)
    const requestedAt = new Date(String(paymentOrder.otp_requested_at || '')).getTime()
    if (sendCount >= 3) {
      return NextResponse.json({ error: 'verification_resend_limit_reached' }, { status: 429 })
    }
    if (Number.isFinite(requestedAt) && Date.now() - requestedAt < resendDelayMs) {
      return NextResponse.json({ error: 'verification_resend_too_soon' }, { status: 429 })
    }

    const reservedAt = new Date().toISOString()
    const { data: reserved, error: reserveError } = await supabase
      .from('faculty_assistant_payment_orders')
      .update({
        otp_send_count: sendCount + 1,
        otp_requested_at: reservedAt,
        last_provider_status: 'otp_resending',
        updated_at: reservedAt,
      })
      .eq('id', paymentOrder.id)
      .eq('otp_send_count', sendCount)
      .eq('last_provider_status', 'otp_required')
      .select('*')
      .maybeSingle()
    if (reserveError) return NextResponse.json({ error: 'verification_resend_failed' }, { status: 500 })
    if (!reserved) return NextResponse.json({ error: 'verification_request_conflict' }, { status: 409 })

    try {
      const otp = await requestEversendCollectionOtp(String(paymentOrder.phone || ''))
      const otpExpiresAt = new Date(Date.now() + otpLifetimeMs).toISOString()
      const { data: updated, error: updateError } = await supabase
        .from('faculty_assistant_payment_orders')
        .update({
          otp_pin_id: otp.pinId,
          otp_expires_at: otpExpiresAt,
          otp_attempt_count: 0,
          last_provider_status: 'otp_required',
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentOrder.id)
        .select('*')
        .single()
      if (updateError || !updated) {
        await restoreOtpState(paymentOrder.id)
        return NextResponse.json({ error: 'verification_resend_persist_failed' }, { status: 500 })
      }
      await audit('licence.payment.otp.resent', 'success', paymentOrder.id, { sendCount: sendCount + 1 })
      return NextResponse.json({ payment: publicPayment(updated), resent: true })
    } catch (error) {
      await restoreOtpState(paymentOrder.id)
      await audit('licence.payment.otp.resent', 'failed', paymentOrder.id, { error: safeError(error) })
      return NextResponse.json({ error: 'verification_resend_failed' }, { status: 502 })
    }
  }

  async function verifyOtp(paymentOrder: Record<string, unknown>) {
    const pin = String(body?.pin || '').trim()
    if (!/^\d{4,8}$/.test(pin)) {
      return NextResponse.json({ error: 'invalid_verification_code' }, { status: 400 })
    }
    const pinId = String(paymentOrder.otp_pin_id || '')
    const expiresAt = new Date(String(paymentOrder.otp_expires_at || '')).getTime()
    const attemptCount = Number(paymentOrder.otp_attempt_count || 0)
    if (!pinId || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return NextResponse.json({ error: 'verification_code_expired' }, { status: 410 })
    }
    if (attemptCount >= 5) {
      return NextResponse.json({ error: 'verification_attempt_limit_reached' }, { status: 429 })
    }

    const { data: reserved, error: reserveError } = await supabase
      .from('faculty_assistant_payment_orders')
      .update({
        otp_attempt_count: attemptCount + 1,
        last_provider_status: 'otp_verifying',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentOrder.id)
      .eq('otp_attempt_count', attemptCount)
      .eq('last_provider_status', 'otp_required')
      .select('*')
      .maybeSingle()
    if (reserveError) return NextResponse.json({ error: 'verification_failed' }, { status: 500 })
    if (!reserved) return NextResponse.json({ error: 'verification_request_conflict' }, { status: 409 })

    try {
      const collection = await initiateEversendCollection({
        amount: Number(paymentOrder.amount_kes),
        phone: String(paymentOrder.phone || ''),
        email: String(ownedUpgradeRequest.email || authenticatedSession.email),
        transactionRef: String(paymentOrder.account_reference || ''),
        otp: { pinId, pin },
      })
      const providerStatus = collection.status.toLowerCase()
      const rejected = ['failed', 'declined', 'rejected', 'error'].some((value) =>
        providerStatus.includes(value),
      )
      const { data: updated, error: updateError } = await supabase
        .from('faculty_assistant_payment_orders')
        .update({
          status: rejected ? 'failed' : 'pending',
          stk_reference: collection.reference || null,
          last_provider_status: collection.status,
          failure_reason: rejected ? `Eversend collection ${collection.status}`.slice(0, 1000) : '',
          otp_pin_id: null,
          otp_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentOrder.id)
        .select('*')
        .single()
      if (updateError || !updated) {
        return NextResponse.json({ error: 'payment_order_update_failed' }, { status: 500 })
      }
      await audit('licence.payment.otp.verified', 'success', paymentOrder.id, {
        providerStatus: collection.status,
      })
      return NextResponse.json({ payment: publicPayment(updated), verified: true })
    } catch (error) {
      if (collectionOutcomeUnknown(error)) {
        const updated = await persistCollectionState(paymentOrder.id, {
          status: 'pending',
          last_provider_status: 'provider_confirmation_pending',
          failure_reason: '',
          otp_pin_id: null,
          otp_expires_at: null,
        })
        await audit('licence.payment.collection.processing', 'success', paymentOrder.id, {
          providerMessage: providerErrorMessage(error),
        })
        return NextResponse.json({ payment: publicPayment(updated), processing: true }, { status: 202 })
      }
      if (collectionDeclined(error)) {
        const updated = await persistCollectionState(paymentOrder.id, {
          status: 'failed',
          last_provider_status: 'declined',
          failure_reason: providerErrorMessage(error).slice(0, 1000),
          otp_pin_id: null,
          otp_expires_at: null,
        })
        await audit('licence.payment.collection.declined', 'failed', paymentOrder.id, {
          providerMessage: providerErrorMessage(error),
        })
        return NextResponse.json({ payment: publicPayment(updated), collectionFailed: true })
      }
      await restoreOtpState(paymentOrder.id)
      const invalidCode = invalidOtpCode(error)
      await audit('licence.payment.otp.verified', 'failed', paymentOrder.id, {
        error: safeError(error), attempt: attemptCount + 1,
      })
      return NextResponse.json(
        { error: invalidCode ? 'invalid_verification_code' : 'verification_provider_failed' },
        { status: invalidCode ? 400 : 502 },
      )
    }
  }

  async function persistCollectionState(orderId: unknown, values: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('faculty_assistant_payment_orders')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*')
      .single()
    if (error || !data) throw new Error(`payment_order_update_failed:${error?.message || 'no_order'}`)
    return data as Record<string, unknown>
  }

  async function restoreOtpState(orderId: unknown) {
    const { error } = await supabase
      .from('faculty_assistant_payment_orders')
      .update({ last_provider_status: 'otp_required', updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .in('last_provider_status', ['otp_resending', 'otp_verifying'])
    if (error) console.error('Eversend OTP state restoration failed:', error)
  }

  async function audit(eventType: string, outcome: 'success' | 'failed', orderId: unknown, details: Record<string, unknown>) {
    await writeFacultyAssistantAudit(eventType, outcome, {
      moodleUserId: authenticatedSession.moodleUserId,
      moodleInstance: facultyAssistantMoodleInstance(),
      resourceType: 'payment_order',
      resourceId: String(orderId || ''),
      details,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    })
  }
}

function publicPayment(order: Record<string, unknown>) {
  const status = String(order.status || 'created')
  return {
    orderId: String(order.id || ''),
    provider: 'eversend' as const,
    accountReference: String(order.account_reference || ''),
    amountKes: Number(order.amount_kes || 0),
    status,
    stkStatus: order.stk_reference || status === 'pending' ? 'initiated' : 'not_configured',
    checkoutUrl: '',
    otpRequired: String(order.last_provider_status || '') === 'otp_required',
    otpExpiresAt: String(order.otp_expires_at || ''),
  }
}

function safeError(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 300) : 'unknown_provider_error'
}

function providerErrorMessage(error: unknown) {
  return error instanceof EversendApiError
    ? error.providerMessage
    : error instanceof Error ? error.message : 'unknown_provider_error'
}

function invalidOtpCode(error: unknown) {
  const message = providerErrorMessage(error)
  return /(invalid|incorrect|wrong|expired).*(otp|pin|code)|(otp|pin|code).*(invalid|incorrect|wrong|expired)/i.test(message)
}

function collectionOutcomeUnknown(error: unknown) {
  const message = providerErrorMessage(error)
  return /timed?\s*out|timeout|aborted|already verified|transaction already exists/i.test(message)
}

function collectionDeclined(error: unknown) {
  const message = providerErrorMessage(error)
  return /insufficient|declined|rejected|cancelled|canceled|not enough funds/i.test(message)
}

import { NextRequest, NextResponse } from 'next/server'
import {
  facultyAssistantMoodleInstance,
  facultyAssistantPublicOrigin,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import { requireOdelSession } from '@/lib/server/odel-session'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'
import { sendFacultyAssistantInvoice } from '@/lib/server/faculty-assistant-invoice'
import { persistInvoiceDeliveryStatus } from '@/lib/server/faculty-assistant-invoice-status'
import {
  isFacultyAssistantBillingPeriod,
  type FacultyAssistantBillingPeriod,
  type FacultyAssistantPaidPlan,
} from '@/lib/faculty-assistant/plans'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && origin !== facultyAssistantPublicOrigin()) {
    return NextResponse.json({ error: 'invalid_origin' }, { status: 403 })
  }
  const session = await requireOdelSession(request)
  if (!session) return NextResponse.json({ error: 'sign_in_required' }, { status: 401 })

  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const requestedPlan = String(body?.requestedPlan || '')
  const phone = String(body?.phone || '').trim().slice(0, 40)
  const notes = String(body?.notes || '').trim().slice(0, 1000)
  const source = String(body?.source || 'web').trim().slice(0, 40)
  if (!['professional', 'institution'].includes(requestedPlan)) {
    return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
  }
  const paidPlan = requestedPlan as FacultyAssistantPaidPlan
  const requestedBillingPeriod = String(body?.billingPeriod || 'annual')
  if (!isFacultyAssistantBillingPeriod(paidPlan, requestedBillingPeriod)) {
    return NextResponse.json({ error: 'invalid_billing_period' }, { status: 400 })
  }
  const billingPeriod = requestedBillingPeriod as FacultyAssistantBillingPeriod

  const moodleInstance = facultyAssistantMoodleInstance()
  const supabase = getSupabaseAdmin()
  const { data: existing } = await supabase
    .from('faculty_assistant_upgrade_requests')
    .select('id, status')
    .eq('moodle_instance', moodleInstance)
    .eq('moodle_user_id', session.moodleUserId)
    .eq('requested_plan', requestedPlan)
    .in('status', ['pending', 'contacted', 'paid'])
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ requestId: existing.id, status: existing.status, existing: true })
  }

  const { data, error } = await supabase
    .from('faculty_assistant_upgrade_requests')
    .insert({
      moodle_instance: moodleInstance,
      moodle_user_id: session.moodleUserId,
      email: session.email,
      display_name: session.studentName,
      requested_plan: requestedPlan,
      phone,
      notes,
      source,
      billing_period: billingPeriod,
    })
    .select('id, status')
    .single()
  if (error || !data) {
    console.error('Faculty Assistant upgrade request failed:', error)
    return NextResponse.json({ error: 'request_failed' }, { status: 500 })
  }

  await writeFacultyAssistantAudit('licence.upgrade.request', 'success', {
    moodleUserId: session.moodleUserId,
    moodleInstance,
    resourceType: 'upgrade_request',
    resourceId: String(data.id),
    details: { requestedPlan, billingPeriod, source },
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
  })
  let invoiceStatus: 'sent' | 'failed' = 'sent'
  let invoicePersistence: 'persisted' | 'failed' = 'persisted'
  try {
    const delivery = await sendFacultyAssistantInvoice({
      requestId: String(data.id),
      email: session.email,
      displayName: session.studentName,
      requestedPlan: paidPlan,
      billingPeriod,
    })
    const persistence = await persistInvoiceDeliveryStatus(supabase, String(data.id), 'sent')
    if (!persistence.persisted) {
      invoicePersistence = 'failed'
      console.error('Faculty Assistant invoice status update failed:', persistence.error)
      await writeFacultyAssistantAudit('licence.invoice.status.persist', 'failed', {
        moodleUserId: session.moodleUserId,
        moodleInstance,
        resourceType: 'upgrade_request',
        resourceId: String(data.id),
        details: {
          attemptedStatus: 'sent',
          requestedPlan,
          billingPeriod,
          error: persistence.error.slice(0, 500),
        },
      })
    }
    await writeFacultyAssistantAudit('licence.invoice.sent', 'success', {
      moodleUserId: session.moodleUserId,
      moodleInstance,
      resourceType: 'upgrade_request',
      resourceId: String(data.id),
      details: {
        requestedPlan,
        billingPeriod,
        messageId: delivery.messageId,
        invoicePersistence,
      },
    })
  } catch (invoiceError) {
    invoiceStatus = 'failed'
    const failure = invoiceError instanceof Error ? invoiceError.message : 'Unknown email error'
    console.error('Faculty Assistant invoice email failed:', invoiceError)
    const persistence = await persistInvoiceDeliveryStatus(
      supabase,
      String(data.id),
      'failed',
      failure,
    )
    if (!persistence.persisted) {
      invoicePersistence = 'failed'
      console.error('Faculty Assistant failed invoice status update failed:', persistence.error)
      await writeFacultyAssistantAudit('licence.invoice.status.persist', 'failed', {
        moodleUserId: session.moodleUserId,
        moodleInstance,
        resourceType: 'upgrade_request',
        resourceId: String(data.id),
        details: {
          attemptedStatus: 'failed',
          requestedPlan,
          billingPeriod,
          deliveryError: failure.slice(0, 500),
          persistenceError: persistence.error.slice(0, 500),
        },
      })
    }
    await writeFacultyAssistantAudit('licence.invoice.sent', 'failed', {
      moodleUserId: session.moodleUserId,
      moodleInstance,
      resourceType: 'upgrade_request',
      resourceId: String(data.id),
      details: {
        requestedPlan,
        billingPeriod,
        error: failure.slice(0, 500),
        invoicePersistence,
      },
    })
  }
  return NextResponse.json({
    requestId: data.id,
    status: data.status,
    invoiceStatus,
    invoicePersistence,
  }, { status: 201 })
}

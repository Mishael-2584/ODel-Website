import { NextRequest, NextResponse } from 'next/server'
import {
  institutionFeatures,
  licenceExpiry,
  professionalFeatures,
  requireFacultyAssistantAdmin,
} from '@/lib/server/faculty-assistant-admin'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'
import { sendFacultyAssistantInvoice } from '@/lib/server/faculty-assistant-invoice'
import { persistInvoiceDeliveryStatus } from '@/lib/server/faculty-assistant-invoice-status'
import {
  isFacultyAssistantBillingPeriod,
  type FacultyAssistantBillingPeriod,
  type FacultyAssistantPaidPlan,
} from '@/lib/faculty-assistant/plans'

const allowedStatuses = new Set(['contacted', 'paid'])
const invoiceEligibleStatuses = new Set(['pending', 'contacted', 'paid'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } },
) {
  const admin = await requireFacultyAssistantAdmin(request)
  if (!admin) return NextResponse.json({ error: 'admin_unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const action = String(body?.action || '')
  const adminNotes = String(body?.adminNotes || '').trim().slice(0, 1500)
  const paymentReference = String(body?.paymentReference || '').trim().slice(0, 120)
  const supabase = getSupabaseAdmin()
  const { data: upgradeRequest, error: requestError } = await supabase
    .from('faculty_assistant_upgrade_requests')
    .select('*')
    .eq('id', params.requestId)
    .maybeSingle()
  if (requestError) return NextResponse.json({ error: 'request_lookup_failed' }, { status: 500 })
  if (!upgradeRequest) return NextResponse.json({ error: 'request_not_found' }, { status: 404 })

  if (action === 'resend_invoice') {
    if (!invoiceEligibleStatuses.has(String(upgradeRequest.status))) {
      return NextResponse.json(
        { error: 'resend_not_allowed_for_status', status: upgradeRequest.status },
        { status: 409 },
      )
    }
    const invoiceEmail = String(upgradeRequest.email || '').trim()
    if (!isValidEmail(invoiceEmail)) {
      return NextResponse.json({ error: 'invoice_email_invalid' }, { status: 400 })
    }

    try {
      const invoicePlan: FacultyAssistantPaidPlan =
        upgradeRequest.requested_plan === 'institution' ? 'institution' : 'professional'
      const storedBillingPeriod = String(upgradeRequest.billing_period || 'annual')
      const invoiceBillingPeriod: FacultyAssistantBillingPeriod =
        isFacultyAssistantBillingPeriod(invoicePlan, storedBillingPeriod)
          ? storedBillingPeriod
          : 'annual'
      const { data: paymentOrder } = await supabase
        .from('faculty_assistant_payment_orders')
        .select('checkout_url, stk_reference')
        .eq('request_id', upgradeRequest.id)
        .maybeSingle()
      const delivery = await sendFacultyAssistantInvoice({
        requestId: String(upgradeRequest.id),
        email: invoiceEmail,
        displayName: String(upgradeRequest.display_name || ''),
        requestedPlan: invoicePlan,
        billingPeriod: invoiceBillingPeriod,
        paymentUrl: String(paymentOrder?.checkout_url || ''),
        stkInitiated: Boolean(paymentOrder?.stk_reference),
      })
      const persistence = await persistInvoiceDeliveryStatus(
        supabase,
        String(upgradeRequest.id),
        'sent',
      )
      if (!persistence.persisted) {
        await writeFailedAdminAudit(
          supabase,
          admin,
          'licence.invoice.status.persist',
          upgradeRequest,
          persistence.error,
        )
        return NextResponse.json({
          error: 'invoice_status_persist_failed',
          invoiceStatus: 'sent',
          invoicePersistence: 'failed',
        }, { status: 500 })
      }
      const { error: auditError } = await supabase.from('faculty_assistant_audit_log').insert({
        moodle_user_id: upgradeRequest.moodle_user_id,
        moodle_instance: upgradeRequest.moodle_instance,
        action: 'licence.invoice.resent',
        resource_type: 'upgrade_request',
        resource_id: upgradeRequest.id,
        outcome: 'success',
        details: { adminId: admin.id, adminEmail: admin.email, messageId: delivery.messageId },
      })
      if (auditError) console.error('Faculty Assistant invoice resend audit failed:', auditError)
      return NextResponse.json({ status: upgradeRequest.status, invoiceStatus: 'sent' })
    } catch (invoiceError) {
      const failure = invoiceError instanceof Error ? invoiceError.message : 'Unknown email error'
      const persistence = await persistInvoiceDeliveryStatus(
        supabase,
        String(upgradeRequest.id),
        'failed',
        failure,
      )
      if (!persistence.persisted) {
        await writeFailedAdminAudit(
          supabase,
          admin,
          'licence.invoice.status.persist',
          upgradeRequest,
          persistence.error,
        )
      }
      await writeFailedAdminAudit(supabase, admin, 'licence.invoice.resent', upgradeRequest, failure)
      return NextResponse.json({
        error: 'invoice_send_failed',
        invoiceStatus: 'failed',
        invoicePersistence: persistence.persisted ? 'persisted' : 'failed',
      }, { status: 500 })
    }
  }

  if (action === 'activate') {
    const plan: FacultyAssistantPaidPlan =
      upgradeRequest.requested_plan === 'institution' ? 'institution' : 'professional'
    const requestedBillingPeriod = String(
      body?.billingPeriod || upgradeRequest.billing_period || 'annual',
    )
    if (!isFacultyAssistantBillingPeriod(plan, requestedBillingPeriod)) {
      return NextResponse.json({ error: 'invalid_billing_period' }, { status: 400 })
    }
    const billingPeriod = requestedBillingPeriod as FacultyAssistantBillingPeriod
    const features = plan === 'institution' ? institutionFeatures : professionalFeatures
    const expiresAt = licenceExpiry(billingPeriod)
    const institutionName = String(body?.institutionName || '').trim().slice(0, 160)
    if (plan === 'institution' && !institutionName) {
      return NextResponse.json({ error: 'institution_name_required' }, { status: 400 })
    }
    const institutionDomains = String(body?.institutionDomains || '')
      .split(/[\s,;]+/)
      .map((domain) => domain.trim().toLowerCase().replace(/^@/, ''))
      .filter(Boolean)
    const { data, error } = await supabase.rpc('faculty_assistant_admin_activate_request_v2', {
      p_request_id: upgradeRequest.id,
      p_plan: plan,
      p_billing_period: billingPeriod,
      p_features: features,
      p_expires_at: expiresAt,
      p_institution_name: institutionName,
      p_email_domains: plan === 'institution' ? institutionDomains : [],
      p_payment_reference: paymentReference,
      p_admin_notes: adminNotes,
      p_admin_id: admin.id,
      p_admin_email: admin.email,
    })
    if (error || !data) {
      await writeFailedAdminAudit(supabase, admin, 'licence.activation', upgradeRequest, error?.message || 'No result returned')
      return NextResponse.json({ error: 'activation_failed' }, { status: 500 })
    }
    return NextResponse.json({ entitlement: data, status: 'activated' })
  }

  if (action === 'close' || action === 'declined') {
    const { data, error } = await supabase.rpc(
      'faculty_assistant_admin_close_request_for_retry',
      {
        p_request_id: upgradeRequest.id,
        p_admin_notes: adminNotes,
        p_admin_id: admin.id,
        p_admin_email: admin.email,
      },
    )
    if (error || !data) {
      await writeFailedAdminAudit(
        supabase,
        admin,
        'licence.request.closed_for_retry',
        upgradeRequest,
        error?.message || 'No result returned',
      )
      const conflict = [
        'upgrade_request_not_closeable',
        'paid_request_cannot_be_closed',
        'payment_order_still_pending',
      ]
        .some((code) => error?.message?.includes(code))
      return NextResponse.json(
        { error: conflict ? 'request_cannot_be_closed' : 'request_close_failed' },
        { status: conflict ? 409 : 500 },
      )
    }
    return NextResponse.json(data)
  }

  if (!allowedStatuses.has(action)) {
    return NextResponse.json({ error: 'invalid_request_action' }, { status: 400 })
  }
  const { data, error } = await supabase.rpc('faculty_assistant_admin_update_request_status', {
    p_request_id: upgradeRequest.id,
    p_status: action,
    p_payment_reference: paymentReference,
    p_admin_notes: adminNotes,
    p_admin_id: admin.id,
    p_admin_email: admin.email,
  })
  if (error || !data) {
    await writeFailedAdminAudit(supabase, admin, `licence.request.${action}`, upgradeRequest, error?.message || 'No result returned')
    return NextResponse.json({ error: 'request_update_failed' }, { status: 500 })
  }
  return NextResponse.json({ status: action })
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function writeFailedAdminAudit(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  admin: { id: string; email: string },
  action: string,
  upgradeRequest: Record<string, unknown>,
  failure: string,
) {
  const { error } = await supabase.from('faculty_assistant_audit_log').insert({
    moodle_user_id: upgradeRequest.moodle_user_id,
    moodle_instance: upgradeRequest.moodle_instance,
    action,
    resource_type: 'upgrade_request',
    resource_id: upgradeRequest.id,
    outcome: 'failed',
    details: { adminId: admin.id, adminEmail: admin.email, error: failure.slice(0, 500) },
  })
  if (error) console.error('Faculty Assistant failed activation audit write failed:', error)
}

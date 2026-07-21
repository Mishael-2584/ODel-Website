import { NextRequest, NextResponse } from 'next/server'
import {
  institutionFeatures,
  licenceExpiry,
  professionalFeatures,
  requireFacultyAssistantAdmin,
} from '@/lib/server/faculty-assistant-admin'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

const allowedStatuses = new Set(['contacted', 'paid', 'declined'])

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

  if (action === 'activate') {
    const plan = upgradeRequest.requested_plan === 'institution' ? 'institution' : 'professional'
    const billingPeriod =
      plan === 'institution'
        ? 'annual'
        : body?.billingPeriod === 'monthly'
          ? 'monthly'
          : 'annual'
    const features = plan === 'institution' ? institutionFeatures : professionalFeatures
    const expiresAt = licenceExpiry(billingPeriod)
    const institutionName = String(body?.institutionName || '').trim().slice(0, 160)
      || upgradeRequest.moodle_instance
    const { data, error } = await supabase.rpc('faculty_assistant_admin_activate_request', {
      p_request_id: upgradeRequest.id,
      p_plan: plan,
      p_billing_period: billingPeriod,
      p_features: features,
      p_expires_at: expiresAt,
      p_institution_name: institutionName,
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

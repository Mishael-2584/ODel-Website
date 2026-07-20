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
  if (requestError || !upgradeRequest) {
    return NextResponse.json({ error: 'request_not_found' }, { status: 404 })
  }

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
    let institutionLicenceId: string | null = null
    if (plan === 'institution') {
      const institutionName = String(body?.institutionName || '').trim().slice(0, 160)
        || upgradeRequest.moodle_instance
      const { data: agreement, error: agreementError } = await supabase
        .from('faculty_assistant_institution_licences')
        .upsert({
          moodle_instance: upgradeRequest.moodle_instance,
          institution_name: institutionName,
          features,
          is_active: true,
          expires_at: expiresAt,
          source_request_id: upgradeRequest.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'moodle_instance' })
        .select('id')
        .single()
      if (agreementError || !agreement) {
        console.error('Faculty Assistant institution activation failed:', agreementError)
        return NextResponse.json({ error: 'institution_activation_failed' }, { status: 500 })
      }
      institutionLicenceId = agreement.id
    }
    const entitlement = {
      moodle_instance: upgradeRequest.moodle_instance,
      moodle_user_id: upgradeRequest.moodle_user_id,
      email: upgradeRequest.email,
      plan,
      features,
      is_active: true,
      expires_at: expiresAt,
      billing_period: billingPeriod,
      source_request_id: upgradeRequest.id,
      institution_licence_id: institutionLicenceId,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('faculty_assistant_entitlements')
      .upsert(entitlement, { onConflict: 'moodle_instance,moodle_user_id' })
      .select('id, plan, expires_at, features')
      .single()
    if (error || !data) {
      console.error('Faculty Assistant entitlement activation failed:', error)
      return NextResponse.json({ error: 'activation_failed' }, { status: 500 })
    }

    await supabase
      .from('faculty_assistant_upgrade_requests')
      .update({
        status: 'activated',
        billing_period: billingPeriod,
        payment_reference: paymentReference,
        admin_notes: adminNotes,
        handled_by: admin.id,
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', upgradeRequest.id)
    await writeAdminAudit(supabase, admin, 'licence.activation', upgradeRequest, {
      plan,
      billingPeriod,
      entitlementId: data.id,
      institutionLicenceId,
      expiresAt,
    })
    return NextResponse.json({ entitlement: data, status: 'activated' })
  }

  if (!allowedStatuses.has(action)) {
    return NextResponse.json({ error: 'invalid_request_action' }, { status: 400 })
  }
  const { error } = await supabase
    .from('faculty_assistant_upgrade_requests')
    .update({
      status: action,
      payment_reference: paymentReference,
      admin_notes: adminNotes,
      handled_by: admin.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', upgradeRequest.id)
  if (error) return NextResponse.json({ error: 'request_update_failed' }, { status: 500 })
  await writeAdminAudit(supabase, admin, `licence.request.${action}`, upgradeRequest, {})
  return NextResponse.json({ status: action })
}

async function writeAdminAudit(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  admin: { id: string; email: string },
  action: string,
  upgradeRequest: Record<string, unknown>,
  details: Record<string, unknown>,
) {
  await supabase.from('faculty_assistant_audit_log').insert({
    moodle_user_id: upgradeRequest.moodle_user_id,
    moodle_instance: upgradeRequest.moodle_instance,
    action,
    resource_type: 'upgrade_request',
    resource_id: upgradeRequest.id,
    outcome: 'success',
    details: { ...details, adminId: admin.id, adminEmail: admin.email },
  })
}

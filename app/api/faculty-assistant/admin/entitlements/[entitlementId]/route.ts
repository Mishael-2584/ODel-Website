import { NextRequest, NextResponse } from 'next/server'
import { requireFacultyAssistantAdmin } from '@/lib/server/faculty-assistant-admin'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { entitlementId: string } },
) {
  const admin = await requireFacultyAssistantAdmin(request)
  if (!admin) return NextResponse.json({ error: 'admin_unauthorized' }, { status: 401 })
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const action = String(body?.action || '')
  const supabase = getSupabaseAdmin()
  const { data: current } = await supabase
    .from('faculty_assistant_entitlements')
    .select('id, moodle_instance, moodle_user_id, email, plan, expires_at')
    .eq('id', params.entitlementId)
    .maybeSingle()
  if (!current) return NextResponse.json({ error: 'entitlement_not_found' }, { status: 404 })

  let patch: Record<string, unknown>
  if (action === 'revoke') patch = { is_active: false }
  else if (action === 'restore') patch = { is_active: true }
  else if (action === 'extend') {
    const expiry = new Date(current.expires_at || Date.now())
    const from = expiry.getTime() > Date.now() ? expiry : new Date()
    from.setUTCFullYear(from.getUTCFullYear() + 1)
    patch = { is_active: true, expires_at: from.toISOString(), billing_period: 'annual' }
  } else {
    return NextResponse.json({ error: 'invalid_entitlement_action' }, { status: 400 })
  }
  patch.updated_at = new Date().toISOString()
  const { data, error } = await supabase
    .from('faculty_assistant_entitlements')
    .update(patch)
    .eq('id', current.id)
    .select('id, plan, is_active, expires_at')
    .single()
  if (error || !data) return NextResponse.json({ error: 'entitlement_update_failed' }, { status: 500 })

  await supabase.from('faculty_assistant_audit_log').insert({
    moodle_user_id: current.moodle_user_id,
    moodle_instance: current.moodle_instance,
    action: `licence.${action}`,
    resource_type: 'entitlement',
    resource_id: current.id,
    outcome: 'success',
    details: { adminId: admin.id, adminEmail: admin.email, plan: current.plan },
  })
  return NextResponse.json({ entitlement: data })
}

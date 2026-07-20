import { NextRequest, NextResponse } from 'next/server'
import { requireFacultyAssistantAdmin } from '@/lib/server/faculty-assistant-admin'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { institutionId: string } },
) {
  const admin = await requireFacultyAssistantAdmin(request)
  if (!admin) return NextResponse.json({ error: 'admin_unauthorized' }, { status: 401 })
  const body = (await request.json().catch(() => null)) as { action?: unknown } | null
  const action = String(body?.action || '')
  const supabase = getSupabaseAdmin()
  const { data: current } = await supabase
    .from('faculty_assistant_institution_licences')
    .select('id, moodle_instance, institution_name, expires_at')
    .eq('id', params.institutionId)
    .maybeSingle()
  if (!current) return NextResponse.json({ error: 'institution_licence_not_found' }, { status: 404 })

  let patch: Record<string, unknown>
  if (action === 'revoke') patch = { is_active: false }
  else if (action === 'restore') patch = { is_active: true }
  else if (action === 'extend') {
    const expiry = new Date(current.expires_at || Date.now())
    const from = expiry.getTime() > Date.now() ? expiry : new Date()
    from.setUTCFullYear(from.getUTCFullYear() + 1)
    patch = { is_active: true, expires_at: from.toISOString() }
  } else return NextResponse.json({ error: 'invalid_institution_action' }, { status: 400 })
  patch.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('faculty_assistant_institution_licences')
    .update(patch)
    .eq('id', current.id)
    .select('id, is_active, expires_at')
    .single()
  if (error || !data) return NextResponse.json({ error: 'institution_update_failed' }, { status: 500 })

  if (action === 'revoke') {
    await supabase.from('faculty_assistant_entitlements').update({ is_active: false }).eq('institution_licence_id', current.id)
  } else if (action === 'extend') {
    await supabase.from('faculty_assistant_entitlements').update({ is_active: true, expires_at: data.expires_at }).eq('institution_licence_id', current.id)
  }
  await supabase.from('faculty_assistant_audit_log').insert({
    moodle_instance: current.moodle_instance,
    action: `institution.${action}`,
    resource_type: 'institution_licence',
    resource_id: current.id,
    outcome: 'success',
    details: { adminId: admin.id, adminEmail: admin.email, institutionName: current.institution_name },
  })
  return NextResponse.json({ institution: data })
}

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
  if (!['revoke', 'restore', 'extend'].includes(action)) {
    return NextResponse.json({ error: 'invalid_institution_action' }, { status: 400 })
  }
  const supabase = getSupabaseAdmin()
  const { data: current, error: readError } = await supabase
    .from('faculty_assistant_institution_licences')
    .select('id, moodle_instance, institution_name, expires_at')
    .eq('id', params.institutionId)
    .maybeSingle()
  if (readError) return NextResponse.json({ error: 'institution_lookup_failed' }, { status: 500 })
  if (!current) return NextResponse.json({ error: 'institution_licence_not_found' }, { status: 404 })

  let expiresAt: string | null = null
  if (action === 'extend') {
    const currentExpiry = new Date(current.expires_at).getTime()
    const from = Number.isFinite(currentExpiry) && currentExpiry > Date.now()
      ? new Date(currentExpiry)
      : new Date()
    from.setUTCFullYear(from.getUTCFullYear() + 1)
    expiresAt = from.toISOString()
  }

  const { data, error } = await supabase.rpc('faculty_assistant_admin_update_institution', {
    p_institution_id: current.id,
    p_action: action,
    p_expires_at: expiresAt,
    p_admin_id: admin.id,
    p_admin_email: admin.email,
  })
  if (error || !data) {
    await writeFailedAudit(supabase, current, admin, action, error?.message || 'No result returned')
    return NextResponse.json({ error: 'institution_update_failed' }, { status: 500 })
  }
  return NextResponse.json({ institution: data })
}

async function writeFailedAudit(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  institution: { id: string; moodle_instance: string; institution_name: string },
  admin: { id: string; email: string },
  action: string,
  failure: string,
) {
  const { error } = await supabase.from('faculty_assistant_audit_log').insert({
    moodle_instance: institution.moodle_instance,
    action: `institution.${action}`,
    resource_type: 'institution_licence',
    resource_id: institution.id,
    outcome: 'failed',
    details: {
      adminId: admin.id,
      adminEmail: admin.email,
      institutionName: institution.institution_name,
      error: failure.slice(0, 500),
    },
  })
  if (error) console.error('Faculty Assistant failed institution audit write failed:', error)
}

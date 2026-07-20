import { NextRequest, NextResponse } from 'next/server'
import {
  facultyAssistantMoodleInstance,
  facultyAssistantPublicOrigin,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import { requireOdelSession } from '@/lib/server/odel-session'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

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
    details: { requestedPlan, source },
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
  })
  return NextResponse.json({ requestId: data.id, status: data.status }, { status: 201 })
}

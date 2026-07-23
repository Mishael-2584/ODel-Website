import { NextRequest, NextResponse } from 'next/server'
import {
  licenceExpiry,
  requireFacultyAssistantAdmin,
} from '@/lib/server/faculty-assistant-admin'
import { facultyAssistantMoodleInstance } from '@/lib/server/faculty-assistant-auth'
import { getFacultyAssistantUserByEmail } from '@/lib/server/faculty-assistant-moodle'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const admin = await requireFacultyAssistantAdmin(request)
  if (!admin) return NextResponse.json({ error: 'admin_unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const email = String(body?.email || '').trim().toLowerCase()
  if (!emailPattern.test(email) || email.length > 320) {
    return NextResponse.json({ error: 'invalid_licence_email' }, { status: 400 })
  }

  let moodleUser: Awaited<ReturnType<typeof getFacultyAssistantUserByEmail>>
  try {
    moodleUser = await getFacultyAssistantUserByEmail(email)
  } catch (error) {
    console.error('Faculty Assistant Moodle licence lookup failed:', error)
    return NextResponse.json({ error: 'moodle_user_not_found' }, { status: 404 })
  }
  if (moodleUser.email !== email) {
    return NextResponse.json({ error: 'moodle_email_mismatch' }, { status: 409 })
  }

  const moodleInstance = facultyAssistantMoodleInstance()
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc(
    'faculty_assistant_admin_grant_professional',
    {
      p_moodle_instance: moodleInstance,
      p_moodle_user_id: moodleUser.id,
      p_email: moodleUser.email,
      p_expires_at: licenceExpiry('annual'),
      p_admin_id: admin.id,
      p_admin_email: admin.email,
    },
  ).single()
  if (error || !data) {
    console.error('Faculty Assistant manual licence grant failed:', error)
    const conflict = error?.message?.includes('institution_entitlement_managed')
    return NextResponse.json(
      { error: conflict ? 'institution_licence_managed' : 'licence_grant_failed' },
      { status: conflict ? 409 : 500 },
    )
  }

  return NextResponse.json({
    entitlement: data,
    moodleUser,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { requireFacultyAssistantModerator } from '@/lib/server/faculty-assistant-moderation'
import { writeFacultyAssistantAudit } from '@/lib/server/faculty-assistant-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export async function PATCH(request: NextRequest) {
  const moderator = await requireFacultyAssistantModerator(request)
  if (!moderator) {
    return NextResponse.json({ error: 'moderator_unauthorized' }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  const password = String(body.password || '')
  if (
    password.length < 12 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return NextResponse.json({ error: 'weak_moderator_password' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error: passwordError } = await supabase.auth.admin.updateUserById(
    moderator.authUserId,
    { password },
  )
  if (passwordError) {
    console.error('Moderator password update failed:', passwordError)
    return NextResponse.json({ error: 'moderator_password_update_failed' }, { status: 500 })
  }
  const { error: assignmentError } = await supabase
    .from('faculty_assistant_moderators')
    .update({
      must_change_password: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', moderator.moderatorId)
  if (assignmentError) {
    console.error('Moderator password state update failed:', assignmentError)
    return NextResponse.json({ error: 'moderator_password_state_failed' }, { status: 500 })
  }

  await writeFacultyAssistantAudit('moderation.moderator.password_changed', 'success', {
    resourceType: 'moderator',
    resourceId: moderator.moderatorId,
    details: {
      institutionLicenceId: moderator.institutionLicenceId,
      moderatorEmail: moderator.email,
    },
  })
  return NextResponse.json({ changed: true })
}

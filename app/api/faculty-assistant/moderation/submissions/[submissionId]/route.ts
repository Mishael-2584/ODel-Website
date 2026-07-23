import { NextRequest, NextResponse } from 'next/server'
import { requireFacultyAssistantModerator } from '@/lib/server/faculty-assistant-moderation'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { submissionId: string } },
) {
  const moderator = await requireFacultyAssistantModerator(request)
  if (!moderator) {
    return NextResponse.json({ error: 'moderator_unauthorized' }, { status: 401 })
  }
  if (moderator.mustChangePassword) {
    return NextResponse.json({ error: 'password_change_required' }, { status: 403 })
  }
  const body = await request.json().catch(() => ({}))
  const decision = String(body.decision || '')
  const note = String(body.note || '').trim()
  if (
    !['approved', 'changes_requested'].includes(decision) ||
    (decision === 'changes_requested' && !note)
  ) {
    return NextResponse.json({ error: 'invalid_moderation_decision' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc('faculty_assistant_moderation_decide', {
    p_submission_id: params.submissionId,
    p_moderator_auth_user_id: moderator.authUserId,
    p_decision: decision,
    p_note: note,
  })
  if (error) {
    console.error('Moderation decision failed:', error)
    const status = error.code === '42501' ? 403 : error.code === 'P0002' ? 404 : 409
    return NextResponse.json({ error: 'moderation_decision_failed' }, { status })
  }
  return NextResponse.json({ decision: data })
}

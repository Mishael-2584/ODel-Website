import { NextRequest, NextResponse } from 'next/server'
import {
  requireFacultyAssistantModerator,
  submissionWithinModeratorScope,
} from '@/lib/server/faculty-assistant-moderation'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export async function GET(request: NextRequest) {
  const moderator = await requireFacultyAssistantModerator(request)
  if (!moderator) {
    return NextResponse.json({ error: 'moderator_unauthorized' }, { status: 401 })
  }
  if (moderator.mustChangePassword) {
    return NextResponse.json({ error: 'password_change_required' }, { status: 403 })
  }
  const supabase = getSupabaseAdmin()
  const [institution, setting, submissions] = await Promise.all([
    supabase
      .from('faculty_assistant_institution_licences')
      .select('institution_name, moodle_instance')
      .eq('id', moderator.institutionLicenceId)
      .single(),
    supabase
      .from('faculty_assistant_moderation_settings')
      .select('mode, retention_days')
      .eq('institution_licence_id', moderator.institutionLicenceId)
      .maybeSingle(),
    supabase
      .from('faculty_assistant_moderation_submissions')
      .select(`
        id,
        lecturer_email,
        lecturer_name,
        moodle_course_id,
        course_code,
        course_title,
        academic_period,
        school_name,
        version_number,
        version_checksum,
        snapshot,
        status,
        decision_note,
        decided_at,
        approval_receipt,
        submitted_at,
        updated_at,
        faculty_assistant_moderators(full_name)
      `)
      .eq('institution_licence_id', moderator.institutionLicenceId)
      .order('submitted_at', { ascending: false })
      .limit(250),
  ])
  const failed = [institution, setting, submissions].find((result) => result.error)
  if (failed?.error) {
    console.error('Moderation Desk overview failed:', failed.error)
    return NextResponse.json({ error: 'moderation_desk_unavailable' }, { status: 500 })
  }

  return NextResponse.json({
    moderator: {
      id: moderator.moderatorId,
      email: moderator.email,
      name: moderator.name,
      scopeType: moderator.scopeType,
      scopeValues: moderator.scopeValues,
    },
    institution: {
      id: moderator.institutionLicenceId,
      name: institution.data?.institution_name || 'Institution',
      moodleInstance: institution.data?.moodle_instance || '',
    },
    policy: {
      mode: setting.data?.mode || 'optional',
      retentionDays: setting.data?.retention_days || 2555,
    },
    submissions: (submissions.data || []).filter((submission) =>
      submissionWithinModeratorScope(moderator, submission),
    ),
  })
}

import { NextRequest, NextResponse } from 'next/server'
import {
  issueModeratorToken,
  type FacultyAssistantModeratorIdentity,
} from '@/lib/server/faculty-assistant-moderation'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const institutionLicenceId = String(body.institutionLicenceId || '').trim()
  if (!email || !password) {
    return NextResponse.json({ error: 'email_and_password_required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'invalid_moderator_credentials' }, { status: 401 })
  }

  let query = supabase
    .from('faculty_assistant_moderators')
    .select(`
      id,
      auth_user_id,
      institution_licence_id,
      email,
      full_name,
      scope_type,
      scope_values,
      must_change_password,
      is_active,
      faculty_assistant_institution_licences!inner(
        institution_name,
        is_active,
        expires_at
      )
    `)
    .eq('auth_user_id', authData.user.id)
    .eq('is_active', true)
  if (institutionLicenceId) {
    query = query.eq('institution_licence_id', institutionLicenceId)
  }
  const { data: assignments, error } = await query
  if (error || !assignments?.length) {
    return NextResponse.json({ error: 'moderator_assignment_inactive' }, { status: 403 })
  }

  const activeAssignments = assignments.filter((assignment) => {
    const licence = Array.isArray(assignment.faculty_assistant_institution_licences)
      ? assignment.faculty_assistant_institution_licences[0]
      : assignment.faculty_assistant_institution_licences
    const expiry = new Date(String(licence?.expires_at || '')).getTime()
    return licence?.is_active && Number.isFinite(expiry) && expiry > Date.now()
  })
  if (!activeAssignments.length) {
    return NextResponse.json({ error: 'institution_licence_inactive' }, { status: 403 })
  }
  if (!institutionLicenceId && activeAssignments.length > 1) {
    return NextResponse.json({
      error: 'institution_selection_required',
      institutions: activeAssignments.map((assignment) => {
        const licence = Array.isArray(assignment.faculty_assistant_institution_licences)
          ? assignment.faculty_assistant_institution_licences[0]
          : assignment.faculty_assistant_institution_licences
        return {
          id: assignment.institution_licence_id,
          name: licence?.institution_name || 'Institution',
        }
      }),
    }, { status: 409 })
  }

  const assignment = activeAssignments[0]
  const licence = Array.isArray(assignment.faculty_assistant_institution_licences)
    ? assignment.faculty_assistant_institution_licences[0]
    : assignment.faculty_assistant_institution_licences
  const identity: FacultyAssistantModeratorIdentity = {
    authUserId: String(assignment.auth_user_id),
    moderatorId: String(assignment.id),
    institutionLicenceId: String(assignment.institution_licence_id),
    email: String(assignment.email || email),
    name: String(assignment.full_name || email),
    scopeType:
      assignment.scope_type === 'school' || assignment.scope_type === 'course'
        ? assignment.scope_type
        : 'institution',
    scopeValues: Array.isArray(assignment.scope_values)
      ? assignment.scope_values.map(String)
      : [],
    mustChangePassword: Boolean(assignment.must_change_password),
  }

  return NextResponse.json({
    token: issueModeratorToken(identity),
    moderator: {
      id: identity.moderatorId,
      email: identity.email,
      name: identity.name,
      scopeType: identity.scopeType,
      scopeValues: identity.scopeValues,
      mustChangePassword: identity.mustChangePassword,
    },
    institution: {
      id: identity.institutionLicenceId,
      name: licence?.institution_name || 'Institution',
    },
  })
}

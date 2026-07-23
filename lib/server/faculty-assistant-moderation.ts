import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'
import { getSupabaseAdmin } from './supabase-admin'

export type ModerationMode = 'disabled' | 'optional' | 'required'

export interface FacultyAssistantModeratorIdentity {
  authUserId: string
  moderatorId: string
  institutionLicenceId: string
  email: string
  name: string
  scopeType: 'institution' | 'school' | 'course'
  scopeValues: string[]
  mustChangePassword: boolean
}

export async function requireFacultyAssistantModerator(
  request: NextRequest,
): Promise<FacultyAssistantModeratorIdentity | null> {
  const authorization = request.headers.get('authorization') || ''
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : ''
  const secret = moderationJwtSecret()
  if (!token || !secret) return null

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: moderationIssuer(),
      audience: 'faculty-assistant-moderation-desk',
    }) as jwt.JwtPayload
    if (
      decoded.type !== 'faculty_assistant_moderator' ||
      !decoded.sub ||
      !decoded.moderatorId ||
      !decoded.institutionLicenceId
    ) {
      return null
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
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
        faculty_assistant_institution_licences!inner(is_active, expires_at)
      `)
      .eq('id', String(decoded.moderatorId))
      .eq('auth_user_id', String(decoded.sub))
      .eq('institution_licence_id', String(decoded.institutionLicenceId))
      .eq('is_active', true)
      .maybeSingle()
    if (error || !data) return null

    const licence = Array.isArray(data.faculty_assistant_institution_licences)
      ? data.faculty_assistant_institution_licences[0]
      : data.faculty_assistant_institution_licences
    const expiry = new Date(String(licence?.expires_at || '')).getTime()
    if (!licence?.is_active || !Number.isFinite(expiry) || expiry <= Date.now()) {
      return null
    }

    return {
      authUserId: String(data.auth_user_id),
      moderatorId: String(data.id),
      institutionLicenceId: String(data.institution_licence_id),
      email: String(data.email || ''),
      name: String(data.full_name || data.email || 'Moderator'),
      scopeType: normalizeScopeType(data.scope_type),
      scopeValues: Array.isArray(data.scope_values)
        ? data.scope_values.map(String)
        : [],
      mustChangePassword: Boolean(data.must_change_password),
    }
  } catch {
    return null
  }
}

export function issueModeratorToken(identity: FacultyAssistantModeratorIdentity) {
  return jwt.sign(
    {
      type: 'faculty_assistant_moderator',
      moderatorId: identity.moderatorId,
      institutionLicenceId: identity.institutionLicenceId,
      email: identity.email,
      name: identity.name,
    },
    moderationJwtSecret(),
    {
      subject: identity.authUserId,
      issuer: moderationIssuer(),
      audience: 'faculty-assistant-moderation-desk',
      expiresIn: '8h',
    },
  )
}

export function moderationIssuer() {
  return process.env.FACULTY_ASSISTANT_PUBLIC_ORIGIN ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://odel.ueab.ac.ke'
}

export function submissionWithinModeratorScope(
  moderator: Pick<FacultyAssistantModeratorIdentity, 'scopeType' | 'scopeValues'>,
  submission: {
    school_name?: string | null
    course_code?: string | null
    moodle_course_id?: number | string | null
  },
) {
  if (moderator.scopeType === 'institution') return true
  const scope = moderator.scopeValues.map((value) => value.trim().toLowerCase())
  if (moderator.scopeType === 'school') {
    return scope.includes(String(submission.school_name || '').trim().toLowerCase())
  }
  return scope.includes(String(submission.course_code || '').trim().toLowerCase()) ||
    scope.includes(String(submission.moodle_course_id || '').trim().toLowerCase())
}

function normalizeScopeType(value: unknown): FacultyAssistantModeratorIdentity['scopeType'] {
  if (value === 'school' || value === 'course') return value
  return 'institution'
}

function moderationJwtSecret() {
  const secret =
    process.env.FACULTY_ASSISTANT_MODERATION_JWT_SECRET ||
    process.env.FACULTY_ASSISTANT_JWT_SECRET ||
    process.env.JWT_SECRET
  if (!secret || secret.startsWith('your-secret')) {
    throw new Error('Faculty Assistant moderation JWT secret is not configured')
  }
  return secret
}

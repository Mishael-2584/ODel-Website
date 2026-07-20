import type { NextRequest } from 'next/server'
import { verifyJWTToken } from '@/lib/passwordless-auth'
import { getSupabaseAdmin } from './supabase-admin'

export interface OdelSessionUser {
  email: string
  moodleUserId: number
  moodleUsername: string
  studentName: string
  roles: string[]
  sessionId: string
}

export async function requireOdelSession(
  request: NextRequest,
): Promise<OdelSessionUser | null> {
  const token =
    request.cookies.get('odel_auth')?.value ||
    bearerToken(request.headers.get('authorization'))
  if (!token) return null

  const decoded = verifyJWTToken(token)
  if (
    !decoded ||
    !decoded.email ||
    !Number.isInteger(Number(decoded.moodleUserId))
  ) {
    return null
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('student_sessions')
    .select('id, expires_at, is_active, moodle_user_id')
    .eq('jwt_token', token)
    .eq('is_active', true)
    .single()

  if (
    error ||
    !data ||
    Number(data.moodle_user_id) !== Number(decoded.moodleUserId) ||
    new Date(data.expires_at).getTime() <= Date.now()
  ) {
    return null
  }

  return {
    email: String(decoded.email).toLowerCase(),
    moodleUserId: Number(decoded.moodleUserId),
    moodleUsername: String(decoded.moodleUsername || ''),
    studentName: String(decoded.studentName || ''),
    roles: Array.isArray(decoded.roles) ? decoded.roles.map(String) : [],
    sessionId: String(data.id),
  }
}

export function bearerToken(value: string | null) {
  if (!value?.startsWith('Bearer ')) return ''
  return value.slice('Bearer '.length).trim()
}

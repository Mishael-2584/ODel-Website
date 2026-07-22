import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'
import { bearerToken } from './odel-session'
import { getSupabaseAdmin } from './supabase-admin'

export const facultyAssistantClientId = 'faculty-assistant-desktop'
export const facultyAssistantRedirectUri = 'facultyassistant://auth/callback'
export const allowedFacultyAssistantScopes = [
  'profile:read',
  'courses:read',
  'grades:read',
  'questions:write',
] as const

export interface FacultyAssistantIdentity {
  moodleUserId: number
  moodleInstance: string
  email: string
  name: string
  scopes: string[]
  plan: string
  entitlementId: string
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url')
}

export function hashToken(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function verifyPkce(verifier: string, challenge: string) {
  const calculated = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url')
  const left = Buffer.from(calculated)
  const right = Buffer.from(challenge)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function facultyAssistantMoodleInstance() {
  return process.env.FACULTY_ASSISTANT_MOODLE_INSTANCE || 'ueab-production'
}

export function facultyAssistantPublicOrigin() {
  const configured =
    process.env.FACULTY_ASSISTANT_PUBLIC_ORIGIN ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL
  const fallback =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://odel.ueab.ac.ke'

  try {
    const url = new URL(configured || fallback)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return fallback
    if (
      process.env.NODE_ENV === 'production' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    ) {
      return fallback
    }
    return url.origin
  } catch {
    return fallback
  }
}

export async function getActiveEntitlement(
  moodleUserId: number,
  moodleInstance = facultyAssistantMoodleInstance(),
) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('faculty_assistant_entitlements')
    .select('id, plan, features, expires_at, is_active')
    .eq('moodle_user_id', moodleUserId)
    .eq('moodle_instance', moodleInstance)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) return null
  if (hasExpired(data.expires_at)) return null
  return data
}

export async function provisionInstitutionEntitlement(options: {
  moodleUserId: number
  moodleInstance: string
  email: string
}) {
  const emailDomain = normalizedEmailDomain(options.email)
  if (!emailDomain) return null
  const supabase = getSupabaseAdmin()
  const updatedAt = new Date().toISOString()
  const { data: agreement, error: agreementError } = await supabase
    .from('faculty_assistant_institution_licences')
    .select('id, email_domains, features, expires_at')
    .eq('moodle_instance', options.moodleInstance)
    .eq('is_active', true)
    .contains('email_domains', [emailDomain])
    .maybeSingle()
  if (
    agreementError ||
    !agreement ||
    !Array.isArray(agreement.email_domains) ||
    !agreement.email_domains.includes(emailDomain) ||
    isInvalidOrExpired(agreement.expires_at)
  ) return null

  const { data, error } = await supabase
    .from('faculty_assistant_entitlements')
    .upsert({
      moodle_user_id: options.moodleUserId,
      moodle_instance: options.moodleInstance,
      email: options.email,
      plan: 'institution',
      features: agreement.features,
      is_active: true,
      expires_at: agreement.expires_at,
      billing_period: 'annual',
      institution_licence_id: agreement.id,
      updated_at: updatedAt,
    }, { onConflict: 'moodle_instance,moodle_user_id' })
    .select('id, plan, features, expires_at, is_active')
    .single()
  return error ? null : data
}

export function normalizedEmailDomain(email: string) {
  const domain = email.trim().toLowerCase().split('@')[1] || ''
  return /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(domain) &&
    domain.includes('.') &&
    !domain.includes('..')
    ? domain
    : ''
}

function hasExpired(value: string | null | undefined) {
  if (!value) return false
  const expiresAt = new Date(value).getTime()
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now()
}

function isInvalidOrExpired(value: string | null | undefined) {
  if (!value) return true
  return hasExpired(value)
}

export function issueAccessToken(identity: FacultyAssistantIdentity) {
  const secret = facultyAssistantJwtSecret()
  return jwt.sign(
    {
      type: 'faculty_assistant',
      moodleInstance: identity.moodleInstance,
      email: identity.email,
      name: identity.name,
      scopes: identity.scopes,
      plan: identity.plan,
      entitlementId: identity.entitlementId,
    },
    secret,
    {
      subject: String(identity.moodleUserId),
      issuer: facultyAssistantPublicOrigin(),
      audience: facultyAssistantClientId,
      expiresIn: '15m',
      jwtid: crypto.randomUUID(),
    },
  )
}

export function verifyFacultyAssistantRequest(
  request: NextRequest,
  requiredScope?: string,
): FacultyAssistantIdentity | null {
  const token = bearerToken(request.headers.get('authorization'))
  if (!token) return null
  try {
    const decoded = jwt.verify(token, facultyAssistantJwtSecret(), {
      audience: facultyAssistantClientId,
      issuer: facultyAssistantPublicOrigin(),
    }) as jwt.JwtPayload
    const scopes = Array.isArray(decoded.scopes) ? decoded.scopes.map(String) : []
    if (
      decoded.type !== 'faculty_assistant' ||
      !decoded.sub ||
      !decoded.moodleInstance ||
      (requiredScope && !scopes.includes(requiredScope))
    ) {
      return null
    }
    return {
      moodleUserId: Number(decoded.sub),
      moodleInstance: String(decoded.moodleInstance || ''),
      email: String(decoded.email || ''),
      name: String(decoded.name || ''),
      scopes,
      plan: String(decoded.plan || 'unknown'),
      entitlementId: String(decoded.entitlementId || ''),
    }
  } catch {
    return null
  }
}

export function requestedScopes(value: string | null) {
  const requested = (value || '')
    .split(/\s+/)
    .filter(Boolean)
    .filter((scope) =>
      allowedFacultyAssistantScopes.includes(
        scope as (typeof allowedFacultyAssistantScopes)[number],
      ),
    )
  return requested.length ? Array.from(new Set(requested)) : ['profile:read', 'courses:read']
}

export async function writeFacultyAssistantAudit(
  action: string,
  outcome: 'success' | 'denied' | 'failed',
  options: {
    moodleUserId?: number
    moodleInstance?: string
    resourceType?: string
    resourceId?: string
    details?: Record<string, unknown>
    ipAddress?: string | null
  } = {},
) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('faculty_assistant_audit_log').insert({
    moodle_user_id: options.moodleUserId || null,
    moodle_instance: options.moodleInstance || null,
    action,
    resource_type: options.resourceType || null,
    resource_id: options.resourceId || null,
    outcome,
    details: options.details || {},
    ip_address: options.ipAddress || null,
  })
  if (error) console.error('Faculty Assistant audit write failed:', error.message)
}

function facultyAssistantJwtSecret() {
  const secret = process.env.FACULTY_ASSISTANT_JWT_SECRET || process.env.JWT_SECRET
  if (!secret || secret === 'your-secret-key-change-in-production') {
    throw new Error('FACULTY_ASSISTANT_JWT_SECRET is not securely configured')
  }
  return secret
}

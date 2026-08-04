import { NextRequest, NextResponse } from 'next/server'
import {
  facultyAssistantClientId,
  facultyAssistantRedirectUri,
  getActiveEntitlement,
  grantedFacultyAssistantScopes,
  hashToken,
  issueAccessToken,
  randomToken,
  verifyPkce,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await readBody(request)
    const grantType = String(body.grant_type || '')
    if (String(body.client_id || '') !== facultyAssistantClientId) {
      return oauthError('invalid_client', 401)
    }
    if (grantType === 'authorization_code') return exchangeAuthorizationCode(body)
    if (grantType === 'refresh_token') return exchangeRefreshToken(body)
    return oauthError('unsupported_grant_type')
  } catch (error) {
    console.error('Faculty Assistant token exchange failed:', error)
    return oauthError('server_error', 500)
  }
}

async function exchangeAuthorizationCode(body: Record<string, unknown>) {
  const code = String(body.code || '')
  const verifier = String(body.code_verifier || '')
  const redirectUri = String(body.redirect_uri || '')
  if (!code || !verifier || redirectUri !== facultyAssistantRedirectUri) {
    return oauthError('invalid_request')
  }

  const supabase = getSupabaseAdmin()
  const { data: authorization } = await supabase
    .from('faculty_assistant_authorization_codes')
    .select('*')
    .eq('code_hash', hashToken(code))
    .eq('client_id', facultyAssistantClientId)
    .eq('redirect_uri', redirectUri)
    .is('used_at', null)
    .maybeSingle()

  if (
    !authorization ||
    new Date(authorization.expires_at).getTime() <= Date.now() ||
    !verifyPkce(verifier, authorization.code_challenge)
  ) {
    return oauthError('invalid_grant')
  }

  const { data: consumed } = await supabase
    .from('faculty_assistant_authorization_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', authorization.id)
    .is('used_at', null)
    .select('id')
    .maybeSingle()
  if (!consumed) return oauthError('invalid_grant')

  const entitlement = await getActiveEntitlement(
    authorization.moodle_user_id,
    authorization.moodle_instance,
  )
  if (!entitlement || entitlement.id !== authorization.entitlement_id) {
    return oauthError('access_denied', 403)
  }

  const identity = {
    moodleUserId: Number(authorization.moodle_user_id),
    moodleInstance: String(authorization.moodle_instance),
    email: String(authorization.email),
    name: String(authorization.display_name || ''),
    scopes: authorization.scopes.map(String),
    plan: String(entitlement.plan),
    entitlementId: String(entitlement.id),
  }
  const response = await createRefreshToken(identity, String(body.device_name || 'Windows desktop'))
  await writeFacultyAssistantAudit('oauth.token.issue', 'success', {
    moodleUserId: identity.moodleUserId,
    moodleInstance: identity.moodleInstance,
    details: { scopes: identity.scopes },
  })
  return tokenResponse(identity, response.rawToken)
}

async function exchangeRefreshToken(body: Record<string, unknown>) {
  const rawToken = String(body.refresh_token || '')
  if (!rawToken) return oauthError('invalid_request')
  const supabase = getSupabaseAdmin()
  const { data: current } = await supabase
    .from('faculty_assistant_refresh_tokens')
    .select('*')
    .eq('token_hash', hashToken(rawToken))
    .eq('client_id', facultyAssistantClientId)
    .is('revoked_at', null)
    .maybeSingle()
  if (!current || new Date(current.expires_at).getTime() <= Date.now()) {
    return oauthError('invalid_grant')
  }

  const entitlement = await getActiveEntitlement(
    current.moodle_user_id,
    current.moodle_instance,
  )
  if (!entitlement || entitlement.id !== current.entitlement_id) {
    return oauthError('access_denied', 403)
  }
  const identity = {
    moodleUserId: Number(current.moodle_user_id),
    moodleInstance: String(current.moodle_instance),
    email: String(current.email),
    name: String(current.display_name || ''),
    scopes: grantedFacultyAssistantScopes(
      current.scopes.map(String),
      entitlement.features,
    ),
    plan: String(entitlement.plan),
    entitlementId: String(entitlement.id),
  }
  const replacement = await createRefreshToken(identity, current.device_name || 'Windows desktop')
  const now = new Date().toISOString()
  const { data: revoked } = await supabase
    .from('faculty_assistant_refresh_tokens')
    .update({ revoked_at: now, last_used_at: now, replaced_by: replacement.id })
    .eq('id', current.id)
    .is('revoked_at', null)
    .select('id')
    .maybeSingle()
  if (!revoked) {
    await supabase.from('faculty_assistant_refresh_tokens').update({ revoked_at: now }).eq('id', replacement.id)
    return oauthError('invalid_grant')
  }
  await writeFacultyAssistantAudit('oauth.token.refresh', 'success', {
    moodleUserId: identity.moodleUserId,
    moodleInstance: identity.moodleInstance,
  })
  return tokenResponse(identity, replacement.rawToken)
}

async function createRefreshToken(
  identity: {
    moodleUserId: number
    moodleInstance: string
    email: string
    name: string
    scopes: string[]
    entitlementId: string
  },
  deviceName: string,
) {
  const rawToken = randomToken(48)
  const { data, error } = await getSupabaseAdmin()
    .from('faculty_assistant_refresh_tokens')
    .insert({
      token_hash: hashToken(rawToken),
      client_id: facultyAssistantClientId,
      moodle_user_id: identity.moodleUserId,
      moodle_instance: identity.moodleInstance,
      email: identity.email,
      display_name: identity.name,
      scopes: identity.scopes,
      entitlement_id: identity.entitlementId,
      device_name: deviceName.slice(0, 120),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single()
  if (error || !data) throw new Error('Could not persist refresh token')
  return { id: String(data.id), rawToken }
}

function tokenResponse(
  identity: Parameters<typeof issueAccessToken>[0],
  refreshToken: string,
) {
  return NextResponse.json(
    {
      access_token: issueAccessToken(identity),
      token_type: 'Bearer',
      expires_in: 900,
      refresh_token: refreshToken,
      scope: identity.scopes.join(' '),
    },
    { headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } },
  )
}

function oauthError(error: string, status = 400) {
  return NextResponse.json(
    { error },
    { status, headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } },
  )
}

async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return request.json()
  const form = await request.formData()
  return Object.fromEntries(form.entries())
}

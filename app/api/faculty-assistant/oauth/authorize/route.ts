import { NextRequest, NextResponse } from 'next/server'
import {
  allowedFacultyAssistantScopes,
  facultyAssistantClientId,
  facultyAssistantMoodleInstance,
  facultyAssistantPublicOrigin,
  facultyAssistantRedirectUri,
  getActiveEntitlement,
  hashToken,
  randomToken,
  requestedScopes,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import { requireOdelSession } from '@/lib/server/odel-session'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const clientId = params.get('client_id') || ''
  const redirectUri = params.get('redirect_uri') || ''
  const state = params.get('state') || ''
  const challenge = params.get('code_challenge') || ''
  const challengeMethod = params.get('code_challenge_method') || ''
  const rawScopes = (params.get('scope') || '').split(/\s+/).filter(Boolean)

  if (
    params.get('response_type') !== 'code' ||
    clientId !== facultyAssistantClientId ||
    redirectUri !== facultyAssistantRedirectUri ||
    challengeMethod !== 'S256' ||
    !/^[A-Za-z0-9._~-]{43,128}$/.test(challenge) ||
    !/^[A-Za-z0-9._~-]{16,256}$/.test(state) ||
    rawScopes.some(
      (scope) =>
        !allowedFacultyAssistantScopes.includes(
          scope as (typeof allowedFacultyAssistantScopes)[number],
        ),
    )
  ) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Invalid desktop authorization request.' },
      { status: 400 },
    )
  }

  const session = await requireOdelSession(request)
  if (!session) {
    const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`
    // Reverse proxies may expose the internal Next.js origin as localhost.
    const login = new URL('/login', facultyAssistantPublicOrigin())
    login.searchParams.set('returnTo', returnTo)
    return NextResponse.redirect(login)
  }

  const moodleInstance = facultyAssistantMoodleInstance()
  const entitlement = await getActiveEntitlement(session.moodleUserId, moodleInstance)
  const scopes = requestedScopes(params.get('scope'))
  const entitledFeatures = entitlement?.features?.map(String) || []
  if (!entitlement || scopes.some((scope) => !entitledFeatures.includes(scope))) {
    await writeFacultyAssistantAudit('oauth.authorize', 'denied', {
      moodleUserId: session.moodleUserId,
      moodleInstance,
      details: { reason: 'inactive_or_insufficient_entitlement', requestedScopes: scopes },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    })
    return redirectWithError(redirectUri, state, 'access_denied', 'An active Faculty Assistant licence is required.')
  }

  const code = randomToken(32)
  const { error } = await getSupabaseAdmin()
    .from('faculty_assistant_authorization_codes')
    .insert({
      code_hash: hashToken(code),
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: challenge,
      code_challenge_method: challengeMethod,
      moodle_user_id: session.moodleUserId,
      moodle_instance: moodleInstance,
      email: session.email,
      display_name: session.studentName,
      scopes,
      entitlement_id: entitlement.id,
      expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    })

  if (error) {
    await writeFacultyAssistantAudit('oauth.authorize', 'failed', {
      moodleUserId: session.moodleUserId,
      moodleInstance,
      details: { reason: 'code_persistence_failed' },
    })
    return redirectWithError(redirectUri, state, 'server_error', 'Could not complete authorization.')
  }

  await writeFacultyAssistantAudit('oauth.authorize', 'success', {
    moodleUserId: session.moodleUserId,
    moodleInstance,
    details: { scopes },
  })
  const callback = new URL(redirectUri)
  callback.searchParams.set('code', code)
  callback.searchParams.set('state', state)
  return NextResponse.redirect(callback)
}

function redirectWithError(
  redirectUri: string,
  state: string,
  error: string,
  description: string,
) {
  const callback = new URL(redirectUri)
  callback.searchParams.set('error', error)
  callback.searchParams.set('error_description', description)
  callback.searchParams.set('state', state)
  return NextResponse.redirect(callback)
}

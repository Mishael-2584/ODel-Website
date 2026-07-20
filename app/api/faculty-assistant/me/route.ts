import { NextRequest, NextResponse } from 'next/server'
import { getActiveEntitlement, verifyFacultyAssistantRequest } from '@/lib/server/faculty-assistant-auth'

export async function GET(request: NextRequest) {
  const identity = verifyFacultyAssistantRequest(request, 'profile:read')
  if (!identity) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const entitlement = await getActiveEntitlement(
    identity.moodleUserId,
    identity.moodleInstance,
  )
  if (!entitlement || entitlement.id !== identity.entitlementId) {
    return NextResponse.json({ error: 'licence_inactive' }, { status: 403 })
  }
  return NextResponse.json({
    user: {
      id: identity.moodleUserId,
      moodleInstance: identity.moodleInstance,
      email: identity.email,
      name: identity.name,
    },
    licence: { plan: entitlement.plan, expiresAt: entitlement.expires_at, features: entitlement.features },
  })
}

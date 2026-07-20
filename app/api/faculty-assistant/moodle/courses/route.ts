import { NextRequest, NextResponse } from 'next/server'
import { getActiveEntitlement, verifyFacultyAssistantRequest, writeFacultyAssistantAudit } from '@/lib/server/faculty-assistant-auth'
import { getFacultyAssistantTeachingCourses } from '@/lib/server/faculty-assistant-moodle'

export async function GET(request: NextRequest) {
  const identity = verifyFacultyAssistantRequest(request, 'courses:read')
  if (!identity) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const entitlement = await getActiveEntitlement(
    identity.moodleUserId,
    identity.moodleInstance,
  )
  if (!entitlement || entitlement.id !== identity.entitlementId) {
    return NextResponse.json({ error: 'licence_inactive' }, { status: 403 })
  }
  try {
    const courses = await getFacultyAssistantTeachingCourses(identity.moodleUserId)
    await writeFacultyAssistantAudit('moodle.courses.read', 'success', {
      moodleUserId: identity.moodleUserId,
      moodleInstance: identity.moodleInstance,
      details: { count: Array.isArray(courses) ? courses.length : 0 },
    })
    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Faculty Assistant Moodle course sync failed:', error)
    await writeFacultyAssistantAudit('moodle.courses.read', 'failed', {
      moodleUserId: identity.moodleUserId,
      moodleInstance: identity.moodleInstance,
    })
    return NextResponse.json({ error: 'moodle_unavailable' }, { status: 502 })
  }
}

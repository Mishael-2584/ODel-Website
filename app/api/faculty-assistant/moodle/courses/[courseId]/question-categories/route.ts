import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveEntitlement,
  verifyFacultyAssistantRequest,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import { getFacultyAssistantQuestionCategories } from '@/lib/server/faculty-assistant-moodle'

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const identity = verifyFacultyAssistantRequest(request, 'questions:write')
  if (!identity) return NextResponse.json({ error: 'publishing_not_authorized' }, { status: 401 })
  const entitlement = await getActiveEntitlement(identity.moodleUserId, identity.moodleInstance)
  if (!entitlement || entitlement.id !== identity.entitlementId || !entitlement.features?.includes('questions:write')) {
    return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
  }
  const courseId = Number(params.courseId)
  if (!Number.isSafeInteger(courseId) || courseId <= 0) {
    return NextResponse.json({ error: 'invalid_course' }, { status: 400 })
  }

  try {
    const categories = await getFacultyAssistantQuestionCategories(identity.moodleUserId, courseId)
    await writeFacultyAssistantAudit('moodle.question_categories.read', 'success', {
      moodleUserId: identity.moodleUserId,
      moodleInstance: identity.moodleInstance,
      resourceType: 'course',
      resourceId: String(courseId),
      details: { count: categories.length },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Faculty Assistant question category sync failed:', error)
    return NextResponse.json({ error: 'moodle_categories_unavailable' }, { status: 502 })
  }
}

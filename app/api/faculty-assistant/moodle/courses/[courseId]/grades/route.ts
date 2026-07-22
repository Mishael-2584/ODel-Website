import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveEntitlement,
  verifyFacultyAssistantRequest,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import { getFacultyAssistantCourseGrades } from '@/lib/server/faculty-assistant-moodle'

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const identity = verifyFacultyAssistantRequest(request, 'grades:read')
  if (!identity) {
    return NextResponse.json({ error: 'grade_sync_not_authorized' }, { status: 401 })
  }
  const entitlement = await getActiveEntitlement(identity.moodleUserId, identity.moodleInstance)
  if (
    !entitlement ||
    entitlement.id !== identity.entitlementId ||
    !entitlement.features?.includes('grades:read')
  ) {
    return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
  }
  const courseId = Number(params.courseId)
  if (!Number.isSafeInteger(courseId) || courseId <= 0) {
    return NextResponse.json({ error: 'invalid_course' }, { status: 400 })
  }

  try {
    const gradebook = await getFacultyAssistantCourseGrades(identity.moodleUserId, courseId)
    await writeFacultyAssistantAudit('moodle.grades.read', 'success', {
      moodleUserId: identity.moodleUserId,
      moodleInstance: identity.moodleInstance,
      resourceType: 'course',
      resourceId: String(courseId),
      details: {
        students: gradebook.rows.length,
        columns: gradebook.columns.length,
        missingStudentIds: gradebook.warnings.missingStudentIds,
      },
    })
    return NextResponse.json(gradebook)
  } catch (error) {
    console.error('Faculty Assistant Moodle grade sync failed:', error)
    await writeFacultyAssistantAudit('moodle.grades.read', 'failed', {
      moodleUserId: identity.moodleUserId,
      moodleInstance: identity.moodleInstance,
      resourceType: 'course',
      resourceId: String(courseId),
    })
    return NextResponse.json({ error: 'moodle_grades_unavailable' }, { status: 502 })
  }
}

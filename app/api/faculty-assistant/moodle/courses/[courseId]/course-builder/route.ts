import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveEntitlement,
  verifyFacultyAssistantRequest,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import {
  getFacultyAssistantCourseBuilder,
  MoodleConnectorTimeoutError,
  publishFacultyAssistantCourseBuilder,
} from '@/lib/server/faculty-assistant-moodle'

const feature = 'coursebuilder:write'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> },
) {
  const authorization = await authorize(request)
  if ('response' in authorization) return authorization.response
  const courseId = courseIdentifier((await context.params).courseId)
  if (!courseId) return NextResponse.json({ error: 'invalid_course_id' }, { status: 400 })
  try {
    const builder = await getFacultyAssistantCourseBuilder(authorization.identity.moodleUserId, courseId)
    await audit(authorization.identity, courseId, 'moodle.coursebuilder.read', 'success', {
      revision: builder.revision,
    })
    return NextResponse.json({ builder })
  } catch (error) {
    console.error('Faculty Assistant Course Builder load failed:', error)
    const timedOut = error instanceof MoodleConnectorTimeoutError
    await audit(authorization.identity, courseId, 'moodle.coursebuilder.read', 'failed', {
      reason: timedOut ? 'moodle_timeout' : 'connector_error',
    })
    return NextResponse.json({
      error: timedOut ? 'course_builder_timeout' : 'course_builder_unavailable',
      error_description: timedOut
        ? 'Moodle did not return the Course Builder revision in time.'
        : 'The Course Builder could not be read from Moodle. Verify the installed block, external-service functions and service-role capability.',
    }, { status: timedOut ? 504 : 502 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> },
) {
  const authorization = await authorize(request)
  if ('response' in authorization) return authorization.response
  const courseId = courseIdentifier((await context.params).courseId)
  if (!courseId) return NextResponse.json({ error: 'invalid_course_id' }, { status: 400 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const expectedRevision = Number(body?.expectedRevision)
  const payload = body?.payload
  if (
    !Number.isSafeInteger(expectedRevision) || expectedRevision < 0 ||
    !payload || typeof payload !== 'object' || Array.isArray(payload) ||
    Buffer.byteLength(JSON.stringify(payload), 'utf8') > 5_000_000
  ) {
    return NextResponse.json({ error: 'invalid_course_builder_payload' }, { status: 400 })
  }
  try {
    const result = await publishFacultyAssistantCourseBuilder({
      userId: authorization.identity.moodleUserId,
      courseId,
      expectedRevision,
      payload: payload as Record<string, unknown>,
    })
    if (!result.success) {
      const status = result.code === 'revision_conflict' ? 409 : 400
      await audit(authorization.identity, courseId, 'moodle.coursebuilder.publish', 'failed', {
        code: result.code,
        revision: result.revision,
      })
      return NextResponse.json({ error: result.code || 'course_builder_rejected', result }, { status })
    }
    await audit(authorization.identity, courseId, 'moodle.coursebuilder.publish', 'success', {
      revision: result.revision,
      contentHash: result.contentHash,
    })
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Faculty Assistant Course Builder publish failed:', error)
    await audit(authorization.identity, courseId, 'moodle.coursebuilder.publish', 'failed')
    return NextResponse.json({ error: 'course_builder_unavailable' }, { status: 502 })
  }
}

async function authorize(request: NextRequest) {
  const identity = verifyFacultyAssistantRequest(request, feature)
  if (!identity) {
    return { response: NextResponse.json({ error: 'publishing_not_authorized' }, { status: 401 }) }
  }
  const entitlement = await getActiveEntitlement(identity.moodleUserId, identity.moodleInstance, [feature])
  if (!entitlement || entitlement.id !== identity.entitlementId) {
    return { response: NextResponse.json({ error: 'upgrade_required' }, { status: 403 }) }
  }
  return { identity }
}

function courseIdentifier(value: string) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 1 ? id : 0
}

async function audit(
  identity: { moodleUserId: number; moodleInstance: string },
  courseId: number,
  action: string,
  outcome: 'success' | 'failed',
  details: Record<string, unknown> = {},
) {
  await writeFacultyAssistantAudit(action, outcome, {
    moodleUserId: identity.moodleUserId,
    moodleInstance: identity.moodleInstance,
    resourceType: 'course',
    resourceId: String(courseId),
    details,
  })
}

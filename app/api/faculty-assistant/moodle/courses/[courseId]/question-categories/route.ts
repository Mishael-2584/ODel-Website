import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveEntitlement,
  type FacultyAssistantIdentity,
  verifyFacultyAssistantRequest,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import {
  createFacultyAssistantQuestionCategory,
  getFacultyAssistantQuestionCategories,
} from '@/lib/server/faculty-assistant-moodle'

type PublishingAuthorization =
  | { identity: FacultyAssistantIdentity }
  | { response: NextResponse }

async function authorize(request: NextRequest): Promise<PublishingAuthorization> {
  const identity = verifyFacultyAssistantRequest(request, 'questions:write')
  if (!identity) {
    return {
      response: NextResponse.json({ error: 'publishing_not_authorized' }, { status: 401 }),
    }
  }
  const entitlement = await getActiveEntitlement(identity.moodleUserId, identity.moodleInstance)
  if (!entitlement || entitlement.id !== identity.entitlementId || !entitlement.features?.includes('questions:write')) {
    return {
      response: NextResponse.json({ error: 'upgrade_required' }, { status: 403 }),
    }
  }
  return { identity }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const authorization = await authorize(request)
  if ('response' in authorization) return authorization.response
  const { identity } = authorization
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

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const authorization = await authorize(request)
  if ('response' in authorization) return authorization.response
  const { identity } = authorization
  const courseId = Number(params.courseId)
  const body = (await request.json().catch(() => null)) as { name?: unknown } | null
  const name = String(body?.name || '').trim()
  if (!Number.isSafeInteger(courseId) || courseId <= 0) {
    return NextResponse.json({ error: 'invalid_course' }, { status: 400 })
  }
  if (!name || name.length > 120) {
    return NextResponse.json({ error: 'invalid_category_name' }, { status: 400 })
  }

  try {
    const category = await createFacultyAssistantQuestionCategory({
      userId: identity.moodleUserId,
      courseId,
      name,
    })
    await writeFacultyAssistantAudit('moodle.question_category.create', 'success', {
      moodleUserId: identity.moodleUserId,
      moodleInstance: identity.moodleInstance,
      resourceType: 'course',
      resourceId: String(courseId),
      details: { categoryId: category.id, name: category.name, created: category.created },
    })
    return NextResponse.json({ category })
  } catch (error) {
    console.error('Faculty Assistant question category creation failed:', error)
    return NextResponse.json({ error: 'moodle_category_creation_failed' }, { status: 502 })
  }
}

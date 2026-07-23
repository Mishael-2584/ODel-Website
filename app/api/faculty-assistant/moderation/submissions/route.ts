import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveEntitlement,
  verifyFacultyAssistantRequest,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import { getFacultyAssistantTeachingCourses } from '@/lib/server/faculty-assistant-moodle'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

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
  if (!entitlement.institution_licence_id) {
    return NextResponse.json({
      policy: { mode: 'disabled', institutionLicenceId: null },
      submissions: [],
    })
  }

  const courseId = Number(request.nextUrl.searchParams.get('courseId') || 0)
  if (courseId && (!Number.isSafeInteger(courseId) || courseId <= 0)) {
    return NextResponse.json({ error: 'invalid_course' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const [settings, institution] = await Promise.all([
    supabase
      .from('faculty_assistant_moderation_settings')
      .select('mode, retention_days')
      .eq('institution_licence_id', entitlement.institution_licence_id)
      .maybeSingle(),
    supabase
      .from('faculty_assistant_institution_licences')
      .select('institution_name')
      .eq('id', entitlement.institution_licence_id)
      .maybeSingle(),
  ])
  if (settings.error || institution.error) {
    return NextResponse.json({ error: 'moderation_policy_unavailable' }, { status: 500 })
  }

  let submissionsQuery = supabase
    .from('faculty_assistant_moderation_submissions')
    .select(`
      id,
      local_version_id,
      version_number,
      version_checksum,
      status,
      decision_note,
      decided_at,
      approval_receipt,
      submitted_at,
      updated_at,
      faculty_assistant_moderators(full_name)
    `)
    .eq('institution_licence_id', entitlement.institution_licence_id)
    .eq('entitlement_id', entitlement.id)
    .order('version_number', { ascending: false })
  if (courseId) submissionsQuery = submissionsQuery.eq('moodle_course_id', courseId)
  const { data: submissions, error } = await submissionsQuery.limit(100)
  if (error) {
    return NextResponse.json({ error: 'moderation_submissions_unavailable' }, { status: 500 })
  }

  return NextResponse.json({
    policy: {
      mode: settings.data?.mode || 'optional',
      retentionDays: settings.data?.retention_days || 2555,
      institutionLicenceId: entitlement.institution_licence_id,
      institutionName: institution.data?.institution_name || 'Institution',
    },
    submissions: (submissions || []).map((submission) => ({
      id: submission.id,
      localVersionId: submission.local_version_id,
      versionNumber: submission.version_number,
      versionChecksum: submission.version_checksum,
      status: submission.status,
      decisionNote: submission.decision_note,
      decidedAt: submission.decided_at,
      approvalReceipt: submission.approval_receipt,
      submittedAt: submission.submitted_at,
      updatedAt: submission.updated_at,
      moderatorName: relationName(submission.faculty_assistant_moderators),
    })),
  })
}

export async function POST(request: NextRequest) {
  const identity = verifyFacultyAssistantRequest(request, 'grades:read')
  if (!identity) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const entitlement = await getActiveEntitlement(
    identity.moodleUserId,
    identity.moodleInstance,
    ['grades:read'],
  )
  if (
    !entitlement ||
    entitlement.id !== identity.entitlementId ||
    !entitlement.institution_licence_id
  ) {
    return NextResponse.json({ error: 'institution_moderation_required' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const courseId = Number(body.courseId)
  const localVersionId = String(body.localVersionId || '')
  const versionNumber = Number(body.versionNumber)
  const versionChecksum = String(body.versionChecksum || '').toLowerCase()
  const createdAt = String(body.createdAt || '')
  const submittedBy = String(body.submittedBy || '').trim()
  const submissionNote = String(body.submissionNote || '').trim()
  const previousVersionChecksum = body.previousVersionChecksum
    ? String(body.previousVersionChecksum).toLowerCase()
    : undefined
  const snapshot = body.snapshot
  if (
    !Number.isSafeInteger(courseId) ||
    courseId <= 0 ||
    !localVersionId ||
    !Number.isInteger(versionNumber) ||
    versionNumber <= 0 ||
    !/^[a-f0-9]{64}$/.test(versionChecksum) ||
    !snapshot ||
    typeof snapshot !== 'object' ||
    Array.isArray(snapshot)
  ) {
    return NextResponse.json({ error: 'invalid_moderation_submission' }, { status: 400 })
  }
  const payloadBytes = Buffer.byteLength(JSON.stringify(snapshot), 'utf8')
  if (payloadBytes > 5_000_000) {
    return NextResponse.json({ error: 'moderation_submission_too_large' }, { status: 413 })
  }
  const calculatedChecksum = crypto
    .createHash('sha256')
    .update(canonicalStringify({
      id: localVersionId,
      versionNumber,
      createdAt,
      submittedBy,
      submissionNote,
      previousVersionChecksum,
      snapshot,
    }))
    .digest('hex')
  if (calculatedChecksum !== versionChecksum) {
    return NextResponse.json({ error: 'moderation_checksum_mismatch' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: setting, error: settingError } = await supabase
    .from('faculty_assistant_moderation_settings')
    .select('mode')
    .eq('institution_licence_id', entitlement.institution_licence_id)
    .maybeSingle()
  if (settingError) {
    return NextResponse.json({ error: 'moderation_policy_unavailable' }, { status: 500 })
  }
  if (setting?.mode === 'disabled') {
    return NextResponse.json({ error: 'moderation_disabled' }, { status: 409 })
  }

  let courses: Awaited<ReturnType<typeof getFacultyAssistantTeachingCourses>>
  try {
    courses = await getFacultyAssistantTeachingCourses(identity.moodleUserId)
  } catch (error) {
    console.error('Moderation course authorization check failed:', error)
    return NextResponse.json({ error: 'moodle_courses_unavailable' }, { status: 502 })
  }
  const course = courses.find((item) => Number(item.id) === courseId)
  if (!course) {
    return NextResponse.json({ error: 'course_not_authorized' }, { status: 403 })
  }
  const metadata = snapshot.metadata && typeof snapshot.metadata === 'object'
    ? snapshot.metadata as Record<string, unknown>
    : {}
  const configuration =
    snapshot.icampusConfiguration && typeof snapshot.icampusConfiguration === 'object'
      ? snapshot.icampusConfiguration as Record<string, unknown>
      : {}

  const { data: submission, error } = await supabase
    .from('faculty_assistant_moderation_submissions')
    .upsert({
      institution_licence_id: entitlement.institution_licence_id,
      entitlement_id: entitlement.id,
      moodle_instance: identity.moodleInstance,
      moodle_user_id: identity.moodleUserId,
      lecturer_email: identity.email,
      lecturer_name: identity.name,
      moodle_course_id: courseId,
      course_code: String(metadata.courseCode || course.shortname || ''),
      course_title: String(metadata.courseTitle || course.fullname || ''),
      academic_period: String(metadata.semester || ''),
      school_name: String(configuration.schoolName || ''),
      local_version_id: localVersionId,
      version_number: versionNumber,
      version_checksum: versionChecksum,
      previous_version_checksum: previousVersionChecksum || null,
      snapshot,
      status: 'submitted',
      decision_note: '',
      decided_by: null,
      decided_at: null,
      approval_receipt: null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'institution_licence_id,entitlement_id,moodle_course_id,local_version_id',
      ignoreDuplicates: false,
    })
    .select('id, status, submitted_at')
    .single()
  if (error || !submission) {
    console.error('Moderation submission failed:', error)
    return NextResponse.json({ error: 'moderation_submission_failed' }, { status: 500 })
  }

  await writeFacultyAssistantAudit('moderation.submitted', 'success', {
    moodleUserId: identity.moodleUserId,
    moodleInstance: identity.moodleInstance,
    resourceType: 'moderation_submission',
    resourceId: submission.id,
    details: {
      institutionLicenceId: entitlement.institution_licence_id,
      courseId,
      courseCode: String(metadata.courseCode || course.shortname || ''),
      versionNumber,
      versionChecksum,
    },
  })
  return NextResponse.json({
    submission: {
      id: submission.id,
      status: submission.status,
      submittedAt: submission.submitted_at,
    },
  }, { status: 201 })
}

function canonicalStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalStringify(item)).join(',')}]`
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
  return `{${entries.map(([key, item]) =>
    `${JSON.stringify(key)}:${canonicalStringify(item)}`).join(',')}}`
}

function relationName(value: unknown) {
  const relation = Array.isArray(value) ? value[0] : value
  if (!relation || typeof relation !== 'object') return ''
  return String((relation as { full_name?: string }).full_name || '')
}

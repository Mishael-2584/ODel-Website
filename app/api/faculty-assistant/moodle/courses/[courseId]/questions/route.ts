import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveEntitlement,
  verifyFacultyAssistantRequest,
  writeFacultyAssistantAudit,
} from '@/lib/server/faculty-assistant-auth'
import { importFacultyAssistantGiftQuestions } from '@/lib/server/faculty-assistant-moodle'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

const maxGiftBytes = 1_000_000

export async function POST(
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
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const categoryId = Number(body?.categoryId)
  const gift = typeof body?.gift === 'string' ? body.gift : ''
  const idempotencyKey = typeof body?.idempotencyKey === 'string' ? body.idempotencyKey : ''
  if (
    !Number.isSafeInteger(courseId) || courseId <= 0 ||
    !Number.isSafeInteger(categoryId) || categoryId <= 0 ||
    !gift.trim() || Buffer.byteLength(gift, 'utf8') > maxGiftBytes ||
    !/^[A-Za-z0-9._~-]{16,128}$/.test(idempotencyKey)
  ) {
    return NextResponse.json({ error: 'invalid_publish_request' }, { status: 400 })
  }

  const payloadHash = crypto
    .createHash('sha256')
    .update(`${courseId}\n${categoryId}\n${gift}`)
    .digest('hex')
  const supabase = getSupabaseAdmin()
  const { data: existing } = await supabase
    .from('faculty_assistant_publish_jobs')
    .select('payload_hash, status, result')
    .eq('entitlement_id', entitlement.id)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle()
  if (existing) {
    if (existing.payload_hash !== payloadHash) {
      return NextResponse.json({ error: 'idempotency_key_reused' }, { status: 409 })
    }
    if (existing.status === 'succeeded') {
      return NextResponse.json({ ...(existing.result as object), replayed: true })
    }
    return NextResponse.json({ error: 'publish_already_processing' }, { status: 409 })
  }

  const { data: job, error: insertError } = await supabase
    .from('faculty_assistant_publish_jobs')
    .insert({
      entitlement_id: entitlement.id,
      idempotency_key: idempotencyKey,
      payload_hash: payloadHash,
      moodle_instance: identity.moodleInstance,
      moodle_user_id: identity.moodleUserId,
      course_id: courseId,
      category_id: categoryId,
    })
    .select('id')
    .single()
  if (insertError || !job) {
    return NextResponse.json({ error: 'publish_request_conflict' }, { status: 409 })
  }

  try {
    const result = await importFacultyAssistantGiftQuestions({
      userId: identity.moodleUserId,
      courseId,
      categoryId,
      gift,
    }) as Record<string, unknown>
    await supabase
      .from('faculty_assistant_publish_jobs')
      .update({ status: 'succeeded', result, completed_at: new Date().toISOString() })
      .eq('id', job.id)
    await writeFacultyAssistantAudit('moodle.questions.publish', 'success', {
      moodleUserId: identity.moodleUserId,
      moodleInstance: identity.moodleInstance,
      resourceType: 'course',
      resourceId: String(courseId),
      details: { categoryId, imported: result.imported, publishJobId: job.id },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Moodle publishing failed'
    await supabase
      .from('faculty_assistant_publish_jobs')
      .update({ status: 'failed', error: message.slice(0, 1000), completed_at: new Date().toISOString() })
      .eq('id', job.id)
    await writeFacultyAssistantAudit('moodle.questions.publish', 'failed', {
      moodleUserId: identity.moodleUserId,
      moodleInstance: identity.moodleInstance,
      resourceType: 'course',
      resourceId: String(courseId),
      details: { categoryId, publishJobId: job.id },
    })
    console.error('Faculty Assistant Moodle question publish failed:', error)
    return NextResponse.json({ error: 'moodle_publish_failed' }, { status: 502 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveEntitlement,
  verifyFacultyAssistantRequest,
} from '@/lib/server/faculty-assistant-auth'
import { uploadFacultyAssistantCourseBuilderAsset } from '@/lib/server/faculty-assistant-moodle'

const feature = 'coursebuilder:write'
const allowedMimeTypes = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp'])

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> },
) {
  const identity = verifyFacultyAssistantRequest(request, feature)
  if (!identity) {
    return NextResponse.json({ error: 'publishing_not_authorized' }, { status: 401 })
  }
  const entitlement = await getActiveEntitlement(identity.moodleUserId, identity.moodleInstance, [feature])
  if (!entitlement || entitlement.id !== identity.entitlementId) {
    return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
  }
  const courseId = Number((await context.params).courseId)
  if (!Number.isSafeInteger(courseId) || courseId <= 1) {
    return NextResponse.json({ error: 'invalid_course_id' }, { status: 400 })
  }
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const asset = body?.asset && typeof body.asset === 'object' && !Array.isArray(body.asset)
    ? body.asset as Record<string, unknown>
    : null
  const itemId = Number(body?.itemId || 0)
  const id = String(asset?.id || '').trim().toLowerCase()
  const filename = String(asset?.filename || '').trim()
  const mimeType = String(asset?.mimeType || '').trim().toLowerCase()
  const encoded = String(asset?.dataBase64 || '')
  if (
    !asset ||
    !Number.isSafeInteger(itemId) || itemId < 0 ||
    !/^[a-f0-9]{16,64}$/.test(id) ||
    filename !== `${id}.${mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1]}` ||
    !allowedMimeTypes.has(mimeType) ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)
  ) {
    return NextResponse.json({ error: 'invalid_course_builder_asset' }, { status: 400 })
  }
  const bytes = Buffer.from(encoded, 'base64')
  if (!bytes.length || bytes.length > 2_000_000 || !matchesImageSignature(bytes, mimeType)) {
    return NextResponse.json({ error: 'invalid_course_builder_asset' }, { status: 400 })
  }
  try {
    const uploaded = await uploadFacultyAssistantCourseBuilderAsset({
      itemId,
      filename,
      mimeType,
      bytes: new Uint8Array(bytes),
    })
    return NextResponse.json(uploaded)
  } catch (error) {
    console.error('Faculty Assistant Course Builder media upload failed:', error)
    return NextResponse.json({
      error: 'course_builder_media_upload_failed',
      error_description: 'Moodle could not accept the module image. Confirm that file uploads are enabled for the Faculty Assistant external service.',
    }, { status: 502 })
  }
}

function matchesImageSignature(bytes: Buffer, mimeType: string) {
  if (mimeType === 'image/png') {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  }
  if (mimeType === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (mimeType === 'image/gif') return bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))
  return bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
}

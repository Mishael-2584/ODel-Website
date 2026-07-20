import { NextRequest, NextResponse } from 'next/server'
import { moodleService } from '@/lib/moodle'
import { requireOdelSession } from '@/lib/server/odel-session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await requireOdelSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const moodleBaseUrl = process.env.NEXT_PUBLIC_MOODLE_URL || ''
    const requestedTarget = searchParams.get('target') || moodleBaseUrl
    const target = isTrustedMoodleTarget(requestedTarget, moodleBaseUrl)
      ? requestedTarget
      : moodleBaseUrl

    const loginUrl = await moodleService.generateMoodleLoginUrl(
      session.moodleUserId,
      session.moodleUsername,
      target,
    )
    if (!loginUrl) {
      return NextResponse.redirect(target, { status: 302 })
    }

    return NextResponse.redirect(loginUrl, { status: 302 })
  } catch (e) {
    console.error('sso-launch error', e)
    return NextResponse.redirect(process.env.NEXT_PUBLIC_MOODLE_URL || '/', { status: 302 })
  }
}

function isTrustedMoodleTarget(target: string, moodleBaseUrl: string) {
  try {
    return Boolean(moodleBaseUrl) && new URL(target).origin === new URL(moodleBaseUrl).origin
  } catch {
    return false
  }
}



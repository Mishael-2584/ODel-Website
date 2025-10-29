import { NextRequest, NextResponse } from 'next/server'
import { moodleService } from '@/lib/moodle'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const username = searchParams.get('username') || ''
    const target = searchParams.get('target') || process.env.NEXT_PUBLIC_MOODLE_URL || ''

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const loginUrl = await moodleService.generateMoodleLoginUrl(parseInt(userId), username, target)
    if (!loginUrl) {
      return NextResponse.redirect(target, { status: 302 })
    }

    return NextResponse.redirect(loginUrl, { status: 302 })
  } catch (e) {
    console.error('sso-launch error', e)
    return NextResponse.redirect(process.env.NEXT_PUBLIC_MOODLE_URL || '/', { status: 302 })
  }
}



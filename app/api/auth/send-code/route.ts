import { NextRequest, NextResponse } from 'next/server'
import { moodleService } from '@/lib/moodle'
import { createMagicCode, sendMagicCodeEmail } from '@/lib/passwordless-auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Verify email exists in Moodle
    const moodleUser = await moodleService.getUserByEmail(email)
    if (!moodleUser) {
      return NextResponse.json(
        { success: false, error: 'Email not found in our system' },
        { status: 404 }
      )
    }

    // Create magic code
    const codeResult = await createMagicCode(email, moodleUser.id)
    if (!codeResult.success) {
      return NextResponse.json(
        { success: false, error: codeResult.error },
        { status: 500 }
      )
    }

    // Send email
    const emailResult = await sendMagicCodeEmail(
      email,
      codeResult.code!,
      `${moodleUser.firstname} ${moodleUser.lastname}`
    )

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Code sent to your email',
      email
    })
  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send code' },
      { status: 500 }
    )
  }
}

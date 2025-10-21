import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicCode, createStudentSession } from '@/lib/passwordless-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Verify magic code
    const verifyResult = await verifyMagicCode(email, code)
    if (!verifyResult.success) {
      return NextResponse.json(
        { success: false, error: verifyResult.error },
        { status: 401 }
      )
    }

    // Create student session
    const userAgent = request.headers.get('user-agent') || ''
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'

    const sessionResult = await createStudentSession(
      email,
      verifyResult.moodleUserId!,
      ipAddress,
      userAgent
    )

    if (!sessionResult.success) {
      return NextResponse.json(
        { success: false, error: sessionResult.error },
        { status: 500 }
      )
    }

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      token: sessionResult.token,
      sessionId: sessionResult.sessionId,
      message: 'Successfully logged in'
    })

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'odel_auth',
      value: sessionResult.token!,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}

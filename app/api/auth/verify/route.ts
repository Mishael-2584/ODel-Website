import { NextRequest, NextResponse } from 'next/server'
import { verifyJWTToken, getStudentSession } from '@/lib/passwordless-auth'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('odel_auth')?.value || 
                 request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = verifyJWTToken(token)
    if (!decoded) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get session from database
    const sessionResult = await getStudentSession(token)
    if (!sessionResult.success) {
      return NextResponse.json(
        { authenticated: false, error: sessionResult.error },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: decoded.email,
        studentName: decoded.studentName,
        moodleUsername: decoded.moodleUsername,
        moodleUserId: decoded.moodleUserId
      },
      session: {
        createdAt: sessionResult.session.created_at,
        expiresAt: sessionResult.session.expires_at,
        lastActivity: sessionResult.session.last_activity
      }
    })
  } catch (error) {
    console.error('Auth verify error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Failed to verify session' },
      { status: 500 }
    )
  }
}

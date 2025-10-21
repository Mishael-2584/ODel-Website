import { NextRequest, NextResponse } from 'next/server'
import { 
  findAdminByEmail, 
  verifyPassword, 
  createAdminSession,
  createAuditLog 
} from '@/lib/admin-auth'
import { generateAdminJWTToken } from '@/lib/passwordless-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find admin by email
    const admin = await findAdminByEmail(email)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(password, admin.password_hash)
    if (!passwordValid) {
      // Log failed attempt
      await createAuditLog(
        admin.id,
        'login_failed',
        'admin',
        admin.id,
        { reason: 'invalid_password' },
        request.headers.get('x-forwarded-for') || 'unknown'
      )

      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const jwtToken = generateAdminJWTToken({
      adminId: admin.id,
      email: admin.email,
      fullName: admin.full_name,
      role: admin.role
    })

    // Create session
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    const sessionResult = await createAdminSession(
      admin.id,
      jwtToken,
      ipAddress,
      userAgent
    )

    if (!sessionResult.success) {
      return NextResponse.json(
        { success: false, error: sessionResult.error },
        { status: 500 }
      )
    }

    // Log successful login
    await createAuditLog(
      admin.id,
      'login_success',
      'admin',
      admin.id,
      { sessionId: sessionResult.sessionId },
      ipAddress
    )

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      token: jwtToken,
      sessionId: sessionResult.sessionId,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role
      },
      message: 'Successfully logged in'
    })

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'odel_admin_auth',
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to login' },
      { status: 500 }
    )
  }
}

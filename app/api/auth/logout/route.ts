import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('odel_auth')?.value || 
                 request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 400 }
      )
    }

    // Find and mark session as inactive
    const { data, error } = await supabase
      .from('student_sessions')
      .update({ is_active: false })
      .eq('jwt_token', token)

    if (error) {
      console.error('Error clearing session:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to logout' },
        { status: 500 }
      )
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Successfully logged out'
    })

    // Clear cookie
    response.cookies.set({
      name: 'odel_auth',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    )
  }
}

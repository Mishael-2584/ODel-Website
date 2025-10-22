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
      // No token, just clear the cookie
      const response = NextResponse.json({
        success: true,
        message: 'Already logged out'
      })

      response.cookies.delete('odel_auth')
      return response
    }

    console.log('🔐 Logging out user - invalidating session')

    // Find and mark session as inactive
    const { data, error } = await supabase
      .from('student_sessions')
      .update({ 
        is_active: false,
        last_activity: new Date().toISOString()
      })
      .eq('jwt_token', token)
      .select()

    if (error) {
      console.error('❌ Error invalidating session:', error)
      // Still clear cookie even if DB update fails
    } else {
      console.log('✅ Session invalidated in database:', data?.length, 'session(s) updated')
    }

    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: 'Successfully logged out and session invalidated'
    })

    // Clear the auth cookie completely
    response.cookies.set({
      name: 'odel_auth',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,  // This immediately expires the cookie
      path: '/'   // Ensure it's cleared across all paths
    })

    console.log('🔐 Auth cookie cleared from response')

    return response
  } catch (error) {
    console.error('❌ Logout error:', error)
    
    // Even on error, clear the cookie to be safe
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Failed to logout completely, but cookie cleared',
        message: 'Please refresh the page'
      },
      { status: 500 }
    )

    response.cookies.set({
      name: 'odel_auth',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  }
}

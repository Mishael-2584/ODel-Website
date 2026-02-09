import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admin users:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch admin users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: users || []
    })
  } catch (error: any) {
    console.error('Error in admin/users API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

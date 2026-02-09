import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'Admin ID is required' },
        { status: 400 }
      )
    }

    const { data: counselor, error } = await supabase
      .from('counselors')
      .select('id')
      .eq('admin_user_id', adminId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No counselor found for this admin
        return NextResponse.json({
          success: true,
          counselorId: null
        })
      }
      console.error('Error fetching counselor:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch counselor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      counselorId: counselor?.id || null
    })
  } catch (error: any) {
    console.error('Error in my-counselor-id API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

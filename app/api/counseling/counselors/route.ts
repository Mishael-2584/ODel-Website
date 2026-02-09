import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { data: counselors, error } = await supabase
      .from('counselors')
      .select('id, name, email, phone, gender, specialization, bio, is_active')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching counselors:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch counselors' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      counselors: counselors || []
    })
  } catch (error: any) {
    console.error('Error in counselors API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

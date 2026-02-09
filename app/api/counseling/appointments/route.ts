import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    // Get admin ID from token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Build query
    let query = supabase
      .from('counseling_appointments')
      .select(`
        *,
        counselors (
          id,
          name,
          email
        )
      `)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: appointments, error } = await query

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    // Format appointments with counselor name
    const formattedAppointments = (appointments || []).map((apt: any) => ({
      ...apt,
      counselor_name: apt.counselors?.name || 'Unknown'
    }))

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments
    })
  } catch (error: any) {
    console.error('Error in appointments API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Get admin ID from token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get appointment details before deleting (for email notification)
    const { data: appointment, error: fetchError } = await supabase
      .from('counseling_appointments')
      .select(`
        *,
        counselors (
          name,
          email,
          phone
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Delete the appointment
    const { error: deleteError } = await supabase
      .from('counseling_appointments')
      .delete()
      .eq('id', appointmentId)

    if (deleteError) {
      console.error('Error deleting appointment:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete appointment' },
        { status: 500 }
      )
    }

    // Send deletion email to student (optional - you might want to skip this)
    // Uncomment if you want to notify students when appointments are deleted
    /*
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/counseling/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointmentId,
          type: 'deletion',
          appointment: appointment // Pass appointment data since it's deleted
        })
      })
    } catch (emailError) {
      console.error('📧 Error sending deletion email:', emailError)
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    })
  } catch (error: any) {
    console.error('Error in delete API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

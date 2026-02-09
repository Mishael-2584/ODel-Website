import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, reason } = await request.json()

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Cancellation reason is required' },
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

    // Update appointment status
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('counseling_appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_reason: reason,
      })
      .eq('id', appointmentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error cancelling appointment:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to cancel appointment' },
        { status: 500 }
      )
    }

    // Send cancellation email to student
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/counseling/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointmentId,
          type: 'cancellation'
        })
      })
    } catch (emailError) {
      console.warn('Failed to send cancellation email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: 'Appointment cancelled successfully'
    })
  } catch (error: any) {
    console.error('Error in cancel API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

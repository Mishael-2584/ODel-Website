import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, newDate, newTime, reason } = await request.json()

    if (!appointmentId || !newDate || !newTime) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID, new date, and new time are required' },
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

    // Get current appointment details
    const { data: appointment, error: aptError } = await supabase
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

    if (aptError || !appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if new time slot is available
    const { data: conflictingAppointments } = await supabase
      .from('counseling_appointments')
      .select('id')
      .eq('counselor_id', appointment.counselor_id)
      .eq('appointment_date', newDate)
      .eq('appointment_time', newTime)
      .in('status', ['pending', 'confirmed'])
      .neq('id', appointmentId)

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return NextResponse.json(
        { success: false, error: 'The selected time slot is already booked' },
        { status: 400 }
      )
    }

    // Update appointment
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('counseling_appointments')
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
        status: 'pending', // Reset to pending so counselor can reconfirm
        zoom_meeting_id: null,
        zoom_meeting_url: null,
        zoom_start_url: null,
        confirmed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select(`
        *,
        counselors (
          name,
          email,
          phone
        )
      `)
      .single()

    if (updateError) {
      console.error('Error rescheduling appointment:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to reschedule appointment' },
        { status: 500 }
      )
    }

    // Send reschedule email to student (with updated appointment data)
    try {
      // Fetch the updated appointment to get new date/time
      const { data: finalAppointment } = await supabase
        .from('counseling_appointments')
        .select('appointment_date, appointment_time')
        .eq('id', appointmentId)
        .single()

      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/counseling/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointmentId,
          type: 'reschedule',
          reason: reason || 'Appointment rescheduled by counselor',
          newDate: finalAppointment?.appointment_date || newDate,
          newTime: finalAppointment?.appointment_time || newTime
        })
      })

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('📧 Reschedule email sent successfully:', emailResult)
      } else {
        console.warn('📧 Reschedule email sending failed:', await emailResponse.text())
      }
    } catch (emailError) {
      console.error('📧 Error sending reschedule email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: 'Appointment rescheduled successfully'
    })
  } catch (error: any) {
    console.error('Error in reschedule API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json()

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

    // Get admin user from token (simplified - in production, verify JWT properly)
    const adminData = authHeader.replace('Bearer ', '')
    // For now, we'll get the admin from the appointment's counselor
    const { data: appointment, error: aptError } = await supabase
      .from('counseling_appointments')
      .select('counselor_id, counselors(admin_user_id)')
      .eq('id', appointmentId)
      .single()

    if (aptError || !appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Create Zoom meeting (if Zoom API is configured)
    let zoomMeetingId = null
    let zoomMeetingUrl = null
    let zoomStartUrl = null

    try {
      const zoomResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/zoom/create-meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Counseling Session',
          startTime: `${appointment.appointment_date}T${appointment.appointment_time}:00`,
          duration: 60, // 1 hour
        })
      })

      if (zoomResponse.ok) {
        const zoomData = await zoomResponse.json()
        if (zoomData.success) {
          zoomMeetingId = zoomData.meetingId
          zoomMeetingUrl = zoomData.joinUrl
          zoomStartUrl = zoomData.startUrl
        }
      }
    } catch (zoomError) {
      console.warn('Zoom meeting creation failed (optional):', zoomError)
      // Continue without Zoom - it's optional
    }

    // Get full appointment details for email
    const { data: fullAppointment, error: fetchError } = await supabase
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

    if (fetchError || !fullAppointment) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch appointment details' },
        { status: 500 }
      )
    }

    // Update appointment status
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('counseling_appointments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        zoom_meeting_id: zoomMeetingId,
        zoom_meeting_url: zoomMeetingUrl,
        zoom_start_url: zoomStartUrl,
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
      console.error('Error confirming appointment:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to confirm appointment' },
        { status: 500 }
      )
    }

    // Send confirmation email to student using the template system
    try {
      console.log('📧 Sending confirmation email to:', updatedAppointment.student_email)
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/counseling/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointmentId,
          type: 'confirmation'
        })
      })

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('📧 Email sent successfully:', emailResult)
      } else {
        console.warn('📧 Email sending failed:', await emailResponse.text())
      }
    } catch (emailError) {
      console.error('📧 Error sending confirmation email:', emailError)
      // Don't fail the request if email fails - appointment is still confirmed
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: 'Appointment confirmed successfully'
    })
  } catch (error: any) {
    console.error('Error in confirm API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

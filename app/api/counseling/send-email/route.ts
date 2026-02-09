import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Use existing email infrastructure with template system
async function sendCounselingEmail(to: string, template: string, data: any) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/auth/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to,
        template,
        data
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Email API error: ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    return { success: result.success || false, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, type, reason, newDate, newTime } = await request.json()

    if (!appointmentId || !type) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID and email type are required' },
        { status: 400 }
      )
    }

    // Get appointment details
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

    const counselor = appointment.counselors

    // Prepare email data based on type
    let template = ''
    let emailData: any = {}

    if (type === 'confirmation') {
      template = 'counseling_confirmation'
      emailData = {
        student_name: appointment.student_name,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        counselor_name: counselor?.name || 'TBA',
        appointment_type: appointment.appointment_type,
        zoom_meeting_url: appointment.zoom_meeting_url || null,
      }
    } else if (type === 'cancellation') {
      template = 'counseling_cancellation'
      emailData = {
        student_name: appointment.student_name,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        cancelled_reason: appointment.cancelled_reason || 'Not specified',
      }
    } else if (type === 'reschedule') {
      template = 'counseling_reschedule'
      emailData = {
        student_name: appointment.student_name,
        old_appointment_date: appointment.appointment_date,
        old_appointment_time: appointment.appointment_time,
        new_appointment_date: newDate || appointment.appointment_date,
        new_appointment_time: newTime || appointment.appointment_time,
        reschedule_reason: reason || 'Appointment rescheduled by counselor',
        counselor_name: counselor?.name || 'TBA',
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid email type. Use "confirmation", "cancellation", or "reschedule"' },
        { status: 400 }
      )
    }

    // Send email using template system
    const emailResult = await sendCounselingEmail(appointment.student_email, template, emailData)

    if (!emailResult.success) {
      // Don't fail the request if email fails - log it
      console.warn('Email sending failed:', emailResult.error)
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      message: 'Email sent successfully'
    })
  } catch (error: any) {
    console.error('Error in send-email API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentName,
      studentEmail,
      studentPhone,
      counselorId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      preferredGender,
      reason,
      message,
    } = body

    // Validation
    if (!studentName || !studentEmail || !counselorId || !appointmentDate || !appointmentTime || !appointmentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if time slot is still available
    const { data: existingAppointment, error: checkError } = await supabase
      .from('counseling_appointments')
      .select('id')
      .eq('counselor_id', counselorId)
      .eq('appointment_date', appointmentDate)
      .eq('appointment_time', appointmentTime)
      .in('status', ['pending', 'confirmed'])
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking availability:', checkError)
      return NextResponse.json(
        { success: false, error: 'Failed to check availability' },
        { status: 500 }
      )
    }

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      )
    }

    // Create appointment
    const { data: appointment, error: insertError } = await supabase
      .from('counseling_appointments')
      .insert({
        student_name: studentName,
        student_email: studentEmail,
        student_phone: studentPhone || null,
        counselor_id: counselorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        appointment_type: appointmentType,
        preferred_gender: preferredGender || null,
        reason: reason || null,
        message: message || null,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating appointment:', insertError)
      
      // Check for unique constraint violation
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'This time slot is already booked. Please select another time.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    // TODO: Send notification email to counselor
    // This will be implemented in the email notification task

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Appointment request submitted successfully. You will receive a confirmation email once it is confirmed.'
    })
  } catch (error: any) {
    console.error('Error in book API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

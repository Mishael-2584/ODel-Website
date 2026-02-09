import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const WORKING_HOURS: { [key: string]: { start: string; end: string } } = {
  'Monday': { start: '08:00', end: '17:00' },
  'Tuesday': { start: '08:00', end: '17:00' },
  'Wednesday': { start: '08:00', end: '17:00' },
  'Thursday': { start: '08:00', end: '17:00' },
  'Friday': { start: '08:00', end: '12:00' },
}

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = []
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  
  let currentHour = startHour
  let currentMin = startMin
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`)
    currentMin += 30
    if (currentMin >= 60) {
      currentMin = 0
      currentHour += 1
    }
  }
  
  return slots
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const counselorId = searchParams.get('counselorId')
    const date = searchParams.get('date')

    if (!counselorId || !date) {
      return NextResponse.json(
        { success: false, error: 'Counselor ID and date are required' },
        { status: 400 }
      )
    }

    // Get day of week
    const appointmentDate = new Date(date)
    const dayName = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' })
    
    // Check if it's a working day
    if (!WORKING_HOURS[dayName]) {
      return NextResponse.json({
        success: true,
        slots: []
      })
    }

    const workingHours = WORKING_HOURS[dayName]
    const allSlots = generateTimeSlots(workingHours.start, workingHours.end)

    // Get booked appointments for this date
    const { data: bookedAppointments, error: appointmentsError } = await supabase
      .from('counseling_appointments')
      .select('appointment_time')
      .eq('counselor_id', counselorId)
      .eq('appointment_date', date)
      .in('status', ['pending', 'confirmed'])

    if (appointmentsError) {
      console.error('Error fetching booked appointments:', appointmentsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch available slots' },
        { status: 500 }
      )
    }

    const bookedTimes = new Set(
      (bookedAppointments || []).map((apt: any) => apt.appointment_time)
    )

    // Map slots with availability
    const slots = allSlots.map(time => ({
      time,
      available: !bookedTimes.has(time)
    }))

    return NextResponse.json({
      success: true,
      slots
    })
  } catch (error: any) {
    console.error('Error in available-slots API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

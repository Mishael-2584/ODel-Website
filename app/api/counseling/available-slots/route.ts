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

function generateTimeSlots(start: string, end: string, date: string): string[] {
  const slots: string[] = []
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  
  // Lunch break: 12:30 PM - 2:00 PM (12:30 - 14:00)
  const lunchStart = 12 * 60 + 30 // 12:30 in minutes
  const lunchEnd = 14 * 60 // 14:00 in minutes
  
  // Get current time for filtering past slots
  const now = new Date()
  const selectedDate = new Date(date + 'T00:00:00') // Set to start of day to avoid timezone issues
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
  const isToday = today.getTime() === selectedDay.getTime()
  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : -1
  
  let currentHour = startHour
  let currentMin = startMin
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const slotMinutes = currentHour * 60 + currentMin
    
    // Skip lunch break (12:30 PM - 2:00 PM)
    if (slotMinutes >= lunchStart && slotMinutes < lunchEnd) {
      // Skip to after lunch (2:00 PM)
      currentHour = 14
      currentMin = 0
      continue
    }
    
    // Skip past time slots (only for today)
    // Add 5 minute buffer to account for current time
    if (isToday && slotMinutes <= currentMinutes + 5) {
      // Move to next hour
      currentMin += 60
      if (currentMin >= 60) {
        currentMin = 0
        currentHour += 1
      }
      continue
    }
    
    // Check if this slot would overlap with lunch break
    // (slot starts before lunch ends and ends after lunch starts)
    const slotEndMinutes = slotMinutes + 60 // 1 hour duration
    if (slotMinutes < lunchEnd && slotEndMinutes > lunchStart) {
      // This slot overlaps with lunch, skip to after lunch
      currentHour = 14
      currentMin = 0
      continue
    }
    
    slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`)
    
    // Increment by 1 hour (60 minutes) instead of 30 minutes
    currentMin += 60
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
    const allSlots = generateTimeSlots(workingHours.start, workingHours.end, date)

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

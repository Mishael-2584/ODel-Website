import { NextRequest, NextResponse } from 'next/server'
import { SmartCourseDiscovery } from '@/lib/smart-courses'
import { moodleService } from '@/lib/moodle'

const smartCourseDiscovery = new SmartCourseDiscovery(moodleService)

export async function GET(request: NextRequest) {
  try {
    const programs = await smartCourseDiscovery.generateSmartPrograms()
    
    return NextResponse.json({
      success: true,
      programs,
      count: programs.length
    })
  } catch (error) {
    console.error('Error generating smart programs:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate programs',
        programs: [],
        count: 0
      },
      { status: 500 }
    )
  }
}

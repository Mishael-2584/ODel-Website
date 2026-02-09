import { NextRequest, NextResponse } from 'next/server'

const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID

// Get Zoom access token
async function getZoomAccessToken(): Promise<string | null> {
  if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_ACCOUNT_ID) {
    console.warn('Zoom credentials not configured')
    return null
  }

  try {
    const authString = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')
    
    const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (!response.ok) {
      throw new Error(`Zoom OAuth error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting Zoom access token:', error)
    return null
  }
}

// Create Zoom meeting
async function createZoomMeeting(accessToken: string, topic: string, startTime: string, duration: number) {
  try {
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration,
        timezone: 'Africa/Nairobi', // GMT+3
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: false,
          approval_type: 0, // Automatically approve
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Zoom API error: ${errorData.message || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating Zoom meeting:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { topic, startTime, duration = 60 } = await request.json()

    if (!topic || !startTime) {
      return NextResponse.json(
        { success: false, error: 'Topic and start time are required' },
        { status: 400 }
      )
    }

    // Check if Zoom is configured
    if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_ACCOUNT_ID) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zoom is not configured. Please add ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, and ZOOM_ACCOUNT_ID to your environment variables.',
          configured: false
        },
        { status: 503 }
      )
    }

    // Get access token
    const accessToken = await getZoomAccessToken()
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate with Zoom' },
        { status: 500 }
      )
    }

    // Create meeting
    const meeting = await createZoomMeeting(accessToken, topic, startTime, duration)

    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
      password: meeting.password,
      configured: true
    })
  } catch (error: any) {
    console.error('Error in Zoom create-meeting API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Zoom meeting' },
      { status: 500 }
    )
  }
}

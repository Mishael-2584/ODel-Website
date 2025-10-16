import { NextRequest, NextResponse } from 'next/server'
import { zammadService } from '@/lib/zammad'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userInfo, category } = body

    // Validate required fields
    if (!message || !userInfo?.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create ticket in Zammad
    const result = await zammadService.createTicket({
      title: `Chatbot Escalation: ${category || 'General Inquiry'}`,
      message,
      userInfo: {
        name: userInfo.name || 'Anonymous',
        email: userInfo.email,
        studentId: userInfo.studentId
      },
      category: category || 'General Inquiry'
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        ticketId: result.ticketId,
        message: 'Ticket created successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to create ticket' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const ticketId = searchParams.get('ticketId')

    if (ticketId) {
      // Get specific ticket status
      const status = await zammadService.getTicketStatus(ticketId)
      return NextResponse.json({ status })
    } else if (email) {
      // Get user's tickets
      const tickets = await zammadService.getUserTickets(email)
      return NextResponse.json({ tickets })
    } else {
      return NextResponse.json(
        { error: 'Missing email or ticketId parameter' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

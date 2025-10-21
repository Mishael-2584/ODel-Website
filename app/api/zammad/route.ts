import { NextRequest, NextResponse } from 'next/server'
import { zammadService } from '@/lib/zammad'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle both contact form and chatbot escalation formats
    const isContactForm = body.customerEmail && body.subject && body.body
    const isChatbot = body.message && body.userInfo?.email
    
    let message, userInfo, category, title

    if (isContactForm) {
      // Contact form submission
      message = body.body
      userInfo = {
        name: body.customerName,
        email: body.customerEmail,
        phone: body.customerPhone
      }
      category = body.inquiryType || 'General Inquiry'
      title = body.subject
    } else if (isChatbot) {
      // Chatbot escalation
      message = body.message
      userInfo = body.userInfo
      category = body.category || 'General Inquiry'
      title = `Chatbot Escalation: ${category}`
    } else {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!message || !userInfo?.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create ticket in Zammad
    const result = await zammadService.createTicket({
      title: title || `${category} - ${userInfo.name || 'Anonymous'}`,
      message,
      userInfo: {
        name: userInfo.name || 'Anonymous',
        email: userInfo.email,
        phone: userInfo.phone,
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

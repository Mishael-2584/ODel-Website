import { NextRequest, NextResponse } from 'next/server'
import { zammadService } from '@/lib/zammad'
import { conversationManager } from '@/lib/conversation'

// Add reply to existing ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userInfo, category, sessionId, ticketId } = body

    // Validate required fields
    if (!message || !userInfo?.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let finalTicketId = ticketId

    // If no ticketId provided, create a new ticket
    if (!finalTicketId) {
      const result = await zammadService.createTicket({
        title: `Live Chat: ${category || 'General Inquiry'}`,
        message: `Live Chat Session Started\n\nInitial Message: ${message}`,
        userInfo: {
          name: userInfo.name || 'Anonymous',
          email: userInfo.email,
          phone: userInfo.phone || 'Not provided',
          studentId: userInfo.studentId
        },
        category: category || 'Live Chat Inquiry'
      })

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to create ticket' },
          { status: 500 }
        )
      }

      finalTicketId = result.ticketId
    } else {
      // Add reply to existing ticket
      const replyResult = await zammadService.addReplyToTicket(finalTicketId, {
        message,
        userInfo: {
          name: userInfo.name || 'Anonymous',
          email: userInfo.email,
          phone: userInfo.phone || 'Not provided',
          studentId: userInfo.studentId
        }
      })

      if (!replyResult.success) {
        return NextResponse.json(
          { error: replyResult.error || 'Failed to add reply' },
          { status: 500 }
        )
      }
    }

    // Update conversation session
    if (sessionId) {
      conversationManager.addMessage(sessionId, {
        text: message,
        sender: 'user',
        ticketId: finalTicketId
      })
    }

    return NextResponse.json({
      success: true,
      ticketId: finalTicketId,
      message: 'Message sent successfully',
      userInfo: {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone
      }
    })

  } catch (error) {
    console.error('Live Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get replies for a ticket
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const ticketId = searchParams.get('ticketId')
    const sessionId = searchParams.get('sessionId')

    if (ticketId && sessionId) {
      // Get replies for a specific ticket
      const replies = await zammadService.getTicketReplies(ticketId)
      
      if (replies.success) {
        // Update conversation with new replies
        const session = conversationManager.getConversation(sessionId)
        if (session) {
          replies.replies.forEach((reply: any) => {
            // Check if reply is already in conversation
            const exists = session.messages.some(msg => 
              msg.text === reply.body && msg.sender === 'support'
            )
            
            if (!exists) {
              conversationManager.addSupportReply(sessionId, reply.body, ticketId)
            }
          })
        }

        return NextResponse.json({ 
          success: true,
          ticketId,
          replies: replies.replies || []
        })
      } else {
        return NextResponse.json({ 
          success: true,
          ticketId,
          replies: []
        })
      }
    } else if (email) {
      // Get user's active tickets
      const tickets = await zammadService.getUserTickets(email)
      return NextResponse.json({ 
        success: true,
        email,
        tickets: tickets.map(ticket => ({
          id: ticket.id,
          title: ticket.title,
          state: ticket.state,
          created_at: ticket.created_at
        }))
      })
    } else {
      return NextResponse.json(
        { error: 'Missing email, ticketId, or sessionId parameter' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Live Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

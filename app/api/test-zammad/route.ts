import { NextRequest, NextResponse } from 'next/server'
import { zammadService } from '@/lib/zammad'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Zammad Integration...')
    
    // Test API connection by trying to create a test ticket
    const testResult = await zammadService.createTicket({
      title: 'UEAB ODeL Chatbot Test Ticket',
      message: 'This is an automated test ticket to verify the chatbot integration is working correctly.',
      userInfo: {
        name: 'Chatbot Test User',
        email: 'chatbot-test@ueab.ac.ke',
        studentId: 'CHATBOT001'
      },
      category: 'Integration Test'
    })

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Zammad integration is working correctly!',
        testTicketId: testResult.ticketId,
        timestamp: new Date().toISOString(),
        config: {
          baseUrl: process.env.NEXT_PUBLIC_ZAMMAD_URL,
          hasApiToken: !!process.env.ZAMMAD_API_TOKEN,
          groupId: process.env.NEXT_PUBLIC_ZAMMAD_GROUP_ID,
          priorityId: process.env.NEXT_PUBLIC_ZAMMAD_PRIORITY_ID
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error,
        message: 'Zammad integration test failed',
        timestamp: new Date().toISOString(),
        config: {
          baseUrl: process.env.NEXT_PUBLIC_ZAMMAD_URL,
          hasApiToken: !!process.env.ZAMMAD_API_TOKEN,
          groupId: process.env.NEXT_PUBLIC_ZAMMAD_GROUP_ID,
          priorityId: process.env.NEXT_PUBLIC_ZAMMAD_PRIORITY_ID
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Zammad test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Zammad integration test failed with exception',
      timestamp: new Date().toISOString(),
      config: {
        baseUrl: process.env.NEXT_PUBLIC_ZAMMAD_URL,
        hasApiToken: !!process.env.ZAMMAD_API_TOKEN,
        groupId: process.env.ZAMMAD_GROUP_ID,
        priorityId: process.env.ZAMMAD_PRIORITY_ID
      }
    }, { status: 500 })
  }
}

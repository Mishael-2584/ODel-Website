// Zammad Integration Service
// This service handles communication with Zammad helpdesk API

interface ZammadTicket {
  title: string
  group: string
  priority: string
  state: string
  customer_id?: string
  customer_email?: string
  customer_firstname?: string
  customer_lastname?: string
  article: {
    subject: string
    body: string
    type: string
    internal: boolean
  }
}

interface ZammadUser {
  firstname: string
  lastname: string
  email: string
  phone?: string
  organization?: string
}

interface ZammadConfig {
  baseUrl: string
  apiToken: string
  groupId: string
  priorityId: string
}

class ZammadService {
  private config: ZammadConfig

  constructor(config: ZammadConfig) {
    this.config = config
  }

  // Create a new ticket in Zammad
  async createTicket(ticketData: {
    title: string
    message: string
    userInfo: {
      name: string
      email: string
      studentId?: string
    }
    category: string
  }): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    try {
      // Try to find or create user first
      let userId: string | null = null
      
      try {
        userId = await this.findOrCreateUser(ticketData.userInfo)
      } catch (userError) {
        console.log('User creation failed, proceeding without user ID:', userError)
        userId = null
      }

      // Create ticket with customer information directly
      const ticket: any = {
        title: ticketData.title,
        group_id: parseInt(this.config.groupId),
        priority_id: 3, // High priority for live chat
        state_id: 1, // new state
        article: {
          subject: ticketData.title,
          body: `
Live Chat Escalation - ${ticketData.category}

User Information:
- Name: ${ticketData.userInfo.name}
- Email: ${ticketData.userInfo.email}
- Phone: ${ticketData.userInfo.phone}
- Student ID: ${ticketData.userInfo.studentId || 'Not provided'}

Message:
${ticketData.message}

This ticket was created automatically by the UEAB ODeL chatbot live chat system.
Priority: High (Live Chat)
Source: Website Chatbot
          `,
          type: 'web',
          internal: false,
          // Add customer information directly to article
          from: ticketData.userInfo.email,
          to: 'support@ueab.ac.ke'
        }
      }

      // Only add customer_id if we successfully found/created a user
      if (userId) {
        ticket.customer_id = userId
      } else {
        // Add customer information directly to ticket
        ticket.customer = ticketData.userInfo.email
        ticket.customer_email = ticketData.userInfo.email
      }

      console.log('Creating ticket with data:', JSON.stringify(ticket, null, 2))

      const response = await fetch(`${this.config.baseUrl}/api/v1/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Token token=${this.config.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticket)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Ticket creation failed:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Ticket created successfully:', result.id)
      return { success: true, ticketId: result.id }

    } catch (error) {
      console.error('Error creating Zammad ticket:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Find existing user or create new one
  private async findOrCreateUser(userInfo: {
    name: string
    email: string
    studentId?: string
  }): Promise<string> {
    try {
      // Try to find existing user by email
      const searchResponse = await fetch(
        `${this.config.baseUrl}/api/v1/users/search?query=${encodeURIComponent(userInfo.email)}`,
        {
          headers: {
            'Authorization': `Token token=${this.config.apiToken}`
          }
        }
      )

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json()
        if (searchResult && searchResult.length > 0) {
          console.log('Found existing user:', searchResult[0].id)
          return searchResult[0].id
        }
      }

      // If user not found, try to create new one
      const [firstname, ...lastnameParts] = userInfo.name.split(' ')
      const lastname = lastnameParts.join(' ') || 'User'

      const newUser: ZammadUser = {
        firstname: firstname || 'Anonymous',
        lastname: lastname,
        email: userInfo.email,
        organization: 'UEAB ODeL'
      }

      console.log('Creating new user:', newUser)

      const createResponse = await fetch(`${this.config.baseUrl}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Token token=${this.config.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        console.error('User creation failed:', createResponse.status, errorText)
        
        // If user creation fails (422), try to find user again or use a fallback
        if (createResponse.status === 422) {
          // Try to find user with a different approach
          const fallbackResponse = await fetch(
            `${this.config.baseUrl}/api/v1/users`,
            {
              headers: {
                'Authorization': `Token token=${this.config.apiToken}`
              }
            }
          )
          
          if (fallbackResponse.ok) {
            const users = await fallbackResponse.json()
            const existingUser = users.find((user: any) => user.email === userInfo.email)
            if (existingUser) {
              console.log('Found user via fallback method:', existingUser.id)
              return existingUser.id
            }
          }
          
          // If still can't find/create user, use a system user ID or create ticket without user
          console.log('Using fallback: creating ticket without specific user')
          return '1' // System user ID - adjust based on your Zammad setup
        }
        
        throw new Error(`Failed to create user: ${createResponse.status} - ${errorText}`)
      }

      const userResult = await createResponse.json()
      console.log('Successfully created user:', userResult.id)
      return userResult.id

    } catch (error) {
      console.error('Error finding/creating user:', error)
      // Return a fallback user ID to allow ticket creation
      return '1' // System user ID - adjust based on your Zammad setup
    }
  }

  // Get ticket status
  async getTicketStatus(ticketId: string): Promise<{ status: string; state: string } | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Token token=${this.config.apiToken}`
        }
      })

      if (!response.ok) {
        return null
      }

      const ticket = await response.json()
      return {
        status: ticket.state,
        state: ticket.state
      }

    } catch (error) {
      console.error('Error getting ticket status:', error)
      return null
    }
  }

  // Get user's tickets
  async getUserTickets(email: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/tickets/search?query=${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Token token=${this.config.apiToken}`
          }
        }
      )

      if (!response.ok) {
        return []
      }

      return await response.json()

    } catch (error) {
      console.error('Error getting user tickets:', error)
      return []
    }
  }

  // Add reply to existing ticket
  async addReplyToTicket(ticketId: string, replyData: {
    message: string
    userInfo: {
      name: string
      email: string
      phone: string
      studentId?: string
    }
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Create a new article (reply) for the ticket
      const article = {
        ticket_id: ticketId,
        subject: `Re: Live Chat Update`,
        body: `
Live Chat Reply

User Information:
- Name: ${replyData.userInfo.name}
- Email: ${replyData.userInfo.email}
- Phone: ${replyData.userInfo.phone}
- Student ID: ${replyData.userInfo.studentId || 'Not provided'}

Message:
${replyData.message}

This is a reply from the live chat system.
        `,
        type: 'web',
        internal: false,
        from: replyData.userInfo.email,
        to: 'support@ueab.ac.ke'
      }

      const response = await fetch(`${this.config.baseUrl}/api/v1/ticket_articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Token token=${this.config.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(article)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to add reply to ticket:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Error adding reply to ticket:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Get ticket replies
  async getTicketReplies(ticketId: string): Promise<{ success: boolean; replies?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Token token=${this.config.apiToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const ticket = await response.json()
      
      // Get articles (replies) for this ticket
      const articlesResponse = await fetch(`${this.config.baseUrl}/api/v1/ticket_articles/by_ticket/${ticketId}`, {
        headers: {
          'Authorization': `Token token=${this.config.apiToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!articlesResponse.ok) {
        throw new Error(`HTTP error! status: ${articlesResponse.status}`)
      }

      const articles = await articlesResponse.json()
      
      // Filter for support replies (not from customer)
      const supportReplies = articles.filter((article: any) => 
        article.sender === 'Agent' && 
        article.from !== ticket.customer_email &&
        article.body && 
        article.body.trim().length > 0
      )

      return { 
        success: true, 
        replies: supportReplies.map((reply: any) => ({
          id: reply.id,
          body: reply.body,
          from: reply.from,
          created_at: reply.created_at,
          sender: reply.sender
        }))
      }
    } catch (error) {
      console.error('Error fetching ticket replies:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Zammad Configuration
// Replace these with your actual Zammad instance details
export const zammadConfig: ZammadConfig = {
  baseUrl: process.env.NEXT_PUBLIC_ZAMMAD_URL || 'https://your-zammad-instance.com',
  apiToken: process.env.ZAMMAD_API_TOKEN || 'your-api-token',
  groupId: process.env.NEXT_PUBLIC_ZAMMAD_GROUP_ID || '1', // Support group ID
  priorityId: process.env.NEXT_PUBLIC_ZAMMAD_PRIORITY_ID || '1' // Normal priority ID
}

export const zammadService = new ZammadService(zammadConfig)

// Helper function to create ticket from chatbot escalation
export async function escalateToZammad(
  message: string,
  userInfo: { name: string; email: string; studentId?: string },
  category: string = 'General Inquiry'
) {
  const ticketData = {
    title: `Chatbot Escalation: ${category}`,
    message,
    userInfo,
    category
  }

  return await zammadService.createTicket(ticketData)
}

// Environment variables needed:
/*
NEXT_PUBLIC_ZAMMAD_URL=https://your-zammad-instance.com
ZAMMAD_API_TOKEN=your-api-token-here
ZAMMAD_GROUP_ID=1
ZAMMAD_PRIORITY_ID=1
*/

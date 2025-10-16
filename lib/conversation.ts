// Conversation Management System
// Handles session-based tickets and real-time updates

interface ConversationSession {
  sessionId: string
  ticketId: string | null
  userId: string
  userInfo: {
    name: string
    email: string
    phone: string
    studentId?: string
  }
  status: 'active' | 'closed' | 'waiting'
  lastActivity: Date
  messages: Array<{
    id: string
    text: string
    sender: 'user' | 'support'
    timestamp: Date
    ticketId?: string
  }>
}

class ConversationManager {
  private sessions: Map<string, ConversationSession> = new Map()
  private pollingInterval: NodeJS.Timeout | null = null

  // Create or get existing session
  getOrCreateSession(userInfo: {
    name: string
    email: string
    phone: string
    studentId?: string
  }): ConversationSession {
    const sessionId = this.generateSessionId(userInfo.email)
    
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!
      session.lastActivity = new Date()
      return session
    }

    const newSession: ConversationSession = {
      sessionId,
      ticketId: null,
      userId: userInfo.email,
      userInfo,
      status: 'active',
      lastActivity: new Date(),
      messages: []
    }

    this.sessions.set(sessionId, newSession)
    return newSession
  }

  // Add message to conversation
  addMessage(sessionId: string, message: {
    text: string
    sender: 'user' | 'support'
    ticketId?: string
  }) {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const messageId = Date.now().toString()
    session.messages.push({
      id: messageId,
      text: message.text,
      sender: message.sender,
      timestamp: new Date(),
      ticketId: message.ticketId
    })

    session.lastActivity = new Date()
  }

  // Create ticket for session (only once)
  async createTicketForSession(sessionId: string, initialMessage: string): Promise<string | null> {
    const session = this.sessions.get(sessionId)
    if (!session || session.ticketId) {
      return session?.ticketId || null
    }

    try {
      const response = await fetch('/api/live-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Live Chat Session Started\n\nInitial Message: ${initialMessage}`,
          userInfo: session.userInfo,
          category: 'Live Chat Session',
          sessionId: sessionId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        session.ticketId = result.ticketId
        session.status = 'waiting'
        
        // Add initial message to conversation
        this.addMessage(sessionId, {
          text: initialMessage,
          sender: 'user',
          ticketId: result.ticketId
        })

        return result.ticketId
      }
    } catch (error) {
      console.error('Error creating ticket for session:', error)
    }

    return null
  }

  // Add support reply to conversation
  addSupportReply(sessionId: string, reply: string, ticketId: string) {
    this.addMessage(sessionId, {
      text: reply,
      sender: 'support',
      ticketId
    })
  }

  // Get conversation history
  getConversation(sessionId: string): ConversationSession | null {
    return this.sessions.get(sessionId) || null
  }

  // Start polling for replies
  startPollingForReplies(sessionId: string, callback: (replies: any[]) => void) {
    const session = this.sessions.get(sessionId)
    if (!session || !session.ticketId) return

    // Poll every 10 seconds for new replies
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/live-chat/replies?ticketId=${session.ticketId}&sessionId=${sessionId}`)
        const result = await response.json()
        
        if (result.success && result.replies.length > 0) {
          callback(result.replies)
        }
      } catch (error) {
        console.error('Error polling for replies:', error)
      }
    }, 10000)

    // Store interval for cleanup
    session.pollingInterval = pollInterval
  }

  // Stop polling
  stopPolling(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (session?.pollingInterval) {
      clearInterval(session.pollingInterval)
      session.pollingInterval = null
    }
  }

  // Clean up old sessions
  cleanupOldSessions() {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < oneHourAgo) {
        this.stopPolling(sessionId)
        this.sessions.delete(sessionId)
      }
    }
  }

  private generateSessionId(email: string): string {
    return `session_${email}_${Date.now()}`
  }
}

export const conversationManager = new ConversationManager()

// Cleanup old sessions every 30 minutes
setInterval(() => {
  conversationManager.cleanupOldSessions()
}, 30 * 60 * 1000)

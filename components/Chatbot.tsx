'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bird } from 'lucide-react'
import { 
  FaTimes, FaPaperPlane, FaUser, FaSpinner, 
  FaTicketAlt, FaBook, FaCalendarAlt, FaRobot, FaGraduationCap, FaSave, FaArrowLeft
} from 'react-icons/fa'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'quick_reply' | 'escalation' | 'user_form'
  quickReplies?: string[]
}

interface UserInfo {
  name: string
  email: string
  phone: string
  studentId?: string
  isRegistered: boolean
}

interface ChatbotProps {
  onEscalateToHelpdesk?: (message: string, userInfo: any) => void
}

export default function Chatbot({ onEscalateToHelpdesk }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    isRegistered: false
  })
  const [showUserForm, setShowUserForm] = useState(false)
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [moodleUserId, setMoodleUserId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Knowledge base for common questions
  const knowledgeBase = {
    'admission': {
      keywords: ['admission', 'apply', 'application', 'enroll', 'registration', 'requirements'],
      response: 'To apply for admission to UEAB ODeL programs:\n\n1. Visit our registration page\n2. Complete the online application form\n3. Submit required documents\n4. Pay application fee\n5. Wait for admission decision\n\nWould you like me to help you with any specific step?',
      quickReplies: ['Application Requirements', 'Application Fee', 'Document Submission', 'Contact Admissions']
    },
    'courses': {
      keywords: ['courses', 'programs', 'degree', 'bachelor', 'master', 'phd', 'curriculum'],
      response: 'UEAB ODeL offers programs across 5 academic schools:\n\n• School of Business and Technology\n• School of Education, Arts and Humanities\n• School of Health Sciences\n• School of Sciences\n• School of Agriculture and Hospitality\n\nAll programs are CUE accredited and internationally recognized.',
      quickReplies: ['Business Programs', 'Health Sciences', 'Education Programs', 'View All Courses']
    },
    'fees': {
      keywords: ['fees', 'tuition', 'cost', 'payment', 'price', 'financial'],
      response: 'UEAB ODeL offers competitive tuition fees with flexible payment options:\n\n• Payment plans available\n• Scholarships for eligible students\n• Financial aid options\n• International student rates\n\nFor specific fee information, please contact our finance office.',
      quickReplies: ['Payment Plans', 'Scholarships', 'Financial Aid', 'Contact Finance']
    },
    'technical': {
      keywords: ['technical', 'login', 'password', 'system', 'platform', 'access', 'troubleshoot'],
      response: 'For technical support with the ODeL platform:\n\n• Check your internet connection\n• Clear browser cache\n• Try different browser\n• Contact IT support\n\nI can help escalate this to our technical team if needed.',
      quickReplies: ['Reset Password', 'Browser Issues', 'Contact IT Support', 'System Requirements']
    },
    'contact': {
      keywords: ['contact', 'phone', 'email', 'address', 'location', 'office'],
      response: 'Contact UEAB ODeL Center:\n\n📞 Phone: +254 714 333 111\n📧 Email: info@ueab.ac.ke\n📍 Address: P.O. Box 2500, 30100 Eldoret, Kenya\n\nOffice Hours: Monday-Friday, 8:00 AM - 5:00 PM',
      quickReplies: ['Call Now', 'Send Email', 'Visit Campus', 'Office Hours']
    }
  }

  // Enhanced course search with Moodle integration
  const searchMoodleCourses = async (searchTerm: string) => {
    try {
      const response = await fetch(`/api/moodle?action=search&search=${encodeURIComponent(searchTerm)}`)
      const result = await response.json()
      
      if (result.success && result.data.length > 0) {
        const courses = result.data.slice(0, 3) // Show top 3 results
        let response = `I found ${result.count} courses matching "${searchTerm}":\n\n`
        
        courses.forEach((course: any, index: number) => {
          response += `${index + 1}. **${course.fullname || 'Untitled Course'}**\n`
          response += `   School: ${course.categoryname || 'General'}\n`
          response += `   Students: ${course.enrolledusercount || 0}\n`
          const summary = (course.summary || 'No description available')
          response += `   ${summary.substring(0, 100)}...\n\n`
        })
        
        if (result.count > 3) {
          response += `And ${result.count - 3} more courses. Visit /courses to see all programs.`
        }
        
        return response
      } else {
        return `I couldn't find any courses matching "${searchTerm}". Try browsing all programs at /courses or contact our admissions team for assistance.`
      }
    } catch (error) {
      console.error('Error searching Moodle courses:', error)
      return `I'm having trouble searching courses right now. You can browse all programs at /courses or contact our support team.`
    }
  }

  // Get course statistics from Moodle
  const getCourseStatistics = async () => {
    try {
      const response = await fetch('/api/moodle?action=statistics')
      const result = await response.json()
      
      if (result.success) {
        const stats = result.data
        let response = `📊 **Current Course Statistics:**\n\n`
        response += `📚 Total Courses: ${stats.totalCourses}\n`
        response += `👥 Total Enrollments: ${stats.totalEnrollments}\n\n`
        
        response += `**Schools & Programs:**\n`
        stats.categories.forEach((category: any) => {
          response += `• ${category.name}: ${category.courseCount} programs\n`
        })
        
        response += `\n**Recent Programs:**\n`
        stats.recentCourses.forEach((course: any, index: number) => {
          response += `${index + 1}. ${course.fullname} (${course.enrolledusercount} students)\n`
        })
        
        return response
      }
    } catch (error) {
      console.error('Error fetching course statistics:', error)
    }
    return 'I can show you our current course offerings. We have programs across 5 schools with flexible learning options.'
  }

  // Fetch session to decide registration flow (do not ask logged-in users)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const r = await fetch('/api/auth/verify', { cache: 'no-store' })
        const j = await r.json()
        if (j?.authenticated && j?.user) {
          setUserInfo({
            name: j.user.studentName || j.user.email,
            email: j.user.email,
            phone: '',
            studentId: j.user.studentId || '',
            isRegistered: true
          })
          if (j.user.moodleUserId) setMoodleUserId(j.user.moodleUserId)
        }
      } catch {}
    }
    checkSession()
  }, [])

  // Open greeting uses session-aware messaging
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (userInfo.isRegistered) {
        addBotMessage(`Hello ${userInfo.name?.split(' ')[0] || ''}! I'm CRANE. How can I help?`, [
          'My deadlines', 'My grades', 'Programs', 'Events'
        ])
      } else {
        addBotMessage(
          "Hi! I'm CRANE (UEAB ODeL Chatbot). If you're a registered UEAB student or staff, please type your UEAB email and I'll personalize help for you.\n\nIf you're new and not yet registered, I'll ask for a few details (Full Name, Email, Phone) so I can assist you or create a support ticket."
        )
      }
    }
  }, [isOpen, userInfo.isRegistered])

  useEffect(() => {
    scrollToBottom()
  }, [messages, showUserForm])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (text: string, sender: 'user' | 'bot', type: 'text' | 'quick_reply' | 'escalation' = 'text', quickReplies?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      type,
      quickReplies
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addBotMessage = (text: string, quickReplies?: string[]) => {
    setIsTyping(true)
    setTimeout(() => {
      addMessage(text, 'bot', 'text', quickReplies)
      setIsTyping(false)
    }, 1000)
  }

  const findBestResponse = (userMessage: string): { response: string; quickReplies?: string[] } | null => {
    const message = userMessage.toLowerCase()
    
    for (const [category, data] of Object.entries(knowledgeBase)) {
      const hasKeyword = data.keywords.some(keyword => message.includes(keyword))
      if (hasKeyword) {
        return {
          response: data.response,
          quickReplies: data.quickReplies
        }
      }
    }
    
    return null
  }

  // Call CRANE answer endpoint
  const askCrane = async (text: string) => {
    const payload: any = { message: text }
    if (userInfo.isRegistered) payload.user = { email: userInfo.email, studentId: userInfo.studentId, moodleUserId }
    if (!userInfo.isRegistered && /@/.test(text) && text.includes('.')) payload.emailOnly = text.trim()

    const r = await fetch('/api/crane/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const j = await r.json()
    return j
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    const userMessage = inputValue.trim()
    addMessage(userMessage, 'user')
    setInputValue('')
    setIsTyping(true)

    try {
      const answer = await askCrane(userMessage)
      setIsTyping(false)
      if (answer?.type === 'links') {
        const text = `${answer.data.title}\n\n${answer.data.text || ''}\n\n${(answer.data.items||[]).slice(0,3).map((x:any,i:number)=>`${i+1}. ${x.title || x.name || x.fullname || 'Item'}`).join('\n')}`
        addBotMessage(text, (answer.data.links||[]).map((l:any)=>l.label))
      } else if (answer?.type === 'personal') {
        const text = `${answer.data.title}\n\n${(answer.data.items||[]).slice(0,5).map((x:any,i:number)=>`${i+1}. ${x.name || x.title || x.coursename || 'Item'}`).join('\n')}`
        addBotMessage(text)
      } else if (answer?.type === 'user-lookup') {
        if (answer.data) {
          setUserInfo(prev => ({ ...prev, name: `${answer.data.firstname} ${answer.data.lastname}`.trim() || prev.name, isRegistered: true }))
          addBotMessage(`Welcome ${answer.data.firstname}! How can I help you today?`, ['My deadlines', 'My grades', 'Programs', 'Events'])
        } else {
          addBotMessage("I couldn't find that email in Moodle. If you're new, I can open a support ticket—please share your name & phone.")
          setShowUserForm(true)
        }
      } else if (answer?.type === 'fallback') {
        addBotMessage(answer.data.text, ['Create Ticket', 'Programs', 'Events'])
      } else {
        addBotMessage('Let me connect you with the right resource. Would you like to create a ticket? ', ['Create Ticket', 'Contact'])
      }
    } catch (e) {
      setIsTyping(false)
      addBotMessage('Something went wrong. Please try again or choose Create Ticket.', ['Create Ticket'])
    }
  }

  const handleQuickReply = (reply: string) => {
    addMessage(reply, 'user')
    
    // Handle specific quick replies
    switch (reply) {
      case 'Contact Support':
      case 'Create Ticket':
        handleEscalateToHelpdesk(reply)
        break
      case 'Check Ticket Status':
        checkTicketStatus()
        break
      case 'Add More Information':
        addBotMessage("Please provide any additional information about your request:")
        break
      case 'Contact Support Directly':
        addBotMessage("You can contact our support team directly:\n\n📞 Phone: +254 714 333 111\n📧 Email: info@ueab.ac.ke\n\nOffice Hours: Monday-Friday, 8:00 AM - 5:00 PM")
        break
      case 'Call Support':
        addBotMessage("You can call our support team at +254 714 333 111. They're available Monday-Friday, 8:00 AM - 5:00 PM.")
        break
      case 'Application Requirements':
        addBotMessage("Application requirements include:\n\n• Completed application form\n• Academic transcripts\n• Copy of ID/Passport\n• Passport photos\n• Application fee receipt\n\nWould you like more details about any specific requirement?")
        break
      case 'View All Courses':
        addBotMessage("You can view all our courses at /courses. We offer programs from Bachelor's to PhD level across all major disciplines.")
        break
      case 'Search More Courses':
        addBotMessage("What course or program are you looking for? I can search our Moodle database for specific programs.")
        break
      case 'Search Courses':
        addBotMessage("What would you like to search for? I can help you find courses by name, school, or subject area.")
        break
      case 'Programs':
        askCrane('programs').then((ans) => {
          if (ans?.data?.links) addBotMessage('Opening programs…', ans.data.links.map((l:any)=>l.label))
          else addBotMessage('Browse our programs at /courses')
        })
        break
      case 'Events':
        askCrane('events').then(() => addBotMessage('You can view all events on the Events Calendar.', ['Events Calendar']))
        break
      case 'My deadlines':
        askCrane('my deadlines').then((ans)=>{
          const items = ans?.data?.items||[]
          addBotMessage(`Your upcoming deadlines:\n\n${items.slice(0,5).map((x:any,i:number)=>`${i+1}. ${x.name || x.title || 'Item'}`).join('\n')}`)
        })
        break
      case 'My grades':
        askCrane('my grades').then((ans)=>{
          const items = ans?.data?.items||[]
          addBotMessage(`Your grades summary:\n\n${items.slice(0,5).map((x:any,i:number)=>`${i+1}. ${x.coursename || x.name || 'Course'}`).join('\n')}`)
        })
        break
      case 'iCampus Registration':
        if (typeof window !== 'undefined') window.open('http://icampus.ueab.ac.ke/iUserLog/Register','_blank')
        break
      case 'Browse Courses':
        if (typeof window !== 'undefined') window.location.assign('/courses')
        break
      case 'Events Calendar':
        if (typeof window !== 'undefined') window.location.assign('/events')
        break
      case 'News & Updates':
        if (typeof window !== 'undefined') window.location.assign('/news')
        break
      case 'Contact Page':
        if (typeof window !== 'undefined') window.location.assign('/contact')
        break
      default:
        const response = findBestResponse(reply)
        if (response) {
          addBotMessage(response.response, response.quickReplies)
        } else {
          addBotMessage("Let me help you with that. Could you provide more details?")
        }
    }
  }

  const handleUserRegistration = async (formData: UserInfo) => {
    setUserInfo({ ...formData, isRegistered: true })
    setShowUserForm(false)
    
    // Generate session ID
    const newSessionId = `session_${formData.email}_${Date.now()}`
    setSessionId(newSessionId)
    
    addBotMessage(`Thank you, ${formData.name}! Your information has been saved. How can I assist you today?`, [
      'Admission Process', 'Course Information', 'Technical Support', 'Contact Support'
    ])
  }

  const handleEscalateToHelpdesk = async (reason: string) => {
    if (!userInfo.isRegistered) {
      addBotMessage("I need your contact information first to create a support ticket. Let me get your details.")
      setShowUserForm(true)
      return
    }

    addBotMessage("I'm creating a support ticket for you. Our team will contact you shortly.")
    
    try {
      const response = await fetch('/api/live-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Live Chat Request: ${reason}`,
          userInfo: {
            name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone,
            studentId: userInfo.studentId
          },
          category: reason,
          sessionId: sessionId,
          ticketId: currentTicketId // Use existing ticket if available
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setCurrentTicketId(result.ticketId)
        
        if (!isPolling && result.ticketId) {
          // Start polling for replies
          setIsPolling(true)
          startPollingForReplies(result.ticketId)
        }
        
        addBotMessage(`✅ Support ticket #${result.ticketId} created successfully!\n\nOur support team will contact you at:\n📧 ${userInfo.email}\n📞 ${userInfo.phone}\n\nExpected response time: Within 24 hours\n\nYou can also reach us directly at +254 714 333 111.`, [
          'Check Ticket Status', 'Add More Information', 'Contact Support Directly'
        ])
      } else {
        addBotMessage("I've logged your request. Please contact our support team directly at +254 714 333 111 or email info@ueab.ac.ke.")
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      addBotMessage("I've logged your request. Please contact our support team directly at +254 714 333 111 or email info@ueab.ac.ke.")
    }
  }

  const startPollingForReplies = (ticketId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/live-chat/replies?ticketId=${ticketId}&sessionId=${sessionId}`)
        const result = await response.json()
        
        if (result.success && result.replies && result.replies.length > 0) {
          // Add new replies to chat
          result.replies.forEach((reply: any) => {
            addBotMessage(`💬 Support Reply:\n\n${reply.body}\n\nFrom: ${reply.from}`, [
              'Reply to Support', 'Ask Another Question', 'Close Chat'
            ])
          })
        }
      } catch (error) {
        console.error('Error polling for replies:', error)
      }
    }, 10000) // Poll every 10 seconds

    // Store interval for cleanup
    return pollInterval
  }

  const checkTicketStatus = async () => {
    if (!currentTicketId) {
      addBotMessage("No active ticket found. Would you like to create a new support request?")
      return
    }

    try {
      const response = await fetch(`/api/live-chat?ticketId=${currentTicketId}`)
      const result = await response.json()
      
      if (result.success) {
        addBotMessage(`📋 Ticket #${currentTicketId} Status: ${result.status}\n\nOur team is working on your request. You'll be notified when there's an update.\n\nCurrent status: ${result.state}`)
      } else {
        addBotMessage(`Ticket #${currentTicketId} is being processed. Our team will contact you soon.`)
      }
    } catch (error) {
      addBotMessage(`Ticket #${currentTicketId} is being processed. Our team will contact you soon.`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chatbot Toggle Button - Better Mobile Positioning */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 z-50 group transform hover:scale-105 border-2 border-purple-400 hover:border-purple-300"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white rounded-full p-2 sm:p-3 shadow-md group-hover:animate-pulse">
              <Bird className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-bold text-sm sm:text-base leading-tight">CRANE</div>
              <div className="text-xs text-purple-100">UEAB ODeL Assistant</div>
            </div>
            <div className="text-left sm:hidden">
              <div className="font-bold text-xs leading-tight">CRANE</div>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center animate-bounce shadow-lg">
            !
          </div>
        </button>
      )}

      {/* Chatbot Window - Better Mobile Positioning */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[calc(100vw-3rem)] sm:w-96 h-[calc(100vh-3rem)] sm:h-[600px] max-w-sm sm:max-w-none bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bird className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">CRANE</h3>
                <p className="text-xs text-primary-200">UEAB ODeL Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`p-2 rounded-full ${message.sender === 'user' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                      {message.sender === 'user' ? (
                        <FaUser className="h-4 w-4 text-primary-600" />
                      ) : (
                        <FaRobot className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-primary-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Replies */}
                  {message.quickReplies && message.sender === 'bot' && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs bg-white border border-primary-200 text-primary-600 px-3 py-1 rounded-full hover:bg-primary-50 transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* User Registration Form */}
            {showUserForm && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <FaRobot className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">Please provide your details:</span>
                    </div>
                    <UserRegistrationForm 
                      onSubmit={handleUserRegistration}
                      onCancel={() => setShowUserForm(false)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center space-x-2">
                  <FaRobot className="h-4 w-4 text-gray-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors"
              >
                <FaPaperPlane className="h-4 w-4" />
              </button>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="mt-2 flex justify-center space-x-2">
              <button
                onClick={() => handleQuickReply('Admission Process')}
                className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
              >
                <FaGraduationCap className="inline h-3 w-3 mr-1" />
                Admissions
              </button>
              <button
                onClick={() => handleQuickReply('Course Information')}
                className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
              >
                <FaBook className="inline h-3 w-3 mr-1" />
                Courses
              </button>
              <button
                onClick={() => handleQuickReply('Contact Support')}
                className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
              >
                <FaTicketAlt className="inline h-3 w-3 mr-1" />
                Support
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// User Registration Form Component
interface UserRegistrationFormProps {
  onSubmit: (data: UserInfo) => void
  onCancel: () => void
}

function UserRegistrationForm({ onSubmit, onCancel }: UserRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        ...formData,
        isRegistered: true
      })
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-blue-800 mb-1">Full Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-300' : 'border-blue-200'
          }`}
          placeholder="Enter your full name"
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-blue-800 mb-1">Email Address *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-300' : 'border-blue-200'
          }`}
          placeholder="Enter your email"
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-blue-800 mb-1">Phone Number *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.phone ? 'border-red-300' : 'border-blue-200'
          }`}
          placeholder="Enter your phone number"
        />
        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-blue-800 mb-1">Student ID (Optional)</label>
        <input
          type="text"
          value={formData.studentId}
          onChange={(e) => handleChange('studentId', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your student ID if applicable"
        />
      </div>

      <div className="flex space-x-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
        >
          <FaSave className="h-3 w-3 mr-1" />
          Save & Continue
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center"
        >
          <FaArrowLeft className="h-3 w-3 mr-1" />
          Skip
        </button>
      </div>
    </form>
  )
}

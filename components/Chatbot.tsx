'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  FaTimes, FaPaperPlane, FaUser, FaSpinner, 
  FaTicketAlt, FaBook, FaCalendarAlt, FaGraduationCap, FaSave, FaArrowLeft, FaCheck
} from 'react-icons/fa'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'quick_reply' | 'escalation' | 'user_form' | 'card' | 'resource'
  quickReplies?: string[]
  card?: {
    title: string
    description: string
    image?: string
    link?: string
    actions?: { label: string; action: string }[]
  }
  sentiment?: 'positive' | 'neutral' | 'negative' | 'frustrated'
  status?: 'sending' | 'sent' | 'delivered'
}

interface UserInfo {
  name: string
  email: string
  phone?: string
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
    isRegistered: false
  })
  const [showUserForm, setShowUserForm] = useState(false)
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [moodleUserId, setMoodleUserId] = useState<number | null>(null)
  const [conversationContext, setConversationContext] = useState<string[]>([])
  const [userSentiment, setUserSentiment] = useState<'positive' | 'neutral' | 'negative' | 'frustrated'>('neutral')
  const [isListening, setIsListening] = useState(false)
  const [displayedReplyIds, setDisplayedReplyIds] = useState<Set<string>>(new Set())
  const displayedReplyIdsRef = useRef<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Helper to check for personal/eLearning queries that require login
  const isPersonalQuery = (msg: string): boolean => {
    return /\b(my|grade|deadline|assignment|calendar|dashboard|course|enrol|user|profile|status|progress|event|result|student|attendance|report)\b/i.test(msg)
  }

  const isLoggedIn = userInfo.isRegistered

  // Enhanced sentiment detection
  const detectSentiment = (text: string): 'positive' | 'neutral' | 'negative' | 'frustrated' => {
    const lower = text.toLowerCase()
    
    // Frustrated indicators
    const frustratedWords = ['not working', 'doesn\'t work', 'broken', 'error', 'problem', 'issue', 'help!', 'urgent', 'asap', 'frustrated', 'angry', 'terrible', 'worst', 'useless', 'hate']
    if (frustratedWords.some(word => lower.includes(word))) return 'frustrated'
    
    // Negative indicators
    const negativeWords = ['bad', 'poor', 'difficult', 'hard', 'confused', 'don\'t understand', 'can\'t', 'unable', 'failed', 'wrong']
    if (negativeWords.some(word => lower.includes(word))) return 'negative'
    
    // Positive indicators
    const positiveWords = ['thank', 'thanks', 'great', 'good', 'excellent', 'perfect', 'awesome', 'love', 'appreciate', 'helpful']
    if (positiveWords.some(word => lower.includes(word))) return 'positive'
    
    return 'neutral'
  }

  // Enhanced NLP for better intent recognition
  const detectIntent = (text: string): string => {
    const lower = text.toLowerCase()
    
    // Resources & Library
    if (/\b(resource|library|book|journal|research|guide|tutorial|pdf|download|myloft|opac|repository)\b/i.test(lower)) return 'resources'
    
    // Technical Support
    if (/\b(login|password|access|technical|error|bug|issue|problem|not working|broken|reset|forgot)\b/i.test(lower)) return 'technical'
    
    // Admissions
    if (/\b(admission|apply|application|enroll|registration|requirements|how to join|join|register)\b/i.test(lower)) return 'admission'
    
    // Courses & Programs
    if (/\b(course|program|degree|bachelor|master|phd|curriculum|study|major)\b/i.test(lower)) return 'courses'
    
    // Fees & Payment
    if (/\b(fee|tuition|cost|payment|price|scholarship|financial aid|pay)\b/i.test(lower)) return 'fees'
    
    // Personal queries (grades, deadlines, etc.)
    if (/\b(my|grade|deadline|assignment|calendar|dashboard|course|profile|status|progress)\b/i.test(lower)) return 'personal'
    
    // Contact
    if (/\b(contact|phone|email|address|location|office|visit|call)\b/i.test(lower)) return 'contact'
    
    // Greetings
    if (/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i.test(lower)) return 'greeting'
    
    return 'unknown'
  }

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
      response: 'Contact UEAB ODeL Center:\n\n📞 Phone: +254 714 333 111\n📧 Email: odel@ueab.ac.ke\n📍 Address: P.O. Box 2500, 30100 Eldoret, Kenya\n\nOffice Hours: Monday-Friday, 8:00 AM - 5:00 PM',
      quickReplies: ['Call Now', 'Send Email', 'Visit Campus', 'Office Hours']
    },
    'resources': {
      keywords: ['resource', 'library', 'book', 'journal', 'research', 'guide', 'tutorial', 'myloft', 'opac'],
      response: 'UEAB Library Resources:\n\n📚 E-Books & Journals\n🔍 Library Catalog (OPAC)\n📖 MyLOFT Digital Library\n📄 Research Guides & Tutorials\n🎓 Academic Tools\n\nAccess all resources, FAQs, and user guides on our Resources page.',
      quickReplies: ['View Resources', 'Library Support', 'E-Resources', 'User Guides']
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
            studentId: j.user.studentId,
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
        addBotMessage(`Hello ${userInfo.name?.split(' ')[0] || ''}! I'm CRANE, your ODeL assistant. How can I help you today?`, [
          'My deadlines', 'My grades', 'Programs', 'Browse FAQs'
        ])
      } else {
        addBotMessage(
          "Hi! I'm CRANE (UEAB ODeL Chatbot). I can help you with:\n\n• General course information\n• Admission process\n• Technical support\n• FAQs\n\nFor personalized help with grades, deadlines, or your courses, please log in first.", 
          ['Go to Login', 'Browse FAQs', 'Course Information', 'Talk to Support']
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
    
    // If there's an active ticket and polling, send message as reply to ticket
    if (currentTicketId && isPolling) {
      // Add message with 'sending' status
      const messageId = Date.now().toString()
      const newMessage: Message = {
        id: messageId,
        text: userMessage,
        sender: 'user',
        timestamp: new Date(),
        type: 'text',
        status: 'sending'
      }
      setMessages(prev => [...prev, newMessage])
      setInputValue('')
      
      try {
        const response = await fetch('/api/live-chat/replies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            userInfo: {
              name: userInfo.name,
              email: userInfo.email
            },
            ticketId: currentTicketId,
            sessionId: sessionId
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          // Update message status to 'sent'
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, status: 'sent' } : msg
          ))
        } else {
          // Update message status to show error
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, status: undefined } : msg
          ))
          addBotMessage('Failed to send message. Please try again or contact support directly.', ['Talk to Support', 'Contact Support Directly'])
        }
      } catch (error) {
        // Update message status to show error
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: undefined } : msg
        ))
        addBotMessage('Failed to send message. Please try again.', ['Talk to Support'])
      }
      return
    }
    
    // Detect sentiment and intent
    const sentiment = detectSentiment(userMessage)
    const intent = detectIntent(userMessage)
    
    setUserSentiment(sentiment)
    addMessage(userMessage, 'user')
    setInputValue('')
    setIsTyping(true)
    
    // Add to conversation context
    setConversationContext(prev => [...prev.slice(-4), userMessage])

    // Auto-escalate if user is frustrated
    if (sentiment === 'frustrated') {
      setIsTyping(false)
      addBotMessage('I sense you\'re having difficulties. Let me connect you with our support team right away for immediate assistance.', ['Talk to Support Now', 'ITS Support', 'Library Support'])
      return
    }

    // Block personal queries if not logged in
    if (!isLoggedIn && isPersonalQuery(userMessage)) {
      setIsTyping(false)
      addBotMessage('For personalized eLearning help (grades, courses, deadlines, events), please log in first.', ['Go to Login', 'Browse FAQs', 'Talk to Support'])
      return
    }
    
    // Handle resources intent
    if (intent === 'resources') {
      setIsTyping(false)
      addBotMessage('I can help you access library resources! We have:\n\n📚 Electronic Journals & E-Books\n🔍 Library Catalog (OPAC)\n📖 MyLOFT Digital Library\n📄 User Guides & Tutorials\n🎓 Academic Tools (Turnitin, Mendeley)\n\nVisit our Resources page for complete access and FAQs.', ['View Resources', 'Library Support', 'ITS Support', 'User Guides'])
      return
    }

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
          addBotMessage("I couldn't find that email in Moodle. If you're new, I can help you with general questions or connect you to support.", ['Browse FAQs', 'Talk to Support'])
          setShowUserForm(true)
        }
      } else if (answer?.type === 'fallback') {
        addBotMessage(answer.data.text || 'I couldn\'t find a specific answer to that. Would you like to talk to our support team?', ['Talk to Support', 'Browse FAQs', 'View All Courses'])
      } else {
        addBotMessage('I\'m not sure how to help with that. Would you like to talk to our support team?', ['Talk to Support', 'Browse FAQs'])
      }
    } catch (e) {
      setIsTyping(false)
      addBotMessage('Something went wrong. Please try again or talk to our support team.', ['Talk to Support', 'Browse FAQs'])
    }
  }

  const handleQuickReply = (reply: string) => {
    addMessage(reply, 'user')
    
    // Handle login redirect
    if (reply === 'Go to Login') {
      if (typeof window !== 'undefined') window.location.assign('/login')
      return
    }

    // Block personal queries if not logged in
    if (!isLoggedIn && ['My deadlines', 'My grades', 'My Courses', 'Calendar', 'Dashboard', 'Events', 'Profile', 'Attendance'].includes(reply)) {
      addBotMessage('For personalized eLearning help, please log in first.', ['Go to Login', 'Browse FAQs', 'Talk to Support'])
      return
    }
    
    // Handle specific quick replies
    switch (reply) {
      case 'Talk to Support':
      case 'Contact Support':
      case 'Create Ticket':
        handleEscalateToHelpdesk(reply)
        break
      case 'Browse FAQs':
        addBotMessage("Here are some common topics:\n\n• Admission Process\n• Course Information\n• Library Resources\n• Technical Support\n• Fees & Payment\n• Contact Information\n\nWhat would you like to know more about?", ['Admission Process', 'Course Information', 'Library Resources', 'Technical Support'])
        break
      case 'View Resources':
      case 'Library Resources':
        if (typeof window !== 'undefined') window.location.assign('/resources')
        break
      case 'Library Support':
        addBotMessage('Library Support:\n\n📧 Email: librarysupport@ueab.ac.ke\n📍 Visit: UEAB Main Campus Library\n🕐 Hours: Sun-Thu 7AM-5:30PM, 7PM-10:30PM\n\nFor e-resources, guides, and FAQs, visit our Resources page.', ['View Resources', 'Email Library', 'Talk to Support'])
        break
      case 'ITS Support':
        addBotMessage('ITS Technical Support:\n\n📧 Email: support@ueab.ac.ke\n📍 Visit: ITS Office - Main Campus\n💻 For: Login issues, platform access, technical problems\n\nOur IT team is ready to help!', ['Email ITS', 'Talk to Support', 'View Resources'])
        break
      case 'User Guides':
      case 'E-Resources':
        addBotMessage('Access comprehensive user guides:\n\n📱 MyLOFT Tutorials (Web & Mobile)\n📚 E-Resources Access Guide\n✍️ APA Citation Guide\n🔍 OPAC Search Guide\n📖 Mendeley Reference Manager\n\nAll guides available on the Resources page!', ['View Resources', 'Library Support'])
        break
      case 'Email Library':
        if (typeof window !== 'undefined') window.location.href = 'mailto:librarysupport@ueab.ac.ke'
        break
      case 'Email ITS':
        if (typeof window !== 'undefined') window.location.href = 'mailto:support@ueab.ac.ke'
        break
      case 'Talk to Support Now':
        handleEscalateToHelpdesk('Urgent Support Request')
        break
      case 'Check Ticket Status':
        checkTicketStatus()
        break
      case 'Add More Information':
        addBotMessage("Please provide any additional information about your request:")
        break
      case 'Close Chat':
        // Stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
        setIsPolling(false)
        setCurrentTicketId(null)
        addBotMessage('Chat closed. Your ticket remains open and our team will still contact you via email. Feel free to start a new conversation anytime!', ['Talk to Support', 'Browse FAQs'])
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
        if (!isLoggedIn) {
          addBotMessage('Please log in to view your personalized deadlines.', ['Go to Login', 'Talk to Support'])
        } else {
          askCrane('my deadlines').then((ans)=>{
            const items = ans?.data?.items||[]
            if (items.length > 0) {
              addBotMessage(`Your upcoming deadlines:\n\n${items.slice(0,5).map((x:any,i:number)=>`${i+1}. ${x.name || x.title || 'Item'}`).join('\n')}`)
            } else {
              addBotMessage('No upcoming deadlines found. You\'re all caught up!')
            }
          }).catch(() => addBotMessage('Unable to fetch deadlines. Please try again later.', ['Talk to Support']))
        }
        break
      case 'My grades':
        if (!isLoggedIn) {
          addBotMessage('Please log in to view your grades.', ['Go to Login', 'Talk to Support'])
        } else {
          askCrane('my grades').then((ans)=>{
            const items = ans?.data?.items||[]
            if (items.length > 0) {
              addBotMessage(`Your grades summary:\n\n${items.slice(0,5).map((x:any,i:number)=>`${i+1}. ${x.coursename || x.name || 'Course'}`).join('\n')}`)
            } else {
              addBotMessage('No grades available yet.')
            }
          }).catch(() => addBotMessage('Unable to fetch grades. Please try again later.', ['Talk to Support']))
        }
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
      'Admission Process', 'Course Information', 'Technical Support', 'Talk to Support'
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
            phone: userInfo.phone || 'Not provided',
            studentId: userInfo.studentId || 'Not provided'
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
        
        addBotMessage(`✅ Support ticket #${result.ticketId} created successfully!\n\nOur support team will contact you at:\n📧 ${userInfo.email}\n\nExpected response time: Within 24 hours\n\nYou can also reach us directly at:\n📞 +254 714 333 111\n📧 odel@ueab.ac.ke`, [
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
    // Clear any existing polling interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/live-chat/replies?ticketId=${ticketId}&sessionId=${sessionId}`)
        const result = await response.json()
        
        if (result.success && result.replies && result.replies.length > 0) {
          // Create a batch of new reply IDs to add
          const newReplyIds: string[] = []
          const newMessages: Message[] = []
          
          result.replies.forEach((reply: any) => {
            const replyId = reply.id ? String(reply.id) : `${reply.from}-${reply.created_at}`
            
            // Check against ref (which persists across renders)
            if (!displayedReplyIdsRef.current.has(replyId) && !newReplyIds.includes(replyId)) {
              console.log('New reply detected:', replyId)
              newReplyIds.push(replyId)
              
              // Create the message
              const newMessage: Message = {
                id: `reply-${replyId}`,
                text: `💬 Support Team:\n\n${reply.body}`,
                sender: 'bot',
                timestamp: new Date(reply.created_at || Date.now()),
                type: 'text',
                quickReplies: ['Close Chat']
              }
              newMessages.push(newMessage)
            } else {
              console.log('Reply already displayed:', replyId)
            }
          })

          // Add all new messages at once
          if (newMessages.length > 0) {
            console.log(`Adding ${newMessages.length} new messages`)
            
            // Update ref immediately
            newReplyIds.forEach(id => displayedReplyIdsRef.current.add(id))
            
            // Update state
            setDisplayedReplyIds(prev => {
              const newSet = new Set(prev)
              newReplyIds.forEach(id => newSet.add(id))
              return newSet
            })
            
            // Add messages
            setMessages(prev => [...prev, ...newMessages])
          } else {
            console.log('No new messages to add')
          }
        }
      } catch (error) {
        console.error('Error polling for replies:', error)
      }
    }, 10000) // Poll every 10 seconds

    // Store interval for cleanup
    pollIntervalRef.current = pollInterval
  }

  const checkTicketStatus = async () => {
    if (!currentTicketId) {
      addBotMessage("No active ticket found. Would you like to create a new support request?", ['Talk to Support', 'Browse FAQs'])
      return
    }

    try {
      const response = await fetch(`/api/live-chat?ticketId=${currentTicketId}`)
      const result = await response.json()
      
      if (result.success) {
        addBotMessage(`📋 Ticket #${currentTicketId} Status: ${result.status}\n\nOur team is working on your request. You'll be notified when there's an update.\n\nCurrent status: ${result.state}`, ['Add More Information', 'Contact Support Directly'])
      } else {
        addBotMessage(`Ticket #${currentTicketId} is being processed. Our team will contact you soon.`, ['Contact Support Directly'])
      }
    } catch (error) {
      addBotMessage(`Unable to check ticket status right now. Please try again later or contact support directly at +254 714 333 111.`, ['Talk to Support'])
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
            <div className="bg-white rounded-full p-2 sm:p-3 shadow-md group-hover:animate-pulse animate-float animate-glow relative">
              <span className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping"></span>
              <Image src="/images/icons/bird-crane-shape.svg" alt="CRANE" width={20} height={20} className="relative z-10 h-4 w-4 sm:h-5 sm:w-5" />
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
              <div className="bg-white/20 p-2 rounded-full animate-float">
                <Image src="/images/icons/bird-crane-shape.svg" alt="CRANE" width={20} height={20} className="h-5 w-5 invert" />
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
                        <Image src="/images/icons/bird-crane-shape.svg" alt="CRANE" width={16} height={16} className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <div className={`flex items-center justify-between mt-1 ${
                        message.sender === 'user' ? 'text-primary-200' : 'text-gray-500'
                      }`}>
                        <p className="text-xs">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {message.sender === 'user' && message.status && (
                          <span className="text-xs ml-2">
                            {message.status === 'sending' && '○'}
                            {message.status === 'sent' && '✓'}
                            {message.status === 'delivered' && '✓✓'}
                          </span>
                        )}
                      </div>
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
                      <Image src="/images/icons/bird-crane-shape.svg" alt="CRANE" width={16} height={16} className="h-4 w-4" />
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
                  <Image src="/images/icons/bird-crane-shape.svg" alt="CRANE" width={16} height={16} className="h-4 w-4" />
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
            {/* Live Chat Active Indicator */}
            {currentTicketId && isPolling && (
              <div className="mb-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center justify-between">
                <span>💬 Live chat active - Ticket #{currentTicketId}</span>
                <span className="animate-pulse">●</span>
              </div>
            )}
            
            {/* Sentiment Indicator */}
            {userSentiment === 'frustrated' && (
              <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                ⚠️ I notice you might be frustrated. Let me help you connect with support.
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentTicketId && isPolling ? "Type your reply to support..." : "Type your message..."}
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
            
            {/* Smart Quick Action Buttons - Context Aware */}
            <div className="mt-2 flex justify-center space-x-2 flex-wrap gap-1">
              {!isLoggedIn && (
                <button
                  onClick={() => handleQuickReply('Go to Login')}
                  className="text-xs bg-gold-50 text-gold-700 px-3 py-1 rounded-full hover:bg-gold-100 transition-colors border border-gold-200"
                >
                  🔐 Login
                </button>
              )}
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
                onClick={() => handleQuickReply('View Resources')}
                className="text-xs bg-accent-cyan/10 text-accent-cyan px-3 py-1 rounded-full hover:bg-accent-cyan/20 transition-colors"
              >
                📚 Resources
              </button>
              <button
                onClick={() => handleQuickReply('Talk to Support')}
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
    email: ''
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

      <p className="text-xs text-blue-600 italic">
        💡 We only need your name and email to help you. Our support team will contact you via email.
      </p>

      <div className="flex space-x-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
        >
          <FaSave className="h-3 w-3 mr-1" />
          Continue
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center"
        >
          <FaArrowLeft className="h-3 w-3 mr-1" />
          Cancel
        </button>
      </div>
    </form>
  )
}

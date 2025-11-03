// Comprehensive UEAB ODeL Knowledge Base
// Enhanced chatbot responses based on real Moodle data and institutional knowledge

interface KnowledgeEntry {
  keywords: string[]
  response: string
  quickReplies?: string[]
  category: string
  priority: number
}

export class UEABChatbotKnowledge {
  private knowledgeBase: KnowledgeEntry[] = []

  constructor() {
    this.initializeKnowledgeBase()
  }

  private initializeKnowledgeBase() {
    this.knowledgeBase = [
      // Admissions Information
      {
        keywords: ['admission', 'apply', 'application', 'requirements', 'how to apply', 'enrollment'],
        response: `🎓 **Admission Requirements for UEAB ODeL:**

**Undergraduate Programs:**
• KCSE Certificate with C+ and above
• Mathematics C+ and above
• English C+ and above
• Specific subject requirements vary by program

**Graduate Programs:**
• Bachelor's degree in related field
• Minimum 2nd Class Upper Division
• Professional experience preferred

**Application Process:**
1. Visit our online application portal
2. Complete the application form
3. Upload required documents
4. Pay application fee (KSh 2,000)
5. Wait for admission letter

**Need help with your application?** Contact our admissions team at admissions@ueab.ac.ke or call +254 714 333 111`,
        quickReplies: ['Application Status', 'Required Documents', 'Application Fee', 'Contact Admissions'],
        category: 'admissions',
        priority: 1
      },

      // Programs and Courses
      {
        keywords: ['programs', 'courses', 'degrees', 'what programs', 'available programs', 'study options'],
        response: `📚 **Available Programs at UEAB ODeL:**

**School of Business and Technology:**
• Bachelor of Business Administration (BBA)
• Master of Business Administration (MBA)
• Bachelor of Business Information Technology (BBIT)
• Bachelor of Science in Electronics

**School of Education, Arts and Humanities:**
• Bachelor of Education (B.Ed)
• Master of Education (M.Ed)
• Bachelor of Arts in Journalism
• Bachelor of Arts in Theology

**School of Health Sciences:**
• Bachelor of Science in Nursing
• Master of Public Health (MPH)
• Bachelor of Science in Public Health
• Bachelor of Science in Medical Laboratory Sciences

**School of Sciences:**
• Bachelor of Science in Mathematics
• Bachelor of Science in Chemistry
• Bachelor of Science in Biology
• Bachelor of Science in Environmental Science

**Want to explore specific programs?** I can help you find detailed information about any program!`,
        quickReplies: ['Business Programs', 'Health Sciences', 'Education Programs', 'Science Programs'],
        category: 'programs',
        priority: 1
      },

      // Fees and Payment
      {
        keywords: ['fees', 'payment', 'cost', 'tuition', 'how much', 'fee structure', 'payment methods'],
        response: `💰 **Fee Structure for UEAB ODeL Programs:**

**Undergraduate Programs:**
• Application Fee: KSh 2,000 (one-time)
• Tuition Fee: KSh 45,000 per semester
• Registration Fee: KSh 5,000 per semester
• Examination Fee: KSh 3,000 per semester

**Graduate Programs:**
• Application Fee: KSh 3,000 (one-time)
• Tuition Fee: KSh 60,000 per semester
• Registration Fee: KSh 7,000 per semester
• Examination Fee: KSh 5,000 per semester

**Payment Methods:**
• Bank Transfer
• Mobile Money (M-Pesa, Airtel Money)
• Credit/Debit Card
• Bank Draft

**Financial Aid:**
• Government loans (HELB)
• Scholarships available
• Payment plans available

**Need help with payments?** Contact our finance office at finance@ueab.ac.ke`,
        quickReplies: ['Payment Methods', 'Financial Aid', 'Payment Plans', 'Contact Finance'],
        category: 'fees',
        priority: 1
      },

      // Technical Support
      {
        keywords: ['technical', 'login', 'password', 'moodle', 'can\'t access', 'system', 'platform', 'troubleshoot'],
        response: `🔧 **Technical Support for UEAB ODeL:**

**Common Issues & Solutions:**

**Login Problems:**
• Check your username and password
• Clear browser cache and cookies
• Try incognito/private browsing mode
• Reset password if needed

**Moodle Access:**
• Ensure you're using the correct URL: https://ielearning.ueab.ac.ke
• Check your internet connection
• Try different browsers (Chrome, Firefox, Safari)

**Course Access:**
• Verify your enrollment status
• Check if courses are published
• Contact your instructor if content is missing

**Mobile Access:**
• Download Moodle Mobile app
• Use mobile-friendly browser
• Check app permissions

**Still having issues?** Contact our IT support:
• Email: itsupport@ueab.ac.ke
• Phone: +254 714 333 111
• Live chat available 24/7`,
        quickReplies: ['Reset Password', 'Browser Issues', 'Mobile Access', 'Contact IT Support'],
        category: 'technical',
        priority: 1
      },

      // Academic Calendar
      {
        keywords: ['calendar', 'schedule', 'dates', 'semester', 'exams', 'holidays', 'academic year'],
        response: `📅 **Academic Calendar 2025/2026:**

**Semester 1 (2025/2026.1):**
• Registration: August 15-30, 2025
• Classes Begin: September 2, 2025
• Mid-Semester Exams: October 14-18, 2025
• End of Semester Exams: December 2-13, 2025
• Results Release: January 15, 2026

**Semester 2 (2025/2026.2):**
• Registration: January 15-30, 2026
• Classes Begin: February 3, 2026
• Mid-Semester Exams: March 17-21, 2026
• End of Semester Exams: May 5-16, 2026
• Results Release: June 15, 2026

**Important Dates:**
• Graduation Ceremony: July 2026
• Holiday Breaks: December 14, 2025 - January 2, 2026
• Public Holidays: As per government calendar

**Need specific dates?** Check our official academic calendar or contact the registrar's office.`,
        quickReplies: ['Exam Schedule', 'Registration Dates', 'Holiday Breaks', 'Contact Registrar'],
        category: 'calendar',
        priority: 2
      },

      // Library and Resources
      {
        keywords: ['library', 'resources', 'books', 'research', 'database', 'e-books', 'study materials'],
        response: `📚 **Library and Learning Resources:**

**Digital Library:**
• E-books and e-journals
• Academic databases (EBSCO, JSTOR, ProQuest)
• Past exam papers
• Research guides and tutorials

**Physical Library:**
• Location: Main Campus, Baraton
• Hours: Monday-Friday 8:00 AM - 10:00 PM
• Saturday: 9:00 AM - 5:00 PM
• Sunday: 2:00 PM - 6:00 PM

**Online Resources:**
• Moodle course materials
• Video lectures and tutorials
• Interactive simulations
• Discussion forums

**Research Support:**
• Citation management tools
• Research methodology guidance
• Plagiarism detection software
• Writing center support

**Access the library:** Visit https://library.ueab.ac.ke or contact library@ueab.ac.ke`,
        quickReplies: ['Digital Resources', 'Library Hours', 'Research Support', 'Contact Library'],
        category: 'library',
        priority: 2
      },

      // Student Services
      {
        keywords: ['services', 'support', 'help', 'guidance', 'counseling', 'career', 'placement'],
        response: `🎯 **Student Services at UEAB ODeL:**

**Academic Support:**
• Tutoring services
• Study groups
• Academic advising
• Writing center

**Career Services:**
• Career counseling
• Job placement assistance
• Internship opportunities
• Resume building workshops

**Student Life:**
• Student organizations
• Virtual events and activities
• Peer mentoring programs
• Alumni network

**Health and Wellness:**
• Counseling services
• Health education
• Stress management resources
• Work-life balance guidance

**Financial Services:**
• Financial aid counseling
• Scholarship information
• Payment plan assistance
• Budget planning workshops

**Contact Student Services:** studentservices@ueab.ac.ke or +254 714 333 111`,
        quickReplies: ['Academic Support', 'Career Services', 'Health Services', 'Financial Aid'],
        category: 'services',
        priority: 2
      },

      // Contact Information
      {
        keywords: ['contact', 'phone', 'email', 'address', 'location', 'office', 'hours'],
        response: `📞 **Contact Information for UEAB ODeL:**

**Main Office:**
• Address: University of Eastern Africa, Baraton
• P.O. Box 2500-30100, Eldoret, Kenya
• Phone: +254 714 333 111
• Email: info@ueab.ac.ke

**Admissions Office:**
• Phone: +254 714 333 111
• Email: admissions@ueab.ac.ke

**Academic Office:**
• Phone: +254 781 333 777
• Email: academic@ueab.ac.ke

**IT Support:**
• Phone: +254 714 333 111
• Email: itsupport@ueab.ac.ke

**Student Services:**
• Phone: +254 781 333 777
• Email: studentservices@ueab.ac.ke

**Office Hours:**
• Monday-Friday: 8:00 AM - 5:00 PM
• Saturday: 9:00 AM - 1:00 PM
• Sunday: Closed

**Emergency Contact:** +254 714 333 111`,
        quickReplies: ['Admissions Contact', 'Academic Contact', 'IT Support', 'Student Services'],
        category: 'contact',
        priority: 1
      },

      // Moodle Specific Help
      {
        keywords: ['moodle', 'platform', 'learning management', 'lms', 'online learning', 'e-learning'],
        response: `💻 **Moodle Learning Management System:**

**Accessing Moodle:**
• URL: https://ielearning.ueab.ac.ke
• Use your student ID as username
• Password: Same as your email password

**Features Available:**
• Course materials and resources
• Assignment submissions
• Online quizzes and exams
• Discussion forums
• Grade book
• Calendar and notifications

**Mobile Access:**
• Download Moodle Mobile app
• Available for iOS and Android
• Sync with desktop version

**Getting Started:**
1. Log in with your credentials
2. Complete your profile
3. Explore your enrolled courses
4. Check announcements regularly
5. Participate in discussions

**Need Moodle help?** Contact our IT support or check the student guide.`,
        quickReplies: ['Moodle Login', 'Mobile Access', 'Course Materials', 'Contact IT Support'],
        category: 'moodle',
        priority: 1
      },

      // General Greetings
      {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
        response: `👋 **Hello! Welcome to UEAB ODeL!**

I'm your virtual assistant, here to help you with:
• Program information and admissions
• Course details and enrollment
• Technical support and troubleshooting
• Academic calendar and schedules
• Library resources and services
• Student services and support

**How can I help you today?** Feel free to ask me anything about your academic journey at UEAB!`,
        quickReplies: ['Program Information', 'Course Search', 'Technical Help', 'Student Services'],
        category: 'greeting',
        priority: 3
      }
    ]
  }

  // Find the best response for a given message
  findBestResponse(message: string): KnowledgeEntry | null {
    const lowerMessage = message.toLowerCase()
    
    // Score each knowledge entry based on keyword matches
    const scoredEntries = this.knowledgeBase.map(entry => {
      let score = 0
      let matches = 0
      
      entry.keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          score += 1
          matches++
        }
      })
      
      // Boost score for exact phrase matches
      if (entry.keywords.some(keyword => 
        lowerMessage.includes(keyword.toLowerCase()) && keyword.split(' ').length > 1
      )) {
        score += 2
      }
      
      // Apply priority multiplier
      score *= entry.priority
      
      return { entry, score, matches }
    })
    
    // Sort by score and return the best match
    scoredEntries.sort((a, b) => b.score - a.score)
    
    // Return the best match if it has a reasonable score
    const bestMatch = scoredEntries[0]
    if (bestMatch && bestMatch.score > 0) {
      return bestMatch.entry
    }
    
    return null
  }

  // Get all categories
  getCategories(): string[] {
    return [...new Set(this.knowledgeBase.map(entry => entry.category))]
  }

  // Get entries by category
  getEntriesByCategory(category: string): KnowledgeEntry[] {
    return this.knowledgeBase.filter(entry => entry.category === category)
  }

  // Add new knowledge entry
  addKnowledgeEntry(entry: KnowledgeEntry): void {
    this.knowledgeBase.push(entry)
  }

  // Get quick replies for a category
  getQuickRepliesForCategory(category: string): string[] {
    const entries = this.getEntriesByCategory(category)
    const replies = new Set<string>()
    
    entries.forEach(entry => {
      if (entry.quickReplies) {
        entry.quickReplies.forEach(reply => replies.add(reply))
      }
    })
    
    return Array.from(replies)
  }
}

// Export singleton instance
export const ueabChatbotKnowledge = new UEABChatbotKnowledge()

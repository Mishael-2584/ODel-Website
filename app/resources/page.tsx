'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaBook, FaVideo, FaFileAlt, FaGraduationCap, FaQuestionCircle,
  FaLaptop, FaUsers, FaChalkboardTeacher, FaDownload, FaExternalLinkAlt,
  FaSearch, FaBookOpen, FaDatabase, FaUniversity, FaChevronDown, FaChevronUp,
  FaClock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLightbulb, FaTools,
  FaFileDownload, FaPlayCircle, FaLink, FaInfoCircle
} from 'react-icons/fa'

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Resource Categories
  const categories = [
    { id: 'all', label: 'All Resources', icon: FaBook },
    { id: 'library', label: 'Library Resources', icon: FaBookOpen },
    { id: 'eresources', label: 'E-Resources', icon: FaDatabase },
    { id: 'guides', label: 'User Guides', icon: FaFileAlt },
    { id: 'training', label: 'Training Videos', icon: FaVideo },
    { id: 'tools', label: 'Academic Tools', icon: FaTools }
  ]

  // Library E-Resources
  const eResources = [
    {
      title: 'Electronic Journals',
      description: 'Access thousands of peer-reviewed academic journals across all disciplines',
      icon: FaBookOpen,
      link: 'https://ueab.ac.ke/electronic-journals/',
      category: 'eresources',
      type: 'External Link'
    },
    {
      title: 'E-Books Collection',
      description: 'Comprehensive digital library of textbooks and reference materials',
      icon: FaBook,
      link: 'https://ueab.ac.ke/e-books/',
      category: 'eresources',
      type: 'External Link'
    },
    {
      title: 'Open Access Journals',
      description: 'Free access to scholarly articles and research papers',
      icon: FaDatabase,
      link: 'https://ueab.ac.ke/open-access-journals/',
      category: 'eresources',
      type: 'External Link'
    },
    {
      title: 'UEAB Library OPAC',
      description: 'Online Public Access Catalog for searching library collections',
      icon: FaSearch,
      link: 'http://opac.ueab.ac.ke/',
      category: 'library',
      type: 'External Link'
    },
    {
      title: 'MyLOFT Digital Library',
      description: 'Access digital resources and e-books through MyLOFT platform',
      icon: FaLaptop,
      link: 'https://app.myloft.xyz/user/login?institute=cloqtzoyt05skxc0124kxa4c5',
      category: 'eresources',
      type: 'External Link'
    },
    {
      title: 'UEAB Institutional Repository',
      description: 'Access research outputs, theses, and dissertations from UEAB scholars',
      icon: FaUniversity,
      link: 'https://ir.ueab.ac.ke/',
      category: 'library',
      type: 'External Link'
    },
    {
      title: 'Turnitin Plagiarism Checker',
      description: 'Check your work for originality and proper citations',
      icon: FaFileAlt,
      link: 'http://turnitin.com/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Mendeley Reference Manager',
      description: 'Organize research papers, cite sources, and collaborate with peers',
      icon: FaBook,
      link: 'https://www.mendeley.com/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Zotero Citation Tool',
      description: 'Free tool to collect, organize, cite, and share research',
      icon: FaBookOpen,
      link: 'https://www.zotero.org/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Grammarly Writing Assistant',
      description: 'Improve your writing with grammar, spelling, and style suggestions',
      icon: FaFileAlt,
      link: 'https://www.grammarly.com/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Google Scholar',
      description: 'Search scholarly literature across disciplines and sources',
      icon: FaSearch,
      link: 'https://scholar.google.com/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'ORCID Researcher ID',
      description: 'Create your unique researcher identifier for academic publications',
      icon: FaUniversity,
      link: 'https://orcid.org/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Evernote Note-Taking',
      description: 'Organize notes, research, and ideas across all your devices',
      icon: FaLaptop,
      link: 'https://evernote.com/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Notion Workspace',
      description: 'All-in-one workspace for notes, tasks, wikis, and databases',
      icon: FaTools,
      link: 'https://www.notion.so/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Quillbot Paraphrasing Tool',
      description: 'Rephrase and enhance your writing while maintaining meaning',
      icon: FaFileAlt,
      link: 'https://quillbot.com/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Canva Design Tool',
      description: 'Create presentations, infographics, and visual content for assignments',
      icon: FaLightbulb,
      link: 'https://www.canva.com/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Microsoft Office 365',
      description: 'Access Word, Excel, PowerPoint, and Teams with your student account',
      icon: FaLaptop,
      link: 'https://www.office.com/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Trello Project Management',
      description: 'Organize group projects and assignments with visual boards',
      icon: FaUsers,
      link: 'https://trello.com/',
      category: 'tools',
      type: 'External Link'
    },
    {
      title: 'Coursera Online Courses',
      description: 'Supplement your learning with free courses from top universities',
      icon: FaGraduationCap,
      link: 'https://www.coursera.org/',
      category: 'tools',
      type: 'External Link'
    }
  ]

  // User Guides & Tutorials
  const userGuides = [
    {
      title: 'MyLOFT Web Access Tutorial',
      description: 'Step-by-step guide to accessing MyLOFT digital library via web browser',
      icon: FaFileDownload,
      link: 'https://ueab.ac.ke/wp-content/uploads/2025/02/MyLOFT_UEAB_User_Tutorial_Web-Access.pdf',
      category: 'guides',
      type: 'PDF Guide'
    },
    {
      title: 'MyLOFT Mobile Tutorial',
      description: 'Complete guide for using MyLOFT on mobile devices',
      icon: FaFileDownload,
      link: 'https://ueab.ac.ke/wp-content/uploads/2025/02/MyLOFT_UEAB_User_Tutorial_Mobile.pdf',
      category: 'guides',
      type: 'PDF Guide'
    },
    {
      title: 'How to Access E-Resources',
      description: 'Comprehensive guide to accessing all electronic resources',
      icon: FaFileDownload,
      link: 'https://ueab.ac.ke/wp-content/uploads/2025/03/User-Guide-How-to-access-E-resources.pdf',
      category: 'guides',
      type: 'PDF Guide'
    },
    {
      title: 'MyLOFT Latest Enhancements',
      description: 'Learn about new features and improvements in MyLOFT',
      icon: FaFileDownload,
      link: 'https://ueab.ac.ke/wp-content/uploads/2025/03/User-Guide-MyLOFT-Latest-Enhancements.pdf',
      category: 'guides',
      type: 'PDF Guide'
    },
    {
      title: 'APA Style 7th Edition Guide',
      description: 'Common reference examples and citation guidelines',
      icon: FaFileDownload,
      link: 'https://ueab.ac.ke/wp-content/uploads/2025/03/User-Guide-APA-Style-7th-Edition-Common-Reference-Examples.pdf',
      category: 'guides',
      type: 'PDF Guide'
    },
    {
      title: 'Institutional Repository Guide',
      description: 'How to search and access research materials in the repository',
      icon: FaFileDownload,
      link: 'https://ueab.ac.ke/wp-content/uploads/2025/03/User-Guide-Institutional-Repository.pdf',
      category: 'guides',
      type: 'PDF Guide'
    },
    {
      title: 'OPAC User Guide',
      description: 'Search the library catalog effectively',
      icon: FaFileDownload,
      link: 'https://ueab.ac.ke/wp-content/uploads/2025/03/User-guide-OPAC.pdf',
      category: 'guides',
      type: 'PDF Guide'
    },
    {
      title: 'Mendeley Reference Manager',
      description: 'Organize your research and create bibliographies',
      icon: FaFileDownload,
      link: 'https://ueab.ac.ke/wp-content/uploads/2025/03/User-Guide-Mendeley-.pdf',
      category: 'guides',
      type: 'PDF Guide'
    },
    {
      title: 'UEAB Library Handbook 2024',
      description: 'Complete handbook with library policies, services, and resources',
      icon: FaFileDownload,
      link: 'https://ueab.ac.ke/wp-content/uploads/2024/09/Handbook-2024-1.pdf',
      category: 'library',
      type: 'PDF Handbook'
    }
  ]

  // Training Videos
  const trainingVideos = [
    {
      title: 'Jove Database Training',
      description: 'Learn how to use the Jove scientific video database',
      icon: FaPlayCircle,
      link: 'https://drive.google.com/file/d/1onLZD0PmMDa71hCDWw05ChSheKcQzbF3/view?usp=sharing',
      category: 'training',
      type: 'Video Recording'
    },
    {
      title: 'MyLOFT Latest Enhancements Webinar',
      description: 'Recorded webinar on new MyLOFT features and improvements',
      icon: FaPlayCircle,
      link: 'https://drive.google.com/file/d/1QSbqAdI12j8pJjoYWk1rpqqrgpxl-8eM/view?usp=sharing',
      category: 'training',
      type: 'Video Recording'
    },
    {
      title: 'E-Resources Training for Postgraduate Students',
      description: 'Comprehensive training on accessing and using electronic resources',
      icon: FaPlayCircle,
      link: 'https://drive.google.com/file/d/1_cLmW30okwT4Ge83vBi3-ftS935ct_vA/view?usp=sharing',
      category: 'training',
      type: 'Video Recording'
    }
  ]

  // Combine all resources
  const allResources = [...eResources, ...userGuides, ...trainingVideos]

  // Filter resources
  const filteredResources = allResources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // FAQ Data
  const faqs = [
    {
      question: 'How do I access the UEAB Library e-resources?',
      answer: 'You can access e-resources through the library page on the UEAB website or MyLOFT platform. Use your student credentials to log in. For detailed instructions, download the "How to Access E-Resources" guide from the User Guides section above, or contact librarysupport@ueab.ac.ke for assistance.'
    },
    {
      question: 'What is MyLOFT and how do I use it?',
      answer: 'MyLOFT is UEAB\'s digital library platform providing access to thousands of e-books and journals. You can access it via web browser or mobile app. Download our MyLOFT tutorials for step-by-step instructions on both platforms.'
    },
    {
      question: 'How can I check my assignments for plagiarism?',
      answer: 'UEAB provides access to Turnitin, a plagiarism detection tool. Your instructors will provide you with access codes. You can also consult the library staff for assistance with plagiarism checking.'
    },
    {
      question: 'Where can I find past theses and dissertations?',
      answer: 'All UEAB theses and dissertations are available in the Institutional Repository at ir.ueab.ac.ke. You can search by author, title, subject, or year. The repository also includes research papers and conference proceedings.'
    },
    {
      question: 'What citation style should I use for my assignments?',
      answer: 'UEAB primarily uses APA 7th Edition for most programs. Download our "APA Style 7th Edition Common Reference Examples" guide for proper citation formats. Some programs may require different styles - check with your instructor.'
    },
    {
      question: 'How do I search for books in the library catalog?',
      answer: 'Use the OPAC (Online Public Access Catalog) at opac.ueab.ac.ke to search for books, journals, and other materials. Download the OPAC User Guide for advanced search techniques and tips.'
    },
    {
      question: 'Can I access library resources from off-campus?',
      answer: 'Yes! All electronic resources are accessible remotely using your student credentials. This includes e-journals, e-books, databases, and the institutional repository. Some resources may require VPN access.'
    },
    {
      question: 'What are the library opening hours?',
      answer: 'Sunday-Thursday: 7:00 AM - 5:30 PM and 7:00 PM - 10:30 PM. Friday: 7:00 AM - 2:00 PM. Saturday: 7:30 PM - 10:30 PM. Hours may vary during holidays and when the university is not in session.'
    },
    {
      question: 'How do I get help with research and citations?',
      answer: 'The library offers research assistance and citation help. Email librarysupport@ueab.ac.ke or visit the UEAB Library at Main Campus during opening hours. The library staff provides training sessions on research skills and reference management tools like Mendeley.'
    },
    {
      question: 'What is Mendeley and how can it help me?',
      answer: 'Mendeley is a free reference management tool that helps you organize research papers, generate citations, and create bibliographies. Download our Mendeley User Guide to learn how to use it effectively for your research.'
    },
    {
      question: 'How do I request a book that the library doesn\'t have?',
      answer: 'Email librarysupport@ueab.ac.ke with your book request. Include the book title, author, ISBN, and reason for the request. You can also visit the library at Main Campus to submit your request in person. The library will review and consider acquiring the resource.'
    },
    {
      question: 'Are there training sessions for using library resources?',
      answer: 'Yes! The library regularly conducts training sessions on e-resources, research skills, and academic tools. Check the Recorded Trainings section above for past sessions, or email librarysupport@ueab.ac.ke for upcoming training schedules.'
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center text-white">
            <div className="inline-flex items-center bg-gold-500/20 backdrop-blur-sm border border-gold-500/30 rounded-full px-4 py-2 mb-6">
              <FaLightbulb className="mr-2" />
              <span className="text-gold-300 text-sm font-semibold">Learning Resources Hub</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Academic <span className="text-gold-400">Resources & Support</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Access comprehensive library resources, e-books, journals, user guides, and training materials 
              to support your academic journey at UEAB ODeL.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search resources, guides, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <FaDatabase className="h-10 w-10 text-primary-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">7</div>
              <div className="text-sm text-gray-600">E-Resource Platforms</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <FaFileAlt className="h-10 w-10 text-gold-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">9</div>
              <div className="text-sm text-gray-600">User Guides</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <FaVideo className="h-10 w-10 text-accent-cyan mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
              <div className="text-sm text-gray-600">Training Videos</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <FaQuestionCircle className="h-10 w-10 text-accent-green mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
              <div className="text-sm text-gray-600">FAQ Articles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {activeCategory === 'all' ? 'All Resources' : categories.find(c => c.id === activeCategory)?.label}
            </h2>
            <p className="text-gray-600">
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {filteredResources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-primary-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                      <resource.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-gold-100 text-gold-800 rounded-full">
                      {resource.type}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    <span>Access Resource</span>
                    <FaExternalLinkAlt className="ml-2 h-3 w-3" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaSearch className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <FaQuestionCircle className="mr-2" />
              Frequently Asked Questions
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Got Questions? We've Got Answers
            </h2>
            <p className="text-xl text-gray-600">
              Find answers to common questions about library resources and academic support
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-primary-300 transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <FaChevronUp className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  ) : (
                    <FaChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need Additional Support?</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Our library and IT support teams are here to assist you with resources, technical issues, 
              and any questions about using our academic tools and platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Library Support */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gold-500/20 rounded-lg">
                  <FaBook className="h-6 w-6 text-gold-400" />
                </div>
                <h3 className="text-2xl font-bold">Library Support</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Get help with research assistance, resource access, and academic tools.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FaEnvelope className="h-5 w-5 text-gold-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Email Library Support</div>
                    <a href="mailto:librarysupport@ueab.ac.ke" className="text-gold-300 hover:text-gold-200">
                      librarysupport@ueab.ac.ke
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="h-5 w-5 text-gold-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Visit the Library</div>
                    <div className="text-gray-300 text-sm">
                      UEAB Main Campus Library<br />
                      Get in-person assistance during opening hours
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FaClock className="h-5 w-5 text-gold-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Opening Hours</div>
                    <div className="text-gray-300 text-sm">
                      Sun-Thu: 7:00 AM - 5:30 PM, 7:00 PM - 10:30 PM<br />
                      Friday: 7:00 AM - 2:00 PM<br />
                      Saturday: 7:30 PM - 10:30 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ITS Support */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-accent-cyan/20 rounded-lg">
                  <FaLaptop className="h-6 w-6 text-accent-cyan" />
                </div>
                <h3 className="text-2xl font-bold">ITS Support</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Technical assistance for login issues, platform access, and IT-related problems.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FaEnvelope className="h-5 w-5 text-accent-cyan mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Email ITS Support</div>
                    <a href="mailto:support@ueab.ac.ke" className="text-accent-cyan hover:text-blue-300">
                      support@ueab.ac.ke
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="h-5 w-5 text-accent-cyan mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Visit ITS Office</div>
                    <div className="text-gray-300 text-sm">
                      UEAB Main Campus - ITS Department<br />
                      Get technical support during office hours
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FaPhone className="h-5 w-5 text-accent-cyan mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">ODeL Support</div>
                    <a href="mailto:odel@ueab.ac.ke" className="text-accent-cyan hover:text-blue-300">
                      odel@ueab.ac.ke
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-6 text-center">Quick Access Links</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              <a href="http://opac.ueab.ac.ke/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-sm">Library Catalog</span>
                <FaExternalLinkAlt className="h-3 w-3" />
              </a>
              <a href="https://ir.ueab.ac.ke/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-sm">Repository</span>
                <FaExternalLinkAlt className="h-3 w-3" />
              </a>
              <a href="https://app.myloft.xyz/user/login?institute=cloqtzoyt05skxc0124kxa4c5" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-sm">MyLOFT Library</span>
                <FaExternalLinkAlt className="h-3 w-3" />
              </a>
              <a href="https://ueab.ac.ke/library/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-sm">Library Page</span>
                <FaExternalLinkAlt className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

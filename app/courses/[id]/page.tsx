'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaPlay, FaStar, FaUsers, FaClock, FaBook, FaCertificate, FaDownload,
  FaCheckCircle, FaLock, FaChartLine, FaTrophy, FaComments, FaHeart,
  FaShareAlt, FaArrowLeft, FaGraduationCap, FaLanguage, FaClosedCaptioning
} from 'react-icons/fa'

export default function CourseDetailPage() {
  const [activeTab, setActiveTab] = useState('overview')
  
  const course = {
    title: 'Bachelor of Business Administration',
    category: 'School of Business and Technology',
    rating: 4.8,
    reviews: 1250,
    students: 450,
    duration: '4 years',
    lessons: 120,
    level: 'Undergraduate',
    credits: 120,
    school: 'School of Business and Technology',
    accreditation: 'CUE Accredited',
    description: 'Comprehensive business education with specialization in marketing, finance, and management. This program prepares students for leadership roles in various business sectors.',
    whatYouLearn: [
      'Strategic business planning and execution',
      'Financial management and budgeting',
      'Leadership and team management',
      'Marketing strategies and customer relations',
      'Operations and supply chain management',
      'Business analytics and decision making',
      'Entrepreneurship and innovation',
      'International business practices'
    ],
    requirements: [
      'KCSE Certificate with C+ and above',
      'Mathematics C+ and above',
      'English C+ and above',
      'Any other two subjects with C+ and above'
    ],
    careerOpportunities: [
      'Business Manager',
      'Marketing Executive',
      'Financial Analyst',
      'Operations Manager',
      'Entrepreneur',
      'Business Consultant'
    ],
    features: [
      { icon: FaBook, text: 'Comprehensive Curriculum' },
      { icon: FaCertificate, text: 'CUE Accredited Degree' },
      { icon: FaUsers, text: 'Expert Faculty' },
      { icon: FaGraduationCap, text: 'Career Preparation' },
      { icon: FaLanguage, text: 'Flexible Learning' },
      { icon: FaTrophy, text: 'Industry Recognition' }
    ]
  }

  const curriculum = [
    {
      module: 'Year 1 - Foundation Courses',
      credits: 30,
      description: 'Core foundation subjects',
      courses: [
        { title: 'Principles of Management', credits: 3, type: 'Core' },
        { title: 'Business Mathematics', credits: 3, type: 'Core' },
        { title: 'Introduction to Economics', credits: 3, type: 'Core' },
        { title: 'Business Communication', credits: 3, type: 'Core' },
        { title: 'Computer Applications', credits: 3, type: 'Core' },
        { title: 'Introduction to Accounting', credits: 3, type: 'Core' },
        { title: 'Business Law', credits: 3, type: 'Core' },
        { title: 'Principles of Marketing', credits: 3, type: 'Core' },
        { title: 'Statistics for Business', credits: 3, type: 'Core' },
        { title: 'General Education Courses', credits: 6, type: 'General' }
      ]
    },
    {
      module: 'Year 2 - Intermediate Business Studies',
      credits: 30,
      description: 'Advanced business concepts and practices',
      courses: [
        { title: 'Organizational Behavior', credits: 3, type: 'Core' },
        { title: 'Financial Management', credits: 3, type: 'Core' },
        { title: 'Marketing Management', credits: 3, type: 'Core' },
        { title: 'Operations Management', credits: 3, type: 'Core' },
        { title: 'Human Resource Management', credits: 3, type: 'Core' },
        { title: 'Business Research Methods', credits: 3, type: 'Core' },
        { title: 'Microeconomics', credits: 3, type: 'Core' },
        { title: 'Cost Accounting', credits: 3, type: 'Core' },
        { title: 'Business Ethics', credits: 3, type: 'Core' },
        { title: 'Elective Courses', credits: 6, type: 'Elective' }
      ]
    },
    {
      module: 'Year 3 - Specialized Business Areas',
      credits: 30,
      description: 'Specialization and advanced business topics',
      courses: [
        { title: 'Strategic Management', credits: 3, type: 'Core' },
        { title: 'International Business', credits: 3, type: 'Core' },
        { title: 'Entrepreneurship', credits: 3, type: 'Core' },
        { title: 'Project Management', credits: 3, type: 'Core' },
        { title: 'Business Information Systems', credits: 3, type: 'Core' },
        { title: 'Leadership and Team Building', credits: 3, type: 'Core' },
        { title: 'Macroeconomics', credits: 3, type: 'Core' },
        { title: 'Managerial Accounting', credits: 3, type: 'Core' },
        { title: 'Business Statistics', credits: 3, type: 'Core' },
        { title: 'Elective Courses', credits: 6, type: 'Elective' }
      ]
    },
    {
      module: 'Year 4 - Capstone and Integration',
      credits: 30,
      description: 'Final year integration and capstone project',
      courses: [
        { title: 'Business Policy and Strategy', credits: 3, type: 'Core' },
        { title: 'Capstone Project', credits: 6, type: 'Core' },
        { title: 'Business Internship', credits: 3, type: 'Core' },
        { title: 'Innovation and Change Management', credits: 3, type: 'Core' },
        { title: 'Global Business Environment', credits: 3, type: 'Core' },
        { title: 'Business Negotiations', credits: 3, type: 'Core' },
        { title: 'Corporate Governance', credits: 3, type: 'Core' },
        { title: 'Elective Courses', credits: 6, type: 'Elective' }
      ]
    }
  ]

  const reviews = [
    {
      name: 'John Mwangi',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Excellent course! Dr. Kimani explains complex concepts in a very understandable way.',
      helpful: 45
    },
    {
      name: 'Mary Akinyi',
      rating: 4,
      date: '1 month ago',
      comment: 'Great content and well-structured. The assignments really helped me understand the material.',
      helpful: 32
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-primary-600">Courses</Link>
            <span>/</span>
            <span className="text-gray-900">{course.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/courses" className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-6 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-block bg-gold-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                {course.category}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{course.title}</h1>
              
              <p className="text-xl text-gray-200">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center font-semibold text-gold-400">
                    <FaStar className="mr-1" />
                    {course.rating}
                  </span>
                  <span className="text-gray-300">({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaUsers className="text-gold-400" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaGraduationCap className="text-gold-400" />
                  <span>{course.school}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {course.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <feature.icon className="text-gold-400" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Program Information */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <div className="aspect-video bg-gradient-to-br from-primary-800 to-primary-900 rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <FaGraduationCap className="h-16 w-16 mx-auto mb-4 text-gold-400" />
                      <h3 className="text-xl font-bold">Academic Program</h3>
                      <p className="text-gold-200">University Degree</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {course.accreditation}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary-600">{course.credits} Credits</span>
                    <p className="text-sm text-gray-600">Total Program Credits</p>
                  </div>

                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                    <p className="text-primary-700 font-semibold text-sm">📚 Academic Excellence</p>
                    <p className="text-xs text-primary-600 mt-1">CUE Accredited Program</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-semibold">{course.credits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-semibold">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">School:</span>
                      <span className="font-semibold text-primary-600">{course.school}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-900 mb-3">Career Opportunities</h4>
                    <div className="space-y-2">
                      {course.careerOpportunities.slice(0, 4).map((career, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <FaCheckCircle className="text-gold-500 text-xs" />
                          <span className="text-gray-700">{career}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-around text-gray-600">
                    <button className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                      <FaShareAlt />
                      <span className="text-sm">Share</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                      <FaHeart />
                      <span className="text-sm">Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {['overview', 'curriculum', 'faculty', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-semibold border-b-2 transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.whatYouLearn.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <FaCheckCircle className="text-gold-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                    <ul className="space-y-2">
                      {course.requirements.map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Curriculum Tab */}
              {activeTab === 'curriculum' && (
                <div className="space-y-6">
                  <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Curriculum</h2>
                    <p className="text-gray-600 mb-6">
                      The Bachelor of Business Administration program is structured over four years with a comprehensive 
                      curriculum designed to provide students with a solid foundation in business principles and practices.
                    </p>
                  </div>
                  
                  {curriculum.map((year, index) => (
                    <div key={index} className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{year.module}</h3>
                        <span className="text-sm text-gray-600">{year.credits} credits</span>
                      </div>
                      <p className="text-gray-600 mb-4">{year.description}</p>
                      <div className="space-y-2">
                        {year.courses.map((course, courseIndex) => (
                          <div key={courseIndex} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                course.type === 'Core' ? 'bg-primary-500' : 
                                course.type === 'Elective' ? 'bg-gold-500' : 'bg-gray-400'
                              }`}></div>
                              <span className="text-gray-900 font-medium">
                                {course.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                course.type === 'Core' ? 'bg-primary-100 text-primary-700' : 
                                course.type === 'Elective' ? 'bg-gold-100 text-gold-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {course.type}
                              </span>
                              <span className="text-sm text-gray-600">{course.credits} credits</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="card bg-primary-50 border-primary-200">
                    <h3 className="text-lg font-bold text-primary-900 mb-2">Program Total</h3>
                    <p className="text-primary-700">
                      <strong>120 Credits</strong> - Complete undergraduate degree program
                    </p>
                  </div>
                </div>
              )}

              {/* Faculty Tab */}
              {activeTab === 'faculty' && (
                <div className="space-y-6">
                  <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Faculty & Support</h2>
                    <p className="text-gray-600 mb-6">
                      The Bachelor of Business Administration program is delivered by experienced faculty members 
                      and supported by the ODeL Center's dedicated team.
                    </p>
                  </div>

                  <div className="card">
                    <div className="flex items-start space-x-6 mb-6">
                      <div className="text-6xl">👨‍🎓</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Dr. Meshack Misoi</h3>
                        <p className="text-gray-600 mb-4">Director of ODeL Center</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FaGraduationCap className="text-primary-500" />
                            <span>Director</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaCertificate className="text-gold-500" />
                            <span>PhD Holder</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Dr. Meshack Misoi leads the ODeL Center and oversees the academic quality and delivery 
                      of all online programs, ensuring students receive excellent education and support.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="card">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="text-4xl">👨‍💻</div>
                        <div>
                          <h4 className="font-bold text-gray-900">Felix Chepsiror</h4>
                          <p className="text-gray-600 text-sm">E-learning Coordinator</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Manages the learning management system and coordinates online course delivery.
                      </p>
                    </div>

                    <div className="card">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="text-4xl">👨‍🔧</div>
                        <div>
                          <h4 className="font-bold text-gray-900">Brian Lelei</h4>
                          <p className="text-gray-600 text-sm">E-learning Support</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Provides technical support and assistance to students and faculty.
                      </p>
                    </div>
                  </div>

                  <div className="card bg-gold-50 border-gold-200">
                    <h3 className="text-lg font-bold text-gold-900 mb-2">Subject Matter Experts</h3>
                    <p className="text-gold-700 text-sm">
                      Content for this program is developed by qualified subject matter experts and faculty members 
                      from the School of Business and Technology, ensuring academic rigor and industry relevance.
                    </p>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="card">
                    <div className="flex items-center space-x-8 mb-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{course.rating}</div>
                        <div className="flex items-center justify-center text-gold-500 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} />
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">{course.reviews} reviews</div>
                      </div>
                    </div>
                  </div>

                  {reviews.map((review, index) => (
                    <div key={index} className="card">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900">{review.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex text-gold-500">
                              {[...Array(review.rating)].map((_, i) => (
                                <FaStar key={i} className="text-sm" />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{review.comment}</p>
                      <button className="text-sm text-gray-600 hover:text-gray-900">
                        👍 Helpful ({review.helpful})
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="card sticky top-32">
                <h3 className="font-bold text-gray-900 mb-4">Course Includes:</h3>
                <ul className="space-y-3 text-sm">
                  {course.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <feature.icon className="text-gold-500" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


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
    title: 'Business Administration & Management',
    category: 'Business',
    rating: 4.8,
    reviews: 1250,
    students: 1250,
    duration: '12 weeks',
    lessons: 48,
    level: 'Intermediate',
    price: 'KES 45,000',
    originalPrice: 'KES 65,000',
    instructor: {
      name: 'Dr. Sarah Kimani',
      title: 'PhD, Business Administration',
      image: '👨‍🏫',
      rating: 4.9,
      students: 5000,
      courses: 12
    },
    description: 'Master the fundamentals of business management, leadership, and strategic planning with this comprehensive course designed for aspiring managers and entrepreneurs.',
    whatYouLearn: [
      'Strategic business planning and execution',
      'Financial management and budgeting',
      'Leadership and team management',
      'Marketing strategies and customer relations',
      'Operations and supply chain management',
      'Business analytics and decision making'
    ],
    requirements: [
      'Basic understanding of business concepts',
      'Access to computer and internet',
      'Commitment to complete weekly assignments'
    ],
    features: [
      { icon: FaPlay, text: '48 HD Video Lectures' },
      { icon: FaBook, text: '200+ Reading Materials' },
      { icon: FaDownload, text: 'Downloadable Resources' },
      { icon: FaCertificate, text: 'Certificate of Completion' },
      { icon: FaLanguage, text: 'English & Swahili' },
      { icon: FaClosedCaptioning, text: 'Subtitles Available' }
    ]
  }

  const curriculum = [
    {
      module: 'Introduction to Business Management',
      lessons: 8,
      duration: '2h 30m',
      lectures: [
        { title: 'Welcome and Course Overview', duration: '15:00', isPreview: true, completed: true },
        { title: 'What is Business Management?', duration: '20:00', isPreview: true, completed: true },
        { title: 'Types of Business Organizations', duration: '25:00', isPreview: false, completed: false },
        { title: 'Business Environment Analysis', duration: '30:00', isPreview: false, completed: false },
      ]
    },
    {
      module: 'Strategic Planning & Leadership',
      lessons: 10,
      duration: '3h 15m',
      lectures: [
        { title: 'Strategic Planning Process', duration: '30:00', isPreview: false, completed: false },
        { title: 'SWOT Analysis', duration: '25:00', isPreview: false, completed: false },
        { title: 'Leadership Styles', duration: '35:00', isPreview: false, completed: false },
      ]
    },
    {
      module: 'Financial Management',
      lessons: 12,
      duration: '4h 00m',
      lectures: [
        { title: 'Financial Statements', duration: '40:00', isPreview: false, completed: false },
        { title: 'Budgeting Techniques', duration: '35:00', isPreview: false, completed: false },
        { title: 'Financial Analysis', duration: '45:00', isPreview: false, completed: false },
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
                  <span>{course.instructor.name}</span>
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

            {/* Right Column - Video Preview */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-4 relative overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gold-500 hover:bg-gold-600 w-20 h-20 rounded-full flex items-center justify-center shadow-xl-gold transition-all group-hover:scale-110">
                      <FaPlay className="h-8 w-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Preview
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-gold-600">{course.price}</span>
                    <span className="text-lg text-gray-500 line-through">{course.originalPrice}</span>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 font-semibold text-sm">🎉 30% OFF - Limited Time!</p>
                  </div>

                  <button className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-4 rounded-lg transition-all shadow-gold hover:shadow-xl-gold">
                    Enroll Now
                  </button>

                  <button className="w-full btn-outline !py-3">
                    Add to Wishlist
                  </button>

                  <div className="pt-4 border-t space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Lessons:</span>
                      <span className="font-semibold">{course.lessons} lectures</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-semibold">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Certificate:</span>
                      <span className="font-semibold text-gold-600">Yes</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-around text-gray-600">
                    <button className="flex items-center space-x-1 hover:text-gold-600 transition-colors">
                      <FaShareAlt />
                      <span className="text-sm">Share</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-gold-600 transition-colors">
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
            {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
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
                <div className="space-y-4">
                  {curriculum.map((module, index) => (
                    <div key={index} className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{module.module}</h3>
                        <span className="text-sm text-gray-600">{module.lessons} lessons • {module.duration}</span>
                      </div>
                      <div className="space-y-2">
                        {module.lectures.map((lecture, lectureIndex) => (
                          <div key={lectureIndex} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                              {lecture.completed ? (
                                <FaCheckCircle className="text-green-500" />
                              ) : lecture.isPreview ? (
                                <FaPlay className="text-gold-500" />
                              ) : (
                                <FaLock className="text-gray-400" />
                              )}
                              <span className={lecture.completed ? 'text-gray-500' : 'text-gray-900'}>
                                {lecture.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              {lecture.isPreview && (
                                <span className="text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded">Preview</span>
                              )}
                              <span className="text-sm text-gray-600">{lecture.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Instructor Tab */}
              {activeTab === 'instructor' && (
                <div className="card">
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="text-6xl">{course.instructor.image}</div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{course.instructor.name}</h2>
                      <p className="text-gray-600 mb-4">{course.instructor.title}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <FaStar className="text-gold-500" />
                          <span>{course.instructor.rating} Rating</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaUsers />
                          <span>{course.instructor.students} Students</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaBook />
                          <span>{course.instructor.courses} Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Dr. Sarah Kimani is a renowned business management expert with over 15 years of experience in both academia and industry. She has helped hundreds of students launch successful careers in business management and entrepreneurship.
                  </p>
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


'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaBook, FaUsers, FaCertificate, FaLaptop, FaChartLine, FaGlobe,
  FaPlay, FaClock, FaStar, FaArrowRight, FaGraduationCap, FaAward,
  FaUserGraduate, FaChalkboardTeacher
} from 'react-icons/fa'

export default function Home() {
  const features = [
    {
      icon: FaBook,
      title: 'Extensive Course Library',
      description: 'Access hundreds of courses across multiple disciplines from business to technology.'
    },
    {
      icon: FaChalkboardTeacher,
      title: 'Expert Instructors',
      description: 'Learn from experienced faculty members and industry professionals.'
    },
    {
      icon: FaLaptop,
      title: 'Learn Anywhere',
      description: 'Study at your own pace with 24/7 access to course materials on any device.'
    },
    {
      icon: FaCertificate,
      title: 'Recognized Certificates',
      description: 'Earn certificates and degrees recognized by employers worldwide.'
    },
    {
      icon: FaUsers,
      title: 'Interactive Learning',
      description: 'Engage with peers and instructors through forums, live sessions, and group projects.'
    },
    {
      icon: FaChartLine,
      title: 'Track Your Progress',
      description: 'Monitor your learning journey with detailed analytics and progress reports.'
    }
  ]

  const stats = [
    { icon: FaUserGraduate, value: '10,000+', label: 'Active Students' },
    { icon: FaBook, value: '500+', label: 'Online Courses' },
    { icon: FaGlobe, value: '50+', label: 'Countries' },
    { icon: FaAward, value: '95%', label: 'Success Rate' }
  ]

  const popularCourses = [
    {
      title: 'Business Administration',
      category: 'Business',
      students: 1250,
      rating: 4.8,
      duration: '12 weeks',
      level: 'Intermediate',
      image: '📊'
    },
    {
      title: 'Computer Science',
      category: 'Technology',
      students: 980,
      rating: 4.9,
      duration: '16 weeks',
      level: 'Advanced',
      image: '💻'
    },
    {
      title: 'Nursing & Health Sciences',
      category: 'Healthcare',
      students: 850,
      rating: 4.7,
      duration: '14 weeks',
      level: 'Intermediate',
      image: '🏥'
    },
    {
      title: 'Education & Teaching',
      category: 'Education',
      students: 720,
      rating: 4.8,
      duration: '10 weeks',
      level: 'Beginner',
      image: '📚'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-gold-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div className="inline-block">
                <span className="bg-gold-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  🎓 Welcome to UEAB ODel
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Transform Your Future with 
                <span className="block text-gold-400 mt-2">Quality Online Education</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Join thousands of students worldwide learning from UEAB's premier online platform. 
                Flexible, affordable, and recognized education at your fingertips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses" className="btn-secondary inline-flex items-center justify-center group">
                  Explore Courses
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/register" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-primary-900 inline-flex items-center justify-center">
                  <FaPlay className="mr-2" />
                  Get Started Free
                </Link>
              </div>
            </div>

            <div className="hidden md:block relative animate-fadeIn">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 bg-white/20 rounded-lg p-4">
                    <div className="bg-gold-500 p-3 rounded-lg">
                      <FaGraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Current Students</p>
                      <p className="text-2xl font-bold">10,000+</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-white/20 rounded-lg p-4">
                    <div className="bg-primary-500 p-3 rounded-lg">
                      <FaCertificate className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Certificates Issued</p>
                      <p className="text-2xl font-bold">5,000+</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-white/20 rounded-lg p-4">
                    <div className="bg-gold-500 p-3 rounded-lg">
                      <FaStar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Average Rating</p>
                      <p className="text-2xl font-bold">4.8/5.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mb-4 group-hover:shadow-xl transition-shadow">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Why Choose UEAB ODel?</h2>
            <p className="section-subtitle max-w-3xl mx-auto">
              Experience world-class education with cutting-edge technology and personalized support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card group hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-xl transition-shadow">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Popular Courses</h2>
              <p className="section-subtitle">Start learning with our most popular programs</p>
            </div>
            <Link href="/courses" className="hidden md:inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 group">
              View All Courses
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularCourses.map((course, index) => (
              <div key={index} className="card group hover:scale-105 transition-transform cursor-pointer">
                <div className="text-6xl mb-4">{course.image}</div>
                <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  {course.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <FaUsers className="mr-1" />
                    {course.students}
                  </span>
                  <span className="flex items-center">
                    <FaStar className="mr-1 text-gold-500" />
                    {course.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
                  <span className="flex items-center">
                    <FaClock className="mr-1" />
                    {course.duration}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                    {course.level}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/courses" className="btn-primary inline-flex items-center">
              View All Courses
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join UEAB ODel today and gain access to world-class education from anywhere in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-secondary">
              Create Free Account
            </Link>
            <Link href="/contact" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-primary-900">
              Contact Admissions
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


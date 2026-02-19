'use client'

import Link from 'next/link'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CategoryHierarchy from '@/components/CategoryHierarchy'
import CourseSearch from '@/components/CourseSearch'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaBook, FaSearch, FaFilter
} from 'react-icons/fa'

// Sample course data for search
const sampleCourses = [
  {
    id: '1',
    title: 'Bachelor of Business Administration',
    school: 'School of Business',
    level: 'Undergraduate',
    duration: '4 years',
    students: 450,
    rating: 4.8,
    credits: 120,
    description: 'Comprehensive business education covering management, marketing, finance, and entrepreneurship.',
    category: 'Business',
    language: 'English',
    certificate: true,
    badge: 'Most Popular'
  },
  {
    id: '2',
    title: 'Bachelor of Science in Nursing',
    school: 'School of Nursing & Health Sciences',
    level: 'Undergraduate',
    duration: '4 years',
    students: 380,
    rating: 4.9,
    credits: 120,
    description: 'Prepare for a rewarding career in nursing with comprehensive clinical training.',
    category: 'Nursing & Health Sciences',
    language: 'English',
    certificate: true,
    badge: 'High Demand'
  },
  {
    id: '3',
    title: 'Bachelor of Education (Science)',
    school: 'School of Education, Arts and Humanities',
    level: 'Undergraduate',
    duration: '4 years',
    students: 320,
    rating: 4.7,
    credits: 120,
    description: 'Train to become a science educator with strong pedagogical skills and subject matter expertise.',
    category: 'Education',
    language: 'English',
    certificate: true,
    badge: 'In-Demand'
  },
  {
    id: '4',
    title: 'Master of Business Administration',
    school: 'School of Business',
    level: 'Graduate',
    duration: '2 years',
    students: 180,
    rating: 4.8,
    credits: 60,
    description: 'Advanced business leadership program focusing on strategic management and global business practices.',
    category: 'Business',
    language: 'English',
    certificate: true,
    badge: 'Top Rated'
  }
]

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'search'>('browse')
  const [isLoading, setIsLoading] = useState(false)

  const handleCourseSelect = (course: any) => {
    // In a real app, this would navigate to course details
    console.log('Selected course:', course)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center text-white">
            <div className="inline-flex items-center bg-gold-500/20 backdrop-blur-sm border border-gold-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-gold-300 text-sm font-semibold">ODeL Catalogue</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Browse Our <span className="text-gold-400">Course Catalogue</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Explore comprehensive Open Distance eLearning courses from across our five schools. 
              Navigate through schools, departments, program types, and courses with our interactive catalogue.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <p className="text-gray-300">
                Looking for academic programs? 
              </p>
              <Link href="/programs" className="flex items-center space-x-2 text-gold-400 hover:text-gold-300 font-semibold group">
                <span>Visit Programs</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'browse'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaBook className="h-4 w-4" />
                <span>Browse by Category</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'search'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaSearch className="h-4 w-4" />
                <span>Search & Filter</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'browse' ? (
            <>
              <div className="mb-12 text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Interactive Course Catalogue</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Navigate through our hierarchical course structure: Academic Year → Schools → Departments → Program Types → Courses
                </p>
              </div>
              <CategoryHierarchy />
            </>
          ) : (
            <CourseSearch 
              courses={sampleCourses}
              onCourseSelect={handleCourseSelect}
            />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-gold-500/20 text-gold-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🎓 Ready to Apply?
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Academic Journey Today
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of students who have chosen UEAB for their education. 
            Apply to your preferred program and begin your path to success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-gold inline-flex items-center group">
              <FaCalendarAlt className="mr-2 group-hover:scale-110 transition-transform" />
              Apply Now
            </Link>
            <Link href="/programs" className="btn-outline-white inline-flex items-center group">
              <FaBook className="mr-2 group-hover:scale-110 transition-transform" />
              View Programs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
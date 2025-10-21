'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CategoryHierarchy from '@/components/CategoryHierarchy'
import { 
  FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaBook
} from 'react-icons/fa'

export default function CoursesPage() {
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

      {/* ODeL Catalogue - Hierarchical Category Discovery */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Interactive Course Catalogue</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Navigate through our hierarchical course structure: Academic Year → Schools → Departments → Program Types → Courses
            </p>
          </div>
          <CategoryHierarchy />
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
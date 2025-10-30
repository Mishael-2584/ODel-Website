'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { FaGraduationCap, FaFileAlt, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa'

export default function AdmissionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <FaGraduationCap className="text-6xl mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">Admissions</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Start your journey with UEAB ODeL - Flexible, Quality Education
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          <section className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">How to Apply</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-primary-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Choose Your Program</h3>
                  <p className="text-gray-600">Browse our course catalog and select the program that fits your goals</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-primary-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Submit Application</h3>
                  <p className="text-gray-600">Complete the online application form with required documents</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-primary-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Pay Application Fee</h3>
                  <p className="text-gray-600">Submit the required application fee</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-primary-600 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Receive Decision</h3>
                  <p className="text-gray-600">Get your admission decision within 2-4 weeks</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Requirements</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center space-x-3">
                <FaCheckCircle className="text-primary-600" />
                <span>Completed application form</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaCheckCircle className="text-primary-600" />
                <span>Academic transcripts and certificates</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaCheckCircle className="text-primary-600" />
                <span>Copy of National ID or Passport</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaCheckCircle className="text-primary-600" />
                <span>Passport-size photographs</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaCheckCircle className="text-primary-600" />
                <span>Application fee receipt</span>
              </li>
            </ul>
          </section>

          <div className="text-center">
            <Link 
              href="/register"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg"
            >
              Apply Now
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}

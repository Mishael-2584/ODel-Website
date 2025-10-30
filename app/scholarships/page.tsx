'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FaAward, FaGraduationCap, FaHandHoldingUsd } from 'react-icons/fa'

export default function ScholarshipsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="bg-gradient-to-r from-gold-600 to-gold-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <FaAward className="text-6xl mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">Scholarships & Financial Aid</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Making quality education accessible through financial support
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Available Scholarships</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-primary-600 pl-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Merit-Based Scholarships</h3>
                <p className="text-gray-600 mb-2">
                  Awarded to students with outstanding academic performance
                </p>
                <p className="text-sm text-primary-600">Coverage: Up to 50% tuition</p>
              </div>

              <div className="border-l-4 border-gold-600 pl-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Need-Based Financial Aid</h3>
                <p className="text-gray-600 mb-2">
                  Support for students demonstrating financial need
                </p>
                <p className="text-sm text-gold-600">Coverage: Varies based on need assessment</p>
              </div>

              <div className="border-l-4 border-green-600 pl-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Church Sponsorship</h3>
                <p className="text-gray-600 mb-2">
                  Available for Seventh-day Adventist church members
                </p>
                <p className="text-sm text-green-600">Contact your local church for details</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">How to Apply</h2>
            <ol className="space-y-4 text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="bg-primary-100 text-primary-600 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</span>
                <span>Complete your admission application</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-primary-100 text-primary-600 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</span>
                <span>Submit scholarship application form</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-primary-100 text-primary-600 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</span>
                <span>Provide supporting documents (transcripts, recommendation letters)</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-primary-100 text-primary-600 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</span>
                <span>Await scholarship committee decision</span>
              </li>
            </ol>
          </section>

          <section className="bg-primary-50 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Financial Aid Office</h2>
            <p className="text-gray-700 mb-4">
              For more information about scholarships and financial aid opportunities:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>📧 Email: financialaid@ueab.ac.ke</p>
              <p>📞 Phone: +254 714 333 111</p>
              <p>📍 Office: UEAB Main Campus, Eldoret</p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  )
}

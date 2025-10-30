'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FaUniversalAccess, FaKeyboard, FaEye, FaVolumeUp } from 'react-icons/fa'

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FaUniversalAccess className="text-6xl mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Accessibility Statement</h1>
            <p className="text-xl text-primary-100">
              UEAB ODeL is committed to ensuring digital accessibility for all users
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Commitment</h2>
            <p className="text-gray-700 leading-relaxed">
              The University of Eastern Africa, Baraton is committed to ensuring that our ODeL platform is accessible 
              to all users, including those with disabilities. We strive to meet WCAG 2.1 Level AA standards and 
              continuously work to improve the accessibility of our digital content.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Accessibility Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <FaKeyboard className="text-3xl text-primary-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Keyboard Navigation</h3>
                  <p className="text-sm text-gray-600">Full keyboard accessibility for all interactive elements</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FaEye className="text-3xl text-primary-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Screen Reader Support</h3>
                  <p className="text-sm text-gray-600">Compatible with JAWS, NVDA, and VoiceOver</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FaVolumeUp className="text-3xl text-primary-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Text-to-Speech</h3>
                  <p className="text-sm text-gray-600">Audio alternatives for written content</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FaUniversalAccess className="text-3xl text-primary-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Responsive Design</h3>
                  <p className="text-sm text-gray-600">Optimized for all devices and screen sizes</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Feedback</h2>
            <p className="text-gray-700 mb-4">
              We welcome your feedback on the accessibility of the UEAB ODeL platform. Please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>📧 Email: odel@ueab.ac.ke</p>
              <p>📞 Phone: +254 714 333 111</p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  )
}

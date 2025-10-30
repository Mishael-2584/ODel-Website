'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FaFileContract, FaUserShield, FaGavel, FaExclamationTriangle } from 'react-icons/fa'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FaFileContract className="text-6xl mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-primary-100 mb-2">
              University of Eastern Africa, Baraton - ODeL Platform
            </p>
            <p className="text-sm text-primary-200">
              Last Updated: October 30, 2025 | Effective Date: October 30, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Acceptance */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the UEAB ODeL platform (odel.ueab.ac.ke), you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          {/* Eligibility */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">2. Eligibility</h2>
            <p className="text-gray-700 mb-4">To use our platform, you must:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Be at least 18 years old or have parental/guardian consent</li>
              <li>Provide accurate and complete information during registration</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Meet academic admission requirements for enrolled programs</li>
            </ul>
          </section>

          {/* User Account */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">3. User Account</h2>
            <p className="text-gray-700 mb-4">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Providing accurate and up-to-date information</li>
              <li>Using your account only for lawful educational purposes</li>
              <li>All activities that occur under your account</li>
            </ul>
          </section>

          {/* Academic Integrity */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-4">
              <FaUserShield className="text-3xl text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-800">4. Academic Integrity</h2>
            </div>
            <p className="text-gray-700 mb-4">UEAB maintains strict academic integrity standards:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>No plagiarism, cheating, or academic dishonesty</li>
              <li>Original work required for all assignments and assessments</li>
              <li>Proper citation of sources is mandatory</li>
              <li>Violations may result in disciplinary action, including expulsion</li>
              <li>Use of AI tools must be disclosed as per course guidelines</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">5. Intellectual Property</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>University Content:</strong> All course materials, lectures, videos, and resources are the intellectual property of UEAB and protected by copyright laws.</p>
              <p><strong>Student Work:</strong> Students retain rights to their original work but grant UEAB a license to use it for educational and promotional purposes.</p>
              <p><strong>Prohibited Actions:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unauthorized reproduction or distribution of course materials</li>
                <li>Commercial use of university content</li>
                <li>Sharing login credentials or course access</li>
              </ul>
              <p><strong>Fair Use:</strong> Personal educational use is permitted within the scope of your enrollment.</p>
            </div>
          </section>

          {/* Fees and Payment */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">6. Fees and Payment</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Tuition fees are as published in the course catalog</li>
              <li>Payment is required before course access is granted</li>
              <li>Refund policy follows institutional guidelines</li>
              <li>Late payment may result in service suspension</li>
              <li>Outstanding fees must be settled before graduation</li>
            </ul>
          </section>

          {/* Code of Conduct */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-4">
              <FaGavel className="text-3xl text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-800">7. Code of Conduct</h2>
            </div>
            <p className="text-gray-700 mb-4">Prohibited activities include:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Harassment, discrimination, or hate speech</li>
              <li>Sharing inappropriate or offensive content</li>
              <li>Unauthorized access to systems or data</li>
              <li>Disrupting platform operations or other users</li>
              <li>Impersonating others or providing false information</li>
              <li>Using the platform for illegal activities</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">8. Termination</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>By UEAB:</strong> We may suspend or terminate accounts for violations of these terms, non-payment, or academic misconduct.</p>
              <p><strong>By Student:</strong> You may close your account at any time by contacting support.</p>
              <p><strong>Upon Termination:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access to platform and courses will be revoked</li>
                <li>Academic records will be retained as per policy</li>
                <li>Outstanding fees must be settled</li>
                <li>Refunds (if applicable) will be processed per policy</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-4">
              <FaExclamationTriangle className="text-3xl text-yellow-600" />
              <h2 className="text-3xl font-bold text-gray-800">9. Limitation of Liability</h2>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-yellow-900 font-semibold">Important Disclaimer</p>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Platform provided "as is" without warranties of any kind</li>
              <li>Not liable for service interruptions or technical issues</li>
              <li>Not responsible for third-party content or links</li>
              <li>Liability limited to fees paid for affected services</li>
              <li>Not liable for indirect, consequential, or punitive damages</li>
            </ul>
          </section>

          {/* Changes to Terms */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700">
              We may update these terms from time to time. Significant changes will be notified via email or platform announcement. 
              Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">11. Governing Law</h2>
            <p className="text-gray-700">
              These Terms of Service are governed by the laws of the Republic of Kenya. Any disputes arising from these terms 
              shall be resolved in the courts of Kenya.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-primary-50 rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 mb-4">For questions about these Terms of Service, please contact:</p>
            <div className="space-y-2 text-gray-700">
              <p><strong>University of Eastern Africa, Baraton</strong></p>
              <p>📧 Email: odel@ueab.ac.ke</p>
              <p>📞 Phone: +254 714 333 111</p>
              <p>📍 Address: P.O. Box 2500, Eldoret 30100, Kenya</p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  )
}

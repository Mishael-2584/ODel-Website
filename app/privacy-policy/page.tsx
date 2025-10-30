'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FaShieldAlt, FaLock, FaUserShield, FaDatabase, FaEnvelope } from 'react-icons/fa'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FaShieldAlt className="text-6xl mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-primary-100 mb-2">
              University of Eastern Africa, Baraton - ODeL Platform
            </p>
            <p className="text-sm text-primary-200">
              Last Updated: October 30, 2025 | Effective Date: October 30, 2025
            </p>
            <div className="mt-6 inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <p className="text-sm">
                Compliant with Kenya Data Protection Act, 2019 & GDPR
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FaShieldAlt className="text-3xl text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-800">1. Introduction</h2>
            </div>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p className="text-lg leading-relaxed">
                Welcome to the University of Eastern Africa, Baraton (UEAB) Open Distance and eLearning (ODeL) Platform. 
                Your privacy is critically important to us, and we are committed to protecting your personal information.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
                our website <strong>odel.ueab.ac.ke</strong> and use our educational services.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                <p className="font-semibold text-blue-900">Our Commitment</p>
                <p className="text-blue-800">
                  We comply with the Kenya Data Protection Act, 2019, and the General Data Protection Regulation (GDPR).
                </p>
              </div>
              <p>
                <strong>Data Controller:</strong> University of Eastern Africa, Baraton<br />
                <strong>Contact:</strong> support@ueab.ac.ke
              </p>
            </div>
          </section>

          {/* Data Collection */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FaDatabase className="text-3xl text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-800">2. Data We Collect</h2>
            </div>
            <div className="prose max-w-none text-gray-700 space-y-6">
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, phone number, student ID</li>
                  <li>Academic transcripts, certificates, contact information</li>
                  <li>Educational background, program preferences</li>
                  <li>Support queries and conversation history</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Automatically Collected</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP address, browser type, device information</li>
                  <li>Usage data, pages visited, time spent</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Educational Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Course enrollment and completion records</li>
                  <li>Grades, assessments, academic performance</li>
                  <li>Assignment submissions and feedback</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Usage */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FaUserShield className="text-3xl text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-800">3. How We Use Your Data</h2>
            </div>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>We process your personal data for:</p>
              
              <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Educational Services</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Provide access to courses</li>
                    <li>• Manage enrollment</li>
                    <li>• Track academic progress</li>
                    <li>• Issue certificates</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Administrative</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Process admissions</li>
                    <li>• Manage accounts</li>
                    <li>• Process payments</li>
                    <li>• Comply with legal obligations</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FaLock className="text-3xl text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-800">4. Data Security</h2>
            </div>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>We implement appropriate security measures:</p>
              
              <div className="grid md:grid-cols-3 gap-4 my-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <FaLock className="text-3xl text-primary-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-1">Encryption</h4>
                  <p className="text-sm text-gray-600">SSL/TLS for data in transit</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <FaDatabase className="text-3xl text-primary-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-1">Secure Storage</h4>
                  <p className="text-sm text-gray-600">Encrypted databases</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <FaUserShield className="text-3xl text-primary-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-1">Access Control</h4>
                  <p className="text-sm text-gray-600">Role-based access</p>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FaUserShield className="text-3xl text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-800">5. Your Rights</h2>
            </div>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>Under the Kenya Data Protection Act, 2019, you have the right to:</p>
              
              <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-primary-900 mb-2">✓ Access</h4>
                  <p className="text-sm text-primary-800">Request a copy of your data</p>
                </div>
                
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-primary-900 mb-2">✓ Rectification</h4>
                  <p className="text-sm text-primary-800">Correct inaccurate data</p>
                </div>
                
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-primary-900 mb-2">✓ Erasure</h4>
                  <p className="text-sm text-primary-800">Request deletion of data</p>
                </div>
                
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-primary-900 mb-2">✓ Object</h4>
                  <p className="text-sm text-primary-800">Object to processing</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Exercise Your Rights</h4>
                <p className="text-sm text-blue-800 mb-2">Contact our Data Protection Officer:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>📧 Email: support@ueab.ac.ke</li>
                  <li>📞 Phone: +254 714 333 111</li>
                  <li>📍 Address: P.O. Box 2500, Eldoret 30100, Kenya</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">6. Cookies & Tracking</h2>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>We use cookies to enhance your experience. You can manage cookie preferences through our cookie consent banner.</p>
              
              <div className="space-y-3">
                <div className="border-l-4 border-primary-500 pl-4">
                  <h4 className="font-semibold">Essential Cookies (Required)</h4>
                  <p className="text-sm">Necessary for platform functionality</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Functional Cookies (Optional)</h4>
                  <p className="text-sm">Remember your preferences</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Analytics Cookies (Optional)</h4>
                  <p className="text-sm">Help us improve the platform</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-primary-50 rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FaEnvelope className="text-3xl text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-800">7. Contact Us</h2>
            </div>
            <p className="text-gray-700 mb-4">For questions about this Privacy Policy:</p>
            <div className="space-y-2 text-gray-700">
              <p><strong>University of Eastern Africa, Baraton</strong></p>
              <p>📧 Email: support@ueab.ac.ke</p>
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

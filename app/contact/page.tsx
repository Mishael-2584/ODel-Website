'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaUniversity,
  FaBuilding, FaUser, FaPaperPlane, FaCheckCircle, FaInfoCircle,
  FaGraduationCap, FaBook, FaCalendarAlt, FaGlobe
} from 'react-icons/fa'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Send to Zammad helpdesk as a ticket
      const response = await fetch('/api/zammad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          subject: formData.subject,
          body: `Inquiry Type: ${formData.inquiryType}\n\nMessage:\n${formData.message}`,
          tags: [formData.inquiryType, 'contact-form', 'website'],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create ticket')
      }

      const data = await response.json()
      console.log('Ticket created:', data)

      setIsSubmitting(false)
      setIsSubmitted(true)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      })

      // Auto-reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setIsSubmitting(false)
      alert('Error submitting your inquiry. Please try again or contact us directly.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      title: 'Address',
      details: [
        'P.O. Box 2500',
        '30100 Eldoret, Kenya'
      ],
      color: 'text-primary-600'
    },
    {
      icon: FaPhone,
      title: 'Phone',
      details: [
        '+254 714 333 111',
        '+254 781 333 777'
      ],
      color: 'text-green-600'
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      details: [
        'info@ueab.ac.ke',
        'admissions@ueab.ac.ke'
      ],
      color: 'text-blue-600'
    },
    {
      icon: FaClock,
      title: 'Office Hours',
      details: [
        'Monday - Friday: 8:00 AM - 5:00 PM',
        'Saturday: 9:00 AM - 1:00 PM'
      ],
      color: 'text-purple-600'
    }
  ]

  const departments = [
    {
      name: 'Admissions Office',
      email: 'admissions@ueab.ac.ke',
      phone: '+254 714 333 111',
      description: 'General admissions, program inquiries, and application support'
    },
    {
      name: 'Academic Affairs',
      email: 'academic@ueab.ac.ke',
      phone: '+254 714 333 112',
      description: 'Academic programs, course registration, and academic policies'
    },
    {
      name: 'Student Affairs',
      email: 'studentaffairs@ueab.ac.ke',
      phone: '+254 714 333 113',
      description: 'Student services, housing, and campus life'
    },
    {
      name: 'Financial Aid',
      email: 'financialaid@ueab.ac.ke',
      phone: '+254 714 333 114',
      description: 'Scholarships, financial assistance, and fee inquiries'
    },
    {
      name: 'ODeL Support',
      email: 'odel@ueab.ac.ke',
      phone: '+254 714 333 115',
      description: 'Technical support for online learning platform'
    },
    {
      name: 'Library Services',
      email: 'library@ueab.ac.ke',
      phone: '+254 714 333 116',
      description: 'Library resources, research support, and digital access'
    }
  ]

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'admissions', label: 'Admissions' },
    { value: 'academic', label: 'Academic Programs' },
    { value: 'financial', label: 'Financial Aid' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'other', label: 'Other' }
  ]

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
              <span className="text-gold-300 text-sm font-semibold">Contact UEAB</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Get in <span className="text-gold-400">Touch</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Have questions about our ODeL programs, admissions, or need technical support? 
              Our dedicated team is here to help you succeed in your online learning journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-xl text-gray-600">Multiple ways to reach us</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6`}>
                  <info.icon className={`h-8 w-8 ${info.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                <p className="text-lg text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-900 mb-2">Message Sent!</h3>
                  <p className="text-green-700 mb-6">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="btn-primary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="+254 700 000 000"
                      />
                    </div>
                    <div>
                      <label htmlFor="inquiryType" className="block text-sm font-semibold text-gray-700 mb-2">
                        Inquiry Type *
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {inquiryTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary flex items-center justify-center group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2 group-hover:translate-x-1 transition-transform" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Map and Additional Info */}
            <div className="space-y-8">
              {/* Interactive Campus Map */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Find UEAB Campus</h3>
                  <p className="text-gray-600">📍 P.O. Box 2500, 30100 Eldoret, Kenya</p>
                </div>
                
                <div className="relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.783174506244!2d35.27361!3d0.52056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17829d5d5d5d5d5d%3A0x5d5d5d5d5d5d5d5d!2sUniversity%20of%20Eastern%20Africa%20Baraton%20Main%20Campus!5e0!3m2!1sen!2ske!4v1729510800000"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                    title="UEAB Campus Location - Main Campus, Eldoret"
                  ></iframe>
                  
                  {/* Map Overlay Controls */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-md">
                    <a
                      href="https://www.google.com/maps/dir//University+of+Eastern+Africa+Baraton+Eldoret+Kenya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    >
                      <FaMapMarkerAlt className="h-4 w-4 mr-1" />
                      Get Directions
                    </a>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="https://www.google.com/maps/dir//University+of+Eastern+Africa+Baraton+Eldoret+Kenya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                      Directions
                    </a>
                    <a
                      href="https://www.google.com/maps/place/University+of+Eastern+Africa+Baraton+Eldoret+Kenya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors text-sm font-medium"
                    >
                      <FaGlobe className="h-4 w-4 mr-2" />
                      View on Google Maps
                    </a>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Click the buttons above to get directions or view the full map
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaInfoCircle className="h-5 w-5 text-primary-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Response Time</h4>
                      <p className="text-gray-600">We typically respond within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaGraduationCap className="h-5 w-5 text-primary-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Admissions</h4>
                      <p className="text-gray-600">Open year-round for most programs</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaBook className="h-5 w-5 text-primary-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Programs</h4>
                      <p className="text-gray-600">50+ programs across 5 schools</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="h-5 w-5 text-primary-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Campus Tours</h4>
                      <p className="text-gray-600">Available Monday to Friday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Departments & Services</h2>
            <p className="text-xl text-gray-600">Contact specific departments for specialized assistance</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <FaBuilding className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{dept.name}</h3>
                </div>
                
                <p className="text-gray-600 mb-6">{dept.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${dept.email}`} className="text-primary-600 hover:text-primary-700 transition-colors">
                      {dept.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaPhone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${dept.phone}`} className="text-primary-600 hover:text-primary-700 transition-colors">
                      {dept.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-gold-500/20 text-gold-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🎓 Ready to Apply?
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your UEAB Journey Today
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Don't wait! Join thousands of students who have chosen UEAB for their education. 
            Apply now and take the first step toward your academic success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-gold inline-flex items-center group">
              <FaGraduationCap className="mr-2 group-hover:scale-110 transition-transform" />
              Apply Now
            </Link>
            <Link href="/courses" className="btn-outline-white inline-flex items-center group">
              <FaBook className="mr-2 group-hover:rotate-12 transition-transform" />
              Explore Programs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
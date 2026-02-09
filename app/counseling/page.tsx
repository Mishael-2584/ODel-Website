'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  FaHeart, FaCalendarAlt, FaClock, FaUser, FaEnvelope, 
  FaPhone, FaComments, FaCheckCircle, FaTimes, FaArrowLeft,
  FaUsers, FaHandHoldingHeart, FaGraduationCap, FaVideo,
  FaShieldAlt, FaLock, FaStar, FaArrowRight, FaSpinner,
  FaUserMd, FaCalendarCheck, FaHeadset
} from 'react-icons/fa'

interface TimeSlot {
  time: string
  available: boolean
}

interface Counselor {
  id: string
  name: string
  gender: 'male' | 'female'
  specialization: string[]
  bio?: string
}

const COUNSELING_SERVICES = [
  { id: 'individual', label: 'Individual Counseling', icon: FaUser, color: 'from-blue-500 to-blue-600' },
  { id: 'group', label: 'Group Therapy', icon: FaUsers, color: 'from-purple-500 to-purple-600' },
  { id: 'crisis', label: 'Crisis Support', icon: FaHandHoldingHeart, color: 'from-red-500 to-red-600' },
  { id: 'support_group', label: 'Support Group', icon: FaUsers, color: 'from-green-500 to-green-600' },
  { id: 'vct', label: 'VCT', icon: FaCheckCircle, color: 'from-teal-500 to-teal-600' },
  { id: 'peer', label: 'Peer Counseling', icon: FaComments, color: 'from-orange-500 to-orange-600' },
  { id: 'pre_marital', label: 'Pre-Marital Counseling', icon: FaHeart, color: 'from-pink-500 to-pink-600' },
  { id: 'family', label: 'Family Therapy', icon: FaUsers, color: 'from-indigo-500 to-indigo-600' },
  { id: 'mental_health_education', label: 'Mental Health Education', icon: FaGraduationCap, color: 'from-cyan-500 to-cyan-600' },
]

const WORKING_HOURS = {
  'Monday': { start: '08:00', end: '17:00' },
  'Tuesday': { start: '08:00', end: '17:00' },
  'Wednesday': { start: '08:00', end: '17:00' },
  'Thursday': { start: '08:00', end: '17:00' },
  'Friday': { start: '08:00', end: '12:00' },
}

export default function CounselingPage() {
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    counselorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'individual',
    preferredGender: 'no_preference',
    reason: '',
    message: '',
  })
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    fetchCounselors()
  }, [])

  useEffect(() => {
    if (formData.counselorId && formData.appointmentDate) {
      fetchAvailableSlots()
    }
  }, [formData.counselorId, formData.appointmentDate])

  const fetchCounselors = async () => {
    try {
      const response = await fetch('/api/counseling/counselors')
      const data = await response.json()
      if (data.success) {
        setCounselors(data.counselors || [])
      }
    } catch (err) {
      console.error('Error fetching counselors:', err)
    }
  }

  const fetchAvailableSlots = async () => {
    if (!formData.counselorId || !formData.appointmentDate) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/counseling/available-slots?counselorId=${formData.counselorId}&date=${formData.appointmentDate}`
      )
      const data = await response.json()
      if (data.success) {
        // Filter to only show available slots
        const availableOnly = (data.slots || []).filter((slot: TimeSlot) => slot.available)
        setAvailableSlots(availableOnly)
      }
    } catch (err) {
      console.error('Error fetching available slots:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const getMinDate = (): string => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = (): string => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    setSelectedDate(date)
    setFormData({ ...formData, appointmentDate: date, appointmentTime: '' })
    setAvailableSlots([])
  }

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!email.toLowerCase().endsWith('@ueab.ac.ke')) {
      setEmailError('Please use your UEAB email address (@ueab.ac.ke)')
      return false
    }
    setEmailError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailError(null)

    // Validate email before submitting
    if (!validateEmail(formData.studentEmail)) {
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/counseling/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setFormData({
          studentName: '',
          studentEmail: '',
          studentPhone: '',
          counselorId: '',
          appointmentDate: '',
          appointmentTime: '',
          appointmentType: 'individual',
          preferredGender: 'no_preference',
          reason: '',
          message: '',
        })
        setSelectedDate('')
        setAvailableSlots([])
      } else {
        setError(data.error || 'Failed to book appointment')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredCounselors = formData.preferredGender === 'no_preference' 
    ? counselors 
    : counselors.filter(c => c.gender === formData.preferredGender)

  const selectedCounselor = counselors.find(c => c.id === formData.counselorId)
  const dayName = formData.appointmentDate ? getDayName(formData.appointmentDate) : ''
  const workingHours = dayName ? WORKING_HOURS[dayName as keyof typeof WORKING_HOURS] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Header with Art */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20 md:py-28 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link 
            href="/" 
            className="inline-flex items-center text-white/90 hover:text-white mb-8 transition-all hover:translate-x-[-4px] group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            {/* Icon with Animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              <div className="relative bg-white/20 backdrop-blur-sm p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform">
                <FaHeart className="text-7xl animate-pulse" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <FaShieldAlt className="text-sm" />
                <span className="text-sm font-medium">Confidential & Professional</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                Counseling & Psychological Services
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mb-6 leading-relaxed">
                Your journey to wellness starts here. Book a session with our experienced counselors today.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <FaLock className="text-blue-200" />
                  <span className="text-sm">100% Confidential</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUserMd className="text-blue-200" />
                  <span className="text-sm">Expert Counselors</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarCheck className="text-blue-200" />
                  <span className="text-sm">Easy Booking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-white">
            <path d="M0,0 C300,100 600,20 900,80 C1050,100 1150,40 1200,80 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Call to Action Banner */}
        <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 mb-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
                <FaCalendarCheck className="text-4xl" />
                Ready to Book Your Session?
              </h2>
              <p className="text-xl text-blue-100 mb-4">
                Take the first step towards better mental health. Our counselors are here to support you.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <FaStar className="text-yellow-300" />
                  <span className="font-semibold">Professional Counselors</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <FaHeadset className="text-blue-200" />
                  <span className="font-semibold">Available Online & In-Person</span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl font-bold mb-2">{counselors.length}</div>
              <div className="text-blue-100">Available Counselors</div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive mental health support designed to promote emotional wellness, 
              improve coping skills, and enhance personal development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {COUNSELING_SERVICES.map((service) => (
              <div 
                key={service.id}
                className="group relative p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${service.color} text-white mb-4 transform group-hover:scale-110 transition-transform`}>
                  <service.icon className="text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.label}</h3>
                <p className="text-sm text-gray-600">Professional support tailored to your needs</p>
              </div>
            ))}
          </div>

          {/* Contact Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-l-4 border-primary-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FaPhone className="text-primary-600" />
              Contact Our Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-600 text-white p-3 rounded-lg">
                    <FaUser className="text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Counselor Loice</p>
                    <p className="text-gray-600">0705571104</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 text-white p-3 rounded-lg">
                    <FaUser className="text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Counselor Pr. Zachary</p>
                    <p className="text-gray-600">0727416106</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 text-white p-3 rounded-lg">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">Counselling@ueab.ac.ke</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 text-white p-3 rounded-lg">
                    <FaClock className="text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Available</p>
                    <p className="text-gray-600">Mon-Thu: 8AM-5PM | Fri: 8AM-12PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form - Enhanced */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-pink-100 rounded-full blur-3xl opacity-50 -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-full mb-6">
                <FaCalendarCheck className="text-xl" />
                <span className="font-bold text-lg">Book Your Appointment</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Schedule Your Session</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Fill out the form below to book a confidential counseling session. 
                We'll confirm your appointment via your UEAB email address (@ueab.ac.ke).
              </p>
            </div>

            {success && (
              <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500 text-white p-3 rounded-full">
                    <FaCheckCircle className="text-2xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-green-900 text-lg mb-2">Appointment Request Submitted! 🎉</p>
                    <p className="text-green-800">
                      Your appointment request has been sent successfully. You will receive a confirmation email 
                      at your UEAB email address (@ueab.ac.ke) once a counselor confirms your booking. Please check your email for updates.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="bg-red-500 text-white p-3 rounded-full">
                    <FaTimes className="text-2xl" />
                  </div>
                  <p className="text-red-800 font-medium flex-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="bg-primary-600 text-white p-2 rounded-lg">
                    <FaUser className="text-lg" />
                  </div>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FaUser className="text-primary-600" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white text-gray-900 font-medium"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FaEnvelope className="text-primary-600" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.studentEmail}
                      onChange={(e) => {
                        setFormData({ ...formData, studentEmail: e.target.value })
                        // Clear error when user starts typing
                        if (emailError) {
                          setEmailError(null)
                        }
                      }}
                      onBlur={(e) => {
                        // Validate on blur
                        if (e.target.value) {
                          validateEmail(e.target.value)
                        }
                      }}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white text-gray-900 font-medium ${
                        emailError 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-200 focus:border-primary-600'
                      }`}
                      placeholder="your.name@ueab.ac.ke"
                    />
                    {emailError ? (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                        <FaTimes className="text-xs" />
                        {emailError}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                        <FaEnvelope className="text-xs" />
                        Please use your UEAB email address (@ueab.ac.ke) to receive appointment confirmations
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FaPhone className="text-primary-600" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.studentPhone}
                      onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white text-gray-900 font-medium"
                      placeholder="0700 000 000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FaUser className="text-primary-600" />
                      Preferred Counselor Gender
                    </label>
                    <select
                      value={formData.preferredGender}
                      onChange={(e) => setFormData({ ...formData, preferredGender: e.target.value, counselorId: '' })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white text-gray-900 font-medium"
                    >
                      <option value="no_preference">No Preference</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Appointment Details Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="bg-purple-600 text-white p-2 rounded-lg">
                    <FaCalendarAlt className="text-lg" />
                  </div>
                  Appointment Details
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Select Counselor *
                    </label>
                    {filteredCounselors.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                        <p className="text-yellow-800 text-sm">No counselors available for your preference. Please try a different selection.</p>
                      </div>
                    ) : (
                      <select
                        required
                        value={formData.counselorId}
                        onChange={(e) => setFormData({ ...formData, counselorId: e.target.value, appointmentDate: '', appointmentTime: '' })}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white text-gray-900 font-medium"
                      >
                        <option value="">Choose a counselor...</option>
                        {filteredCounselors.map((counselor) => (
                          <option key={counselor.id} value={counselor.id}>
                            {counselor.name} ({counselor.gender === 'male' ? 'Male' : 'Female'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Type of Service *
                    </label>
                    <select
                      required
                      value={formData.appointmentType}
                      onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white text-gray-900 font-medium"
                    >
                      {COUNSELING_SERVICES.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaCalendarAlt className="text-primary-600" />
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={getMinDate()}
                        max={getMaxDate()}
                        value={formData.appointmentDate}
                        onChange={handleDateChange}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white text-gray-900 font-medium"
                      />
                      {formData.appointmentDate && dayName && (
                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                          <FaCheckCircle className="text-green-500" />
                          {dayName} ({formData.appointmentDate})
                          {workingHours && ` • Available: ${workingHours.start} - ${workingHours.end}`}
                        </p>
                      )}
                    </div>

                    {formData.appointmentDate && formData.counselorId && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <FaClock className="text-primary-600" />
                          Available Time Slots *
                        </label>
                        {loading ? (
                          <div className="flex items-center justify-center py-8 text-gray-500">
                            <FaSpinner className="animate-spin text-2xl mr-3" />
                            Loading available slots...
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                            <p className="text-yellow-800 text-sm">No available slots for this date. Please select another date.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => setFormData({ ...formData, appointmentTime: slot.time })}
                                className={`px-4 py-3 rounded-xl font-bold transition-all transform ${
                                  formData.appointmentTime === slot.time
                                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg scale-105 ring-4 ring-primary-200'
                                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-700 border-2 border-gray-200 hover:border-primary-300 hover:scale-105'
                                }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <FaComments className="text-lg" />
                  </div>
                  Additional Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Reason for Appointment
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      rows={3}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all resize-none bg-white text-gray-900 font-medium"
                      placeholder="Briefly describe the reason for your appointment (optional but helpful for our counselors)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FaComments className="text-primary-600" />
                      Additional Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all resize-none bg-white text-gray-900 font-medium"
                      placeholder="Any additional information you'd like to share with your counselor..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full group relative bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white font-bold py-5 px-8 rounded-2xl hover:from-primary-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative flex items-center justify-center gap-3">
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin text-xl" />
                        Submitting Your Request...
                      </>
                    ) : (
                      <>
                        <FaCalendarCheck className="text-xl" />
                        Book My Appointment
                        <FaArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  <FaLock className="inline mr-1" />
                  Your information is confidential and secure
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

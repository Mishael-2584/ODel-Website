'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaGraduationCap, FaUser, FaFileAlt, FaCheckCircle, FaExclamationTriangle,
  FaCalendarAlt, FaPhone, FaEnvelope, FaBuilding, FaUpload
} from 'react-icons/fa'

export default function GraduateApplicationPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [applicationNumber, setApplicationNumber] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    // Personal Information
    surname: '',
    first_name: '',
    middle_name: '',
    date_of_birth: '',
    gender: '',
    nationality: 'Kenyan',
    id_passport_number: '',
    marital_status: '',
    phone_number: '',
    email: '',
    postal_address: '',
    physical_address: '',
    
    // Program Information
    program_applied_for: '',
    specialization: '',
    mode_of_study: 'Online',
    entry_level: '',
    proposed_start_date: '',
    
    // Academic Qualifications
    undergraduate_degree: '',
    undergraduate_institution: '',
    undergraduate_year: '',
    undergraduate_class: '',
    other_qualifications: '',
    
    // Work Experience
    years_of_experience: 0,
    current_employer: '',
    current_position: '',
    work_experience_details: '',
    
    // References
    referee1_name: '',
    referee1_position: '',
    referee1_institution: '',
    referee1_email: '',
    referee1_phone: '',
    referee2_name: '',
    referee2_position: '',
    referee2_institution: '',
    referee2_email: '',
    referee2_phone: '',
    
    documents_uploaded: [] as any[],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (stepNumber === 1) {
      if (!formData.surname) newErrors.surname = 'Surname is required'
      if (!formData.first_name) newErrors.first_name = 'First name is required'
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required'
      if (!formData.gender) newErrors.gender = 'Gender is required'
      if (!formData.email) newErrors.email = 'Email is required'
      if (!formData.phone_number) newErrors.phone_number = 'Phone number is required'
    } else if (stepNumber === 2) {
      if (!formData.program_applied_for) newErrors.program_applied_for = 'Program is required'
    } else if (stepNumber === 3) {
      if (!formData.undergraduate_degree) newErrors.undergraduate_degree = 'Undergraduate degree is required'
      if (!formData.undergraduate_institution) newErrors.undergraduate_institution = 'Institution is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(4)) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          years_of_experience: parseInt(formData.years_of_experience.toString()) || 0,
          undergraduate_year: formData.undergraduate_year ? parseInt(formData.undergraduate_year) : null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setApplicationNumber(result.data.application_number)
        setIsSubmitted(true)
      } else {
        alert('Error submitting application: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Error submitting application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const programs = [
    'Master of Business Administration (MBA)',
    'Master of Science in Computer Science',
    'Master of Education',
    'Master of Arts in Theology',
    'Master of Public Health',
    'Master of Science in Nursing',
    'Doctor of Philosophy (PhD)',
    'Other',
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20">
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
            <FaCheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h1>
            <p className="text-lg text-gray-700 mb-6">
              Your graduate application has been received.
            </p>
            <div className="bg-white rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Application Number</p>
              <p className="text-2xl font-bold text-primary-600">{applicationNumber}</p>
            </div>
            <p className="text-gray-600 mb-6">
              Please save this number for future reference. You can use it to check your application status.
            </p>
            <div className="space-y-4">
              <Link href="/" className="btn-primary inline-block">
                Return to Homepage
              </Link>
              <p className="text-sm text-gray-500">
                An email confirmation has been sent to {formData.email}
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Graduate Application Form</h1>
          <p className="text-xl text-gray-200">University of Eastern Africa, Baraton (UEAB)</p>
        </div>
      </section>

      {/* Progress Indicator */}
      <section className="bg-gray-50 border-b py-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= num
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step > num ? <FaCheckCircle /> : num}
                  </div>
                  <span className={`text-xs mt-2 ${step >= num ? 'text-primary-600' : 'text-gray-500'}`}>
                    {num === 1 && 'Personal Info'}
                    {num === 2 && 'Program Info'}
                    {num === 3 && 'Qualifications'}
                    {num === 4 && 'Review & Submit'}
                  </span>
                </div>
                {num < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      step > num ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Surname <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        errors.surname ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Middle Name</label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ID/Passport Number</label>
                    <input
                      type="text"
                      name="id_passport_number"
                      value={formData.id_passport_number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Marital Status</label>
                    <select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        errors.phone_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Address</label>
                    <textarea
                      name="postal_address"
                      value={formData.postal_address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Physical Address</label>
                    <textarea
                      name="physical_address"
                      value={formData.physical_address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next: Program Information
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Program Information */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Program Information</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Program Applied For <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="program_applied_for"
                    value={formData.program_applied_for}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      errors.program_applied_for ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                  {errors.program_applied_for && <p className="text-red-500 text-sm mt-1">{errors.program_applied_for}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mode of Study</label>
                    <select
                      name="mode_of_study"
                      value={formData.mode_of_study}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Online">Online</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Entry Level</label>
                    <select
                      name="entry_level"
                      value={formData.entry_level}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Entry Level</option>
                      <option value="Direct Entry">Direct Entry</option>
                      <option value="Mature Entry">Mature Entry</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Proposed Start Date</label>
                    <input
                      type="date"
                      name="proposed_start_date"
                      value={formData.proposed_start_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next: Academic Qualifications
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Academic Qualifications & Work Experience */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Qualifications</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Undergraduate Degree <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="undergraduate_degree"
                        value={formData.undergraduate_degree}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                          errors.undergraduate_degree ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.undergraduate_degree && <p className="text-red-500 text-sm mt-1">{errors.undergraduate_degree}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Institution <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="undergraduate_institution"
                        value={formData.undergraduate_institution}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                          errors.undergraduate_institution ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.undergraduate_institution && <p className="text-red-500 text-sm mt-1">{errors.undergraduate_institution}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Year of Completion</label>
                      <input
                        type="number"
                        name="undergraduate_year"
                        value={formData.undergraduate_year}
                        onChange={handleInputChange}
                        min="1950"
                        max={new Date().getFullYear()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Class/Division</label>
                      <select
                        name="undergraduate_class"
                        value={formData.undergraduate_class}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select Class</option>
                        <option value="First Class">First Class</option>
                        <option value="Second Class Upper">Second Class Upper</option>
                        <option value="Second Class Lower">Second Class Lower</option>
                        <option value="Pass">Pass</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Other Qualifications</label>
                      <textarea
                        name="other_qualifications"
                        value={formData.other_qualifications}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="List any additional qualifications, certifications, or awards"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Work Experience</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                      <input
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Employer</label>
                      <input
                        type="text"
                        name="current_employer"
                        value={formData.current_employer}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Position</label>
                      <input
                        type="text"
                        name="current_position"
                        value={formData.current_position}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Work Experience Details</label>
                      <textarea
                        name="work_experience_details"
                        value={formData.work_experience_details}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Provide details about your professional experience"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">References</h2>
                  
                  <div className="space-y-6">
                    {/* Referee 1 */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Referee 1</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" name="referee1_name" value={formData.referee1_name} onChange={handleInputChange} placeholder="Full Name" className="px-4 py-2 border border-gray-300 rounded-lg" />
                        <input type="text" name="referee1_position" value={formData.referee1_position} onChange={handleInputChange} placeholder="Position" className="px-4 py-2 border border-gray-300 rounded-lg" />
                        <input type="text" name="referee1_institution" value={formData.referee1_institution} onChange={handleInputChange} placeholder="Institution" className="px-4 py-2 border border-gray-300 rounded-lg" />
                        <input type="email" name="referee1_email" value={formData.referee1_email} onChange={handleInputChange} placeholder="Email" className="px-4 py-2 border border-gray-300 rounded-lg" />
                        <input type="tel" name="referee1_phone" value={formData.referee1_phone} onChange={handleInputChange} placeholder="Phone" className="px-4 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>

                    {/* Referee 2 */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Referee 2</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" name="referee2_name" value={formData.referee2_name} onChange={handleInputChange} placeholder="Full Name" className="px-4 py-2 border border-gray-300 rounded-lg" />
                        <input type="text" name="referee2_position" value={formData.referee2_position} onChange={handleInputChange} placeholder="Position" className="px-4 py-2 border border-gray-300 rounded-lg" />
                        <input type="text" name="referee2_institution" value={formData.referee2_institution} onChange={handleInputChange} placeholder="Institution" className="px-4 py-2 border border-gray-300 rounded-lg" />
                        <input type="email" name="referee2_email" value={formData.referee2_email} onChange={handleInputChange} placeholder="Email" className="px-4 py-2 border border-gray-300 rounded-lg" />
                        <input type="tel" name="referee2_phone" value={formData.referee2_phone} onChange={handleInputChange} placeholder="Phone" className="px-4 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next: Review & Submit
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && (
              <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-yellow-600 mt-1" />
                    <div>
                      <p className="font-semibold text-yellow-900">Please review your information carefully</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Once submitted, you'll receive an application number to track your application status.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-bold text-lg mb-2">Personal Information</h3>
                    <p className="text-sm text-gray-600">{formData.surname}, {formData.first_name} {formData.middle_name}</p>
                    <p className="text-sm text-gray-600">{formData.email} | {formData.phone_number}</p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-bold text-lg mb-2">Program</h3>
                    <p className="text-sm text-gray-600">{formData.program_applied_for}</p>
                    <p className="text-sm text-gray-600">Mode: {formData.mode_of_study}</p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-bold text-lg mb-2">Qualifications</h3>
                    <p className="text-sm text-gray-600">{formData.undergraduate_degree}</p>
                    <p className="text-sm text-gray-600">{formData.undergraduate_institution}</p>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}


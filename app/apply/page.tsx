'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ApplicationType, APPLICATION_CONFIG } from '@/lib/application-config'
import ApplicationTypeSelector from '@/components/application/ApplicationTypeSelector'
import ProgressIndicator from '@/components/application/ProgressIndicator'
import ApplicationFormSteps from '@/components/application/ApplicationFormSteps'
import SuccessScreen from '@/components/application/SuccessScreen'

export default function ApplicationPage() {
  const searchParams = useSearchParams()
  const [applicationType, setApplicationType] = useState<ApplicationType>(
    (searchParams?.get('type') as ApplicationType) || 'graduate'
  )
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [applicationNumber, setApplicationNumber] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, string>>({})
  
  const requirements = APPLICATION_CONFIG[applicationType]
  
  const [formData, setFormData] = useState({
    application_type: applicationType,
    
    // Personal Information
    surname: '',
    first_name: '',
    middle_name: '',
    date_of_birth: '',
    gender: '',
    nationality: 'Kenyan',
    country_of_citizenship: 'Kenyan',
    country_of_residence: 'Kenya',
    place_of_birth: '',
    id_passport_number: '',
    marital_status: '',
    phone_number: '',
    email: '',
    postal_address: '', // Present Mailing Address
    physical_address: '', // Permanent Mailing Address
    coming_with_family: false,
    number_of_children: 0,
    visa_type: '',
    year_of_entry_to_kenya: '',
    religious_affiliation: '',
    church_name: '',
    church_address: '',
    has_physical_handicap: false,
    physical_handicap_details: '',
    
    // Program Information
    program_applied_for: '',
    specialization: '',
    mode_of_study: 'Online',
    entry_level: '',
    proposed_start_date: '',
    proposed_month: '',
    
    // Part 2: Study Preference
    institution_current_or_last: '',
    degree_desired: '',
    degree_area: '',
    degree_option: '',
    campus_preference: '',
    language_of_instruction: '',
    english_proficiency_written: '',
    english_proficiency_spoken: '',
    accommodation_plan: '',
    accommodation_details: '',
    financing_method: '',
    financing_details: '',
    
    // Part 3: Educational Background
    educational_background: [],
    
    // Part 4: Employment Record
    employment_record: [],
    
    // Part 5: Career Objectives
    career_objectives: '',
    
    // Certification
    supporting_documents_checklist: [],
    non_english_documents_note: false,
    documents_in_original_language: '',
    documents_translated_english: '',
    applicant_signature: '',
    signature_date: new Date().toISOString().split('T')[0],
    
    // Academic Qualifications (for graduate/PhD)
    undergraduate_degree: '',
    undergraduate_institution: '',
    undergraduate_year: '',
    undergraduate_class: '',
    masters_degree: '',
    masters_institution: '',
    masters_year: '',
    other_qualifications: '',
    
    // KCSE Information (for undergraduate/diploma/certificate)
    kcse_year: '',
    kcse_index_number: '',
    kcse_mean_grade: '',
    secondary_school_name: '',
    
    // Work Experience
    years_of_experience: 0,
    current_employer: '',
    current_position: '',
    work_experience_details: '',
    
    // References (2 for undergrad, 3 for graduate/PhD)
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
    referee3_name: '',
    referee3_position: '',
    referee3_institution: '',
    referee3_email: '',
    referee3_phone: '',
    
    // Additional fields
    has_foreign_qualification: false,
    research_proposal: '',
    
    // Payment
    application_fee_amount: requirements.fee,
    application_fee_paid: false,
    
    documents_uploaded: [] as any[],
  })

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      application_type: applicationType,
      application_fee_amount: APPLICATION_CONFIG[applicationType].fee,
    }))
  }, [applicationType])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleFileUpload = async (field: string, file: File) => {
    try {
      // Here you would upload to Supabase Storage
      // For now, we'll just store the filename
      setUploadedDocuments(prev => ({
        ...prev,
        [field]: file.name
      }))
      
      // Add to documents list
      setFormData(prev => ({
        ...prev,
        documents_uploaded: [...prev.documents_uploaded, {
          type: field,
          filename: file.name,
          uploaded_at: new Date().toISOString()
        }]
      }))
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file. Please try again.')
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
      if (requirements.requiresKCSE) {
        if (!formData.kcse_year) newErrors.kcse_year = 'KCSE year is required'
        if (!formData.kcse_mean_grade) newErrors.kcse_mean_grade = 'KCSE mean grade is required'
      } else {
        if (!formData.undergraduate_degree) newErrors.undergraduate_degree = 'Undergraduate degree is required'
        if (!formData.undergraduate_institution) newErrors.undergraduate_institution = 'Institution is required'
      }
      if (applicationType === 'phd') {
        if (!formData.masters_degree) newErrors.masters_degree = 'Master\'s degree is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 9))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(5)) {
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
          masters_year: formData.masters_year ? parseInt(formData.masters_year) : null,
          kcse_year: formData.kcse_year ? parseInt(formData.kcse_year) : null,
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

  const handleTypeChange = (type: ApplicationType) => {
    setApplicationType(type)
    setStep(1)
  }

  if (isSubmitted) {
    return (
      <>
        <Navbar />
        <SuccessScreen
          applicationNumber={applicationNumber}
          applicationType={applicationType}
          fee={requirements.fee}
          email={formData.email}
        />
        <Footer />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Application Form</h1>
          <p className="text-xl text-gray-200">University of Eastern Africa, Baraton (UEAB)</p>
        </div>
      </section>

      {/* Application Type Selector */}
      <ApplicationTypeSelector
        selectedType={applicationType}
        onTypeChange={handleTypeChange}
      />

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={step} />

      {/* Form Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <ApplicationFormSteps
            step={step}
            applicationType={applicationType}
            formData={formData}
            errors={errors}
            uploadedDocuments={uploadedDocuments}
            onInputChange={handleInputChange}
            onFileUpload={handleFileUpload}
            onCheckboxChange={handleCheckboxChange}
            nextStep={nextStep}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            requirements={requirements}
          />
        </div>
      </section>

      <Footer />
    </div>
  )
}

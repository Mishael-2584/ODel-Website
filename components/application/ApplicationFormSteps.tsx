'use client'

import { ApplicationType } from '@/lib/application-config'
import PersonalInfoStep from './steps/PersonalInfoStep'
import ProgramInfoStep from './steps/ProgramInfoStep'
import StudyPreferenceStep from './steps/StudyPreferenceStep'
import EducationalBackgroundStep from './steps/EducationalBackgroundStep'
import EmploymentRecordStep from './steps/EmploymentRecordStep'
import CareerObjectivesStep from './steps/CareerObjectivesStep'
import CertificationStep from './steps/CertificationStep'
import DocumentsStep from './steps/DocumentsStep'
import ReviewStep from './steps/ReviewStep'

interface ApplicationFormStepsProps {
  step: number
  applicationType: ApplicationType
  formData: any
  errors: Record<string, string>
  uploadedDocuments: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onFileUpload: (field: string, file: File) => void
  onCheckboxChange: (name: string, checked: boolean) => void
  nextStep: () => void
  prevStep: () => void
  handleSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  requirements: any
}

export type { ApplicationFormStepsProps }

export default function ApplicationFormSteps({
  step,
  applicationType,
  formData,
  errors,
  uploadedDocuments,
  onInputChange,
  onFileUpload,
  onCheckboxChange,
  nextStep,
  prevStep,
  handleSubmit,
  isSubmitting,
  requirements,
}: ApplicationFormStepsProps) {
  return (
    <form onSubmit={handleSubmit}>
      {step === 1 && (
        <PersonalInfoStep
          formData={formData}
          errors={errors}
          onInputChange={onInputChange}
          onNext={nextStep}
        />
      )}

      {step === 2 && (
        <ProgramInfoStep
          applicationType={applicationType}
          formData={formData}
          errors={errors}
          onInputChange={onInputChange}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {step === 3 && (
        <StudyPreferenceStep
          formData={formData}
          errors={errors}
          onInputChange={onInputChange}
          onCheckboxChange={onCheckboxChange}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {step === 4 && (
        <EducationalBackgroundStep
          formData={formData}
          errors={errors}
          onInputChange={onInputChange}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {step === 5 && (
        <EmploymentRecordStep
          formData={formData}
          errors={errors}
          onInputChange={onInputChange}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {step === 6 && (
        <CareerObjectivesStep
          formData={formData}
          errors={errors}
          onInputChange={onInputChange}
          onFileUpload={onFileUpload}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {step === 7 && (
        <CertificationStep
          formData={formData}
          errors={errors}
          onInputChange={onInputChange}
          onCheckboxChange={onCheckboxChange}
          onFileUpload={onFileUpload}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {step === 8 && (
        <DocumentsStep
          requirements={requirements}
          formData={formData}
          uploadedDocuments={uploadedDocuments}
          onInputChange={onInputChange}
          onFileUpload={onFileUpload}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {step === 9 && (
        <ReviewStep
          requirements={requirements}
          formData={formData}
          onPrev={prevStep}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </form>
  )
}


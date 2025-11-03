'use client'

import { ApplicationType } from '@/lib/application-config'
import PersonalInfoStep from './steps/PersonalInfoStep'
import UndergraduatePersonalStep from './steps/UndergraduatePersonalStep'
import ProgramInfoStep from './steps/ProgramInfoStep'
import UndergraduateProgramStep from './steps/UndergraduateProgramStep'
import StudyPreferenceStep from './steps/StudyPreferenceStep'
import RPLSpecialNeedsStep from './steps/RPLSpecialNeedsStep'
import FamilyInfoStep from './steps/FamilyInfoStep'
import ConsentCommitmentStep from './steps/ConsentCommitmentStep'
import EducationalBackgroundStep from './steps/EducationalBackgroundStep'
import EmploymentRecordStep from './steps/EmploymentRecordStep'
import CareerObjectivesStep from './steps/CareerObjectivesStep'
import CertificationStep from './steps/CertificationStep'
import PaymentStep from './steps/PaymentStep'
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
  // Determine if this is an undergraduate-type application (undergraduate, diploma, certificate, PGDA)
  const isUndergraduateType = ['undergraduate', 'diploma', 'certificate'].includes(applicationType)
  
  // Undergraduate forms have different steps
  const getUndergraduateSteps = () => {
    switch (step) {
      case 1:
        return (
          <UndergraduatePersonalStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onCheckboxChange={onCheckboxChange}
            onFileUpload={onFileUpload}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <UndergraduateProgramStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onCheckboxChange={onCheckboxChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 3:
        return (
          <RPLSpecialNeedsStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onCheckboxChange={onCheckboxChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 4:
        return (
          <FamilyInfoStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onCheckboxChange={onCheckboxChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 5:
        return (
          <ConsentCommitmentStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onCheckboxChange={onCheckboxChange}
            onFileUpload={onFileUpload}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 6:
        return (
          <EducationalBackgroundStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 7:
        return (
          <PaymentStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onFileUpload={onFileUpload}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 8:
        return (
          <DocumentsStep
            requirements={requirements}
            formData={formData}
            uploadedDocuments={uploadedDocuments}
            onInputChange={onInputChange}
            onFileUpload={onFileUpload}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 9:
        return (
          <ReviewStep
            requirements={requirements}
            formData={formData}
            onPrev={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  // Graduate/PhD forms use the original steps
  const getGraduateSteps = () => {
    switch (step) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <ProgramInfoStep
            applicationType={applicationType}
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 3:
        return (
          <StudyPreferenceStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onCheckboxChange={onCheckboxChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 4:
        return (
          <EducationalBackgroundStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 5:
        return (
          <EmploymentRecordStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 6:
        return (
          <CareerObjectivesStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onFileUpload={onFileUpload}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 7:
        return (
          <CertificationStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onCheckboxChange={onCheckboxChange}
            onFileUpload={onFileUpload}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 8:
        return (
          <DocumentsStep
            requirements={requirements}
            formData={formData}
            uploadedDocuments={uploadedDocuments}
            onInputChange={onInputChange}
            onFileUpload={onFileUpload}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 9:
        return (
          <ReviewStep
            requirements={requirements}
            formData={formData}
            onPrev={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {isUndergraduateType ? getUndergraduateSteps() : getGraduateSteps()}
    </form>
  )
}


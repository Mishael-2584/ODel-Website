'use client'

import { FaExclamationTriangle } from 'react-icons/fa'

interface ReviewStepProps {
  requirements: any
  formData: any
  onPrev: () => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
}

export default function ReviewStep({
  requirements,
  formData,
  onPrev,
  onSubmit,
  isSubmitting,
}: ReviewStepProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-900">Please review your information carefully</p>
            <p className="text-sm text-yellow-700 mt-1">
              Application Fee: <strong>KES {requirements.fee}</strong> (non-refundable)
            </p>
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
          {requirements.requiresKCSE ? (
            <>
              <p className="text-sm text-gray-600">KCSE: {formData.kcse_mean_grade} ({formData.kcse_year})</p>
              <p className="text-sm text-gray-600">School: {formData.secondary_school_name}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">{formData.undergraduate_degree}</p>
              <p className="text-sm text-gray-600">{formData.undergraduate_institution}</p>
            </>
          )}
        </div>

        <div className="border-b pb-4">
          <h3 className="font-bold text-lg mb-2">Application Fee</h3>
          <p className="text-sm text-gray-600">KES {requirements.fee} - Payment required after submission</p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onPrev}
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
  )
}


'use client'

import { FaFileAlt, FaInfoCircle } from 'react-icons/fa'

interface CareerObjectivesStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onFileUpload: (field: string, file: File) => void
  onNext: () => void
  onPrev: () => void
}

export default function CareerObjectivesStep({
  formData,
  errors,
  onInputChange,
  onFileUpload,
  onNext,
  onPrev,
}: CareerObjectivesStepProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Career/Professional Objectives</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
              Explain your educational goals, career objectives, work experience, awards, and/or extracurricular activities. 
              Write in paragraph form (preferably type-written) on a separate sheet of paper or upload a document.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Career/Professional Objectives Essay
        </label>
        <textarea
          name="career_objectives"
          value={formData.career_objectives}
          onChange={onInputChange}
          rows={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Write your career objectives, educational goals, work experience, awards, and extracurricular activities here..."
        />
        <p className="text-xs text-gray-500 mt-2">
          Or upload a separate document below
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <FaFileAlt />
          Upload Career Objectives Essay (Optional)
        </label>
        <label className="cursor-pointer">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                onFileUpload('career_objectives_essay', file)
              }
            }}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition">
            <FaFileAlt className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>
        </label>
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
          type="button"
          onClick={onNext}
          className="btn-primary"
        >
          Next: Certification
        </button>
      </div>
    </div>
  )
}


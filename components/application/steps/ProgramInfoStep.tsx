'use client'

import { ApplicationType, getProgramsForType } from '@/lib/application-config'

interface ProgramInfoStepProps {
  applicationType: ApplicationType
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onNext: () => void
  onPrev: () => void
}

export default function ProgramInfoStep({
  applicationType,
  formData,
  errors,
  onInputChange,
  onNext,
  onPrev,
}: ProgramInfoStepProps) {
  const programs = getProgramsForType(applicationType)

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Program Information</h2>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Program Applied For <span className="text-red-500">*</span>
        </label>
        <select
          name="program_applied_for"
          value={formData.program_applied_for}
          onChange={onInputChange}
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
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mode of Study</label>
          <select
            name="mode_of_study"
            value={formData.mode_of_study}
            onChange={onInputChange}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
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
          type="button"
          onClick={onNext}
          className="btn-primary"
        >
          Next: Qualifications
        </button>
      </div>
    </div>
  )
}


'use client'

import { ApplicationType } from '@/lib/application-config'

interface QualificationsStepProps {
  applicationType: ApplicationType
  requirements: any
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onCheckboxChange: (name: string, checked: boolean) => void
  onNext: () => void
  onPrev: () => void
}

export default function QualificationsStep({
  applicationType,
  requirements,
  formData,
  errors,
  onInputChange,
  onCheckboxChange,
  onNext,
  onPrev,
}: QualificationsStepProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Qualifications</h2>
      
      {/* KCSE Section for Undergraduate/Diploma/Certificate */}
      {requirements.requiresKCSE && (
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">KCSE Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                KCSE Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="kcse_year"
                value={formData.kcse_year}
                onChange={onInputChange}
                min="1990"
                max={new Date().getFullYear()}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.kcse_year ? 'border-red-500' : 'border-gray-300'
                }`}
                required={requirements.requiresKCSE}
              />
              {errors.kcse_year && <p className="text-red-500 text-sm mt-1">{errors.kcse_year}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mean Grade <span className="text-red-500">*</span>
              </label>
              <select
                name="kcse_mean_grade"
                value={formData.kcse_mean_grade}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.kcse_mean_grade ? 'border-red-500' : 'border-gray-300'
                }`}
                required={requirements.requiresKCSE}
              >
                <option value="">Select Grade</option>
                {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'].map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {errors.kcse_mean_grade && <p className="text-red-500 text-sm mt-1">{errors.kcse_mean_grade}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Index Number</label>
              <input
                type="text"
                name="kcse_index_number"
                value={formData.kcse_index_number}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary School Name</label>
              <input
                type="text"
                name="secondary_school_name"
                value={formData.secondary_school_name}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Undergraduate Degree (for Graduate/PhD) */}
      {!requirements.requiresKCSE && (
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Undergraduate Degree</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Degree <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="undergraduate_degree"
                value={formData.undergraduate_degree}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.undergraduate_degree ? 'border-red-500' : 'border-gray-300'
                }`}
                required={!requirements.requiresKCSE}
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
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.undergraduate_institution ? 'border-red-500' : 'border-gray-300'
                }`}
                required={!requirements.requiresKCSE}
              />
              {errors.undergraduate_institution && <p className="text-red-500 text-sm mt-1">{errors.undergraduate_institution}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year of Completion</label>
              <input
                type="number"
                name="undergraduate_year"
                value={formData.undergraduate_year}
                onChange={onInputChange}
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
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Class</option>
                <option value="First Class">First Class</option>
                <option value="Second Class Upper">Second Class Upper</option>
                <option value="Second Class Lower">Second Class Lower</option>
                <option value="Pass">Pass</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Master's Degree (for PhD) */}
      {applicationType === 'phd' && (
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Master's Degree</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Master's Degree <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="masters_degree"
                value={formData.masters_degree}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.masters_degree ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.masters_degree && <p className="text-red-500 text-sm mt-1">{errors.masters_degree}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Institution</label>
              <input
                type="text"
                name="masters_institution"
                value={formData.masters_institution}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year of Completion</label>
              <input
                type="number"
                name="masters_year"
                value={formData.masters_year}
                onChange={onInputChange}
                min="1950"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Other Qualifications */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Other Qualifications</label>
        <textarea
          name="other_qualifications"
          value={formData.other_qualifications}
          onChange={onInputChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="List any additional qualifications, certifications, or awards"
        />
      </div>

      {/* Work Experience (for Graduate/PhD) */}
      {!requirements.requiresKCSE && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Work Experience</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
              <input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={onInputChange}
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
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Position</label>
              <input
                type="text"
                name="current_position"
                value={formData.current_position}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Work Experience Details</label>
              <textarea
                name="work_experience_details"
                value={formData.work_experience_details}
                onChange={onInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Provide details about your professional experience"
              />
            </div>
          </div>
        </div>
      )}

      {/* Research Proposal (for PhD) */}
      {applicationType === 'phd' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Research Proposal (Summary)</label>
          <textarea
            name="research_proposal"
            value={formData.research_proposal}
            onChange={onInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Provide a brief summary of your research proposal"
          />
        </div>
      )}

      {/* Foreign Qualifications */}
      <div>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            name="has_foreign_qualification"
            checked={formData.has_foreign_qualification}
            onChange={(e) => onCheckboxChange('has_foreign_qualification', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-semibold text-gray-700">
            I have foreign qualifications (KNQA certificate required)
          </span>
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
          Next: Documents & References
        </button>
      </div>
    </div>
  )
}


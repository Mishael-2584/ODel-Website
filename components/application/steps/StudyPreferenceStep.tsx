'use client'

import { FaInfoCircle } from 'react-icons/fa'

interface StudyPreferenceStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onCheckboxChange: (name: string, checked: boolean) => void
  onNext: () => void
  onPrev: () => void
}

export default function StudyPreferenceStep({
  formData,
  errors,
  onInputChange,
  onCheckboxChange,
  onNext,
  onPrev,
}: StudyPreferenceStepProps) {
  const degreeTypes = ['M.A', 'MBA', 'MEd', 'MPH', 'MSc', 'PhD']
  const studyModes = ['Full Time (regular)', 'Part Time', 'School-based/Block Release']
  const proficiencyLevels = ['Excellent', 'Good', 'Poor']

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">General Background and Study Preference</h2>
      <p className="text-sm text-gray-600 mb-6">Refer to the attached information sheet to answer some questions in this section</p>
      
      {/* Institution Information */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Name of College or University currently attending or last attended
        </label>
        <input
          type="text"
          name="institution_current_or_last"
          value={formData.institution_current_or_last}
          onChange={onInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Institution name"
        />
      </div>

      {/* Proposed Date of Entrance */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Proposed Month of Entrance</label>
          <select
            name="proposed_month"
            value={formData.proposed_month}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Month</option>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Proposed Year of Entrance</label>
          <input
            type="number"
            name="proposed_start_date"
            value={formData.proposed_start_date?.split('-')[0] || ''}
            onChange={(e) => {
              const year = e.target.value
              const month = formData.proposed_month || '01'
              const monthNum = new Date(`${month} 1, 2000`).getMonth() + 1
              onInputChange({ target: { name: 'proposed_start_date', value: `${year}-${String(monthNum).padStart(2, '0')}-01` } } as any)
            }}
            min={new Date().getFullYear()}
            max={new Date().getFullYear() + 2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Year"
          />
        </div>
      </div>

      {/* Degree Desired */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Degree Desired</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          {degreeTypes.map(degree => (
            <label key={degree} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.degree_desired?.includes(degree)}
                onChange={(e) => {
                  const current = formData.degree_desired || []
                  const updated = e.target.checked
                    ? [...current, degree]
                    : current.filter((d: string) => d !== degree)
                  onInputChange({ target: { name: 'degree_desired', value: updated.join(', ') } } as any)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">{degree}</span>
            </label>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Area</label>
            <input
              type="text"
              name="degree_area"
              value={formData.degree_area}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Field of study"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Option</label>
            <input
              type="text"
              name="degree_option"
              value={formData.degree_option}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Specialization option"
            />
          </div>
        </div>
      </div>

      {/* Mode of Study */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Mode of Study</label>
        <div className="space-y-2 mb-4">
          {studyModes.map(mode => (
            <label key={mode} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="mode_of_study"
                value={mode}
                checked={formData.mode_of_study === mode}
                onChange={onInputChange}
                className="w-4 h-4"
              />
              <span className="text-sm">{mode}</span>
            </label>
          ))}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Which Campus?</label>
          <input
            type="text"
            name="campus_preference"
            value={formData.campus_preference}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Campus preference"
          />
        </div>
      </div>

      {/* Language and English Proficiency */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Language of Instruction in Home Country</label>
          <input
            type="text"
            name="language_of_instruction"
            value={formData.language_of_instruction}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., English, French, Swahili"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Proficiency in English</label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">(a) Written</label>
              <div className="flex gap-4">
                {proficiencyLevels.map(level => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="english_proficiency_written"
                      value={level}
                      checked={formData.english_proficiency_written === level}
                      onChange={onInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">(b) Spoken</label>
              <div className="flex gap-4">
                {proficiencyLevels.map(level => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="english_proficiency_spoken"
                      value={level}
                      checked={formData.english_proficiency_spoken === level}
                      onChange={onInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accommodation */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Where do you plan to stay while attending UEAB?</label>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="accommodation_plan"
              value="On Campus"
              checked={formData.accommodation_plan === 'On Campus'}
              onChange={onInputChange}
              className="w-4 h-4"
            />
            <span>On Campus</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="accommodation_plan"
              value="Off Campus"
              checked={formData.accommodation_plan === 'Off Campus'}
              onChange={onInputChange}
              className="w-4 h-4"
            />
            <span>Off Campus</span>
          </label>
        </div>
        {formData.accommodation_plan === 'Off Campus' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Off Campus Details</label>
            <textarea
              name="accommodation_details"
              value={formData.accommodation_details}
              onChange={onInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Provide details about off-campus accommodation"
            />
          </div>
        )}
      </div>

      {/* Financing */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">How will you finance your studies at UEAB?</label>
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
            <input
              type="radio"
              name="financing_method"
              value="Self-Sponsorship"
              checked={formData.financing_method === 'Self-Sponsorship'}
              onChange={onInputChange}
              className="w-4 h-4"
            />
            <span>Self-Sponsorship</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
            <input
              type="radio"
              name="financing_method"
              value="Other"
              checked={formData.financing_method === 'Other'}
              onChange={onInputChange}
              className="w-4 h-4"
            />
            <span>Other, specify</span>
          </label>
        </div>
        {formData.financing_method === 'Other' && (
          <div>
            <textarea
              name="financing_details"
              value={formData.financing_details}
              onChange={onInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Specify how you will finance your studies"
            />
          </div>
        )}
      </div>

      {/* Important Note */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-900 text-sm mb-1">Important:</p>
            <p className="text-xs text-red-800">
              If a document is written in a language other than English, please submit a certified copy of the document 
              in the original language and its translated version in English. Incomplete supporting documents will cause 
              delay in the admission process.
            </p>
          </div>
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
          Next: Educational Background
        </button>
      </div>
    </div>
  )
}


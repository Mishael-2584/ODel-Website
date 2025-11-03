'use client'

import { FaInfoCircle } from 'react-icons/fa'

interface UndergraduateProgramStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onCheckboxChange: (name: string, checked: boolean) => void
  onNext: () => void
  onPrev: () => void
}

export default function UndergraduateProgramStep({
  formData,
  errors,
  onInputChange,
  onCheckboxChange,
  onNext,
  onPrev,
}: UndergraduateProgramStepProps) {
  const howFoundOutOptions = [
    'JEAB Student/Worker',
    'Career Exhibition',
    'Family Member',
    'Social Media (Facebook, Instagram...)',
    'Online',
    'Search (Google)',
    'Television',
    'Newspaper',
    'KUCCPS Placement',
    'Other',
  ]

  const toggleFoundOut = (option: string, checked: boolean) => {
    const current = formData.found_out_about_ueab || []
    const updated = checked
      ? [...current, option]
      : current.filter((item: string) => item !== option)
    onInputChange({ target: { name: 'found_out_about_ueab', value: updated } } as any)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Program & Study Details</h2>

      {/* Semester Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Semester for which you are applying <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {[
            { value: '1st Semester (August)', label: '1st Semester (August)' },
            { value: '2nd Semester (January)', label: '2nd Semester (January)' },
            { value: 'Inter-semester (May)', label: 'Inter-semester (May)' },
          ].map((semester) => (
            <label key={semester.value} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="semester_applying"
                value={semester.value}
                checked={formData.semester_applying === semester.value}
                onChange={onInputChange}
                className="w-4 h-4"
                required
              />
              <span className="text-sm">{semester.label}</span>
            </label>
          ))}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
          <input
            type="number"
            name="semester_year"
            value={formData.semester_year}
            onChange={onInputChange}
            min={new Date().getFullYear()}
            max={new Date().getFullYear() + 2}
            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Year"
          />
        </div>
      </div>

      {/* Level of Desired Program */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Level of Desired Program <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-4 gap-3">
          {['PGDE', 'Undergraduate', 'Diploma', 'Certificate'].map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="level_of_program"
                value={level}
                checked={formData.level_of_program === level}
                onChange={onInputChange}
                className="w-4 h-4"
                required
              />
              <span className="text-sm">{level}</span>
            </label>
          ))}
        </div>
        {errors.level_of_program && <p className="text-red-500 text-sm mt-1">{errors.level_of_program}</p>}
      </div>

      {/* Specific Area of Study */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Specific area of study <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="program_applied_for"
          value={formData.program_applied_for}
          onChange={onInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.program_applied_for ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.program_applied_for && <p className="text-red-500 text-sm mt-1">{errors.program_applied_for}</p>}
      </div>

      {/* Teaching Subjects (if Education) */}
      {formData.program_applied_for?.toLowerCase().includes('education') && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Teaching Subjects
            <span className="text-gray-500 text-xs ml-2">
              (NOTE: If your area of study is Education, write the two teaching subjects of your choice)
            </span>
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Teaching Subject 1</label>
              <input
                type="text"
                name="teaching_subject1"
                value={formData.teaching_subject1}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Subject 1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Teaching Subject 2</label>
              <input
                type="text"
                name="teaching_subject2"
                value={formData.teaching_subject2}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Subject 2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode of Study */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Mode of Study <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            { value: 'Full time (Face to face)', label: 'Full time (Face to face)' },
            { value: 'In-service', label: 'In-service' },
            { value: 'Blended', label: 'Blended' },
          ].map((mode) => (
            <label key={mode.value} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="mode_of_study"
                value={mode.value}
                checked={formData.mode_of_study === mode.value}
                onChange={onInputChange}
                className="w-4 h-4"
                required
              />
              <span className="text-sm">{mode.label}</span>
            </label>
          ))}
        </div>
        {formData.mode_of_study === 'Blended' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
            <p className="text-xs text-yellow-800">
              <FaInfoCircle className="inline mr-1" />
              <strong>Note:</strong> Currently, ONLY those taking undergraduate degree in Theology may select blended
            </p>
          </div>
        )}
      </div>

      {/* Where to Stay */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          While at UEAB, where do you plan to stay?
        </label>
        <div className="space-y-2">
          {[
            'University hostel',
            'Faculty/Staff home',
            'Off campus',
          ].map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="accommodation_plan"
                value={option}
                checked={formData.accommodation_plan === option}
                onChange={onInputChange}
                className="w-4 h-4"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* How Found Out About UEAB */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          How did you find out about UEAB? Through:
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          {howFoundOutOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={(formData.found_out_about_ueab || []).includes(option)}
                onChange={(e) => toggleFoundOut(option, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {(formData.found_out_about_ueab || []).includes('JEAB Student/Worker') && (
          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">JEAB Student/Worker Name</label>
            <input
              type="text"
              name="found_out_details"
              value={formData.found_out_details}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Name of JEAB Student/Worker"
            />
          </div>
        )}
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
          Next: Prior Learning & Special Needs
        </button>
      </div>
    </div>
  )
}


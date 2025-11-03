'use client'

interface FamilyInfoStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onCheckboxChange: (name: string, checked: boolean) => void
  onNext: () => void
  onPrev: () => void
}

export default function FamilyInfoStep({
  formData,
  errors,
  onInputChange,
  onCheckboxChange,
  onNext,
  onPrev,
}: FamilyInfoStepProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Family Information</h2>

      {/* Father's Information */}
      <div className="border-b pb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Father's Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name</label>
            <input
              type="text"
              name="father_name"
              value={formData.father_name}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone No</label>
            <input
              type="tel"
              name="father_phone"
              value={formData.father_phone}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="father_email"
              value={formData.father_email}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Religion</label>
            <input
              type="text"
              name="father_religion"
              value={formData.father_religion}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Denomination</label>
            <input
              type="text"
              name="father_denomination"
              value={formData.father_denomination}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Mother's Information */}
      <div className="border-b pb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Mother's Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mother's Name</label>
            <input
              type="text"
              name="mother_name"
              value={formData.mother_name}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone No</label>
            <input
              type="tel"
              name="mother_phone"
              value={formData.mother_phone}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="mother_email"
              value={formData.mother_email}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Religion</label>
            <input
              type="text"
              name="mother_religion"
              value={formData.mother_religion}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Denomination</label>
            <input
              type="text"
              name="mother_denomination"
              value={formData.mother_denomination}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Legal Guardian/Sponsor */}
      <div className="border-b pb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Legal Guardian/Sponsor (If not parents)</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="legal_guardian_name"
              value={formData.legal_guardian_name}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone No</label>
            <input
              type="tel"
              name="legal_guardian_phone"
              value={formData.legal_guardian_phone}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="legal_guardian_email"
              value={formData.legal_guardian_email}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* SDA Church Employment */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Is either of your parents employed by the Seventh-day Adventist Church?
        </label>
        <div className="flex gap-6 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="parent_sda_employed"
              value="true"
              checked={formData.parent_sda_employed === true}
              onChange={(e) => onCheckboxChange('parent_sda_employed', e.target.value === 'true')}
              className="w-4 h-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="parent_sda_employed"
              value="false"
              checked={formData.parent_sda_employed === false || !formData.parent_sda_employed}
              onChange={(e) => onCheckboxChange('parent_sda_employed', e.target.value === 'true')}
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>
        {formData.parent_sda_employed && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">If yes, name the employer</label>
            <input
              type="text"
              name="parent_sda_employer_name"
              value={formData.parent_sda_employer_name}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Employer name"
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
          Next: Consent & Commitments
        </button>
      </div>
    </div>
  )
}


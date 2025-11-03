'use client'

import { FaFileSignature } from 'react-icons/fa'

interface ConsentCommitmentStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onCheckboxChange: (name: string, checked: boolean) => void
  onFileUpload: (field: string, file: File) => void
  onNext: () => void
  onPrev: () => void
}

export default function ConsentCommitmentStep({
  formData,
  errors,
  onInputChange,
  onCheckboxChange,
  onFileUpload,
  onNext,
  onPrev,
}: ConsentCommitmentStepProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Consent & Commitments</h2>

      {/* Statement of Consent */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statement of Consent</h3>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">I consent to the applicant's enrollment:</label>
          <div className="flex gap-6 mb-4">
            {['Parent', 'Guardian', 'Sponsor'].map((provider) => (
              <label key={provider} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consent_provider === provider}
                  onChange={(e) => onInputChange({ target: { name: 'consent_provider', value: e.target.checked ? provider : '' } } as any)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{provider}</span>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-700 mb-4 italic">
            "I consent to the applicant's enrollment at the University of Eastern Africa, Baraton, and affirm my support for the university."
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="consent_name"
                value={formData.consent_name}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaFileSignature />
                Signature
              </label>
              <textarea
                name="consent_signature"
                value={formData.consent_signature}
                onChange={onInputChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Type name as signature or upload"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="consent_date"
                value={formData.consent_date || new Date().toISOString().split('T')[0]}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statement of Financial Responsibility */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statement of Financial Responsibility</h3>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Financial Responsibility by:</label>
          <div className="flex gap-6 mb-4">
            {['Parent', 'Guardian', 'Sponsor', 'Other'].map((provider) => (
              <label key={provider} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="financial_responsibility_provider"
                  value={provider}
                  checked={formData.financial_responsibility_provider === provider}
                  onChange={onInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm">{provider}</span>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-700 mb-4 italic">
            "I fully accept responsibility for the payment of the applicant's complete tuition and related fees at the University of Eastern Africa, Baraton. I hereby undertake to ensure that all payments are made in accordance with the University's official time-lines and prescribed procedures."
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="financial_responsibility_name"
                value={formData.financial_responsibility_name}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaFileSignature />
                Signature
              </label>
              <textarea
                name="financial_responsibility_signature"
                value={formData.financial_responsibility_signature}
                onChange={onInputChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Type name as signature or upload"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="financial_responsibility_date"
                value={formData.financial_responsibility_date || new Date().toISOString().split('T')[0]}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applicant's Commitment */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant's Commitment</h3>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.applicant_commitment_accepted}
            onChange={(e) => onCheckboxChange('applicant_commitment_accepted', e.target.checked)}
            className="mt-1 w-5 h-5"
            required
          />
          <div className="text-sm text-gray-700">
            <p className="mb-2">
              I hereby certify that all information supplied by me in this application is accurate and complete. 
              I understand that any misrepresentation of fact will constitute cause for nullification of my application 
              prior to admission or dismissal following admission.
            </p>
            <p className="mb-2">
              I commit myself to uphold the regulations, standards, and principles of the University of Eastern Africa, 
              Baraton, consistent with the Seventh-day Adventist heritage.
            </p>
            <p className="italic">
              "And whatsoever ye do, do it heartily, as to the Lord, and not unto men" - Colossians 3:23 (KJV)
            </p>
          </div>
        </label>
        {errors.applicant_commitment_accepted && (
          <p className="text-red-500 text-sm mt-2">{errors.applicant_commitment_accepted}</p>
        )}
      </div>

      {/* Data Protection Consent - General */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Protection Consent (General)</h3>
        <label className="flex items-start gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={formData.data_protection_consent_accepted}
            onChange={(e) => onCheckboxChange('data_protection_consent_accepted', e.target.checked)}
            className="mt-1 w-5 h-5"
            required
          />
          <div className="text-sm text-gray-700">
            <p>
              By submitting this application for admission to the University of Eastern Africa, Baraton (UEAB), 
              I hereby acknowledge and consent to the collection, processing, storage, and sharing of my personal data 
              by the University in accordance with the Kenya Data Protection Act, 2019; and Data Protection Policy of 
              the University of Eastern Africa Baraton.
            </p>
          </div>
        </label>
        {errors.data_protection_consent_accepted && (
          <p className="text-red-500 text-sm mt-2">{errors.data_protection_consent_accepted}</p>
        )}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="data_protection_consent_name"
              value={formData.data_protection_consent_name}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaFileSignature />
              Signature
            </label>
            <textarea
              name="data_protection_consent_signature"
              value={formData.data_protection_consent_signature}
              onChange={onInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Type name as signature or upload"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="data_protection_consent_date"
              value={formData.data_protection_consent_date || new Date().toISOString().split('T')[0]}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Data Protection Consent - Minor */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={formData.is_minor}
              onChange={(e) => onCheckboxChange('is_minor', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-gray-700">If the applicant is a Minor</span>
          </label>
        </div>
        
        {formData.is_minor && (
          <div className="pl-6 border-l-4 border-primary-500 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Consent provided by:</label>
              <div className="flex gap-6 mb-4">
                {['Parent', 'Guardian', 'Sponsor', 'Other'].map((provider) => (
                  <label key={provider} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="minor_consent_provider"
                      value={provider}
                      checked={formData.minor_consent_provider === provider}
                      onChange={onInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{provider}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.minor_data_protection_consent}
                onChange={(e) => onCheckboxChange('minor_data_protection_consent', e.target.checked)}
                className="mt-1 w-5 h-5"
              />
              <div className="text-sm text-gray-700">
                <p>
                  I hereby give consent for the collection, processing, storage, and sharing of the minor's personal data 
                  in compliance with the Kenya Data Protection Act (2019), the Office of the Data Protection Commissioner's 
                  Guidance Note on Processing Children's Data (2025), and the University's Data Protection Policy.
                </p>
              </div>
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="minor_consent_name"
                  value={formData.minor_consent_name}
                  onChange={onInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaFileSignature />
                  Signature
                </label>
                <textarea
                  name="minor_consent_signature"
                  value={formData.minor_consent_signature}
                  onChange={onInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Type name as signature or upload"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="minor_consent_date"
                  value={formData.minor_consent_date || new Date().toISOString().split('T')[0]}
                  onChange={onInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
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
          Next: Payment & Documents
        </button>
      </div>
    </div>
  )
}


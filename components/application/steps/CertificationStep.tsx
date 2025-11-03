'use client'

import { FaCheckCircle, FaFileSignature, FaExclamationTriangle } from 'react-icons/fa'

interface CertificationStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onCheckboxChange: (name: string, checked: boolean) => void
  onFileUpload: (field: string, file: File) => void
  onNext: () => void
  onPrev: () => void
}

export default function CertificationStep({
  formData,
  errors,
  onInputChange,
  onCheckboxChange,
  onFileUpload,
  onNext,
  onPrev,
}: CertificationStepProps) {
  const supportingDocuments = [
    { key: 'receipt', label: 'Official receipt of application fee payment (US $30.00)' },
    { key: 'diplomas', label: 'Certified photocopies of college or university diplomas or degree certificates' },
    { key: 'photos', label: 'Two recent passport-size photos' },
    { key: 'recommendations', label: 'Three letters of recommendation from referees in sealed envelopes' },
    { key: 'transcripts', label: 'Two certified copies of official transcript from each college/university attended (certified by the institution or Commissioner of Oath)' },
    { key: 'secondary_certificate', label: 'Certified photocopy of secondary school certificate' },
    { key: 'cv', label: 'Updated curriculum vitae (CV)' },
    { key: 'essay', label: 'Essay (response to Part 5 of this form)' },
    { key: 'license', label: 'Certified copy of current practice license (for MScN applicants only)' },
  ]

  const toggleDocument = (key: string, checked: boolean) => {
    const current = formData.supporting_documents_checklist || []
    const updated = checked
      ? [...current, key]
      : current.filter((doc: string) => doc !== key)
    onInputChange({ target: { name: 'supporting_documents_checklist', value: updated } } as any)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Applicant's Certification</h2>
      
      {/* Certification Statement */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          I hereby certify that all information supplied by me in this application is accurate and complete. 
          I understand that any misrepresentation of fact will constitute cause for nullification of my application 
          prior to admission or dismissal following admission. I have attached the following supporting documents 
          to this application form (tick those that apply to you):
        </p>
      </div>

      {/* Supporting Documents Checklist */}
      <div className="space-y-3 mb-6">
        {supportingDocuments.map((doc) => (
          <label
            key={doc.key}
            className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={(formData.supporting_documents_checklist || []).includes(doc.key)}
              onChange={(e) => toggleDocument(doc.key, e.target.checked)}
              className="mt-1 w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 flex-1">{doc.label}</span>
            {(formData.supporting_documents_checklist || []).includes(doc.key) && (
              <FaCheckCircle className="text-green-600 w-5 h-5" />
            )}
          </label>
        ))}
      </div>

      {/* Non-English Documents Note */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-900 text-sm mb-1">Important:</p>
            <p className="text-xs text-red-800 mb-3">
              If a document is written in a language other than English, please submit a certified copy of the document 
              in the original language and its translated version in English. Incomplete supporting documents will cause 
              delay in the admission process.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.non_english_documents_note}
                onChange={(e) => onCheckboxChange('non_english_documents_note', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-red-900">I have read and understood the above requirement</span>
            </label>
            {formData.non_english_documents_note && (
              <div className="mt-3 space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-red-900 mb-1">Upload Document in Original Language</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onFileUpload('documents_in_original_language', file)
                    }}
                    className="text-xs"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-red-900 mb-1">Upload English Translation</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onFileUpload('documents_translated_english', file)
                    }}
                    className="text-xs"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="border-t pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaFileSignature />
              Applicant's Signature
            </label>
            <div className="space-y-2">
              <textarea
                name="applicant_signature"
                value={formData.applicant_signature}
                onChange={onInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Type your full name as signature or upload signature image"
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onFileUpload('signature_image', file)
                  }}
                  className="hidden"
                  accept=".png,.jpg,.jpeg"
                />
                <span className="text-xs text-primary-600 hover:text-primary-700">Or upload signature image</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="signature_date"
              value={formData.signature_date || new Date().toISOString().split('T')[0]}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
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
          Next: Review & Submit
        </button>
      </div>
    </div>
  )
}


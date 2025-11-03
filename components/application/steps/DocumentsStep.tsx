'use client'

import { FaFileAlt, FaCheckCircle, FaInfoCircle } from 'react-icons/fa'

interface DocumentsStepProps {
  requirements: any
  formData: any
  uploadedDocuments: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onFileUpload: (field: string, file: File) => void
  onNext: () => void
  onPrev: () => void
}

export default function DocumentsStep({
  requirements,
  formData,
  uploadedDocuments,
  onInputChange,
  onFileUpload,
  onNext,
  onPrev,
}: DocumentsStepProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents & References</h2>
      
      {/* Documents Upload Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Documents</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 mb-2 font-semibold">Application Fee: KES {requirements.fee}</p>
          <p className="text-sm text-blue-800">
            Please upload all required documents. You can also submit documents via email to admissions@ueab.ac.ke
          </p>
        </div>

        <div className="space-y-4">
          {requirements.documents.map((doc: string, index: number) => {
            const fieldKey = doc.toLowerCase().replace(/\s+/g, '_')
            return (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaFileAlt className="text-gray-400" />
                  <span className="text-gray-700">{doc}</span>
                  {uploadedDocuments[fieldKey] && (
                    <FaCheckCircle className="text-green-600" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        onFileUpload(fieldKey, file)
                      }
                    }}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <span className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    {uploadedDocuments[fieldKey] ? 'Change' : 'Upload'}
                  </span>
                </label>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <FaInfoCircle className="inline mr-2" />
            <strong>Note:</strong> Documents can be uploaded now or submitted separately via email. 
            Originals must be brought for verification on reporting day.
          </p>
        </div>
      </div>

      {/* References Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          References {requirements.requires3Referees ? '(3 Required)' : '(2 Required)'}
        </h3>
        
        <div className="space-y-6">
          {/* Referee 1 */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Referee 1</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="referee1_name" value={formData.referee1_name} onChange={onInputChange} placeholder="Full Name" className="px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="text" name="referee1_position" value={formData.referee1_position} onChange={onInputChange} placeholder="Position" className="px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="text" name="referee1_institution" value={formData.referee1_institution} onChange={onInputChange} placeholder="Institution" className="px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="email" name="referee1_email" value={formData.referee1_email} onChange={onInputChange} placeholder="Email" className="px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="tel" name="referee1_phone" value={formData.referee1_phone} onChange={onInputChange} placeholder="Phone" className="px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          {/* Referee 2 */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Referee 2</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="referee2_name" value={formData.referee2_name} onChange={onInputChange} placeholder="Full Name" className="px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="text" name="referee2_position" value={formData.referee2_position} onChange={onInputChange} placeholder="Position" className="px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="text" name="referee2_institution" value={formData.referee2_institution} onChange={onInputChange} placeholder="Institution" className="px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="email" name="referee2_email" value={formData.referee2_email} onChange={onInputChange} placeholder="Email" className="px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="tel" name="referee2_phone" value={formData.referee2_phone} onChange={onInputChange} placeholder="Phone" className="px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          {/* Referee 3 (for Graduate/PhD) */}
          {requirements.requires3Referees && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Referee 3</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" name="referee3_name" value={formData.referee3_name} onChange={onInputChange} placeholder="Full Name" className="px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="text" name="referee3_position" value={formData.referee3_position} onChange={onInputChange} placeholder="Position" className="px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="text" name="referee3_institution" value={formData.referee3_institution} onChange={onInputChange} placeholder="Institution" className="px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="email" name="referee3_email" value={formData.referee3_email} onChange={onInputChange} placeholder="Email" className="px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="tel" name="referee3_phone" value={formData.referee3_phone} onChange={onInputChange} placeholder="Phone" className="px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <FaInfoCircle className="inline mr-2" />
              Reference forms should be filled and sent to admissions@ueab.ac.ke by the referees directly.
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
          Next: Review & Submit
        </button>
      </div>
    </div>
  )
}


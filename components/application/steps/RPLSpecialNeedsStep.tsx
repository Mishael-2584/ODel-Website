'use client'

interface RPLSpecialNeedsStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onCheckboxChange: (name: string, checked: boolean) => void
  onNext: () => void
  onPrev: () => void
}

export default function RPLSpecialNeedsStep({
  formData,
  errors,
  onInputChange,
  onCheckboxChange,
  onNext,
  onPrev,
}: RPLSpecialNeedsStepProps) {
  const specialNeedsTypes = ['Mental', 'Physical', 'Hearing', 'Sight', 'Sensory', 'Other']
  const evaluationMethods = ['Written exams', 'Projects', 'Practicals', 'Assignments']
  const healthStatuses = ['Good', 'Fair', 'Poor']

  const toggleSpecialNeed = (type: string, checked: boolean) => {
    const current = formData.special_needs_types || []
    const updated = checked
      ? [...current, type]
      : current.filter((item: string) => item !== type)
    onInputChange({ target: { name: 'special_needs_types', value: updated } } as any)
  }

  const toggleEvaluationMethod = (method: string, checked: boolean) => {
    const current = formData.rpl_evaluation_method || []
    const updated = checked
      ? [...current, method]
      : current.filter((item: string) => item !== method)
    onInputChange({ target: { name: 'rpl_evaluation_method', value: updated } } as any)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recognition of Prior Learning & Special Needs</h2>

      {/* Recognition of Prior Learning */}
      <div className="border-b pb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recognition of Prior Learning (RPL)</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Have you completed any professional certifications, vocational qualifications, short courses, or specialized training programs that are not reflected in your academic transcripts and that you believe demonstrate university-level knowledge or skills relevant to your desired program of study, and that you wish to be considered as an entry requirement?
          </label>
          <div className="flex gap-6 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="has_rpl_qualifications"
                value="true"
                checked={formData.has_rpl_qualifications === true}
                onChange={(e) => onCheckboxChange('has_rpl_qualifications', e.target.value === 'true')}
                className="w-4 h-4"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="has_rpl_qualifications"
                value="false"
                checked={formData.has_rpl_qualifications === false || !formData.has_rpl_qualifications}
                onChange={(e) => onCheckboxChange('has_rpl_qualifications', e.target.value === 'true')}
                className="w-4 h-4"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {formData.has_rpl_qualifications && (
          <div className="space-y-4 pl-4 border-l-4 border-primary-500">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                If yes, give more information as follows:
              </label>
              <textarea
                name="rpl_details"
                value={formData.rpl_details}
                onChange={onInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Describe your prior learning qualifications..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">How were you evaluated?</label>
              <div className="grid md:grid-cols-2 gap-3">
                {evaluationMethods.map((method) => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.rpl_evaluation_method || []).includes(method)}
                      onChange={(e) => toggleEvaluationMethod(method, e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Mode of Study</label>
              <div className="flex gap-6">
                {['Online', 'Face to Face', 'Blended'].map((mode) => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rpl_mode_of_study"
                      value={mode}
                      checked={formData.rpl_mode_of_study === mode}
                      onChange={onInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Certificate(s) or Evidence of Completion</label>
              <div className="space-y-2">
                {[
                  'Yes, I have a certificate or transcript',
                  'No, but I can provide other evidence',
                  'No documentation available',
                ].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rpl_certificate_status"
                      value={option}
                      checked={formData.rpl_certificate_status === option}
                      onChange={onInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Have you ever been employed?</label>
          <div className="flex gap-6 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="has_been_employed"
                value="true"
                checked={formData.has_been_employed === true}
                onChange={(e) => onCheckboxChange('has_been_employed', e.target.value === 'true')}
                className="w-4 h-4"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="has_been_employed"
                value="false"
                checked={formData.has_been_employed === false || !formData.has_been_employed}
                onChange={(e) => onCheckboxChange('has_been_employed', e.target.value === 'true')}
                className="w-4 h-4"
              />
              <span>No</span>
            </label>
          </div>
          {formData.has_been_employed && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">If yes, name the employer(s) (You can use extra paper)</label>
              <textarea
                name="previous_employers"
                value={formData.previous_employers}
                onChange={onInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="List employer names..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Special Needs */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Special Needs</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Do you have any special need?</label>
          <div className="flex gap-6 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="has_physical_handicap"
                value="true"
                checked={formData.has_physical_handicap === true}
                onChange={(e) => onCheckboxChange('has_physical_handicap', e.target.value === 'true')}
                className="w-4 h-4"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="has_physical_handicap"
                value="false"
                checked={formData.has_physical_handicap === false || !formData.has_physical_handicap}
                onChange={(e) => onCheckboxChange('has_physical_handicap', e.target.value === 'true')}
                className="w-4 h-4"
              />
              <span>No</span>
            </label>
          </div>
          {formData.has_physical_handicap && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">If yes, tick the need:</label>
              <div className="grid md:grid-cols-3 gap-3">
                {specialNeedsTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={(formData.special_needs_types || []).includes(type)}
                      onChange={(e) => toggleSpecialNeed(type, e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
              {(formData.special_needs_types || []).includes('Other') && (
                <div className="mt-3">
                  <textarea
                    name="physical_handicap_details"
                    value={formData.physical_handicap_details}
                    onChange={onInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Specify other special need..."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Personal Health Information</label>
          <div className="flex gap-6">
            {healthStatuses.map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="personal_health_status"
                  value={status}
                  checked={formData.personal_health_status === status}
                  onChange={onInputChange}
                  className="w-4 h-4"
                />
                <span>{status}</span>
              </label>
            ))}
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
          Next: Family Information
        </button>
      </div>
    </div>
  )
}


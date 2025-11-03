'use client'

import { FaInfoCircle } from 'react-icons/fa'
import { ApplicationType, APPLICATION_CONFIG } from '@/lib/application-config'

interface ApplicationTypeSelectorProps {
  selectedType: ApplicationType
  onTypeChange: (type: ApplicationType) => void
}

export default function ApplicationTypeSelector({
  selectedType,
  onTypeChange,
}: ApplicationTypeSelectorProps) {
  const types: ApplicationType[] = ['graduate', 'phd', 'undergraduate', 'diploma', 'certificate']
  const requirements = APPLICATION_CONFIG[selectedType]

  return (
    <section className="bg-gray-50 border-b py-6">
      <div className="max-w-5xl mx-auto px-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Application Type</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {types.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onTypeChange(type)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedType === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-500'
              }`}
            >
              {type === 'phd' ? 'PhD' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <FaInfoCircle className="text-blue-600" />
            <span className="font-semibold text-blue-900">Application Fee: KES {requirements.fee}</span>
          </div>
          <p className="text-sm text-blue-800">Non-refundable application fee required. Payment proof must be submitted.</p>
        </div>
      </div>
    </section>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa'

interface EducationalBackgroundStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onNext: () => void
  onPrev: () => void
}

export default function EducationalBackgroundStep({
  formData,
  errors,
  onInputChange,
  onNext,
  onPrev,
}: EducationalBackgroundStepProps) {
  const [educationalBackground, setEducationalBackground] = useState(
    formData.educational_background && formData.educational_background.length > 0
      ? formData.educational_background
      : [{ institution: '', country: '', from_month: '', from_year: '', to_month: '', to_year: '', degree: '', classification: '' }]
  )

  // Merge basic qualification info into educational background table
  useEffect(() => {
    // If KCSE info exists, add it to educational background
    if (formData.kcse_year && formData.secondary_school_name && !educationalBackground.some((edu: any) => edu.institution === formData.secondary_school_name)) {
      const kcseEntry = {
        institution: formData.secondary_school_name,
        country: formData.country_of_residence || 'Kenya',
        from_month: '',
        from_year: formData.kcse_year,
        to_month: '',
        to_year: formData.kcse_year,
        degree: `KCSE - ${formData.kcse_mean_grade}`,
        classification: formData.kcse_index_number || '',
      }
      setEducationalBackground([kcseEntry, ...educationalBackground])
      onInputChange({ target: { name: 'educational_background', value: [kcseEntry, ...educationalBackground] } } as any)
    }
    // If undergraduate degree exists, add it
    if (formData.undergraduate_institution && !educationalBackground.some((edu: any) => edu.institution === formData.undergraduate_institution)) {
      const degreeEntry = {
        institution: formData.undergraduate_institution,
        country: formData.country_of_residence || 'Kenya',
        from_month: '',
        from_year: formData.undergraduate_year || '',
        to_month: '',
        to_year: formData.undergraduate_year || '',
        degree: formData.undergraduate_degree || '',
        classification: formData.undergraduate_class || '',
      }
      setEducationalBackground([...educationalBackground, degreeEntry])
      onInputChange({ target: { name: 'educational_background', value: [...educationalBackground, degreeEntry] } } as any)
    }
  }, [])

  const addEducationEntry = () => {
    setEducationalBackground([
      ...educationalBackground,
      { institution: '', country: '', from_month: '', from_year: '', to_month: '', to_year: '', degree: '', classification: '' }
    ])
  }

  const removeEducationEntry = (index: number) => {
    if (educationalBackground.length > 1) {
      const updated = educationalBackground.filter((_: any, i: number) => i !== index)
      setEducationalBackground(updated)
      onInputChange({ target: { name: 'educational_background', value: updated } } as any)
    }
  }

  const updateEducationEntry = (index: number, field: string, value: string) => {
    const updated = educationalBackground.map((entry: any, i: number) =>
      i === index ? { ...entry, [field]: value } : entry
    )
    setEducationalBackground(updated)
    onInputChange({ target: { name: 'educational_background', value: updated } } as any)
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Educational Background</h2>
      <p className="text-sm text-gray-600 mb-6">Please list High/Secondary School, Colleges and Universities that you have attended</p>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Institution</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Country</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">From: Month/Year</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">To: Month/Year</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Degree/Classification</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            {educationalBackground.map((entry: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={entry.institution}
                    onChange={(e) => updateEducationEntry(index, 'institution', e.target.value)}
                    className="w-full px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    placeholder="Institution name"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={entry.country}
                    onChange={(e) => updateEducationEntry(index, 'country', e.target.value)}
                    className="w-full px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    placeholder="Country"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex gap-1">
                    <select
                      value={entry.from_month}
                      onChange={(e) => updateEducationEntry(index, 'from_month', e.target.value)}
                      className="flex-1 px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded text-sm"
                    >
                      <option value="">Month</option>
                      {months.map(m => <option key={m} value={m}>{m.substring(0, 3)}</option>)}
                    </select>
                    <select
                      value={entry.from_year}
                      onChange={(e) => updateEducationEntry(index, 'from_year', e.target.value)}
                      className="flex-1 px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded text-sm"
                    >
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex gap-1">
                    <select
                      value={entry.to_month}
                      onChange={(e) => updateEducationEntry(index, 'to_month', e.target.value)}
                      className="flex-1 px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded text-sm"
                    >
                      <option value="">Month</option>
                      {months.map(m => <option key={m} value={m}>{m.substring(0, 3)}</option>)}
                    </select>
                    <select
                      value={entry.to_year}
                      onChange={(e) => updateEducationEntry(index, 'to_year', e.target.value)}
                      className="flex-1 px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded text-sm"
                    >
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={entry.degree}
                    onChange={(e) => updateEducationEntry(index, 'degree', e.target.value)}
                    className="w-full px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    placeholder="Degree & Classification"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {educationalBackground.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducationEntry(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addEducationEntry}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
      >
        <FaPlus className="w-4 h-4" />
        Add Another Institution
      </button>

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
          Next: Employment Record
        </button>
      </div>
    </div>
  )
}


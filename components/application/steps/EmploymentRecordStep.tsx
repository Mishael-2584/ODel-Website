'use client'

import { useState } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa'

interface EmploymentRecordStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onNext: () => void
  onPrev: () => void
}

export default function EmploymentRecordStep({
  formData,
  errors,
  onInputChange,
  onNext,
  onPrev,
}: EmploymentRecordStepProps) {
  const [employmentRecord, setEmploymentRecord] = useState(
    formData.employment_record && formData.employment_record.length > 0
      ? formData.employment_record
      : [{ from_month: '', from_year: '', to_month: '', to_year: '', employer: '', position: '', experience: '' }]
  )

  const addEmploymentEntry = () => {
    setEmploymentRecord([
      ...employmentRecord,
      { from_month: '', from_year: '', to_month: '', to_year: '', employer: '', position: '', experience: '' }
    ])
  }

  const removeEmploymentEntry = (index: number) => {
    if (employmentRecord.length > 1) {
      const updated = employmentRecord.filter((_: any, i: number) => i !== index)
      setEmploymentRecord(updated)
      onInputChange({ target: { name: 'employment_record', value: updated } } as any)
    }
  }

  const updateEmploymentEntry = (index: number, field: string, value: string) => {
    const updated = employmentRecord.map((entry: any, i: number) =>
      i === index ? { ...entry, [field]: value } : entry
    )
    setEmploymentRecord(updated)
    onInputChange({ target: { name: 'employment_record', value: updated } } as any)
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Employment Record</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">From</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">To</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Employer</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Position/Experience</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            {employmentRecord.map((entry: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex gap-1">
                    <select
                      value={entry.from_month}
                      onChange={(e) => updateEmploymentEntry(index, 'from_month', e.target.value)}
                      className="flex-1 px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded text-sm"
                    >
                      <option value="">Month</option>
                      {months.map(m => <option key={m} value={m}>{m.substring(0, 3)}</option>)}
                    </select>
                    <select
                      value={entry.from_year}
                      onChange={(e) => updateEmploymentEntry(index, 'from_year', e.target.value)}
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
                      onChange={(e) => updateEmploymentEntry(index, 'to_month', e.target.value)}
                      className="flex-1 px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded text-sm"
                    >
                      <option value="">Month</option>
                      {months.map(m => <option key={m} value={m}>{m.substring(0, 3)}</option>)}
                    </select>
                    <select
                      value={entry.to_year}
                      onChange={(e) => updateEmploymentEntry(index, 'to_year', e.target.value)}
                      className="flex-1 px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded text-sm"
                    >
                      <option value="">Year</option>
                      <option value="Present">Present</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={entry.employer}
                    onChange={(e) => updateEmploymentEntry(index, 'employer', e.target.value)}
                    className="w-full px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    placeholder="Employer name"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={entry.position}
                    onChange={(e) => updateEmploymentEntry(index, 'position', e.target.value)}
                    className="w-full px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    placeholder="Position/Experience"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {employmentRecord.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmploymentEntry(index)}
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
        onClick={addEmploymentEntry}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
      >
        <FaPlus className="w-4 h-4" />
        Add Another Employment
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
          Next: Career Objectives
        </button>
      </div>
    </div>
  )
}


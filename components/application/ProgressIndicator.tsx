'use client'

import { FaCheckCircle } from 'react-icons/fa'

interface ProgressIndicatorProps {
  currentStep: number
}

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'Personal' },
    { number: 2, label: 'Program' },
    { number: 3, label: 'Study Info' },
    { number: 4, label: 'Education' },
    { number: 5, label: 'Employment' },
    { number: 6, label: 'Career' },
    { number: 7, label: 'Certify' },
    { number: 8, label: 'Documents' },
    { number: 9, label: 'Review' },
  ]

  return (
    <section className="bg-white border-b py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? <FaCheckCircle /> : step.number}
                </div>
                <span className={`text-xs mt-2 text-center ${currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


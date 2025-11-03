'use client'

import Link from 'next/link'
import { FaCheckCircle } from 'react-icons/fa'

interface SuccessScreenProps {
  applicationNumber: string
  applicationType: string
  fee: string
  email: string
}

export default function SuccessScreen({
  applicationNumber,
  applicationType,
  fee,
  email,
}: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
          <FaCheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h1>
          <p className="text-lg text-gray-700 mb-6">
            Your {applicationType} application has been received.
          </p>
          <div className="bg-white rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Application Number</p>
            <p className="text-2xl font-bold text-primary-600">{applicationNumber}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <p className="font-semibold text-blue-900 mb-2">Next Steps:</p>
            <ul className="text-sm text-blue-800 space-y-1 text-left list-disc list-inside">
              <li>Make payment of KES {fee} application fee</li>
              <li>Submit proof of payment to admissions@ueab.ac.ke</li>
              <li>Upload all required documents</li>
              <li>Track your application status using your application number</li>
            </ul>
          </div>
          <p className="text-gray-600 mb-6">
            Please save this number for future reference. You can use it to check your application status.
          </p>
          <div className="space-y-4">
            <Link href="/" className="btn-primary inline-block">
              Return to Homepage
            </Link>
            <p className="text-sm text-gray-500">
              An email confirmation has been sent to {email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


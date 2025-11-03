'use client'

import { FaInfoCircle } from 'react-icons/fa'
import { APPLICATION_CONFIG } from '@/lib/application-config'

interface PaymentStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onFileUpload: (field: string, file: File) => void
  onNext: () => void
  onPrev: () => void
}

export default function PaymentStep({
  formData,
  errors,
  onInputChange,
  onFileUpload,
  onNext,
  onPrev,
}: PaymentStepProps) {
  const applicationType = formData.application_type || 'graduate'
  const config = APPLICATION_CONFIG[applicationType]
  const fee = config?.fee || 0

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload('payment_receipt', file)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Fee Payment</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <FaInfoCircle className="inline mr-2" />
          <strong>Note:</strong> Application fee is non-refundable
        </p>
      </div>

      {/* Fee Display */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Fee Amount</h3>
        <div className="space-y-3">
          {applicationType === 'pgde' && (
            <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-primary-500 rounded-lg bg-white">
              <input
                type="radio"
                name="application_fee_amount"
                value="2500"
                checked={formData.application_fee_amount === '2500' || formData.application_fee_amount === 2500}
                onChange={onInputChange}
                className="w-4 h-4"
              />
              <span className="font-semibold">KES 2,500 for PGDE</span>
            </label>
          )}
          {(applicationType === 'undergraduate' || applicationType === 'diploma' || applicationType === 'certificate') && (
            <>
              {applicationType === 'undergraduate' && (
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-primary-500 rounded-lg bg-white">
                  <input
                    type="radio"
                    name="application_fee_amount"
                    value="1500"
                    checked={formData.application_fee_amount === '1500' || formData.application_fee_amount === 1500}
                    onChange={onInputChange}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold">KES 1,500 for Undergraduate</span>
                </label>
              )}
              {(applicationType === 'diploma' || applicationType === 'certificate') && (
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-primary-500 rounded-lg bg-white">
                  <input
                    type="radio"
                    name="application_fee_amount"
                    value="1000"
                    checked={formData.application_fee_amount === '1000' || formData.application_fee_amount === 1000}
                    onChange={onInputChange}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold">KES 1,000 for Diploma/Certificate</span>
                </label>
              )}
            </>
          )}
          {(applicationType === 'graduate' || applicationType === 'phd') && (
            <div className="p-3 border rounded-lg bg-white">
              <span className="font-semibold text-gray-900">
                Application Fee: KES {fee.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Payment Method <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
            <input
              type="radio"
              name="payment_method"
              value="Mpesa"
              checked={formData.payment_method === 'Mpesa'}
              onChange={onInputChange}
              className="w-4 h-4"
              required
            />
            <span>Mpesa</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
            <input
              type="radio"
              name="payment_method"
              value="Bank Transfer"
              checked={formData.payment_method === 'Bank Transfer'}
              onChange={onInputChange}
              className="w-4 h-4"
              required
            />
            <span>Bank Transfer (USD)</span>
          </label>
        </div>
        {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>}
      </div>

      {/* Mpesa Instructions */}
      {formData.payment_method === 'Mpesa' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Mpesa Payment Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Go to Mpesa menu on your phone</li>
            <li>Select "Pay Bill"</li>
            <li>Enter Paybill Number: <strong>4077813</strong></li>
            <li>Enter Account Number: <strong>APPLICATION FEE</strong></li>
            <li>Enter the amount: <strong>KES {formData.application_fee_amount || fee}</strong></li>
            <li>Enter your Mpesa PIN</li>
            <li>Confirm payment</li>
          </ol>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transaction ID / Receipt Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="payment_transaction_id"
                value={formData.payment_transaction_id}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.payment_transaction_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter transaction ID"
                required={formData.payment_method === 'Mpesa'}
              />
              {errors.payment_transaction_id && (
                <p className="text-red-500 text-sm mt-1">{errors.payment_transaction_id}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Payment Receipt (Optional)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer Instructions (USD) */}
      {formData.payment_method === 'Bank Transfer' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bank Transfer Instructions (USD)</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Account Name:</strong> University of Eastern Africa, Baraton
            </div>
            <div>
              <strong>Bank Name:</strong> Kenya Commercial Bank
            </div>
            <div>
              <strong>Branch:</strong> Kapsabet
            </div>
            <div>
              <strong>Account Number:</strong> 1102100692
            </div>
            <div>
              <strong>Swift Code (Routing Number):</strong> KCBLKENX
            </div>
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transaction Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="payment_transaction_id"
                value={formData.payment_transaction_id}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.payment_transaction_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter transaction reference"
                required={formData.payment_method === 'Bank Transfer'}
              />
              {errors.payment_transaction_id && (
                <p className="text-red-500 text-sm mt-1">{errors.payment_transaction_id}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Payment Receipt (Optional)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}

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


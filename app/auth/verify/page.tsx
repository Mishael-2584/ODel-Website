'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FaCheckCircle, FaArrowLeft, FaClock } from 'react-icons/fa'

export default function VerifyCodePage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [verified, setVerified] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(t => t - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()

      if (data.success) {
        setVerified(true)
        setTimeout(() => {
          router.push('/student/dashboard')
        }, 1500)
      } else {
        setError(data.error || 'Failed to verify code')
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (data.success) {
        setTimeLeft(600) // Reset timer
        setCode('')
        setError('')
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full mb-4">
              <FaCheckCircle className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Code</h1>
            <p className="text-gray-600">Enter the code sent to your email</p>
          </div>

          {verified ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 animate-pulse">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verified!</h2>
              <p className="text-gray-600 mb-4">Your account is verified. Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Display */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Verification code sent to:</p>
                <p className="font-semibold text-gray-900">{email}</p>
              </div>

              {/* Code Input */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent font-mono"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <FaClock className={timeLeft < 60 ? 'text-red-600' : 'text-gray-600'} />
                <span className={timeLeft < 60 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                  Code expires in {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-800 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              {/* Resend Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium disabled:opacity-50"
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          )}

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link href="/auth" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <FaArrowLeft className="text-sm" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-300 text-sm mt-8">
          © 2025 University of Eastern Africa, Baraton - ODeL Centre
        </p>
      </div>
    </div>
  )
}

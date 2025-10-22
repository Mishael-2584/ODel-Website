'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaGraduationCap, FaArrowRight, FaCheckCircle, FaShieldAlt, FaClock, FaSpinner } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code' | 'redirecting'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [userLoggedIn, setUserLoggedIn] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          // User is logged in, redirect to dashboard
          setUserLoggedIn(true)
          router.push('/student/dashboard')
        } else {
          setCheckingAuth(false)
        }
      } catch (err) {
        // If there's an error checking, assume not logged in
        setCheckingAuth(false)
        console.log('Auth check error (expected if not logged in):', err)
      }
    }

    checkAuthStatus()
  }, [router])

  // Timer effect - counts down every second
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setTimerActive(false)
          setError('Code expired. Please request a new code.')
          setStep('email')
          return 600
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeRemaining > 300) return 'text-emerald-400' // > 5 min - green
    if (timeRemaining > 60) return 'text-amber-400' // > 1 min - amber
    return 'text-red-400' // < 1 min - red
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setStep('code')
        setTimeRemaining(600) // Reset timer to 10 minutes
        setTimerActive(true) // Start the timer
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'Failed to send code')
      }
    } catch (err) {
      setError('Error sending code. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimerActive(false) // Stop timer when verification successful
        setStep('redirecting')
        
        // Redirect after a brief moment (loader will show)
        setTimeout(() => {
          router.push('/student/dashboard')
        }, 2500)
      } else {
        setError(data.error || 'Invalid code')
      }
    } catch (err) {
      setError('Error verifying code. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Show loading spinner while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-primary-300 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">UEAB ODeL</h1>
            <p className="text-gray-200 text-lg">Student Login</p>
          </div>

          {/* Main Card - White background for clarity */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            {step === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In with Your Email</h2>
                  <p className="text-gray-600">Enter your UEAB email to receive a magic code</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-600 text-xl" />
                    <div>
                      <p className="text-emerald-900 font-semibold">Code sent successfully!</p>
                      <p className="text-emerald-700 text-sm">Check your email for the code</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2 text-primary-600" />
                      UEAB Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.name@ueab.ac.ke"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Magic Code
                        <FaArrowRight />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {step === 'code' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Your Code</h2>
                  <p className="text-gray-600">Check your email and enter the 6-digit code</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-600 text-xl" />
                    <p className="text-emerald-900 font-semibold">Code verified! Logging in...</p>
                  </div>
                )}

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength="6"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition text-center text-2xl tracking-widest font-bold"
                      required
                    />
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <FaClock className="text-primary-600" />
                      Code expires in
                    </span>
                    <span className={`font-bold text-lg ${getTimerColor()}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Code
                        <FaArrowRight />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('email')
                      setCode('')
                      setError('')
                    }}
                    className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition"
                  >
                    ← Back to Email
                  </button>
                </form>
              </div>
            )}

            {step === 'redirecting' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-primary-300 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-900 font-semibold">Redirecting to dashboard...</p>
              </div>
            )}
          </div>

          {/* Info Sections - Light backgrounds for visibility */}
          <div className="space-y-4">
            {/* ITS Office Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FaShieldAlt className="text-blue-600" />
                Don't Have Your UEAB Email?
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                If you don't have your UEAB email yet, visit the <strong>ITS Office</strong> to get your credentials and email account set up.
              </p>
              <p className="text-blue-700 text-xs font-medium">
                Location: IT Services Office, Main Campus
              </p>
            </div>

            {/* iCampus Registration Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <FaGraduationCap className="text-amber-600" />
                Not Yet in the System?
              </h3>
              <p className="text-amber-800 text-sm mb-3">
                If you're not registered in the system, you'll need to complete your registration through <strong>iCampus</strong> first. Once registered, your account will be available on this platform.
              </p>
              <p className="text-amber-700 text-xs font-medium">
                Contact the Admissions office for iCampus registration assistance
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-300 text-sm">
            <p>Need help? Contact the IT Services Office or Student Support</p>
          </div>
        </div>
      </div>
    </div>
  )
}
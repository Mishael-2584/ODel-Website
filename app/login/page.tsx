'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaGraduationCap, FaArrowRight, FaCheckCircle, FaLock, FaShieldAlt } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
        // Redirect to student dashboard after brief success message
        setTimeout(() => {
          router.push('/student/dashboard')
        }, 1500)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-8 right-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo with animation */}
        <div className="text-center mb-12 animate-fade-in">
          <Link href="/" className="inline-flex items-center space-x-3 group mb-8">
            <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-3 rounded-2xl group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 shadow-lg shadow-gold">
              <FaGraduationCap className="h-10 w-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white font-heading">UEAB ODeL</h1>
              <p className="text-sm text-gray-300">eLearning Platform</p>
            </div>
          </Link>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className={`flex flex-col items-center transition-all ${step === 'email' ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mb-2 transition-all ${step === 'email' ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold' : 'bg-gray-600'}`}>
              1
            </div>
            <span className="text-xs text-gray-300 font-medium">Email</span>
          </div>

          <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step === 'code' ? 'bg-gradient-to-r from-gold-400 to-gold-600' : 'bg-gray-700'}`}></div>

          <div className={`flex flex-col items-center transition-all ${step === 'code' ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mb-2 transition-all ${step === 'code' ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold' : 'bg-gray-600'}`}>
              2
            </div>
            <span className="text-xs text-gray-300 font-medium">Verify</span>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
          {/* Gradient overlay on top */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gold-100 to-transparent opacity-30 rounded-bl-3xl"></div>
          
          <div className="relative z-10">
            <div className="mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-900 to-primary-700 bg-clip-text text-transparent mb-3 font-heading">
                {step === 'email' ? 'Welcome Back!' : 'Verify Code'}
              </h2>
              <p className="text-gray-600 text-lg">
                {step === 'email' 
                  ? 'Enter your UEAB email to receive a login code'
                  : 'We sent a 6-digit code to your email'}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-700 px-4 py-4 rounded-xl mb-6 flex items-start animation-slide-in">
                <FaCheckCircle className="mr-3 mt-1 flex-shrink-0 text-green-500" />
                <div>
                  <p className="font-semibold">Success!</p>
                  <p className="text-sm">{step === 'email' ? 'Code sent! Check your email.' : 'Login successful!'}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded-xl mb-6 flex items-start animation-slide-in">
                <FaShieldAlt className="mr-3 mt-1 flex-shrink-0 text-red-500" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleSendCode} className="space-y-6">
                {/* Email */}
                <div className="relative group">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 transition-all bg-gray-50 hover:bg-white"
                      placeholder="student@ueab.ac.ke"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <span className="mr-1">💡</span> Use your UEAB email registered in the system
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-md flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Code</span>
                      <FaArrowRight className="text-sm" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                {/* Code Input */}
                <div className="relative group">
                  <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-3">
                    6-Digit Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                    className="w-full text-center text-4xl tracking-widest font-bold py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 transition-all bg-gray-50 hover:bg-white font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    ✉️ Check your email for the code. It expires in 10 minutes.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-md flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <FaArrowRight className="text-sm" />
                    </>
                  )}
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setCode('')
                  }}
                  className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  ← Back to Email
                </button>
              </form>
            )}

            {/* Security info */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-2">
                <FaShieldAlt className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">🔐 Secure Authentication</p>
                  <p className="text-xs text-blue-700">Your login is protected with industry-standard security. Never share your code with anyone.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin & Links */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-300 text-sm">
            Administrator?{' '}
            <Link href="/admin/login" className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">
              Admin Login
            </Link>
          </p>
          
          <p className="text-gray-400 text-xs">
            © 2025 UEAB ODeL Platform • All rights reserved
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animation-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
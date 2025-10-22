'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaGraduationCap, FaArrowRight, FaCheckCircle, FaShieldAlt, FaClock } from 'react-icons/fa'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated background elements - subtle */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-8 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo with animation */}
        <div className="text-center mb-12 animate-fade-in">
          <Link href="/" className="inline-flex items-center space-x-3 group mb-8">
            <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-3 rounded-2xl group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-gold-500/50 transition-all duration-300 shadow-lg shadow-gold-500/30">
              <FaGraduationCap className="h-10 w-10 text-slate-900" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white font-heading">UEAB ODeL</h1>
              <p className="text-sm text-blue-200">eLearning Platform</p>
            </div>
          </Link>
        </div>

        {/* Step indicators - Modern style */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className={`flex flex-col items-center transition-all ${step !== 'email' ? 'opacity-40' : 'opacity-100'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mb-2 transition-all ${step !== 'email' ? 'bg-slate-700' : 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/50 scale-110'}`}>
              1
            </div>
            <span className="text-xs text-blue-200 font-medium">Email</span>
          </div>

          <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${step !== 'email' && step !== 'redirecting' ? 'bg-gradient-to-r from-gold-400 to-gold-600' : 'bg-slate-700'}`}></div>

          <div className={`flex flex-col items-center transition-all ${step === 'code' || step === 'redirecting' ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mb-2 transition-all ${(step === 'code' || step === 'redirecting') ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/50 scale-110' : 'bg-slate-700'}`}>
              2
            </div>
            <span className="text-xs text-blue-200 font-medium">Verify</span>
          </div>
        </div>

        {/* Main Login Card - Dark theme */}
        <div className="bg-gradient-to-br from-slate-800/40 to-blue-900/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700/50 hover:border-gold-500/30 transition-all duration-300 relative overflow-hidden group">
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Gradient overlay accent */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gold-500/20 to-transparent opacity-50 rounded-bl-3xl blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Redirecting state - show loader */}
            {step === 'redirecting' ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-6 relative">
                  {/* Outer rotating circle */}
                  <div className="w-20 h-20 rounded-full border-4 border-slate-700/30 border-t-gold-400 animate-spin"></div>
                  
                  {/* Inner pulsing circle */}
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-gold-400/20 animate-pulse"></div>
                  
                  {/* Center checkmark */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaCheckCircle className="text-emerald-400 text-3xl animate-scale-in" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2 font-heading">Welcome!</h3>
                <p className="text-blue-200 text-center text-sm">Logging you in securely...</p>
                
                <div className="mt-6 w-full h-1 bg-slate-700/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 rounded-full animate-pulse" style={{animation: 'progress 2.5s ease-in-out infinite'}}></div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-white mb-3 font-heading">
                    {step === 'email' ? 'Welcome Back!' : 'Verify Code'}
                  </h2>
                  <p className="text-blue-100 text-lg">
                    {step === 'email' 
                      ? 'Enter your UEAB email to receive a login code'
                      : 'We sent a 6-digit code to your email'}
                  </p>
                </div>

                {/* Timer display for code verification step */}
                {step === 'code' && (
                  <div className={`mb-6 p-3 rounded-lg border flex items-center justify-between ${timeRemaining > 60 ? 'bg-blue-500/10 border-blue-400/30' : 'bg-red-500/10 border-red-400/30'}`}>
                    <div className="flex items-center gap-2">
                      <FaClock className={`${getTimerColor()}`} />
                      <span className="text-blue-100 text-sm font-medium">Code expires in</span>
                    </div>
                    <span className={`text-lg font-mono font-bold ${getTimerColor()}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/50 text-emerald-100 px-4 py-4 rounded-xl mb-6 flex items-start animation-slide-in backdrop-blur-sm">
                    <FaCheckCircle className="mr-3 mt-1 flex-shrink-0 text-emerald-400" />
                    <div>
                      <p className="font-semibold">Success!</p>
                      <p className="text-sm text-emerald-200">{step === 'email' ? 'Code sent! Check your email.' : 'Code verified!'}</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 text-red-100 px-4 py-4 rounded-xl mb-6 flex items-start animation-slide-in backdrop-blur-sm">
                    <FaShieldAlt className="mr-3 mt-1 flex-shrink-0 text-red-400" />
                    <div>
                      <p className="font-semibold">Error</p>
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  </div>
                )}

                {step === 'email' ? (
                  <form onSubmit={handleSendCode} className="space-y-6">
                    {/* Email */}
                    <div className="relative group">
                      <label htmlFor="email" className="block text-sm font-semibold text-blue-100 mb-3">
                        Email Address
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-gold-400 transition-colors" />
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 focus:bg-slate-700/70 rounded-xl focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/30 transition-all text-white placeholder-slate-400"
                          placeholder="student@ueab.ac.ke"
                          required
                          disabled={loading}
                        />
                      </div>
                      <p className="text-xs text-blue-300 mt-2 flex items-center">
                        <span className="mr-1">💡</span> Use your UEAB email registered in the system
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-500 hover:via-gold-600 hover:to-gold-700 text-slate-900 font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-md flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-900 border-t-transparent"></div>
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
                      <label htmlFor="code" className="block text-sm font-semibold text-blue-100 mb-3">
                        6-Digit Code
                      </label>
                      <input
                        type="text"
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                        className="w-full text-center text-4xl tracking-widest font-bold py-4 px-4 border-2 border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 focus:bg-slate-700/70 rounded-xl focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/30 transition-all text-white font-mono placeholder-slate-500"
                        placeholder="000000"
                        maxLength={6}
                        required
                        disabled={loading || timeRemaining <= 0}
                      />
                      <p className="text-xs text-blue-300 mt-3 text-center">
                        ✉️ Enter the 6-digit code from your email
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || code.length !== 6 || timeRemaining <= 0}
                      className="w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-500 hover:via-gold-600 hover:to-gold-700 text-slate-900 font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-md flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-900 border-t-transparent"></div>
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
                        setTimerActive(false)
                      }}
                      className="w-full border-2 border-slate-600/50 text-blue-100 hover:text-white font-semibold py-3 px-4 rounded-xl hover:border-gold-400/50 hover:bg-slate-700/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      ← Back to Email
                    </button>
                  </form>
                )}

                {/* Security info */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-400/30 hover:border-blue-400/60 transition-all">
                  <div className="flex items-start gap-2">
                    <FaShieldAlt className="text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-100 mb-1">🔐 Secure Authentication</p>
                      <p className="text-xs text-blue-200">Your login is protected with industry-standard security. Never share your code with anyone.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Admin & Links */}
        {step !== 'redirecting' && (
          <div className="mt-8 text-center space-y-4">
            <p className="text-blue-200 text-sm">
              Administrator?{' '}
              <Link href="/admin/login" className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">
                Admin Login
              </Link>
            </p>
            
            <p className="text-slate-400 text-xs">
              © 2025 UEAB ODeL Platform • All rights reserved
            </p>
          </div>
        )}
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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes progress {
          0%, 100% {
            width: 0%;
          }
          50% {
            width: 100%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animation-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  )
}
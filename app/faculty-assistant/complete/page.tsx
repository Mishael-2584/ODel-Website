'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaLaptop,
  FaLock,
} from 'react-icons/fa'

type CompletionState = 'opening' | 'approved' | 'error' | 'invalid'

export default function FacultyAssistantCompletePage() {
  const [status, setStatus] = useState<CompletionState>('opening')
  const [message, setMessage] = useState('Opening Faculty Assistant securely...')
  const [callbackUrl, setCallbackUrl] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    const code = params.get('code') || ''
    const state = params.get('state') || ''
    const error = params.get('error') || ''
    const errorDescription = params.get('error_description') || ''

    // Authorization results are removed before they can remain in browser history.
    window.history.replaceState({}, '', window.location.pathname)

    if (!state || (!code && !error)) {
      setStatus('invalid')
      setMessage('This sign-in handoff is missing or has expired. Start again from Faculty Assistant.')
      return
    }

    const callback = new URL('facultyassistant://auth/callback')
    callback.searchParams.set('state', state)
    if (code) callback.searchParams.set('code', code)
    if (error) callback.searchParams.set('error', error)
    if (errorDescription) callback.searchParams.set('error_description', errorDescription)
    setCallbackUrl(callback.toString())

    window.location.assign(callback.toString())
    const timer = window.setTimeout(() => {
      if (error) {
        setStatus('error')
        setMessage(errorDescription || 'Faculty Assistant could not be authorized.')
      } else {
        setStatus('approved')
        setMessage('Sign-in approved. You can now return to Faculty Assistant.')
      }
    }, 900)

    return () => window.clearTimeout(timer)
  }, [])

  const isApproved = status === 'approved'
  const isFailure = status === 'error' || status === 'invalid'

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(212,155,36,0.2),transparent_24rem),linear-gradient(145deg,#081d3d,#123461_62%,#0b2548)] px-5 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/15 bg-white/95 text-slate-900 shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between bg-[#0b294f] p-9 text-white lg:p-12">
            <div>
              <div className="mb-9 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d49b24] text-[#09264a]">
                <FaLaptop className="text-2xl" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Faculty Assistant</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">Your lecturer workspace is ready.</h1>
              <p className="mt-5 max-w-md leading-7 text-blue-100">
                UEAB ODeL completed the secure handoff. Your Moodle password was never shared with the desktop application.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-3 text-sm text-blue-100">
              <FaLock className="text-amber-300" /> One-time authorization protected with PKCE
            </div>
          </div>

          <div className="flex flex-col justify-center p-9 lg:p-14">
            <div className={`mb-7 flex h-20 w-20 items-center justify-center rounded-3xl ${isFailure ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isFailure ? <FaExclamationTriangle className="text-3xl" /> : <FaCheckCircle className="text-4xl" />}
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              {status === 'opening' ? 'Completing connection' : isApproved ? 'Connected securely' : 'Action required'}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#09264a]">
              {status === 'opening' ? 'Opening the Windows app...' : isApproved ? 'You are signed in.' : 'We could not finish sign-in.'}
            </h2>
            <p className="mt-4 text-lg leading-7 text-slate-600">{message}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {callbackUrl && (
                <button
                  onClick={() => window.location.assign(callbackUrl)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#d49b24] px-5 py-3 font-bold text-[#09264a] shadow-sm hover:bg-[#e0ad43]"
                >
                  <FaExternalLinkAlt /> Open Faculty Assistant
                </button>
              )}
              <Link
                href="/"
                className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                Return to ODeL
              </Link>
            </div>

            <p className="mt-8 text-sm text-slate-500">
              This browser tab can be closed after Faculty Assistant opens.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

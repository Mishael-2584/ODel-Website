'use client'

import { FormEvent, useEffect, useState } from 'react'
import { FaArrowRight, FaCheckCircle, FaLock, FaSyncAlt } from 'react-icons/fa'
import {
  facultyAssistantBillingLabel,
  type FacultyAssistantBillingPeriod,
  type FacultyAssistantPaidPlan,
} from '@/lib/faculty-assistant/plans'
import { facultyAssistantContact } from '@/lib/faculty-assistant/contact'

export default function UpgradeRequestForm({ defaultPlan }: { defaultPlan: string }) {
  const [plan, setPlan] = useState<FacultyAssistantPaidPlan>(
    defaultPlan === 'institution' ? 'institution' : 'professional',
  )
  const [phone, setPhone] = useState('')
  const [billingPeriod, setBillingPeriod] = useState<FacultyAssistantBillingPeriod>('annual')
  const [notes, setNotes] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'success' | 'signin' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [requestId, setRequestId] = useState('')
  const [checking, setChecking] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationBusy, setVerificationBusy] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')
  const [existingRequest, setExistingRequest] = useState(false)
  const [payment, setPayment] = useState<{
    status: string
    stkStatus: string
    checkoutUrl: string
    accountReference: string
    amountKes: number
    activationEmailStatus?: string
    provider?: 'eversend' | 'paynexus'
    otpRequired?: boolean
    otpExpiresAt?: string
  } | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setState('busy')
    try {
      const response = await fetch('/api/faculty-assistant/licence/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedPlan: plan, billingPeriod, phone, notes, source: 'desktop-plans' }),
      })
      const result = await response.json().catch(() => ({}))
      if (response.status === 401) {
        setState('signin')
        setMessage('Sign in securely so the request is linked to the correct Faculty Assistant licence.')
        return
      }
      if (!response.ok) {
        setState('error')
        setMessage(
          result.error === 'valid_mpesa_phone_required'
            ? 'Enter a valid Safaricom number, such as 0712 345 678 or +254 712 345 678.'
            : 'We could not record the request. Please try again or contact Faculty Assistant support.',
        )
        return
      }
      setRequestId(String(result.requestId || ''))
      setPayment(result.payment || null)
      setExistingRequest(Boolean(result.existing && !result.resumed))
      setState('success')
      setMessage(
        result.existing && !result.resumed
          ? result.payment
            ? existingProfessionalRequestMessage(result.payment)
            : `An active ${plan === 'institution' ? 'Institution' : 'Professional'} request already exists for this account. It remains in the Licence Desk queue; please do not submit another request.`
          : result.invoicePersistence === 'failed'
            ? result.invoiceStatus === 'sent'
              ? 'Your request is safely recorded and the email was sent, but its Licence Desk tracking record needs attention. The team has been notified; please do not submit a duplicate request.'
              : 'Your request is safely recorded, but email delivery and its Licence Desk tracking record need attention. The team can contact you without creating another request.'
            : result.invoiceStatus === 'failed'
            ? 'Your request is safely recorded, but the invoice email could not be delivered. The Licence Desk can resend or contact you without creating another request.'
            : plan === 'institution'
              ? 'Your request is recorded. An acknowledgement was sent to your institutional email, and the Faculty Assistant team will contact you about the agreement and approved domains.'
              : professionalPaymentMessage(result.payment),
      )
    } catch {
      setState('error')
      setMessage('The payment service could not be reached. Your browser did not confirm a new request; reconnect and try again.')
    }
  }

  async function refreshPayment() {
    if (!requestId || checking) return
    setChecking(true)
    try {
      const response = await fetch(
        `/api/faculty-assistant/payments/status?requestId=${encodeURIComponent(requestId)}`,
        { cache: 'no-store' },
      )
      const result = await response.json().catch(() => ({}))
      if (!response.ok) return
      setPayment(result.payment || null)
      if (result.request?.status === 'activated' || result.payment?.status === 'completed') {
        setMessage('Payment confirmed. Your Professional licence is active. Open Faculty Assistant and refresh the licence.')
      } else if (result.payment?.status === 'failed') {
        setMessage('The last M-Pesa collection was not completed. You can safely send another prompt below without creating a new upgrade request.')
      } else if (result.payment?.status === 'pending') {
        setMessage('The M-Pesa request is processing. If you already paid, keep this page open or use Check payment status; you will not be charged again by checking.')
      }
    } catch {
      setMessage('Payment status could not be refreshed. We will keep checking while this page remains open.')
    } finally {
      setChecking(false)
    }
  }

  async function retryPayment() {
    if (checking) return
    setChecking(true)
    try {
      const response = await fetch('/api/faculty-assistant/licence/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedPlan: plan, billingPeriod, phone, notes, source: 'payment-retry' }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage('Another M-Pesa prompt could not be prepared. Please wait briefly and try again; your existing request remains safe.')
        return
      }
      setRequestId(String(result.requestId || requestId))
      setPayment(result.payment || null)
      setVerificationCode('')
      setVerificationMessage('')
      setMessage(professionalPaymentMessage(result.payment || null))
    } catch {
      setMessage('The payment service could not be reached. Your existing request remains safe; reconnect and try again.')
    } finally {
      setChecking(false)
    }
  }

  async function handleVerification(action: 'verify' | 'resend') {
    if (!requestId || verificationBusy) return
    setVerificationBusy(true)
    setVerificationMessage('')
    try {
      const response = await fetch('/api/faculty-assistant/payments/eversend/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          ...(action === 'verify' ? { pin: verificationCode } : {}),
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        const messages: Record<string, string> = {
          invalid_verification_code: 'That verification code was not accepted. Check the SMS and try again.',
          verification_code_expired: 'That code has expired. Request a new code below.',
          verification_attempt_limit_reached: 'Too many unsuccessful attempts. Contact Faculty Assistant support.',
          verification_resend_limit_reached: 'The resend limit has been reached. Contact Faculty Assistant support.',
          verification_resend_too_soon: 'Please wait one minute before requesting another code.',
          verification_provider_failed: 'Your code may have been accepted, but Eversend did not return a final collection result. Use Check payment status before trying another prompt.',
        }
        setVerificationMessage(messages[String(result.error || '')] || 'Verification could not be completed. Please try again.')
        return
      }
      setPayment(result.payment || null)
      if (action === 'resend') {
        setVerificationCode('')
        setVerificationMessage('A new verification code was sent to your phone.')
      } else {
        setVerificationCode('')
        setMessage(result.payment?.status === 'failed' || result.collectionFailed
          ? 'Phone verification succeeded, but the M-Pesa collection was not completed. You can safely send another prompt below.'
          : result.processing
          ? 'Your phone verification was accepted and Eversend is still confirming the M-Pesa request. Do not enter the code again; use Check payment status.'
          : 'Phone verified. Eversend has started the M-Pesa payment prompt. Complete it once; your licence activates after provider confirmation.')
      }
    } catch {
      setVerificationMessage('The verification service could not be reached. Please reconnect and try again.')
    } finally {
      setVerificationBusy(false)
    }
  }

  useEffect(() => {
    if (!requestId || !payment || payment.otpRequired || !['created', 'pending'].includes(payment.status)) return
    const timer = window.setInterval(() => void refreshPayment(), 5000)
    return () => window.clearInterval(timer)
  // Poll only while this specific order remains open.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, payment?.status])

  if (state === 'success') {
    const activated = payment?.status === 'completed'
    const waitingOnExistingRequest = existingRequest && !activated
    return (
      <div className={`rounded-2xl border p-6 ${activated ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
        <FaCheckCircle className="text-3xl text-emerald-600" />
        <h3 className="mt-4 text-xl font-bold">{activated ? 'Licence activated' : waitingOnExistingRequest ? 'Upgrade request already active' : 'Complete your M-Pesa payment'}</h3>
        <p className="mt-2 leading-6">{message}</p>
        {waitingOnExistingRequest && requestId && (
          <p className="mt-3 text-sm">Request ID: <strong>{requestId}</strong></p>
        )}
        {payment && (
          <div className="mt-5 rounded-xl border border-black/10 bg-white/70 p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span>Reference <strong>{payment.accountReference}</strong></span>
              <span><strong>KES {Number(payment.amountKes).toLocaleString('en-KE')}</strong></span>
            </div>
            <p className="mt-2">Status: <strong className="capitalize">{payment.status.replace(/_/g, ' ')}</strong></p>
          </div>
        )}
        {!activated && payment?.otpRequired && (
          <div className="mt-5 rounded-xl border border-amber-300 bg-white p-4">
            <p className="font-bold">Verify this phone number</p>
            <p className="mt-1 text-sm leading-6">Eversend sent a temporary code by SMS. Enter it here to continue to the M-Pesa prompt. Faculty Assistant support will never ask for this code.</p>
            <label className="mt-4 block text-sm font-bold">
              Verification code
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={8}
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 8))}
                className="mt-2 w-full rounded-xl border border-amber-300 px-4 py-3 text-lg font-bold tracking-[0.2em] outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              />
            </label>
            {verificationMessage && <p className="mt-3 text-sm font-medium">{verificationMessage}</p>}
            <button
              type="button"
              disabled={verificationBusy || verificationCode.length < 4}
              onClick={() => void handleVerification('verify')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d49b24] px-5 py-3 font-bold text-[#09264a] disabled:opacity-60"
            >
              {verificationBusy ? 'Verifying...' : 'Verify and send M-Pesa prompt'} <FaArrowRight />
            </button>
            <button
              type="button"
              disabled={verificationBusy}
              onClick={() => void handleVerification('resend')}
              className="mt-2 w-full px-4 py-2 text-sm font-bold underline disabled:opacity-60"
            >
              Send a new code
            </button>
          </div>
        )}
        {!activated && payment?.checkoutUrl && (
          <a href={payment.checkoutUrl} target="_blank" rel="noreferrer" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d49b24] px-5 py-3 font-bold text-[#09264a] hover:bg-[#e0ad43]">
            Open secure M-Pesa checkout <FaArrowRight />
          </a>
        )}
        {!activated && payment && !payment.otpRequired && (
          <button type="button" disabled={checking} onClick={() => void refreshPayment()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-5 py-3 font-bold disabled:opacity-60">
            <FaSyncAlt className={checking ? 'animate-spin' : ''} /> {checking ? 'Checking...' : 'Check payment status'}
          </button>
        )}
        {!activated && payment?.status === 'failed' && (
          <button type="button" disabled={checking} onClick={() => void retryPayment()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d49b24] px-5 py-3 font-bold text-[#09264a] disabled:opacity-60">
            <FaSyncAlt className={checking ? 'animate-spin' : ''} /> {checking ? 'Preparing...' : 'Send another M-Pesa prompt'}
          </button>
        )}
        {payment?.checkoutUrl && <p className="mt-3 text-xs opacity-75">Do not pay both the phone prompt and checkout link. They are two ways to complete the same licence order.</p>}
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Activate a paid licence</p>
      <h2 className="mt-2 text-2xl font-bold text-[#09264a]">Request an upgrade</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Professional licences use a secure Eversend M-Pesa prompt. Institution requests remain agreement-led and are confirmed by the Licence Desk.</p>

      <label className="mt-5 block text-sm font-bold text-slate-700">
        Plan
        <select value={plan} onChange={(event) => {
          setPlan(event.target.value as FacultyAssistantPaidPlan)
          setBillingPeriod('annual')
        }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100">
          <option value="professional">Professional lecturer</option>
          <option value="institution">Institution / department</option>
        </select>
      </label>
      <label className="mt-4 block text-sm font-bold text-slate-700">
        Billing
        <select value={billingPeriod} onChange={(event) => setBillingPeriod(event.target.value as FacultyAssistantBillingPeriod)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100">
          <option value="annual">{facultyAssistantBillingLabel(plan, 'annual')} - best value</option>
          {plan === 'professional'
            ? <option value="monthly">{facultyAssistantBillingLabel(plan, 'monthly')}</option>
            : <option value="semester">{facultyAssistantBillingLabel(plan, 'semester')}</option>}
        </select>
      </label>
      <label className="mt-4 block text-sm font-bold text-slate-700">
        Phone or WhatsApp
        <input required={plan === 'professional'} inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. 0712 345 678" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" />
      </label>
      <label className="mt-4 block text-sm font-bold text-slate-700">
        Notes (optional)
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Department, number of lecturers, or what you need help with" className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 font-medium outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" />
      </label>

      {message && (
        <div className={`mt-4 rounded-xl p-3 text-sm ${state === 'signin' ? 'bg-amber-50 text-amber-900' : 'bg-red-50 text-red-800'}`}>
          {message}
          {state === 'signin' && (
            <a href={`/login?returnTo=${encodeURIComponent(`/faculty-assistant/plans?plan=${plan}&source=desktop`)}`} className="mt-2 flex items-center gap-2 font-bold underline">
              Sign in to continue <FaArrowRight />
            </a>
          )}
        </div>
      )}

      <button disabled={state === 'busy'} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d49b24] px-5 py-3 font-bold text-[#09264a] hover:bg-[#e0ad43] disabled:opacity-60">
        {state === 'busy' ? 'Preparing secure payment...' : plan === 'professional' ? 'Send M-Pesa prompt' : 'Request institution coverage'} <FaArrowRight />
      </button>
      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><FaLock /> Your request is tied to your verified Faculty Assistant identity.</p>
      <p className="mt-2 text-xs text-slate-500">Need assistance? <a className="font-bold underline" href={`mailto:${facultyAssistantContact.supportEmail}`}>{facultyAssistantContact.supportEmail}</a></p>
    </form>
  )
}

function professionalPaymentMessage(payment: {
  stkStatus?: string
  checkoutUrl?: string
  provider?: 'eversend' | 'paynexus'
  otpRequired?: boolean
} | null) {
  if (!payment) {
    return 'Your request is recorded. A private invoice with payment instructions was sent to your verified institutional email. Manual Licence Desk verification applies while automated checkout is unavailable.'
  }
  if (payment.otpRequired) {
    return 'Eversend sent a phone-verification code. Enter it below to continue securely to the M-Pesa prompt.'
  }
  if (payment.stkStatus === 'initiated' && payment.checkoutUrl) {
    return `An M-Pesa prompt was sent to your phone, and a private backup checkout link was emailed to you. Your licence activates automatically after ${paymentProviderLabel(payment)} confirms payment.`
  }
  if (payment.stkStatus === 'initiated') {
    return `An M-Pesa prompt was sent to your phone. Your licence activates automatically after ${paymentProviderLabel(payment)} confirms payment.`
  }
  if (payment.checkoutUrl) {
    return `A private M-Pesa checkout link was emailed to you. Your licence activates automatically after ${paymentProviderLabel(payment)} confirms payment.`
  }
  return 'Automated payment could not be started. Your request is recorded, and the Licence Desk can assist without creating a duplicate request.'
}

function existingProfessionalRequestMessage(payment: {
  status?: string
  stkStatus?: string
  checkoutUrl?: string
  provider?: 'eversend' | 'paynexus'
  otpRequired?: boolean
}) {
  if (payment.status === 'completed') {
    return 'This request has already been paid. Refresh Faculty Assistant to load the activated licence, or contact support if access is not yet visible.'
  }
  if (payment.otpRequired) {
    return 'An active Professional request is already waiting for phone verification. Enter the Eversend SMS code below to continue; a duplicate request was not created.'
  }
  if (payment.stkStatus === 'initiated' || payment.checkoutUrl) {
    return 'An active Professional payment request already exists for this account. Complete the existing M-Pesa prompt or checkout, then use Check payment status below; a duplicate request was not created.'
  }
  return 'An active Professional request already exists for this account, but its automated payment is not currently available. The Licence Desk can close the stale request or assist with payment; a duplicate request was not created.'
}

function paymentProviderLabel(payment: { provider?: 'eversend' | 'paynexus' }) {
  return payment.provider === 'paynexus' ? 'PayNexus' : 'Eversend'
}

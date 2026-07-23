'use client'

import { FormEvent, useState } from 'react'
import { FaArrowRight, FaCheckCircle, FaLock } from 'react-icons/fa'
import {
  facultyAssistantBillingLabel,
  type FacultyAssistantBillingPeriod,
  type FacultyAssistantPaidPlan,
} from '@/lib/faculty-assistant/plans'

export default function UpgradeRequestForm({ defaultPlan }: { defaultPlan: string }) {
  const [plan, setPlan] = useState<FacultyAssistantPaidPlan>(
    defaultPlan === 'institution' ? 'institution' : 'professional',
  )
  const [phone, setPhone] = useState('')
  const [billingPeriod, setBillingPeriod] = useState<FacultyAssistantBillingPeriod>('annual')
  const [notes, setNotes] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'success' | 'signin' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setState('busy')
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
      setMessage('We could not record the request. Please try again or contact Faculty Assistant support.')
      return
    }
    setState('success')
    setMessage(
      result.existing
        ? 'Your upgrade request is already in our queue. Check the institutional email used for your request or wait for the Faculty Assistant team to contact you.'
        : result.invoicePersistence === 'failed'
          ? result.invoiceStatus === 'sent'
            ? 'Your request is safely recorded and the email was sent, but its Licence Desk tracking record needs attention. The team has been notified; please do not submit a duplicate request.'
            : 'Your request is safely recorded, but email delivery and its Licence Desk tracking record need attention. The team can contact you without creating another request.'
          : result.invoiceStatus === 'failed'
          ? 'Your request is safely recorded, but the invoice email could not be delivered. The Licence Desk can resend or contact you without creating another request.'
          : plan === 'institution'
            ? 'Your request is recorded. An acknowledgement was sent to your institutional email, and the Faculty Assistant team will contact you about the agreement and approved domains.'
            : 'Your request is recorded. A private invoice with payment instructions was sent to your verified institutional email. Licence activation follows payment verification.',
    )
  }

  if (state === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
        <FaCheckCircle className="text-3xl text-emerald-600" />
        <h3 className="mt-4 text-xl font-bold">Request received</h3>
        <p className="mt-2 leading-6 text-emerald-800">{message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Activate a paid licence</p>
      <h2 className="mt-2 text-2xl font-bold text-[#09264a]">Request an upgrade</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">No payment is taken on this page yet. We will confirm the licence and payment method with you.</p>

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
        <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. +254..." className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" />
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
        {state === 'busy' ? 'Submitting...' : 'Request activation'} <FaArrowRight />
      </button>
      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><FaLock /> Your request is tied to your verified Faculty Assistant identity.</p>
    </form>
  )
}

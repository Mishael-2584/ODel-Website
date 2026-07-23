'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, Building2, Save, ShieldCheck, UserPlus, UsersRound } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Institution = {
  id: string
  institution_name: string
  moodle_instance: string
  email_domains: string[]
  is_active: boolean
  expires_at: string
}
type Setting = {
  institution_licence_id: string
  mode: 'disabled' | 'optional' | 'required'
  retention_days: number
}
type Moderator = {
  id: string
  institution_licence_id: string
  email: string
  full_name: string
  scope_type: 'institution' | 'school' | 'course'
  scope_values: string[]
  is_active: boolean
}
type AdminData = {
  institutions: Institution[]
  settings: Setting[]
  moderators: Moderator[]
}

export default function ModerationAdministrationPage() {
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [institutionId, setInstitutionId] = useState('')
  const [mode, setMode] = useState<Setting['mode']>('optional')
  const [retentionDays, setRetentionDays] = useState(2555)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [scopeType, setScopeType] = useState<Moderator['scope_type']>('institution')
  const [scopeValues, setScopeValues] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [working, setWorking] = useState(false)

  const load = useCallback(async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.replace('/admin/login?returnTo=%2Ffaculty-assistant%2Fadmin%2Fmoderation')
      return
    }
    const response = await fetch('/api/faculty-assistant/admin/moderation', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await response.json().catch(() => ({}))
    if (response.status === 401) {
      router.replace('/admin/login?returnTo=%2Ffaculty-assistant%2Fadmin%2Fmoderation')
      return
    }
    if (!response.ok) {
      setError(result.error || 'Moderation administration could not be loaded.')
      return
    }
    setData(result)
    setInstitutionId((current) => current || result.institutions[0]?.id || '')
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const institution = data?.institutions.find((item) => item.id === institutionId)
  const setting = data?.settings.find((item) => item.institution_licence_id === institutionId)
  const moderators = useMemo(
    () => (data?.moderators || []).filter((item) => item.institution_licence_id === institutionId),
    [data?.moderators, institutionId],
  )

  useEffect(() => {
    setMode(setting?.mode || 'optional')
    setRetentionDays(setting?.retention_days || 2555)
  }, [setting])

  async function mutate(method: 'POST' | 'PATCH', payload: Record<string, unknown>) {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    setWorking(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/faculty-assistant/admin/moderation', {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(adminError(result.error))
      setNotice(method === 'POST' ? 'Moderator account and scope saved.' : 'Moderation settings updated.')
      await load()
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'The change could not be saved.')
    } finally {
      setWorking(false)
    }
  }

  async function createModerator(event: React.FormEvent) {
    event.preventDefault()
    await mutate('POST', {
      institutionId,
      email,
      fullName,
      temporaryPassword,
      scopeType,
      scopeValues,
    })
    setEmail('')
    setFullName('')
    setTemporaryPassword('')
    setScopeValues('')
  }

  if (!data) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f3efe5] text-[#123a55]">Loading institution controls...</main>
  }

  return (
    <main className="min-h-screen bg-[#f3efe5] text-[#10233c]">
      <header className="bg-[#123a55] px-5 py-6 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f5c85b]">Faculty Assistant administration</p>
            <h1 className="mt-1 font-serif text-3xl font-bold">Moderation controls</h1>
          </div>
          <Link className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold hover:bg-white/10" href="/faculty-assistant/admin">
            <ArrowLeft size={18} /> Licence Desk
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8">
        {error && <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle size={18} /> {error}</div>}
        {notice && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}

        <section className="rounded-2xl border border-[#ded5c4] bg-white p-6">
          <label className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Registered institution</label>
          <select
            className="mt-2 w-full rounded-xl border border-[#d8cfbd] bg-white px-4 py-3 font-bold outline-none focus:border-[#b77900]"
            value={institutionId}
            onChange={(event) => setInstitutionId(event.target.value)}
          >
            {data.institutions.map((item) => <option key={item.id} value={item.id}>{item.institution_name} · {item.moodle_instance}</option>)}
          </select>
          {institution && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
              <span className="rounded-full bg-[#f3efe5] px-3 py-2">{institution.email_domains.join(', ') || 'No email domain'}</span>
              <span className="rounded-full bg-[#f3efe5] px-3 py-2">{institution.is_active ? 'Licence active' : 'Licence inactive'}</span>
            </div>
          )}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#ded5c4] bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#f7e8ba] p-3 text-[#9a6500]"><ShieldCheck size={22} /></div>
              <div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Institution workflow</p><h2 className="font-serif text-2xl font-bold">Moderation policy</h2></div>
            </div>
            <div className="mt-6 grid gap-3">
              {([
                ['disabled', 'Disabled', 'Lecturers export after reconciliation; no desk submission.'],
                ['optional', 'Optional', 'Lecturers may submit for committee review or export directly.'],
                ['required', 'Required', 'Final iCampus export needs a live approved receipt.'],
              ] as const).map(([value, label, description]) => (
                <label key={value} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${mode === value ? 'border-[#b77900] bg-[#fff8e5]' : 'border-[#ded5c4]'}`}>
                  <input type="radio" name="mode" value={value} checked={mode === value} onChange={() => setMode(value)} />
                  <span><strong className="block">{label}</strong><span className="mt-1 block text-sm text-slate-600">{description}</span></span>
                </label>
              ))}
            </div>
            <label className="mt-5 block text-sm font-bold">
              Retention target in days
              <input className="mt-2 w-full rounded-xl border border-[#d8cfbd] px-4 py-3" type="number" min={30} max={3650} value={retentionDays} onChange={(event) => setRetentionDays(Number(event.target.value))} />
              <span className="mt-1 block text-xs font-normal text-slate-500">Recorded for institutional policy. Automatic deletion remains disabled during beta.</span>
            </label>
            <button
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#123a55] px-5 py-3 font-bold text-white disabled:opacity-60"
              disabled={working || !institutionId}
              onClick={() => void mutate('PATCH', { action: 'update_policy', institutionId, mode, retentionDays })}
            >
              <Save size={18} /> Save institution policy
            </button>
          </section>

          <form className="rounded-2xl border border-[#ded5c4] bg-white p-6" onSubmit={createModerator}>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#dceee8] p-3 text-[#176b50]"><UserPlus size={22} /></div>
              <div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Account and scope</p><h2 className="font-serif text-2xl font-bold">Add moderator</h2></div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold">Full name<input className="mt-2 w-full rounded-xl border border-[#d8cfbd] px-4 py-3 font-normal" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>
              <label className="text-sm font-bold">Institution email<input className="mt-2 w-full rounded-xl border border-[#d8cfbd] px-4 py-3 font-normal" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            </div>
            <label className="mt-4 block text-sm font-bold">
              Temporary password
              <input className="mt-2 w-full rounded-xl border border-[#d8cfbd] px-4 py-3 font-normal" type="password" minLength={12} value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} />
              <span className="mt-1 block text-xs font-normal text-slate-500">Required only for a new account. Use at least 12 characters and share it securely.</span>
            </label>
            <label className="mt-4 block text-sm font-bold">
              Review scope
              <select className="mt-2 w-full rounded-xl border border-[#d8cfbd] bg-white px-4 py-3" value={scopeType} onChange={(event) => setScopeType(event.target.value as Moderator['scope_type'])}>
                <option value="institution">Entire institution</option>
                <option value="school">Specific school or faculty</option>
                <option value="course">Specific course code or Moodle ID</option>
              </select>
            </label>
            {scopeType !== 'institution' && (
              <label className="mt-4 block text-sm font-bold">
                Allowed {scopeType === 'school' ? 'school names' : 'course codes / Moodle IDs'}
                <textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#d8cfbd] p-3 font-normal" placeholder="One per line or comma-separated" value={scopeValues} onChange={(event) => setScopeValues(event.target.value)} required />
              </label>
            )}
            <button className="mt-5 flex items-center gap-2 rounded-xl bg-[#176b50] px-5 py-3 font-bold text-white disabled:opacity-60" disabled={working || !institutionId}>
              <UserPlus size={18} /> Create moderator assignment
            </button>
          </form>
        </div>

        <section className="mt-6 rounded-2xl border border-[#ded5c4] bg-white p-6">
          <div className="flex items-center gap-3"><UsersRound className="text-[#b77900]" /><h2 className="font-serif text-2xl font-bold">Institution moderators</h2></div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[#ded5c4] text-xs uppercase tracking-[.1em] text-slate-500"><tr><th className="py-3">Moderator</th><th>Scope</th><th>Status</th><th>Control</th></tr></thead>
              <tbody>
                {moderators.map((moderator) => (
                  <tr key={moderator.id} className="border-b border-[#eee7da]">
                    <td className="py-4"><strong className="block">{moderator.full_name}</strong><span className="text-slate-500">{moderator.email}</span></td>
                    <td><strong className="capitalize">{moderator.scope_type}</strong><span className="ml-2 text-xs text-slate-500">{moderator.scope_values.join(', ')}</span></td>
                    <td>{moderator.is_active ? 'Active' : 'Suspended'}</td>
                    <td><button className="font-bold text-[#123a55] underline" onClick={() => void mutate('PATCH', { action: 'update_moderator', moderatorId: moderator.id, scopeType: moderator.scope_type, scopeValues: moderator.scope_values, isActive: !moderator.is_active })}>{moderator.is_active ? 'Suspend' : 'Restore'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!moderators.length && <p className="py-8 text-center text-sm text-slate-500">No moderator accounts have been assigned to this institution.</p>}
          </div>
        </section>
      </div>
    </main>
  )
}

function adminError(value: string) {
  const messages: Record<string, string> = {
    moderator_email_outside_institution: 'Use an email address covered by the institution licence.',
    temporary_password_too_short: 'A new moderator needs a temporary password of at least 12 characters.',
    invalid_moderator_account: 'Complete the moderator name, email, and review scope.',
    moderator_account_creation_failed: 'The secure moderator login account could not be created.',
    moderation_policy_update_failed: 'The institution moderation policy could not be saved.',
  }
  return messages[value] || value || 'The moderation setting could not be saved.'
}

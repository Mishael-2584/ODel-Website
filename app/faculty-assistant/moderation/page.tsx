'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { FacultyAssistantBrand } from '@/components/faculty-assistant/FacultyAssistantBrand'

type Submission = {
  id: string
  lecturer_email: string
  lecturer_name: string
  moodle_course_id: number
  course_code: string
  course_title: string
  academic_period: string
  school_name: string
  version_number: number
  version_checksum: string
  snapshot: {
    policy?: {
      courseworkWeight?: number
      examWeight?: number
    }
    components?: Array<{
      id: string
      group: 'coursework' | 'exam'
      source: 'moodle' | 'offline'
      name: string
      maximum: number
    }>
    results?: Array<{
      studentId: string
      name: string
      coursework: number | null
      exam: number | null
      total: number | null
      componentMarks?: Record<string, number | null>
      exception?: string
    }>
  }
  status: 'submitted' | 'approved' | 'changes_requested' | 'superseded' | 'withdrawn'
  decision_note: string
  decided_at?: string | null
  submitted_at: string
}

type Overview = {
  moderator: {
    id: string
    email: string
    name: string
    scopeType: 'institution' | 'school' | 'course'
    scopeValues: string[]
  }
  institution: { id: string; name: string; moodleInstance: string }
  policy: { mode: 'disabled' | 'optional' | 'required'; retentionDays: number }
  submissions: Submission[]
}

const tokenKey = 'faculty-assistant.moderation-token.v1'

export default function FacultyAssistantModerationDesk() {
  const [token, setToken] = useState('')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('submitted')
  const [selectedId, setSelectedId] = useState('')
  const [decisionNote, setDecisionNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async (activeToken: string) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/faculty-assistant/moderation/overview', {
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      const result = await response.json().catch(() => ({}))
      if (response.status === 401) {
        localStorage.removeItem(tokenKey)
        setToken('')
        setOverview(null)
        return
      }
      if (response.status === 403 && result.error === 'password_change_required') {
        setMustChangePassword(true)
        return
      }
      if (!response.ok) throw new Error(result.error || 'The Moderation Desk could not be loaded.')
      setOverview(result)
      setSelectedId((current) =>
        result.submissions.some((item: Submission) => item.id === current)
          ? current
          : result.submissions[0]?.id || '',
      )
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The Moderation Desk could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(tokenKey) || ''
    setToken(stored)
    if (stored) {
      void load(stored)
    } else {
      setLoading(false)
    }
  }, [load])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return (overview?.submissions || []).filter((item) => {
      const statusMatch = status === 'all' || item.status === status
      const queryMatch = !normalized || [
        item.course_code,
        item.course_title,
        item.lecturer_name,
        item.lecturer_email,
        item.academic_period,
        item.school_name,
      ].join(' ').toLowerCase().includes(normalized)
      return statusMatch && queryMatch
    })
  }, [overview?.submissions, query, status])
  const selected = overview?.submissions.find((item) => item.id === selectedId) || filtered[0]

  async function signIn(event: React.FormEvent) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      const response = await fetch('/api/faculty-assistant/moderation/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(loginError(result.error))
      localStorage.setItem(tokenKey, result.token)
      setToken(result.token)
      setPassword('')
      if (result.moderator?.mustChangePassword) {
        setMustChangePassword(true)
      } else {
        await load(result.token)
      }
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Sign-in failed.')
    } finally {
      setWorking(false)
    }
  }

  async function decide(decision: 'approved' | 'changes_requested') {
    if (!selected || !token) return
    if (
      decision === 'changes_requested' &&
      !decisionNote.trim()
    ) {
      setError('Enter the corrections the lecturer must make.')
      return
    }
    const verb = decision === 'approved' ? 'approve' : 'return'
    if (!window.confirm(`Confirm that you want to ${verb} moderation V${selected.version_number}?`)) return
    setWorking(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(
        `/api/faculty-assistant/moderation/submissions/${selected.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ decision, note: decisionNote }),
        },
      )
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'The moderation decision was not saved.')
      setNotice(
        decision === 'approved'
          ? `V${selected.version_number} approved. Faculty Assistant can now verify its export receipt.`
          : `V${selected.version_number} returned to ${selected.lecturer_name} with corrections.`,
      )
      setDecisionNote('')
      await load(token)
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'The decision was not saved.')
    } finally {
      setWorking(false)
    }
  }

  function signOut() {
    localStorage.removeItem(tokenKey)
    setToken('')
    setOverview(null)
    setMustChangePassword(false)
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.')
      return
    }
    setWorking(true)
    setError('')
    try {
      const response = await fetch('/api/faculty-assistant/moderation/password', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          result.error === 'weak_moderator_password'
            ? 'Use at least 12 characters with uppercase, lowercase, and a number.'
            : 'The password could not be changed.',
        )
      }
      setMustChangePassword(false)
      setNewPassword('')
      setConfirmPassword('')
      await load(token)
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : 'The password could not be changed.')
    } finally {
      setWorking(false)
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-[#0c2d46] px-5 py-12 text-[#10233c]">
        <div className="mx-auto grid min-h-[78vh] max-w-5xl overflow-hidden rounded-[2rem] bg-[#f7f3e9] shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
          <section className="relative overflow-hidden bg-[#061a33] p-9 text-white md:p-14">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e9ae22]/20" />
            <div className="relative">
              <FacultyAssistantBrand variant="dark" className="mb-16 h-auto w-60" priority />
              <h1 className="mt-4 max-w-lg font-serif text-5xl font-bold leading-[.98]">Grade moderation, with a defensible trail.</h1>
              <p className="mt-6 max-w-md leading-7 text-slate-200">
                Review the exact frozen version submitted by a lecturer, return corrections, or issue the approval receipt used for final export.
              </p>
              <div className="mt-12 flex items-center gap-3 text-sm text-slate-200">
                <ShieldCheck className="text-[#f5c85b]" size={20} />
                Institution-isolated access and append-only decisions
              </div>
            </div>
          </section>
          <section className="flex items-center p-9 md:p-14">
            <form className="w-full" onSubmit={signIn}>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#b77900]">Moderation Desk</p>
              <h2 className="mt-3 font-serif text-4xl font-bold">Sign in to review.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use the moderator account created by your institution administrator.
              </p>
              {error && <AlertBox message={error} />}
              <label className="mt-8 block text-sm font-bold">
                Work email
                <input
                  className="mt-2 w-full rounded-xl border border-[#d8cfbd] bg-white px-4 py-3 outline-none focus:border-[#b77900]"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="mt-5 block text-sm font-bold">
                Password
                <input
                  className="mt-2 w-full rounded-xl border border-[#d8cfbd] bg-white px-4 py-3 outline-none focus:border-[#b77900]"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <button
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#123a55] px-5 py-3 font-bold text-white hover:bg-[#0c2d46] disabled:opacity-60"
                disabled={working}
              >
                <LogIn size={18} />
                {working ? 'Signing in...' : 'Open Moderation Desk'}
              </button>
            </form>
          </section>
        </div>
      </main>
    )
  }

  if (mustChangePassword) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0c2d46] px-5 py-12 text-[#10233c]">
        <form className="w-full max-w-lg rounded-[2rem] bg-[#f7f3e9] p-9 shadow-2xl md:p-12" onSubmit={changePassword}>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9ae22] text-[#102b43]">
            <ShieldCheck size={28} />
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#b77900]">First sign-in security</p>
          <h1 className="mt-3 font-serif text-4xl font-bold">Replace the temporary password.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use at least 12 characters with uppercase, lowercase, and a number. This password is only for your individual moderation account.
          </p>
          {error && <AlertBox message={error} />}
          <label className="mt-7 block text-sm font-bold">
            New password
            <input className="mt-2 w-full rounded-xl border border-[#d8cfbd] bg-white px-4 py-3" type="password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
          </label>
          <label className="mt-4 block text-sm font-bold">
            Confirm new password
            <input className="mt-2 w-full rounded-xl border border-[#d8cfbd] bg-white px-4 py-3" type="password" minLength={12} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </label>
          <div className="mt-7 flex gap-3">
            <button className="flex-1 rounded-xl bg-[#123a55] px-5 py-3 font-bold text-white disabled:opacity-60" disabled={working}>
              {working ? 'Securing account...' : 'Set password and continue'}
            </button>
            <button className="rounded-xl border border-[#d8cfbd] px-5 py-3 font-bold" type="button" onClick={signOut}>Sign out</button>
          </div>
        </form>
      </main>
    )
  }

  if (loading || !overview) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3efe5] text-[#123a55]">
        <RefreshCw className="animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f3efe5] text-[#10233c]">
      <header className="border-b border-white/10 bg-[#061a33] px-5 py-5 text-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FacultyAssistantBrand variant="symbol" className="h-11 w-12 object-contain" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f5c85b]">Faculty Assistant workspace</p>
              <h1 className="font-serif text-2xl font-bold">Moderation Desk</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm md:block">
              <strong className="block">{overview.moderator.name}</strong>
              <span className="text-slate-300">{overview.institution.name}</span>
            </div>
            <button className="rounded-xl border border-white/20 p-3 hover:bg-white/10" onClick={() => void load(token)} title="Refresh">
              <RefreshCw size={18} />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold hover:bg-white/10" onClick={signOut}>
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-7">
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <Metric icon={Clock3} label="Awaiting review" value={overview.submissions.filter((item) => item.status === 'submitted').length} />
          <Metric icon={BadgeCheck} label="Approved versions" value={overview.submissions.filter((item) => item.status === 'approved').length} />
          <Metric icon={Building2} label="Institution policy" value={overview.policy.mode} text />
        </section>
        {error && <AlertBox message={error} />}
        {notice && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 size={19} /> {notice}
          </div>
        )}

        <section className="grid min-h-[680px] overflow-hidden rounded-[1.6rem] border border-[#ded5c4] bg-white shadow-sm lg:grid-cols-[380px_1fr]">
          <aside className="border-r border-[#e5ddce] bg-[#fbf8f1]">
            <div className="border-b border-[#e5ddce] p-5">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-slate-400" size={17} />
                <input
                  className="w-full rounded-xl border border-[#d8cfbd] bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#b77900]"
                  placeholder="Course, lecturer, period..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <select
                className="mt-3 w-full rounded-xl border border-[#d8cfbd] bg-white px-3 py-3 text-sm font-bold outline-none"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="submitted">Awaiting review</option>
                <option value="approved">Approved</option>
                <option value="changes_requested">Changes requested</option>
                <option value="all">All submissions</option>
              </select>
            </div>
            <div className="max-h-[610px] overflow-y-auto">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  className={`w-full border-b border-[#e5ddce] p-5 text-left transition hover:bg-white ${selected?.id === item.id ? 'bg-white shadow-[inset_4px_0_0_#e9ae22]' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-sm text-[#123a55]">{item.course_code}</strong>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 font-serif text-lg font-bold leading-5">{item.course_title}</p>
                  <p className="mt-3 text-xs text-slate-500">{item.lecturer_name} · V{item.version_number}</p>
                </button>
              ))}
              {!filtered.length && <p className="p-8 text-center text-sm text-slate-500">No submissions match this view.</p>}
            </div>
          </aside>

          <article className="min-w-0 p-6 md:p-8">
            {selected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#e5ddce] pb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b77900]">Frozen moderation V{selected.version_number}</p>
                    <h2 className="mt-2 font-serif text-3xl font-bold">{selected.course_code} · {selected.course_title}</h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {selected.lecturer_name} · {selected.academic_period || 'Academic period not supplied'} · {selected.school_name || 'School not supplied'}
                    </p>
                  </div>
                  <StatusBadge status={selected.status} large />
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <Info label="Submitted" value={formatDate(selected.submitted_at)} />
                  <Info label="Policy" value={`${selected.snapshot.policy?.courseworkWeight ?? 50}/${selected.snapshot.policy?.examWeight ?? 50}`} />
                  <Info label="Integrity" value={selected.version_checksum.slice(0, 16)} mono />
                </div>

                <div className="mt-6 overflow-x-auto rounded-xl border border-[#ddd4c3]">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead className="bg-[#123a55] text-left text-white">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        {(selected.snapshot.components || []).map((component) => (
                          <th className="px-4 py-3" key={component.id}>
                            <span className="block whitespace-nowrap">{component.name}</span>
                            <small className="font-normal text-white/65">
                              {component.source === 'moodle' ? 'Moodle' : 'Offline'} / {component.maximum}
                            </small>
                          </th>
                        ))}
                        <th className="px-4 py-3">Coursework</th>
                        <th className="px-4 py-3">Exam</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Check</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.snapshot.results || []).map((result) => (
                        <tr key={result.studentId} className="border-t border-[#e5ddce] even:bg-[#fbf8f1]">
                          <td className="px-4 py-3">
                            <strong className="block">{result.name}</strong>
                            <span className="text-xs text-slate-500">{result.studentId}</span>
                          </td>
                          {(selected.snapshot.components || []).map((component) => (
                            <td className="px-4 py-3" key={component.id}>
                              {mark(result.componentMarks?.[component.id])}
                            </td>
                          ))}
                          <td className="px-4 py-3">{mark(result.coursework)}</td>
                          <td className="px-4 py-3">{mark(result.exam)}</td>
                          <td className="px-4 py-3 font-bold">{mark(result.total)}</td>
                          <td className="px-4 py-3 text-xs">{result.exception || 'Ready'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selected.decision_note && (
                  <div className="mt-5 rounded-xl border border-[#e5ddce] bg-[#fbf8f1] p-4">
                    <strong className="text-sm">Committee note</strong>
                    <p className="mt-1 text-sm text-slate-600">{selected.decision_note}</p>
                  </div>
                )}
                {selected.status === 'submitted' && (
                  <div className="mt-6 rounded-2xl bg-[#f3efe5] p-5">
                    <label className="block text-sm font-bold">
                      Moderation note
                      <textarea
                        className="mt-2 min-h-24 w-full rounded-xl border border-[#d8cfbd] bg-white p-3 font-normal outline-none focus:border-[#b77900]"
                        placeholder="Required when returning changes; optional for approval."
                        value={decisionNote}
                        onChange={(event) => setDecisionNote(event.target.value)}
                      />
                    </label>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        className="flex items-center gap-2 rounded-xl bg-[#176b50] px-5 py-3 font-bold text-white hover:bg-[#10543e] disabled:opacity-60"
                        disabled={working}
                        onClick={() => void decide('approved')}
                      >
                        <CheckCircle2 size={18} /> Approve frozen version
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        disabled={working}
                        onClick={() => void decide('changes_requested')}
                      >
                        <XCircle size={18} /> Request changes
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full min-h-[560px] flex-col items-center justify-center text-center">
                <BookOpenCheck className="text-[#b77900]" size={42} />
                <h2 className="mt-4 font-serif text-3xl font-bold">Select a submission.</h2>
                <p className="mt-2 max-w-md text-slate-500">The exact frozen results, components, calculation policy, and checksum will appear here.</p>
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  )
}

function Metric({ icon: Icon, label, value, text = false }: { icon: typeof Clock3; label: string; value: number | string; text?: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#ded5c4] bg-white p-5">
      <div className="rounded-xl bg-[#f7e8ba] p-3 text-[#9a6500]"><Icon size={22} /></div>
      <div><span className="block text-xs font-bold uppercase tracking-[.12em] text-slate-500">{label}</span><strong className={`${text ? 'capitalize' : 'text-2xl'} mt-1 block font-serif`}>{value}</strong></div>
    </div>
  )
}

function AlertBox({ message }: { message: string }) {
  return <div className="my-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle size={19} /> {message}</div>
}

function StatusBadge({ status, large = false }: { status: Submission['status']; large?: boolean }) {
  const labels: Record<Submission['status'], string> = {
    submitted: 'Awaiting review',
    approved: 'Approved',
    changes_requested: 'Changes requested',
    superseded: 'Superseded',
    withdrawn: 'Withdrawn',
  }
  const styles: Record<Submission['status'], string> = {
    submitted: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    changes_requested: 'bg-red-100 text-red-800',
    superseded: 'bg-slate-100 text-slate-600',
    withdrawn: 'bg-slate-100 text-slate-600',
  }
  return <span className={`whitespace-nowrap rounded-full font-bold ${large ? 'px-4 py-2 text-sm' : 'px-2.5 py-1 text-[10px]'} ${styles[status]}`}>{labels[status]}</span>
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="rounded-xl bg-[#fbf8f1] p-4"><span className="block text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">{label}</span><strong className={`mt-1 block ${mono ? 'font-mono text-xs' : ''}`}>{value}</strong></div>
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : value
}

function mark(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : String(value)
}

function loginError(value: string) {
  const messages: Record<string, string> = {
    invalid_moderator_credentials: 'The email or password is incorrect.',
    moderator_assignment_inactive: 'This account has no active moderation assignment.',
    institution_licence_inactive: 'The institution licence is not active.',
    institution_selection_required: 'This account belongs to several institutions. Institution selection will be enabled by your administrator.',
  }
  return messages[value] || 'Moderator sign-in failed.'
}

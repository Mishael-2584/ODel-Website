'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UsersRound,
  XCircle,
} from 'lucide-react'
import {
  facultyAssistantBillingLabel,
  facultyAssistantPricing,
  isFacultyAssistantBillingPeriod,
  type FacultyAssistantBillingPeriod,
} from '@/lib/faculty-assistant/plans'
import { FacultyAssistantBrand } from '@/components/faculty-assistant/FacultyAssistantBrand'

type DeskTab = 'overview' | 'requests' | 'licences' | 'institutions' | 'activity' | 'audit'

type UpgradeRequest = {
  id: string
  moodle_instance: string
  moodle_user_id: number
  email: string
  display_name: string
  requested_plan: 'professional' | 'institution'
  phone: string
  notes: string
  source: string
  status: 'pending' | 'contacted' | 'paid' | 'activated' | 'declined'
  billing_period?: FacultyAssistantBillingPeriod | null
  payment_reference?: string
  admin_notes?: string
  invoice_status?: 'not_sent' | 'sent' | 'failed'
  invoice_sent_at?: string | null
  invoice_error?: string
  created_at: string
  updated_at: string
}

type Entitlement = {
  id: string
  moodle_instance: string
  moodle_user_id: number
  email: string
  plan: string
  features: string[]
  is_active: boolean
  expires_at?: string | null
  billing_period?: string | null
  created_at: string
  updated_at: string
}

type InstitutionLicence = {
  id: string
  moodle_instance: string
  institution_name: string
  email_domains: string[]
  features: string[]
  is_active: boolean
  expires_at: string
  billing_period: 'semester' | 'annual'
  created_at: string
  updated_at: string
}

type PublishJob = {
  id: string
  moodle_user_id: number
  course_id: number
  category_id: number
  status: 'processing' | 'succeeded' | 'failed'
  result?: { imported?: number; questionIds?: number[]; questionids?: number[] } | null
  error?: string | null
  created_at: string
}

type AuditEntry = {
  id: string
  moodle_user_id?: number | null
  moodle_instance?: string | null
  action: string
  resource_type?: string | null
  resource_id?: string | null
  outcome: string
  details?: Record<string, unknown> | null
  created_at: string
}

type OverviewResponse = {
  admin: { id: string; email: string; name: string; role: string }
  requests: UpgradeRequest[]
  entitlements: Entitlement[]
  institutions: InstitutionLicence[]
  publishJobs: PublishJob[]
  audit: AuditEntry[]
}

const tabs: Array<{ id: DeskTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'requests', label: 'Upgrade requests', icon: CreditCard },
  { id: 'licences', label: 'Licences', icon: KeyRound },
  { id: 'institutions', label: 'Institution coverage', icon: Building2 },
  { id: 'activity', label: 'Moodle activity', icon: Activity },
  { id: 'audit', label: 'Audit trail', icon: ScrollText },
]

export default function FacultyAssistantAdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<DeskTab>('overview')
  const [data, setData] = useState<OverviewResponse | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [workingId, setWorkingId] = useState('')

  const load = useCallback(async () => {
    const token = localStorage.getItem('admin_token')
    const storedAdmin = localStorage.getItem('admin_user')
    if (!token || !storedAdmin) {
      router.replace('/admin/login?returnTo=%2Ffaculty-assistant%2Fadmin')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/faculty-assistant/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json().catch(() => ({}))
      if (response.status === 401) {
        router.replace('/admin/login?returnTo=%2Ffaculty-assistant%2Fadmin')
        return
      }
      if (!response.ok) throw new Error(result.error || 'The Licence Desk could not be loaded.')
      setData(result)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The Licence Desk could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const normalizedQuery = query.trim().toLowerCase()
  const requests = useMemo(
    () =>
      (data?.requests || []).filter((item) =>
        !normalizedQuery ||
        [item.email, item.display_name, item.phone, item.requested_plan, item.status, item.moodle_user_id]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    [data?.requests, normalizedQuery],
  )
  const entitlements = useMemo(
    () =>
      (data?.entitlements || []).filter((item) =>
        !normalizedQuery ||
        [item.email, item.plan, item.moodle_user_id, item.moodle_instance]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    [data?.entitlements, normalizedQuery],
  )

  async function updateRequest(
    requestId: string,
    payload: Record<string, unknown>,
  ) {
    if (payload.action === 'close') {
      const reason = String(payload.adminNotes || '').trim()
      if (!window.confirm(
        'Close this open request and allow the lecturer to start a fresh upgrade? '
        + 'The request and payment history will remain in the audit trail.',
      )) return
      payload = {
        ...payload,
        adminNotes: reason || 'Closed by the Licence Desk to allow a fresh upgrade request.',
      }
    }
    await mutate(`/api/faculty-assistant/admin/requests/${requestId}`, payload)
  }

  async function updateEntitlement(
    entitlementId: string,
    action: 'revoke' | 'restore' | 'extend',
  ) {
    const label = action === 'revoke' ? 'revoke this licence' : `${action} this licence`
    if (!window.confirm(`Are you sure you want to ${label}?`)) return
    await mutate(`/api/faculty-assistant/admin/entitlements/${entitlementId}`, { action })
  }

  async function grantProfessional(email: string) {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    setWorkingId('grant-professional')
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/faculty-assistant/admin/entitlements', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        const messages: Record<string, string> = {
          invalid_licence_email: 'Enter a valid Moodle account email address.',
          moodle_user_not_found: 'No active Moodle account matches that email address.',
          moodle_email_mismatch: 'Moodle returned a different email address. The licence was not granted.',
          institution_licence_managed: 'This lecturer is covered by an Institution licence. Manage that agreement instead.',
        }
        throw new Error(messages[result.error] || result.error || 'The Professional licence could not be granted.')
      }
      const expiry = result.entitlement?.expires_at
        ? new Date(result.entitlement.expires_at).toLocaleDateString()
        : 'one year from today'
      setNotice(
        `Professional activated for ${result.moodleUser?.fullname || email} (${result.moodleUser?.email || email}) through ${expiry}.`,
      )
      await load()
    } catch (grantError) {
      setError(grantError instanceof Error ? grantError.message : 'The Professional licence could not be granted.')
    } finally {
      setWorkingId('')
    }
  }

  async function updateInstitution(
    institutionId: string,
    action: 'revoke' | 'restore' | 'extend',
  ) {
    if (!window.confirm(`Are you sure you want to ${action} this institution agreement?`)) return
    await mutate(`/api/faculty-assistant/admin/institutions/${institutionId}`, { action })
  }

  async function mutate(path: string, payload: Record<string, unknown>) {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    setWorkingId(path)
    setError('')
    setNotice('')
    try {
      const response = await fetch(path, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        const messages: Record<string, string> = {
          request_cannot_be_closed: 'This request is paid, activated, or still pending at the payment provider. Reconcile its payment status before closing it.',
          request_close_failed: 'The request could not be closed safely. No local request or payment state was changed.',
        }
        throw new Error(messages[result.error] || result.error || 'The licence action failed.')
      }
      if (result.closedForRetry) {
        setNotice('The unpaid request was closed. Its audit history was retained, and the lecturer can now start a fresh upgrade request.')
      }
      await load()
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'The licence action failed.')
    } finally {
      setWorkingId('')
    }
  }

  if (loading && !data) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3efe3] text-[#09264a]">
        <div className="text-center"><LoaderCircle className="mx-auto animate-spin" /><p className="mt-3 text-sm font-bold">Opening the Licence Desk...</p></div>
      </main>
    )
  }

  const pending = data?.requests.filter((item) => ['pending', 'contacted', 'paid'].includes(item.status)).length || 0
  const active = data?.entitlements.filter((item) => item.is_active && (!item.expires_at || new Date(item.expires_at) > new Date())).length || 0
  const institutions = data?.institutions.filter((item) => item.is_active && new Date(item.expires_at) > new Date()).length || 0
  const published = data?.publishJobs.filter((item) => item.status === 'succeeded').reduce((total, item) => total + Number(item.result?.imported || 0), 0) || 0

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_82%_0%,rgba(219,164,58,.19),transparent_30rem),linear-gradient(180deg,#f7f3e8,#eef2ec)] text-[#172822]">
      <header className="border-b border-[#d8d0bd] bg-[#061a33] text-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-5 lg:px-8">
          <div className="flex items-center gap-4">
            <FacultyAssistantBrand variant="symbol" className="h-11 w-12 object-contain" />
            <div><p className="text-[10px] font-black uppercase tracking-[.22em] text-[#f1ca76]">Faculty Assistant operations</p><h1 className="font-serif text-2xl font-bold">Licence Desk</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><strong className="block text-sm">{data?.admin.name}</strong><span className="text-xs text-white/60">{data?.admin.email}</span></div>
            <button onClick={() => router.push('/faculty-assistant/admin/moderation')} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold hover:bg-white/10">Moderation controls</button>
            <button onClick={() => router.push('/admin/dashboard')} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold hover:bg-white/10">Content admin</button>
            <button onClick={() => { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); router.push('/admin/login') }} className="grid h-9 w-9 place-items-center rounded-lg border border-white/20 hover:bg-white/10" title="Sign out"><LogOut size={16} /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-6 lg:grid-cols-[230px_1fr] lg:px-8">
        <aside className="h-fit rounded-[1.35rem] border border-[#d8d0bd] bg-white/75 p-3 shadow-[0_16px_45px_rgba(38,50,44,.07)] backdrop-blur lg:sticky lg:top-6">
          <nav className="grid gap-1">
            {tabs.map((item) => {
              const Icon = item.icon
              return <button key={item.id} onClick={() => setTab(item.id)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold ${tab === item.id ? 'bg-[#12352d] text-white' : 'text-[#5e675f] hover:bg-[#eee8d9]'}`}><Icon size={17} />{item.label}{item.id === 'requests' && pending > 0 && <span className="ml-auto rounded-full bg-[#e4ad3c] px-2 py-0.5 text-[10px] text-[#12352d]">{pending}</span>}</button>
            })}
          </nav>
          <div className="mt-4 rounded-xl bg-[#f3ead2] p-4"><Sparkles className="text-[#a86f0c]" size={18} /><strong className="mt-3 block font-serif">Commercial control</strong><p className="mt-1 text-xs leading-5 text-[#70634d]">Payment decisions and licences stay separate from website content management.</p></div>
        </aside>

        <main className="min-w-0">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ad770e]">Faculty Assistant operations</p><h2 className="mt-1 font-serif text-4xl font-bold text-[#12352d]">{tabs.find((item) => item.id === tab)?.label}</h2></div>
            <div className="flex gap-2"><label className="flex min-w-[260px] items-center gap-2 rounded-xl border border-[#d8d0bd] bg-white px-3 py-2"><Search size={16} className="text-[#788179]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Lecturer, email or Moodle ID" className="w-full bg-transparent text-sm outline-none" /></label><button onClick={() => void load()} className="grid h-10 w-10 place-items-center rounded-xl border border-[#d8d0bd] bg-white text-[#12352d]" title="Refresh"><RefreshCw size={16} /></button></div>
          </div>

          {error && <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><XCircle size={19} />{error}</div>}
          {notice && <div className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={19} />{notice}</div>}

          {tab === 'overview' && (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric label="Open requests" value={pending} icon={Clock3} tone="gold" />
                <Metric label="Active licences" value={active} icon={BadgeCheck} tone="green" />
                <Metric label="Institutions" value={institutions} icon={UsersRound} tone="navy" />
                <Metric label="Questions published" value={published} icon={Activity} tone="rust" />
              </section>
              <section className="mt-6 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
                <div className="rounded-[1.4rem] border border-[#d8d0bd] bg-white p-5"><SectionTitle eyebrow="Needs action" title="Latest upgrade requests" /><div className="mt-4 grid gap-3">{(data?.requests || []).filter((item) => ['pending', 'contacted', 'paid'].includes(item.status)).slice(0, 5).map((item) => <RequestSummary key={item.id} item={item} onOpen={() => setTab('requests')} />)}{pending === 0 && <Empty text="No upgrade requests are waiting." />}</div></div>
                <div className="rounded-[1.4rem] bg-[#12352d] p-6 text-white"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#f1ca76]">Current offer</p><h3 className="mt-3 font-serif text-3xl font-bold">Professional is the conversion engine.</h3><p className="mt-3 text-sm leading-6 text-white/70">Essential builds trust for free. Professional is {facultyAssistantPricing.professional.monthlyPrice} or {facultyAssistantPricing.professional.annualPrice}; international pricing is {facultyAssistantPricing.professional.internationalPrice}. Institution coverage is {facultyAssistantPricing.institution.semesterPrice} or {facultyAssistantPricing.institution.annualPrice}; international pricing is {facultyAssistantPricing.institution.internationalPrice}. KES remains the primary price book.</p><button onClick={() => window.open('/faculty-assistant/plans', '_blank')} className="mt-6 flex items-center gap-2 rounded-xl bg-[#e4ad3c] px-4 py-3 text-sm font-black text-[#12352d]">Open public pricing <ArrowUpRight size={16} /></button></div>
              </section>
            </>
          )}

          {tab === 'requests' && <RequestDesk requests={requests} workingId={workingId} onUpdate={updateRequest} />}
          {tab === 'licences' && <LicenceDesk entitlements={entitlements} workingId={workingId} onGrant={grantProfessional} onUpdate={updateEntitlement} />}
          {tab === 'institutions' && <InstitutionDesk institutions={data?.institutions || []} entitlements={data?.entitlements || []} workingId={workingId} onUpdate={updateInstitution} />}
          {tab === 'activity' && <ActivityDesk jobs={data?.publishJobs || []} />}
          {tab === 'audit' && <AuditDesk entries={data?.audit || []} />}
        </main>
      </div>
    </div>
  )
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Activity; tone: 'gold' | 'green' | 'navy' | 'rust' }) {
  const colors = { gold: 'bg-[#f3ead2] text-[#a86f0c]', green: 'bg-[#e3f1e9] text-[#1d7355]', navy: 'bg-[#e3ebf3] text-[#174b72]', rust: 'bg-[#f5e6df] text-[#a54c2d]' }
  return <article className="rounded-[1.35rem] border border-[#d8d0bd] bg-white p-5 shadow-[0_14px_35px_rgba(38,50,44,.06)]"><div className={`grid h-10 w-10 place-items-center rounded-xl ${colors[tone]}`}><Icon size={19} /></div><strong className="mt-5 block font-serif text-4xl text-[#12352d]">{value}</strong><span className="text-xs font-bold text-[#727a72]">{label}</span></article>
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><span className="text-[9px] font-black uppercase tracking-[.18em] text-[#ad770e]">{eyebrow}</span><h3 className="font-serif text-2xl font-bold text-[#12352d]">{title}</h3></div>
}

function RequestSummary({ item, onOpen }: { item: UpgradeRequest; onOpen: () => void }) {
  return <button onClick={onOpen} className="flex items-center gap-3 rounded-xl border border-[#e2dccd] p-3 text-left hover:bg-[#faf7ef]"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f3ead2] font-serif font-bold text-[#8b630f]">{item.display_name?.[0] || item.email[0]}</div><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{item.display_name || item.email}</strong><span className="text-xs text-[#7b817b]">{humanPlan(item.requested_plan)} · {timeAgo(item.created_at)}</span></div><Status status={item.status} /></button>
}

function RequestDesk({ requests, workingId, onUpdate }: { requests: UpgradeRequest[]; workingId: string; onUpdate: (id: string, payload: Record<string, unknown>) => Promise<void> }) {
  if (requests.length === 0) return <Empty text="No upgrade requests match this search." />
  return <section className="grid gap-4">{requests.map((item) => <RequestCard key={item.id} item={item} busy={workingId.includes(item.id)} onUpdate={onUpdate} />)}</section>
}

function RequestCard({ item, busy, onUpdate }: { item: UpgradeRequest; busy: boolean; onUpdate: (id: string, payload: Record<string, unknown>) => Promise<void> }) {
  const initialBillingPeriod: FacultyAssistantBillingPeriod =
    item.billing_period && isFacultyAssistantBillingPeriod(item.requested_plan, item.billing_period)
      ? item.billing_period
      : 'annual'
  const [billingPeriod, setBillingPeriod] = useState<FacultyAssistantBillingPeriod>(initialBillingPeriod)
  const [paymentReference, setPaymentReference] = useState(item.payment_reference || '')
  const [adminNotes, setAdminNotes] = useState(item.admin_notes || '')
  const [institutionName, setInstitutionName] = useState('')
  const [institutionDomains, setInstitutionDomains] = useState('')
  const isInstitution = item.requested_plan === 'institution'
  const isOpen = ['pending', 'contacted', 'paid'].includes(item.status)
  const institutionReady = !isInstitution || (institutionName.trim() && institutionDomains.trim())

  return <article className="rounded-[1.4rem] border border-[#d8d0bd] bg-white p-5 shadow-[0_12px_35px_rgba(38,50,44,.05)]">
    <div className="flex flex-col justify-between gap-4 lg:flex-row">
      <div><div className="flex flex-wrap items-center gap-2"><Status status={item.status} /><span className="text-xs font-bold uppercase tracking-[.1em] text-[#ad770e]">{humanPlan(item.requested_plan)}</span><span className="rounded-full bg-[#f3ead2] px-2 py-1 text-[9px] font-black uppercase text-[#805b10]">{humanPlan(item.billing_period || 'annual')}</span><span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${item.invoice_status === 'sent' ? 'bg-emerald-100 text-emerald-800' : item.invoice_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>Invoice {item.invoice_status || 'not sent'}</span></div><h3 className="mt-3 font-serif text-2xl font-bold text-[#12352d]">{item.display_name || item.email}</h3><p className="mt-1 text-sm text-[#697269]">{item.email} / Moodle #{item.moodle_user_id} / {item.phone || 'No phone supplied'}</p><p className="mt-3 max-w-3xl text-sm leading-6 text-[#565f57]">{item.notes || 'No lecturer notes.'}</p>{item.invoice_error && <p className="mt-2 text-xs font-bold text-red-700">Invoice error: {item.invoice_error}</p>}</div>
      <div className="text-left text-xs text-[#788078] lg:text-right"><strong className="block text-[#39443d]">Requested {new Date(item.created_at).toLocaleDateString()}</strong><span>{item.moodle_instance}</span></div>
    </div>
    {isOpen && <div className="mt-5 grid gap-3 border-t border-[#ebe5d8] pt-5 lg:grid-cols-2 xl:grid-cols-[160px_1fr_1fr_1.2fr_auto]">
      <label className="grid gap-1 text-[10px] font-black uppercase tracking-[.08em] text-[#687169]">Billing<select value={billingPeriod} onChange={(event) => setBillingPeriod(event.target.value as FacultyAssistantBillingPeriod)} className="rounded-lg border border-[#d8d0bd] bg-white px-3 py-2 text-sm font-bold normal-case tracking-normal"><option value="annual">{facultyAssistantBillingLabel(item.requested_plan, 'annual')}</option>{isInstitution ? <option value="semester">{facultyAssistantBillingLabel('institution', 'semester')}</option> : <option value="monthly">{facultyAssistantBillingLabel('professional', 'monthly')}</option>}</select></label>
      <label className="grid gap-1 text-[10px] font-black uppercase tracking-[.08em] text-[#687169]">Payment reference<input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} placeholder="M-Pesa, receipt or invoice" className="rounded-lg border border-[#d8d0bd] px-3 py-2 text-sm font-medium normal-case tracking-normal" /></label>
      <label className="grid gap-1 text-[10px] font-black uppercase tracking-[.08em] text-[#687169]">{isInstitution ? 'Institution name' : 'Internal note'}<input value={isInstitution ? institutionName : adminNotes} onChange={(event) => isInstitution ? setInstitutionName(event.target.value) : setAdminNotes(event.target.value)} placeholder={isInstitution ? 'University or department' : 'Not visible to lecturer'} className="rounded-lg border border-[#d8d0bd] px-3 py-2 text-sm font-medium normal-case tracking-normal" /></label>
      {isInstitution && <label className="grid gap-1 text-[10px] font-black uppercase tracking-[.08em] text-[#687169]">Approved email domains<input value={institutionDomains} onChange={(event) => setInstitutionDomains(event.target.value)} placeholder="ueab.ac.ke, another.edu" className="rounded-lg border border-[#d8d0bd] px-3 py-2 text-sm font-medium normal-case tracking-normal" /></label>}
      <div className="flex flex-wrap items-end gap-2"><button disabled={busy} onClick={() => void onUpdate(item.id, { action: 'resend_invoice' })} className="rounded-lg border border-[#d8d0bd] px-3 py-2 text-xs font-bold">{isInstitution ? 'Resend acknowledgement' : 'Resend invoice'}</button><button disabled={busy} onClick={() => void onUpdate(item.id, { action: 'contacted', adminNotes })} className="rounded-lg border border-[#d8d0bd] px-3 py-2 text-xs font-bold">Contacted</button><button disabled={busy} title="Keeps the audit history but allows a fresh request" onClick={() => void onUpdate(item.id, { action: 'close', adminNotes })} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">Close and allow new request</button><button disabled={busy || !institutionReady} onClick={() => { if (window.confirm(`Activate ${humanPlan(item.requested_plan)} for ${item.email}?`)) void onUpdate(item.id, { action: 'activate', billingPeriod, paymentReference, adminNotes, institutionName, institutionDomains }) }} className="flex items-center gap-2 rounded-lg bg-[#12352d] px-4 py-2 text-xs font-black text-white">{busy ? <LoaderCircle className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}Activate</button></div>
    </div>}
  </article>
}

function InstitutionDesk({ institutions, entitlements, workingId, onUpdate }: { institutions: InstitutionLicence[]; entitlements: Entitlement[]; workingId: string; onUpdate: (id: string, action: 'revoke' | 'restore' | 'extend') => Promise<void> }) {
  if (institutions.length === 0) return <Empty text="No institution agreements are active yet." />
  return <section className="grid gap-4">{institutions.map((item) => { const active = item.is_active && new Date(item.expires_at) > new Date(); const seats = entitlements.filter((entitlement) => entitlement.plan === 'institution' && entitlement.moodle_instance === item.moodle_instance).length; return <article key={item.id} className="rounded-[1.4rem] border border-[#d8d0bd] bg-white p-5"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><Status status={active ? 'active' : item.is_active ? 'expired' : 'revoked'} /><span className="text-xs font-bold text-[#ad770e]">{seats} provisioned faculty seat{seats === 1 ? '' : 's'} / {humanPlan(item.billing_period || 'annual')}</span></div><h3 className="mt-3 font-serif text-2xl font-bold text-[#12352d]">{item.institution_name}</h3><p className="mt-1 text-sm text-[#697269]">{item.moodle_instance} / {item.email_domains.join(', ') || 'no approved domains'} / renews {new Date(item.expires_at).toLocaleDateString()}</p></div><div className="flex gap-2"><button disabled={Boolean(workingId)} onClick={() => void onUpdate(item.id, 'extend')} className="rounded-lg border border-[#d8d0bd] px-3 py-2 text-xs font-bold">Extend {item.billing_period === 'semester' ? '6 months' : '1 year'}</button><button disabled={Boolean(workingId)} onClick={() => void onUpdate(item.id, item.is_active ? 'revoke' : 'restore')} className={`rounded-lg px-3 py-2 text-xs font-bold ${item.is_active ? 'border border-red-200 text-red-700' : 'bg-[#12352d] text-white'}`}>{item.is_active ? 'Revoke coverage' : 'Restore coverage'}</button></div></div></article> })}</section>
}

function LicenceDesk({ entitlements, workingId, onGrant, onUpdate }: { entitlements: Entitlement[]; workingId: string; onGrant: (email: string) => Promise<void>; onUpdate: (id: string, action: 'revoke' | 'restore' | 'extend') => Promise<void> }) {
  const [email, setEmail] = useState('')
  const granting = workingId === 'grant-professional'
  return <section className="grid gap-5">
    <form onSubmit={(event) => { event.preventDefault(); if (email.trim()) void onGrant(email.trim()) }} className="grid gap-5 rounded-[1.4rem] border border-[#d8d0bd] bg-[linear-gradient(135deg,#12352d,#1e5043)] p-5 text-white lg:grid-cols-[1fr_minmax(300px,.8fr)] lg:items-end">
      <div><div className="flex items-center gap-2 text-[#f1ca76]"><UserPlus size={18} /><span className="text-[10px] font-black uppercase tracking-[.18em]">Direct annual grant</span></div><h3 className="mt-3 font-serif text-2xl font-bold">Activate Professional by Moodle email.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">The server verifies the exact active Moodle account before granting one year of Professional access. Every grant is audited. Existing Institution seats cannot be overwritten here.</p></div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><label className="grid gap-1 text-[10px] font-black uppercase tracking-[.1em] text-white/70">Lecturer Moodle email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="lecturer@university.ac.ke" className="rounded-xl border border-white/20 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#172822] outline-none focus:ring-2 focus:ring-[#e4ad3c]" /></label><button disabled={granting || !email.trim()} className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#e4ad3c] px-5 py-3 text-sm font-black text-[#12352d] disabled:opacity-50">{granting ? <LoaderCircle className="animate-spin" size={17} /> : <UserPlus size={17} />}Grant 1 year</button></div>
    </form>
    {entitlements.length === 0
      ? <Empty text="No licences match this search." />
      : <div className="overflow-hidden rounded-[1.4rem] border border-[#d8d0bd] bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#12352d] text-[10px] uppercase tracking-[.1em] text-white/70"><tr><th className="px-5 py-4">Lecturer</th><th>Plan</th><th>Features</th><th>Expires</th><th>Status</th><th className="px-5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#ece6da]">{entitlements.map((item) => { const active = item.is_active && (!item.expires_at || new Date(item.expires_at) > new Date()); return <tr key={item.id}><td className="px-5 py-4"><strong className="block text-[#26342d]">{item.email}</strong><span className="text-xs text-[#7b827c]">Moodle #{item.moodle_user_id}</span></td><td><span className="font-serif text-lg font-bold text-[#12352d]">{humanPlan(item.plan)}</span><small className="block text-[#7b827c]">{item.billing_period || 'manual'}</small></td><td className="max-w-[260px] text-xs text-[#677069]">{item.features.join(', ')}</td><td>{item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'No expiry'}</td><td><Status status={active ? 'active' : item.is_active ? 'expired' : 'revoked'} /></td><td className="px-5"><div className="flex justify-end gap-2"><button disabled={Boolean(workingId)} onClick={() => void onUpdate(item.id, 'extend')} className="rounded-lg border border-[#d8d0bd] px-3 py-2 text-xs font-bold">Extend term</button><button disabled={Boolean(workingId)} onClick={() => void onUpdate(item.id, item.is_active ? 'revoke' : 'restore')} className={`rounded-lg px-3 py-2 text-xs font-bold ${item.is_active ? 'border border-red-200 text-red-700' : 'bg-[#12352d] text-white'}`}>{item.is_active ? 'Remove Pro access' : 'Restore Pro access'}</button></div></td></tr> })}</tbody></table></div></div>}
  </section>
}

function ActivityDesk({ jobs }: { jobs: PublishJob[] }) {
  if (jobs.length === 0) return <Empty text="No Moodle publishing activity has been recorded." />
  return <section className="grid gap-3">{jobs.map((job) => <article key={job.id} className="flex flex-col justify-between gap-4 rounded-xl border border-[#d8d0bd] bg-white p-4 md:flex-row md:items-center"><div className="flex items-center gap-3"><div className={`grid h-10 w-10 place-items-center rounded-full ${job.status === 'succeeded' ? 'bg-[#e3f1e9] text-[#1d7355]' : job.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-[#f3ead2] text-[#a86f0c]'}`}>{job.status === 'succeeded' ? <CheckCircle2 size={18} /> : job.status === 'failed' ? <XCircle size={18} /> : <Clock3 size={18} />}</div><div><strong className="block text-sm">Course #{job.course_id} · Category #{job.category_id}</strong><span className="text-xs text-[#737b74]">Moodle user #{job.moodle_user_id} · {new Date(job.created_at).toLocaleString()}</span></div></div><div className="md:text-right"><Status status={job.status} /><small className="mt-1 block max-w-md text-xs text-[#737b74]">{job.status === 'succeeded' ? `${job.result?.imported || 0} questions imported` : job.error || 'Processing request'}</small></div></article>)}</section>
}

function AuditDesk({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) return <Empty text="No Faculty Assistant audit events have been recorded." />
  return <section className="overflow-hidden rounded-[1.4rem] border border-[#d8d0bd] bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#12352d] text-[10px] uppercase tracking-[.1em] text-white/70"><tr><th className="px-5 py-4">When</th><th>Action</th><th>Resource</th><th>Moodle identity</th><th>Outcome</th><th className="px-5">Details</th></tr></thead><tbody className="divide-y divide-[#ece6da]">{entries.map((entry) => <tr key={entry.id}><td className="px-5 py-4 whitespace-nowrap text-xs text-[#687169]">{new Date(entry.created_at).toLocaleString()}</td><td><strong className="text-[#26342d]">{entry.action}</strong></td><td className="text-xs text-[#687169]">{entry.resource_type || 'event'}{entry.resource_id ? ` / ${entry.resource_id}` : ''}</td><td className="text-xs text-[#687169]">{entry.moodle_user_id ? `#${entry.moodle_user_id}` : 'System'}<small className="block max-w-[180px] truncate">{entry.moodle_instance || ''}</small></td><td><Status status={entry.outcome} /></td><td className="px-5 text-xs text-[#687169]"><span className="block max-w-[320px] truncate" title={JSON.stringify(entry.details || {})}>{auditSummary(entry.details)}</span></td></tr>)}</tbody></table></div></section>
}

function Status({ status }: { status: string }) {
  const styles: Record<string, string> = { pending: 'bg-amber-100 text-amber-800', contacted: 'bg-blue-100 text-blue-800', paid: 'bg-cyan-100 text-cyan-800', activated: 'bg-emerald-100 text-emerald-800', active: 'bg-emerald-100 text-emerald-800', success: 'bg-emerald-100 text-emerald-800', succeeded: 'bg-emerald-100 text-emerald-800', processing: 'bg-amber-100 text-amber-800', declined: 'bg-red-100 text-red-800', failed: 'bg-red-100 text-red-800', error: 'bg-red-100 text-red-800', revoked: 'bg-slate-200 text-slate-700', expired: 'bg-orange-100 text-orange-800' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] ${styles[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[1.4rem] border border-dashed border-[#cfc6b4] bg-white/55 p-12 text-center"><Banknote className="mx-auto text-[#b99a58]" /><strong className="mt-4 block font-serif text-xl text-[#12352d]">{text}</strong></div>
}

function humanPlan(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : 'Unknown'
}

function auditSummary(details?: Record<string, unknown> | null) {
  if (!details || Object.keys(details).length === 0) return 'No additional details'
  return Object.entries(details)
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
    .join(' / ')
}

function timeAgo(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

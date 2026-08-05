import type { Metadata } from 'next'
import Link from 'next/link'
import { FaBuilding, FaCheck, FaGraduationCap, FaLaptop } from 'react-icons/fa'
import { facultyAssistantContact } from '@/lib/faculty-assistant/contact'
import { facultyAssistantPlanCards } from '@/lib/faculty-assistant/plans'
import UpgradeRequestForm from './UpgradeRequestForm'
import { FacultyAssistantBrand } from '@/components/faculty-assistant/FacultyAssistantBrand'

export const metadata: Metadata = {
  title: 'Faculty Assistant Plans',
  description: 'Choose a Faculty Assistant licence for lecturer productivity and secure Moodle integration.',
}

const planIcons = {
  essential: FaLaptop,
  professional: FaGraduationCap,
  institution: FaBuilding,
}

export default function FacultyAssistantPlansPage({
  searchParams,
}: {
  searchParams: { plan?: string }
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(212,155,36,0.2),transparent_28rem),linear-gradient(180deg,#f7f3e8,#eef2ee)] px-5 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <FacultyAssistantBrand className="h-auto w-56" priority />
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.24em] text-amber-700">Faculty Assistant licensing</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-[#09264a] md:text-6xl">Give every lecturer the useful tools. Charge for the hours automation gives back.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">Essential stays genuinely useful for free. Professional removes the repetitive Moodle, assessment and grading work. Institution covers every faculty member under one supported agreement.</p>
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950"><strong>Lecturer beta:</strong> Grade Studio, Assessment Studio, Moodle Connection and licensing are in pilot validation. AI Assistant and Course Outline Designer will follow after the beta.</div>
        </header>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {facultyAssistantPlanCards.map((plan) => {
            const Icon = planIcons[plan.id]
            return (
              <article key={plan.name} className={`relative rounded-[1.5rem] border p-6 ${plan.featured ? 'border-amber-400 bg-[#0b294f] text-white shadow-2xl' : 'border-slate-200 bg-white/90'}`}>
                {plan.featured && <span className="absolute right-5 top-5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-[#09264a]">Best value</span>}
                <Icon className={`text-2xl ${plan.featured ? 'text-amber-300' : 'text-amber-700'}`} />
                <h2 className="mt-5 text-2xl font-bold">{plan.name}</h2>
                <p className={`mt-1 text-sm ${plan.featured ? 'text-blue-100' : 'text-slate-500'}`}>{plan.note}</p>
                <p className="mt-5 text-xl font-bold">{plan.price}</p>
                <p className={`mt-1 text-sm font-semibold ${plan.featured ? 'text-amber-200' : 'text-amber-800'}`}>{plan.secondaryPrice}</p>
                {plan.internationalPrice && <p className={`mt-2 text-xs font-bold ${plan.featured ? 'text-blue-100' : 'text-emerald-800'}`}>{plan.internationalPrice}</p>}
                <div className="mt-5 space-y-3">
                  {plan.features.map((feature) => <p key={feature} className="flex gap-3 text-sm leading-6"><FaCheck className="mt-1 flex-none text-emerald-500" /> {feature}</p>)}
                </div>
                <a href={plan.name === 'Essential' ? '#download' : `#activate`} className={`mt-6 block rounded-xl px-4 py-3 text-center text-sm font-bold ${plan.featured ? 'bg-amber-400 text-[#09264a]' : 'bg-[#0b294f] text-white'}`}>{plan.name === 'Essential' ? 'Start with Essential' : plan.name === 'Professional' ? 'Choose Professional' : 'Request institution coverage'}</a>
              </article>
            )
          })}
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 md:flex md:items-center md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Covered by your institution?</p><h2 className="mt-1 text-2xl font-bold">Your seat is already paid for.</h2><p className="mt-2 text-sm leading-6 text-emerald-800">If your university or department has an Institution licence, sign in with the approved institutional account. You should not pay personally; your administrator assigns the covered seat.</p></div>
          <Link href="/login?returnTo=%2Ffaculty-assistant%2Fplans" className="mt-4 inline-block whitespace-nowrap rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white md:ml-6 md:mt-0">Check institution access</Link>
        </section>

        <section id="activate" className="mt-10 grid gap-7 rounded-[2rem] bg-white/70 p-6 backdrop-blur md:grid-cols-[1fr_420px] md:p-9">
          <div className="py-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Simple activation for the MVP</p>
            <h2 className="mt-3 text-3xl font-bold text-[#09264a]">Request, confirm, activate.</h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">Your request is recorded against your verified Moodle identity. The Faculty Assistant Licence Desk confirms payment or institution coverage, activates the entitlement, and keeps an audit trail. The desktop app picks it up through Refresh licence.</p>
          </div>
          <UpgradeRequestForm defaultPlan={searchParams.plan || 'professional'} />
        </section>

        <section id="download" className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white/75 p-6 md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Latest desktop beta</p>
            <h2 className="mt-2 text-2xl font-bold text-[#09264a]">Faculty Assistant v0.19.0-beta.1 is available now.</h2>
            <p className="mt-2 max-w-3xl text-slate-600">Download the approved Windows installer or a macOS and Linux candidate package from the official Faculty Assistant release page. Every package includes a published SHA-256 checksum.</p>
            <p className="mt-3 text-sm font-semibold text-amber-800">AI Assistant, Course Outline Designer and automatic updates are not included in this beta.</p>
          </div>
          <a href="https://facultyassistant.org/download" target="_blank" rel="noreferrer" className="mt-5 inline-block whitespace-nowrap rounded-xl bg-[#09264a] px-5 py-3 text-center text-sm font-bold text-white md:mt-0">Choose your download</a>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-[#0b294f]">
          <p className="mb-2"><strong>Pricing currencies:</strong> KES is shown first for Kenya and regional billing. USD prices are fixed international list prices and do not change with daily exchange rates.</p>
          <strong>Need help with Faculty Assistant?</strong>{' '}
          Email <a className="font-bold underline" href={`mailto:${facultyAssistantContact.supportEmail}`}>{facultyAssistantContact.supportEmail}</a> for product, licence, billing, or technical support. General and institution enquiries can also be sent to <a className="font-bold underline" href={`mailto:${facultyAssistantContact.helloEmail}`}>{facultyAssistantContact.helloEmail}</a>.
        </section>
      </div>
    </main>
  )
}

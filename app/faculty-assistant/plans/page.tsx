import type { Metadata } from 'next'
import Link from 'next/link'
import { FaBuilding, FaCheck, FaGraduationCap, FaLaptop } from 'react-icons/fa'
import UpgradeRequestForm from './UpgradeRequestForm'

export const metadata: Metadata = {
  title: 'Faculty Assistant Plans',
  description: 'Choose a Faculty Assistant licence for lecturer productivity and secure Moodle integration.',
}

const plans = [
  {
    name: 'Essential',
    price: 'KES 3,000 / year',
    note: 'Offline lecturer toolkit',
    icon: FaLaptop,
    features: ['Grade conversion and iCampus export', 'Visual assessment authoring and GIFT export', 'Local course projects', 'Course outline designer'],
  },
  {
    name: 'Professional',
    price: 'KES 9,000 / year',
    note: 'For connected power users',
    icon: FaGraduationCap,
    featured: true,
    features: ['Everything in Essential', 'Secure Moodle course sync', 'Direct reviewed question-bank publishing', 'Word and PDF recovery', 'Advanced analytics and future AI credits'],
  },
  {
    name: 'Institution',
    price: 'From KES 150,000 / year',
    note: 'For universities and departments',
    icon: FaBuilding,
    features: ['Everything in Professional', 'Central seats and licence controls', 'Shared approved templates', 'Custom SIS and Moodle connectors', 'Audit, deployment and priority support'],
  },
]

export default function FacultyAssistantPlansPage({
  searchParams,
}: {
  searchParams: { plan?: string }
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(212,155,36,0.2),transparent_28rem),linear-gradient(180deg,#f7f3e8,#eef2ee)] px-5 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <Link href="/" className="text-sm font-bold text-[#0b3866]">UEAB ODeL</Link>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.24em] text-amber-700">Faculty Assistant licensing</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-[#09264a] md:text-6xl">Local work stays yours. Premium automation saves the hours.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">Start with the lecturer tools you need, then add secure Moodle automation or institution-wide controls when the value is clear.</p>
        </header>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <article key={plan.name} className={`relative rounded-[1.5rem] border p-6 ${plan.featured ? 'border-amber-400 bg-[#0b294f] text-white shadow-2xl' : 'border-slate-200 bg-white/90'}`}>
                {plan.featured && <span className="absolute right-5 top-5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-[#09264a]">Best value</span>}
                <Icon className={`text-2xl ${plan.featured ? 'text-amber-300' : 'text-amber-700'}`} />
                <h2 className="mt-5 text-2xl font-bold">{plan.name}</h2>
                <p className={`mt-1 text-sm ${plan.featured ? 'text-blue-100' : 'text-slate-500'}`}>{plan.note}</p>
                <p className="mt-5 text-xl font-bold">{plan.price}</p>
                <div className="mt-5 space-y-3">
                  {plan.features.map((feature) => <p key={feature} className="flex gap-3 text-sm leading-6"><FaCheck className="mt-1 flex-none text-emerald-500" /> {feature}</p>)}
                </div>
              </article>
            )
          })}
        </section>

        <section className="mt-10 grid gap-7 rounded-[2rem] bg-white/70 p-6 backdrop-blur md:grid-cols-[1fr_420px] md:p-9">
          <div className="py-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Simple activation for the MVP</p>
            <h2 className="mt-3 text-3xl font-bold text-[#09264a]">Request, confirm, activate.</h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">Your request is recorded against your Moodle identity. The ODeL team confirms payment and turns on the entitlement. Later, M-Pesa and card checkout can automate the same activation record without changing the desktop app.</p>
          </div>
          <UpgradeRequestForm defaultPlan={searchParams.plan || 'professional'} />
        </section>
      </div>
    </main>
  )
}

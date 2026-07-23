export type FacultyAssistantPaidPlan = 'professional' | 'institution'
export type FacultyAssistantBillingPeriod = 'monthly' | 'semester' | 'annual'

export const facultyAssistantPricing = {
  essential: {
    name: 'Essential',
    price: 'Free forever',
    secondaryPrice: 'No card required',
  },
  professional: {
    name: 'Professional',
    monthlyKes: 1000,
    annualKes: 9000,
    monthlyUsd: 9,
    annualUsd: 70,
    monthlyPrice: 'KES 1,000 / month',
    monthlyOptionLabel: 'KES 1,000',
    annualPrice: 'KES 9,000 / year',
    annualOptionLabel: 'KES 9,000',
    internationalPrice: 'USD 9 / month or USD 70 / year',
    annualSavingsKes: 3000,
    annualSavingsUsd: 38,
    annualSavings: 'save KES 3,000',
  },
  institution: {
    name: 'Institution',
    semesterKes: 150000,
    annualKes: 250000,
    semesterUsd: 1200,
    annualUsd: 2000,
    semesterPrice: 'KES 150,000 / semester',
    semesterOptionLabel: 'KES 150,000',
    annualPrice: 'KES 250,000 / year',
    annualOptionLabel: 'KES 250,000',
    internationalPrice: 'USD 1,200 / semester or USD 2,000 / year',
    annualSavingsKes: 50000,
    annualSavingsUsd: 400,
    annualSavings: 'save KES 50,000',
    seatLabel: 'Unlimited faculty seats',
    scopeLabel: 'One approved institution domain and Moodle installation',
    enterprisePrice: 'Multi-campus/custom: from KES 400,000 or USD 3,500 / year',
  },
} as const

export function isFacultyAssistantBillingPeriod(
  plan: FacultyAssistantPaidPlan,
  period: string,
): period is FacultyAssistantBillingPeriod {
  return plan === 'professional'
    ? period === 'monthly' || period === 'annual'
    : period === 'semester' || period === 'annual'
}

export function facultyAssistantBillingLabel(
  plan: FacultyAssistantPaidPlan,
  period: FacultyAssistantBillingPeriod,
) {
  if (plan === 'professional') {
    return period === 'monthly'
      ? `Monthly - ${facultyAssistantPricing.professional.monthlyOptionLabel} (international USD 9)`
      : `Annual - ${facultyAssistantPricing.professional.annualOptionLabel} (international USD 70; ${facultyAssistantPricing.professional.annualSavings})`
  }
  return period === 'semester'
    ? `Semester - ${facultyAssistantPricing.institution.semesterOptionLabel} (international USD 1,200; 6 months)`
    : `Annual - ${facultyAssistantPricing.institution.annualOptionLabel} (international USD 2,000; ${facultyAssistantPricing.institution.annualSavings})`
}

export function facultyAssistantPriceKes(
  plan: FacultyAssistantPaidPlan,
  period: FacultyAssistantBillingPeriod,
) {
  if (plan === 'professional') {
    return period === 'monthly'
      ? facultyAssistantPricing.professional.monthlyKes
      : facultyAssistantPricing.professional.annualKes
  }
  return period === 'semester'
    ? facultyAssistantPricing.institution.semesterKes
    : facultyAssistantPricing.institution.annualKes
}

export function facultyAssistantTermMonths(period: FacultyAssistantBillingPeriod) {
  if (period === 'monthly') return 1
  if (period === 'semester') return 6
  return 12
}

export const facultyAssistantPlanCards = [
  {
    id: 'essential',
    name: facultyAssistantPricing.essential.name,
    price: facultyAssistantPricing.essential.price,
    secondaryPrice: facultyAssistantPricing.essential.secondaryPrice,
    internationalPrice: '',
    note: 'Start useful, stay in control',
    featured: false,
    features: ['Local Grade Studio projects', 'Moodle report to calculated grade workbook', 'Flexible grading policies', 'Visual assessment authoring', 'GIFT and review exports', 'No Moodle connection or managed AI'],
  },
  {
    id: 'professional',
    name: facultyAssistantPricing.professional.name,
    price: facultyAssistantPricing.professional.monthlyPrice,
    secondaryPrice: `${facultyAssistantPricing.professional.annualPrice} - ${facultyAssistantPricing.professional.annualSavings}`,
    internationalPrice: `International: ${facultyAssistantPricing.professional.internationalPrice}`,
    note: 'The connected lecturer workspace',
    featured: true,
    features: ['Everything in Essential', 'Secure Moodle course workspace sync', 'Direct reviewed question-bank publishing', 'Word, PDF and scanned exam recovery', 'Advanced grade analytics', 'Priority beta support and early feature access'],
  },
  {
    id: 'institution',
    name: facultyAssistantPricing.institution.name,
    price: facultyAssistantPricing.institution.annualPrice,
    secondaryPrice: `${facultyAssistantPricing.institution.semesterPrice}; annual plan ${facultyAssistantPricing.institution.annualSavings}`,
    internationalPrice: `International: ${facultyAssistantPricing.institution.internationalPrice}`,
    note: 'One agreement for the whole institution',
    featured: false,
    features: ['Everything in Professional', 'Unlimited lecturer seats under approved email domains', facultyAssistantPricing.institution.scopeLabel, 'Central licence and policy controls', 'Shared approved templates and branding', 'Audit, onboarding and priority support', facultyAssistantPricing.institution.enterprisePrice],
  },
] as const

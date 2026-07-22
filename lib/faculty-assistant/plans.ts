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
    monthlyPrice: 'KES 1,000 / month',
    monthlyOptionLabel: 'KES 1,000',
    annualPrice: 'KES 9,000 / year',
    annualOptionLabel: 'KES 9,000',
    annualSavings: 'save KES 3,000',
  },
  institution: {
    name: 'Institution',
    annualKes: 150000,
    annualPrice: 'KES 150,000 / year',
    seatLabel: 'Unlimited faculty seats',
  },
} as const

export const facultyAssistantPlanCards = [
  {
    id: 'essential',
    name: facultyAssistantPricing.essential.name,
    price: facultyAssistantPricing.essential.price,
    secondaryPrice: facultyAssistantPricing.essential.secondaryPrice,
    note: 'Start useful, stay in control',
    featured: false,
    features: ['Local Grade Studio projects', 'Moodle report to calculated grade workbook', 'Flexible grading policies', 'Visual assessment authoring', 'GIFT and review exports', 'No Moodle connection or managed AI'],
  },
  {
    id: 'professional',
    name: facultyAssistantPricing.professional.name,
    price: facultyAssistantPricing.professional.monthlyPrice,
    secondaryPrice: `${facultyAssistantPricing.professional.annualPrice} - ${facultyAssistantPricing.professional.annualSavings}`,
    note: 'The connected lecturer workspace',
    featured: true,
    features: ['Everything in Essential', 'Secure Moodle course workspace sync', 'Direct reviewed question-bank publishing', 'Word, PDF and scanned exam recovery', 'Unlimited institution templates', 'Advanced analytics and included AI credits'],
  },
  {
    id: 'institution',
    name: facultyAssistantPricing.institution.name,
    price: facultyAssistantPricing.institution.annualPrice,
    secondaryPrice: facultyAssistantPricing.institution.seatLabel,
    note: 'One agreement for the whole institution',
    featured: false,
    features: ['Everything in Professional', 'Unlimited lecturer seats under approved email domains', 'Central licence and policy controls', 'Shared approved templates and branding', 'Custom SIS and Moodle connectors', 'Audit, deployment, onboarding and priority support'],
  },
] as const

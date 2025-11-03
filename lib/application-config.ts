export type ApplicationType = 'graduate' | 'phd' | 'pgda' | 'pgde' | 'undergraduate' | 'diploma' | 'certificate'

export interface ApplicationRequirements {
  fee: string
  documents: string[]
  requiresCV: boolean
  requires3Referees: boolean
  requiresKCSE: boolean
  requiresKNQA: boolean
}

export const APPLICATION_CONFIG: Record<ApplicationType, ApplicationRequirements> = {
  graduate: {
    fee: '2500',
    documents: [
      'Degree Certificate',
      'Academic Transcripts',
      'CV/Resume',
      'Passport Photo',
      'ID Card Copy',
      'Birth Certificate',
      'KNQA Certificate (if foreign)',
    ],
    requiresCV: true,
    requires3Referees: true,
    requiresKCSE: false,
    requiresKNQA: true,
  },
  phd: {
    fee: '2500',
    documents: [
      'Master\'s Degree Certificate',
      'Master\'s Transcripts',
      'Bachelor\'s Degree Certificate',
      'CV/Resume',
      'Research Proposal',
      'Passport Photo',
      'ID Card Copy',
      'Birth Certificate',
      'KNQA Certificate (if foreign)',
    ],
    requiresCV: true,
    requires3Referees: true,
    requiresKCSE: false,
    requiresKNQA: true,
  },
  pgda: {
    fee: '2500',
    documents: [
      'Degree Certificate',
      'Academic Transcripts',
      'CV/Resume',
      'Passport Photo',
      'ID Card Copy',
      'Birth Certificate',
      'KNQA Certificate (if foreign)',
    ],
    requiresCV: true,
    requires3Referees: true,
    requiresKCSE: false,
    requiresKNQA: true,
  },
  pgde: {
    fee: '2500',
    documents: [
      'Degree Certificate',
      'Academic Transcripts',
      'CV/Resume',
      'Passport Photo',
      'ID Card Copy',
      'Birth Certificate',
      'KNQA Certificate (if foreign)',
    ],
    requiresCV: true,
    requires3Referees: true,
    requiresKCSE: false,
    requiresKNQA: true,
  },
  undergraduate: {
    fee: '1500',
    documents: [
      'KCSE Certificate',
      'School Leaving Certificate',
      'Academic Transcripts',
      'Passport Photo',
      'ID Card Copy',
      'Birth Certificate',
      'KNQA Certificate (if foreign)',
    ],
    requiresCV: false,
    requires3Referees: false,
    requiresKCSE: true,
    requiresKNQA: true,
  },
  diploma: {
    fee: '1000',
    documents: [
      'KCSE Certificate',
      'School Leaving Certificate',
      'Academic Transcripts',
      'Passport Photo',
      'ID Card Copy',
      'Birth Certificate',
      'KNQA Certificate (if foreign)',
    ],
    requiresCV: false,
    requires3Referees: false,
    requiresKCSE: true,
    requiresKNQA: true,
  },
  certificate: {
    fee: '1000',
    documents: [
      'KCSE Certificate',
      'School Leaving Certificate',
      'Academic Transcripts',
      'Passport Photo',
      'ID Card Copy',
      'Birth Certificate',
      'KNQA Certificate (if foreign)',
    ],
    requiresCV: false,
    requires3Referees: false,
    requiresKCSE: true,
    requiresKNQA: true,
  },
}

export const getProgramsForType = (type: ApplicationType): string[] => {
  switch (type) {
    case 'phd':
      return [
        'Doctor of Philosophy (PhD) in Business Administration',
        'Doctor of Philosophy (PhD) in Education',
        'Doctor of Philosophy (PhD) in Theology',
        'Doctor of Philosophy (PhD) in Public Health',
        'Doctor of Philosophy (PhD) in Nursing',
        'Other PhD Programs',
      ]
    case 'graduate':
    case 'pgda':
    case 'pgde':
      return [
        'Master of Business Administration (MBA)',
        'Master of Science in Computer Science',
        'Master of Education',
        'Master of Arts in Theology',
        'Master of Public Health',
        'Master of Science in Nursing',
        'Postgraduate Diploma',
        'Other Master\'s Programs',
      ]
    case 'undergraduate':
      return [
        'Bachelor of Business Administration',
        'Bachelor of Science in Computer Science',
        'Bachelor of Education',
        'Bachelor of Arts in Theology',
        'Bachelor of Science in Nursing',
        'Bachelor of Science in Public Health',
        'All other Bachelor\'s Programs',
      ]
    case 'diploma':
      return [
        'Diploma in Business Administration',
        'Diploma in Education',
        'Diploma in Computer Science',
        'Diploma in Nursing',
        'Other Diploma Programs',
      ]
    case 'certificate':
      return [
        'Various Certificate Programs',
        'Professional Certificates',
        'Short Course Certificates',
      ]
    default:
      return []
  }
}


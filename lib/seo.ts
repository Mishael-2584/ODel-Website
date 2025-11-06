import { Metadata } from 'next'

export const baseUrl = 'https://odel.ueab.ac.ke'

export const defaultSEO = {
  siteName: 'UEAB ODeL - Baraton Online',
  twitterHandle: '@UEAB_Kenya',
  ogImage: '/images/campus/ODeLbuilding.jpg',
}

export function generatePageMetadata({
  title,
  description,
  keywords,
  path = '',
  image,
}: {
  title: string
  description: string
  keywords?: string
  path?: string
  image?: string
}): Metadata {
  const url = `${baseUrl}${path}`
  const ogImage = image || defaultSEO.ogImage

  return {
    title: `${title} | UEAB ODeL - Baraton Online University`,
    description,
    keywords: keywords || 'UEAB ODeL, Baraton ODeL, online university Kenya, distance learning',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: path || '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title: `${title} | UEAB ODeL`,
      description,
      siteName: defaultSEO.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | UEAB ODeL`,
      description,
      images: [ogImage],
      creator: defaultSEO.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// SEO keywords for different pages
export const seoKeywords = {
  home: 'ODeL, ODeL Kenya, odel, odel kenya, Open Distance eLearning Kenya, UEAB ODeL, Baraton ODeL, UEAB online, Baraton online, University of Eastern Africa Baraton, UEAB distance learning, Baraton distance learning, online university Kenya, eLearning Kenya, accredited online degrees Kenya, flexible learning Kenya, online education East and Central Africa, distance education Kenya, UEAB Eldoret, Baraton Eldoret, odel platform Kenya, odel university Kenya, best odel Kenya',
  
  courses: 'ODeL courses Kenya, odel courses, UEAB courses, Baraton courses, UEAB programs, Baraton programs, online degree programs Kenya, online bachelor degree Kenya, online masters Kenya, MBA online Kenya, education degree online, business degree online, health sciences online, UEAB course catalog, Baraton course catalog',
  
  resources: 'ODeL resources Kenya, UEAB library, Baraton library, online library Kenya, e-resources Kenya, academic resources, digital library, MyLOFT, OPAC, e-books Kenya, academic journals Kenya, research resources, student resources UEAB, student resources Baraton',
  
  about: 'ODeL Kenya, about ODeL, about UEAB, about Baraton, University of Eastern Africa Baraton, UEAB history, Baraton history, accredited university Kenya, CUE accredited, Seventh-day Adventist university, Christian university Kenya, UEAB campus, Baraton campus, odel platform Kenya',
  
  contact: 'ODeL contact Kenya, contact UEAB, contact Baraton, UEAB ODeL contact, Baraton ODeL contact, UEAB Eldoret, Baraton Eldoret, university contact Kenya, admissions contact, student support contact',
  
  login: 'ODeL login Kenya, UEAB student portal, Baraton student portal, UEAB login, Baraton login, student login, eLearning portal, Moodle login, online learning platform',
  
  register: 'ODeL application Kenya, apply UEAB, apply Baraton, UEAB admissions, Baraton admissions, online university application Kenya, distance learning application, register online university, enroll UEAB, enroll Baraton',
}

// Structured data generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'UEAB ODeL - University of Eastern Africa, Baraton',
    alternateName: ['Baraton ODeL', 'UEAB Online', 'Baraton Online', 'ODeL Kenya', 'ODeL Platform Kenya', 'UEAB ODeL Kenya'],
    url: baseUrl,
    logo: 'https://ueab.ac.ke/wp-content/uploads/2025/03/logo-2.png',
    description: 'ODeL Kenya - Premier Open Distance and eLearning platform offering accredited online degree programs from University of Eastern Africa, Baraton. Leading ODeL platform in Kenya.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'P.O. Box 2500',
      addressLocality: 'Eldoret',
      addressRegion: 'Uasin Gishu',
      postalCode: '30100',
      addressCountry: 'KE',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Kenya',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254 714 333 111',
      contactType: 'customer service',
      email: 'odel@ueab.ac.ke',
      availableLanguage: ['English'],
      areaServed: 'KE',
    },
    sameAs: [
      'https://ueab.ac.ke',
      'https://www.facebook.com/UEAB.official',
      'https://twitter.com/UEAB_Kenya',
    ],
    keywords: 'ODeL, ODeL Kenya, odel, odel kenya, Open Distance eLearning Kenya, online university Kenya, distance learning Kenya',
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

export function generateCourseSchema(course: {
  name: string
  description: string
  provider: string
  category: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: course.provider,
      url: baseUrl,
    },
    courseCode: course.category,
    educationalLevel: 'Higher Education',
    inLanguage: 'en',
  }
}

import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import Chatbot from '@/components/Chatbot'
import CookieConsent from '@/components/CookieConsent'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    default: 'UEAB - University of Eastern Africa Baraton | ODeL Online Learning Kenya',
    template: '%s | UEAB ODeL'
  },
  description: 'UEAB (University of Eastern Africa, Baraton) - Premier ODeL platform in Kenya. Accredited online degrees, distance learning programs, flexible education. Study Business, Education, Health Sciences, Science & Technology at UEAB. Open Distance eLearning from a leading Kenyan university.',
  keywords: [
    // Primary branded keywords
    'UEAB', 'University of Eastern Africa Baraton', 'Baraton University', 'UEAB Kenya',
    // ODeL specific
    'ODeL', 'ODeL Kenya', 'Open Distance eLearning', 'UEAB ODeL', 'Baraton ODeL',
    // Generic education keywords
    'online university Kenya', 'distance learning Kenya', 'eLearning Kenya', 'online degree Kenya',
    'online education Kenya', 'flexible learning Kenya', 'study online Kenya',
    // Program specific
    'online bachelor degree Kenya', 'online masters Kenya', 'online MBA Kenya', 'online nursing degree Kenya',
    'online education degree Kenya', 'online business degree Kenya',
    // Location based
    'university Eldoret', 'UEAB Eldoret', 'online university East Africa', 'distance education Kenya',
    // Accreditation & quality
    'accredited online university Kenya', 'CUE accredited university', 'recognized online degrees Kenya',
    // Comparison & alternatives
    'best online university Kenya', 'affordable online university Kenya', 'Kenyan universities online',
    'distance learning universities Kenya'
  ].join(', '),
  authors: [{ name: 'University of Eastern Africa, Baraton' }],
  creator: 'UEAB ODeL Development Team',
  publisher: 'University of Eastern Africa, Baraton',
  category: 'Education',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://odel.ueab.ac.ke'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    alternateLocale: ['en_US', 'sw_KE'],
    url: 'https://odel.ueab.ac.ke',
    title: 'UEAB - University of Eastern Africa Baraton | ODeL Online Learning',
    description: 'UEAB (University of Eastern Africa, Baraton) offers accredited ODeL programs in Kenya. Join 5,000+ students in flexible online learning. Business, Education, Health Sciences, Science & Technology degrees available.',
    siteName: 'UEAB ODeL',
    images: [
      {
        url: 'https://odel.ueab.ac.ke/images/campus/ODeLbuilding.jpg',
        width: 1200,
        height: 630,
        alt: 'UEAB ODeL Building - University of Eastern Africa Baraton Online Learning Facility',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UEAB - University of Eastern Africa Baraton | ODeL Kenya',
    description: 'UEAB offers accredited ODeL programs in Kenya. Flexible online learning from a leading university. Business, Education, Health Sciences & more.',
    images: ['https://odel.ueab.ac.ke/images/campus/ODeLbuilding.jpg'],
    creator: '@UEAB_Kenya',
    site: '@UEAB_Kenya',
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
  verification: {
    google: 'EgW8YBHOPg0SQwiif-r_TqXuj_V9QAxFMUGC-KUAGEg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enhanced Structured Data for SEO - Organization
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "University",
    "@id": "https://odel.ueab.ac.ke/#organization",
    "name": "UEAB",
    "alternateName": [
      "University of Eastern Africa Baraton",
      "UEAB ODeL",
      "Baraton University",
      "ODeL UEAB"
    ],
    "url": "https://odel.ueab.ac.ke",
    "logo": {
      "@type": "ImageObject",
      "url": "https://ueab.ac.ke/wp-content/uploads/2025/03/logo-2.png",
      "width": 250,
      "height": 80
    },
    "image": "https://odel.ueab.ac.ke/images/campus/ODeLbuilding.jpg",
    "description": "UEAB (University of Eastern Africa, Baraton) is Kenya's premier Open Distance eLearning (ODeL) institution offering accredited online degree programs across Business, Education, Health Sciences, Science & Technology, and Graduate Studies.",
    "foundingDate": "1978",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "P.O. Box 2500",
      "addressLocality": "Eldoret",
      "addressRegion": "Uasin Gishu County",
      "postalCode": "30100",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "0.2565390634635225",
      "longitude": "35.07958708456931"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+254-714-333-111",
        "contactType": "admissions",
        "email": "odel@ueab.ac.ke",
        "availableLanguage": ["English", "Swahili"],
        "areaServed": ["KE", "UG", "TZ", "RW", "BI", "SS"]
      },
      {
        "@type": "ContactPoint",
        "telephone": "+254-714-333-111",
        "contactType": "customer service",
        "email": "info@ueab.ac.ke",
        "availableLanguage": ["English", "Swahili"]
      }
    ],
    "sameAs": [
      "https://ueab.ac.ke",
      "https://www.facebook.com/UEAB.official",
      "https://twitter.com/UEAB_Kenya",
      "https://www.linkedin.com/school/university-of-eastern-africa-baraton/",
      "https://www.youtube.com/channel/UCExample"
    ],
    "department": [
      {
        "@type": "EducationalOrganization",
        "name": "School of Business",
        "url": "https://odel.ueab.ac.ke/programs#business"
      },
      {
        "@type": "EducationalOrganization",
        "name": "School of Education, Humanities and Social Sciences",
        "url": "https://odel.ueab.ac.ke/programs#education"
      },
      {
        "@type": "EducationalOrganization",
        "name": "School of Health Sciences & Nursing",
        "url": "https://odel.ueab.ac.ke/programs#health"
      },
      {
        "@type": "EducationalOrganization",
        "name": "School of Science and Technology",
        "url": "https://odel.ueab.ac.ke/programs#science"
      },
      {
        "@type": "EducationalOrganization",
        "name": "School of Graduate Studies and Research",
        "url": "https://odel.ueab.ac.ke/programs#graduate"
      }
    ],
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "name": "Commission for University Education (CUE) Accreditation",
        "credentialCategory": "University Accreditation"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "name": "AAA Accrediting Association",
        "credentialCategory": "International Accreditation"
      }
    ],
    "knowsAbout": [
      "ODeL",
      "Open Distance eLearning",
      "Online Education",
      "Distance Learning",
      "Online Degrees",
      "Business Administration",
      "Nursing Education",
      "Teacher Education",
      "Health Sciences",
      "Graduate Studies"
    ],
    "areaServed": {
      "@type": "Place",
      "name": "Kenya and East Africa"
    },
    "slogan": "Transform Your Future with UEAB ODeL"
  }
  
  // Website Schema
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://odel.ueab.ac.ke/#website",
    "url": "https://odel.ueab.ac.ke",
    "name": "UEAB ODeL",
    "description": "University of Eastern Africa Baraton Open Distance eLearning Platform",
    "publisher": {
      "@id": "https://odel.ueab.ac.ke/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://odel.ueab.ac.ke/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "en-KE"
  }
  
  // Course Catalog
  const courseCatalogData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "UEAB ODeL Academic Programs",
    "description": "Comprehensive list of online degree programs offered by University of Eastern Africa Baraton",
    "itemListElement": [
      {
        "@type": "Course",
        "position": 1,
        "name": "Bachelor of Business Administration",
        "description": "Online BBA program in Marketing, Accounting, Finance, and Information Systems",
        "provider": { "@id": "https://odel.ueab.ac.ke/#organization" },
        "courseMode": "online",
        "educationalLevel": "Undergraduate",
        "timeToComplete": "P4Y",
        "occupationalCategory": "Business Administration"
      },
      {
        "@type": "Course",
        "position": 2,
        "name": "Bachelor of Science in Nursing",
        "description": "Accredited online BSc Nursing program",
        "provider": { "@id": "https://odel.ueab.ac.ke/#organization" },
        "courseMode": "online",
        "educationalLevel": "Undergraduate",
        "timeToComplete": "P4Y",
        "occupationalCategory": "Nursing"
      },
      {
        "@type": "Course",
        "position": 3,
        "name": "Bachelor of Education",
        "description": "Online B.Ed programs in Science, Arts, and Early Childhood Education",
        "provider": { "@id": "https://odel.ueab.ac.ke/#organization" },
        "courseMode": "online",
        "educationalLevel": "Undergraduate",
        "timeToComplete": "P4Y",
        "occupationalCategory": "Education"
      },
      {
        "@type": "Course",
        "position": 4,
        "name": "Master of Business Administration",
        "description": "Online MBA program with specializations",
        "provider": { "@id": "https://odel.ueab.ac.ke/#organization" },
        "courseMode": "online",
        "educationalLevel": "Graduate",
        "timeToComplete": "P2Y",
        "occupationalCategory": "Business Administration"
      }
    ]
  }
  
  // BreadcrumbList for better site structure understanding
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://odel.ueab.ac.ke"
      }
    ]
  }

  return (
    <html lang="en-KE" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseCatalogData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Additional SEO tags */}
        <meta name="geo.region" content="KE-47" />
        <meta name="geo.placename" content="Eldoret" />
        <meta name="geo.position" content="0.2565390634635225;35.07958708456931" />
        <meta name="ICBM" content="0.2565390634635225, 35.07958708456931" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Chatbot />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  )
}


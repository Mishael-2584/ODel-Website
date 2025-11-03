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
  title: 'UEAB ODeL - Open Distance and eLearning | Baraton Online University',
  description: 'UEAB ODeL (University of Eastern Africa, Baraton) offers accredited online degree programs. Flexible distance learning from Baraton University with 5 academic schools, experienced faculty, and internationally recognized qualifications. Study online from anywhere in Kenya and East and Central Africa.',
  keywords: 'UEAB ODeL, Baraton ODeL, UEAB online, Baraton online, University of Eastern Africa Baraton, UEAB distance learning, Baraton distance learning, online university Kenya, eLearning Kenya, UEAB courses, Baraton courses, accredited online degrees Kenya, flexible learning Kenya, online education East and Central Africa, UEAB programs, Baraton programs, distance education Kenya, online bachelor degree Kenya, online masters Kenya, UEAB Eldoret, Baraton Eldoret',
  authors: [{ name: 'University of Eastern Africa, Baraton' }],
  creator: 'UEAB ODeL Development Team',
  publisher: 'University of Eastern Africa, Baraton',
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
    locale: 'en_US',
    url: 'https://odel.ueab.ac.ke',
    title: 'UEAB ODeL - Baraton Online University | Distance Learning Kenya',
    description: 'Transform your future with flexible, accredited online learning from UEAB (Baraton University). Join 5,000+ students across East and Central Africa studying online.',
    siteName: 'UEAB ODeL - Baraton Online',
    images: [
      {
        url: '/images/campus/ODeLbuilding.jpg',
        width: 1200,
        height: 630,
        alt: 'UEAB ODeL Building - State-of-the-art Online Learning Facility',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UEAB ODeL - Open Distance and eLearning',
    description: 'Flexible, accredited online learning from University of Eastern Africa, Baraton',
    images: ['/images/campus/ODeLbuilding.jpg'],
    creator: '@UEAB_Kenya',
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
  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "UEAB ODeL - University of Eastern Africa, Baraton",
    "url": "https://odel.ueab.ac.ke",
    "logo": "https://ueab.ac.ke/wp-content/uploads/2025/03/logo-2.png",
    "description": "Premier Open Distance and eLearning platform offering accredited online degree programs across five academic schools",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "P.O. Box 2500",
      "addressLocality": "Eldoret",
      "addressRegion": "Uasin Gishu",
      "postalCode": "30100",
      "addressCountry": "KE"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+254 714 333 111",
      "contactType": "customer service",
      "email": "odel@ueab.ac.ke",
      "availableLanguage": ["English"]
    },
    "sameAs": [
      "https://ueab.ac.ke",
      "https://www.facebook.com/UEAB.official",
      "https://twitter.com/UEAB_Kenya"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Academic Programs",
      "itemListElement": [
        {
          "@type": "Course",
          "name": "Business Programs",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "UEAB ODeL"
          }
        },
        {
          "@type": "Course", 
          "name": "Education Programs",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "UEAB ODeL"
          }
        },
        {
          "@type": "Course",
          "name": "Health Sciences Programs",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "UEAB ODeL"
          }
        },
        {
          "@type": "Course",
          "name": "Science and Technology Programs",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "UEAB ODeL"
          }
        },
        {
          "@type": "Course",
          "name": "Graduate Studies Programs",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "UEAB ODeL"
          }
        }
      ]
    }
  }

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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


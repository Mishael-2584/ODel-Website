'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is UEAB ODeL?',
          a: 'UEAB ODeL (Open Distance and eLearning) is the online learning platform of the University of Eastern Africa, Baraton, offering flexible, accredited degree programs that you can study from anywhere.'
        },
        {
          q: 'Are UEAB ODeL programs accredited?',
          a: 'Yes, all UEAB ODeL programs are fully accredited by the Commission for University Education (CUE) in Kenya and internationally recognized.'
        },
        {
          q: 'How do I apply?',
          a: 'Visit our Admissions page, complete the online application form, submit required documents, and pay the application fee. You will receive an admission decision within 2-4 weeks.'
        }
      ]
    },
    {
      category: 'Courses & Programs',
      questions: [
        {
          q: 'What programs are available?',
          a: 'We offer programs across 5 schools: Business, Education, Health Sciences, Science & Technology, and Graduate Studies. Visit our Courses page for the complete catalog.'
        },
        {
          q: 'Can I study part-time?',
          a: 'Yes, our flexible learning model allows you to study at your own pace while balancing work and other commitments.'
        },
        {
          q: 'How long does it take to complete a program?',
          a: 'Duration varies by program level: Certificates (6-12 months), Diplomas (1-2 years), Bachelor\'s (3-4 years), Master\'s (1.5-2 years).'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          q: 'I forgot my password. What should I do?',
          a: 'Click "Forgot Password" on the login page and follow the instructions to reset your password via email.'
        },
        {
          q: 'How do I access course materials?',
          a: 'Log in to your student portal, navigate to your enrolled courses, and access all materials through the Moodle learning management system.'
        },
        {
          q: 'What are the technical requirements?',
          a: 'You need a computer or mobile device with internet connection, updated web browser (Chrome, Firefox, Safari), and basic productivity software (Microsoft Office or Google Docs).'
        }
      ]
    },
    {
      category: 'Fees & Payment',
      questions: [
        {
          q: 'How much are the tuition fees?',
          a: 'Tuition fees vary by program. Visit our Courses page or contact admissions for specific fee structures.'
        },
        {
          q: 'Are payment plans available?',
          a: 'Yes, we offer flexible payment plans. Contact our finance office at finance@ueab.ac.ke for details.'
        },
        {
          q: 'Are scholarships available?',
          a: 'Yes, we offer merit-based scholarships, need-based financial aid, and church sponsorships. Visit our Scholarships page for more information.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <FaQuestionCircle className="text-6xl mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Find answers to common questions about UEAB ODeL
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {faqs.map((category, catIndex) => (
            <section key={catIndex} className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, qIndex) => {
                  const index = catIndex * 100 + qIndex
                  const isOpen = openIndex === index
                  
                  return (
                    <div key={qIndex} className="border-b border-gray-200 last:border-0">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full flex items-center justify-between py-4 text-left hover:text-primary-600 transition-colors"
                      >
                        <span className="font-semibold text-gray-800 pr-4">{faq.q}</span>
                        {isOpen ? (
                          <FaChevronUp className="text-primary-600 flex-shrink-0" />
                        ) : (
                          <FaChevronDown className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="pb-4 text-gray-600 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}

          <section className="bg-primary-50 rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Still have questions?</h2>
            <p className="text-gray-700 mb-6">
              Our support team is here to help you
            </p>
            <div className="space-y-2 text-gray-700">
              <p>📧 Email: odel@ueab.ac.ke</p>
              <p>📞 Phone: +254 714 333 111</p>
              <p>💬 Use our chatbot for instant assistance</p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  )
}

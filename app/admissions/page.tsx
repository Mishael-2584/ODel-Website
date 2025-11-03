'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaGraduationCap, FaFileAlt, FaCheckCircle, FaMoneyBillWave,
  FaUpload, FaDownload, FaEnvelope, FaPhone, FaInfoCircle,
  FaUniversity, FaCertificate, FaBookOpen
} from 'react-icons/fa'

export default function AdmissionsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const applicationTypes = [
    {
      id: 'graduate',
      title: 'Graduate & Master\'s Programs',
      icon: FaGraduationCap,
      fee: 'KES 2,500',
      description: 'Master\'s degrees, MBA, and other graduate programs',
      requirements: [
        'Non-refundable Application Fee (KES. 2,500 or its USD equivalent)',
        'Complete and signed application form',
        'Copies of official degree certificate and transcripts for each college or professional school previously attended (originals to be brought for verification on the day of reporting)',
        'Originals and copies of all supportive academic documents',
        'Updated Curriculum Vitae',
        'Meet the University minimum entry requirement eligibility criteria',
        '3 References from your academic area (forms to be filled and sent to admissions office by the referees directly)',
        'One recent passport size photograph (name of the student on reverse side)',
        'Copy of the National Identity Card',
        'Copy of Birth Certificate',
        'Kenya National Qualifications Authority (KNQA) Equation Certificate (required for all Foreign Qualifications) - www.knqa.go.ke',
      ],
      programs: [
        'Master of Business Administration (MBA)',
        'Master of Science in Computer Science',
        'Master of Education',
        'Master of Arts in Theology',
        'Master of Public Health',
        'Master of Science in Nursing',
        'Other Master\'s Programs',
      ],
    },
    {
      id: 'phd',
      title: 'PhD Programs',
      icon: FaGraduationCap,
      fee: 'KES 2,500',
      description: 'Doctor of Philosophy and doctoral programs',
      requirements: [
        'Non-refundable Application Fee (KES. 2,500 or its USD equivalent)',
        'Complete and signed application form',
        'Copies of official degree certificate and transcripts (Master\'s degree required)',
        'Originals and copies of all supportive academic documents',
        'Updated Curriculum Vitae',
        'Research proposal (for PhD programs)',
        'Meet the University minimum entry requirement eligibility criteria',
        '3 References from your academic area (forms to be filled and sent to admissions office by the referees directly)',
        'One recent passport size photograph',
        'Copy of the National Identity Card',
        'Copy of Birth Certificate',
        'Kenya National Qualifications Authority (KNQA) Equation Certificate (required for all Foreign Qualifications)',
      ],
      programs: [
        'Doctor of Philosophy (PhD) in various fields',
        'PhD in Business Administration',
        'PhD in Education',
        'PhD in Theology',
        'Other PhD Programs',
      ],
    },
    {
      id: 'undergraduate',
      title: 'Undergraduate Programs',
      icon: FaUniversity,
      fee: 'KES 1,500',
      description: 'Bachelor\'s degrees and undergraduate programs',
      requirements: [
        'Non-refundable Application Fee (KES. 1,500 or its USD equivalent)',
        'Complete and signed application form',
        'Copies of all academic transcripts, diplomas or certificates (originals to be brought for verification on the day of reporting)',
        'School Leaving Certificate',
        'Meet the University minimum entry requirement criteria',
        'KCSE Certificate or equivalent',
        'One recent passport size photograph (name of the student on reverse side)',
        'Copy of the National Identity Card (if qualifies for one)',
        'Copy of Birth Certificate',
        'Kenya National Qualifications Authority (KNQA) Equation Certificate (required for all Foreign Qualifications) - www.knqa.go.ke',
      ],
      programs: [
        'Bachelor of Business Administration',
        'Bachelor of Science in Computer Science',
        'Bachelor of Education',
        'Bachelor of Arts in Theology',
        'Bachelor of Science in Nursing',
        'Bachelor of Science in Public Health',
        'All other Bachelor\'s Programs',
      ],
    },
    {
      id: 'diploma',
      title: 'Diploma Programs',
      icon: FaCertificate,
      fee: 'KES 1,000',
      description: 'Diploma courses and programs',
      requirements: [
        'Non-refundable Application Fee (KES. 1,000 or its USD equivalent)',
        'Complete and signed application form',
        'Copies of all academic transcripts, diplomas or certificates (originals to be brought for verification)',
        'School Leaving Certificate',
        'Meet the University minimum entry requirement criteria',
        'KCSE Certificate or equivalent',
        'One recent passport size photograph',
        'Copy of the National Identity Card (if qualifies for one)',
        'Copy of Birth Certificate',
        'Kenya National Qualifications Authority (KNQA) Equation Certificate (required for all Foreign Qualifications)',
      ],
      programs: [
        'Diploma in Business Administration',
        'Diploma in Education',
        'Diploma in Computer Science',
        'Diploma in Nursing',
        'Other Diploma Programs',
      ],
    },
    {
      id: 'certificate',
      title: 'Certificate Programs',
      icon: FaCertificate,
      fee: 'KES 1,000',
      description: 'Certificate courses and short programs',
      requirements: [
        'Non-refundable Application Fee (KES. 1,000 or its USD equivalent)',
        'Complete and signed application form',
        'Copies of all academic transcripts, diplomas or certificates (originals to be brought for verification)',
        'School Leaving Certificate',
        'Meet the University minimum entry requirement criteria',
        'KCSE Certificate or equivalent',
        'One recent passport size photograph',
        'Copy of the National Identity Card (if qualifies for one)',
        'Copy of Birth Certificate',
        'Kenya National Qualifications Authority (KNQA) Equation Certificate (required for all Foreign Qualifications)',
      ],
      programs: [
        'Various Certificate Programs',
        'Professional Certificates',
        'Short Course Certificates',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center text-white">
            <div className="inline-flex items-center bg-gold-500/20 backdrop-blur-sm border border-gold-500/30 rounded-full px-4 py-2 mb-6">
              <FaGraduationCap className="mr-2" />
              <span className="text-gold-300 text-sm font-semibold">Admissions</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Apply to <span className="text-gold-400">UEAB</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Start your journey at University of Eastern Africa, Baraton. Apply for undergraduate, 
              graduate, diploma, or certificate programs through our streamlined online application system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/graduate-application" className="btn-gold inline-flex items-center group">
                <FaFileAlt className="mr-2 group-hover:scale-110 transition-transform" />
                Apply Now
              </Link>
              <Link href="#requirements" className="btn-outline-white inline-flex items-center group">
                <FaInfoCircle className="mr-2 group-hover:rotate-12 transition-transform" />
                View Requirements
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Application Types Section */}
      <section id="requirements" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Application Types</h2>
            <p className="text-xl text-gray-600">
              Choose your application type to see specific requirements and procedures
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {applicationTypes.map((type) => {
              const Icon = type.icon
              return (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                  className={`bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl ${
                    selectedType === type.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedType === type.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {type.fee}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                  <button className="text-primary-600 font-semibold text-sm hover:text-primary-700">
                    {selectedType === type.id ? 'Hide Details' : 'View Requirements →'}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Detailed Requirements */}
          {selectedType && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 mb-8">
              {applicationTypes
                .filter(type => type.id === selectedType)
                .map((type) => (
                  <div key={type.id}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{type.title}</h3>
                        <p className="text-gray-600">Application Fee: <span className="font-semibold text-primary-600">{type.fee}</span></p>
                      </div>
                      <Link
                        href={`/apply?type=${type.id}`}
                        className="btn-primary"
                      >
                        Apply Now
                      </Link>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FaCheckCircle className="text-green-600" />
                          Requirements Checklist
                        </h4>
                        <ul className="space-y-3">
                          {type.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <FaCheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FaBookOpen className="text-primary-600" />
                          Available Programs
                        </h4>
                        <ul className="space-y-2">
                          {type.programs.map((program, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary-600 mt-1">•</span>
                              <span className="text-gray-700">{program}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-900 mb-2">Application Deadlines</h5>
                          <p className="text-sm text-blue-800 mb-2">
                            UEAB has two intakes per academic year:
                          </p>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Main Intake: August/September</li>
                            <li>• Second Intake: December/January</li>
                          </ul>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                            <FaInfoCircle />
                            Important Notes
                          </h5>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Only complete applications will be accepted</li>
                            <li>• Non-refundable application fee must accompany the application</li>
                            <li>• Originals must be brought for verification on reporting day</li>
                            <li>• Foreign qualifications require KNQA certificate</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Application Process</h2>
            <p className="text-xl text-gray-600">Simple steps to apply</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Choose Program', desc: 'Select your application type and program', icon: FaBookOpen },
              { step: 2, title: 'Complete Form', desc: 'Fill out the online application form', icon: FaFileAlt },
              { step: 3, title: 'Upload Documents', desc: 'Submit all required documents', icon: FaUpload },
              { step: 4, title: 'Pay Fee', desc: 'Submit application fee payment', icon: FaMoneyBillWave },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-10 w-10 text-primary-600" />
                  </div>
                  <div className="inline-block bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Submitting Applications Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Submitting Your Application</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <FaEnvelope className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Online Submission</h3>
                  <p className="text-gray-600">
                    Submit your complete application online through our application portal. 
                    You'll receive an application number immediately upon submission.
                  </p>
                  <Link href="/apply" className="text-primary-600 font-semibold hover:text-primary-700 mt-2 inline-block">
                    Start Online Application →
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaEnvelope className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Email Submission</h3>
                  <p className="text-gray-600 mb-2">
                    Filled applications can be emailed to:
                  </p>
                  <a href="mailto:admissions@ueab.ac.ke" className="text-primary-600 font-semibold hover:text-primary-700">
                    admissions@ueab.ac.ke
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaUniversity className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">In-Person Submission</h3>
                  <p className="text-gray-600 mb-2">
                    Applications can be brought in person to:
                  </p>
                  <p className="text-gray-700">
                    UEAB Admissions Office<br />
                    P.O. Box 2500<br />
                    30100 Eldoret, Kenya
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaDownload className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Download Forms</h3>
                  <p className="text-gray-600 mb-4">
                    You can also download application forms from the main UEAB website:
                  </p>
                  <a 
                    href="https://ueab.ac.ke/apply-to-ueab/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-2"
                  >
                    Download Forms from UEAB <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">Need Help with Your Application?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <FaPhone className="h-6 w-6 mb-3" />
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-gray-200">+254 714 333 111</p>
                <p className="text-gray-200">+254 781 333 777</p>
              </div>
              <div>
                <FaEnvelope className="h-6 w-6 mb-3" />
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:admissions@ueab.ac.ke" className="text-gray-200 hover:text-gold-400">
                  admissions@ueab.ac.ke
                </a>
              </div>
              <div>
                <FaUniversity className="h-6 w-6 mb-3" />
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-gray-200">P.O. Box 2500</p>
                <p className="text-gray-200">30100 Eldoret, Kenya</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

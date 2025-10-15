'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaUniversity, FaGlobe, FaUsers, FaAward, FaGraduationCap, FaBook,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaBuilding, FaMicroscope,
  FaStethoscope, FaChalkboardTeacher, FaHeart, FaLightbulb,
  FaRocket, FaStar, FaCheckCircle, FaArrowRight, FaPlay
} from 'react-icons/fa'

export default function AboutPage() {
  const schools = [
    {
      icon: FaBuilding,
      title: 'School of Business',
      description: 'Comprehensive business education from undergraduate to doctoral levels.',
      programs: ['BBA', 'MBA', 'PhD in Business Administration'],
      color: 'from-blue-500 to-blue-700'
    },
    {
      icon: FaChalkboardTeacher,
      title: 'School of Education, Humanities and Social Sciences',
      description: 'Preparing educators and social science professionals for the future.',
      programs: ['B.Ed', 'M.Ed', 'PhD in Education'],
      color: 'from-green-500 to-green-700'
    },
    {
      icon: FaStethoscope,
      title: 'School of Nursing and Health Sciences',
      description: 'Healthcare education with clinical training and research opportunities.',
      programs: ['BSc Nursing', 'MSc Public Health', 'PhD in Health Sciences'],
      color: 'from-red-500 to-red-700'
    },
    {
      icon: FaMicroscope,
      title: 'School of Science and Technology',
      description: 'STEM education in computing, mathematics, and applied sciences.',
      programs: ['BSc Computer Science', 'MSc IT', 'PhD in Technology'],
      color: 'from-purple-500 to-purple-700'
    },
    {
      icon: FaGraduationCap,
      title: 'School of Graduate Studies and Research',
      description: 'Advanced research programs and doctoral studies.',
      programs: ['Master\'s Programs', 'PhD Programs', 'Research Fellowships'],
      color: 'from-gold-500 to-gold-700'
    }
  ]

  const values = [
    {
      icon: FaHeart,
      title: 'Excellence',
      description: 'Committed to academic excellence and continuous improvement in all our programs.'
    },
    {
      icon: FaGlobe,
      title: 'Diversity',
      description: 'Embracing diversity and fostering an inclusive learning environment for all students.'
    },
    {
      icon: FaLightbulb,
      title: 'Innovation',
      description: 'Promoting innovation in teaching, learning, and research methodologies.'
    },
    {
      icon: FaStar,
      title: 'Integrity',
      description: 'Maintaining the highest standards of academic and professional integrity.'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Active Students', icon: FaUsers },
    { value: '200+', label: 'Academic Programs', icon: FaBook },
    { value: '40+', label: 'Nationalities', icon: FaGlobe },
    { value: '95%', label: 'Graduate Success Rate', icon: FaAward }
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
              <span className="text-gold-300 text-sm font-semibold">About UEAB</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              University of Eastern Africa, <span className="text-gold-400">Baraton</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              One of the largest, most diverse universities in Africa, committed to providing 
              quality education that transforms lives and communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="btn-primary inline-flex items-center group">
                <FaBook className="mr-2 group-hover:rotate-12 transition-transform" />
                Explore Programs
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="btn-outline-gold inline-flex items-center group">
                <FaEnvelope className="mr-2 group-hover:scale-110 transition-transform" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About UEAB Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Our Story
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                About University of Eastern Africa, Baraton
              </h2>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                The University of Eastern Africa, Baraton (UEAB) is a private, co-educational institution 
                located in Eldoret, Kenya. Established as part of the Seventh-day Adventist educational system, 
                UEAB has grown to become one of the most respected universities in East Africa.
              </p>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                At UEAB, we understand the importance of holistic education. In addition to our rigorous academic 
                curriculum, we offer vibrant campus life that promotes personal growth, cultural enrichment, and 
                extracurricular engagement. Our students have access to a wide range of clubs, organizations, 
                and sports facilities, fostering a sense of community, leadership development, and well-roundedness.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">Accredited Programs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">International Recognition</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">Expert Faculty</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">Modern Facilities</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Placeholder for UEAB campus images */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary-100 to-gold-100 rounded-2xl p-6 text-center border-2 border-dashed border-primary-300">
                  <FaUniversity className="h-16 w-16 text-primary-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Main Campus</h3>
                  <p className="text-gray-600 text-sm">Beautiful campus images will be displayed here</p>
                </div>
                <div className="bg-gradient-to-br from-gold-100 to-primary-100 rounded-2xl p-6 text-center border-2 border-dashed border-gold-300">
                  <FaBuilding className="h-16 w-16 text-gold-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Academic Buildings</h3>
                  <p className="text-gray-600 text-sm">Modern facilities and classrooms</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 text-center border-2 border-dashed border-green-300">
                  <FaUsers className="h-16 w-16 text-green-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Student Life</h3>
                  <p className="text-gray-600 text-sm">Campus activities and events</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-red-100 rounded-2xl p-6 text-center border-2 border-dashed border-purple-300">
                  <FaGraduationCap className="h-16 w-16 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Graduation</h3>
                  <p className="text-gray-600 text-sm">Commencement ceremonies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">UEAB by the Numbers</h2>
            <p className="text-xl text-gray-600">Our impact and reach across the region</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Schools Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Academic Excellence
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Five Comprehensive Academic Schools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              UEAB offers diverse programs across five schools, each committed to academic excellence and practical application.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schools.map((school, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group border border-gray-200">
                <div className={`h-2 bg-gradient-to-r ${school.color}`}></div>
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gray-100 rounded-xl mr-4">
                      <school.icon className="h-8 w-8 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{school.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">{school.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 mb-2">Programs Offered:</h4>
                    {school.programs.map((program, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <FaCheckCircle className="h-4 w-4 text-primary-600" />
                        <span className="text-sm text-gray-700">{program}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Director's Message Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {/* Placeholder for Director's image */}
              <div className="bg-gradient-to-br from-gold-100 to-primary-100 rounded-2xl p-8 text-center border-2 border-dashed border-gold-300">
                <FaGraduationCap className="h-32 w-32 text-gold-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Director of ODel</h3>
                <p className="text-gray-600 mb-4">Director's photo will be displayed here</p>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 italic">"Welcome to UEAB's Open Distance eLearning platform..."</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Message from the Director
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Welcome to UEAB <span className="bg-gradient-to-r from-primary-600 to-gold-500 bg-clip-text text-transparent">ODeL</span>
              </h2>
              
              <blockquote className="text-lg text-gray-600 mb-8 leading-relaxed italic border-l-4 border-gold-500 pl-6">
                "Welcome to the University of Eastern Africa, Baraton's Open Distance eLearning platform. 
                We are committed to providing quality education that is accessible, flexible, and internationally recognized. 
                Our ODeL platform brings together the best of traditional academic excellence with modern technology, 
                ensuring that students can achieve their educational goals regardless of their location or schedule constraints."
              </blockquote>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Dr. [Director's Name]</h4>
                  <p className="text-gray-600">Director of Open Distance eLearning</p>
                  <p className="text-gray-600">University of Eastern Africa, Baraton</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Our Values
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values guide everything we do at UEAB and shape our commitment to excellence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Our Location
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Visit UEAB Campus
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Located in the heart of Eldoret, Kenya, UEAB offers a beautiful campus environment 
                with modern facilities and a welcoming community atmosphere.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <FaMapMarkerAlt className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600">P.O. Box 2500, 30100 Eldoret, Kenya</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <FaPhone className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">+254 714 333 111 / +254 781 333 777</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <FaEnvelope className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">info@ueab.ac.ke</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link href="/contact" className="btn-primary inline-flex items-center group">
                  <FaMapMarkerAlt className="mr-2 group-hover:scale-110 transition-transform" />
                  Get Directions
                </Link>
              </div>
            </div>
            
            <div className="relative">
              {/* Placeholder for campus map */}
              <div className="bg-gradient-to-br from-primary-100 to-gold-100 rounded-2xl p-8 text-center border-2 border-dashed border-primary-300">
                <FaMapMarkerAlt className="h-24 w-24 text-primary-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Campus Map</h3>
                <p className="text-gray-600 mb-4">Interactive campus map will be displayed here</p>
                <p className="text-sm text-gray-500">📍 Eldoret, Kenya</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-gold-500/20 text-gold-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🚀 Join Our Community
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Academic Journey?
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of students who have chosen UEAB for their education. 
            Apply today and become part of our diverse, dynamic community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-gold inline-flex items-center group">
              <FaRocket className="mr-2 group-hover:scale-110 transition-transform" />
              Apply Now
            </Link>
            <Link href="/courses" className="btn-outline-white inline-flex items-center group">
              <FaBook className="mr-2 group-hover:rotate-12 transition-transform" />
              Explore Programs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
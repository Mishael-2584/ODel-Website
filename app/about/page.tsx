'use client'

import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaUniversity, FaGlobe, FaUsers, FaAward, FaGraduationCap, FaBook,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaBuilding, FaMicroscope,
  FaStethoscope, FaChalkboardTeacher, FaHeart, FaLightbulb,
  FaRocket, FaStar, FaCheckCircle, FaArrowRight, FaPlay, FaCogs
} from 'react-icons/fa'

export default function AboutPage() {
  const schools = [
    {
      icon: FaBuilding,
      title: 'School of Business and Technology',
      description: 'Business administration, information technology, and electronics programs.',
      programs: ['BBA Marketing', 'MBA Finance', 'BBIT', 'BSc Electronics Technology'],
      color: 'from-blue-500 to-blue-700'
    },
    {
      icon: FaChalkboardTeacher,
      title: 'School of Education, Arts and Humanities',
      description: 'Teacher education, journalism, theology, and humanities programs.',
      programs: ['B.Ed Science/Arts', 'M.Ed Curriculum', 'BA Journalism', 'BA Theology'],
      color: 'from-green-500 to-green-700'
    },
    {
      icon: FaStethoscope,
      title: 'School of Health Sciences',
      description: 'Nursing, public health, and medical laboratory sciences programs.',
      programs: ['BSc Nursing', 'MPH', 'BSc Public Health', 'BSc Medical Lab Sciences'],
      color: 'from-red-500 to-red-700'
    },
    {
      icon: FaMicroscope,
      title: 'School of Sciences',
      description: 'Mathematics, chemistry, biology, and environmental sciences programs.',
      programs: ['BSc Mathematics', 'BSc Chemistry', 'BSc Biology', 'BSc Environmental Conservation'],
      color: 'from-purple-500 to-purple-700'
    },
    {
      icon: FaGraduationCap,
      title: 'School of Agriculture and Hospitality',
      description: 'Agriculture, agribusiness, hospitality, and nutrition programs.',
      programs: ['BSc Agriculture', 'BSc Agribusiness', 'BSc Hospitality Management', 'BSc Nutrition'],
      color: 'from-gold-500 to-gold-700'
    }
  ]

  const values = [
    {
      icon: FaHeart,
      title: 'Excellence',
      description: 'Committed to academic excellence and continuous improvement in all our ODeL programs.'
    },
    {
      icon: FaGlobe,
      title: 'Accessibility',
      description: 'Making quality education accessible to students regardless of location or circumstances.'
    },
    {
      icon: FaLightbulb,
      title: 'Innovation',
      description: 'Embracing cutting-edge technology and innovative teaching methodologies in distance learning.'
    },
    {
      icon: FaStar,
      title: 'Integrity',
      description: 'Maintaining the highest standards of academic integrity and Seventh-day Adventist values.'
    }
  ]

  const stats = [
    { value: '5,000+', label: 'Active Students', icon: FaUsers },
    { value: '50+', label: 'Academic Programs', icon: FaBook },
    { value: '10+', label: 'Nationalities', icon: FaGlobe },
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
              UEAB <span className="text-gold-400">ODeL Center</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              The Open Distance eLearning Center at University of Eastern Africa, Baraton - 
              pioneering innovative online education delivery across East Africa and beyond. 
              Transforming lives through accessible, flexible, and quality higher education.
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
                About ODeL Center
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                UEAB Open Distance eLearning Center
              </h2>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                The UEAB Open Distance eLearning Center is the dedicated unit responsible for delivering 
                innovative online education across all academic programs. Established to expand access to 
                quality higher education, our ODeL Center combines cutting-edge technology with proven 
                pedagogical approaches to create an engaging and effective learning environment.
              </p>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our center operates as an integral part of the University of Eastern Africa, Baraton, 
                leveraging the institution's academic excellence while pioneering new methods of education 
                delivery. We serve students across East Africa and beyond, breaking down geographical and 
                temporal barriers to higher education while maintaining the highest standards of academic rigor.
              </p>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                The ODeL Center is committed to providing comprehensive support services including academic 
                advising, technical assistance, library resources, and student services. Our dedicated team 
                of instructional designers, technologists, and academic support staff work collaboratively 
                to ensure every student receives the support they need to succeed in their online learning journey.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">CUE Accredited Programs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">SDA Accrediting Association</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">PhD Qualified Faculty</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">Advanced Learning Management System</span>
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
              {/* Director's Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/images/directors/director.jpg"
                  alt="Dr. Meshack Misoi - Director of UEAB ODeL"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Dr. Meshack Misoi</h3>
                  <p className="text-lg opacity-90">Director of ODeL</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Message from the Director
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Welcome to UEAB <span className="bg-gradient-to-r from-primary-600 to-gold-500 bg-clip-text text-transparent">ODeL Center</span>
              </h2>
              
              <blockquote className="text-lg text-gray-600 mb-8 leading-relaxed italic border-l-4 border-gold-500 pl-6">
                "Welcome to the UEAB Open Distance eLearning Center, where we are revolutionizing higher education 
                through innovative online delivery. Our ODeL Center is dedicated to providing accessible, flexible, 
                and quality education that transcends geographical boundaries while maintaining the highest academic 
                standards. Through cutting-edge technology and personalized support, we empower learners to achieve 
                their educational goals and contribute meaningfully to society."
              </blockquote>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Dr. Meshack Misoi</h4>
                  <p className="text-gray-600">Director of Open Distance eLearning</p>
                  <p className="text-gray-600">University of Eastern Africa, Baraton</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Our Purpose
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Mission, Vision & Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our foundational principles that guide our commitment to excellence in Open Distance eLearning.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200">
              <div className="flex items-center mb-6">
                <div className="bg-primary-600 p-3 rounded-xl mr-4">
                  <FaRocket className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To provide accessible, quality higher education through innovative Open Distance eLearning 
                that empowers students across East Africa and beyond to achieve their academic and professional 
                goals while fostering spiritual growth and service to humanity.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-8 border border-gold-200">
              <div className="flex items-center mb-6">
                <div className="bg-gold-600 p-3 rounded-xl mr-4">
                  <FaLightbulb className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To be the leading Open Distance eLearning platform in East Africa, recognized for excellence 
                in education delivery, technological innovation, and the development of well-rounded graduates 
                who make meaningful contributions to society.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Organizational Structure Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Organizational Structure
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              ODeL Center Leadership & Structure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our dedicated team structure ensures effective delivery of online education and comprehensive student support.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-200">
            {/* Top Level - University Governance */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-2xl p-4 shadow-xl">
                <h3 className="text-lg font-bold">University Council</h3>
              </div>
            </div>
            
            {/* Second Level - University Senate */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-2xl p-4 shadow-lg">
                <h3 className="text-lg font-bold">University Senate</h3>
              </div>
            </div>
            
            {/* Third Level - Committees */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl p-4 shadow-lg">
                  <h4 className="text-lg font-bold">ODeL Committee</h4>
                  <p className="text-primary-200 text-sm">Policy & Strategy</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-4 shadow-lg">
                  <h4 className="text-lg font-bold">Academic Standards Committee</h4>
                  <p className="text-blue-200 text-sm">Quality Assurance</p>
                </div>
              </div>
            </div>
            
            {/* Fourth Level - Director */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-gold-600 to-gold-700 text-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-center mb-3">
                  <FaGraduationCap className="h-8 w-8 text-gold-200 mr-3" />
                  <h3 className="text-xl font-bold">Dr. Meshack Misoi</h3>
                </div>
                <p className="text-gold-200">Director of ODeL</p>
              </div>
            </div>
            
            {/* Fifth Level - Core Team */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-dashed border-gray-300">
                  <FaChalkboardTeacher className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                  <h5 className="font-semibold text-gray-900 text-sm">Subject Matter Experts</h5>
                  <p className="text-gray-600 text-xs">Content Creators</p>
                  <p className="text-gray-400 text-xs mt-1">(Consultant)</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-primary-200">
                  <FaBook className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-gray-900 text-sm">Instructional Designer</h5>
                  <p className="text-gray-600 text-xs">Course Development</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-green-200">
                  <FaMicroscope className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-gray-900 text-sm">Media Assistant</h5>
                  <p className="text-gray-600 text-xs">Content Production</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-purple-200">
                  <FaUsers className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-gray-900 text-sm">Felix Chepsiror</h5>
                  <p className="text-gray-600 text-xs">E-learning Coordinator</p>
                </div>
              </div>
            </div>
            
            {/* Sixth Level - Support */}
            <div className="text-center">
              <div className="inline-block bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4 border border-orange-300">
                <FaAward className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                <h5 className="font-semibold text-gray-900 text-sm">Brian Lelei</h5>
                <p className="text-gray-600 text-xs">E-learning Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Major Milestones Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Our Journey
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Major Milestones in Our <span className="bg-gradient-to-r from-primary-600 to-gold-500 bg-clip-text text-transparent">Online Learning Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key achievements that have shaped UEAB's transformation into a leading Open Distance eLearning institution.
            </p>
          </div>
          
          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-500 via-gold-500 to-primary-500 rounded-full"></div>
            
            <div className="space-y-16">
              {/* Milestone 1 */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 group">
                    <div className="flex items-center justify-end mb-4">
                      <div className="bg-primary-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                        <FaBuilding className="h-8 w-8 text-primary-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Establishment of the Directorate</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      The ODeL Directorate was officially established, marking the beginning of UEAB's 
                      comprehensive online learning transformation and strategic direction.
                    </p>
                    <div className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold">
                      2021
                    </div>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                
                <div className="w-1/2 pl-8"></div>
              </div>
              
              {/* Milestone 2 */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8"></div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gold-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                
                <div className="w-1/2 pl-8">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 group">
                    <div className="flex items-center mb-4">
                      <div className="bg-gold-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                        <FaGraduationCap className="h-8 w-8 text-gold-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Opening of the E-learning Centre Building</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      State-of-the-art E-learning Centre Building opened, providing dedicated infrastructure 
                      and modern facilities for online education delivery.
                    </p>
                    <div className="inline-flex items-center bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-sm font-semibold">
                      2022
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Milestone 3 */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 group">
                    <div className="flex items-center justify-end mb-4">
                      <div className="bg-green-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                        <FaAward className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Provisional CUE Accreditation</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Achieved provisional accreditation of the ODeL centre by the Commission for University Education (CUE), 
                      validating our commitment to quality online education standards.
                    </p>
                    <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      2022
                    </div>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                
                <div className="w-1/2 pl-8"></div>
              </div>
              
              {/* Milestone 4 */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8"></div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                
                <div className="w-1/2 pl-8">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 group">
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                        <FaCogs className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">LMS Integration with UMIS & iCampus</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Successfully integrated Learning Management System with University Management Information System (UMIS) 
                      and iCampus, streamlining course registration and enrollment processes for seamless student experience.
                    </p>
                    <div className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Ongoing
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Future Vision */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-primary-50 to-gold-50 rounded-2xl p-8 border border-primary-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Looking Forward</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                These milestones represent just the beginning of our journey. We continue to innovate and expand 
                our online learning capabilities, ensuring UEAB remains at the forefront of digital education in Kenya and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Our Values
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values guide everything we do at the ODeL Center and shape our commitment to excellence.
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
            Ready to Start Your ODeL Journey?
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of students who have chosen UEAB ODeL Center for their online education. 
            Experience flexible learning that fits your schedule and location.
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
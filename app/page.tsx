'use client'

import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NewsSection from '@/components/NewsSection'
import EventsSection from '@/components/EventsSection'
import BlendedLearningSection from '@/components/BlendedLearningSection'
import { 
  FaBook, FaUsers, FaCertificate, FaLaptop, FaChartLine, FaGlobe,
  FaPlay, FaClock, FaStar, FaArrowRight, FaGraduationCap, FaAward,
  FaUserGraduate, FaChalkboardTeacher, FaVideo, FaTrophy, FaFire,
  FaCheckCircle, FaRocket, FaMedal, FaLightbulb, FaCalendarAlt, FaBolt,
  FaBookOpen, FaUserPlus, FaUniversity, FaBuilding, FaMicroscope, FaStethoscope,
  FaMapMarkerAlt, FaPhone, FaEnvelope
} from 'react-icons/fa'

export default function Home() {
  const schools = [
    {
      icon: FaBuilding,
      title: 'School of Business',
      description: 'Comprehensive business education with programs in management, accounting, and information systems.',
      color: 'from-blue-500 to-blue-700',
      iconBg: 'bg-blue-500',
      programs: ['BBA Marketing', 'BBA Accounting', 'MBA Finance', 'BBIT']
    },
    {
      icon: FaBook,
      title: 'School of Education, Humanities and Social Sciences',
      description: 'Education, humanities, and social sciences programs preparing educators and professionals.',
      color: 'from-green-500 to-green-700',
      iconBg: 'bg-green-500',
      programs: ['B.Ed Science', 'B.Ed Arts', 'BA Journalism', 'BA Psychology']
    },
    {
      icon: FaStethoscope,
      title: 'School of Health Sciences & Nursing',
      description: 'Health sciences and nursing programs including nursing, public health, and medical laboratory sciences.',
      color: 'from-red-500 to-red-700',
      iconBg: 'bg-red-500',
      programs: ['BSc Nursing', 'MPH', 'BSc Public Health', 'BSc Medical Lab']
    },
    {
      icon: FaMicroscope,
      title: 'School of Science and Technology',
      description: 'Science and technology programs including engineering, applied sciences, and natural sciences.',
      color: 'from-purple-500 to-purple-700',
      iconBg: 'bg-purple-500',
      programs: ['BSc Mathematics', 'BSc Chemistry', 'BSc Biology', 'BSc Agriculture']
    },
    {
      icon: FaGraduationCap,
      title: 'School of Graduate Studies and Research',
      description: 'Advanced graduate and research programs across all disciplines.',
      color: 'from-orange-500 to-orange-700',
      iconBg: 'bg-orange-500',
      programs: ['Master Programs', 'PhD Programs', 'Research Degrees', 'Advanced Studies']
    }
  ]

  const features = [
    {
      icon: FaVideo,
      title: 'Interactive Video Lectures',
      description: 'HD video content with subtitles, playback speed control, and downloadable resources for flexible learning.',
      color: 'from-gold-500 to-gold-600',
      iconBg: 'bg-gold-500'
    },
    {
      icon: FaChalkboardTeacher,
      title: 'Expert Faculty',
      description: 'Learn from PhD holders and industry professionals with years of teaching and research experience.',
      color: 'from-primary-500 to-primary-700',
      iconBg: 'bg-primary-500'
    },
    {
      icon: FaCertificate,
      title: 'Accredited Programs',
      description: 'All programs are accredited and internationally recognized, ensuring quality education standards.',
      color: 'from-accent-purple to-purple-600',
      iconBg: 'bg-accent-purple'
    },
    {
      icon: FaUsers,
      title: 'Collaborative Learning',
      description: 'Join study groups, forums, and live Q&A sessions with peers from across the region.',
      color: 'from-accent-cyan to-blue-500',
      iconBg: 'bg-accent-cyan'
    },
    {
      icon: FaLaptop,
      title: 'Flexible Learning',
      description: 'Study at your own pace with 24/7 access to course materials and resources.',
      color: 'from-accent-green to-green-600',
      iconBg: 'bg-accent-green'
    },
    {
      icon: FaChartLine,
      title: 'Progress Tracking',
      description: 'Detailed insights into your learning progress with personalized recommendations.',
      color: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500'
    }
  ]

  const stats = [
    { icon: FaUserGraduate, value: '5,000+', label: 'Active Students', color: 'text-primary-600' },
    { icon: FaBook, value: '50+', label: 'Academic Programs', color: 'text-gold-600' },
    { icon: FaGlobe, value: '10+', label: 'Nationalities', color: 'text-accent-cyan' },
    { icon: FaAward, value: '95%', label: 'Graduate Success Rate', color: 'text-accent-green' }
  ]

  const popularPrograms = [
    {
      title: 'Bachelor of Business Administration',
      school: 'School of Business',
      students: 450,
      rating: 4.8,
      duration: '4 years',
      level: 'Undergraduate',
      image: '🏢',
      credits: 120,
      badge: 'Most Popular'
    },
    {
      title: 'Bachelor of Science in Nursing',
      school: 'School of Health Sciences & Nursing',
      students: 380,
      rating: 4.9,
      duration: '4 years',
      level: 'Undergraduate',
      image: '🏥',
      credits: 120,
      badge: 'High Demand'
    },
    {
      title: 'Bachelor of Education (Science)',
      school: 'School of Education, Arts and Humanities',
      students: 320,
      rating: 4.7,
      duration: '4 years',
      level: 'Undergraduate',
      image: '📚',
      credits: 120,
      badge: 'Professional'
    },
    {
      title: 'Master of Business Administration',
      school: 'School of Business',
      students: 180,
      rating: 4.8,
      duration: '2 years',
      level: 'Graduate',
      image: '💼',
      credits: 60,
      badge: 'Executive'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Banner Section with ODeL Building Background */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/campus/ODeLbuilding.jpg"
            alt="UEAB ODeL Building"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/85 via-primary-800/75 to-primary-900/85"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        </div>
        
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full">
          <div className="text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center bg-gold-500/25 backdrop-blur-sm border border-gold-500/40 rounded-full px-6 py-3 mb-8 shadow-lg">
              <span className="text-gold-200 text-sm font-semibold">🎓 Premier Open Distance eLearning Platform</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 lg:mb-8 leading-tight">
              Transform Your Future with <span className="text-gold-300 bg-gradient-to-r from-gold-300 to-gold-200 bg-clip-text text-transparent animate-pulse">UEAB ODeL</span>
            </h1>
            
            {/* Description */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 mb-8 lg:mb-10 max-w-5xl mx-auto leading-relaxed">
              Join the University of Eastern Africa, Baraton's premier Open Distance eLearning platform. 
              Experience flexible, accessible, and quality education that empowers you to learn from anywhere, 
              at your own pace, with internationally recognized programs across five comprehensive academic schools.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center mb-10 lg:mb-12">
              <Link href="/login" className="btn-gold inline-flex items-center justify-center group text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 shadow-xl hover:shadow-2xl transition-all">
                <FaRocket className="mr-3 group-hover:rotate-12 transition-transform" />
                Get Started Today
              </Link>
              <Link href="/courses" className="btn-outline-white inline-flex items-center justify-center group text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 shadow-xl hover:shadow-2xl transition-all">
                <FaPlay className="mr-3 group-hover:scale-110 transition-transform" />
                Explore Programs
              </Link>
            </div>
            
            {/* Achievement Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-6xl mx-auto mb-10">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 lg:px-6 py-4 lg:py-5 border border-white/25 hover:bg-white/25 transition-all duration-300 group cursor-pointer shadow-lg">
                <div className="flex flex-col items-center space-y-2">
                  <FaTrophy className="h-6 lg:h-8 w-6 lg:w-8 text-gold-300 group-hover:animate-bounce" />
                  <div className="text-center">
                    <p className="font-semibold text-white group-hover:text-gold-200 transition-colors text-sm lg:text-base">Accredited Programs</p>
                    <p className="text-xs lg:text-sm text-gray-200">Internationally Recognized</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 lg:px-6 py-4 lg:py-5 border border-white/25 hover:bg-white/25 transition-all duration-300 group cursor-pointer shadow-lg">
                <div className="flex flex-col items-center space-y-2">
                  <FaUniversity className="h-6 lg:h-8 w-6 lg:w-8 text-gold-300 group-hover:animate-bounce" />
                  <div className="text-center">
                    <p className="font-semibold text-white group-hover:text-gold-200 transition-colors text-sm lg:text-base">Five Academic Schools</p>
                    <p className="text-xs lg:text-sm text-gray-200">Comprehensive Programs</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 lg:px-6 py-4 lg:py-5 border border-white/25 hover:bg-white/25 transition-all duration-300 group cursor-pointer shadow-lg">
                <div className="flex flex-col items-center space-y-2">
                  <FaGraduationCap className="h-6 lg:h-8 w-6 lg:w-8 text-gold-300 group-hover:animate-bounce" />
                  <div className="text-center">
                    <p className="font-semibold text-white group-hover:text-gold-200 transition-colors text-sm lg:text-base">Bachelor's to PhD</p>
                    <p className="text-xs lg:text-sm text-gray-200">Complete Academic Journey</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 lg:px-6 py-4 lg:py-5 border border-white/25 hover:bg-white/25 transition-all duration-300 group cursor-pointer shadow-lg">
                <div className="flex flex-col items-center space-y-2">
                  <FaChalkboardTeacher className="h-6 lg:h-8 w-6 lg:w-8 text-gold-300 group-hover:animate-bounce" />
                  <div className="text-center">
                    <p className="font-semibold text-white group-hover:text-gold-200 transition-colors text-sm lg:text-base">Expert Faculty</p>
                    <p className="text-xs lg:text-sm text-gray-200">PhD Holders & Professionals</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Live Stats Card */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/25 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-white/80 text-sm font-medium">✨ Live Now</span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center hover:bg-white/15 transition-all">
                    <div className="flex flex-col items-center space-y-2">
                      <FaUserGraduate className="h-5 lg:h-6 w-5 lg:w-6 text-gold-300" />
                      <span className="text-white font-semibold text-xs lg:text-sm">Active Learners</span>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold text-white mt-2">5,000+</p>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center hover:bg-white/15 transition-all">
                    <div className="flex flex-col items-center space-y-2">
                      <FaCertificate className="h-5 lg:h-6 w-5 lg:w-6 text-gold-300" />
                      <span className="text-white font-semibold text-xs lg:text-sm">Graduates</span>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold text-white mt-2">5,000+</p>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center hover:bg-white/15 transition-all">
                    <div className="flex flex-col items-center space-y-2">
                      <FaStar className="h-5 lg:h-6 w-5 lg:w-6 text-gold-300" />
                      <span className="text-white font-semibold text-xs lg:text-sm">Student Satisfaction</span>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold text-white mt-2">4.8/5.0 ⭐</p>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center hover:bg-white/15 transition-all">
                    <div className="flex flex-col items-center space-y-2">
                      <FaGlobe className="h-5 lg:h-6 w-5 lg:w-6 text-gold-300" />
                      <span className="text-white font-semibold text-xs lg:text-sm">Countries</span>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold text-white mt-2">10+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-xl mb-4 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500 group-hover:rotate-6">
                  <stat.icon className={`h-10 w-10 ${stat.color} group-hover:animate-pulse`} />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">{stat.value}</h3>
                <p className="text-gray-600 font-medium group-hover:text-gray-800 transition-colors duration-300">{stat.label}</p>
                <div className="mt-4 h-1 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About UEAB Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                About UEAB
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pioneering Open Distance eLearning in East Africa
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                The University of Eastern Africa, Baraton (UEAB) is a leading Seventh-day Adventist institution committed to 
                providing quality education through innovative Open Distance eLearning (ODeL) programs. Our ODeL platform 
                combines academic excellence with technological innovation, making higher education accessible to students 
                across East Africa and beyond, regardless of geographical or time constraints.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">Commission for University Education Accredited</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">Seventh-day Adventist Accrediting Association</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">PhD Qualified Faculty</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">State-of-the-Art Learning Management System</span>
                </div>
              </div>
              
              <Link href="/about" className="btn-primary inline-flex items-center group">
                Learn More About UEAB
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="relative">
              {/* UEAB ODeL Building Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/images/campus/odelbuilding.jpg"
                  alt="UEAB ODeL Building"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">UEAB ODeL Building</h3>
                  <p className="text-lg opacity-90">State-of-the-art facility for online learning</p>
                  <p className="text-sm opacity-75 mt-1">📍 P.O. Box 2500, 30100 Eldoret, Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Schools Section */}
      <section className="py-20 bg-gray-50">
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
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2 border border-gray-100 hover:border-gray-200">
                <div className={`h-3 bg-gradient-to-r ${school.color} group-hover:h-4 transition-all duration-300`}></div>
                <div className="p-8 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    <school.icon className="h-20 w-20 text-gray-400" />
                  </div>
                  
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${school.iconBg} rounded-xl mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                    <school.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">{school.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">{school.description}</p>
                  
                  <div className="space-y-3">
                    {school.programs.map((program, idx) => (
                      <div key={idx} className="flex items-center space-x-3 group/program">
                        <FaCheckCircle className="h-5 w-5 text-primary-600 group-hover/program:animate-pulse" />
                        <span className="text-sm text-gray-700 group-hover/program:text-gray-900 group-hover/program:font-medium transition-all duration-300">{program}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 group-hover:border-primary-200 transition-colors duration-300">
                    <div className="flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700 transition-colors duration-300">
                      <span>Explore Programs</span>
                      <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Director's Message Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {/* Director's Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/images/directors/director.jpg"
                  alt="Dr. Meshack Misoi - Director of UEAB ODeL Center"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Dr. Meshack Misoi</h3>
                  <p className="text-lg opacity-90">Director of ODeL Center</p>
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
              
              <blockquote className="text-lg text-gray-600 mb-8 leading-relaxed italic border-l-4 border-gold-500 pl-6 relative">
                <div className="absolute -top-2 -left-2 text-4xl text-gold-400 opacity-50">"</div>
                "Welcome to the University of Eastern Africa, Baraton's Open Distance eLearning platform. 
                Our ODeL initiative represents our commitment to making quality higher education accessible to all, 
                breaking down geographical and temporal barriers. Through innovative technology and our Seventh-day Adventist 
                values of excellence, service, and integrity, we empower learners to achieve their academic and professional 
                aspirations while maintaining the highest standards of education."
                <div className="absolute -bottom-4 -right-2 text-4xl text-gold-400 opacity-50">"</div>
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

      {/* Blended Learning Section */}
      <BlendedLearningSection />

      {/* Popular Programs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🔥 Popular Programs
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Most Popular Academic Programs
              </h2>
              <p className="text-xl text-gray-600">Start learning with our top-rated programs</p>
            </div>
            <Link href="/programs" className="btn-outline-primary hidden lg:flex items-center">
              View All Programs
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {popularPrograms.map((program, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer hover:-translate-y-2 border border-gray-100 hover:border-primary-200 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-gold-50/0 group-hover:from-primary-50/30 group-hover:to-gold-50/30 transition-all duration-500"></div>
                <div className="p-8 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{program.image}</div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-semibold group-hover:bg-primary-200 transition-colors">
                            {program.badge}
                          </span>
                          <span className="text-gray-500 text-sm group-hover:text-gray-700 transition-colors">{program.school}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                          {program.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1 group/stats">
                      <FaUsers className="h-4 w-4 group-hover/stats:text-primary-600 transition-colors" />
                      <span className="group-hover/stats:font-semibold transition-all">{program.students}</span>
                    </div>
                    <div className="flex items-center space-x-1 group/stats">
                      <FaStar className="h-4 w-4 text-gold-500 group-hover/stats:animate-pulse" />
                      <span className="group-hover/stats:font-semibold transition-all">{program.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1 group/stats">
                      <FaClock className="h-4 w-4 group-hover/stats:text-primary-600 transition-colors" />
                      <span className="group-hover/stats:font-semibold transition-all">{program.duration}</span>
                    </div>
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-xs group-hover:bg-primary-100 group-hover:text-primary-800 transition-colors">{program.level}</span>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-gray-100 group-hover:border-primary-200 transition-colors duration-300">
                    <Link href="/programs" className="btn-primary text-sm group/link">
                      <span className="group-hover/link:underline">Learn More</span>
                      <FaArrowRight className="ml-2 group-hover/link:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <NewsSection />

      {/* Events Section */}
      <EventsSection />

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Contact Us
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Get in Touch with UEAB ODeL
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you have questions, feedback, or are ready to start your academic journey, 
                we are here to help. Reach out to us through our contact form or visit our campus.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">
                    P.O. Box 2500, 30100 Eldoret, Kenya
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="h-6 w-6 text-primary-600" />
                  <a href="tel:+254722000000" className="text-gray-700 font-medium hover:underline">
                    +254 722 000 000
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="h-6 w-6 text-primary-600" />
                  <a href="mailto:info@ueab.ac.ke" className="text-gray-700 font-medium hover:underline">
                    info@ueab.ac.ke
                  </a>
                </div>
              </div>
              
              <Link href="/contact" className="btn-primary inline-flex items-center group">
                Schedule a Consultation
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="relative">
              {/* Embedded Map */}
              <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.783174506244!2d35.27361!3d0.52056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17829d5d5d5d5d5d%3A0x5d5d5d5d5d5d5d5d!2sUniversity%20of%20Eastern%20Africa%20Baraton%20Main%20Campus!5e0!3m2!1sen!2ske!4v1729510800000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="UEAB Campus Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-gold-500/20 text-gold-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🚀 Start Your Academic Journey
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join UEAB ODeL today and gain access to world-class education. 
            Flexible learning, expert faculty, and internationally recognized programs await you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-gold inline-flex items-center group">
              <FaRocket className="mr-2 group-hover:scale-110 transition-transform" />
              Start Learning Today
            </Link>
            <Link href="/contact" className="btn-outline-white inline-flex items-center group">
              <FaCalendarAlt className="mr-2 group-hover:scale-110 transition-transform" />
              Schedule a Consultation
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
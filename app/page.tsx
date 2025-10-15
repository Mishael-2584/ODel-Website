'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaBook, FaUsers, FaCertificate, FaLaptop, FaChartLine, FaGlobe,
  FaPlay, FaClock, FaStar, FaArrowRight, FaGraduationCap, FaAward,
  FaUserGraduate, FaChalkboardTeacher, FaVideo, FaTrophy, FaFire,
  FaCheckCircle, FaRocket, FaMedal, FaLightbulb, FaCalendarAlt, FaBolt,
  FaBookOpen, FaUserPlus, FaUniversity, FaBuilding, FaMicroscope, FaStethoscope
} from 'react-icons/fa'

export default function Home() {
  const schools = [
    {
      icon: FaBuilding,
      title: 'School of Business',
      description: 'Comprehensive business programs from undergraduate to graduate levels with practical industry applications.',
      color: 'from-blue-500 to-blue-700',
      iconBg: 'bg-blue-500',
      programs: ['BBA', 'MBA', 'PhD in Business']
    },
    {
      icon: FaBook,
      title: 'School of Education, Humanities and Social Sciences',
      description: 'Teacher education and humanities programs preparing educators and social science professionals.',
      color: 'from-green-500 to-green-700',
      iconBg: 'bg-green-500',
      programs: ['B.Ed', 'M.Ed', 'PhD in Education']
    },
    {
      icon: FaStethoscope,
      title: 'School of Nursing and Health Sciences',
      description: 'Healthcare programs including nursing, nutrition, and public health with clinical training components.',
      color: 'from-red-500 to-red-700',
      iconBg: 'bg-red-500',
      programs: ['BSc Nursing', 'MSc Public Health', 'PhD in Health Sciences']
    },
    {
      icon: FaMicroscope,
      title: 'School of Science and Technology',
      description: 'STEM programs in computing, mathematics, chemistry, physics, and applied sciences.',
      color: 'from-purple-500 to-purple-700',
      iconBg: 'bg-purple-500',
      programs: ['BSc Computer Science', 'MSc IT', 'PhD in Technology']
    },
    {
      icon: FaGraduationCap,
      title: 'School of Graduate Studies and Research',
      description: 'Advanced research programs and doctoral studies across all disciplines.',
      color: 'from-gold-500 to-gold-700',
      iconBg: 'bg-gold-500',
      programs: ['Master\'s Programs', 'PhD Programs', 'Research Fellowships']
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
    { icon: FaUserGraduate, value: '10,000+', label: 'Active Students', color: 'text-primary-600' },
    { icon: FaBook, value: '200+', label: 'Academic Programs', color: 'text-gold-600' },
    { icon: FaGlobe, value: '40+', label: 'Nationalities', color: 'text-accent-cyan' },
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
      price: 'KES 180,000/year',
      instructor: 'Dr. Sarah Kimani',
      badge: 'Most Popular'
    },
    {
      title: 'Bachelor of Science in Computer Science',
      school: 'School of Science & Technology',
      students: 380,
      rating: 4.9,
      duration: '4 years',
      level: 'Undergraduate',
      image: '💻',
      credits: 120,
      price: 'KES 200,000/year',
      instructor: 'Prof. John Mwangi',
      badge: 'Trending'
    },
    {
      title: 'Bachelor of Science in Nursing',
      school: 'School of Nursing & Health Sciences',
      students: 320,
      rating: 4.7,
      duration: '4 years',
      level: 'Undergraduate',
      image: '🏥',
      credits: 120,
      price: 'KES 220,000/year',
      instructor: 'Dr. Mary Wanjiku',
      badge: 'High Demand'
    },
    {
      title: 'Master of Education',
      school: 'School of Education',
      students: 180,
      rating: 4.8,
      duration: '2 years',
      level: 'Graduate',
      image: '📚',
      credits: 60,
      price: 'KES 150,000/year',
      instructor: 'Prof. James Ochieng',
      badge: 'Professional'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center bg-gold-500/20 backdrop-blur-sm border border-gold-500/30 rounded-full px-4 py-2 mb-6">
                <span className="text-gold-300 text-sm font-semibold">🎓 Premier Open Distance eLearning Platform</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Transform Your Future with <span className="text-gold-400 bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent animate-pulse">UEAB ODeL</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Join the University of Eastern Africa, Baraton's cutting-edge Open Distance eLearning platform. 
                Access world-class education from anywhere, anytime with flexible learning options.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3 group hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="bg-gold-500/20 p-2 rounded-lg group-hover:bg-gold-500/30 transition-colors duration-300">
                    <FaTrophy className="h-6 w-6 text-gold-400 group-hover:animate-bounce" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-gold-300 transition-colors">Accredited Programs</p>
                    <p className="text-sm text-gray-300">Internationally Recognized</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 group hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="bg-gold-500/20 p-2 rounded-lg group-hover:bg-gold-500/30 transition-colors duration-300">
                    <FaUniversity className="h-6 w-6 text-gold-400 group-hover:animate-bounce" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-gold-300 transition-colors">Five Academic Schools</p>
                    <p className="text-sm text-gray-300">Comprehensive Programs</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 group hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="bg-gold-500/20 p-2 rounded-lg group-hover:bg-gold-500/30 transition-colors duration-300">
                    <FaGraduationCap className="h-6 w-6 text-gold-400 group-hover:animate-bounce" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-gold-300 transition-colors">Bachelor's to PhD</p>
                    <p className="text-sm text-gray-300">Complete Academic Journey</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 group hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="bg-gold-500/20 p-2 rounded-lg group-hover:bg-gold-500/30 transition-colors duration-300">
                    <FaChalkboardTeacher className="h-6 w-6 text-gold-400 group-hover:animate-bounce" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-gold-300 transition-colors">Expert Faculty</p>
                    <p className="text-sm text-gray-300">PhD Holders & Professionals</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses" className="btn-primary flex items-center justify-center group">
                  <FaBookOpen className="mr-2 group-hover:rotate-12 transition-transform" />
                  Explore Programs
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/register" className="btn-outline-gold flex items-center justify-center group">
                  <FaUserPlus className="mr-2 group-hover:scale-110 transition-transform" />
                  Start Your Journey
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-white/70 text-sm">✨ Live Now</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaUserGraduate className="h-6 w-6 text-gold-400" />
                      <span className="text-white font-semibold">Active Learners</span>
                    </div>
                    <p className="text-2xl font-bold text-white">10,000+</p>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaCertificate className="h-6 w-6 text-gold-400" />
                      <span className="text-white font-semibold">Graduates</span>
                    </div>
                    <p className="text-2xl font-bold text-white">5,000+</p>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaStar className="h-6 w-6 text-gold-400" />
                      <span className="text-white font-semibold">Student Satisfaction</span>
                    </div>
                    <p className="text-2xl font-bold text-white">4.8/5.0 ⭐</p>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaGlobe className="h-6 w-6 text-gold-400" />
                      <span className="text-white font-semibold">Countries</span>
                    </div>
                    <p className="text-2xl font-bold text-white">40+</p>
                  </div>
                </div>
              </div>
            </div>
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
                One of the Largest, Most Diverse Universities in Africa
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                At UEAB, we understand the importance of holistic education. In addition to our rigorous academic curriculum, 
                we offer vibrant campus life that promotes personal growth, cultural enrichment, and extracurricular engagement. 
                Our students have access to a wide range of clubs, organizations, and sports facilities.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
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
              
              <Link href="/about" className="btn-primary inline-flex items-center group">
                Learn More About UEAB
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="relative">
              {/* Placeholder for UEAB campus image */}
              <div className="bg-gradient-to-br from-primary-100 to-gold-100 rounded-2xl p-8 text-center border-2 border-dashed border-primary-300">
                <FaUniversity className="h-24 w-24 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">UEAB Campus</h3>
                <p className="text-gray-600">Beautiful campus images will be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">📍 P.O. Box 2500, 30100 Eldoret, Kenya</p>
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
              {/* Placeholder for Director's image */}
              <div className="bg-gradient-to-br from-gold-100 to-primary-100 rounded-2xl p-8 text-center border-2 border-dashed border-gold-300">
                <FaUserGraduate className="h-32 w-32 text-gold-400 mx-auto mb-4" />
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
              
              <blockquote className="text-lg text-gray-600 mb-8 leading-relaxed italic border-l-4 border-gold-500 pl-6 relative">
                <div className="absolute -top-2 -left-2 text-4xl text-gold-400 opacity-50">"</div>
                "Welcome to the University of Eastern Africa, Baraton's Open Distance eLearning platform. 
                We are committed to providing quality education that is accessible, flexible, and internationally recognized. 
                Our ODeL platform brings together the best of traditional academic excellence with modern technology, 
                ensuring that students can achieve their educational goals regardless of their location or schedule constraints."
                <div className="absolute -bottom-4 -right-2 text-4xl text-gold-400 opacity-50">"</div>
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

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Why Choose UEAB ODel
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Experience the Future of Learning
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technology meets world-class education
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 group hover:-translate-y-1 border border-gray-100 hover:border-primary-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-gold-50/0 group-hover:from-primary-50/50 group-hover:to-gold-50/50 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.iconBg} rounded-xl mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                    <feature.icon className="h-8 w-8 text-white group-hover:animate-pulse" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">{feature.description}</p>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 group-hover:border-primary-200 transition-colors duration-300">
                    <Link href="/courses" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold group/link">
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

      {/* Video Learning Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-accent-cyan/10 text-accent-cyan px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🎥 Interactive Learning
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Learn Through HD Video Lectures
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Access high-quality video content anytime, anywhere. Download for offline viewing and learn at your own pace 
                with our comprehensive video learning platform.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <FaPlay className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-gray-700 font-medium">HD Quality Video Streaming</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <FaLaptop className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Downloadable Content</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <FaBook className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Interactive Transcripts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <FaGlobe className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Multi-language Subtitles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <FaBolt className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Playback Speed Control</span>
                </div>
              </div>
              
              <Link href="/courses" className="btn-primary inline-flex items-center group">
                <FaPlay className="mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo Video
              </Link>
            </div>
            
            <div className="relative">
              {/* Placeholder for video player */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-center border-2 border-dashed border-gray-400">
                <FaVideo className="h-32 w-32 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Sample Lecture</h3>
                <p className="text-gray-300 mb-4">"Introduction to Business Administration"</p>
                <div className="bg-gray-700 rounded-lg p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Dr. Sarah Kimani</span>
                    <span className="text-gray-400">45:30</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaStar className="h-4 w-4 text-gold-400" />
                    <span className="text-white">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <Link href="/courses" className="btn-outline-primary hidden lg:flex items-center">
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
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-primary-200 transition-colors duration-300">
                    <div className="text-primary-600 font-bold group-hover:text-primary-700 transition-colors">{program.price}</div>
                    <Link href={`/courses/${index}`} className="btn-primary text-sm group/link">
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
'use client'

import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NewsSection from '@/components/NewsSection'
import EventsSection from '@/components/EventsSection'
import BlendedLearningSection from '@/components/BlendedLearningSection'
import LoadingSpinner, { CardSkeleton } from '@/components/LoadingSpinner'
import { 
  FaBook, FaUsers, FaCertificate, FaLaptop, FaChartLine, FaGlobe,
  FaPlay, FaClock, FaStar, FaArrowRight, FaGraduationCap, FaAward,
  FaUserGraduate, FaChalkboardTeacher, FaVideo, FaTrophy, FaFire,
  FaCheckCircle, FaRocket, FaMedal, FaLightbulb, FaCalendarAlt, FaBolt,
  FaBookOpen, FaUserPlus, FaUniversity, FaBuilding, FaMicroscope, FaStethoscope,
  FaMapMarkerAlt, FaPhone, FaEnvelope
} from 'react-icons/fa'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Simulate loading time for demonstration
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <LoadingSpinner 
          size="xl" 
          message="Loading UEAB ODeL Platform..." 
          fullScreen 
          variant="pulse"
        />
      </div>
    )
  }
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
      title: 'Expirienced Faculty',
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
      badge: 'In-Demand'
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
      badge: 'Top Rated'
    }
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Navbar />
      
      {/* Hero Banner Section with ODeL Building Background */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Floating Orbs */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-gold-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/campus/ODeLbuilding.jpg"
            alt="UEAB ODeL Building"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/85 via-primary-800/75 to-primary-900/85"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        </div>
        
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-4 md:pt-6 pb-24 sm:pb-20 md:pb-20 relative z-10 w-full mt-12">
          <motion.div 
            className="text-center text-white"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div 
              variants={staggerItem}
              className="inline-flex items-center bg-gold-500/25 backdrop-blur-sm border border-gold-500/40 rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 mb-2 sm:mb-4 md:mb-6 shadow-lg hover:bg-gold-500/35 transition-all duration-300"
            >
              <span className="text-gold-200 text-xs sm:text-sm md:text-base font-semibold">🎓 Premier Open Distance eLearning Platform</span>
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1 
              variants={staggerItem}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight px-2 sm:px-4 md:px-6"
            >
              Transform Your Future with <span className="text-gold-300 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 bg-clip-text text-transparent animate-pulse block sm:inline mt-1 sm:mt-0">UEAB ODeL</span>
            </motion.h1>
            
            {/* Description */}
            <motion.p 
              variants={staggerItem}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 mb-6 sm:mb-8 md:mb-10 max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6"
            >
              Join the University of Eastern Africa, Baraton's premier Open Distance eLearning platform. 
              Experience flexible, accessible, and quality education that empowers you to learn from anywhere, 
              at your own pace, with internationally recognized programs across five comprehensive academic schools.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center mb-8 sm:mb-10 md:mb-12 px-2 sm:px-4 md:px-6"
            >
              <Link href="/login" className="btn-gold inline-flex items-center justify-center group text-sm sm:text-base md:text-lg px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300">
                <FaRocket className="mr-2 sm:mr-3 group-hover:rotate-12 transition-transform" />
                Get Started Today
              </Link>
              <Link href="/courses" className="btn-outline-white inline-flex items-center justify-center group text-sm sm:text-base md:text-lg px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300">
                <FaPlay className="mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                Explore Programs
              </Link>
            </motion.div>
            
            {/* Achievement Badges */}
            <motion.div 
              variants={staggerItem}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto mb-8 sm:mb-10 md:mb-12 px-2 sm:px-4 md:px-6"
            >
              {[
                { icon: FaTrophy, title: 'Accredited Programs', desc: 'Internationally Recognized' },
                { icon: FaUniversity, title: 'Five Academic Schools', desc: 'Comprehensive Programs' },
                { icon: FaGraduationCap, title: 'Bachelor\'s to PhD', desc: 'Complete Academic Journey' },
                { icon: FaChalkboardTeacher, title: 'Expirienced Faculty', desc: 'PhD Holders & Professionals' }
              ].map((badge, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/15 backdrop-blur-sm rounded-xl px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 border border-white/25 hover:bg-white/25 transition-all duration-300 group cursor-pointer shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <badge.icon className="h-5 sm:h-6 md:h-8 w-5 sm:w-6 md:w-8 text-gold-300" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-semibold text-white group-hover:text-gold-200 transition-colors text-xs sm:text-sm md:text-base">{badge.title}</p>
                      <p className="text-xs sm:text-sm text-gray-200">{badge.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Live Stats Card */}
            <motion.div 
              variants={staggerItem}
              className="max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-2 sm:px-4 md:px-6"
            >
              <motion.div 
                className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 border border-white/25 shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <motion.div 
                      className="w-2 sm:w-3 h-2 sm:h-3 bg-red-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                      className="w-2 sm:w-3 h-2 sm:h-3 bg-yellow-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-2 sm:w-3 h-2 sm:h-3 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-white/80 text-xs sm:text-sm font-medium">✨ Live Now</span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {[
                    { icon: FaUserGraduate, label: 'Active Learners', value: '5,000+' },
                    { icon: FaCertificate, label: 'Graduates', value: '15,000+' },
                    { icon: FaStar, label: 'Student Satisfaction', value: '4.8/5.0 ⭐' },
                    { icon: FaGlobe, label: 'Countries', value: '10+' }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      className="bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm text-center hover:bg-white/15 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <stat.icon className="h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 text-gold-300" />
                        </motion.div>
                        <span className="text-white font-semibold text-xs sm:text-sm">{stat.label}</span>
                      </div>
                      <motion.p 
                        className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-1 sm:mt-2"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                      >
                        {stat.value}
                      </motion.p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-3 bg-white/80 rounded-full mt-2"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                variants={staggerItem}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1, y: -10 }}
                className="text-center group cursor-pointer bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-xl mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="h-10 w-10 text-white" />
                </motion.div>
                <motion.h3 
                  className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-gold-600 bg-clip-text text-transparent mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
                <motion.div 
                  className="mt-4 h-1 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* About UEAB Section */}
      <motion.section 
        className="py-20 bg-white relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <motion.div 
                variants={staggerItem}
                className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300"
              >
                About UEAB
              </motion.div>
              
              <motion.h2 
                variants={staggerItem}
                className="text-4xl font-bold text-gray-900 mb-6"
              >
                Pioneering Open Distance eLearning in East and Central Africa
              </motion.h2>
              
              <motion.p 
                variants={staggerItem}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                The University of Eastern Africa, Baraton (UEAB) is a leading Seventh-day Adventist institution committed to 
                providing quality education through innovative Open Distance eLearning (ODeL) programs. Our ODeL platform 
                combines academic excellence with technological innovation, making higher education accessible to students 
                across East and Central Africa and beyond, regardless of geographical or time constraints.
              </motion.p>
              
              <motion.div 
                variants={staggerItem}
                className="grid grid-cols-2 gap-6 mb-8"
              >
                {[
                  'Commission for University Education Accredited',
                  'AAA Accrediting Association',
                  'PhD Qualified Faculty',
                  'State-of-the-Art Learning Management System'
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <FaCheckCircle className="h-6 w-6 text-primary-600" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div variants={staggerItem}>
                <Link href="/about" className="btn-primary inline-flex items-center group hover:scale-105 transition-transform duration-300">
                  Learn More About UEAB
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={fadeInRight}
            >
              {/* UEAB ODeL Building Image */}
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/images/campus/ODeLbuilding.jpg"
                  alt="UEAB ODeL Building"
                  width={800}
                  height={320}
                  className="w-full h-80 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">UEAB ODeL Center</h3>
                  <p className="text-lg opacity-90">State-of-the-art facility for online learning</p>
                  <p className="text-sm opacity-75 mt-1">📍 P.O. Box 2500, 30100 Eldoret, Kenya</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Academic Schools Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={staggerItem}
          >
            <motion.div 
              variants={staggerItem}
              className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300"
            >
              Academic Excellence
            </motion.div>
            <motion.h2 
              variants={staggerItem}
              className="text-4xl font-bold text-gray-900 mb-6"
            >
              Five Comprehensive Academic Schools
            </motion.h2>
            <motion.p 
              variants={staggerItem}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              UEAB offers diverse programs across five schools, each committed to academic excellence and practical application.
            </motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schools.map((school, index) => (
              <motion.div 
                key={index} 
                variants={staggerItem}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 relative"
              >
                <motion.div 
                  className={`h-3 bg-gradient-to-r ${school.color}`}
                  whileHover={{ height: "8px" }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
                <div className="p-8 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    <school.icon className="h-20 w-20 text-gray-400" />
                  </div>
                  
                  <motion.div 
                    className={`inline-flex items-center justify-center w-16 h-16 ${school.iconBg} rounded-xl mb-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <school.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">{school.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">{school.description}</p>
                  
                  <div className="space-y-3">
                    {school.programs.map((program, idx) => (
                      <motion.div 
                        key={idx} 
                        className="flex items-center space-x-3 group/program"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <FaCheckCircle className="h-5 w-5 text-primary-600 group-hover/program:animate-pulse" />
                        <span className="text-sm text-gray-700 group-hover/program:text-gray-900 group-hover/program:font-medium transition-all duration-300">{program}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 group-hover:border-primary-200 transition-colors duration-300">
                    <div className="flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700 transition-colors duration-300">
                      <span>Explore Programs</span>
                      <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Director's Message Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="relative"
              variants={fadeInLeft}
            >
              {/* Director's Image */}
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            </motion.div>
            
            <motion.div variants={fadeInRight}>
              <motion.div 
                variants={staggerItem}
                className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300"
              >
                Message from the Director
              </motion.div>
              
              <motion.h2 
                variants={staggerItem}
                className="text-4xl font-bold text-gray-900 mb-6"
              >
                Welcome to UEAB <span className="bg-gradient-to-r from-primary-600 to-gold-500 bg-clip-text text-transparent">ODeL</span>
              </motion.h2>
              
              <motion.blockquote 
                variants={staggerItem}
                className="text-lg text-gray-600 mb-8 leading-relaxed italic border-l-4 border-gold-500 pl-6 relative"
              >
                <motion.span
                  className="absolute -top-2 -left-2 text-4xl text-gold-400 opacity-50"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.5 }}
                  viewport={{ once: true }}
                >
                  "
                </motion.span>
                Welcome to the University of Eastern Africa, Baraton's Open Distance eLearning platform. 
                Our ODeL initiative represents our commitment to making quality higher education accessible to all, 
                breaking down geographical and temporal barriers. Through innovative technology and our Seventh-day Adventist 
                values of excellence, service, and integrity, we empower learners to achieve their academic and professional 
                aspirations while maintaining the highest standards of education.
                <motion.span
                  className="absolute -bottom-4 -right-2 text-4xl text-gold-400 opacity-50"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.5 }}
                  viewport={{ once: true }}
                >
                  "
                </motion.span>
              </motion.blockquote>
              
              <motion.div 
                variants={staggerItem}
                className="flex items-center space-x-4"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Dr. Meshack Misoi</h4>
                  <p className="text-gray-600">Director of Open Distance eLearning</p>
                  <p className="text-gray-600">University of Eastern Africa, Baraton</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Blended Learning Section */}
      <BlendedLearningSection />

      {/* Popular Programs Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="flex justify-between items-center mb-12"
            variants={staggerItem}
          >
            <div>
              <motion.div 
                variants={staggerItem}
                className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-4 hover:scale-105 transition-transform duration-300"
              >
                🔥 Popular Programs
              </motion.div>
              <motion.h2 
                variants={staggerItem}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                Most Popular Academic Programs
              </motion.h2>
              <motion.p 
                variants={staggerItem}
                className="text-xl text-gray-600"
              >
                Start learning with our top-rated programs
              </motion.p>
            </div>
            <motion.div variants={staggerItem}>
              <Link href="/programs" className="btn-outline-primary hidden lg:flex items-center hover:scale-105 transition-transform duration-300">
                View All Programs
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {popularPrograms.map((program, index) => (
              <motion.div 
                key={index} 
                variants={staggerItem}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 hover:border-primary-200 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-gold-50/0 group-hover:from-primary-50/30 group-hover:to-gold-50/30 transition-all duration-500"></div>
                <div className="p-8 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className="text-4xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {program.image}
                      </motion.div>
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
                    <motion.div 
                      className="flex items-center space-x-1 group/stats"
                      whileHover={{ scale: 1.1 }}
                    >
                      <FaUsers className="h-4 w-4 group-hover/stats:text-primary-600 transition-colors" />
                      <span className="group-hover/stats:font-semibold transition-all">{program.students}</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center space-x-1 group/stats"
                      whileHover={{ scale: 1.1 }}
                    >
                      <FaStar className="h-4 w-4 text-gold-500 group-hover/stats:animate-pulse" />
                      <span className="group-hover/stats:font-semibold transition-all">{program.rating}</span>
                    </motion.div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1 group/stats">
                      <FaClock className="h-4 w-4 group-hover/stats:text-primary-600 transition-colors" />
                      <span className="group-hover/stats:font-semibold transition-all">{program.duration}</span>
                    </div>
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-xs group-hover:bg-primary-100 group-hover:text-primary-800 transition-colors">{program.level}</span>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-gray-100 group-hover:border-primary-200 transition-colors duration-300">
                    <Link href="/programs" className="btn-primary text-sm group/link hover:scale-105 transition-transform duration-300">
                      <span className="group-hover/link:underline">Learn More</span>
                      <FaArrowRight className="ml-2 group-hover/link:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* News Section */}
      <NewsSection />

      {/* Events Section */}
      <EventsSection />

      {/* Contact Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <motion.div 
                variants={staggerItem}
                className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300"
              >
                Contact Us
              </motion.div>
              
              <motion.h2 
                variants={staggerItem}
                className="text-4xl font-bold text-gray-900 mb-6"
              >
                Get in Touch with UEAB ODeL
              </motion.h2>
              
              <motion.p 
                variants={staggerItem}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                Whether you have questions, feedback, or are ready to start your academic journey, 
                we are here to help. Reach out to us through our contact form or visit our campus.
              </motion.p>
              
              <motion.div 
                variants={staggerItem}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
              >
                {[
                  { icon: FaMapMarkerAlt, text: 'P.O. Box 2500, 30100 Eldoret, Kenya', href: null },
                  { icon: FaPhone, text: '+254 714 333 111', href: 'tel:+254714333111' },
                  { icon: FaEnvelope, text: 'info@ueab.ac.ke', href: 'mailto:info@ueab.ac.ke' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className="h-6 w-6 text-primary-600" />
                    </motion.div>
                    {item.href ? (
                      <a href={item.href} className="text-gray-700 font-medium hover:underline hover:text-primary-600 transition-colors">
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    )}
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div variants={staggerItem}>
                <Link href="/contact" className="btn-primary inline-flex items-center group hover:scale-105 transition-transform duration-300">
                  Schedule a Consultation
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={fadeInRight}
            >
              {/* Embedded Map */}
              <motion.div 
                className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border border-gray-200"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7783273283326!2d35.07958708456931!3d0.2565390634635225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17805da0163652e9%3A0xa37f363566d01b9c!2sUniversity%20Of%20Eastern%20Africa%20Baraton!5e0!3m2!1sen!2sus!4v1761635291814!5m2!1sen!2sus" 
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="UEAB Campus Location"
                ></iframe>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            variants={staggerItem}
            className="inline-flex items-center bg-gold-500/20 text-gold-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300"
          >
            🚀 Start Your Academic Journey
          </motion.div>
          
          <motion.h2 
            variants={staggerItem}
            className="text-4xl font-bold text-white mb-6"
          >
            Ready to Transform Your Career?
          </motion.h2>
          
          <motion.p 
            variants={staggerItem}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Join UEAB ODeL today and gain access to world-class education. 
            Flexible learning, expirienced faculty, and internationally recognized programs await you.
          </motion.p>
          
          <motion.div 
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register" className="btn-gold inline-flex items-center group hover:scale-105 transition-transform duration-300">
              <FaRocket className="mr-2 group-hover:rotate-12 transition-transform" />
              Start Learning Today
            </Link>
            <Link href="/contact" className="btn-outline-white inline-flex items-center group hover:scale-105 transition-transform duration-300">
              <FaCalendarAlt className="mr-2 group-hover:scale-110 transition-transform" />
              Schedule a Consultation
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  )
}
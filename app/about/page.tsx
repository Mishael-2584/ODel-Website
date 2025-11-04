'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaUniversity, FaGlobe, FaUsers, FaAward, FaGraduationCap, FaBook,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaBuilding, FaMicroscope,
  FaStethoscope, FaChalkboardTeacher, FaTrophy, FaLightbulb,
  FaRocket, FaStar, FaCheckCircle, FaArrowRight, FaPlay, FaCogs
} from 'react-icons/fa'

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])

  useEffect(() => {
    setIsVisible(true)
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
      icon: FaTrophy,
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
    <div className="min-h-screen bg-white overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden"
        style={{ opacity, scale }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div 
            className="text-center text-white"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div 
              variants={staggerItem}
              className="inline-flex items-center bg-gold-500/20 backdrop-blur-sm border border-gold-500/30 rounded-full px-4 py-2 mb-6 hover:bg-gold-500/30 transition-all duration-300"
            >
              <span className="text-gold-300 text-sm font-semibold">About UEAB</span>
            </motion.div>
            
            <motion.h1 
              variants={staggerItem}
              className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              UEAB <span className="text-gold-400 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 bg-clip-text text-transparent animate-pulse">ODeL Center</span>
            </motion.h1>
            
            <motion.p 
              variants={staggerItem}
              className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              The Open Distance eLearning Center at University of Eastern Africa, Baraton - 
              pioneering innovative online education delivery across East and Central Africa and beyond. 
              Transforming lives through accessible, flexible, and quality higher education.
            </motion.p>
            
            <motion.div 
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/courses" className="btn-primary inline-flex items-center group hover:scale-105 transition-transform duration-300">
                <FaBook className="mr-2 group-hover:rotate-12 transition-transform" />
                Explore Programs
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="btn-outline-gold inline-flex items-center group hover:scale-105 transition-transform duration-300">
                <FaEnvelope className="mr-2 group-hover:scale-110 transition-transform" />
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
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
                About ODeL Center
              </motion.div>
              
              <motion.h2 
                variants={staggerItem}
                className="text-4xl font-bold text-gray-900 mb-6"
              >
                UEAB Open Distance eLearning Center
              </motion.h2>
              
              <motion.p 
                variants={staggerItem}
                className="text-lg text-gray-600 mb-6 leading-relaxed"
              >
                The UEAB Open Distance eLearning Center is the dedicated unit responsible for delivering 
                innovative online education across all academic programs. Established to expand access to 
                quality higher education, our ODeL Center combines cutting-edge technology with proven 
                pedagogical approaches to create an engaging and effective learning environment.
              </motion.p>
              
              <motion.p 
                variants={staggerItem}
                className="text-lg text-gray-600 mb-6 leading-relaxed"
              >
                Our center operates as an integral part of the University of Eastern Africa, Baraton, 
                leveraging the institution's academic excellence while pioneering new methods of education 
                delivery. We serve students across East and Central Africa and beyond, breaking down geographical and 
                temporal barriers to higher education while maintaining the highest standards of academic rigor.
              </motion.p>
              
              <motion.p 
                variants={staggerItem}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                The ODeL Center is committed to providing comprehensive support services including academic 
                advising, technical assistance, library resources, and student services. Our dedicated team 
                of instructional designers, technologists, and academic support staff work collaboratively 
                to ensure every student receives the support they need to succeed in their online learning journey.
              </motion.p>
              
              <motion.div 
                variants={staggerItem}
                className="grid grid-cols-2 gap-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">CUE Accredited Programs</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">AAA Accrediting Association</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">PhD Qualified Faculty</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <FaCheckCircle className="h-6 w-6 text-primary-600" />
                  <span className="text-gray-700 font-medium">Advanced Moodle Learning Management System</span>
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={fadeInRight}
            >
              {/* Placeholder for UEAB campus images */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: FaUniversity, title: 'Main Campus', desc: 'Beautiful campus images will be displayed here', color: 'from-primary-100 to-gold-100', border: 'border-primary-300', iconColor: 'text-primary-400' },
                  { icon: FaBuilding, title: 'Academic Buildings', desc: 'Modern facilities and classrooms', color: 'from-gold-100 to-primary-100', border: 'border-gold-300', iconColor: 'text-gold-400' },
                  { icon: FaUsers, title: 'Student Life', desc: 'Campus activities and events', color: 'from-green-100 to-blue-100', border: 'border-green-300', iconColor: 'text-green-400' },
                  { icon: FaGraduationCap, title: 'Graduation', desc: 'Commencement ceremonies', color: 'from-purple-100 to-red-100', border: 'border-purple-300', iconColor: 'text-purple-400' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 text-center border-2 border-dashed ${item.border} hover:shadow-xl transition-shadow duration-300`}
                  >
                    <item.icon className={`h-16 w-16 ${item.iconColor} mx-auto mb-3`} />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
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
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-12"
            variants={staggerItem}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">UEAB by the Numbers</h2>
            <p className="text-xl text-gray-600">Our impact and reach across the region</p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                variants={staggerItem}
                whileHover={{ scale: 1.1, y: -10 }}
                className="text-center group cursor-pointer bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-lg mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="h-8 w-8 text-white" />
                </motion.div>
                <motion.h3 
                  className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-gold-600 bg-clip-text text-transparent mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Academic Schools Section */}
      <motion.section 
        className="py-20 bg-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-200 relative"
              >
                <motion.div 
                  className={`h-2 bg-gradient-to-r ${school.color}`}
                  whileHover={{ height: "8px" }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
                <div className="p-8">
                  <motion.div 
                    className="flex items-center mb-6"
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="p-3 bg-gray-100 rounded-xl mr-4 group-hover:bg-gradient-to-br group-hover:from-primary-100 group-hover:to-gold-100 transition-all duration-300"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <school.icon className="h-8 w-8 text-gray-700 group-hover:text-primary-600 transition-colors" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900">{school.title}</h3>
                  </motion.div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">{school.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 mb-2">Programs Offered:</h4>
                    {school.programs.map((program, idx) => (
                      <motion.div 
                        key={idx} 
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <FaCheckCircle className="h-4 w-4 text-primary-600" />
                        <span className="text-sm text-gray-700">{program}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Director's Message Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
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
                Welcome to UEAB <span className="bg-gradient-to-r from-primary-600 to-gold-500 bg-clip-text text-transparent">ODeL Center</span>
              </motion.h2>
              
              <motion.blockquote 
                variants={staggerItem}
                className="text-lg text-gray-600 mb-8 leading-relaxed italic border-l-4 border-gold-500 pl-6 relative"
              >
                <motion.span
                  className="absolute -top-4 -left-4 text-6xl text-gold-200 opacity-50"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.5 }}
                  viewport={{ once: true }}
                >
                  "
                </motion.span>
                Welcome to the UEAB Open Distance eLearning Center, where we are revolutionizing higher education 
                through innovative online delivery. Our ODeL Center is dedicated to providing accessible, flexible, 
                and quality education that transcends geographical boundaries while maintaining the highest academic 
                standards. Through cutting-edge technology and personalized support, we empower learners to achieve 
                their educational goals and contribute meaningfully to society.
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

      {/* Mission & Vision Section */}
      <motion.section 
        className="py-20 bg-white relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={staggerItem}
          >
            <motion.div 
              variants={staggerItem}
              className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300"
            >
              Our Purpose
            </motion.div>
            <motion.h2 
              variants={staggerItem}
              className="text-4xl font-bold text-gray-900 mb-6"
            >
              Mission, Vision & Values
            </motion.h2>
            <motion.p 
              variants={staggerItem}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Our foundational principles that guide our commitment to excellence in Open Distance eLearning.
            </motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <motion.div 
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <motion.div 
                className="flex items-center mb-6"
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="bg-primary-600 p-3 rounded-xl mr-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <FaRocket className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              </motion.div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To provide accessible, quality higher education through innovative Open Distance eLearning 
                that empowers students across East and Central Africa and beyond to achieve their academic and professional 
                goals while fostering spiritual growth and service to humanity.
              </p>
            </motion.div>
            
            <motion.div 
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-8 border border-gold-200 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <motion.div 
                className="flex items-center mb-6"
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="bg-gold-600 p-3 rounded-xl mr-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <FaLightbulb className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              </motion.div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To be the leading Open Distance eLearning platform in East and Central Africa, recognized for excellence 
                in education delivery, technological innovation, and the development of well-rounded graduates 
                who make meaningful contributions to society.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

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
                  <h5 className="font-semibold text-gray-900 text-sm">E-learning Coordinator</h5>
                  <p className="text-gray-600 text-xs">Learning Management & Facilitation</p>
                </div>
              </div>
            </div>
            
            {/* Sixth Level - Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center mb-8">
              <div className="text-center">
                <div className="inline-block bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4 border border-orange-300">
                  <FaAward className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-gray-900 text-sm">Brian Lelei</h5>
                  <p className="text-gray-600 text-xs">E-learning Support</p>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-block bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 border border-blue-300">
                  <FaAward className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-gray-900 text-sm">Mishael Gebre</h5>
                  <p className="text-gray-600 text-xs">ODeL IT Technician</p>
                </div>
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
              {/* Milestone 1 - Most Recent */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 group">
                    <div className="flex items-center justify-end mb-4">
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
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                
                <div className="w-1/2 pl-8"></div>
              </div>
              
              {/* Milestone 2 */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8"></div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                
                <div className="w-1/2 pl-8">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 group">
                    <div className="flex items-center mb-4">
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
              </div>
              
              {/* Milestone 3 */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 group">
                    <div className="flex items-center justify-end mb-4">
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
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gold-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                
                <div className="w-1/2 pl-8"></div>
              </div>
              
              {/* Milestone 4 - Oldest */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8"></div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                
                <div className="w-1/2 pl-8">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 group">
                    <div className="flex items-center mb-4">
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
          <motion.div 
            className="text-center mb-16"
            variants={staggerItem}
          >
            <motion.div 
              variants={staggerItem}
              className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300"
            >
              Our Values
            </motion.div>
            <motion.h2 
              variants={staggerItem}
              className="text-4xl font-bold text-gray-900 mb-6"
            >
              What We Stand For
            </motion.h2>
            <motion.p 
              variants={staggerItem}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Our core values guide everything we do at the ODeL Center and shape our commitment to excellence.
            </motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index} 
                variants={staggerItem}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1, y: -10 }}
                className="text-center group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-6"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <value.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Location Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <motion.div 
                variants={staggerItem}
                className="inline-flex items-center bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300"
              >
                Our Location
              </motion.div>
              
              <motion.h2 
                variants={staggerItem}
                className="text-4xl font-bold text-gray-900 mb-6"
              >
                Visit UEAB Campus
              </motion.h2>
              
              <motion.p 
                variants={staggerItem}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                Located in the heart of Eldoret, Kenya, UEAB offers a beautiful campus environment 
                with modern facilities and a welcoming community atmosphere.
              </motion.p>
              
              <motion.div 
                variants={staggerItem}
                className="space-y-6"
              >
                {[
                  { icon: FaMapMarkerAlt, title: 'Address', text: 'P.O. Box 2500, 30100 Eldoret, Kenya' },
                  { icon: FaPhone, title: 'Phone', text: '+254 714 333 111 / +254 781 333 777' },
                  { icon: FaEnvelope, title: 'Email', text: 'info@ueab.ac.ke' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-4 cursor-pointer"
                  >
                    <motion.div 
                      className="bg-primary-100 p-3 rounded-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <item.icon className="h-6 w-6 text-primary-600" />
                    </motion.div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div 
                variants={staggerItem}
                className="mt-8"
              >
                <Link href="/contact" className="btn-primary inline-flex items-center group hover:scale-105 transition-transform duration-300">
                  <FaMapMarkerAlt className="mr-2 group-hover:scale-110 transition-transform" />
                  Get Directions
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={fadeInRight}
            >
              {/* Interactive Campus Map */}
              <motion.div 
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Find UEAB Campus</h3>
                  <p className="text-gray-600">📍 P.O. Box 2500, 30100 Eldoret, Kenya</p>
                </div>
                
                <div className="relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7783273283326!2d35.07958708456931!3d0.2565390634635225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17805da0163652e9%3A0xa37f363566d01b9c!2sUniversity%20Of%20Eastern%20Africa%20Baraton!5e0!3m2!1sen!2sus!4v1761635291814!5m2!1sen!2sus" 
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                    title="UEAB Campus Location - Main Campus"
                  ></iframe>
                  
                  {/* Map Overlay Controls */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-md">
                    <a
                      href="https://www.google.com/maps/dir//University+of+Eastern+Africa+Baraton+Eldoret+Kenya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    >
                      <FaMapMarkerAlt className="h-4 w-4 mr-1" />
                      Get Directions
                    </a>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="https://www.google.com/maps/dir//University+of+Eastern+Africa+Baraton+Eldoret+Kenya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                      Directions
                    </a>
                    <a
                      href="https://www.google.com/maps/place/University+of+Eastern+Africa+Baraton+Kenya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors text-sm font-medium"
                    >
                      <FaGlobe className="h-4 w-4 mr-2" />
                      View on Google Maps
                    </a>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Click the buttons above to get directions or view the full map
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            variants={staggerItem}
            className="inline-flex items-center bg-gold-500/20 text-gold-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300"
          >
            🚀 Join Our Community
          </motion.div>
          
          <motion.h2 
            variants={staggerItem}
            className="text-4xl font-bold text-white mb-6"
          >
            Ready to Start Your ODeL Journey?
          </motion.h2>
          
          <motion.p 
            variants={staggerItem}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Join thousands of students who have chosen UEAB ODeL Center for their online education. 
            Experience flexible learning that fits your schedule and location.
          </motion.p>
          
          <motion.div 
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register" className="btn-gold inline-flex items-center group hover:scale-105 transition-transform duration-300">
              <FaRocket className="mr-2 group-hover:scale-110 transition-transform" />
              Apply Now
            </Link>
            <Link href="/courses" className="btn-outline-white inline-flex items-center group hover:scale-105 transition-transform duration-300">
              <FaBook className="mr-2 group-hover:rotate-12 transition-transform" />
              Explore Programs
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  )
}
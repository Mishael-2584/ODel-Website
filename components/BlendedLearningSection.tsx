'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  FaPlayCircle, FaVideo, FaUsers, FaHeadset, FaBook, FaCheckCircle,
  FaZoom, FaRobot, FaClock, FaGlobe, FaMobileAlt, FaArrowRight,
  FaLightbulb, FaBolt, FaShieldAlt
} from 'react-icons/fa'
import { SiMoodle } from 'react-icons/si'

interface BlendedFeature {
  icon: any
  title: string
  description: string
  color: string
}

export default function BlendedLearningSection() {
  const [isVideoVisible, setIsVideoVisible] = useState(false)
  const [autoplayVideo, setAutoplayVideo] = useState(false)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVideoVisible(true)
          setAutoplayVideo(true)
        } else {
          setAutoplayVideo(false)
        }
      },
      { threshold: 0.5 }
    )

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current)
    }

    return () => {
      if (videoContainerRef.current) {
        observer.unobserve(videoContainerRef.current)
      }
    }
  }, [])

  const blendedFeatures: BlendedFeature[] = [
    {
      icon: FaVideo,
      title: 'Integrated Video Lectures',
      description: 'HD video content with interactive features and adaptive streaming',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: FaZoom,
      title: 'Zoom Integration',
      description: 'Live synchronous sessions, webinars, and real-time collaboration tools',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: SiMoodle,
      title: 'Moodle Integration',
      description: 'Comprehensive Learning Management System with full course management',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: FaHeadset,
      title: '24/7 Online Support',
      description: 'Dedicated support team, chatbot assistance, and community forums',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FaUsers,
      title: 'Collaborative Learning',
      description: 'Group projects, peer review, and discussion forums for active engagement',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: FaMobileAlt,
      title: 'Mobile-First Design',
      description: 'Access your courses anytime, anywhere on any device with offline support',
      color: 'from-pink-500 to-pink-600'
    }
  ]

  const additionalFeatures = [
    { icon: FaBolt, label: 'Fast Performance', detail: 'Optimized for speed and reliability' },
    { icon: FaShieldAlt, label: 'Secure Learning', detail: 'Enterprise-grade security' },
    { icon: FaClock, label: 'Flexible Pacing', detail: 'Learn at your own schedule' },
    { icon: FaGlobe, label: 'Global Access', detail: 'Available worldwide' }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center bg-gradient-to-r from-primary-100 to-gold-100 text-primary-900 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg border border-primary-200">
            <FaPlayCircle className="mr-2 animate-pulse" />
            Learn with Blended Learning at ODeL
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Fully Integrated 
            <span className="block bg-gradient-to-r from-primary-600 via-gold-500 to-primary-600 bg-clip-text text-transparent">
              eLearning Ecosystem
            </span>
          </h2>
          
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Experience a seamlessly integrated learning platform combining Zoom for live interactions, 
            Moodle for comprehensive course management, and 24/7 online support—all designed to transform 
            your educational journey with flexibility, engagement, and excellence.
          </p>
        </div>

        {/* Main Video Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Video Container */}
          <div ref={videoContainerRef} className="relative group">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-video group-hover:shadow-3xl transition-all duration-500">
              {/* YouTube Embed */}
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/ncyMJUsWgTE?${autoplayVideo ? 'autoplay=1' : 'autoplay=0'}&rel=0&modestbranding=1&fs=1`}
                title="UEAB Blended Learning Overview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          </div>

          {/* Content Section */}
          <div className="space-y-8">
            <div className="inline-flex items-center bg-primary-50 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold border border-primary-200">
              🎓 Premium Learning Experience
            </div>
            
            <h3 className="text-4xl font-bold text-gray-900 leading-tight">
              Everything You Need for Success
            </h3>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              Our blended learning platform combines the best of synchronous and asynchronous learning, 
              integrating world-class tools and technologies to create an unparalleled educational experience.
            </p>

            {/* Key Integration Points */}
            <div className="space-y-4">
              {[
                { icon: FaZoom, text: 'Live Zoom sessions for real-time interaction' },
                { icon: SiMoodle, text: 'Moodle-powered course management and tracking' },
                { icon: FaHeadset, text: '24/7 dedicated support team and AI chatbot' },
                { icon: FaVideo, text: 'On-demand video lectures with adaptive streaming' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-gold-500 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold group-hover:text-primary-600 transition-colors">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/courses" className="btn-gold inline-flex items-center justify-center group text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all">
                <FaPlayCircle className="mr-3 group-hover:scale-110 transition-transform" />
                Start Learning Now
              </Link>
              <Link href="/about" className="btn-outline-primary inline-flex items-center justify-center group text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all">
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blendedFeatures.map((feature, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-500"></div>
              
              <div className="relative p-8 h-full flex flex-col">
                {/* Header Color Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} rounded-t-2xl`}></div>
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-gold-600 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h4>
                <p className="text-gray-600 flex-1 group-hover:text-gray-800 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Hover Element */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center text-primary-600 font-semibold">
                    <span>Explore Feature</span>
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Benefits Section */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-12 relative overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/grid.svg')]"></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white mb-12 text-center">
              Why Choose Our Blended Learning Platform?
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {additionalFeatures.map((benefit, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur-sm rounded-full mb-4 group-hover:bg-white/25 group-hover:scale-110 transition-all duration-300 border border-white/20 group-hover:border-white/40">
                    <benefit.icon className="h-10 w-10 text-gold-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-gold-300 transition-colors">{benefit.label}</h4>
                  <p className="text-white/80 text-sm group-hover:text-white transition-colors">{benefit.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="mt-20 bg-gradient-to-r from-gold-500 to-gold-600 rounded-3xl p-12 text-center relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-gold-600 to-primary-600"></div>
          
          <div className="relative z-10">
            <h3 className="text-4xl font-bold text-white mb-4">
              Join Our Blended Learning Community
            </h3>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Thousands of students are already experiencing the future of education. 
              Are you ready to transform your learning journey?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center bg-white text-primary-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl group/btn">
                <FaPlayCircle className="mr-3 group-hover/btn:scale-110 transition-transform" />
                Get Started Today
              </Link>
              <Link href="/courses" className="inline-flex items-center justify-center bg-white/20 text-white font-bold py-4 px-8 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/30">
                <FaArrowRight className="mr-2" />
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

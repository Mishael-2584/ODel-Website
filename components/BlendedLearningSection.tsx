'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  FaPlayCircle, FaPhone, FaBook, FaHeadset, FaMobileAlt, FaArrowRight,
  FaBolt, FaCheckCircle
} from 'react-icons/fa'
import { SiMoodle } from 'react-icons/si'

export default function BlendedLearningSection() {
  const [autoplayVideo, setAutoplayVideo] = useState(false)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoplayVideo(entry.isIntersecting)
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

  const features = [
    { icon: FaPhone, title: 'Live Interactive Sessions', desc: 'Real-time Zoom classes with expert instructors' },
    { icon: SiMoodle, title: 'Moodle LMS', desc: 'Comprehensive course management & tracking' },
    { icon: FaBook, title: 'On-Demand Content', desc: 'Access lectures anytime, anywhere' },
    { icon: FaHeadset, title: '24/7 Support', desc: 'Dedicated student success team' }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🎓 Transform Your Future
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Learn with UEAB's 
            <span className="block bg-gradient-to-r from-primary-600 to-gold-500 bg-clip-text text-transparent">
              Blended Learning Platform
            </span>
          </h2>
          
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Fully integrated eLearning combining Zoom live sessions, Moodle course management, on-demand video lectures, and 24/7 student support—all designed to make quality education accessible and flexible.
          </p>
        </div>

        {/* Main Content: Video + Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          
          {/* Video Section - Larger on desktop */}
          <div ref={videoContainerRef} className="lg:col-span-2 relative group">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white aspect-video group-hover:shadow-2xl transition-all duration-500">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/ncyMJUsWgTE?${autoplayVideo ? 'autoplay=1' : 'autoplay=0'}&rel=0&modestbranding=1&fs=1`}
                title="UEAB Blended Learning"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Quick Features */}
          <div className="space-y-4">
            {features.slice(0, 4).map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-1">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-gold-500 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Benefits Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Why Choose UEAB ODeL?</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: FaCheckCircle, title: 'Accredited', desc: 'Internationally recognized degrees' },
                { icon: FaBolt, title: 'Flexible', desc: 'Study at your own pace' },
                { icon: FaBook, title: '200+ Programs', desc: 'Across 5 academic schools' },
                { icon: FaMobileAlt, title: 'Mobile-Ready', desc: 'Learn anytime, anywhere' }
              ].map((benefit, index) => (
                <div key={index} className="text-center">
                  <benefit.icon className="h-8 w-8 text-gold-300 mx-auto mb-3" />
                  <h4 className="font-bold text-white mb-1">{benefit.title}</h4>
                  <p className="text-sm text-gray-200">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl p-10 text-center relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-gold-600 to-primary-600"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white mb-3">
              Ready to Start Your Journey?
            </h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students experiencing quality, flexible, and accessible higher education at UEAB. Apply today and transform your future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="https://ueab.ac.ke/apply-to-ueab/" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-primary-700 font-bold py-3 px-8 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl group/btn"
              >
                <FaArrowRight className="mr-2 group-hover/btn:translate-x-1 transition-transform" />
                Apply Now
              </Link>
              <Link 
                href="/courses"
                className="inline-flex items-center justify-center bg-white/20 text-white font-bold py-3 px-8 rounded-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/30"
              >
                Explore Programs
              </Link>
            </div>

            <p className="text-sm text-white/80 mt-6">
              Application intakes: August/September & December/January
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm mb-4">
            Questions? Contact our admissions team
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-gray-700 font-medium">
            <a href="tel:+254714333111" className="hover:text-primary-600 transition-colors">📞 +254 714 333 111</a>
            <a href="mailto:admissions@ueab.ac.ke" className="hover:text-primary-600 transition-colors">✉️ admissions@ueab.ac.ke</a>
            <a href="https://ueab.ac.ke" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">🌐 ueab.ac.ke</a>
          </div>
        </div>
      </div>
    </section>
  )
}

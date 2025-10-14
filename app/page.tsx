'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaBook, FaUsers, FaCertificate, FaLaptop, FaChartLine, FaGlobe,
  FaPlay, FaClock, FaStar, FaArrowRight, FaGraduationCap, FaAward,
  FaUserGraduate, FaChalkboardTeacher, FaVideo, FaTrophy, FaFire,
  FaCheckCircle, FaRocket, FaMedal, FaLightbulb, FaCalendarAlt, FaBolt
} from 'react-icons/fa'

export default function Home() {
  const features = [
    {
      icon: FaVideo,
      title: 'Interactive Video Lectures',
      description: 'HD video content with subtitles, playback speed control, and downloadable resources.',
      color: 'from-gold-500 to-gold-600',
      iconBg: 'bg-gold-500'
    },
    {
      icon: FaChalkboardTeacher,
      title: 'Expert Instructors',
      description: 'Learn from PhD holders and industry professionals with years of experience.',
      color: 'from-primary-500 to-primary-700',
      iconBg: 'bg-primary-500'
    },
    {
      icon: FaTrophy,
      title: 'Gamified Learning',
      description: 'Earn badges, compete on leaderboards, and track achievements as you progress.',
      color: 'from-accent-purple to-purple-600',
      iconBg: 'bg-accent-purple'
    },
    {
      icon: FaCertificate,
      title: 'Accredited Certificates',
      description: 'Earn internationally recognized certificates upon course completion.',
      color: 'from-gold-500 to-gold-700',
      iconBg: 'bg-gold-600'
    },
    {
      icon: FaUsers,
      title: 'Collaborative Learning',
      description: 'Join study groups, forums, and live Q&A sessions with peers worldwide.',
      color: 'from-accent-cyan to-blue-500',
      iconBg: 'bg-accent-cyan'
    },
    {
      icon: FaChartLine,
      title: 'Advanced Analytics',
      description: 'Detailed insights into your learning progress with AI-powered recommendations.',
      color: 'from-accent-green to-green-600',
      iconBg: 'bg-accent-green'
    }
  ]

  const stats = [
    { icon: FaUserGraduate, value: '10,000+', label: 'Active Students', color: 'text-primary-600' },
    { icon: FaBook, value: '500+', label: 'Online Courses', color: 'text-gold-600' },
    { icon: FaGlobe, value: '50+', label: 'Countries', color: 'text-accent-cyan' },
    { icon: FaAward, value: '95%', label: 'Success Rate', color: 'text-accent-green' }
  ]

  const popularCourses = [
    {
      title: 'Business Administration',
      category: 'Business',
      students: 1250,
      rating: 4.8,
      duration: '12 weeks',
      level: 'Intermediate',
      image: '📊',
      lessons: 48,
      price: 'KES 45,000',
      instructor: 'Dr. Sarah Kimani',
      progress: 0,
      badge: 'Trending'
    },
    {
      title: 'Computer Science',
      category: 'Technology',
      students: 980,
      rating: 4.9,
      duration: '16 weeks',
      level: 'Advanced',
      image: '💻',
      lessons: 64,
      price: 'KES 55,000',
      instructor: 'Prof. John Mwangi',
      progress: 0,
      badge: 'Most Popular'
    },
    {
      title: 'Nursing & Health Sciences',
      category: 'Healthcare',
      students: 850,
      rating: 4.7,
      duration: '14 weeks',
      level: 'Intermediate',
      image: '🏥',
      lessons: 56,
      price: 'KES 50,000',
      instructor: 'Dr. Grace Wanjiru',
      progress: 0,
      badge: 'New'
    },
    {
      title: 'Education & Teaching',
      category: 'Education',
      students: 720,
      rating: 4.8,
      duration: '10 weeks',
      level: 'Beginner',
      image: '📚',
      lessons: 40,
      price: 'KES 40,000',
      instructor: 'Dr. Peter Ochieng',
      progress: 0,
      badge: 'Beginner Friendly'
    }
  ]

  const achievements = [
    { icon: FaMedal, label: 'Top Rated in Africa', color: 'text-gold-500' },
    { icon: FaTrophy, label: 'Award Winning Platform', color: 'text-primary-600' },
    { icon: FaFire, label: '5000+ Graduates', color: 'text-accent-orange' },
    { icon: FaBolt, label: 'Live Interactive Classes', color: 'text-accent-purple' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section - Enhanced with more gold */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        {/* Gold accent circles */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-gold-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gold-400 rounded-full filter blur-3xl opacity-20 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-500 rounded-full filter blur-3xl opacity-15 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div className="inline-block">
                <span className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl-gold animate-pulse">
                  🎓 Ranked #1 in East Africa
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Transform Your Future with 
                <span className="block bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent mt-2 animate-shimmer bg-[length:1000px_100%]">
                  World-Class Education
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Join thousands of students worldwide learning from UEAB's premier online platform. 
                <span className="text-gold-400 font-semibold"> Flexible, affordable,</span> and internationally recognized.
              </p>
              
              {/* Achievement Tags */}
              <div className="flex flex-wrap gap-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                    <achievement.icon className={`${achievement.color}`} />
                    <span className="text-sm font-medium">{achievement.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses" className="group relative bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-xl-gold hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center">
                  <FaRocket className="mr-2 group-hover:animate-bounce" />
                  Explore Courses
                  <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link href="/register" className="group bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-gold-400 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 inline-flex items-center justify-center hover:scale-105">
                  <FaPlay className="mr-2" />
                  Start Learning Free
                </Link>
              </div>
            </div>

            {/* Enhanced stats card with gold accents */}
            <div className="hidden md:block relative animate-fadeIn">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gold-400/30">
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-gold">
                  ✨ Live Now
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 bg-gradient-to-r from-gold-500/20 to-transparent rounded-lg p-4 border-l-4 border-gold-500">
                    <div className="bg-gold-500 p-3 rounded-lg shadow-gold">
                      <FaGraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Active Learners</p>
                      <p className="text-3xl font-bold text-gold-400">10,000+</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-gradient-to-r from-primary-500/20 to-transparent rounded-lg p-4 border-l-4 border-primary-500">
                    <div className="bg-primary-500 p-3 rounded-lg shadow-primary">
                      <FaCertificate className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Certificates Issued</p>
                      <p className="text-3xl font-bold">5,000+</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-gradient-to-r from-gold-500/20 to-transparent rounded-lg p-4 border-l-4 border-gold-500">
                    <div className="bg-gold-500 p-3 rounded-lg shadow-gold">
                      <FaStar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Student Satisfaction</p>
                      <p className="text-3xl font-bold text-gold-400">4.8/5.0 ⭐</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced with gold */}
      <section className="bg-white py-16 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-110 transition-all duration-300 cursor-pointer">
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${index % 2 === 0 ? 'from-gold-500 to-gold-600 shadow-xl-gold' : 'from-primary-500 to-primary-700 shadow-primary'} rounded-full mb-4 group-hover:shadow-2xl group-hover:animate-bounce transition-all`}>
                  <stat.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</h3>
                <p className="text-gray-600 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Experience the Future of <span className="text-gold-600">Learning</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technology meets world-class education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative card hover:scale-105 transition-all duration-300 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className={`${feature.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gold-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex items-center text-gold-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <FaArrowRight className="ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Learning Section - NEW */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-gold-500 rounded-full filter blur-3xl opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4">
                <span className="bg-gold-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  🎥 Interactive Learning
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Learn Through <span className="text-gold-400">HD Video</span> Lectures
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Access high-quality video content anytime, anywhere. Download for offline viewing and learn at your own pace.
              </p>
              <ul className="space-y-4 mb-8">
                {['HD Quality Video Streaming', 'Downloadable Content', 'Interactive Transcripts', 'Multi-language Subtitles', 'Playback Speed Control'].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <FaCheckCircle className="text-gold-400 flex-shrink-0" />
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/courses" className="btn-secondary inline-flex items-center">
                <FaVideo className="mr-2" />
                Watch Demo Video
              </Link>
            </div>
            <div className="relative group">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border-4 border-gold-500/30 group-hover:border-gold-500 transition-all">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gold-500 hover:bg-gold-600 w-24 h-24 rounded-full flex items-center justify-center shadow-xl-gold cursor-pointer transform hover:scale-110 transition-all group-hover:animate-pulse">
                    <FaPlay className="h-10 w-10 text-white ml-2" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white font-semibold mb-1">Sample Lecture: Introduction to Business</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>Dr. Sarah Kimani</span>
                    <span>•</span>
                    <span>45:30</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <FaStar className="text-gold-400 mr-1" />
                      4.9
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses - Enhanced with gold */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-primary-500 to-primary-700 text-white px-4 py-2 rounded-full text-sm font-bold">
                  🔥 Trending Now
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Most Popular Courses</h2>
              <p className="text-xl text-gray-600 mt-2">Start learning with our top-rated programs</p>
            </div>
            <Link href="/courses" className="hidden md:inline-flex items-center bg-gradient-to-r from-gold-500 to-gold-600 text-white font-bold py-3 px-6 rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all shadow-gold hover:shadow-xl-gold group mt-4 md:mt-0">
              View All Courses
              <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularCourses.map((course, index) => (
              <div key={index} className="group card hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden border-2 border-transparent hover:border-gold-400">
                {course.badge && (
                  <div className={`absolute top-4 right-4 ${index % 2 === 0 ? 'bg-gold-500' : 'bg-primary-600'} text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg`}>
                    {course.badge}
                  </div>
                )}
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{course.image}</div>
                <span className={`inline-block ${index % 2 === 0 ? 'bg-gold-100 text-gold-700' : 'bg-primary-100 text-primary-700'} px-3 py-1 rounded-full text-xs font-semibold mb-3`}>
                  {course.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gold-600 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <FaUsers className="mr-1" />
                    {course.students}
                  </span>
                  <span className="flex items-center font-semibold text-gold-600">
                    <FaStar className="mr-1" />
                    {course.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <FaClock className="mr-1" />
                    {course.duration}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                    {course.level}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-2xl font-bold text-gold-600">{course.price}</span>
                  <FaArrowRight className="text-gold-600 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/courses" className="btn-primary inline-flex items-center">
              View All Courses
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced with gold gradient */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-400 rounded-full filter blur-3xl opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <span className="bg-gold-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl-gold">
              🚀 Limited Time Offer
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your <span className="text-gold-400">Career?</span>
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join UEAB ODel today and gain access to world-class education. <span className="text-gold-400 font-semibold">Get 20% off</span> on your first course!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl-gold hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center">
              <FaRocket className="mr-2" />
              Start Learning Today
            </Link>
            <Link href="/contact" className="bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white text-white font-bold py-4 px-8 rounded-lg transition-all hover:scale-105 inline-flex items-center justify-center">
              <FaCalendarAlt className="mr-2" />
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

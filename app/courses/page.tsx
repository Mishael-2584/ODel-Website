'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaSearch, FaFilter, FaBook, FaUsers, FaStar, FaClock, 
  FaArrowRight, FaBuilding, FaMicroscope, FaStethoscope,
  FaChalkboardTeacher, FaGraduationCap, FaPlay, FaEye,
  FaCalendarAlt, FaMapMarkerAlt, FaChevronDown
} from 'react-icons/fa'

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const schools = [
    { id: 'all', name: 'All Schools', icon: FaBook },
    { id: 'business', name: 'School of Business', icon: FaBuilding },
    { id: 'education', name: 'School of Education', icon: FaChalkboardTeacher },
    { id: 'nursing', name: 'School of Nursing', icon: FaStethoscope },
    { id: 'technology', name: 'School of Science & Technology', icon: FaMicroscope },
    { id: 'graduate', name: 'Graduate Studies', icon: FaGraduationCap }
  ]

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'undergraduate', name: 'Undergraduate' },
    { id: 'graduate', name: 'Graduate' },
    { id: 'doctoral', name: 'Doctoral' }
  ]

  const programs = [
    // School of Business
    {
      id: 1,
      title: 'Bachelor of Business Administration',
      school: 'business',
      schoolName: 'School of Business',
      level: 'undergraduate',
      duration: '4 years',
      credits: 120,
      students: 450,
      rating: 4.8,
      price: 'KES 180,000/year',
      instructor: 'Dr. Sarah Kimani',
      description: 'Comprehensive business education covering management, marketing, finance, and entrepreneurship.',
      image: '🏢',
      badge: 'Most Popular',
      requirements: ['KCSE C+', 'Mathematics C+', 'English C+'],
      outcomes: ['Business Management Skills', 'Leadership Development', 'Entrepreneurial Thinking']
    },
    {
      id: 2,
      title: 'Master of Business Administration',
      school: 'business',
      schoolName: 'School of Business',
      level: 'graduate',
      duration: '2 years',
      credits: 60,
      students: 180,
      rating: 4.9,
      price: 'KES 200,000/year',
      instructor: 'Prof. John Mwangi',
      description: 'Advanced business administration program for working professionals seeking leadership roles.',
      image: '💼',
      badge: 'Professional',
      requirements: ['Bachelor\'s Degree', '2 years work experience', 'GMAT/GRE scores'],
      outcomes: ['Strategic Leadership', 'Business Analytics', 'Global Business Perspective']
    },
    {
      id: 3,
      title: 'PhD in Business Administration',
      school: 'business',
      schoolName: 'School of Business',
      level: 'doctoral',
      duration: '3-5 years',
      credits: 90,
      students: 25,
      rating: 4.9,
      price: 'KES 150,000/year',
      instructor: 'Prof. Dr. Mary Wanjiku',
      description: 'Doctoral program focusing on advanced business research and academic excellence.',
      image: '🎓',
      badge: 'Research',
      requirements: ['Master\'s Degree', 'Research Proposal', 'Academic References'],
      outcomes: ['Research Expertise', 'Academic Leadership', 'Industry Impact']
    },

    // School of Education
    {
      id: 4,
      title: 'Bachelor of Education',
      school: 'education',
      schoolName: 'School of Education',
      level: 'undergraduate',
      duration: '4 years',
      credits: 120,
      students: 320,
      rating: 4.7,
      price: 'KES 160,000/year',
      instructor: 'Dr. James Ochieng',
      description: 'Comprehensive teacher education program preparing educators for primary and secondary schools.',
      image: '📚',
      badge: 'High Demand',
      requirements: ['KCSE C+', 'Mathematics C+', 'English C+'],
      outcomes: ['Teaching Excellence', 'Curriculum Development', 'Student Assessment']
    },
    {
      id: 5,
      title: 'Master of Education',
      school: 'education',
      schoolName: 'School of Education',
      level: 'graduate',
      duration: '2 years',
      credits: 60,
      students: 120,
      rating: 4.8,
      price: 'KES 150,000/year',
      instructor: 'Prof. Grace Akinyi',
      description: 'Advanced education program for teachers seeking leadership and specialization.',
      image: '👨‍🏫',
      badge: 'Professional',
      requirements: ['Bachelor\'s Degree', 'Teaching Experience', 'Academic References'],
      outcomes: ['Educational Leadership', 'Research Skills', 'Policy Development']
    },

    // School of Nursing
    {
      id: 6,
      title: 'Bachelor of Science in Nursing',
      school: 'nursing',
      schoolName: 'School of Nursing',
      level: 'undergraduate',
      duration: '4 years',
      credits: 120,
      students: 280,
      rating: 4.8,
      price: 'KES 220,000/year',
      instructor: 'Dr. Mary Wanjiku',
      description: 'Comprehensive nursing program with clinical training and healthcare management.',
      image: '🏥',
      badge: 'High Demand',
      requirements: ['KCSE B-', 'Biology B', 'Chemistry C+', 'Mathematics C+'],
      outcomes: ['Clinical Skills', 'Patient Care', 'Healthcare Management']
    },
    {
      id: 7,
      title: 'Master of Science in Public Health',
      school: 'nursing',
      schoolName: 'School of Nursing',
      level: 'graduate',
      duration: '2 years',
      credits: 60,
      students: 80,
      rating: 4.7,
      price: 'KES 180,000/year',
      instructor: 'Prof. Dr. Peter Kamau',
      description: 'Advanced public health program focusing on community health and epidemiology.',
      image: '🌍',
      badge: 'Specialized',
      requirements: ['Bachelor\'s Degree', 'Health-related background', 'Work Experience'],
      outcomes: ['Public Health Leadership', 'Epidemiology', 'Health Policy']
    },

    // School of Science & Technology
    {
      id: 8,
      title: 'Bachelor of Science in Computer Science',
      school: 'technology',
      schoolName: 'School of Science & Technology',
      level: 'undergraduate',
      duration: '4 years',
      credits: 120,
      students: 380,
      rating: 4.9,
      price: 'KES 200,000/year',
      instructor: 'Prof. Samuel Kiprotich',
      description: 'Comprehensive computer science program covering programming, algorithms, and software engineering.',
      image: '💻',
      badge: 'Trending',
      requirements: ['KCSE B-', 'Mathematics B', 'Physics C+', 'Chemistry C+'],
      outcomes: ['Programming Skills', 'Software Development', 'System Analysis']
    },
    {
      id: 9,
      title: 'Master of Science in Information Technology',
      school: 'technology',
      schoolName: 'School of Science & Technology',
      level: 'graduate',
      duration: '2 years',
      credits: 60,
      students: 100,
      rating: 4.8,
      price: 'KES 190,000/year',
      instructor: 'Dr. Jane Muthoni',
      description: 'Advanced IT program focusing on emerging technologies and digital transformation.',
      image: '🔧',
      badge: 'Innovation',
      requirements: ['Bachelor\'s Degree', 'IT Background', 'Programming Experience'],
      outcomes: ['IT Leadership', 'Digital Innovation', 'Technology Management']
    },
    {
      id: 10,
      title: 'Bachelor of Science in Mathematics',
      school: 'technology',
      schoolName: 'School of Science & Technology',
      level: 'undergraduate',
      duration: '4 years',
      credits: 120,
      students: 150,
      rating: 4.6,
      price: 'KES 180,000/year',
      instructor: 'Prof. Dr. Michael Otieno',
      description: 'Comprehensive mathematics program covering pure and applied mathematics.',
      image: '📊',
      badge: 'Analytical',
      requirements: ['KCSE B', 'Mathematics A-', 'Physics C+'],
      outcomes: ['Mathematical Reasoning', 'Problem Solving', 'Statistical Analysis']
    }
  ]

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSchool = selectedSchool === 'all' || program.school === selectedSchool
    const matchesLevel = selectedLevel === 'all' || program.level === selectedLevel
    
    return matchesSearch && matchesSchool && matchesLevel
  })

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Most Popular': return 'bg-primary-100 text-primary-800'
      case 'High Demand': return 'bg-red-100 text-red-800'
      case 'Trending': return 'bg-blue-100 text-blue-800'
      case 'Professional': return 'bg-green-100 text-green-800'
      case 'Research': return 'bg-purple-100 text-purple-800'
      case 'Specialized': return 'bg-yellow-100 text-yellow-800'
      case 'Innovation': return 'bg-cyan-100 text-cyan-800'
      case 'Analytical': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'undergraduate': return 'bg-blue-100 text-blue-800'
      case 'graduate': return 'bg-green-100 text-green-800'
      case 'doctoral': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
              <span className="text-gold-300 text-sm font-semibold">Academic Programs</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Explore Our <span className="text-gold-400">Academic Programs</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Discover comprehensive programs across five schools, from undergraduate to doctoral levels. 
              Quality education designed for your success.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Search Bar */}
            <div className="relative mb-6">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search programs, schools, or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filter Programs</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <FaFilter className="h-5 w-5" />
                <span>Filters</span>
                <FaChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* School Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">School</label>
                  <div className="grid grid-cols-2 gap-2">
                    {schools.map((school) => (
                      <button
                        key={school.id}
                        onClick={() => setSelectedSchool(school.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedSchool === school.id
                            ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        <school.icon className="h-4 w-4" />
                        <span className="truncate">{school.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Level</label>
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedLevel(level.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedLevel === level.id
                            ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        {level.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {filteredPrograms.length} Program{filteredPrograms.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-gray-600">
                {selectedSchool === 'all' ? 'All Schools' : schools.find(s => s.id === selectedSchool)?.name} • 
                {selectedLevel === 'all' ? ' All Levels' : levels.find(l => l.id === selectedLevel)?.name}
              </p>
            </div>
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="text-center py-16">
              <FaBook className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Programs Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedSchool('all')
                  setSelectedLevel('all')
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPrograms.map((program) => (
                <div key={program.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 group">
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{program.image}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeColor(program.badge)}`}>
                              {program.badge}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(program.level)}`}>
                              {program.level}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                            {program.title}
                          </h3>
                          <p className="text-sm text-gray-600">{program.schoolName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {program.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <FaUsers className="h-4 w-4" />
                        <span>{program.students}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaStar className="h-4 w-4 text-gold-500" />
                        <span>{program.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaClock className="h-4 w-4" />
                        <span>{program.duration}</span>
                      </div>
                    </div>

                    {/* Instructor */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Instructor:</span> {program.instructor}
                      </p>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-primary-600 font-bold">{program.price}</div>
                      <Link 
                        href={`/courses/${program.id}`}
                        className="btn-primary text-sm flex items-center group"
                      >
                        <FaEye className="mr-2 group-hover:scale-110 transition-transform" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-gold-500/20 text-gold-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🎓 Ready to Apply?
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Academic Journey Today
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of students who have chosen UEAB for their education. 
            Apply to your preferred program and begin your path to success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-gold inline-flex items-center group">
              <FaCalendarAlt className="mr-2 group-hover:scale-110 transition-transform" />
              Apply Now
            </Link>
            <Link href="/contact" className="btn-outline-white inline-flex items-center group">
              <FaMapMarkerAlt className="mr-2 group-hover:scale-110 transition-transform" />
              Visit Campus
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FaSearch, FaFilter, FaBookOpen, FaClock, FaUsers, FaTrophy, FaExternalLinkAlt, FaChevronDown, FaTimes } from 'react-icons/fa'

interface Course {
  id: number
  shortname: string
  fullname: string
  summary: string
  categoryname: string
  enrolledusercount: number
  startdate: number
  enddate: number
  visible: boolean
  format: string
  lang: string
}

interface SearchFilters {
  category: string
  level: string
  duration: string
  enrollment: string
  format: string
}

export default function SmartCourseSearch() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    level: 'all',
    duration: 'all',
    enrollment: 'all',
    format: 'all'
  })
  const [categories, setCategories] = useState<string[]>([])
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (searchTerm.length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      searchTimeoutRef.current = setTimeout(() => {
        searchCourses()
      }, 500)
    } else {
      setFilteredCourses([])
    }
  }, [searchTerm])

  useEffect(() => {
    applyFilters()
  }, [courses, filters])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/moodle?action=categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data.map((cat: any) => cat.name))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const searchCourses = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/moodle?action=search&search=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      if (data.success) {
        setCourses(data.data)
      }
    } catch (error) {
      console.error('Error searching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...courses]

    if (filters.category !== 'all') {
      filtered = filtered.filter(course => course.categoryname === filters.category)
    }

    if (filters.level !== 'all') {
      const levelKeywords = {
        'undergraduate': ['bachelor', 'bsc', 'ba', 'bbit'],
        'graduate': ['master', 'msc', 'mba', 'mph'],
        'certificate': ['cert', 'certificate'],
        'diploma': ['diploma', 'dip']
      }
      const keywords = levelKeywords[filters.level as keyof typeof levelKeywords] || []
      filtered = filtered.filter(course => 
        keywords.some(keyword => 
          course.fullname.toLowerCase().includes(keyword) ||
          course.shortname.toLowerCase().includes(keyword)
        )
      )
    }

    if (filters.duration !== 'all') {
      // Filter by course duration based on start/end dates
      const now = Date.now()
      const durations = {
        'short': 30 * 24 * 60 * 60 * 1000, // 30 days
        'medium': 90 * 24 * 60 * 60 * 1000, // 90 days
        'long': 365 * 24 * 60 * 60 * 1000 // 1 year
      }
      const duration = durations[filters.duration as keyof typeof durations]
      if (duration) {
        filtered = filtered.filter(course => {
          const courseDuration = (course.enddate * 1000) - (course.startdate * 1000)
          return courseDuration <= duration
        })
      }
    }

    if (filters.enrollment !== 'all') {
      const enrollmentRanges = {
        'low': [0, 20],
        'medium': [21, 100],
        'high': [101, Infinity]
      }
      const range = enrollmentRanges[filters.enrollment as keyof typeof enrollmentRanges]
      if (range) {
        filtered = filtered.filter(course => 
          course.enrolledusercount >= range[0] && course.enrolledusercount <= range[1]
        )
      }
    }

    if (filters.format !== 'all') {
      filtered = filtered.filter(course => course.format === filters.format)
    }

    setFilteredCourses(filtered)
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      level: 'all',
      duration: 'all',
      enrollment: 'all',
      format: 'all'
    })
  }

  const getCourseLevel = (course: Course) => {
    const name = course.fullname.toLowerCase()
    if (name.includes('master') || name.includes('msc') || name.includes('mba')) return 'Graduate'
    if (name.includes('cert') || name.includes('certificate')) return 'Certificate'
    if (name.includes('diploma') || name.includes('dip')) return 'Diploma'
    return 'Undergraduate'
  }

  const getCourseDuration = (course: Course) => {
    const duration = (course.enddate * 1000) - (course.startdate * 1000)
    const days = Math.ceil(duration / (1000 * 60 * 60 * 24))
    
    if (days <= 30) return 'Short-term'
    if (days <= 90) return 'Medium-term'
    return 'Long-term'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Smart Course Search
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover courses tailored to your interests and career goals
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for courses, programs, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <FaFilter />
            <span>Filters</span>
            <FaChevronDown className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            <FaTimes />
            <span>Clear all</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({...filters, level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="certificate">Certificate</option>
                <option value="diploma">Diploma</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                value={filters.duration}
                onChange={(e) => setFilters({...filters, duration: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Durations</option>
                <option value="short">Short-term (≤30 days)</option>
                <option value="medium">Medium-term (≤90 days)</option>
                <option value="long">Long-term (>90 days)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment</label>
              <select
                value={filters.enrollment}
                onChange={(e) => setFilters({...filters, enrollment: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sizes</option>
                <option value="low">Small (≤20)</option>
                <option value="medium">Medium (21-100)</option>
                <option value="high">Large (>100)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={filters.format}
                onChange={(e) => setFilters({...filters, format: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Formats</option>
                <option value="topics">Topics</option>
                <option value="weeks">Weeks</option>
                <option value="social">Social</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{course.fullname}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {getCourseLevel(course)}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {getCourseDuration(course)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {course.summary || 'No description available'}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FaBookOpen className="mr-1" />
                        {course.categoryname}
                      </span>
                      <span className="flex items-center">
                        <FaUsers className="mr-1" />
                        {course.enrolledusercount} enrolled
                      </span>
                      <span className="flex items-center">
                        <FaClock className="mr-1" />
                        {new Date(course.startdate * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center">
                      <FaExternalLinkAlt className="mr-1" />
                      Open in Moodle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : searchTerm.length >= 2 ? (
          <div className="text-center py-12">
            <FaBookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-600">Enter at least 2 characters to search for courses</p>
          </div>
        )}
      </div>
    </div>
  )
}

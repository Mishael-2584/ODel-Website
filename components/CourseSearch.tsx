'use client'

import { useState, useEffect, useMemo } from 'react'
import { FaSearch, FaFilter, FaTimes, FaBook, FaGraduationCap, FaClock, FaStar, FaUser } from 'react-icons/fa'

interface Course {
  id: string
  title: string
  school: string
  level: string
  duration: string
  students: number
  rating: number
  credits: number
  description: string
  instructor?: string
  category: string
  price?: number
  language: string
  certificate: boolean
  badge?: string
}

interface CourseSearchProps {
  courses: Course[]
  onCourseSelect?: (course: Course) => void
}

export default function CourseSearch({ courses, onCourseSelect }: CourseSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [isLoading, setIsLoading] = useState(false)

  // Get unique values for filters
  const schools = useMemo(() => {
    const uniqueSchools = [...new Set(courses.map(course => course.school))]
    return uniqueSchools.sort()
  }, [courses])

  const levels = useMemo(() => {
    const uniqueLevels = [...new Set(courses.map(course => course.level))]
    return uniqueLevels.sort()
  }, [courses])

  const durations = useMemo(() => {
    const uniqueDurations = [...new Set(courses.map(course => course.duration))]
    return uniqueDurations.sort()
  }, [courses])

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.school.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSchool = !selectedSchool || course.school === selectedSchool
      const matchesLevel = !selectedLevel || course.level === selectedLevel
      const matchesDuration = !selectedDuration || course.duration === selectedDuration

      return matchesSearch && matchesSchool && matchesLevel && matchesDuration
    })

    // Sort courses
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'students':
        filtered.sort((a, b) => b.students - a.students)
        break
      case 'duration':
        filtered.sort((a, b) => parseInt(a.duration) - parseInt(b.duration))
        break
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        // Relevance - keep original order
        break
    }

    return filtered
  }, [courses, searchTerm, selectedSchool, selectedLevel, selectedDuration, sortBy])

  // Simulate loading when filters change
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedSchool, selectedLevel, selectedDuration, sortBy])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedSchool('')
    setSelectedLevel('')
    setSelectedDuration('')
    setSortBy('relevance')
  }

  const activeFiltersCount = [selectedSchool, selectedLevel, selectedDuration].filter(Boolean).length

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses, programs, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaFilter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-gold-500 text-primary-900 text-xs font-bold px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="rating">Sort by Rating</option>
            <option value="students">Sort by Students</option>
            <option value="duration">Sort by Duration</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedSchool && (
              <span className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                School: {selectedSchool}
                <button
                  onClick={() => setSelectedSchool('')}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedLevel && (
              <span className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                Level: {selectedLevel}
                <button
                  onClick={() => setSelectedLevel('')}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedDuration && (
              <span className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                Duration: {selectedDuration}
                <button
                  onClick={() => setSelectedDuration('')}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 animate-slide-down">
          <div className="grid md:grid-cols-3 gap-4">
            {/* School Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                School
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Schools</option>
                {schools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Durations</option>
                {durations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isLoading ? 'Searching...' : `${filteredCourses.length} Courses Found`}
          </h3>
          {!isLoading && searchTerm && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Course List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => onCourseSelect?.(course)}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary-300 dark:hover:border-primary-500 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {course.title}
                      </h4>
                      {course.badge && (
                        <span className="bg-gold-100 text-gold-800 text-xs font-semibold px-2 py-1 rounded-full">
                          {course.badge}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <FaGraduationCap className="h-4 w-4" />
                        <span>{course.school}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaBook className="h-4 w-4" />
                        <span>{course.level}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaClock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaUser className="h-4 w-4" />
                        <span>{course.students} students</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaStar className="h-4 w-4 text-gold-500" />
                        <span>{course.rating}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    {course.certificate && (
                      <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                        Certificate
                      </div>
                    )}
                    <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {course.credits} credits
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

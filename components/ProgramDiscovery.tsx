'use client'

import React, { useState, useEffect } from 'react'
import { FaSpinner, FaExclamationCircle, FaTimes, FaArrowRight } from 'react-icons/fa'

interface CategoryWithStats {
  id: number
  name: string
  courseCount: number
  totalEnrollments: number
  description?: string
}

interface CourseDetail {
  id: number
  fullname: string
  shortname: string
  summary: string
  enrolledusercount: number
  startdate: number
  enddate: number
  visible: number
  categoryname?: string
}

interface ProgramCardProps {
  category: CategoryWithStats
  onExplore: (category: CategoryWithStats) => void
}

const ProgramCard: React.FC<ProgramCardProps> = ({ category, onExplore }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-400"></div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-gray-600">
              📚 Programs
            </span>
            <span className="font-bold text-blue-600">{category.courseCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-gray-600">
              👥 Students
            </span>
            <span className="font-bold text-blue-600">{category.totalEnrollments}</span>
          </div>
        </div>
        <button
          onClick={() => onExplore(category)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
        >
          Explore Programs <FaArrowRight className="text-sm" />
        </button>
      </div>
    </div>
  )
}

interface CategoryDetailsModalProps {
  category: CategoryWithStats | null
  courses: CourseDetail[]
  loading: boolean
  error: string | null
  onClose: () => void
}

const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({
  category,
  courses,
  loading,
  error,
  onClose
}) => {
  const [courseStats, setCourseStats] = useState<{
    [key: number]: { enrolledUsers: number; activeUsers: number }
  }>({})
  const [loadingStats, setLoadingStats] = useState(true)

  // Fetch enrollment stats for all courses in this category
  useEffect(() => {
    if (!courses || courses.length === 0) {
      setLoadingStats(false)
      return
    }

    const fetchEnrollmentStats = async () => {
      setLoadingStats(true)
      const stats: { [key: number]: { enrolledUsers: number; activeUsers: number } } = {}

      try {
        // Fetch stats in parallel for all courses
        const requests = courses.map(course =>
          fetch(`/api/moodle?action=course-enrollment-stats&courseId=${course.id}`)
            .then(res => res.json())
            .then(data => {
              console.log(`Course ${course.id} enrollment:`, data)
              if (data.success) {
                stats[course.id] = {
                  enrolledUsers: data.enrolledUsers || 0,
                  activeUsers: data.activeUsers || 0
                }
                console.log(`${data.cached ? '✓ Cached' : '✗ Fetched'} enrollment for course ${course.id}`)
              } else {
                stats[course.id] = { enrolledUsers: 0, activeUsers: 0 }
              }
            })
            .catch(err => {
              console.error(`Error fetching stats for course ${course.id}:`, err)
              stats[course.id] = { enrolledUsers: 0, activeUsers: 0 }
            })
        )

        // Wait for all requests to complete
        await Promise.all(requests)
      } finally {
        setCourseStats(stats)
        setLoadingStats(false)
      }
    }

    fetchEnrollmentStats()
  }, [courses])

  if (!category) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-400 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{category.name}</h2>
            <p className="text-blue-100 mt-1">
              {category.courseCount} Programs • {category.totalEnrollments} Total Students
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="animate-spin text-blue-600 mb-3" size={40} />
              <p className="text-gray-600">Loading programs...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <FaExclamationCircle className="text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No programs found in this category.</p>
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="space-y-4">
              {courses.map((course) => {
                const stats = courseStats[course.id] || { enrolledUsers: 0, activeUsers: 0 }
                
                return (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{course.fullname}</h4>
                        <p className="text-sm text-gray-600 mt-1">Code: {course.shortname}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {course.visible === 1 ? '✓ Active' : '⊘ Hidden'}
                      </span>
                    </div>
                    
                    {course.summary && (
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{course.summary}</p>
                    )}
                    
                    <div className="flex gap-6 text-sm">
                      <span className="flex items-center gap-2">
                        <strong>👥 Enrolled:</strong>
                        {loadingStats ? (
                          <FaSpinner className="animate-spin text-blue-600 text-xs" />
                        ) : (
                          <strong className="text-blue-600">{stats.enrolledUsers}</strong>
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        <strong>💬 Active:</strong>
                        {loadingStats ? (
                          <FaSpinner className="animate-spin text-green-600 text-xs" />
                        ) : (
                          <strong className="text-green-600">{stats.activeUsers}</strong>
                        )}
                      </span>
                      {course.startdate > 0 && (
                        <span className="flex items-center gap-2">
                          <strong>📅 Start:</strong>
                          {new Date(course.startdate * 1000).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProgramDiscovery() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithStats | null>(null)
  const [categoryDetails, setCategoryDetails] = useState<CourseDetail[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  useEffect(() => {
    fetchProgramData()
  }, [])

  const fetchProgramData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch categories
      const categoriesResponse = await fetch('/api/moodle?action=categories')
      const categoriesData = await categoriesResponse.json()

      if (!categoriesData.success) {
        throw new Error('Failed to fetch categories')
      }

      // Fetch courses
      const coursesResponse = await fetch('/api/moodle?action=courses')
      const coursesData = await coursesResponse.json()

      if (!coursesData.success) {
        throw new Error('Failed to fetch courses')
      }

      // Process categories with enrollment stats
      const allCategories = categoriesData.data
        .map((category: any) => {
          const categoryCourses = coursesData.data.filter(
            (course: any) => course.categoryid === category.id
          )
          const totalEnrollments = categoryCourses.reduce(
            (sum: number, course: any) => sum + (course.enrolledusercount || 0),
            0
          )
          
          return {
            id: category.id,
            name: category.name,
            courseCount: categoryCourses.length,
            totalEnrollments,
            description: category.description
          }
        })
        .filter((cat: CategoryWithStats) => cat.courseCount > 0)
      
      // Filter for 2025/2026 academic year only
      const filtered2025Categories = allCategories.filter((cat: CategoryWithStats) => 
        cat.name.toLowerCase().includes('2025/2026')
      )
      
      // Sort by enrollment
      const sortedCategories = filtered2025Categories.sort((a: CategoryWithStats, b: CategoryWithStats) => 
        b.totalEnrollments - a.totalEnrollments
      )
      
      setCategories(sortedCategories)
    } catch (err) {
      console.error('Error fetching program data:', err)
      setError('Failed to load programs. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleExploreCategory = async (category: CategoryWithStats) => {
    setSelectedCategory(category)
    setCategoryDetails([])
    setDetailsLoading(true)
    setDetailsError(null)

    try {
      const response = await fetch(`/api/moodle?action=category-courses&categoryId=${category.id}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch courses')
      }

      setCategoryDetails(data.data || [])
    } catch (err) {
      console.error('Error fetching category details:', err)
      setDetailsError('Failed to load programs for this category.')
    } finally {
      setDetailsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 mb-3" size={40} />
        <p className="text-gray-600">Loading programs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <FaExclamationCircle className="text-red-600" />
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No 2025/2026 programs found.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <ProgramCard
            key={category.id}
            category={category}
            onExplore={handleExploreCategory}
          />
        ))}
      </div>

      <CategoryDetailsModal
        category={selectedCategory}
        courses={categoryDetails}
        loading={detailsLoading}
        error={detailsError}
        onClose={() => setSelectedCategory(null)}
      />
    </>
  )
}

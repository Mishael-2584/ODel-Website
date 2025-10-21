'use client'

import React, { useState, useEffect } from 'react'
import { FaSpinner, FaChevronRight, FaArrowLeft, FaBookOpen, FaGraduationCap, FaFolder } from 'react-icons/fa'

interface Category {
  id: number
  name: string
  courseCount?: number
  totalEnrollments?: number
  children?: any[]
  parent: number
}

interface NavigationLevel {
  levelName: string
  icon: React.ReactNode
  categoryId: number | null
  categories: Category[]
}

// Simple in-memory cache
const categoryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const getCacheKey = (action: string, params: any) => {
  return `${action}_${JSON.stringify(params)}`
}

const getFromCache = (key: string) => {
  const entry = categoryCache.get(key)
  if (!entry) return null
  
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    categoryCache.delete(key)
    return null
  }
  
  return entry.data
}

const setInCache = (key: string, data: any) => {
  categoryCache.set(key, { data, timestamp: Date.now() })
}

export default function CategoryHierarchy() {
  const [navigationStack, setNavigationStack] = useState<NavigationLevel[]>([
    {
      levelName: 'Academic Year',
      icon: <FaGraduationCap className="text-blue-600" />,
      categoryId: null,
      categories: []
    }
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial root categories
  useEffect(() => {
    const fetchRootCategories = async () => {
      try {
        setLoading(true)
        
        // Check cache first
        const cacheKey = getCacheKey('root-categories', {})
        const cached = getFromCache(cacheKey)
        
        if (cached) {
          console.log('✓ Loading root categories from cache')
          setNavigationStack([
            {
              levelName: 'Academic Year',
              icon: <FaGraduationCap className="text-blue-600" />,
              categoryId: null,
              categories: cached
            }
          ])
          setLoading(false)
          return
        }
        
        console.log('✗ Fetching root categories from API')
        const response = await fetch('/api/moodle?action=root-categories')
        const data = await response.json()

        if (data.success) {
          setInCache(cacheKey, data.data)
          setNavigationStack([
            {
              levelName: 'Academic Year',
              icon: <FaGraduationCap className="text-blue-600" />,
              categoryId: null,
              categories: data.data
            }
          ])
        }
      } catch (err) {
        console.error('Error fetching root categories:', err)
        setError('Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    fetchRootCategories()
  }, [])

  const handleSelectCategory = async (category: Category, levelIndex: number) => {
    try {
      setLoading(true)

      // Determine level names for hierarchy
      const levelNames = ['Academic Year', 'Schools', 'Departments', 'Program Types', 'Courses']
      const nextLevelIndex = levelIndex + 1
      const nextLevelName = levelNames[nextLevelIndex] || 'Subcategories'

      // Check cache first
      const cacheKey = getCacheKey('category-children', { categoryId: category.id })
      const cached = getFromCache(cacheKey)
      
      let childrenData = cached

      if (!cached) {
        // Fetch children of selected category
        console.log(`✗ Fetching children for category ${category.id}`)
        const response = await fetch(`/api/moodle?action=category-children&categoryId=${category.id}`)
        const data = await response.json()

        if (data.success && data.data.length > 0) {
          childrenData = data.data
          setInCache(cacheKey, childrenData)
        }
      } else {
        console.log(`✓ Loading children for category ${category.id} from cache`)
      }

      if (childrenData && childrenData.length > 0) {
        // Truncate stack to current level and add new level
        const newStack = navigationStack.slice(0, levelIndex + 1)
        
        // Choose icon based on level
        let icon = <FaFolder className="text-green-600" />
        if (nextLevelIndex === 1) icon = <FaFolder className="text-blue-600" />
        else if (nextLevelIndex === 2) icon = <FaBookOpen className="text-purple-600" />
        else if (nextLevelIndex === 3) icon = <FaBookOpen className="text-indigo-600" />
        else if (nextLevelIndex === 4) icon = <FaBookOpen className="text-orange-600" />

        newStack.push({
          levelName: nextLevelName,
          icon,
          categoryId: category.id,
          categories: childrenData
        })

        setNavigationStack(newStack)
      } else {
        // No children - this might be a leaf category, show courses
        if (nextLevelIndex <= 4) {
          const courseCacheKey = getCacheKey('category-courses', { categoryId: category.id })
          let coursesData = getFromCache(courseCacheKey)

          if (!coursesData) {
            console.log(`✗ Fetching courses for category ${category.id}`)
            const coursesResponse = await fetch(`/api/moodle?action=category-courses&categoryId=${category.id}`)
            const coursesResponseData = await coursesResponse.json()

            if (coursesResponseData.success) {
              coursesData = coursesResponseData.data
              setInCache(courseCacheKey, coursesData)
            }
          } else {
            console.log(`✓ Loading courses for category ${category.id} from cache`)
          }

          if (coursesData) {
            const newStack = navigationStack.slice(0, levelIndex + 1)
            newStack.push({
              levelName: 'Courses',
              icon: <FaBookOpen className="text-orange-600" />,
              categoryId: category.id,
              categories: coursesData.map((course: any) => ({
                id: course.id,
                name: course.fullname,
                parent: course.categoryid
              }))
            })
            setNavigationStack(newStack)
          }
        }
      }
    } catch (err) {
      console.error('Error navigating to category:', err)
      setError('Failed to load subcategories')
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(navigationStack.slice(0, -1))
    }
  }

  const currentLevel = navigationStack[navigationStack.length - 1]

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {navigationStack.map((level, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (idx < navigationStack.length - 1) {
                      setNavigationStack(navigationStack.slice(0, idx + 1))
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {level.icon}
                  <span className="text-sm font-medium text-gray-700">{level.levelName}</span>
                </button>
                {idx < navigationStack.length - 1 && (
                  <FaChevronRight className="text-gray-400 text-sm" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">{currentLevel.levelName}</h1>
            {navigationStack.length > 1 && (
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FaArrowLeft size={16} />
                Back
              </button>
            )}
          </div>
          <p className="text-gray-600">
            {currentLevel.categories.length} {currentLevel.levelName.toLowerCase()} available
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-blue-600 mb-3" size={48} />
            <p className="text-gray-600 text-lg">Loading {currentLevel.levelName.toLowerCase()}...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Category Grid */}
        {!loading && currentLevel.categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentLevel.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleSelectCategory(category, navigationStack.length - 1)}
                className="text-left group"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-105 overflow-hidden h-full flex flex-col">
                  {/* Card Header */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:from-blue-600 group-hover:to-purple-600 transition-all"></div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors break-words">
                      {category.name}
                    </h3>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-100">
                      {category.courseCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <FaBookOpen className="text-blue-500" size={14} />
                          <span>
                            <strong>{category.courseCount}</strong> Programs
                          </span>
                        </div>
                      )}
                      {category.totalEnrollments !== undefined && (
                        <div className="flex items-center gap-1">
                          <FaGraduationCap className="text-green-500" size={14} />
                          <span>
                            <strong>{category.totalEnrollments}</strong> Students
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Arrow Indicator */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Explore</span>
                      <FaChevronRight className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && currentLevel.categories.length === 0 && (
          <div className="text-center py-20">
            <FaBookOpen className="text-gray-300 mx-auto mb-4" size={64} />
            <p className="text-gray-600 text-lg">No {currentLevel.levelName.toLowerCase()} available</p>
          </div>
        )}
      </div>
    </div>
  )
}

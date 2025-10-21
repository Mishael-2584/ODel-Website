'use client'

import React, { useState, useEffect } from 'react'
import { FaSpinner, FaChevronRight, FaArrowLeft, FaBookOpen, FaGraduationCap, FaFolder, FaUser } from 'react-icons/fa'

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
  showStats?: boolean // New: control whether to show stats
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

// Decode HTML entities
const decodeHtmlEntities = (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

// Browser-based persistent cache using localStorage
const getCourseDetailsFromBrowser = (courseId: number) => {
  try {
    const cached = localStorage.getItem(`course-details-${courseId}`)
    if (cached) {
      const data = JSON.parse(cached)
      // Check if expired (1 hour = 3600000ms)
      if (Date.now() - data.timestamp < 3600000) {
        console.log(`✓ Browser cache hit for course ${courseId}`)
        return data.value
      }
      localStorage.removeItem(`course-details-${courseId}`)
    }
  } catch (e) {
    console.error('Cache read error:', e)
  }
  return null
}

const setCourseDetailsInBrowser = (courseId: number, data: any) => {
  try {
    localStorage.setItem(`course-details-${courseId}`, JSON.stringify({
      value: data,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.error('Cache write error:', e)
  }
}

const getCategoryCoursesFromBrowser = (categoryId: number) => {
  try {
    const cached = localStorage.getItem(`category-courses-${categoryId}`)
    if (cached) {
      const data = JSON.parse(cached)
      // Check if expired (2 hours = 7200000ms)
      if (Date.now() - data.timestamp < 7200000) {
        console.log(`✓ Browser cache hit for category ${categoryId}`)
        return data.value
      }
      localStorage.removeItem(`category-courses-${categoryId}`)
    }
  } catch (e) {
    console.error('Cache read error:', e)
  }
  return null
}

const setCategoryCoursesInBrowser = (categoryId: number, data: any) => {
  try {
    localStorage.setItem(`category-courses-${categoryId}`, JSON.stringify({
      value: data,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.error('Cache write error:', e)
  }
}

// Enhanced premium loader styles
const loaderStyles = `
@keyframes orbit {
  0% { transform: rotate(0deg) translateX(45px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(45px) rotate(-360deg); }
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7),
                inset 0 0 0 0 rgba(217, 119, 6, 0);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(59, 130, 246, 0),
                inset 0 0 0 5px rgba(217, 119, 6, 0.3);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0),
                inset 0 0 0 0 rgba(217, 119, 6, 0);
  }
}

@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float-particle {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-60px) scale(0);
    opacity: 0;
  }
}

@keyframes shimmer {
  0% { 
    background-position: -1000px 0;
  }
  100% { 
    background-position: 1000px 0;
  }
}

@keyframes glow-fade {
  0%, 100% { 
    opacity: 0.3;
    filter: blur(2px);
  }
  50% { 
    opacity: 1;
    filter: blur(0px);
  }
}

.loader-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  background: conic-gradient(
    from 0deg,
    #3b82f6 0deg,
    #60a5fa 90deg,
    #d97706 180deg,
    #fbbf24 270deg,
    #3b82f6 360deg
  );
  border-radius: 50%;
  animation: gradient-flow 4s ease infinite, pulse-ring 2s ease-in-out infinite;
  opacity: 0.9;
}

.loader-core {
  position: absolute;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.1), rgba(255,255,255,0));
  border-radius: 50%;
  animation: glow-fade 2s ease-in-out infinite;
}

.orbiting-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #3b82f6, #d97706);
  border-radius: 50%;
  animation: orbit 3s linear infinite;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
}

.particle {
  position: absolute;
  pointer-events: none;
}

.particle-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #d97706);
  box-shadow: 0 0 10px rgba(217, 119, 6, 0.6);
  animation: float-particle 2s ease-out forwards;
}

.loading-text {
  background: linear-gradient(135deg, #3b82f6, #d97706, #3b82f6);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-flow 3s ease infinite;
  font-weight: 600;
  font-size: 1.125rem;
}

.pulse-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin: 0 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.pulse-dot:nth-child(1) {
  background: #3b82f6;
  animation-delay: 0s;
}

.pulse-dot:nth-child(2) {
  background: #d97706;
  animation-delay: 0.25s;
}

.pulse-dot:nth-child(3) {
  background: #3b82f6;
  animation-delay: 0.5s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
}

.accent-line {
  position: absolute;
  width: 2px;
  height: 30px;
  background: linear-gradient(to bottom, #d97706, transparent);
  left: 50%;
  top: -40px;
  transform: translateX(-50%);
  border-radius: 1px;
  opacity: 0.6;
}
`

export default function CategoryHierarchy() {
  const [navigationStack, setNavigationStack] = useState<NavigationLevel[]>([
    {
      levelName: 'Academic Year',
      icon: <FaGraduationCap className="text-blue-600" />,
      categoryId: null,
      categories: [],
      showStats: false // Academic Year doesn't show stats
    }
  ])
  const [loading, setLoading] = useState(true)
  const [nextLevelLoading, setNextLevelLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial root categories
  useEffect(() => {
    // Wait for preload to complete before initializing
    const initializeHierarchy = async () => {
      try {
        // Wait for moodle service to finish preloading
        console.log('⏳ Waiting for Moodle data preload...')
        // Give preload a bit of time to complete
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setLoading(true)
        const categories = await fetch('/api/moodle?action=root-categories')
          .then(r => r.json())
        
        if (categories.success) {
          setNavigationStack([{
            levelName: 'Academic Year',
            categories: categories.data,
            showStats: false
          }])
          console.log('✓ Hierarchy initialized with preloaded data')
        } else {
          setError('Failed to load categories')
        }
      } catch (err) {
        console.error('Error initializing hierarchy:', err)
        setError('Failed to load academic years')
      } finally {
        setLoading(false)
      }
    }

    initializeHierarchy()
  }, [])

  const handleSelectCategory = async (category: Category, levelIndex: number) => {
    try {
      setNextLevelLoading(true)

      // Determine level names for hierarchy
      const levelNames = ['Academic Year', 'Schools', 'Departments', 'Program Types', 'Courses']
      const nextLevelIndex = levelIndex + 1
      const nextLevelName = levelNames[nextLevelIndex] || 'Subcategories'

      // Determine if next level should show stats
      const showStatsAtNextLevel = nextLevelIndex === 3 || nextLevelIndex === 4 // Program Types and Courses

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

        // Decode HTML entities in category names
        const decodedChildren = childrenData.map((child: any) => ({
          ...child,
          name: decodeHtmlEntities(child.name || '')
        }))

        newStack.push({
          levelName: nextLevelName,
          icon,
          categoryId: category.id,
          categories: decodedChildren,
          showStats: showStatsAtNextLevel
        })

        setNavigationStack(newStack)
      } else {
        // No children - this might be a leaf category, show courses
        if (nextLevelIndex <= 4) {
          const courseCacheKey = getCacheKey('category-courses-with-details', { categoryId: category.id })
          
          // Check browser cache first
          let coursesData = getCategoryCoursesFromBrowser(category.id)

          if (!coursesData) {
            console.log(`✗ Fetching courses with details for category ${category.id}`)
            // Use the new courses-with-details endpoint to get student count and instructor names
            const coursesResponse = await fetch(`/api/moodle?action=courses-with-details&categoryId=${category.id}`)
            const coursesResponseData = await coursesResponse.json()

            if (coursesResponseData.success) {
              coursesData = coursesResponseData.data
              // Cache in browser
              setCategoryCoursesInBrowser(category.id, coursesData)
            }
          } else {
            console.log(`✓ Loading courses with details for category ${category.id} from browser cache`)
          }

          if (coursesData) {
            const newStack = navigationStack.slice(0, levelIndex + 1)
            
            // Decode HTML entities in course names
            const decodedCourses = coursesData.map((course: any) => ({
              id: course.id,
              name: decodeHtmlEntities(course.fullname || ''),
              parent: course.categoryid,
              enrolledusercount: course.enrolledusercount || 0,
              summary: course.summary,
              // Store instructor names - now properly fetched from Moodle
              teacher: course.instructorNames || 'Not assigned'
            }))

            newStack.push({
              levelName: 'Courses',
              icon: <FaBookOpen className="text-orange-600" />,
              categoryId: category.id,
              categories: decodedCourses,
              showStats: true // Show stats on courses
            })
            setNavigationStack(newStack)
          }
        }
      }
    } catch (err) {
      console.error('Error navigating to category:', err)
      setError('Failed to load subcategories')
    } finally {
      setNextLevelLoading(false)
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
        {nextLevelLoading && (
          <>
            <style>{loaderStyles}</style>
            <div className="flex flex-col items-center justify-center py-24">
              {/* Premium Animated Loader */}
              <div className="relative mb-12">
                {/* Accent line */}
                <div className="accent-line"></div>

                {/* Main Loader Container */}
                <div className="loader-container">
                  {/* Gradient Pulsing Ring */}
                  <div className="gradient-ring rounded-full"></div>

                  {/* Orbiting Dot */}
                  <div className="orbiting-dot"></div>

                  {/* Inner Glow Core */}
                  <div className="loader-core"></div>
                </div>

                {/* Floating Particles */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={`particle-${i}`}
                    className="particle"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${(i * 72)}deg) translateY(-60px)`,
                      animation: `float-particle ${1.5 + i * 0.2}s ease-out ${i * 0.15}s forwards`,
                    }}
                  >
                    <div className="particle-dot"></div>
                  </div>
                ))}
              </div>

              {/* Loading Text with Gradient */}
              <p className="loading-text mb-4">Loading next page...</p>

              {/* Animated Pulse Dots */}
              <div className="flex items-center justify-center">
                <span className="pulse-dot"></span>
                <span className="pulse-dot"></span>
                <span className="pulse-dot"></span>
              </div>
            </div>
          </>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Category Grid */}
        {!nextLevelLoading && currentLevel.categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentLevel.categories.map((category, index) => {
              // Check if this is the first category in Academic Year level (latest/current)
              const isCurrentYear = currentLevel.levelName === 'Academic Year' && index === 0
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category, navigationStack.length - 1)}
                  className="text-left group"
                >
                  <div className={`rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-105 overflow-hidden h-full flex flex-col ${
                    isCurrentYear 
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-500 ring-2 ring-blue-200 relative' 
                      : 'bg-white relative'
                  }`}>
                    {/* Current Badge */}
                    {isCurrentYear && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          Current
                        </div>
                      </div>
                    )}

                    {/* Card Header */}
                    <div className={`h-2 bg-gradient-to-r ${
                      isCurrentYear
                        ? 'from-blue-600 via-purple-600 to-pink-500 group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-pink-600'
                        : 'from-blue-500 to-purple-500 group-hover:from-blue-600 group-hover:to-purple-600'
                    } transition-all`}></div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-grow relative">
                      <h3 className={`text-lg font-bold mb-2 break-words transition-colors ${
                        isCurrentYear
                          ? 'text-blue-700 group-hover:text-blue-800'
                          : 'text-gray-900 group-hover:text-blue-600'
                      }`}>
                        {category.name}
                      </h3>

                      {/* Show summary for courses */}
                      {currentLevel.levelName === 'Courses' && category.summary && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {decodeHtmlEntities(category.summary)}
                        </p>
                      )}

                      {/* Stats - only show if showStats is true */}
                      {currentLevel.showStats && (
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-100">
                          {currentLevel.levelName === 'Program Types' && category.courseCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <FaBookOpen className="text-blue-500" size={14} />
                              <span>
                                <strong>{category.courseCount}</strong> Courses
                              </span>
                            </div>
                          )}
                          
                          {currentLevel.levelName === 'Courses' && category.enrolledusercount !== undefined && (
                            <div className="flex items-center gap-1">
                              <FaGraduationCap className="text-green-500" size={14} />
                              <span>
                                <strong>{category.enrolledusercount}</strong> Students
                              </span>
                            </div>
                          )}

                          {currentLevel.levelName === 'Courses' && category.teacher && category.teacher !== 'Not assigned' && (
                            <div className="flex items-start gap-2 w-full">
                              <FaUser className="text-purple-500 flex-shrink-0 mt-0.5" size={14} />
                              <span className="break-words">
                                <strong>{category.teacher}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Arrow Indicator */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`text-xs font-medium uppercase tracking-wide ${
                          isCurrentYear ? 'text-blue-600' : 'text-gray-500'
                        }`}>Explore</span>
                        <FaChevronRight className={`group-hover:translate-x-1 transition-transform ${
                          isCurrentYear ? 'text-blue-600' : 'text-blue-600'
                        }`} />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!nextLevelLoading && currentLevel.categories.length === 0 && (
          <div className="text-center py-20">
            <FaBookOpen className="text-gray-300 mx-auto mb-4" size={64} />
            <p className="text-gray-600 text-lg">No {currentLevel.levelName.toLowerCase()} available</p>
          </div>
        )}
      </div>
    </div>
  )
}

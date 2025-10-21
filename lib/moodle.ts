// Moodle API Integration Service
// This service handles communication with Moodle LMS API

interface MoodleConfig {
  baseUrl: string
  apiToken: string
  serviceName: string
}

interface MoodleCourse {
  id: number
  fullname: string
  shortname: string
  summary: string
  categoryid: number
  categoryname?: string
  startdate: number
  enddate: number
  enrolledusercount: number
  idnumber: string
  visible: number
  format: string
  showgrades: number
  lang: string
  timecreated: number
  timemodified: number
  courseformatoptions?: Array<{
    name: string
    value: string
  }>
}

interface MoodleCategory {
  id: number
  name: string
  idnumber: string
  description: string
  descriptionformat: number
  parent: number
  sortorder: number
  coursecount: number
  visible: number
  visibleold: number
  timemodified: number
  depth: number
  path: string
  theme: string
}

interface MoodleUser {
  id: number
  username: string
  firstname: string
  lastname: string
  fullname: string
  email: string
  department: string
  firstaccess: number
  lastaccess: number
  lastlogin: number
  lastip: string
  suspended: boolean
  description: string
  descriptionformat: number
  city: string
  country: string
  profileimageurl: string
  profileimageurlsmall: string
  groups: Array<{
    id: number
    name: string
    description: string
  }>
  roles: Array<{
    roleid: number
    name: string
    shortname: string
  }>
}

interface MoodleEnrollment {
  id: number
  userid: number
  courseid: number
  status: number
  timestart: number
  timeend: number
  modifierid: number
  timecreated: number
  timemodified: number
}

// Cache interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// Helper function to check if response is an error
function isErrorResponse(response: any): boolean {
  if (!response) return false
  return !!(response.exception || response.error || response.errorcode)
}

class MoodleService {
  private config: MoodleConfig
  private cache: Map<string, CacheEntry<any>> = new Map()
  private cacheTTL = 5 * 60 * 1000 // 5 minutes default TTL

  constructor(config: MoodleConfig) {
    this.config = config
  }

  // Cache management
  private getCacheKey(action: string, params: any = {}): string {
    return `${action}:${JSON.stringify(params)}`
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear()
  }

  // Public cache methods
  public getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    // Check if cache has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  public setCache<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.cacheTTL
    })
  }

  // Get all courses with filtering options
  async getCourses(options: {
    categoryId?: number
    search?: string
    limit?: number
    offset?: number
  } = {}): Promise<MoodleCourse[]> {
    try {
      const cacheKey = this.getCacheKey('getCourses', options)
      
      // Check cache first
      const cached = this.getFromCache<MoodleCourse[]>(cacheKey)
      if (cached) {
        console.log('Returning cached courses')
        return cached
      }

      // Build params without categoryId filter (we'll filter locally)
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_course_get_courses',
        moodlewsrestformat: 'json'
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Check if response is an error
      if (isErrorResponse(result)) {
        console.error('Moodle API Error:', result)
        return []
      }
      
      // Filter results if search term provided
      let courses = result || []
      
      if (options.search) {
        const searchTerm = options.search.toLowerCase()
        courses = courses.filter((course: MoodleCourse) => {
          // Safely access all fields with fallback to empty string
          const fullname = (course.fullname || '').toLowerCase()
          const summary = (course.summary || '').toLowerCase()
          const categoryname = (course.categoryname || '').toLowerCase()
          const shortname = (course.shortname || '').toLowerCase()
          const idnumber = (course.idnumber || '').toLowerCase()
          
          return fullname.includes(searchTerm) ||
                 summary.includes(searchTerm) ||
                 categoryname.includes(searchTerm) ||
                 shortname.includes(searchTerm) ||
                 idnumber.includes(searchTerm)
        })
      }

      // Filter by categoryId if provided
      if (options.categoryId) {
        courses = courses.filter((course: MoodleCourse) => course.categoryid === options.categoryId)
      }

      // Apply pagination
      if (options.offset || options.limit) {
        const start = options.offset || 0
        const end = options.limit ? start + options.limit : courses.length
        courses = courses.slice(start, end)
      }

      // Cache the results
      this.setCache(cacheKey, courses)
      
      return courses
    } catch (error) {
      console.error('Error fetching Moodle courses:', error)
      return []
    }
  }

  // Get course categories
  async getCategories(): Promise<MoodleCategory[]> {
    try {
      const cacheKey = this.getCacheKey('getCategories', {})
      
      // Check cache first
      const cached = this.getFromCache<MoodleCategory[]>(cacheKey)
      if (cached) {
        console.log('Returning cached categories')
        return cached
      }

      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_course_get_categories',
        moodlewsrestformat: 'json'
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Check if response is an error
      if (isErrorResponse(result)) {
        console.error('Moodle API Error:', result)
        return []
      }
      
      const categories = result || []
      
      // Cache the results
      this.setCache(cacheKey, categories)
      
      return categories
    } catch (error) {
      console.error('Error fetching Moodle categories:', error)
      return []
    }
  }

  // Get specific course details
  async getCourseDetails(courseId: number): Promise<MoodleCourse | null> {
    try {
      const courses = await this.getCourses()
      return courses.find(course => course.id === courseId) || null
    } catch (error) {
      console.error('Error fetching course details:', error)
      return null
    }
  }

  // Get enrolled users for a course
  async getCourseEnrollments(courseId: number): Promise<MoodleUser[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_enrol_get_enrolled_users',
        moodlewsrestformat: 'json',
        courseid: courseId.toString()
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Check if response is an error
      if (isErrorResponse(result)) {
        console.error('Moodle API Error:', result)
        return []
      }
      
      return result || []
    } catch (error) {
      console.error('Error fetching course enrollments:', error)
      return []
    }
  }

  // Search courses by keyword
  async searchCourses(searchTerm: string): Promise<MoodleCourse[]> {
    try {
      return await this.getCourses({ search: searchTerm })
    } catch (error) {
      console.error('Error searching courses:', error)
      return []
    }
  }

  // Get courses by category ID (returns ALL courses in category)
  async getCoursesByCategory(categoryId: number): Promise<MoodleCourse[]> {
    try {
      const cacheKey = this.getCacheKey('getCoursesByCategory', { categoryId })
      
      // Check cache first
      const cached = this.getFromCache<MoodleCourse[]>(cacheKey)
      if (cached) {
        console.log(`Returning cached courses for category ${categoryId}`)
        return cached
      }

      // First, get all courses
      const allCourses = await this.getCourses()
      
      // Filter to only courses in this category
      const courses = allCourses.filter(course => course.categoryid === categoryId)
      
      // Cache the results
      this.setCache(cacheKey, courses)
      
      return courses
    } catch (error) {
      console.error(`Error fetching courses for category ${categoryId}:`, error)
      return []
    }
  }

  // Get course enrollments with user count
  async getCourseEnrollmentStats(courseId: number, useCache = true): Promise<{
    enrolledUsers: number
    activeUsers: number
    lastAccess: number
  }> {
    try {
      const cacheKey = this.getCacheKey('getCourseEnrollmentStats', { courseId })
      
      if (useCache) {
        const cached = this.getFromCache<any>(cacheKey)
        if (cached) return cached
      }

      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_enrol_get_enrolled_users',
        moodlewsrestformat: 'json',
        courseid: courseId.toString(),
        options: JSON.stringify([
          { name: 'withcapability', value: '' },
          { name: 'limitfrom', value: '0' },
          { name: 'limitnumber', value: '1000' }
        ])
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (isErrorResponse(result)) {
        console.error('Moodle API Error fetching enrollments:', result)
        return { enrolledUsers: 0, activeUsers: 0, lastAccess: 0 }
      }

      const users = result || []
      const stats = {
        enrolledUsers: users.length,
        activeUsers: users.filter((u: any) => u.lastaccess > 0).length,
        lastAccess: Math.max(...users.map((u: any) => u.lastaccess || 0))
      }

      this.setCache(cacheKey, stats)
      return stats
    } catch (error) {
      console.error(`Error fetching enrollment stats for course ${courseId}:`, error)
      return { enrolledUsers: 0, activeUsers: 0, lastAccess: 0 }
    }
  }

  // Get detailed course information including enrollment stats
  async getCourseDetailsWithStats(courseId: number): Promise<MoodleCourse | null> {
    try {
      const cacheKey = this.getCacheKey('getCourseDetailsWithStats', { courseId })
      
      const cached = this.getFromCache<MoodleCourse | null>(cacheKey)
      if (cached) return cached

      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_course_get_courses',
        moodlewsrestformat: 'json',
        options: JSON.stringify([
          { name: 'ids', value: courseId.toString() }
        ])
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (isErrorResponse(result)) {
        console.error('Moodle API Error:', result)
        return null
      }

      const courses = result || []
      if (courses.length === 0) return null

      const course = courses[0]
      
      // Try to get enrollment stats
      const enrollmentStats = await this.getCourseEnrollmentStats(courseId)
      course.enrolledusercount = enrollmentStats.enrolledUsers

      this.setCache(cacheKey, course)
      return course
    } catch (error) {
      console.error(`Error fetching course details for ${courseId}:`, error)
      return null
    }
  }

  // Get category with course count and enrollment stats
  async getCategoryStats(categoryId: number): Promise<{
    courseCount: number
    totalEnrollments: number
    activeStudents: number
  }> {
    try {
      const cacheKey = this.getCacheKey('getCategoryStats', { categoryId })
      
      const cached = this.getFromCache<any>(cacheKey)
      if (cached) return cached

      const courses = await this.getCoursesByCategory(categoryId)
      
      let totalEnrollments = 0
      let activeStudents = 0

      // Get enrollment stats for each course
      for (const course of courses) {
        const stats = await this.getCourseEnrollmentStats(course.id)
        totalEnrollments += stats.enrolledUsers
        activeStudents += stats.activeUsers
      }

      const result = {
        courseCount: courses.length,
        totalEnrollments,
        activeStudents
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error(`Error fetching category stats for ${categoryId}:`, error)
      return { courseCount: 0, totalEnrollments: 0, activeStudents: 0 }
    }
  }

  // Get course statistics
  async getCourseStatistics(): Promise<{
    totalCourses: number
    totalEnrollments: number
    categories: Array<{
      id: number
      name: string
      courseCount: number
    }>
    recentCourses: MoodleCourse[]
  }> {
    try {
      const [courses, categories] = await Promise.all([
        this.getCourses(),
        this.getCategories()
      ])

      const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrolledusercount || 0), 0)
      
      const categoryStats = categories.map(category => ({
        id: category.id,
        name: category.name,
        courseCount: category.coursecount
      }))

      const recentCourses = courses
        .sort((a, b) => (b.timemodified || 0) - (a.timemodified || 0))
        .slice(0, 5)

      return {
        totalCourses: courses.length,
        totalEnrollments,
        categories: categoryStats,
        recentCourses
      }
    } catch (error) {
      console.error('Error fetching course statistics:', error)
      return {
        totalCourses: 0,
        totalEnrollments: 0,
        categories: [],
        recentCourses: []
      }
    }
  }

  // Get user's enrolled courses
  async getUserCourses(userId: number): Promise<MoodleCourse[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_enrol_get_users_courses',
        moodlewsrestformat: 'json',
        userid: userId.toString()
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Check if response is an error
      if (isErrorResponse(result)) {
        console.error('Moodle API Error:', result)
        return []
      }
      
      return result || []
    } catch (error) {
      console.error('Error fetching user courses:', error)
      return []
    }
  }

  // Build hierarchical category tree
  buildCategoryTree(): { [key: number]: { name: string; parent: number; children: number[] } } {
    try {
      const cacheKey = 'categoryTree'
      const cached = this.getFromCache<any>(cacheKey)
      if (cached) return cached

      const allCategories = this.cache.get(this.getCacheKey('getCategories', {}))?.data || []
      
      if (!allCategories || allCategories.length === 0) {
        console.log('No cached categories, returning empty tree')
        return {}
      }

      const tree: { [key: number]: { name: string; parent: number; children: number[] } } = {}

      // First pass: create all nodes
      allCategories.forEach((cat: any) => {
        tree[cat.id] = {
          name: cat.name,
          parent: cat.parent,
          children: []
        }
      })

      // Second pass: build parent-child relationships
      allCategories.forEach((cat: any) => {
        if (cat.parent && cat.parent !== 0 && tree[cat.parent]) {
          tree[cat.parent].children.push(cat.id)
        }
      })

      // Cache for 10 minutes
      this.setCache(cacheKey, tree, 10 * 60 * 1000)
      return tree
    } catch (error) {
      console.error('Error building category tree:', error)
      return {}
    }
  }

  // Get breadcrumb path for a category
  getCategoryPath(categoryId: number, tree?: { [key: number]: { name: string; parent: number; children: number[] } }): any[] {
    try {
      const categoryTree = tree || this.buildCategoryTree()
      const path: any[] = []
      let currentId = categoryId

      while (currentId && categoryTree[currentId]) {
        const cat = categoryTree[currentId]
        path.unshift({
          id: currentId,
          name: cat.name
        })
        currentId = cat.parent
      }

      return path
    } catch (error) {
      console.error('Error getting category path:', error)
      return []
    }
  }

  // Get root categories (2025/2026.1 and similar)
  getRootCategories(): Promise<any[]> {
    try {
      return this.getCategories().then(categories => {
        return categories.filter((cat: any) => cat.parent === 0)
      })
    } catch (error) {
      console.error('Error getting root categories:', error)
      return Promise.resolve([])
    }
  }

  // Get immediate children of a category
  getCategoryChildren(parentId: number): Promise<any[]> {
    try {
      return this.getCategories().then(categories => {
        return categories.filter((cat: any) => cat.parent === parentId).sort((a: any, b: any) => a.name.localeCompare(b.name))
      })
    } catch (error) {
      console.error('Error getting category children:', error)
      return Promise.resolve([])
    }
  }

  // Get full category details with children and course counts
  async getCategoryWithDetails(categoryId: number): Promise<any> {
    try {
      const categories = await this.getCategories()
      const category = categories.find((c: any) => c.id === categoryId)
      
      if (!category) return null

      const children = categories.filter((c: any) => c.parent === categoryId)
      const courses = await this.getCourses({ categoryId })
      
      return {
        ...category,
        children: children.sort((a: any, b: any) => a.name.localeCompare(b.name)),
        courseCount: courses.length,
        totalEnrollments: courses.reduce((sum: number, c: any) => sum + (c.enrolledusercount || 0), 0)
      }
    } catch (error) {
      console.error('Error getting category details:', error)
      return null
    }
  }
}

// Moodle Configuration
export const moodleConfig: MoodleConfig = {
  baseUrl: process.env.NEXT_PUBLIC_MOODLE_URL || 'https://your-moodle-instance.com',
  apiToken: process.env.MOODLE_API_TOKEN || 'your-moodle-api-token',
  serviceName: 'UEAB ODeL Integration'
}

export const moodleService = new MoodleService(moodleConfig)

// Helper functions for chatbot integration
export async function searchMoodleCourses(query: string): Promise<MoodleCourse[]> {
  return await moodleService.searchCourses(query)
}

export async function getMoodleCourseDetails(courseId: number): Promise<MoodleCourse | null> {
  return await moodleService.getCourseDetails(courseId)
}

export async function getMoodleCategories(): Promise<MoodleCategory[]> {
  return await moodleService.getCategories()
}

export async function getMoodleCourseStatistics() {
  return await moodleService.getCourseStatistics()
}

// Environment variables needed:
/*
NEXT_PUBLIC_MOODLE_URL=https://your-moodle-instance.com
MOODLE_API_TOKEN=your-moodle-api-token-here
*/

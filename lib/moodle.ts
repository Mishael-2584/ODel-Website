// Moodle API Integration Service
// This service handles communication with Moodle LMS API

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface MoodleConfig {
  baseUrl: string
  apiToken: string
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

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes in milliseconds
const PRELOAD_KEY = 'moodle_preload_state'
const AGGRESSIVE_CACHE_TTL = 2 * 60 * 60 * 1000 // 2 hours for aggressive cache

class MoodleService {
  private config: MoodleConfig
  private cache: Map<string, CacheEntry<any>> = new Map()
  private isPreloading = false
  private preloadPromise: Promise<void> | null = null

  constructor(baseUrl: string, apiToken: string) {
    this.config = { baseUrl, apiToken }
    this.loadCacheFromStorage()
    // Start aggressive preload immediately
    this.startAggressivePreload()
  }

  // Load cache from localStorage
  private loadCacheFromStorage() {
    try {
      // Only try to access localStorage in browser environment
      if (typeof window === 'undefined') {
        console.log('ℹ️ Server-side: skipping localStorage cache load')
        return
      }

      const stored = localStorage.getItem('moodle_cache_v2')
      if (stored) {
        const parsed = JSON.parse(stored)
        Object.entries(parsed).forEach(([key, entry]: [string, any]) => {
          if (Date.now() - entry.timestamp < AGGRESSIVE_CACHE_TTL) {
            this.cache.set(key, entry)
          }
        })
        console.log(`✓ Loaded ${this.cache.size} items from localStorage cache`)
      }
    } catch (e) {
      console.error('Error loading cache from storage:', e)
    }
  }

  // Save cache to localStorage
  private saveCacheToStorage() {
    try {
      // Only try to access localStorage in browser environment
      if (typeof window === 'undefined') {
        return
      }

      const cacheObj: Record<string, any> = {}
      this.cache.forEach((entry, key) => {
        cacheObj[key] = entry
      })
      localStorage.setItem('moodle_cache_v2', JSON.stringify(cacheObj))
    } catch (e) {
      console.error('Error saving cache to storage:', e)
    }
  }

  // Get from cache
  getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > CACHE_TTL
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  // Set cache
  setCache<T>(key: string, data: T, ttl: number = CACHE_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
    // Periodically save to storage (debounced)
    this.saveCacheToStorage()
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
    try {
      localStorage.removeItem('moodle_cache_v2')
    } catch (e) {
      console.error('Error clearing cache:', e)
    }
  }

  // Aggressive preload - load all data upfront
  async startAggressivePreload() {
    if (this.isPreloading || this.preloadPromise) return
    
    // Skip preload on server-side
    if (typeof window === 'undefined') {
      console.log('ℹ️ Server-side: skipping aggressive preload')
      return
    }

    this.isPreloading = true
    console.log('🔄 Starting aggressive Moodle data preload...')

    this.preloadPromise = (async () => {
      try {
        // Check if we already have preloaded data
        const preloadState = localStorage.getItem(PRELOAD_KEY)
        if (preloadState) {
          const state = JSON.parse(preloadState)
          if (Date.now() - state.timestamp < CACHE_TTL) {
            console.log('✓ Preload data already fresh in cache')
            this.isPreloading = false
            return
          }
        }

        // Step 1: Get all categories
        console.log('📁 Preloading categories...')
        const categories = await this.getCategories()
        
        // Step 2: Get all courses
        console.log('📚 Preloading courses...')
        const courses = await this.getCourses({})

        // Step 3: Preload course details for visible courses
        console.log('📊 Preloading course details...')
        const courseIds = courses.slice(0, 50).map((c: any) => c.id)
        
        await Promise.all(
          courseIds.map(id =>
            this.getCourseWithDetails(id).catch(e => {
              console.warn(`Failed to preload course ${id}:`, e)
              return null
            })
          )
        )

        // Step 4: Preload hierarchy
        console.log('🌳 Preloading category hierarchy...')
        await this.getRootCategories()

        // Mark preload as complete
        localStorage.setItem(
          PRELOAD_KEY,
          JSON.stringify({ timestamp: Date.now() })
        )

        console.log('✅ Aggressive preload complete!')
      } catch (error) {
        console.error('Error during preload:', error)
      } finally {
        this.isPreloading = false
        this.preloadPromise = null
      }
    })()

    return this.preloadPromise
  }

  // Wait for preload to complete
  async waitForPreload() {
    if (this.preloadPromise) {
      await this.preloadPromise
    }
  }

  // Get all courses with filtering options
  async getCourses(options: {
    categoryId?: number
    search?: string
    limit?: number
    offset?: number
  } = {}): Promise<MoodleCourse[]> {
    try {
      const cacheKey = `courses_${JSON.stringify(options)}`
      
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
      if (this.isErrorResponse(result)) {
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
    const cacheKey = 'categories_all'
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log('✓ Cached categories')
      return cached
    }

    console.log('✗ Fetching categories from API')
    try {
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
      if (this.isErrorResponse(result)) {
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
      if (this.isErrorResponse(result)) {
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
      const cacheKey = `courses_category_${categoryId}`
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
      const cacheKey = `course_enrollment_stats_${courseId}`
      
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
      
      if (this.isErrorResponse(result)) {
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
      const cacheKey = `course_details_with_stats_${courseId}`
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
      
      if (this.isErrorResponse(result)) {
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
      const cacheKey = `category_stats_${categoryId}`
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
      if (this.isErrorResponse(result)) {
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
  async getRootCategories(): Promise<any[]> {
    const cacheKey = 'root_categories'
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log('✓ Cached root categories')
      return cached
    }

    console.log('✗ Fetching root categories')
    const allCategories = await this.getCategories()
    const root = allCategories.filter((cat: any) => cat.parent === 0)
    this.setCache(cacheKey, root)
    return root
  }

  // Get immediate children of a category
  async getCategoryChildren(parentId: number): Promise<any[]> {
    const cacheKey = `category_children_${parentId}`
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log(`✓ Cached children for category ${parentId}`)
      return cached
    }

    console.log(`✗ Fetching children for category ${parentId}`)
    const allCategories = await this.getCategories()
    const children = allCategories.filter((cat: any) => cat.parent === parentId)
    this.setCache(cacheKey, children)
    return children
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

  // Get course instructors/teachers - using core_enrol_get_enrolled_users with role filtering
  async getCourseInstructors(courseId: number): Promise<MoodleUser[]> {
    try {
      // Get all enrolled users and filter for instructors/teachers
      // Teachers typically have role id 3 or 4 in Moodle
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
      if (this.isErrorResponse(result)) {
        console.error('Moodle API Error getting instructors:', result)
        return []
      }
      
      // Filter for users with instructor role (typically role id 3 or 4)
      // Look for users that have a role indicating they are instructors
      const instructors = result.filter((user: any) => {
        // Check if user has instructor/teacher roles
        if (user.roles && Array.isArray(user.roles)) {
          const instructorRoles = [3, 4, 5, 6]; // Common instructor role IDs
          return user.roles.some((role: any) => instructorRoles.includes(role.roleid))
        }
        return false
      })

      return instructors.length > 0 ? instructors : []
    } catch (error) {
      console.error('Error fetching course instructors:', error)
      return []
    }
  }

  // Get course with detailed enrollment and instructor info
  async getCourseWithDetails(courseId: number): Promise<any> {
    const cacheKey = `course_with_details_${courseId}`
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log(`✓ Cached details for course ${courseId}`)
      return cached
    }

    console.log(`✗ Fetching details for course ${courseId}`)
    try {
      // Get course details
      const courseDetails = await this.getCourseDetails(courseId)
      if (!courseDetails) return null

      // Get enrolled users to count actual students
      const enrolledUsers = await this.getCourseEnrollments(courseId)
      const studentCount = enrolledUsers.length

      // Get instructors
      const instructors = await this.getCourseInstructors(courseId)
      const instructorNames = instructors.map(i => i.fullname).join(', ') || 'No instructor assigned'

      const details = {
        ...courseDetails,
        enrolledusercount: studentCount,
        instructorNames,
        instructors
      }

      this.setCache(cacheKey, details)
      return details
    } catch (error) {
      console.error(`Error fetching course details for ${courseId}:`, error)
      return null
    }
  }

  // Get courses with all details (students + instructors)
  async getCoursesWithDetails(courseIds: number[]): Promise<any[]> {
    try {
      const results = await Promise.all(
        courseIds.map(id => this.getCourseWithDetails(id))
      )
      return results.filter(r => r !== null)
    } catch (error) {
      console.error('Error getting courses with details:', error)
      return []
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_user_get_users_by_field',
        moodlewsrestformat: 'json',
        field: 'email',
        'values[0]': email
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })

      const result = await response.json()

      if (this.isErrorResponse(result)) {
        console.error('Error fetching user by email:', result)
        return null
      }

      if (Array.isArray(result) && result.length > 0) {
        return result[0]
      }

      return null
    } catch (error) {
      console.error('Error getting user by email:', error)
      return null
    }
  }

  // Get user by ID
  async getUserById(userId: number): Promise<any> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_user_get_users',
        moodlewsrestformat: 'json',
        'criteria[0][key]': 'id',
        'criteria[0][value]': userId.toString()
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })

      const result = await response.json()

      if (this.isErrorResponse(result)) {
        console.error('Error fetching user by ID:', result)
        return null
      }

      if (result.users && result.users.length > 0) {
        return result.users[0]
      }

      return null
    } catch (error) {
      console.error('Error getting user by ID:', error)
      return null
    }
  }

  // Get user preferences
  async getUserPreferences(userId: number): Promise<any> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_user_get_user_preferences',
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

      const result = await response.json()

      if (this.isErrorResponse(result)) {
        return null
      }

      return result
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return null
    }
  }

  // Get user grades for a specific course
  async getCourseGrades(userId: number, courseId: number): Promise<any | null> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'gradereport_user_get_grades_table',
        moodlewsrestformat: 'json',
        courseid: courseId.toString(),
        userid: userId.toString()
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      })

      const result = await response.json()

      if (this.isErrorResponse(result)) {
        console.warn('Error fetching course grades:', result)
        return null
      }

      return result
    } catch (error) {
      console.error('Error getting course grades:', error)
      return null
    }
  }

  // Get site info
  async getSiteInfo(): Promise<any> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_webservice_get_site_info',
        moodlewsrestformat: 'json'
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })

      const result = await response.json()

      if (this.isErrorResponse(result)) {
        return null
      }

      return result
    } catch (error) {
      console.error('Error getting site info:', error)
      return null
    }
  }

  // Get user assignments
  async getUserAssignments(userId: number, courseId?: number): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'mod_assign_get_assignments',
        moodlewsrestformat: 'json'
      })

      if (courseId) {
        params.append('courseids[0]', courseId.toString())
      }

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      })

      const result = await response.json()

      if (this.isErrorResponse(result)) {
        console.warn('Error fetching assignments:', result)
        return []
      }

      // Flatten all assignments from all courses
      let allAssignments: any[] = []
      if (result.courses) {
        result.courses.forEach((course: any) => {
          if (course.assignments) {
            allAssignments = allAssignments.concat(
              course.assignments.map((a: any) => ({
                ...a,
                courseName: course.name,
                courseId: course.id
              }))
            )
          }
        })
      }
      
      return allAssignments
    } catch (error) {
      console.error('Error getting assignments:', error)
      return []
    }
  }

  // Get course calendar events
  async getCalendarEvents(userId: number): Promise<any[]> {
    try {
      // First, get the user's calendar events by using core_calendar_get_calendar_events
      // without the events array wrapper
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_calendar_get_calendar_events',
        moodlewsrestformat: 'json'
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      })

      const result = await response.json()

      if (this.isErrorResponse(result)) {
        console.warn('Error fetching calendar events:', result)
        return []
      }

      return result.events || []
    } catch (error) {
      console.error('Error getting calendar events:', error)
      return []
    }
  }

  // Get quiz attempts
  async getQuizAttempts(userId: number, courseId: number): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'mod_quiz_get_user_best_grades',
        moodlewsrestformat: 'json',
        userid: userId.toString(),
        courseid: courseId.toString()
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      })

      const result = await response.json()

      if (this.isErrorResponse(result)) {
        console.warn('Error fetching quiz attempts:', result)
        return []
      }

      return result.quizzes || []
    } catch (error) {
      console.error('Error getting quiz attempts:', error)
      return []
    }
  }

  // Get forum discussions
  async getForumDiscussions(courseId: number): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'mod_forum_get_forum_discussions_paginated',
        moodlewsrestformat: 'json',
        forumid: courseId.toString()
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      })

      const result = await response.json()

      if (this.isErrorResponse(result)) {
        console.warn('Error fetching forum discussions:', result)
        return []
      }

      return result.discussions || []
    } catch (error) {
      console.error('Error getting forum discussions:', error)
      return []
    }
  }

  // Get course content/resources
  async getCourseContents(courseId: number): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_course_get_contents',
        moodlewsrestformat: 'json',
        courseid: courseId.toString()
      })

      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      })

      const result = await response.json()

      if (this.isErrorResponse(result)) {
        console.warn('Error fetching course contents:', result)
        return []
      }

      return result || []
    } catch (error) {
      console.error('Error getting course contents:', error)
      return []
    }
  }

  // Generate Moodle login URL using SSO token (now enabled in external service)
  async generateMoodleLoginUrl(userId: number, moodleUsername: string): Promise<string> {
    try {
      console.log('🔐 SSO Request - Attempting to generate login URL for user:', userId)
      
      // The function uses idnumber and username, not id and username
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'auth_userkey_request_login_url',
        moodlewsrestformat: 'json',
        'user[idnumber]': moodleUsername, // Use username as idnumber - this is the unique identifier
        'user[username]': moodleUsername,
        returnurl: `${this.config.baseUrl}/my/`
      })

      console.log('🔐 SSO Attempting with user[idnumber] and user[username]')
      const response = await fetch(`${this.config.baseUrl}/webservice/rest/server.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      })

      const result = await response.json()
      console.log('🔐 SSO Response from Moodle:', result)

      if (result.loginurl) {
        console.log('✅ SSO Success! Generated secure login URL:', result.loginurl)
        return result.loginurl
      }

      if (this.isErrorResponse(result)) {
        console.error('❌ SSO failed. Error:', result.message || result.error)
        console.error('❌ Debug info:', result.debuginfo)
        // Fallback to direct Moodle dashboard
        console.log('⚠️ Falling back to direct Moodle dashboard URL')
        return `${this.config.baseUrl}/my/`
      }

      return `${this.config.baseUrl}/my/`
      
    } catch (error) {
      console.error('❌ Exception in SSO generation:', error)
      return `${this.config.baseUrl}/my/`
    }
  }

  // Helper to check error responses
  private isErrorResponse(result: any): boolean {
    return result && (result.exception || result.error || result.errorcode)
  }
}

// Moodle Configuration
export const moodleConfig: MoodleConfig = {
  baseUrl: process.env.NEXT_PUBLIC_MOODLE_URL || 'https://your-moodle-instance.com',
  apiToken: process.env.MOODLE_API_TOKEN || 'your-moodle-api-token',
  serviceName: 'UEAB ODeL Integration'
}

export const moodleService = new MoodleService(moodleConfig.baseUrl, moodleConfig.apiToken)

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

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
  categoryname: string
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

class MoodleService {
  private config: MoodleConfig

  constructor(config: MoodleConfig) {
    this.config = config
  }

  // Get all courses with filtering options
  async getCourses(options: {
    categoryId?: number
    search?: string
    limit?: number
    offset?: number
  } = {}): Promise<MoodleCourse[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_course_get_courses',
        moodlewsrestformat: 'json'
      })

      if (options.categoryId) {
        params.append('options[ids][]', options.categoryId.toString())
      }

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
      
      // Filter results if search term provided
      let courses = result || []
      
      if (options.search) {
        const searchTerm = options.search.toLowerCase()
        courses = courses.filter((course: MoodleCourse) =>
          course.fullname.toLowerCase().includes(searchTerm) ||
          course.summary.toLowerCase().includes(searchTerm) ||
          course.categoryname.toLowerCase().includes(searchTerm)
        )
      }

      // Apply pagination
      if (options.offset || options.limit) {
        const start = options.offset || 0
        const end = options.limit ? start + options.limit : courses.length
        courses = courses.slice(start, end)
      }

      return courses
    } catch (error) {
      console.error('Error fetching Moodle courses:', error)
      return []
    }
  }

  // Get course categories
  async getCategories(): Promise<MoodleCategory[]> {
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
      return result || []
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

  // Get courses by category
  async getCoursesByCategory(categoryId: number): Promise<MoodleCourse[]> {
    try {
      return await this.getCourses({ categoryId })
    } catch (error) {
      console.error('Error fetching courses by category:', error)
      return []
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

      const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolledusercount, 0)
      
      const categoryStats = categories.map(category => ({
        id: category.id,
        name: category.name,
        courseCount: category.coursecount
      }))

      const recentCourses = courses
        .sort((a, b) => b.timemodified - a.timemodified)
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
      return result || []
    } catch (error) {
      console.error('Error fetching user courses:', error)
      return []
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

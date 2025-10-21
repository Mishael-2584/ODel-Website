// Moodle Single Sign-On Integration
// Allows students to login with their Moodle credentials

interface MoodleUser {
  id: number
  username: string
  firstname: string
  lastname: string
  fullname: string
  email: string
  department: string
  profileimageurl: string
  roles: Array<{
    roleid: number
    name: string
    shortname: string
  }>
  enrolledCourses: Array<{
    id: number
    name: string
    progress: number
    lastAccess: string
  }>
}

interface MoodleAuthConfig {
  baseUrl: string
  apiToken: string
  redirectUrl: string
}

class MoodleAuthService {
  private config: MoodleAuthConfig

  constructor(config: MoodleAuthConfig) {
    this.config = config
  }

  // Authenticate user with Moodle credentials
  async authenticateUser(username: string, password: string): Promise<{
    success: boolean
    user?: MoodleUser
    error?: string
  }> {
    try {
      // First, verify credentials by getting user info
      const userInfo = await this.getUserByUsername(username)
      
      if (!userInfo) {
        return { success: false, error: 'Invalid username or password' }
      }

      // Get user's enrolled courses
      const enrolledCourses = await this.getUserEnrolledCourses(userInfo.id)
      
      const user: MoodleUser = {
        id: userInfo.id,
        username: userInfo.username,
        firstname: userInfo.firstname,
        lastname: userInfo.lastname,
        fullname: userInfo.fullname,
        email: userInfo.email,
        department: userInfo.department || '',
        profileimageurl: userInfo.profileimageurl || '',
        roles: userInfo.roles || [],
        enrolledCourses: enrolledCourses
      }

      return { success: true, user }
    } catch (error) {
      console.error('Moodle authentication error:', error)
      return { 
        success: false, 
        error: 'Authentication failed. Please try again.' 
      }
    }
  }

  // Get user by username
  private async getUserByUsername(username: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_user_get_users',
        moodlewsrestformat: 'json',
        'criteria[0][key]': 'username',
        'criteria[0][value]': username
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
      return result.users?.[0] || null
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  // Get user's enrolled courses
  private async getUserEnrolledCourses(userId: number): Promise<any[]> {
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

  // Get user's course progress
  async getUserCourseProgress(userId: number, courseId: number): Promise<{
    progress: number
    completed: number
    total: number
    lastAccess: string
  }> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'core_completion_get_activities_completion_status',
        moodlewsrestformat: 'json',
        userid: userId.toString(),
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
      
      if (result.statuses && result.statuses.length > 0) {
        const completed = result.statuses.filter((status: any) => status.state === 1).length
        const total = result.statuses.length
        const progress = total > 0 ? (completed / total) * 100 : 0
        
        return {
          progress: Math.round(progress),
          completed,
          total,
          lastAccess: result.statuses[0]?.timecompleted || new Date().toISOString()
        }
      }

      return { progress: 0, completed: 0, total: 0, lastAccess: new Date().toISOString() }
    } catch (error) {
      console.error('Error fetching course progress:', error)
      return { progress: 0, completed: 0, total: 0, lastAccess: new Date().toISOString() }
    }
  }

  // Get user's grades
  async getUserGrades(userId: number, courseId?: number): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'gradereport_user_get_grade_items',
        moodlewsrestformat: 'json',
        userid: userId.toString()
      })

      if (courseId) {
        params.append('courseid', courseId.toString())
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
      return result.usergrades || []
    } catch (error) {
      console.error('Error fetching user grades:', error)
      return []
    }
  }

  // Get user's assignments
  async getUserAssignments(userId: number, courseId?: number): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.apiToken,
        wsfunction: 'mod_assign_get_assignments',
        moodlewsrestformat: 'json',
        'courseids[0]': courseId?.toString() || '0'
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
      return result.courses?.[0]?.assignments || []
    } catch (error) {
      console.error('Error fetching user assignments:', error)
      return []
    }
  }

  // Get user's upcoming deadlines
  async getUserUpcomingDeadlines(userId: number): Promise<any[]> {
    try {
      const enrolledCourses = await this.getUserEnrolledCourses(userId)
      const allAssignments = []
      
      for (const course of enrolledCourses.slice(0, 10)) { // Limit to first 10 courses
        const assignments = await this.getUserAssignments(userId, course.id)
        allAssignments.push(...assignments.map(assignment => ({
          ...assignment,
          courseName: course.fullname,
          courseId: course.id
        })))
      }
      
      // Filter upcoming assignments (next 30 days)
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      return allAssignments.filter(assignment => {
        const dueDate = new Date(assignment.duedate * 1000)
        return dueDate > now && dueDate <= thirtyDaysFromNow
      }).sort((a, b) => a.duedate - b.duedate)
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error)
      return []
    }
  }
}

// Moodle Auth Configuration
export const moodleAuthConfig: MoodleAuthConfig = {
  baseUrl: process.env.NEXT_PUBLIC_MOODLE_URL || 'https://ielearning.ueab.ac.ke',
  apiToken: process.env.MOODLE_API_TOKEN || '',
  redirectUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
}

export const moodleAuthService = new MoodleAuthService(moodleAuthConfig)

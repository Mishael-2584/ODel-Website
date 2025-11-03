'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaUser, 
  FaBook, 
  FaSignOutAlt, 
  FaGraduationCap, 
  FaCalendarAlt,
  FaChartBar,
  FaClock,
  FaBell
} from 'react-icons/fa'

interface StudentData {
  email: string
  studentName: string
  moodleUsername: string
  moodleUserId: number
  roles?: string[]
}

type TabType = 'dashboard' | 'courses' | 'calendar' | 'grades' | 'assignments'

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [roles, setRoles] = useState<string[]>([])
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [assignments, setAssignments] = useState<any[]>([])
  const [grades, setGrades] = useState<{ avgGrade: number; courses: any[] }>({ avgGrade: 0, courses: [] })
  const [ssoLoginUrl, setSsoLoginUrl] = useState<string | null>(null)
  const [loadingMoodle, setLoadingMoodle] = useState(false)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [eventModalDay, setEventModalDay] = useState<string>('')
  const [eventModalItems, setEventModalItems] = useState<any[]>([])
  const [teachingCourses, setTeachingCourses] = useState<any[]>([])
  const [moodleAnnouncements, setMoodleAnnouncements] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        const data = await response.json()

        if (data.authenticated) {
          console.log('Student data:', data.user)
          setStudentData(data.user)
          
          // Fetch courses from Moodle API for this student
          if (data.user && data.user.moodleUserId) {
            try {
              console.log(`Fetching dashboard data for user ID: ${data.user.moodleUserId}`)
              
              // Fetch all data in PARALLEL, not sequentially
              const [coursesResponse, calendarResponse, assignmentsResponse, gradesResponse, announcementsResponse] = await Promise.all([
                fetch(`/api/moodle?action=user-courses&userId=${data.user.moodleUserId}`),
                fetch(`/api/moodle/calendar?userId=${data.user.moodleUserId}`),
                fetch(`/api/moodle?action=assignments&userId=${data.user.moodleUserId}`),
                fetch(`/api/moodle?action=user-grades&userId=${data.user.moodleUserId}`),
                fetch(`/api/moodle/announcements?userId=${data.user.moodleUserId}`)
              ])

              // Process courses
              const coursesData = await coursesResponse.json()
              if (coursesData.success && coursesData.data) {
                console.log(`Found ${coursesData.data.length} courses`)
                setCourses(coursesData.data)
              }

              // Process calendar
              const calendarData = await calendarResponse.json()
              if (calendarData.success && calendarData.data) {
                setCalendarEvents(calendarData.data)
              }

              // Process assignments
              const assignmentsData = await assignmentsResponse.json()
              if (assignmentsData.success && assignmentsData.data && assignmentsData.data.length > 0) {
                setAssignments(assignmentsData.data)
              }

              // Roles (from session or API)
              const fetchedRoles: string[] = Array.isArray(data.user.roles) && data.user.roles.length > 0
                ? data.user.roles
                : (await (await fetch(`/api/moodle?action=user-roles&userId=${data.user.moodleUserId}`)).json()).data || ['student']
              setRoles(fetchedRoles)

              // If instructor, fetch teaching courses
              if (fetchedRoles.includes('instructor')) {
                const teachingRes = await fetch(`/api/moodle?action=teaching-courses&userId=${data.user.moodleUserId}`)
                const teachingJson = await teachingRes.json()
                if (teachingJson.success && teachingJson.data) {
                  setTeachingCourses(teachingJson.data)
                }
              }

              // Process grades
              const gradesData = await gradesResponse.json()
              if (gradesData.success && gradesData.data) {
                setGrades(gradesData.data)
              }

              // Process Moodle announcements
              const announcementsData = await announcementsResponse.json()
              if (announcementsData.success && announcementsData.data) {
                setMoodleAnnouncements(announcementsData.data)
              }

              // Generate SSO login URL - NOW DONE ON-DEMAND WHEN BUTTON CLICKED
              // Removed: SSO generation here since keys expire quickly
              // Fresh key will be generated each time user clicks "Open Moodle"

            } catch (courseErr) {
              console.error('Error fetching dashboard data:', courseErr)
            }
          } else {
            console.warn('moodleUserId not found in authenticated user data')
          }
        } else {
          router.push('/auth')
        }
      } catch (err) {
        console.error('Error:', err)
        router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

    verifySession()
  }, [router])

  // Refetch calendar when month changes
  useEffect(() => {
    const fetchMonth = async () => {
      if (!studentData?.moodleUserId) return
      const from = Math.floor(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime() / 1000)
      const to = Math.floor(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).getTime() / 1000)
      try {
        const res = await fetch(`/api/moodle/calendar?userId=${studentData.moodleUserId}&from=${from}&to=${to}`)
        const data = await res.json()
        if (data.success && data.data) setCalendarEvents(data.data)
      } catch (e) {
        console.error('Calendar fetch error', e)
      }
    }
    fetchMonth()
  }, [currentMonth, studentData?.moodleUserId])

  // Derive assignments from calendar if API returns none
  useEffect(() => {
    if (assignments.length === 0 && calendarEvents.length > 0) {
      const derived = calendarEvents
        .filter((e: any) => e.module === 'assign' && (e.eventtype === 'due' || e.eventtype === 'gradingdue'))
        .map((e: any) => ({
          id: e.id,
          name: e.name,
          coursename: e.courseid,
          duedate: e.timestart || e.timesort,
          url: e.url
        }))
      if (derived.length > 0) setAssignments(derived)
    }
  }, [calendarEvents, assignments.length])

  const openMoodleUrl = async (url?: string) => {
    const target = url || (process.env.NEXT_PUBLIC_MOODLE_URL as string)
    // Single navigation via our server endpoint avoids popup blockers and attaches wantsurl
    window.location.href = `/api/moodle/sso-launch?userId=${studentData!.moodleUserId}&username=${encodeURIComponent(studentData!.moodleUsername)}&target=${encodeURIComponent(target)}`
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!studentData) {
    return null
  }

  const isInstructor = roles.includes('instructor')
  const isStudent = roles.includes('student') || roles.length === 0

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'courses', label: isInstructor ? 'Enrolled' : 'My Courses', icon: <FaBook /> },
    { id: 'calendar', label: 'Calendar', icon: <FaCalendarAlt /> },
    ...(isStudent ? [{ id: 'grades' as TabType, label: 'Grades', icon: <FaChartBar /> }] : []),
    ...(isStudent ? [{ id: 'assignments' as TabType, label: 'Assignments', icon: <FaClock /> }] : [])
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {studentData.studentName}!</h1>
              <p className="text-gray-300">Your ODeL Portal</p>
            </div>
            <button
              onClick={async () => {
                setLoadingMoodle(true)
                try {
                  console.log('🔐 Generating fresh SSO URL for Moodle access...')
                  const ssoResponse = await fetch(`/api/moodle?action=sso-login&userId=${studentData!.moodleUserId}&username=${encodeURIComponent(studentData!.moodleUsername)}`)
                  const ssoData = await ssoResponse.json()
                  console.log('🔐 Fresh SSO response:', ssoData)
                  
                  if (ssoData.success && ssoData.data) {
                    // Open the URL immediately in a new window
                    window.open(ssoData.data, '_blank')
                    setSsoLoginUrl(ssoData.data)
                  } else {
                    setError('Failed to generate Moodle access link')
                    console.error('SSO failed:', ssoData)
                  }
                } catch (err) {
                  console.error('Error generating Moodle access:', err)
                  setError('Failed to generate Moodle access link')
                } finally {
                  setLoadingMoodle(false)
                }
              }}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 px-6 py-2 rounded-lg transition-colors font-semibold"
              disabled={loadingMoodle}
            >
              {loadingMoodle ? 'Connecting...' : 'Open →'}
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white">
                    <FaUser className="text-lg" />
                  </div>
                <div>
                    <p className="text-xs text-gray-600">Profile</p>
                    <p className="font-semibold text-gray-900">{studentData.studentName}</p>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaBook className="text-primary-600 text-2xl" />
                  <h3 className="font-semibold text-gray-900">Enrolled Courses</h3>
                </div>
                <p className="text-3xl font-bold text-primary-600">{courses.length}</p>
                <p className="text-xs text-gray-600 mt-2">Active 2025/2026</p>
            </div>

              {/* Email */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaChartBar className="text-amber-600 text-2xl" />
                  <h3 className="font-semibold text-gray-900">Email</h3>
                </div>
                <p className="text-sm font-mono text-gray-600 truncate">{studentData.email}</p>
            </div>

              {/* Access Moodle */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaGraduationCap className="text-amber-600 text-2xl" />
                  <h3 className="font-semibold text-gray-900">Moodle</h3>
                </div>
                <button
                  onClick={async () => {
                    setLoadingMoodle(true)
                    try {
                      console.log('🔐 Generating fresh SSO URL for Moodle access...')
                      const ssoResponse = await fetch(`/api/moodle?action=sso-login&userId=${studentData!.moodleUserId}&username=${encodeURIComponent(studentData!.moodleUsername)}`)
                      const ssoData = await ssoResponse.json()
                      console.log('🔐 Fresh SSO response:', ssoData)
                      
                      if (ssoData.success && ssoData.data) {
                        // Open the URL immediately in a new window
                        window.open(ssoData.data, '_blank')
                        setSsoLoginUrl(ssoData.data)
                      } else {
                        setError('Failed to generate Moodle access link')
                        console.error('SSO failed:', ssoData)
                      }
                    } catch (err) {
                      console.error('Error generating Moodle access:', err)
                      setError('Failed to generate Moodle access link')
                    } finally {
                      setLoadingMoodle(false)
                    }
                  }}
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loadingMoodle}
                >
                  {loadingMoodle ? 'Connecting...' : 'Open →'}
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-l-4 border-primary-600 pl-4">
                  <p className="text-gray-600 text-sm">Enrolled Courses</p>
                  <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <div className="border-l-4 border-amber-600 pl-4">
                  <p className="text-gray-600 text-sm">Pending Assignments</p>
                  <p className="text-3xl font-bold text-gray-900">--</p>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                </div>
                <div className="border-l-4 border-green-600 pl-4">
                  <p className="text-gray-600 text-sm">GPA</p>
                  <p className="text-3xl font-bold text-gray-900">--</p>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                </div>
              </div>
            </div>

            {/* Moodle Announcements */}
            {moodleAnnouncements.length > 0 && (
              <div className="bg-white rounded-lg shadow p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaBell className="text-primary-600" />
                    Course Announcements
                  </h2>
                  <span className="text-sm text-gray-500">{moodleAnnouncements.length} announcement(s)</span>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {moodleAnnouncements.slice(0, 5).map((announcement: any) => (
                    <div
                      key={announcement.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        announcement.is_pinned ? 'border-gold-300 bg-gold-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {announcement.is_pinned && (
                              <span className="px-2 py-1 bg-gold-500 text-white text-xs rounded">Pinned</span>
                            )}
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {announcement.course_name}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{announcement.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>By {announcement.author_name}</span>
                        <span>
                          {new Date(announcement.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {moodleAnnouncements.length > 5 && (
                    <p className="text-center text-sm text-gray-500 pt-2">
                      Showing 5 of {moodleAnnouncements.length} announcements
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Today summary */}
            {(() => {
              const t = new Date()
              const todays = calendarEvents.filter((ev: any) => {
                const d = new Date((ev.timestart || ev.timesort) * 1000)
                return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
              })
              if (todays.length === 0) return null
              const due = todays.filter((e: any) => e.eventtype === 'due' || e.eventtype === 'gradingdue').length
              const open = todays.filter((e: any) => e.eventtype === 'open').length
              const close = todays.filter((e: any) => e.eventtype === 'close').length
              return (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Today</h3>
                    <div className="text-xs text-gray-500">
                      {due > 0 && <span className="mr-3">due {due}</span>}
                      {open > 0 && <span className="mr-3">open {open}</span>}
                      {close > 0 && <span>close {close}</span>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {todays.map((e: any, i: number) => (
                      <div key={i} className="border rounded p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{e.eventtype || e.module}</div>
                            <div className="font-semibold text-gray-900 truncate">{e.name || 'Event'}</div>
                            {e.coursename && (
                              <div className="text-sm text-gray-600 truncate">{e.coursename}</div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">{new Date((e.timestart || e.timesort) * 1000).toLocaleString()}</div>
                            {e.description && (
                              <div className="text-xs text-gray-500 mt-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: e.description }} />
                            )}
                          </div>
                          <div className="shrink-0">
                            <button onClick={() => openMoodleUrl(e.url)} className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded">
                              {e.url ? 'Open activity' : 'Open Moodle'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{isInstructor ? 'Enrolled Courses' : 'My Courses'}</h2>
              <p className="text-gray-600">You are enrolled in {courses.length} course{courses.length !== 1 ? 's' : ''}</p>
                </div>

            {courses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FaBook className="mx-auto text-5xl text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-6">No courses enrolled yet</p>
                <p className="text-gray-500 mb-8">Enroll in courses through the Moodle platform to see them here</p>
                <a
                  href={process.env.NEXT_PUBLIC_MOODLE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
                >
                  Go to Moodle →
                    </a>
                  </div>
                ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-2"></div>
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.fullname}</h3>
                      <p className="text-sm text-gray-600 mb-4">{course.categoryname}</p>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p>📚 Course ID: {course.id}</p>
                        <p>👥 Enrolled Students: {course.enrolledusercount || 0}</p>
                      </div>
                      {course.summary && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4">{course.summary}</p>
                      )}
                      <button
                        onClick={() => openMoodleUrl(`${process.env.NEXT_PUBLIC_MOODLE_URL}/course/view.php?id=${course.id}`)}
                        className="inline-block w-full text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                      >
                        View Course →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Teaching Courses (for instructors) */}
        {isInstructor && activeTab === 'dashboard' && teachingCourses && teachingCourses.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Teaching</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachingCourses.map((course: any) => (
                <div key={course.id} className="bg-white rounded-lg border shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.fullname || course.name}</h3>
                  <button
                    onClick={() => openMoodleUrl(`${process.env.NEXT_PUBLIC_MOODLE_URL}/course/view.php?id=${course.id}`)}
                    className="mt-2 inline-block bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Open course →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
                              <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Academic Calendar</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  ← Prev
                </button>
                <div className="font-semibold">
                  {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  Next →
                </button>
                              </div>

              {(() => {
                const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
                const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
                const days = getDaysInMonth(currentMonth)
                const startPad = getFirstDayOfMonth(currentMonth)
                const today = new Date()

                const eventsByDay: Record<string, any[]> = {}
                calendarEvents.forEach((ev: any) => {
                  const ts = (ev.timestart || ev.timesort) * 1000
                  const d = new Date(ts)
                  if (d.getMonth() !== currentMonth.getMonth() || d.getFullYear() !== currentMonth.getFullYear()) return
                  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
                  if (!eventsByDay[key]) eventsByDay[key] = []
                  eventsByDay[key].push(ev)
                })

                return (
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(startPad)].map((_, i) => (
                      <div key={`pad-${i}`} className="h-28 bg-gray-50 rounded" />
                    ))}
                    {[...Array(days)].map((_, dayIdx) => {
                      const day = dayIdx + 1
                      const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`
                      const dayEvents = eventsByDay[key] || []
                      const isToday =
                        day === today.getDate() &&
                        currentMonth.getMonth() === today.getMonth() &&
                        currentMonth.getFullYear() === today.getFullYear()
                      const dueCount = dayEvents.filter((e: any) => e.eventtype === 'due' || e.eventtype === 'gradingdue').length
                      const openCount = dayEvents.filter((e: any) => e.eventtype === 'open').length
                      const closeCount = dayEvents.filter((e: any) => e.eventtype === 'close').length
                      return (
                        <div key={day} className={`h-28 border rounded p-2 overflow-hidden ${isToday ? 'border-amber-500 bg-amber-50' : ''}`}> 
                          <div className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                            <span>{day}{isToday && <span className="ml-2 text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Today</span>}</span>
                            {dayEvents.length > 0 && (
                              <span className="text-[10px] text-gray-400">
                                {dueCount > 0 && <span className="mr-2">due {dueCount}</span>}
                                {openCount > 0 && <span className="mr-2">open {openCount}</span>}
                                {closeCount > 0 && <span>close {closeCount}</span>}
                              </span>
                            )}
                            </div>
                          <div className="space-y-1 overflow-y-auto max-h-24 pr-1">
                            {dayEvents.length === 0 ? (
                              <div className="text-[10px] text-gray-300">—</div>
                            ) : (
                              dayEvents.slice(0, 4).map((e: any, i: number) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setEventModalDay(`${currentMonth.toLocaleString('en-US', { month: 'long' })} ${day}`)
                                    setEventModalItems(dayEvents)
                                    setEventModalOpen(true)
                                  }}
                                  className="w-full text-left text-[11px] bg-primary-50 hover:bg-primary-100 text-primary-800 rounded px-1 py-0.5 truncate"
                                >
                                  {e.eventtype ? `${e.eventtype}: ` : ''}{e.name || 'Event'}
                                </button>
                              ))
                            )}
                              </div>
                            </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
            {eventModalOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Events — {eventModalDay}</h3>
                    <button onClick={() => setEventModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {eventModalItems.map((e: any, i: number) => (
                      <div key={i} className="border rounded p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{e.name || 'Event'}</div>
                            <div className="text-xs text-gray-500">{e.eventtype || e.module}</div>
                            {e.coursename && (
                              <div className="text-xs text-gray-500">Course: {e.coursename}</div>
                            )}
                            <div className="text-xs text-gray-600 mt-1">{new Date((e.timestart || e.timesort) * 1000).toLocaleString()}</div>
                              </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openMoodleUrl(e.url)} className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded">
                              {e.url ? 'Open activity' : 'Open Moodle'}
                              </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div>
            {grades.courses && grades.courses.length > 0 ? (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">My Grades</h2>
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6 mb-6">
                    <p className="text-gray-600 text-sm mb-2">Overall Grade Average</p>
                    <p className="text-4xl font-bold text-amber-600">{(grades.avgGrade || 0).toFixed(2)}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {grades.courses.map((course: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 mb-3">{course.courseName || course.coursename || 'Course'}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Grade</span>
                          <span className="text-lg font-bold text-primary-600">{(course.grade || 0).toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(course.grade || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FaChartBar className="mx-auto text-6xl text-amber-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">My Grades</h2>
                <p className="text-gray-600 mb-8">No grades available yet</p>
              </div>
            )}
            </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div>
            {assignments.length > 0 ? (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">My Assignments</h2>
                <div className="space-y-4">
                  {assignments.map((assignment: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{assignment.name}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          assignment.duedate < Date.now() / 1000
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {assignment.duedate < Date.now() / 1000 ? 'Overdue' : 'Pending'}
                          </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">📚 {assignment.coursename}</p>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(assignment.duedate * 1000).toLocaleDateString()} {new Date(assignment.duedate * 1000).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FaClock className="mx-auto text-6xl text-green-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">My Assignments</h2>
                <p className="text-gray-600 mb-8">No assignments at this time</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}


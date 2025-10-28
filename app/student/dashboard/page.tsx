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
  FaClock 
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
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [grades, setGrades] = useState<{ avgGrade: number; courses: any[] }>({ avgGrade: 0, courses: [] })
  const [ssoLoginUrl, setSsoLoginUrl] = useState<string | null>(null)
  const [loadingMoodle, setLoadingMoodle] = useState(false)
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
              const [coursesResponse, calendarResponse, assignmentsResponse, gradesResponse] = await Promise.all([
                fetch(`/api/moodle?action=user-courses&userId=${data.user.moodleUserId}`),
                fetch(`/api/moodle?action=calendar-events&userId=${data.user.moodleUserId}`),
                fetch(`/api/moodle?action=assignments&userId=${data.user.moodleUserId}`),
                fetch(`/api/moodle?action=user-grades&userId=${data.user.moodleUserId}`)
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
              if (assignmentsData.success && assignmentsData.data) {
                setAssignments(assignmentsData.data)
              }

              // Process grades
              const gradesData = await gradesResponse.json()
              if (gradesData.success && gradesData.data) {
                setGrades(gradesData.data)
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

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'courses', label: 'My Courses', icon: <FaBook /> },
    { id: 'calendar', label: 'Calendar', icon: <FaCalendarAlt /> },
    { id: 'grades', label: 'Grades', icon: <FaChartBar /> },
    { id: 'assignments', label: 'Assignments', icon: <FaClock /> }
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
              <p className="text-gray-300">Your ODeL Student Portal</p>
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
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h2>
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
                        onClick={async () => {
                          try {
                            setLoadingMoodle(true)
                            console.log(`📖 Opening course ${course.id}...`)
                            
                            // Generate SSO first to ensure login
                            const ssoResponse = await fetch(`/api/moodle?action=sso-login&userId=${studentData!.moodleUserId}&username=${encodeURIComponent(studentData!.moodleUsername)}`)
                            const ssoData = await ssoResponse.json()
                            console.log('🔐 SSO response:', ssoData)
                            
                            if (ssoData.success && ssoData.data) {
                              // Open SSO URL first - this logs the user in
                              const ssoUrl = ssoData.data
                              console.log('🔐 Opening SSO login:', ssoUrl)
                              
                              // Open SSO in a window to complete login
                              const ssoWindow = window.open(ssoUrl, 'moodle_sso', 'width=800,height=600')
                              
                              // After brief delay to ensure login is processed, open course
                              setTimeout(() => {
                                const courseUrl = `${process.env.NEXT_PUBLIC_MOODLE_URL}/course/view.php?id=${course.id}`
                                console.log(`📚 Opening course URL:`, courseUrl)
                                window.open(courseUrl, '_blank')
                                if (ssoWindow) ssoWindow.close()
                              }, 2000) // Give Moodle 2 seconds to process SSO login
                            } else {
                              console.error('SSO failed:', ssoData)
                              // Fallback: Direct course link
                              window.open(`${process.env.NEXT_PUBLIC_MOODLE_URL}/course/view.php?id=${course.id}`, '_blank')
                            }
                          } catch (err) {
                            console.error('Error opening course:', err)
                            window.open(`${process.env.NEXT_PUBLIC_MOODLE_URL}/course/view.php?id=${course.id}`, '_blank')
                          } finally {
                            setLoadingMoodle(false)
                          }
                        }}
                        className="inline-block w-full text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loadingMoodle}
                      >
                        {loadingMoodle ? 'Opening...' : 'View Course →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            {calendarEvents.length > 0 ? (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Academic Calendar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {calendarEvents.slice(0, 12).map((event: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-600">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 line-clamp-2">{event.name || event.eventtype}</h3>
                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded whitespace-nowrap ml-2">
                          {event.eventtype}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        📅 {new Date(event.timestart * 1000).toLocaleDateString()}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FaCalendarAlt className="mx-auto text-6xl text-primary-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Academic Calendar</h2>
                <p className="text-gray-600 mb-8">No upcoming events scheduled</p>
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
                      <h3 className="font-bold text-gray-900 mb-3">{course.coursename}</h3>
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


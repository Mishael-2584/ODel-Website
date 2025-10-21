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
  FaBell,
  FaClock 
} from 'react-icons/fa'

interface StudentData {
  email: string
  studentName: string
  moodleUsername: string
  moodleUserId: number
}

type TabType = 'dashboard' | 'courses' | 'calendar' | 'grades' | 'assignments'

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
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
              console.log(`Fetching courses for user ID: ${data.user.moodleUserId}`)
              const coursesUrl = `/api/moodle?action=user-courses&userId=${data.user.moodleUserId}`
              console.log('Fetching from URL:', coursesUrl)
              const coursesResponse = await fetch(coursesUrl)
              const coursesData = await coursesResponse.json()
              console.log('Courses response:', coursesData)
              if (coursesData.success && coursesData.data) {
                console.log(`Found ${coursesData.data.length} courses`)
                setCourses(coursesData.data)
              } else {
                console.log('No courses data in response')
              }
            } catch (courseErr) {
              console.error('Error fetching courses:', courseErr)
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
    { id: 'grades', label: 'Grades', icon: <FaBell /> },
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
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors font-semibold"
            >
              <FaSignOutAlt />
              Logout
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
                  <FaBell className="text-amber-600 text-2xl" />
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
                <a
                  href={process.env.NEXT_PUBLIC_MOODLE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Open →
                </a>
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
                      <a
                        href={`${process.env.NEXT_PUBLIC_MOODLE_URL}/course/view.php?id=${course.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                      >
                        View Course →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaCalendarAlt className="mx-auto text-6xl text-primary-600 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Academic Calendar</h2>
            <p className="text-gray-600 mb-8">Coming soon - Your academic calendar and important dates will be displayed here</p>
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <p className="text-sm font-semibold text-blue-900 mb-2">📅 Features coming:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Semester dates and holidays</li>
                <li>✓ Assignment deadlines</li>
                <li>✓ Exam schedules</li>
                <li>✓ Important announcements</li>
              </ul>
            </div>
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaChartBar className="mx-auto text-6xl text-amber-600 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Grades</h2>
            <p className="text-gray-600 mb-8">Coming soon - Your course grades and academic performance will be displayed here</p>
            <div className="inline-block bg-amber-50 border border-amber-200 rounded-lg p-6 text-left">
              <p className="text-sm font-semibold text-amber-900 mb-2">📊 Features coming:</p>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>✓ Course grades and GPA</li>
                <li>✓ Assignment scores</li>
                <li>✓ Exam results</li>
                <li>✓ Academic performance trends</li>
              </ul>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaClock className="mx-auto text-6xl text-green-600 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Assignments</h2>
            <p className="text-gray-600 mb-8">Coming soon - Your upcoming assignments and deadlines will be displayed here</p>
            <div className="inline-block bg-green-50 border border-green-200 rounded-lg p-6 text-left">
              <p className="text-sm font-semibold text-green-900 mb-2">✅ Features coming:</p>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ Upcoming assignments</li>
                <li>✓ Due dates and reminders</li>
                <li>✓ Submission status</li>
                <li>✓ Assignment feedback</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}


'use client'

import React, { useState, useEffect } from 'react'
import { 
  FaBookOpen, 
  FaCalendarAlt, 
  FaChartLine, 
  FaTrophy, 
  FaClock, 
  FaGraduationCap,
  FaTasks,
  FaBell,
  FaExternalLinkAlt
} from 'react-icons/fa'

interface StudentData {
  user: {
    id: number
    fullname: string
    email: string
    profileimageurl: string
    department: string
  }
  enrolledCourses: Array<{
    id: number
    name: string
    progress: number
    lastAccess: string
    grade?: number
  }>
  upcomingDeadlines: Array<{
    id: number
    name: string
    courseName: string
    duedate: number
    type: string
  }>
  recentGrades: Array<{
    courseName: string
    assignmentName: string
    grade: number
    maxGrade: number
    date: string
  }>
  statistics: {
    totalCourses: number
    completedCourses: number
    averageGrade: number
    totalStudyHours: number
  }
}

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadStudentData()
  }, [])

  const loadStudentData = async () => {
    try {
      // This would be called after Moodle authentication
      const response = await fetch('/api/student/dashboard')
      const data = await response.json()
      setStudentData(data)
    } catch (error) {
      console.error('Error loading student data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaGraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to UEAB ODeL</h2>
          <p className="text-gray-600 mb-6">Please login with your Moodle credentials to access your dashboard</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Login with Moodle
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src={studentData.user.profileimageurl || '/images/default-avatar.png'} 
                alt={studentData.user.fullname}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {studentData.user.fullname.split(' ')[0]}!
                </h1>
                <p className="text-gray-600">{studentData.user.department}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <FaExternalLinkAlt className="inline mr-2" />
                Go to Moodle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: FaChartLine },
              { id: 'courses', name: 'My Courses', icon: FaBookOpen },
              { id: 'assignments', name: 'Assignments', icon: FaTasks },
              { id: 'grades', name: 'Grades', icon: FaTrophy },
              { id: 'calendar', name: 'Calendar', icon: FaCalendarAlt }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab data={studentData} />}
        {activeTab === 'courses' && <CoursesTab data={studentData} />}
        {activeTab === 'assignments' && <AssignmentsTab data={studentData} />}
        {activeTab === 'grades' && <GradesTab data={studentData} />}
        {activeTab === 'calendar' && <CalendarTab data={studentData} />}
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ data }: { data: StudentData }) {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaBookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{data.statistics.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaTrophy className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{data.statistics.completedCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaChartLine className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900">{data.statistics.averageGrade}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaClock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Hours</p>
              <p className="text-2xl font-bold text-gray-900">{data.statistics.totalStudyHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h3>
          </div>
          <div className="p-6">
            {data.upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {data.upcomingDeadlines.slice(0, 5).map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{deadline.name}</p>
                      <p className="text-sm text-gray-600">{deadline.courseName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {new Date(deadline.duedate * 1000).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((deadline.duedate * 1000 - Date.now()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Grades</h3>
          </div>
          <div className="p-6">
            {data.recentGrades.length > 0 ? (
              <div className="space-y-4">
                {data.recentGrades.slice(0, 5).map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{grade.assignmentName}</p>
                      <p className="text-sm text-gray-600">{grade.courseName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {grade.grade}/{grade.maxGrade}
                      </p>
                      <p className="text-xs text-gray-500">{grade.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent grades</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Courses Tab Component
function CoursesTab({ data }: { data: StudentData }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">My Enrolled Courses</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.enrolledCourses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-900 mb-2">{course.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  {course.grade && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Grade</span>
                      <span className="font-medium text-green-600">{course.grade}%</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Last accessed: {new Date(course.lastAccess).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Assignments Tab Component
function AssignmentsTab({ data }: { data: StudentData }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Assignments</h3>
        </div>
        <div className="p-6">
          {data.upcomingDeadlines.length > 0 ? (
            <div className="space-y-4">
              {data.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaTasks className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{deadline.name}</h4>
                      <p className="text-sm text-gray-600">{deadline.courseName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Due: {new Date(deadline.duedate * 1000).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.ceil((deadline.duedate * 1000 - Date.now()) / (1000 * 60 * 60 * 24))} days left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming assignments</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Grades Tab Component
function GradesTab({ data }: { data: StudentData }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Grades</h3>
        </div>
        <div className="p-6">
          {data.recentGrades.length > 0 ? (
            <div className="space-y-4">
              {data.recentGrades.map((grade, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{grade.assignmentName}</h4>
                    <p className="text-sm text-gray-600">{grade.courseName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {grade.grade}/{grade.maxGrade}
                    </p>
                    <p className="text-xs text-gray-500">{grade.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No grades available</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Calendar Tab Component
function CalendarTab({ data }: { data: StudentData }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Academic Calendar</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">Calendar view coming soon...</p>
        </div>
      </div>
    </div>
  )
}

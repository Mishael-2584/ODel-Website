'use client'

import { useEffect, useState } from 'react'
import { useAuth, useRequireRole } from '@/contexts/AuthContext'
import { supabase, Course, Enrollment } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaBook, FaChartLine, FaCertificate, FaClock, FaPlay, FaCheckCircle,
  FaTrophy, FaCalendar, FaBell, FaDownload, FaUsers, FaComments, FaFire,
  FaStar, FaMedal, FaAward
} from 'react-icons/fa'

export default function StudentDashboardPage() {
  const { profile, loading: authLoading } = useRequireRole(['student'])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
    learningHours: 124
  })

  useEffect(() => {
    if (profile) {
      fetchDashboardData()
    }
  }, [profile])

  const fetchDashboardData = async () => {
    try {
      // Fetch enrollments with course details
      const { data: enrollmentData, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses (
            id,
            title,
            description,
            category,
            duration,
            instructor:instructor_id (
              full_name
            )
          )
        `)
        .eq('user_id', profile?.id)
        .order('enrolled_at', { ascending: false })

      if (error) throw error

      setEnrollments(enrollmentData || [])
      
      // Calculate stats
      const completed = enrollmentData?.filter(e => e.progress === 100).length || 0
      setStats({
        enrolledCourses: enrollmentData?.length || 0,
        completedCourses: completed,
        certificates: completed,
        learningHours: 124
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const achievements = [
    { icon: '🏆', title: 'Fast Learner', description: 'Completed 5 courses' },
    { icon: '⭐', title: 'Top Performer', description: '90%+ average' },
    { icon: '🎯', title: 'Consistent', description: '30-day streak' },
    { icon: '📚', title: 'Bookworm', description: '100+ materials read' }
  ]

  const upcomingDeadlines = [
    { course: 'Business Administration', task: 'Final Project', date: 'Oct 20, 2025', priority: 'high' },
    { course: 'Digital Marketing', task: 'Quiz 4', date: 'Oct 18, 2025', priority: 'high' },
    { course: 'Computer Science', task: 'Assignment 5', date: 'Oct 25, 2025', priority: 'medium' }
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-gray-600">Continue your learning journey and track your progress</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm mb-1">Enrolled Courses</p>
                  <p className="text-3xl font-bold">{stats.enrolledCourses}</p>
                </div>
                <FaBook className="h-12 w-12 text-primary-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-gold-500 to-gold-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gold-100 text-sm mb-1">Certificates Earned</p>
                  <p className="text-3xl font-bold">{stats.certificates}</p>
                </div>
                <FaCertificate className="h-12 w-12 text-gold-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">Completed</p>
                  <p className="text-3xl font-bold">{stats.completedCourses}</p>
                </div>
                <FaCheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Learning Hours</p>
                  <p className="text-3xl font-bold">{stats.learningHours}</p>
                </div>
                <FaClock className="h-12 w-12 text-purple-200" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enrolled Courses */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
                  <a href="/courses" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                    Browse More
                  </a>
                </div>

                {enrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <FaBook className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-600 mb-6">Start learning by enrolling in a course</p>
                    <a href="/courses" className="btn-primary inline-block">
                      Browse Courses
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          <div className="text-4xl">📊</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-gray-900 mb-1">
                                  {enrollment.course?.title || 'Course Title'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Instructor: {enrollment.course?.instructor?.full_name || 'Instructor'}
                                </p>
                              </div>
                              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                                {enrollment.progress}%
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-primary-500 to-primary-700 h-full rounded-full transition-all"
                                  style={{ width: `${enrollment.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                <FaClock className="inline mr-1 text-primary-500" />
                                {enrollment.course?.duration || 'N/A'}
                              </div>
                              <button className="btn-primary !py-2 !px-4 !text-sm">
                                Continue Learning
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="text-center p-4 bg-gradient-to-br from-gold-50 to-gold-100 rounded-lg hover:scale-105 transition-transform border-2 border-gold-200">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{achievement.title}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Deadlines */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FaCalendar className="mr-2 text-primary-500" />
                  Upcoming Deadlines
                </h3>
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="border-l-4 border-gold-500 pl-3 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">{deadline.task}</p>
                          <p className="text-xs text-gray-600">{deadline.course}</p>
                          <p className="text-xs text-gray-500 mt-1">{deadline.date}</p>
                        </div>
                        {deadline.priority === 'high' && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                            High
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full btn-outline !py-2 text-sm">
                    <FaDownload className="inline mr-2" />
                    Download Certificates
                  </button>
                  <button className="w-full btn-outline !py-2 text-sm">
                    <FaUsers className="inline mr-2" />
                    Join Study Group
                  </button>
                  <button className="w-full btn-outline !py-2 text-sm">
                    <FaComments className="inline mr-2" />
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}


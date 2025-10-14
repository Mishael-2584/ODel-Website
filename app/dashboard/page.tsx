'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaBook, FaChartLine, FaCertificate, FaClock, FaPlay, FaCheckCircle,
  FaTrophy, FaCalendar, FaBell, FaDownload, FaUsers, FaComments
} from 'react-icons/fa'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const enrolledCourses = [
    {
      id: 1,
      title: 'Business Administration',
      progress: 65,
      nextLesson: 'Financial Management',
      dueDate: 'Oct 20, 2025',
      instructor: 'Dr. Sarah Kimani',
      image: '📊',
      totalLessons: 48,
      completedLessons: 31
    },
    {
      id: 2,
      title: 'Computer Science',
      progress: 40,
      nextLesson: 'Data Structures',
      dueDate: 'Oct 25, 2025',
      instructor: 'Prof. John Mwangi',
      image: '💻',
      totalLessons: 64,
      completedLessons: 26
    },
    {
      id: 3,
      title: 'Digital Marketing',
      progress: 85,
      nextLesson: 'SEO Optimization',
      dueDate: 'Oct 18, 2025',
      instructor: 'Mary Akinyi',
      image: '📱',
      totalLessons: 32,
      completedLessons: 27
    }
  ]

  const recentActivities = [
    { type: 'completed', text: 'Completed "Introduction to Marketing"', time: '2 hours ago' },
    { type: 'assignment', text: 'New assignment posted in Business Admin', time: '5 hours ago' },
    { type: 'certificate', text: 'Certificate ready for download', time: '1 day ago' },
    { type: 'message', text: 'New message from Dr. Sarah Kimani', time: '2 days ago' }
  ]

  const upcomingDeadlines = [
    { course: 'Business Administration', task: 'Final Project Submission', date: 'Oct 20, 2025', priority: 'high' },
    { course: 'Digital Marketing', task: 'Quiz 4', date: 'Oct 18, 2025', priority: 'high' },
    { course: 'Computer Science', task: 'Assignment 5', date: 'Oct 25, 2025', priority: 'medium' }
  ]

  const achievements = [
    { icon: '🏆', title: 'Fast Learner', description: 'Completed 5 courses in 3 months' },
    { icon: '⭐', title: 'Top Performer', description: 'Maintained 90%+ average' },
    { icon: '🎯', title: 'Consistent', description: '30-day learning streak' },
    { icon: '📚', title: 'Bookworm', description: 'Read 100+ course materials' }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Student! 👋</h1>
            <p className="text-gray-600">Continue your learning journey and track your progress</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm mb-1">Enrolled Courses</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <FaBook className="h-12 w-12 text-primary-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-gold-500 to-gold-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gold-100 text-sm mb-1">Certificates Earned</p>
                  <p className="text-3xl font-bold">2</p>
                </div>
                <FaCertificate className="h-12 w-12 text-gold-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">Overall Progress</p>
                  <p className="text-3xl font-bold">63%</p>
                </div>
                <FaChartLine className="h-12 w-12 text-green-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Learning Hours</p>
                  <p className="text-3xl font-bold">124</p>
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
                  <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{course.image}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                              <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                            </div>
                            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {course.progress}%
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-primary-500 to-primary-700 h-full rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {course.completedLessons} of {course.totalLessons} lessons completed
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <FaPlay className="inline mr-1 text-primary-500" />
                              Next: {course.nextLesson}
                            </div>
                            <div className="text-sm text-gray-600">
                              <FaCalendar className="inline mr-1 text-gold-500" />
                              Due: {course.dueDate}
                            </div>
                          </div>

                          <button className="mt-3 w-full btn-primary !py-2">
                            Continue Learning
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                    <div key={index} className="border-l-4 border-primary-500 pl-3 py-2">
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

              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FaBell className="mr-2 text-gold-500" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-200 last:border-0">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'completed' && <FaCheckCircle className="text-green-500" />}
                        {activity.type === 'assignment' && <FaBook className="text-primary-500" />}
                        {activity.type === 'certificate' && <FaCertificate className="text-gold-500" />}
                        {activity.type === 'message' && <FaComments className="text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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


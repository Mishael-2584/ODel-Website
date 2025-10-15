'use client'

import { useState, useEffect } from 'react'
import { useAuth, useRequireRole } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FaUsers, FaBook, FaChartBar, FaUserCheck, FaUserTimes, 
  FaDollarSign, FaGraduationCap, FaVideo, FaComments,
  FaEye, FaEdit, FaTrash, FaBan, FaCheck, FaCalendarAlt
} from 'react-icons/fa'

interface User {
  id: string
  email: string
  full_name: string
  role: 'student' | 'instructor' | 'admin'
  created_at: string
  last_sign_in_at: string
}

interface Course {
  id: string
  title: string
  instructor_id: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  enrollments_count?: number
}

interface Stats {
  totalUsers: number
  totalCourses: number
  totalStudents: number
  totalInstructors: number
  totalRevenue: number
  pendingApprovals: number
}

export default function AdminDashboard() {
  const { profile } = useRequireRole(['admin'])
  const { signOut } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'notifications'>('overview')
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'announcement',
    targetRole: 'all'
  })
  const [sentNotifications, setSentNotifications] = useState<any[]>([])

  useEffect(() => {
    if (profile) {
      fetchStats()
      fetchUsers()
      fetchCourses()
      fetchSentNotifications()
    }
  }, [profile])

  const fetchStats = async () => {
    try {
      // Fetch user counts by role
      const { data: usersData } = await supabase
        .from('profiles')
        .select('role, created_at')

      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          id,
          price,
          enrollments(count)
        `)

      const totalUsers = usersData?.length || 0
      const totalStudents = usersData?.filter(u => u.role === 'student').length || 0
      const totalInstructors = usersData?.filter(u => u.role === 'instructor').length || 0
      const totalCourses = coursesData?.length || 0
      const totalRevenue = coursesData?.reduce((sum, course) => 
        sum + (course.price * (course.enrollments?.[0]?.count || 0)), 0) || 0

      setStats({
        totalUsers,
        totalCourses,
        totalStudents,
        totalInstructors,
        totalRevenue,
        pendingApprovals: 0 // This would come from a course approval system
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments(count),
          profiles!courses_instructor_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const coursesWithCounts = data?.map(course => ({
        ...course,
        enrollments_count: course.enrollments?.[0]?.count || 0,
        instructor_name: course.profiles?.full_name || 'Unknown'
      })) || []

      setCourses(coursesWithCounts)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const fetchSentNotifications = async () => {
    try {
      // Fetch all notifications to show what the admin has sent
      // We'll group them by title/message to avoid duplicates
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group notifications by title and message to show unique sent notifications
      const groupedNotifications = new Map()
      notifications?.forEach(notification => {
        const key = `${notification.title}|${notification.message}|${notification.type}`
        if (!groupedNotifications.has(key)) {
          groupedNotifications.set(key, {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            targetRole: 'all', // We'll determine this based on the recipients
            created_at: notification.created_at,
            recipientCount: 1
          })
        } else {
          groupedNotifications.get(key).recipientCount++
        }
      })

      setSentNotifications(Array.from(groupedNotifications.values()))
    } catch (error) {
      console.error('Error fetching sent notifications:', error)
    }
  }

  const sendNotification = async () => {
    try {
      // Get target users based on role
      let targetUsers
      if (notificationForm.targetRole === 'all') {
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id')
        targetUsers = allUsers || []
      } else {
        const { data: roleUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', notificationForm.targetRole)
        targetUsers = roleUsers || []
      }

      // Create notifications for all target users
      const notifications = targetUsers.map(user => ({
        user_id: user.id,
        type: notificationForm.type,
        title: notificationForm.title,
        message: notificationForm.message,
        read: false,
        created_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('notifications')
        .insert(notifications)

      if (error) throw error

      // Refresh sent notifications
      await fetchSentNotifications()

      // Reset form and close modal
      setNotificationForm({
        title: '',
        message: '',
        type: 'announcement',
        targetRole: 'all'
      })
      setShowNotificationModal(false)

      alert('Notification sent successfully!')
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Failed to send notification. Please try again.')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'instructor': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gold-500 p-2 rounded-lg">
                  <FaGraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">UEAB ODel</span>
              </Link>
              <div className="text-sm text-gray-500">
                Admin Dashboard
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {profile?.full_name}
              </div>
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: FaChartBar },
              { id: 'users', name: 'Users', icon: FaUsers },
              { id: 'courses', name: 'Courses', icon: FaBook },
              { id: 'notifications', name: 'Notifications', icon: FaComments }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaUsers className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FaUserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FaUserCheck className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Instructors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalInstructors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gold-100 rounded-lg">
                    <FaBook className="h-6 w-6 text-gold-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <FaDollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <FaComments className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaUsers className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Courses</h3>
                <div className="space-y-3">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <FaBook className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{course.title}</p>
                          <p className="text-xs text-gray-500">by {course.instructor_name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                        {course.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <FaUsers className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Course Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <FaBook className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">{course.title}</div>
                            <div className="text-sm text-gray-500">${course.price}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.instructor_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.enrollments_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/courses/${course.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <FaEye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Notification Management</h3>
              <button
                onClick={() => setShowNotificationModal(true)}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <FaComments className="h-4 w-4" />
                <span>Send Notification</span>
              </button>
            </div>
            
            {/* Sent Notifications Section */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaComments className="mr-2 text-primary-600" />
                Sent Notifications
              </h4>
              
              {sentNotifications.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <FaComments className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No notifications sent yet</p>
                  <button
                    onClick={() => setShowNotificationModal(true)}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Send Your First Notification
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentNotifications.map((notification) => (
                    <div key={notification.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-gray-900">{notification.title}</h5>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Recipients: {notification.recipientCount} user{notification.recipientCount !== 1 ? 's' : ''}</span>
                        <span>Sent: {new Date(notification.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Send Section */}
            <div className="border-t pt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaComments className="mr-2 text-primary-600" />
                Quick Send
              </h4>
              <div className="text-center py-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
                <FaComments className="h-12 w-12 text-primary-400 mx-auto mb-4" />
                <h5 className="text-lg font-semibold text-gray-900 mb-2">Send Platform Notifications</h5>
                <p className="text-gray-600 mb-6">Create and send notifications to users based on their roles</p>
                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Create Notification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Notification</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter notification message"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="announcement">Announcement</option>
                  <option value="course">Course Update</option>
                  <option value="deadline">Deadline Reminder</option>
                  <option value="achievement">Achievement</option>
                  <option value="warning">Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  value={notificationForm.targetRole}
                  onChange={(e) => setNotificationForm({ ...notificationForm, targetRole: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="instructor">Instructors Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendNotification}
                disabled={!notificationForm.title.trim() || !notificationForm.message.trim()}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

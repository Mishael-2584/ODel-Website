'use client'

import { useState, useEffect } from 'react'
import { useAuth, useRequireRole } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FaBook, FaVideo, FaUsers, FaChartBar, FaPlus, FaEdit, FaTrash, 
  FaPlay, FaPause, FaEye, FaGraduationCap, FaCalendarAlt,
  FaDollarSign, FaStar, FaComments, FaFileAlt
} from 'react-icons/fa'

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  price: number
  status: 'draft' | 'published' | 'archived'
  created_at: string
  enrollments_count?: number
  lessons_count?: number
}

interface Stats {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  averageRating: number
}

export default function InstructorDashboard() {
  const { profile } = useRequireRole(['instructor', 'admin'])
  const { signOut } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      fetchCourses()
      fetchStats()
    }
  }, [profile])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments(count),
          lessons(count),
          reviews(rating)
        `)
        .eq('instructor_id', profile?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const coursesWithCounts = data?.map(course => ({
        ...course,
        enrollments_count: course.enrollments?.[0]?.count || 0,
        lessons_count: course.lessons?.[0]?.count || 0
      })) || []

      setCourses(coursesWithCounts)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          id,
          price,
          enrollments(count),
          reviews(rating)
        `)
        .eq('instructor_id', profile?.id)

      const totalCourses = coursesData?.length || 0
      const totalStudents = coursesData?.reduce((sum, course) => 
        sum + (course.enrollments?.[0]?.count || 0), 0) || 0
      const totalRevenue = coursesData?.reduce((sum, course) => 
        sum + (course.price * (course.enrollments?.[0]?.count || 0)), 0) || 0
      
      const allRatings = coursesData?.flatMap(course => 
        course.reviews?.map((review: any) => review.rating) || []) || []
      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
        : 0

      setStats({
        totalCourses,
        totalStudents,
        totalRevenue,
        averageRating
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
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
                Instructor Dashboard
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaBook className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gold-100 rounded-lg">
                <FaDollarSign className="h-6 w-6 text-gold-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaStar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)} ⭐
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <Link
            href="/instructor/courses/create"
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <FaPlus className="h-5 w-5" />
            <span>Create New Course</span>
          </Link>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FaBook className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Create your first course to start teaching on UEAB ODel</p>
            <Link
              href="/instructor/courses/create"
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <FaPlus className="h-5 w-5" />
              <span>Create Course</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaBook className="h-16 w-16 text-primary-600" />
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                    <span className="text-sm font-semibold text-gold-600">${course.price}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <FaUsers className="h-4 w-4 mr-1" />
                        {course.enrollments_count} students
                      </span>
                      <span className="flex items-center">
                        <FaVideo className="h-4 w-4 mr-1" />
                        {course.lessons_count} lessons
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/instructor/courses/${course.id}/edit`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <FaEdit className="h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex-1 bg-primary-100 hover:bg-primary-200 text-primary-700 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <FaEye className="h-4 w-4" />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

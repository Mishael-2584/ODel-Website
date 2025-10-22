'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useRequireRole } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FaArrowLeft, FaSave, FaEye, FaUpload, FaImage, FaVideo, 
  FaFileAlt, FaDollarSign, FaTag, FaCalendarAlt, FaGraduationCap,
  FaPlus, FaTrash, FaEdit, FaBook, FaClock, FaPlay
} from 'react-icons/fa'

interface CourseData {
  title: string
  description: string
  category: string
  price: number
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  thumbnail_url: string
  status: 'draft' | 'published'
}

interface Lesson {
  id?: string
  title: string
  description: string
  content: string
  video_url: string
  duration: number
  order_index: number
}

export default function CreateCoursePage() {
  const { profile } = useRequireRole(['instructor', 'admin'])
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'lessons' | 'preview'>('basic')
  
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    category: '',
    price: 0,
    duration: 0,
    level: 'beginner',
    thumbnail_url: '',
    status: 'draft'
  })

  const [lessons, setLessons] = useState<Lesson[]>([
    {
      title: '',
      description: '',
      content: '',
      video_url: '',
      duration: 0,
      order_index: 1
    }
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!courseData.title.trim()) {
      newErrors.title = 'Course title is required'
    }

    if (!courseData.description.trim()) {
      newErrors.description = 'Course description is required'
    }

    if (!courseData.category.trim()) {
      newErrors.category = 'Course category is required'
    }

    if (courseData.price < 0) {
      newErrors.price = 'Price cannot be negative'
    }

    if (lessons.some(lesson => !lesson.title.trim())) {
      newErrors.lessons = 'All lessons must have a title'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveCourse = async (status: 'draft' | 'published') => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // Create the course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          status,
          instructor_id: profile?.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (courseError) throw courseError

      // Create lessons
      if (lessons.length > 0 && lessons[0].title.trim()) {
        const lessonsData = lessons
          .filter(lesson => lesson.title.trim())
          .map(lesson => ({
            ...lesson,
            course_id: course.id,
            created_at: new Date().toISOString()
          }))

        const { error: lessonsError } = await supabase
          .from('lessons')
          .insert(lessonsData)

        if (lessonsError) throw lessonsError
      }

      router.push(`/instructor/courses/${course.id}/edit`)
    } catch (error) {
      console.error('Error creating course:', error)
      setErrors({ general: 'Failed to create course. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const addLesson = () => {
    setLessons([...lessons, {
      title: '',
      description: '',
      content: '',
      video_url: '',
      duration: 0,
      order_index: lessons.length + 1
    }])
  }

  const removeLesson = (index: number) => {
    if (lessons.length > 1) {
      setLessons(lessons.filter((_, i) => i !== index))
    }
  }

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    const updatedLessons = [...lessons]
    updatedLessons[index] = { ...updatedLessons[index], [field]: value }
    setLessons(updatedLessons)
  }

  const categories = [
    'Programming',
    'Data Science',
    'Web Development',
    'Mobile Development',
    'Design',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Language Learning',
    'Mathematics',
    'Science',
    'History',
    'Literature',
    'Other'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/instructor/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <FaArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {profile?.full_name}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'basic', name: 'Basic Info', icon: FaEdit },
              { id: 'lessons', name: 'Lessons', icon: FaVideo },
              { id: 'preview', name: 'Preview', icon: FaEye }
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

        {/* Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errors.general}
          </div>
        )}

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Basic Information</h2>
            
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter course title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe what students will learn in this course"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Category and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={courseData.category}
                    onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    id="level"
                    value={courseData.level}
                    onChange={(e) => setCourseData({ ...courseData, level: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Price and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      id="price"
                      value={courseData.price}
                      onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={courseData.duration}
                    onChange={(e) => setCourseData({ ...courseData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-semibold text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <div className="relative">
                  <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    id="thumbnail"
                    value={courseData.thumbnail_url}
                    onChange={(e) => setCourseData({ ...courseData, thumbnail_url: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Course Lessons</h2>
                <button
                  onClick={addLesson}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <FaPlus className="h-4 w-4" />
                  <span>Add Lesson</span>
                </button>
              </div>

              {errors.lessons && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {errors.lessons}
                </div>
              )}

              <div className="space-y-6">
                {lessons.map((lesson, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Lesson {index + 1}</h3>
                      {lessons.length > 1 && (
                        <button
                          onClick={() => removeLesson(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Lesson Title *
                        </label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, 'title', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter lesson title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Lesson Description
                        </label>
                        <textarea
                          value={lesson.description}
                          onChange={(e) => updateLesson(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Brief description of this lesson"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Video URL
                        </label>
                        <div className="relative">
                          <FaVideo className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            value={lesson.video_url}
                            onChange={(e) => updateLesson(index, 'video_url', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={lesson.duration}
                            onChange={(e) => updateLesson(index, 'duration', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Order
                          </label>
                          <input
                            type="number"
                            value={lesson.order_index}
                            onChange={(e) => updateLesson(index, 'order_index', parseInt(e.target.value) || index + 1)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder={String(index + 1)}
                            min="1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Lesson Content
                        </label>
                        <textarea
                          value={lesson.content}
                          onChange={(e) => updateLesson(index, 'content', e.target.value)}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Detailed lesson content, notes, or additional resources..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Preview</h2>
            
            <div className="max-w-2xl mx-auto">
              {/* Course Card */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  {courseData.thumbnail_url ? (
                    <img 
                      src={courseData.thumbnail_url} 
                      alt={courseData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaBook className="h-16 w-16 text-primary-600" />
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {courseData.status}
                    </span>
                    <span className="text-lg font-semibold text-gold-600">${courseData.price}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {courseData.title || 'Untitled Course'}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {courseData.description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <FaTag className="h-4 w-4 mr-1" />
                        {courseData.category || 'Uncategorized'}
                      </span>
                      <span className="flex items-center">
                        <FaGraduationCap className="h-4 w-4 mr-1" />
                        {courseData.level}
                      </span>
                      <span className="flex items-center">
                        <FaClock className="h-4 w-4 mr-1" />
                        {courseData.duration}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lessons Preview */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lessons ({lessons.filter(l => l.title.trim()).length})</h3>
                <div className="space-y-2">
                  {lessons.filter(lesson => lesson.title.trim()).map((lesson, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{lesson.title}</p>
                          <p className="text-sm text-gray-500">{lesson.duration} minutes</p>
                        </div>
                      </div>
                      <FaPlay className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setActiveTab(activeTab === 'basic' ? 'basic' : activeTab === 'lessons' ? 'basic' : 'lessons')}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {activeTab === 'preview' ? 'Back to Lessons' : 'Previous'}
          </button>

          <div className="flex space-x-4">
            <button
              onClick={() => handleSaveCourse('draft')}
              disabled={loading}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FaSave className="h-4 w-4" />
              <span>Save as Draft</span>
            </button>
            
            <button
              onClick={() => handleSaveCourse('published')}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <FaEye className="h-4 w-4" />
                  <span>Publish Course</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

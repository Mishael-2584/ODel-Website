'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FaSearch, FaFilter, FaUsers, FaStar, FaClock, FaBook, FaGraduationCap } from 'react-icons/fa'

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All')

  const categories = ['All', 'Business', 'Technology', 'Healthcare', 'Education', 'Science', 'Arts']
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const courses = [
    {
      id: 1,
      title: 'Business Administration & Management',
      category: 'Business',
      level: 'Intermediate',
      students: 1250,
      rating: 4.8,
      duration: '12 weeks',
      lessons: 48,
      description: 'Master the fundamentals of business management, leadership, and strategic planning.',
      instructor: 'Dr. Sarah Kimani',
      price: 'KES 45,000',
      image: '📊'
    },
    {
      id: 2,
      title: 'Computer Science & Programming',
      category: 'Technology',
      level: 'Advanced',
      students: 980,
      rating: 4.9,
      duration: '16 weeks',
      lessons: 64,
      description: 'Learn software development, algorithms, and modern programming practices.',
      instructor: 'Prof. John Mwangi',
      price: 'KES 55,000',
      image: '💻'
    },
    {
      id: 3,
      title: 'Nursing & Health Sciences',
      category: 'Healthcare',
      level: 'Intermediate',
      students: 850,
      rating: 4.7,
      duration: '14 weeks',
      lessons: 56,
      description: 'Comprehensive nursing education with practical healthcare applications.',
      instructor: 'Dr. Grace Wanjiru',
      price: 'KES 50,000',
      image: '🏥'
    },
    {
      id: 4,
      title: 'Education & Teaching Methods',
      category: 'Education',
      level: 'Beginner',
      students: 720,
      rating: 4.8,
      duration: '10 weeks',
      lessons: 40,
      description: 'Modern teaching strategies and educational psychology for aspiring educators.',
      instructor: 'Dr. Peter Ochieng',
      price: 'KES 40,000',
      image: '📚'
    },
    {
      id: 5,
      title: 'Digital Marketing & E-Commerce',
      category: 'Business',
      level: 'Intermediate',
      students: 650,
      rating: 4.6,
      duration: '8 weeks',
      lessons: 32,
      description: 'Master digital marketing strategies, SEO, social media, and online business.',
      instructor: 'Mary Akinyi',
      price: 'KES 35,000',
      image: '📱'
    },
    {
      id: 6,
      title: 'Data Science & Analytics',
      category: 'Technology',
      level: 'Advanced',
      students: 580,
      rating: 4.9,
      duration: '14 weeks',
      lessons: 52,
      description: 'Learn data analysis, machine learning, and statistical modeling.',
      instructor: 'Dr. James Kipchoge',
      price: 'KES 60,000',
      image: '📈'
    },
    {
      id: 7,
      title: 'Public Health & Community Medicine',
      category: 'Healthcare',
      level: 'Intermediate',
      students: 490,
      rating: 4.7,
      duration: '12 weeks',
      lessons: 45,
      description: 'Understanding public health systems and community healthcare delivery.',
      instructor: 'Dr. Ruth Njeri',
      price: 'KES 48,000',
      image: '🏥'
    },
    {
      id: 8,
      title: 'Environmental Science & Sustainability',
      category: 'Science',
      level: 'Beginner',
      students: 420,
      rating: 4.5,
      duration: '10 weeks',
      lessons: 38,
      description: 'Explore environmental issues, conservation, and sustainable development.',
      instructor: 'Prof. David Mutua',
      price: 'KES 42,000',
      image: '🌍'
    },
    {
      id: 9,
      title: 'Graphic Design & Multimedia',
      category: 'Arts',
      level: 'Beginner',
      students: 550,
      rating: 4.6,
      duration: '12 weeks',
      lessons: 44,
      description: 'Create stunning visuals with modern design tools and principles.',
      instructor: 'Michael Omondi',
      price: 'KES 38,000',
      image: '🎨'
    }
  ]

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Our Courses</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Discover world-class programs designed to advance your career and expand your knowledge
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white shadow-md sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="relative">
              <FaGraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white cursor-pointer"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-primary-600">{filteredCourses.length}</span> courses
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div key={course.id} className="card group hover:scale-105 transition-transform cursor-pointer">
                  <div className="text-6xl mb-4">{course.image}</div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {course.category}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <FaGraduationCap className="mr-2 text-primary-500" />
                    <span>{course.instructor}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-4">
                    <div className="flex items-center">
                      <FaUsers className="mr-1" />
                      {course.students}
                    </div>
                    <div className="flex items-center">
                      <FaStar className="mr-1 text-gold-500" />
                      {course.rating}
                    </div>
                    <div className="flex items-center">
                      <FaBook className="mr-1" />
                      {course.lessons}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="font-semibold text-gray-900 flex items-center">
                        <FaClock className="mr-1 text-primary-500" />
                        {course.duration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="text-lg font-bold text-primary-600">{course.price}</div>
                    </div>
                  </div>

                  <button className="w-full mt-4 btn-primary !py-2">
                    Enroll Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}


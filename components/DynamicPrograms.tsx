'use client'

import React, { useState, useEffect } from 'react'
import { FaBookOpen, FaUsers, FaChartLine, FaClock, FaTrophy, FaArrowRight, FaExternalLinkAlt } from 'react-icons/fa'

interface DynamicProgram {
  id: string
  name: string
  description: string
  school: string
  level: 'undergraduate' | 'graduate' | 'certificate' | 'diploma'
  duration: string
  credits: number
  enrollmentCount: number
  rating: number
  courses: Array<{
    id: number
    name: string
    code: string
    description: string
    credits: number
  }>
  careerPaths: string[]
  admissionRequirements: string[]
  featured: boolean
  trending: boolean
}

export default function DynamicPrograms() {
  const [programs, setPrograms] = useState<DynamicProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSchool, setSelectedSchool] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const response = await fetch('/api/smart-courses/programs')
      const data = await response.json()
      if (data.success) {
        setPrograms(data.programs)
      }
    } catch (error) {
      console.error('Error loading programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSchool = selectedSchool === 'all' || program.school === selectedSchool
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSchool && matchesSearch
  })

  const schools = [...new Set(programs.map(p => p.school))]

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading programs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Our Programs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive range of programs designed to prepare you for success in your chosen field
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Schools</option>
            {schools.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.slice(0, 9).map((program) => (
            <div key={program.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Program Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{program.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{program.school}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FaClock className="mr-1" />
                        {program.duration}
                      </span>
                      <span className="flex items-center">
                        <FaBookOpen className="mr-1" />
                        {program.credits} credits
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {program.trending && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2">
                        Trending
                      </span>
                    )}
                    {program.featured && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Program Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {program.description}
                </p>

                {/* Statistics */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <FaUsers className="mr-1" />
                      {program.enrollmentCount} enrolled
                    </span>
                    <span className="flex items-center">
                      <FaTrophy className="mr-1" />
                      {program.rating.toFixed(1)}/5
                    </span>
                  </div>
                </div>

                {/* Career Paths */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Career Paths:</h4>
                  <div className="flex flex-wrap gap-1">
                    {program.careerPaths.slice(0, 3).map((path, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {path}
                      </span>
                    ))}
                    {program.careerPaths.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{program.careerPaths.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Learn More
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <FaExternalLinkAlt />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Programs Button */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            View All Programs
            <FaArrowRight className="inline ml-2" />
          </button>
        </div>
      </div>
    </section>
  )
}

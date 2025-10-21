'use client'

import React, { useState, useMemo } from 'react'
import { FaFilter, FaGraduationCap, FaBook, FaUniversity } from 'react-icons/fa'

interface Program {
  id: number
  title: string
  level: 'Bachelor' | 'Masters' | 'Doctorate'
  credits: number
  semesters: string[]
  methods: string[]
}

interface Department {
  id: number
  name: string
  programs: Program[]
}

interface School {
  id: number
  name: string
  description: string
  departments: Department[]
}

const ProgramsCatalog: React.FC = () => {
  const [schoolsData, setSchoolsData] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string>('All')
  const [loading, setLoading] = useState(true)

  // Load programs data
  React.useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await fetch('/data/ueab-programs.json')
        const data = await response.json()
        setSchoolsData(data.schools)
        setSelectedSchool(data.schools[0]?.id || null)
      } catch (error) {
        console.error('Error loading programs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPrograms()
  }, [])

  // Get current school
  const currentSchool = useMemo(
    () => schoolsData.find(s => s.id === selectedSchool),
    [schoolsData, selectedSchool]
  )

  // Get filtered programs
  const filteredPrograms = useMemo(() => {
    if (!currentSchool) return []

    let programs: (Program & { departmentName: string })[] = []

    currentSchool.departments.forEach(dept => {
      dept.programs.forEach(prog => {
        if (selectedLevel === 'All' || prog.level === selectedLevel) {
          programs.push({
            ...prog,
            departmentName: dept.name
          })
        }
      })
    })

    return programs
  }, [currentSchool, selectedLevel])

  // Get level summary
  const levelSummary = useMemo(() => {
    if (!currentSchool) return {}

    const summary: Record<string, number> = {}
    currentSchool.departments.forEach(dept => {
      dept.programs.forEach(prog => {
        summary[prog.level] = (summary[prog.level] || 0) + 1
      })
    })
    return summary
  }, [currentSchool])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading programs catalog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">UEAB Programs Catalog</h1>
          <p className="text-xl text-gray-600">Explore all academic programs offered by UEAB</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Schools and Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
              {/* Schools Section */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FaUniversity className="mr-2 text-blue-600" />
                  Schools
                </h2>
                <div className="space-y-2">
                  {schoolsData.map(school => (
                    <button
                      key={school.id}
                      onClick={() => {
                        setSelectedSchool(school.id)
                        setSelectedLevel('All')
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedSchool === school.id
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-sm">{school.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FaFilter className="mr-2 text-blue-600" />
                  Filter by Level
                </h3>
                <div className="space-y-2">
                  {['All', 'Bachelor', 'Masters', 'Doctorate'].map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center ${
                        selectedLevel === level
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-sm flex-1">{level}</span>
                      <span className="text-xs bg-opacity-30 bg-white px-2 py-1 rounded">
                        {level === 'All'
                          ? Object.values(levelSummary).reduce((a, b) => a + b, 0)
                          : levelSummary[level] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* School Info */}
            {currentSchool && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{currentSchool.name}</h2>
                <p className="text-gray-600 mb-6">{currentSchool.description}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Programs</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentSchool.departments.reduce((sum, d) => sum + d.programs.length, 0)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Departments</p>
                    <p className="text-2xl font-bold text-purple-600">{currentSchool.departments.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Active Semesters</p>
                    <p className="text-2xl font-bold text-green-600">2</p>
                  </div>
                </div>
              </div>
            )}

            {/* Programs by Department */}
            <div className="space-y-6">
              {currentSchool?.departments.map(department => {
                const deptPrograms = department.programs.filter(
                  p => selectedLevel === 'All' || p.level === selectedLevel
                )

                if (deptPrograms.length === 0) return null

                return (
                  <div key={department.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Department Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                      <h3 className="text-xl font-bold mb-1">{department.name}</h3>
                      <p className="text-blue-100">{deptPrograms.length} program(s)</p>
                    </div>

                    {/* Programs Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {deptPrograms.map(program => (
                        <div
                          key={program.id}
                          className="border-l-4 border-blue-500 bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 flex-1">{program.title}</h4>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2 ${
                              program.level === 'Bachelor'
                                ? 'bg-blue-100 text-blue-700'
                                : program.level === 'Masters'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {program.level}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <FaBook className="mr-2 text-blue-500" />
                              <span><strong>Credits:</strong> {program.credits}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <FaGraduationCap className="mr-2 text-purple-500" />
                              <span><strong>Methods:</strong> {program.methods.join(', ')}</span>
                            </div>
                            <div className="text-gray-600">
                              <strong>Semesters:</strong> {program.semesters.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* No Results */}
            {filteredPrograms.length === 0 && !loading && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No programs found for the selected filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgramsCatalog

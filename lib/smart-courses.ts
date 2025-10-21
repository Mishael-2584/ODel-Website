// Smart Course Discovery System
// Dynamically generates program information from Moodle data

interface SmartProgram {
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
    prerequisites?: string[]
  }>
  careerPaths: string[]
  admissionRequirements: string[]
  featured: boolean
  trending: boolean
}

class SmartCourseDiscovery {
  private moodleService: any

  constructor(moodleService: any) {
    this.moodleService = moodleService
  }

  // Generate smart programs from Moodle data
  async generateSmartPrograms(): Promise<SmartProgram[]> {
    try {
      const [courses, categories] = await Promise.all([
        this.moodleService.getCourses(),
        this.moodleService.getCategories()
      ])

      // Group courses by school/category
      const programsBySchool = this.groupCoursesBySchool(courses, categories)
      
      // Generate program information
      const smartPrograms = this.createProgramsFromCourses(programsBySchool)
      
      return smartPrograms
    } catch (error) {
      console.error('Error generating smart programs:', error)
      return []
    }
  }

  // Group courses by school and create program structures
  private groupCoursesBySchool(courses: any[], categories: any[]) {
    const schoolMap = new Map()
    
    categories.forEach(category => {
      if (category.coursecount > 0) {
        const schoolCourses = courses.filter(course => 
          course.categoryid === category.id
        )
        
        if (schoolCourses.length > 0) {
          schoolMap.set(category.name, {
            category,
            courses: schoolCourses
          })
        }
      }
    })
    
    return schoolMap
  }

  // Create program structures from grouped courses
  private createProgramsFromCourses(programsBySchool: Map<string, any>): SmartProgram[] {
    const programs: SmartProgram[] = []
    
    programsBySchool.forEach((schoolData, schoolName) => {
      const { category, courses } = schoolData
      
      // Create programs based on course patterns
      const programPatterns = this.identifyProgramPatterns(courses)
      
      programPatterns.forEach(pattern => {
        const program: SmartProgram = {
          id: `program_${category.id}_${pattern.id}`,
          name: pattern.name,
          description: pattern.description,
          school: schoolName,
          level: pattern.level,
          duration: pattern.duration,
          credits: pattern.credits,
          enrollmentCount: pattern.enrollmentCount,
          rating: pattern.rating,
          courses: pattern.courses,
          careerPaths: pattern.careerPaths,
          admissionRequirements: pattern.admissionRequirements,
          featured: pattern.featured,
          trending: pattern.trending
        }
        
        programs.push(program)
      })
    })
    
    return programs
  }

  // Identify program patterns from course data
  private identifyProgramPatterns(courses: any[]) {
    const patterns = []
    
    // Group courses by common prefixes or patterns
    const courseGroups = this.groupCoursesByPattern(courses)
    
    courseGroups.forEach(group => {
      const pattern = this.analyzeCourseGroup(group)
      if (pattern) {
        patterns.push(pattern)
      }
    })
    
    return patterns
  }

  // Group courses by naming patterns
  private groupCoursesByPattern(courses: any[]) {
    const groups = new Map()
    
    courses.forEach(course => {
      const shortname = course.shortname || ''
      const fullname = course.fullname || ''
      
      // Extract program codes (e.g., TDBL, TAHC, etc.)
      const programCode = shortname.match(/^([A-Z]{2,4})/)?.[1]
      
      if (programCode) {
        if (!groups.has(programCode)) {
          groups.set(programCode, [])
        }
        groups.get(programCode).push(course)
      }
    })
    
    return groups
  }

  // Analyze a group of courses to create program information
  private analyzeCourseGroup(courses: any[]) {
    if (courses.length === 0) return null
    
    const firstCourse = courses[0]
    const programCode = firstCourse.shortname?.match(/^([A-Z]{2,4})/)?.[1] || 'UNKNOWN'
    
    // Determine program level based on course codes
    const level = this.determineProgramLevel(courses)
    
    // Calculate total enrollment
    const totalEnrollment = courses.reduce((sum, course) => 
      sum + (course.enrolledusercount || 0), 0
    )
    
    // Generate program name from course patterns
    const programName = this.generateProgramName(courses, programCode)
    
    return {
      id: programCode,
      name: programName,
      description: this.generateProgramDescription(courses),
      level,
      duration: this.estimateDuration(courses),
      credits: this.estimateCredits(courses),
      enrollmentCount: totalEnrollment,
      rating: this.calculateRating(courses),
      courses: courses.map(course => ({
        id: course.id,
        name: course.fullname,
        code: course.shortname,
        description: course.summary?.substring(0, 200) || '',
        credits: this.estimateCourseCredits(course)
      })),
      careerPaths: this.generateCareerPaths(programCode, level),
      admissionRequirements: this.generateAdmissionRequirements(level),
      featured: totalEnrollment > 100,
      trending: this.isTrending(courses)
    }
  }

  // Helper methods for program analysis
  private determineProgramLevel(courses: any[]): string {
    const codes = courses.map(c => c.shortname).join(' ')
    
    if (codes.includes('MASTER') || codes.includes('MSC') || codes.includes('MBA')) {
      return 'graduate'
    } else if (codes.includes('CERT') || codes.includes('DIPLOMA')) {
      return 'certificate'
    } else {
      return 'undergraduate'
    }
  }

  private generateProgramName(courses: any[], programCode: string): string {
    // Map program codes to full names
    const codeMap: Record<string, string> = {
      'TDBL': 'Textile Design and Fashion Technology',
      'TAHC': 'Agriculture and Horticulture',
      'TEDU': 'Education',
      'TCOM': 'Communication and Media',
      'TNUR': 'Nursing and Health Sciences',
      'TBUS': 'Business Administration',
      'TSCI': 'Science and Technology'
    }
    
    return codeMap[programCode] || `${programCode} Program`
  }

  private generateProgramDescription(courses: any[]): string {
    const descriptions = courses
      .map(c => c.summary)
      .filter(d => d && d.length > 50)
      .slice(0, 3)
    
    if (descriptions.length > 0) {
      return descriptions[0].substring(0, 300) + '...'
    }
    
    return 'A comprehensive program designed to provide students with practical skills and theoretical knowledge in their chosen field.'
  }

  private estimateDuration(courses: any[]): string {
    const courseCount = courses.length
    if (courseCount <= 4) return '1 year'
    if (courseCount <= 8) return '2 years'
    if (courseCount <= 12) return '3 years'
    return '4 years'
  }

  private estimateCredits(courses: any[]): number {
    return courses.length * 3 // Assume 3 credits per course
  }

  private calculateRating(courses: any[]): number {
    // Simple rating based on enrollment and course count
    const avgEnrollment = courses.reduce((sum, c) => sum + (c.enrolledusercount || 0), 0) / courses.length
    const courseCount = courses.length
    
    let rating = 4.0
    if (avgEnrollment > 50) rating += 0.5
    if (courseCount > 6) rating += 0.3
    if (avgEnrollment > 100) rating += 0.2
    
    return Math.min(5.0, rating)
  }

  private generateCareerPaths(programCode: string, level: string): string[] {
    const careerMap: Record<string, string[]> = {
      'TDBL': ['Fashion Designer', 'Textile Engineer', 'Fashion Merchandiser', 'Costume Designer'],
      'TAHC': ['Agricultural Officer', 'Farm Manager', 'Horticulturist', 'Agricultural Consultant'],
      'TEDU': ['Teacher', 'Educational Administrator', 'Curriculum Developer', 'Training Coordinator'],
      'TCOM': ['Journalist', 'Media Producer', 'Communications Officer', 'Public Relations Specialist'],
      'TNUR': ['Registered Nurse', 'Nurse Educator', 'Healthcare Administrator', 'Clinical Specialist'],
      'TBUS': ['Business Manager', 'Marketing Executive', 'Financial Analyst', 'Operations Manager'],
      'TSCI': ['Research Scientist', 'Laboratory Technician', 'Data Analyst', 'Technical Consultant']
    }
    
    return careerMap[programCode] || ['Professional in Field', 'Industry Specialist', 'Technical Expert']
  }

  private generateAdmissionRequirements(level: string): string[] {
    const baseRequirements = [
      'KCSE Certificate with C+ and above',
      'Mathematics C+ and above',
      'English C+ and above'
    ]
    
    if (level === 'graduate') {
      return [
        'Bachelor\'s degree in related field',
        'Minimum 2nd Class Upper Division',
        'Professional experience preferred'
      ]
    }
    
    return baseRequirements
  }

  private isTrending(courses: any[]): boolean {
    const totalEnrollment = courses.reduce((sum, c) => sum + (c.enrolledusercount || 0), 0)
    return totalEnrollment > 200 || courses.length > 8
  }

  private estimateCourseCredits(course: any): number {
    // Estimate credits based on course name patterns
    const name = course.fullname?.toLowerCase() || ''
    if (name.includes('practical') || name.includes('project')) return 4
    if (name.includes('thesis') || name.includes('research')) return 6
    return 3
  }
}

export { SmartCourseDiscovery, type SmartProgram }

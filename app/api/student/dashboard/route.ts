import { NextRequest, NextResponse } from 'next/server'
import { moodleAuthService } from '@/lib/moodle-auth'

export async function GET(request: NextRequest) {
  try {
    // This would typically get the user ID from the session or JWT token
    // For now, we'll use a mock user ID for demonstration
    const userId = 1 // This should come from authentication
    
    // Get user's enrolled courses
    const enrolledCourses = await moodleAuthService.getUserEnrolledCourses(userId)
    
    // Get upcoming deadlines
    const upcomingDeadlines = await moodleAuthService.getUserUpcomingDeadlines(userId)
    
    // Get recent grades
    const recentGrades = await moodleAuthService.getUserGrades(userId)
    
    // Calculate statistics
    const statistics = {
      totalCourses: enrolledCourses.length,
      completedCourses: enrolledCourses.filter(course => course.progress === 100).length,
      averageGrade: recentGrades.length > 0 
        ? Math.round(recentGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / recentGrades.length)
        : 0,
      totalStudyHours: enrolledCourses.reduce((sum, course) => sum + (course.timemodified || 0), 0) / 3600 // Convert to hours
    }
    
    // Mock user data (in real implementation, this would come from Moodle)
    const user = {
      id: userId,
      fullname: 'John Doe',
      email: 'john.doe@ueab.ac.ke',
      profileimageurl: '/images/default-avatar.png',
      department: 'School of Business and Technology'
    }
    
    const studentData = {
      user,
      enrolledCourses: enrolledCourses.map(course => ({
        id: course.id,
        name: course.fullname,
        progress: Math.floor(Math.random() * 100), // Mock progress
        lastAccess: new Date(course.lastaccess * 1000).toISOString(),
        grade: Math.floor(Math.random() * 40) + 60 // Mock grade between 60-100
      })),
      upcomingDeadlines: upcomingDeadlines.map(deadline => ({
        id: deadline.id,
        name: deadline.name,
        courseName: deadline.courseName,
        duedate: deadline.duedate,
        type: 'assignment'
      })),
      recentGrades: recentGrades.slice(0, 5).map(grade => ({
        courseName: grade.coursename || 'Unknown Course',
        assignmentName: grade.itemname || 'Assignment',
        grade: grade.grade || 0,
        maxGrade: grade.grademax || 100,
        date: new Date(grade.timemodified * 1000).toLocaleDateString()
      })),
      statistics
    }
    
    return NextResponse.json(studentData)
  } catch (error) {
    console.error('Error loading student dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to load student dashboard' },
      { status: 500 }
    )
  }
}

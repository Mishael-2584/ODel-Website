import { NextRequest, NextResponse } from 'next/server'
import { moodleService } from '@/lib/moodle'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const courseId = searchParams.get('courseId')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    switch (action) {
      case 'courses':
        const courses = await moodleService.getCourses({
          categoryId: categoryId ? parseInt(categoryId) : undefined,
          search: search || undefined,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined
        })
        return NextResponse.json({
          success: true,
          data: courses,
          count: courses.length
        })

      case 'categories':
        const categories = await moodleService.getCategories()
        return NextResponse.json({
          success: true,
          data: categories,
          count: categories.length
        })

      case 'course-details':
        if (!courseId) {
          return NextResponse.json(
            { error: 'Course ID is required' },
            { status: 400 }
          )
        }
        const courseDetails = await moodleService.getCourseDetails(parseInt(courseId))
        return NextResponse.json({
          success: true,
          data: courseDetails
        })

      case 'course-enrollments':
        if (!courseId) {
          return NextResponse.json(
            { error: 'Course ID is required' },
            { status: 400 }
          )
        }
        const enrollments = await moodleService.getCourseEnrollments(parseInt(courseId))
        return NextResponse.json({
          success: true,
          data: enrollments,
          count: enrollments.length
        })

      case 'search':
        if (!search) {
          return NextResponse.json(
            { error: 'Search term is required' },
            { status: 400 }
          )
        }
        const searchResults = await moodleService.searchCourses(search)
        return NextResponse.json({
          success: true,
          data: searchResults,
          count: searchResults.length,
          query: search
        })

      case 'statistics':
        const statistics = await moodleService.getCourseStatistics()
        return NextResponse.json({
          success: true,
          data: statistics
        })

      case 'courses-by-category':
        if (!categoryId) {
          return NextResponse.json(
            { error: 'Category ID is required' },
            { status: 400 }
          )
        }
        const categoryCourses = await moodleService.getCoursesByCategory(parseInt(categoryId))
        return NextResponse.json({
          success: true,
          data: categoryCourses,
          count: categoryCourses.length,
          categoryId: parseInt(categoryId)
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: courses, categories, course-details, course-enrollments, search, statistics, courses-by-category' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Moodle API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'search-courses':
        if (!data?.search) {
          return NextResponse.json(
            { error: 'Search term is required' },
            { status: 400 }
          )
        }
        const searchResults = await moodleService.searchCourses(data.search)
        return NextResponse.json({
          success: true,
          data: searchResults,
          count: searchResults.length,
          query: data.search
        })

      case 'get-courses-by-filters':
        const courses = await moodleService.getCourses({
          categoryId: data?.categoryId,
          search: data?.search,
          limit: data?.limit,
          offset: data?.offset
        })
        return NextResponse.json({
          success: true,
          data: courses,
          count: courses.length,
          filters: data
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action for POST request' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Moodle API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

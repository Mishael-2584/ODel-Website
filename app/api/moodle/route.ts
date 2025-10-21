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

      case 'category-courses':
        if (!categoryId) {
          return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
        }

        try {
          const courses = await moodleService.getCourses({ categoryId: parseInt(categoryId) })
          return NextResponse.json({ data: courses, success: true })
        } catch (error) {
          console.error('Error fetching category courses:', error)
          return NextResponse.json({ error: 'Failed to fetch category courses', data: [] }, { status: 500 })
        }

      case 'clear-cache':
        try {
          moodleService.clearCache()
          return NextResponse.json({ success: true, message: 'Cache cleared' })
        } catch (error) {
          console.error('Error clearing cache:', error)
          return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 })
        }

      case 'course-enrollment-stats':
        if (!courseId) {
          return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
        }

        try {
          const cacheKey = `enrollment-${courseId}`
          const cached = moodleService.getFromCache?.(cacheKey)
          
          if (cached) {
            console.log(`Returning cached enrollment for course ${courseId}`)
            return NextResponse.json({ 
              success: true,
              ...cached,
              cached: true
            })
          }

          const stats = await moodleService.getCourseEnrollmentStats(parseInt(courseId))
          
          // Cache for 30 minutes (1800 seconds)
          if (moodleService.setCache) {
            moodleService.setCache(cacheKey, stats, 30 * 60 * 1000)
          }
          
          return NextResponse.json({ 
            success: true, 
            enrolledUsers: stats.enrolledUsers,
            activeUsers: stats.activeUsers,
            lastAccess: stats.lastAccess,
            cached: false
          })
        } catch (error) {
          console.error('Error fetching enrollment stats:', error)
          return NextResponse.json({ 
            success: false,
            enrolledUsers: 0,
            activeUsers: 0,
            lastAccess: 0,
            cached: false
          }, { status: 500 })
        }

      case 'root-categories':
        try {
          const rootCategories = await moodleService.getRootCategories()
          return NextResponse.json({ success: true, data: rootCategories })
        } catch (error) {
          console.error('Error fetching root categories:', error)
          return NextResponse.json({ success: false, data: [], error: 'Failed to fetch root categories' }, { status: 500 })
        }

      case 'category-children':
        if (!categoryId) {
          return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
        }

        try {
          const children = await moodleService.getCategoryChildren(parseInt(categoryId))
          // Enhance children with course/enrollment counts
          const enhanced = await Promise.all(
            children.map(async (child: any) => {
              const details = await moodleService.getCategoryWithDetails(child.id)
              return details || child
            })
          )
          return NextResponse.json({ success: true, data: enhanced })
        } catch (error) {
          console.error('Error fetching category children:', error)
          return NextResponse.json({ success: false, data: [], error: 'Failed to fetch category children' }, { status: 500 })
        }

      case 'category-tree':
        try {
          const tree = moodleService.buildCategoryTree()
          return NextResponse.json({ success: true, data: tree })
        } catch (error) {
          console.error('Error building category tree:', error)
          return NextResponse.json({ success: false, data: {}, error: 'Failed to build category tree' }, { status: 500 })
        }

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

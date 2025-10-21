import { NextRequest, NextResponse } from 'next/server'
import { moodleService } from '@/lib/moodle'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  console.warn('⚠️ Supabase credentials not configured. Caching will be disabled.')
}

// Cache control headers
const CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60' // 60 seconds browser cache
}

// Helper to get cache from Supabase
async function getSupabaseCache(cacheKey: string) {
  if (!supabase) {
    console.log('⚠️ Supabase not configured, skipping cache lookup')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('moodle_cache')
      .select('data, expires_at, is_stale')
      .eq('cache_key', cacheKey)
      .single()

    if (error || !data) return null

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      // Mark for refresh in background
      await supabase.rpc('queue_cache_refresh', {
        cache_key_param: cacheKey,
        reason_param: 'ttl_expired'
      })
      return null
    }

    console.log(`✓ Cache HIT from Supabase: ${cacheKey}`)
    return { data: data.data, is_stale: data.is_stale }
  } catch (error) {
    console.warn(`Cache lookup failed for ${cacheKey}:`, error)
    return null
  }
}

// Helper to save cache to Supabase
async function saveSupabaseCache(cacheKey: string, data: any, ttl_minutes: number = 30) {
  if (!supabase) {
    console.log('⚠️ Supabase not configured, skipping cache save')
    return
  }

  try {
    await supabase.rpc('update_moodle_cache', {
      cache_key_param: cacheKey,
      data_param: data,
      ttl_minutes: ttl_minutes
    })
    console.log(`✓ Cached to Supabase: ${cacheKey}`)
  } catch (error) {
    console.warn(`Failed to cache ${cacheKey}:`, error)
  }
}

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

      case 'root-categories': {
        const cacheKey = 'root_categories'
        
        // Check Supabase cache first
        const cached = await getSupabaseCache(cacheKey)
        if (cached?.data && !cached.is_stale) {
          console.log('✅ Cache HIT - Returning from Supabase')
          return NextResponse.json(
            { success: true, data: cached.data, cached: true, source: 'supabase' },
            { headers: CACHE_HEADERS }
          )
        }

        // Cache miss - fetch from Moodle
        console.log('📡 Cache MISS - Fetching from Moodle API')
        const categories = await moodleService.getRootCategories()
        
        // Save to Supabase for ALL users
        if (supabase && categories.length > 0) {
          console.log('💾 Saving to Supabase cache...')
          await saveSupabaseCache(cacheKey, categories, 30)
        } else {
          console.log('⚠️ Supabase not configured or no categories returned')
        }
        
        return NextResponse.json(
          { success: true, data: categories, cached: false, source: 'moodle' },
          { headers: CACHE_HEADERS }
        )
      }

      case 'category-children': {
        if (!categoryId) {
          return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
        }

        const cacheKey = `category_children_${categoryId}`
        
        // Check Supabase cache first
        const cached = await getSupabaseCache(cacheKey)
        if (cached?.data && !cached.is_stale) {
          console.log(`✅ Cache HIT - Category ${categoryId} from Supabase`)
          return NextResponse.json(
            { success: true, data: cached.data, cached: true, source: 'supabase' },
            { headers: CACHE_HEADERS }
          )
        }
        
        console.log(`📡 Cache MISS - Fetching category ${categoryId} children from Moodle`)
        const children = await moodleService.getCategoryChildren(parseInt(categoryId))
        
        // Save to Supabase for all users
        if (supabase && children.length > 0) {
          console.log(`💾 Saving category ${categoryId} children to Supabase cache`)
          await saveSupabaseCache(cacheKey, children, 30)
        }
        
        return NextResponse.json(
          { success: true, data: children, cached: false, source: 'moodle' },
          { headers: CACHE_HEADERS }
        )
      }

      case 'category-tree':
        try {
          const tree = moodleService.buildCategoryTree()
          return NextResponse.json({ success: true, data: tree })
        } catch (error) {
          console.error('Error building category tree:', error)
          return NextResponse.json({ success: false, data: {}, error: 'Failed to build category tree' }, { status: 500 })
        }

      case 'courses-with-details': {
        if (!categoryId) {
          return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
        }

        const cacheKey = `courses_with_details_${categoryId}`
        
        // Check Supabase cache first
        const cached = await getSupabaseCache(cacheKey)
        if (cached?.data && !cached.is_stale) {
          console.log(`✅ Cache HIT - Courses for category ${categoryId} from Supabase`)
          return NextResponse.json(
            { success: true, data: cached.data, cached: true, source: 'supabase' },
            { headers: CACHE_HEADERS }
          )
        }

        console.log(`📡 Cache MISS - Fetching courses for category ${categoryId} from Moodle`)
        const courses = await moodleService.getCourses({ categoryId: parseInt(categoryId) })
        
        if (!courses || courses.length === 0) {
          return NextResponse.json(
            { success: true, data: [], cached: false, source: 'moodle' },
            { headers: CACHE_HEADERS }
          )
        }

        console.log(`📊 Fetching details for ${courses.length} courses with optimized batching`)
        
        // Batch size for parallel requests (5 courses at a time to avoid overwhelming Moodle)
        const BATCH_SIZE = 5
        const coursesWithDetails = []
        
        for (let i = 0; i < courses.length; i += BATCH_SIZE) {
          const batch = courses.slice(i, i + BATCH_SIZE)
          console.log(`  Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} courses)`)
          
          const batchResults = await Promise.all(
            batch.map(async (course: any) => {
              try {
                // Fetch in parallel with 100ms timeout to avoid blocking
                const [enrolledUsers, instructors] = await Promise.all([
                  moodleService.getCourseEnrollments(course.id).catch(() => []),
                  moodleService.getCourseInstructors(course.id).catch(() => [])
                ])
                
                return {
                  ...course,
                  enrolledusercount: enrolledUsers.length || 0,
                  instructorNames: instructors.length > 0
                    ? instructors.map((i: any) => i.fullname).join(', ')
                    : 'Not assigned'
                }
              } catch (err) {
                console.error(`Error fetching details for course ${course.id}:`, err)
                return {
                  ...course,
                  enrolledusercount: 0,
                  instructorNames: 'Not assigned'
                }
              }
            })
          )
          
          coursesWithDetails.push(...batchResults)
        }

        // Save to Supabase for all users
        if (supabase && coursesWithDetails.length > 0) {
          console.log(`💾 Saving ${coursesWithDetails.length} courses for category ${categoryId} to Supabase cache`)
          await saveSupabaseCache(cacheKey, coursesWithDetails, 30)
        }
        
        return NextResponse.json(
          { success: true, data: coursesWithDetails, cached: false, source: 'moodle' },
          { headers: CACHE_HEADERS }
        )
      }

      case 'user-courses': {
        const userId = searchParams.get('userId')
        if (!userId) {
          return NextResponse.json(
            { error: 'userId is required' },
            { status: 400 }
          )
        }

        const cacheKey = `user_courses_${userId}`
        
        // Check Supabase cache first
        const cached = await getSupabaseCache(cacheKey)
        if (cached?.data) {
          return NextResponse.json(
            { success: true, data: cached.data, cached: true, source: 'supabase' },
            { headers: CACHE_HEADERS }
          )
        }

        // Fetch from Moodle
        console.log(`Fetching courses for user ${userId}`)
        const userCourses = await moodleService.getUserCourses(parseInt(userId))
        
        // Save to Supabase for future requests
        if (supabase && userCourses.length > 0) {
          await saveSupabaseCache(cacheKey, userCourses, 30)
        }

        return NextResponse.json(
          { success: true, data: userCourses, cached: false, source: 'moodle' },
          { headers: CACHE_HEADERS }
        )
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

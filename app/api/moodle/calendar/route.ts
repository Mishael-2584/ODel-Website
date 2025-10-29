import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { moodleService, moodleConfig } from '@/lib/moodle'

// Initialize Supabase for optional caching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

const CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60'
}

async function getSupabaseCache(cacheKey: string) {
  if (!supabase) return null
  try {
    const { data } = await supabase
      .from('moodle_cache')
      .select('data, expires_at')
      .eq('cache_key', cacheKey)
      .single()
    if (!data) return null
    if (new Date(data.expires_at) < new Date()) return null
    return { data: data.data }
  } catch {
    return null
  }
}

async function saveSupabaseCache(cacheKey: string, data: any, ttlMinutes = 10) {
  if (!supabase) return
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()
  try {
    await supabase
      .from('moodle_cache')
      .upsert({ cache_key: cacheKey, data, expires_at: expiresAt }, { onConflict: 'cache_key' })
  } catch {}
}

function startOfMonthUnix(date = new Date()): number {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  return Math.floor(d.getTime() / 1000)
}

function endOfMonthUnix(date = new Date()): number {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
  return Math.floor(d.getTime() / 1000)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userIdParam = searchParams.get('userId')
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    const limitParam = searchParams.get('limit')

    // Resolve user ID
    let userId: number | null = null
    if (userIdParam) {
      userId = parseInt(userIdParam)
    } else if (email) {
      const user = await moodleService.getUserByEmail(email)
      userId = user?.id ?? null
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId or email is required' }, { status: 400 })
    }

    // Time window
    const fromUnix = fromParam ? parseInt(fromParam) : startOfMonthUnix()
    const toUnix = toParam ? parseInt(toParam) : endOfMonthUnix()
    const limitnum = limitParam ? parseInt(limitParam) : 200

    const cacheKey = `calendar_action_events_${userId}_${fromUnix}_${toUnix}_${limitnum}`
    const cached = await getSupabaseCache(cacheKey)
    if (cached?.data) {
      return NextResponse.json({ success: true, data: cached.data, cached: true, source: 'supabase' }, { headers: CACHE_HEADERS })
    }

    // Fetch course IDs for filtering if needed
    const courses = await moodleService.getUserCourses(userId)
    const courseIds = (courses || []).map((c: any) => c.id)
    const courseMap = new Map<number, string>((courses || []).map((c: any) => [c.id, c.fullname]))

    // Primary: action events by timesort
    const actionEvents = await moodleService.getActionEventsByTimesort({
      userId,
      fromUnix,
      toUnix,
      limitnum,
      limitToNonSuspended: true
    })

    // Optional: ensure we include site/user events not covered by action-events
    const coreEvents = await moodleService.getCalendarEvents(userId, {
      courseIds,
      fromUnix,
      toUnix,
      includeSite: true,
      includeUser: true,
    })

    // Enrichment: add assignment due/grading due as events
    const assignmentItems = await moodleService.getUserAssignments(userId)
    const assignmentEvents = (assignmentItems || []).flatMap((a: any) => {
      const items: any[] = []
      if (a.duedate) {
        items.push({
          id: `assign_due_${a.id}`,
          name: a.name,
          courseid: a.courseId || a.course || null,
          module: 'assign',
          eventtype: 'due',
          timesort: a.duedate,
          timestart: a.duedate,
          url: a.cmid ? `${moodleConfig.baseUrl}/mod/assign/view.php?id=${a.cmid}` : (a.url || null),
          coursename: (() => { const cid = a.courseId || a.course; return cid ? (courseMap.get(cid) || a.courseName || null) : (a.courseName || null) })()
        })
      }
      if (a.gradingduedate) {
        items.push({
          id: `assign_gradingdue_${a.id}`,
          name: `${a.name} grading due`,
          courseid: a.courseId || a.course || null,
          module: 'assign',
          eventtype: 'gradingdue',
          timesort: a.gradingduedate,
          timestart: a.gradingduedate,
          url: a.cmid ? `${moodleConfig.baseUrl}/mod/assign/view.php?id=${a.cmid}` : (a.url || null),
          coursename: (() => { const cid = a.courseId || a.course; return cid ? (courseMap.get(cid) || a.courseName || null) : (a.courseName || null) })()
        })
      }
      return items
    })

    // Merge and normalize simple shape
    const normalize = (e: any) => ({
      id: e.id,
      name: e.name || e.eventname || e.description || 'Event',
      courseid: e.course?.id || e.courseid || null,
      module: e.modulename || e.component || null,
      eventtype: e.eventtype || e.category || null,
      timesort: e.timesort || e.timestart || e.timeusermidnight || null,
      timestart: e.timestart || e.timesort || null,
      url: e.url || e.viewurl || null,
      coursename: (() => { const cid = e.course?.id || e.courseid; return cid ? (courseMap.get(cid) || e.coursename || null) : (e.coursename || null) })()
    })

    const merged = [
      ...actionEvents.map(normalize),
      ...coreEvents.map(normalize),
      ...assignmentEvents
    ]

    // De-duplicate by id+timesort
    const seen = new Set<string>()
    const deduped = merged.filter(e => {
      const key = `${e.id}_${e.timesort}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    if (supabase && deduped.length > 0) {
      await saveSupabaseCache(cacheKey, deduped, 10)
    }

    return NextResponse.json({ success: true, data: deduped, cached: false, source: 'moodle' }, { headers: CACHE_HEADERS })
  } catch (error) {
    console.error('Error in /api/moodle/calendar:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 })
  }
}



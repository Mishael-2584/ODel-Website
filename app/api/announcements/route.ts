import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Get published announcements (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const pinned = searchParams.get('pinned') === 'true'

    let query = supabase
      .from('announcements')
      .select('*, author:admin_users(id, email, full_name)')
      .eq('is_published', true)
      .eq('status', 'published')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (pinned) {
      query = query.eq('is_pinned', true)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (limit ? parseInt(limit) : 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching announcements:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/announcements:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


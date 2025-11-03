import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Get admin announcements
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('*, author:admin_users(id, email, full_name)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching announcements:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/admin/announcements:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Create new announcement
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const adminId = request.headers.get('x-admin-id')
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'Admin ID required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const content = formData.get('content') as string || ''
    const category = formData.get('category') as string || 'general'
    const isPublished = formData.get('isPublished') === 'true'
    const isPinned = formData.get('isPinned') === 'true'
    const expiresAt = formData.get('expiresAt') as string || null

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Handle image upload if provided
    let featuredImageUrl = null
    let imageBucketPath = null
    const imageFile = formData.get('image') as File | null

    if (imageFile && imageFile.size > 0) {
      // Upload to Supabase Storage
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `announcements/${fileName}`

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('public')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('public')
          .getPublicUrl(filePath)
        featuredImageUrl = publicUrl
        imageBucketPath = filePath
      }
    }

    const announcementData = {
      title,
      slug,
      description,
      content,
      category,
      author_id: adminId,
      is_published: isPublished,
      is_pinned: isPinned,
      published_at: isPublished ? new Date().toISOString() : null,
      expires_at: expiresAt || null,
      status: isPublished ? 'published' : 'draft',
      featured_image_url: featuredImageUrl,
      image_bucket_path: imageBucketPath,
      source: 'custom'
    }

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert(announcementData)
      .select()
      .single()

    if (error) {
      console.error('Error creating announcement:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in POST /api/admin/announcements:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Update announcement
export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const adminId = request.headers.get('x-admin-id')
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'Admin ID required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const id = formData.get('id') as string

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Announcement ID required' },
        { status: 400 }
      )
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const content = formData.get('content') as string || ''
    const category = formData.get('category') as string || 'general'
    const isPublished = formData.get('isPublished') === 'true'
    const isPinned = formData.get('isPinned') === 'true'
    const expiresAt = formData.get('expiresAt') as string || null
    const removeImage = formData.get('removeImage') === 'true'

    // Generate slug from title if title changed
    let slug = undefined
    if (title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    // Handle image upload if new image provided
    let featuredImageUrl = undefined
    let imageBucketPath = undefined
    const imageFile = formData.get('image') as File | null

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `announcements/${fileName}`

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('public')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('public')
          .getPublicUrl(filePath)
        featuredImageUrl = publicUrl
        imageBucketPath = filePath
      }
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (slug) updateData.slug = slug
    if (description) updateData.description = description
    if (content !== null) updateData.content = content
    if (category) updateData.category = category
    if (isPinned !== null) updateData.is_pinned = isPinned
    if (expiresAt !== null) updateData.expires_at = expiresAt
    if (removeImage) {
      updateData.featured_image_url = null
      updateData.image_bucket_path = null
    }
    if (featuredImageUrl) updateData.featured_image_url = featuredImageUrl
    if (imageBucketPath) updateData.image_bucket_path = imageBucketPath

    // Handle publish status
    if (isPublished !== null) {
      updateData.is_published = isPublished
      updateData.status = isPublished ? 'published' : 'draft'
      if (isPublished && !updateData.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating announcement:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in PUT /api/admin/announcements:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Delete announcement
export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Announcement ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting announcement:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/announcements:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


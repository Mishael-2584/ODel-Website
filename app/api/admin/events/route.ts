import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET all events or single event
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const published = searchParams.get('published');
    const upcoming = searchParams.get('upcoming');

    if (id) {
      // Single event query
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } else {
      // Multiple events query
      let query = supabase.from('events').select('*');

      if (published === 'true') {
        query = query.eq('is_published', true);
      }
      if (upcoming === 'true') {
        query = query.gte('start_date', new Date().toISOString());
      }
      query = query.order('start_date', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST create event
export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get('x-admin-id');
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const location = formData.get('location') as string;
    const eventType = formData.get('eventType') as string;
    const isPublished = formData.get('isPublished') === 'true';
    const maxAttendees = formData.get('maxAttendees') as string;
    const file = formData.get('image') as File | null;

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let imagePath = null;
    let imageUrl = null;

    // Upload image if provided
    if (file) {
      const fileName = `${uuidv4()}-${Date.now()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('events-images')
        .upload(`events/${fileName}`, file);

      if (uploadError) throw uploadError;

      imagePath = uploadData.path;
      const { data: urlData } = supabase.storage
        .from('events-images')
        .getPublicUrl(imagePath);
      imageUrl = urlData.publicUrl;
    }

    // Create event entry
    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        slug: `${slug}-${Date.now()}`,
        description,
        content,
        featured_image_url: imageUrl,
        image_bucket_path: imagePath,
        start_date: startDate,
        end_date: endDate || startDate,
        location,
        event_type: eventType,
        organizer_id: adminId,
        is_published: isPublished,
        published_at: isPublished ? new Date() : null,
        status: isPublished ? 'published' : 'draft',
        max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PUT update event
export async function PUT(req: NextRequest) {
  try {
    const adminId = req.headers.get('x-admin-id');
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const location = formData.get('location') as string;
    const eventType = formData.get('eventType') as string;
    const isPublished = formData.get('isPublished') === 'true';
    const maxAttendees = formData.get('maxAttendees') as string;
    const file = formData.get('image') as File | null;

    // Get existing event to get old image path
    const { data: existingEvent } = await supabase
      .from('events')
      .select('image_bucket_path')
      .eq('id', id)
      .single();

    let imagePath = existingEvent?.image_bucket_path;
    let imageUrl = null;

    // Upload new image if provided
    if (file) {
      // Delete old image if exists
      if (existingEvent?.image_bucket_path) {
        await supabase.storage
          .from('events-images')
          .remove([existingEvent.image_bucket_path]);
      }

      const fileName = `${uuidv4()}-${Date.now()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('events-images')
        .upload(`events/${fileName}`, file);

      if (uploadError) throw uploadError;

      imagePath = uploadData.path;
      const { data: urlData } = supabase.storage
        .from('events-images')
        .getPublicUrl(imagePath);
      imageUrl = urlData.publicUrl;
    } else if (existingEvent?.image_bucket_path) {
      const { data: urlData } = supabase.storage
        .from('events-images')
        .getPublicUrl(existingEvent.image_bucket_path);
      imageUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('events')
      .update({
        title,
        description,
        content,
        featured_image_url: imageUrl,
        image_bucket_path: imagePath,
        start_date: startDate,
        end_date: endDate || startDate,
        location,
        event_type: eventType,
        is_published: isPublished,
        published_at: isPublished ? new Date() : null,
        status: isPublished ? 'published' : 'draft',
        max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE event
export async function DELETE(req: NextRequest) {
  try {
    const adminId = req.headers.get('x-admin-id');
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Get event to delete image
    const { data: event } = await supabase
      .from('events')
      .select('image_bucket_path')
      .eq('id', id)
      .single();

    if (event?.image_bucket_path) {
      await supabase.storage
        .from('events-images')
        .remove([event.image_bucket_path]);
    }

    // Delete event entry
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

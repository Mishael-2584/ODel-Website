import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Get all applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const program = searchParams.get('program')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    // If ID is provided, return single application
    if (id) {
      const { data, error } = await supabaseAdmin
        .from('graduate_applications')
        .select('*, assigned_to_user:admin_users!assigned_to(id, email, full_name)')
        .eq('id', id)
        .single()

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data: [data] })
    }

    let query = supabaseAdmin
      .from('graduate_applications')
      .select('*, assigned_to_user:admin_users!assigned_to(id, email, full_name)')
      .order('submitted_at', { ascending: false })

    const applicationType = searchParams.get('application_type')
    if (applicationType) {
      query = query.eq('application_type', applicationType)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (program) {
      query = query.eq('program_applied_for', program)
    }

    if (search) {
      query = query.or(`application_number.ilike.%${search}%,first_name.ilike.%${search}%,surname.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (limit ? parseInt(limit) : 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching applications:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/admin/applications:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Update application status (admin only)
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

    const body = await request.json()
    const {
      id,
      status,
      current_stage,
      assigned_to,
      admission_recommendation,
      admission_decision,
      admin_notes,
      evaluation_notes,
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application ID required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (current_stage) updateData.current_stage = current_stage
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to
    if (admission_recommendation) updateData.admission_recommendation = admission_recommendation
    if (admission_decision) {
      updateData.admission_decision = admission_decision
      updateData.decision_date = new Date().toISOString()
      updateData.decision_by = adminId
    }
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes
    if (evaluation_notes !== undefined) updateData.evaluation_notes = evaluation_notes

    const { data, error } = await supabaseAdmin
      .from('graduate_applications')
      .update(updateData)
      .eq('id', id)
      .select('*, assigned_to_user:admin_users!assigned_to(id, email, full_name)')
      .single()

    if (error) {
      console.error('Error updating application:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in PUT /api/admin/applications:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Delete application (admin only)
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
        { success: false, error: 'Application ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('graduate_applications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting application:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/applications:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


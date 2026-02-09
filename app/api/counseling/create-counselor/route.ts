import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      adminUserId,
      name,
      email,
      phone,
      gender,
      specialization = [],
      bio,
    } = body

    // Validation
    if (!adminUserId || !name || !email || !gender) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: adminUserId, name, email, gender' },
        { status: 400 }
      )
    }

    if (!['male', 'female'].includes(gender)) {
      return NextResponse.json(
        { success: false, error: 'Gender must be "male" or "female"' },
        { status: 400 }
      )
    }

    // Verify admin user exists
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', adminUserId)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Check if counselor already exists for this admin user
    const { data: existingCounselor, error: checkError } = await supabase
      .from('counselors')
      .select('id')
      .eq('admin_user_id', adminUserId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing counselor:', checkError)
      return NextResponse.json(
        { success: false, error: 'Failed to check existing counselor' },
        { status: 500 }
      )
    }

    if (existingCounselor) {
      return NextResponse.json(
        { success: false, error: 'A counselor profile already exists for this admin user' },
        { status: 409 }
      )
    }

    // Create counselor profile
    const { data: counselor, error: insertError } = await supabase
      .from('counselors')
      .insert({
        admin_user_id: adminUserId,
        name,
        email,
        phone: phone || null,
        gender,
        specialization: Array.isArray(specialization) ? specialization : [],
        bio: bio || null,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating counselor:', insertError)
      return NextResponse.json(
        { success: false, error: insertError.message || 'Failed to create counselor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      counselor,
      message: 'Counselor created successfully'
    })
  } catch (error: any) {
    console.error('Error in create-counselor API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: counselors, error } = await supabase
      .from('counselors')
      .select(`
        *,
        admin_users (
          id,
          email,
          full_name,
          role
        )
      `)
      .order('name')

    if (error) {
      console.error('Error fetching counselors:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch counselors' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      counselors: counselors || []
    })
  } catch (error: any) {
    console.error('Error in create-counselor GET API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

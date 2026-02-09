import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function PUT(request: NextRequest) {
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
      id,
      name,
      email,
      phone,
      gender,
      specialization = [],
      bio,
      is_active,
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Counselor ID is required' },
        { status: 400 }
      )
    }

    if (!['male', 'female'].includes(gender)) {
      return NextResponse.json(
        { success: false, error: 'Gender must be "male" or "female"' },
        { status: 400 }
      )
    }

    // Update counselor
    const { data: counselor, error: updateError } = await supabase
      .from('counselors')
      .update({
        name,
        email,
        phone: phone || null,
        gender,
        specialization: Array.isArray(specialization) ? specialization : [],
        bio: bio || null,
        is_active: is_active !== undefined ? is_active : true,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating counselor:', updateError)
      return NextResponse.json(
        { success: false, error: updateError.message || 'Failed to update counselor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      counselor,
      message: 'Counselor updated successfully'
    })
  } catch (error: any) {
    console.error('Error in update-counselor API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function DELETE(request: NextRequest) {
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
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Counselor ID is required' },
        { status: 400 }
      )
    }

    // Delete counselor (cascade will delete appointments)
    const { error: deleteError } = await supabase
      .from('counselors')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting counselor:', deleteError)
      return NextResponse.json(
        { success: false, error: deleteError.message || 'Failed to delete counselor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Counselor deleted successfully'
    })
  } catch (error: any) {
    console.error('Error in delete-counselor API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { facultyAssistantClientId, hashToken } from '@/lib/server/faculty-assistant-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  if (body.get('client_id') !== facultyAssistantClientId) {
    return NextResponse.json({ error: 'invalid_client' }, { status: 401 })
  }
  const token = String(body.get('token') || '')
  if (token) {
    await getSupabaseAdmin()
      .from('faculty_assistant_refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', hashToken(token))
      .is('revoked_at', null)
  }
  return new NextResponse(null, { status: 204 })
}

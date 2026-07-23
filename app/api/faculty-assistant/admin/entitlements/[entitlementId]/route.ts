import { NextRequest, NextResponse } from 'next/server'
import {
  extendLicenceExpiry,
  requireFacultyAssistantAdmin,
} from '@/lib/server/faculty-assistant-admin'
import type { FacultyAssistantBillingPeriod } from '@/lib/faculty-assistant/plans'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { entitlementId: string } },
) {
  const admin = await requireFacultyAssistantAdmin(request)
  if (!admin) return NextResponse.json({ error: 'admin_unauthorized' }, { status: 401 })
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const action = String(body?.action || '')
  const supabase = getSupabaseAdmin()
  const { data: current } = await supabase
    .from('faculty_assistant_entitlements')
    .select('id, expires_at, billing_period')
    .eq('id', params.entitlementId)
    .maybeSingle()
  if (!current) return NextResponse.json({ error: 'entitlement_not_found' }, { status: 404 })

  let expiresAt: string | null = null
  if (action === 'extend') {
    const billingPeriod: FacultyAssistantBillingPeriod =
      current.billing_period === 'monthly' || current.billing_period === 'semester'
        ? current.billing_period
        : 'annual'
    expiresAt = extendLicenceExpiry(current.expires_at || new Date(), billingPeriod)
  } else if (action !== 'revoke' && action !== 'restore') {
    return NextResponse.json({ error: 'invalid_entitlement_action' }, { status: 400 })
  }
  const { data, error } = await supabase
    .rpc('faculty_assistant_admin_update_entitlement', {
      p_entitlement_id: current.id,
      p_action: action,
      p_expires_at: expiresAt,
      p_admin_id: admin.id,
      p_admin_email: admin.email,
    })
    .single()
  if (error || !data) return NextResponse.json({ error: 'entitlement_update_failed' }, { status: 500 })

  return NextResponse.json({ entitlement: data })
}

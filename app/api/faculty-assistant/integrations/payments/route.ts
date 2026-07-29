import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

const allowedStatuses = new Set([
  'all',
  'created',
  'pending',
  'completed',
  'failed',
  'cancelled',
  'expired',
  'activation_failed',
])

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!authorizedReportRequest(request)) {
    return NextResponse.json({ error: 'report_unauthorized' }, { status: 401 })
  }
  const url = new URL(request.url)
  const status = url.searchParams.get('status') || 'all'
  const requestedPage = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const requestedPageSize = Number.parseInt(url.searchParams.get('pageSize') || '25', 10)
  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: 'invalid_payment_status' }, { status: 400 })
  }
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const pageSize = [10, 25, 50, 100].includes(requestedPageSize) ? requestedPageSize : 25
  const offset = (page - 1) * pageSize
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('faculty_assistant_payment_orders')
    .select(
      'id, request_id, provider, account_reference, amount_kes, currency, phone, '
      + 'status, stk_reference, checkout_session_id, completed_reference, '
      + 'transaction_id, provider_transaction_id, last_provider_status, '
      + 'failure_reason, activation_email_status, paid_at, activated_at, '
      + 'created_at, updated_at, '
      + 'faculty_assistant_upgrade_requests!inner('
      + 'email,display_name,moodle_user_id,moodle_instance,requested_plan,billing_period,status'
      + ')',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (status !== 'all') query = query.eq('status', status)

  const [pageResult, summaryResult] = await Promise.all([
    query,
    supabase.rpc('faculty_assistant_payment_report_summary'),
  ])
  if (pageResult.error || summaryResult.error) {
    console.error(
      'Faculty Assistant payment report failed:',
      pageResult.error || summaryResult.error,
    )
    return NextResponse.json({ error: 'payment_report_unavailable' }, { status: 500 })
  }

  const summary = (
    summaryResult.data && typeof summaryResult.data === 'object'
      ? summaryResult.data
      : {}
  ) as Record<string, unknown>
  const counts = (
    summary.counts && typeof summary.counts === 'object'
      ? summary.counts
      : { all: 0 }
  ) as Record<string, number>
  const collectedKes = Number(summary.collectedKes || 0)
  const total = pageResult.count || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return NextResponse.json(
    {
      payments: ((pageResult.data || []) as unknown as Record<string, unknown>[])
        .map(flattenPayment),
      counts,
      collectedKes,
      page,
      pageSize,
      total,
      totalPages,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

function authorizedReportRequest(request: NextRequest) {
  const expected = process.env.FACULTY_ASSISTANT_PAYMENT_REPORT_SECRET?.trim() || ''
  const received = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1] || ''
  if (expected.length < 32 || !received) return false
  const expectedHash = crypto.createHash('sha256').update(expected).digest()
  const receivedHash = crypto.createHash('sha256').update(received).digest()
  return crypto.timingSafeEqual(expectedHash, receivedHash)
}

function flattenPayment(row: Record<string, unknown>) {
  const request = (
    Array.isArray(row.faculty_assistant_upgrade_requests)
      ? row.faculty_assistant_upgrade_requests[0]
      : row.faculty_assistant_upgrade_requests
  ) as Record<string, unknown> | undefined
  const { faculty_assistant_upgrade_requests: _, ...payment } = row
  return {
    ...payment,
    email: String(request?.email || ''),
    display_name: String(request?.display_name || ''),
    moodle_user_id: request?.moodle_user_id,
    moodle_instance: String(request?.moodle_instance || ''),
    requested_plan: String(request?.requested_plan || ''),
    billing_period: String(request?.billing_period || ''),
    request_status: String(request?.status || ''),
  }
}

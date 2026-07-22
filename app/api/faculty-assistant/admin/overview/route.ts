import { NextRequest, NextResponse } from 'next/server'
import { requireFacultyAssistantAdmin } from '@/lib/server/faculty-assistant-admin'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

export async function GET(request: NextRequest) {
  const admin = await requireFacultyAssistantAdmin(request)
  if (!admin) return NextResponse.json({ error: 'admin_unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const [requests, entitlements, institutions, publishJobs, audit] = await Promise.all([
    supabase
      .from('faculty_assistant_upgrade_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(250),
    supabase
      .from('faculty_assistant_entitlements')
      .select('id, moodle_instance, moodle_user_id, email, plan, features, is_active, expires_at, billing_period, source_request_id, institution_licence_id, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(250),
    supabase
      .from('faculty_assistant_institution_licences')
      .select('id, moodle_instance, institution_name, email_domains, features, is_active, expires_at, source_request_id, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100),
    supabase
      .from('faculty_assistant_publish_jobs')
      .select('id, moodle_instance, moodle_user_id, course_id, category_id, status, result, error, created_at, completed_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('faculty_assistant_audit_log')
      .select('id, moodle_user_id, moodle_instance, action, resource_type, resource_id, outcome, details, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  const failed = [requests, entitlements, institutions, publishJobs, audit].find((result) => result.error)
  if (failed?.error) {
    console.error('Faculty Assistant admin overview failed:', failed.error)
    return NextResponse.json({ error: 'overview_unavailable' }, { status: 500 })
  }

  return NextResponse.json({
    admin,
    requests: requests.data || [],
    entitlements: entitlements.data || [],
    institutions: institutions.data || [],
    publishJobs: publishJobs.data || [],
    audit: audit.data || [],
  })
}

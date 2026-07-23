import { NextRequest, NextResponse } from 'next/server'
import { requireFacultyAssistantAdmin } from '@/lib/server/faculty-assistant-admin'
import { writeFacultyAssistantAudit } from '@/lib/server/faculty-assistant-auth'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

const scopeTypes = new Set(['institution', 'school', 'course'])
const moderationModes = new Set(['disabled', 'optional', 'required'])

export async function GET(request: NextRequest) {
  const admin = await requireFacultyAssistantAdmin(request)
  if (!admin) return NextResponse.json({ error: 'admin_unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const [institutions, settings, moderators] = await Promise.all([
    supabase
      .from('faculty_assistant_institution_licences')
      .select('id, institution_name, moodle_instance, email_domains, is_active, expires_at')
      .order('institution_name'),
    supabase
      .from('faculty_assistant_moderation_settings')
      .select('institution_licence_id, mode, retention_days, updated_at'),
    supabase
      .from('faculty_assistant_moderators')
      .select('id, institution_licence_id, email, full_name, scope_type, scope_values, is_active, must_change_password, created_at, updated_at')
      .order('created_at', { ascending: false }),
  ])
  const failed = [institutions, settings, moderators].find((result) => result.error)
  if (failed?.error) {
    console.error('Moderation administration overview failed:', failed.error)
    return NextResponse.json({ error: 'moderation_admin_unavailable' }, { status: 500 })
  }
  return NextResponse.json({
    admin,
    institutions: institutions.data || [],
    settings: settings.data || [],
    moderators: moderators.data || [],
  })
}

export async function POST(request: NextRequest) {
  const admin = await requireFacultyAssistantAdmin(request)
  if (!admin) return NextResponse.json({ error: 'admin_unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const institutionId = String(body.institutionId || '')
  const email = String(body.email || '').trim().toLowerCase()
  const fullName = String(body.fullName || '').trim()
  const temporaryPassword = String(body.temporaryPassword || '')
  const scopeType = String(body.scopeType || 'institution')
  const scopeValues = normalizeScopeValues(body.scopeValues)
  if (
    !institutionId ||
    !isEmail(email) ||
    !fullName ||
    !scopeTypes.has(scopeType) ||
    (scopeType !== 'institution' && !scopeValues.length)
  ) {
    return NextResponse.json({ error: 'invalid_moderator_account' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: institution, error: institutionError } = await supabase
    .from('faculty_assistant_institution_licences')
    .select('id, institution_name, email_domains')
    .eq('id', institutionId)
    .maybeSingle()
  if (institutionError || !institution) {
    return NextResponse.json({ error: 'institution_not_found' }, { status: 404 })
  }
  const emailDomain = email.split('@')[1]
  if (
    Array.isArray(institution.email_domains) &&
    institution.email_domains.length &&
    !institution.email_domains.map((value: string) => value.toLowerCase()).includes(emailDomain)
  ) {
    return NextResponse.json({ error: 'moderator_email_outside_institution' }, { status: 400 })
  }

  const { data: usersPage, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (usersError) {
    return NextResponse.json({ error: 'moderator_account_lookup_failed' }, { status: 500 })
  }
  let authUser = usersPage.users.find((user) => user.email?.toLowerCase() === email)
  if (!authUser) {
    if (temporaryPassword.length < 12) {
      return NextResponse.json({ error: 'temporary_password_too_short' }, { status: 400 })
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, faculty_assistant_moderator: true },
    })
    if (error || !data.user) {
      console.error('Moderator auth account creation failed:', error)
      return NextResponse.json({ error: 'moderator_account_creation_failed' }, { status: 500 })
    }
    authUser = data.user
  } else if (temporaryPassword) {
    if (temporaryPassword.length < 12) {
      return NextResponse.json({ error: 'temporary_password_too_short' }, { status: 400 })
    }
    const { data, error } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: temporaryPassword },
    )
    if (error || !data.user) {
      return NextResponse.json({ error: 'moderator_password_reset_failed' }, { status: 500 })
    }
    authUser = data.user
  }

  const { data: moderator, error } = await supabase
    .from('faculty_assistant_moderators')
    .upsert({
      institution_licence_id: institutionId,
      auth_user_id: authUser.id,
      email,
      full_name: fullName,
      scope_type: scopeType,
      scope_values: scopeType === 'institution' ? [] : scopeValues,
      is_active: true,
      must_change_password: true,
      created_by: admin.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'institution_licence_id,email' })
    .select('id, institution_licence_id, email, full_name, scope_type, scope_values, is_active, must_change_password')
    .single()
  if (error || !moderator) {
    console.error('Moderator assignment creation failed:', error)
    return NextResponse.json({ error: 'moderator_assignment_failed' }, { status: 500 })
  }

  await writeFacultyAssistantAudit('moderation.moderator.upsert', 'success', {
    resourceType: 'moderator',
    resourceId: moderator.id,
    details: {
      adminId: admin.id,
      adminEmail: admin.email,
      institutionId,
      moderatorEmail: email,
      scopeType,
      scopeValues,
    },
  })
  return NextResponse.json({ moderator }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const admin = await requireFacultyAssistantAdmin(request)
  if (!admin) return NextResponse.json({ error: 'admin_unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const action = String(body.action || '')
  const supabase = getSupabaseAdmin()

  if (action === 'update_policy') {
    const institutionId = String(body.institutionId || '')
    const mode = String(body.mode || '')
    const retentionDays = Number(body.retentionDays || 2555)
    if (
      !institutionId ||
      !moderationModes.has(mode) ||
      !Number.isInteger(retentionDays) ||
      retentionDays < 30 ||
      retentionDays > 3650
    ) {
      return NextResponse.json({ error: 'invalid_moderation_policy' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('faculty_assistant_moderation_settings')
      .upsert({
        institution_licence_id: institutionId,
        mode,
        retention_days: retentionDays,
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .select('institution_licence_id, mode, retention_days, updated_at')
      .single()
    if (error || !data) {
      return NextResponse.json({ error: 'moderation_policy_update_failed' }, { status: 500 })
    }
    await writeFacultyAssistantAudit('moderation.policy.update', 'success', {
      resourceType: 'institution_licence',
      resourceId: institutionId,
      details: { adminId: admin.id, adminEmail: admin.email, mode, retentionDays },
    })
    return NextResponse.json({ setting: data })
  }

  if (action === 'update_moderator') {
    const moderatorId = String(body.moderatorId || '')
    const scopeType = String(body.scopeType || '')
    const scopeValues = normalizeScopeValues(body.scopeValues)
    const isActive = Boolean(body.isActive)
    if (
      !moderatorId ||
      !scopeTypes.has(scopeType) ||
      (scopeType !== 'institution' && !scopeValues.length)
    ) {
      return NextResponse.json({ error: 'invalid_moderator_update' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('faculty_assistant_moderators')
      .update({
        scope_type: scopeType,
        scope_values: scopeType === 'institution' ? [] : scopeValues,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', moderatorId)
      .select('id, institution_licence_id, email, full_name, scope_type, scope_values, is_active')
      .single()
    if (error || !data) {
      return NextResponse.json({ error: 'moderator_update_failed' }, { status: 500 })
    }
    await writeFacultyAssistantAudit('moderation.moderator.update', 'success', {
      resourceType: 'moderator',
      resourceId: moderatorId,
      details: { adminId: admin.id, adminEmail: admin.email, scopeType, scopeValues, isActive },
    })
    return NextResponse.json({ moderator: data })
  }

  return NextResponse.json({ error: 'unsupported_moderation_admin_action' }, { status: 400 })
}

function normalizeScopeValues(value: unknown) {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[\n,]/)
  return Array.from(new Set(
    raw.map((item) => String(item).trim()).filter(Boolean),
  )).slice(0, 100)
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

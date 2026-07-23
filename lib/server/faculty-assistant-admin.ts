import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'
import {
  facultyAssistantTermMonths,
  type FacultyAssistantBillingPeriod,
} from '@/lib/faculty-assistant/plans'
import { getSupabaseAdmin } from './supabase-admin'

const licenceAdminRoles = new Set(['admin', 'super_admin', 'Administrator'])

export interface FacultyAssistantAdminIdentity {
  id: string
  email: string
  name: string
  role: string
}

export async function requireFacultyAssistantAdmin(
  request: NextRequest,
): Promise<FacultyAssistantAdminIdentity | null> {
  const authorization = request.headers.get('authorization') || ''
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : ''
  const secret = process.env.JWT_SECRET
  if (!token || !secret || secret === 'your-secret-key') return null

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload
    if (
      decoded.type !== 'admin' ||
      !decoded.id ||
      !licenceAdminRoles.has(String(decoded.role || ''))
    ) {
      return null
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, is_active')
      .eq('id', String(decoded.id))
      .eq('is_active', true)
      .maybeSingle()
    if (error || !data || !licenceAdminRoles.has(String(data.role || ''))) {
      return null
    }

    return {
      id: String(data.id),
      email: String(data.email || ''),
      name: String(data.full_name || data.email || 'Administrator'),
      role: String(data.role || ''),
    }
  } catch {
    return null
  }
}

export const professionalFeatures = [
  'profile:read',
  'courses:read',
  'grades:read',
  'questions:write',
]

export const institutionFeatures = [
  ...professionalFeatures,
  'institution:templates',
  'institution:audit',
  'institution:seats',
]

export function licenceExpiry(period: FacultyAssistantBillingPeriod) {
  return extendLicenceExpiry(new Date(), period)
}

export function extendLicenceExpiry(
  currentExpiry: string | Date,
  period: FacultyAssistantBillingPeriod,
) {
  const parsed = new Date(currentExpiry)
  const expiry = Number.isFinite(parsed.getTime()) && parsed.getTime() > Date.now()
    ? parsed
    : new Date()
  const originalDay = expiry.getUTCDate()
  expiry.setUTCDate(1)
  expiry.setUTCMonth(expiry.getUTCMonth() + facultyAssistantTermMonths(period))
  const lastDayOfTargetMonth = new Date(Date.UTC(
    expiry.getUTCFullYear(),
    expiry.getUTCMonth() + 1,
    0,
  )).getUTCDate()
  expiry.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth))
  return expiry.toISOString()
}

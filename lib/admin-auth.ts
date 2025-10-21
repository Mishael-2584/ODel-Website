import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    console.error('Error hashing password:', error)
    throw error
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

export async function findAdminByEmail(email: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error) return null
    return data
  } catch (error) {
    console.error('Error finding admin:', error)
    return null
  }
}

export async function createAdminSession(
  adminId: string,
  jwtToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: adminId,
        jwt_token: jwtToken,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()

    if (error) {
      console.error('Error creating admin session:', error)
      return { success: false, error: 'Failed to create session' }
    }

    return {
      success: true,
      sessionId: data?.[0]?.id
    }
  } catch (error) {
    console.error('Error creating admin session:', error)
    return { success: false, error: 'Session creation failed' }
  }
}

export async function getAdminSession(sessionId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('is_active', true)
      .single()

    if (error) return null

    // Check if session is expired
    if (new Date(data.expires_at) < new Date()) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting admin session:', error)
    return null
  }
}

export async function logoutAdmin(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)

    return !error
  } catch (error) {
    console.error('Error logging out admin:', error)
    return false
  }
}

export async function createAuditLog(
  adminId: string,
  action: string,
  resourceType?: string,
  resourceId?: string,
  changes?: any,
  ipAddress?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: adminId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        changes,
        ip_address: ipAddress
      })

    return !error
  } catch (error) {
    console.error('Error creating audit log:', error)
    return false
  }
}

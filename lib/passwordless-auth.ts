import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { moodleService } from './moodle'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRY = '24h'
const MAGIC_CODE_EXPIRY_MINUTES = 10

// Generate a 6-digit magic code
export function generateMagicCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate JWT token for student session
export function generateJWTToken(data: {
  email: string
  moodleUserId: number
  moodleUsername: string
  studentName: string
  roles?: string[]
}): string {
  return jwt.sign(
    {
      email: data.email,
      moodleUserId: data.moodleUserId,
      moodleUsername: data.moodleUsername,
      studentName: data.studentName,
      roles: data.roles || ['student'],
      type: 'student'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )
}

// Generate JWT token for admin session
export function generateAdminJWTToken(data: {
  adminId: string
  email: string
  fullName: string
  role: string
}): string {
  return jwt.sign(
    {
      adminId: data.adminId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      type: 'admin'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )
}

// Verify JWT token
export function verifyJWTToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Send magic code email via Supabase
export async function sendMagicCodeEmail(
  email: string,
  code: string,
  studentName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use full URL for server-side fetch
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/auth/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Your ODeL Dashboard Access Code',
        template: 'magic_code',
        data: {
          code,
          studentName,
          expiryMinutes: MAGIC_CODE_EXPIRY_MINUTES
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Email send failed with status ${response.status}: ${errorText}`)
      throw new Error(`Email send failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)
    return { success: true }
  } catch (error) {
    console.error('Error sending magic code email:', error)
    return {
      success: false,
      error: 'Failed to send email. Please try again.'
    }
  }
}

// Create magic code and save to database
export async function createMagicCode(
  email: string,
  moodleUserId: number
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const code = generateMagicCode()
    const expiresAt = new Date(Date.now() + MAGIC_CODE_EXPIRY_MINUTES * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('magic_codes')
      .insert({
        email,
        code,
        moodle_user_id: moodleUserId,
        expires_at: expiresAt
      })
      .select()

    if (error) {
      console.error('Error creating magic code:', error)
      return { success: false, error: 'Failed to create magic code' }
    }

    return { success: true, code }
  } catch (error) {
    console.error('Unexpected error creating magic code:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Verify magic code
export async function verifyMagicCode(
  email: string,
  code: string
): Promise<{ success: boolean; moodleUserId?: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('magic_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('is_used', false)
      .single()

    if (error || !data) {
      return { success: false, error: 'Invalid or expired code' }
    }

    // Check if code is expired
    if (new Date(data.expires_at) < new Date()) {
      return { success: false, error: 'Code has expired' }
    }

    // Check max attempts
    if (data.attempted_count >= 5) {
      return { success: false, error: 'Too many failed attempts' }
    }

    // Mark code as used
    await supabase
      .from('magic_codes')
      .update({ is_used: true })
      .eq('id', data.id)

    return { success: true, moodleUserId: data.moodle_user_id }
  } catch (error) {
    console.error('Error verifying magic code:', error)
    return { success: false, error: 'Verification failed' }
  }
}

// Create student session
export async function createStudentSession(
  email: string,
  moodleUserId: number,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; token?: string; sessionId?: string; error?: string }> {
  try {
    // Fetch student data from Moodle
    const userResponse = await moodleService.getUserById(moodleUserId)
    if (!userResponse) {
      return { success: false, error: 'Failed to fetch student data' }
    }

    // Fetch user roles from Moodle
    const userRoles = await moodleService.getUserRoles(moodleUserId)
    console.log(`📋 User roles for ${userResponse.username}:`, userRoles)

    // Generate JWT token with roles
    const jwtToken = generateJWTToken({
      email,
      moodleUserId,
      moodleUsername: userResponse.username || '',
      studentName: `${userResponse.firstname || ''} ${userResponse.lastname || ''}`.trim(),
      roles: userRoles
    })

    // Save session to database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('student_sessions')
      .insert({
        email,
        moodle_user_id: moodleUserId,
        moodle_username: userResponse.username,
        student_name: `${userResponse.firstname || ''} ${userResponse.lastname || ''}`.trim(),
        jwt_token: jwtToken,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()

    if (error) {
      console.error('Error creating session:', error)
      return { success: false, error: 'Failed to create session' }
    }

    return {
      success: true,
      token: jwtToken,
      sessionId: data?.[0]?.id
    }
  } catch (error) {
    console.error('Error creating student session:', error)
    return { success: false, error: 'Session creation failed' }
  }
}

// Get Moodle user by ID
export async function getMoodleUserById(userId: number): Promise<any> {
  try {
    return await moodleService.getUserById(userId)
  } catch (error) {
    console.error('Error fetching Moodle user:', error)
    return null
  }
}

// Get student session from database
export async function getStudentSession(
  jwtToken: string
): Promise<{ success: boolean; session?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('student_sessions')
      .select('*')
      .eq('jwt_token', jwtToken)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { success: false, error: 'Session not found' }
    }

    // Check if session is expired
    if (new Date(data.expires_at) < new Date()) {
      return { success: false, error: 'Session expired' }
    }

    return { success: true, session: data }
  } catch (error) {
    console.error('Error fetching session:', error)
    return { success: false, error: 'Failed to fetch session' }
  }
}

// Logout student
export async function logoutStudent(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('student_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)

    if (error) {
      return { success: false, error: 'Failed to logout' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error logging out:', error)
    return { success: false, error: 'Logout failed' }
  }
}

export const passwordlessAuth = {
  generateMagicCode,
  generateJWTToken,
  generateAdminJWTToken,
  verifyJWTToken,
  sendMagicCodeEmail,
  createMagicCode,
  verifyMagicCode,
  createStudentSession,
  getMoodleUserById,
  getStudentSession,
  logoutStudent
}

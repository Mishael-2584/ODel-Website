import { createClient } from '@supabase/supabase-js'

// These will be your Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type UserRole = 'student' | 'instructor' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  phone: string | null
  department: string | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  instructor_id: string
  instructor?: Profile
  image_url: string | null
  duration: string
  lessons_count: number
  students_count: number
  rating: number
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  content: string | null
  video_url: string | null
  order_number: number
  duration: string
  is_preview: boolean
  created_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  course?: Course
  enrolled_at: string
  completed_at: string | null
  progress: number
}


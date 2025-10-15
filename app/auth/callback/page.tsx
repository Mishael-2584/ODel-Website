'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const { refreshProfile } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=auth_failed')
          return
        }

        if (data.session?.user) {
          // Check if profile exists, create if not
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                username: data.session.user.email?.split('@')[0] || 'user',
                full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || 'User',
                role: 'student', // Default role for social logins
                updated_at: new Date().toISOString()
              })

            if (insertError) {
              console.error('Error creating profile:', insertError)
            }
          }

          // Refresh profile and redirect based on role
          await refreshProfile()
          
          // Redirect to appropriate dashboard
          router.push('/student/dashboard')
        } else {
          router.push('/login?error=no_session')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/login?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router, refreshProfile])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In...</h2>
        <p className="text-gray-300">Please wait while we set up your account</p>
      </div>
    </div>
  )
}

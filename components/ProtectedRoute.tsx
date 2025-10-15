'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('student' | 'instructor' | 'admin')[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['student', 'instructor', 'admin'],
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // If no user is logged in, redirect to login
      if (!user) {
        router.push('/login')
        return
      }

      // If user is logged in but no profile, wait a bit for profile to load
      if (!profile) {
        const timer = setTimeout(() => {
          if (!profile) {
            router.push('/login')
          }
        }, 3000) // Wait 3 seconds for profile to load

        return () => clearTimeout(timer)
      }

      // If user has profile but role is not allowed, redirect to appropriate dashboard
      if (profile && !allowedRoles.includes(profile.role)) {
        switch (profile.role) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'instructor':
            router.push('/instructor/dashboard')
            break
          default:
            router.push('/student/dashboard')
        }
        return
      }
    }
  }, [user, profile, loading, allowedRoles, router])

  // Show loading spinner while checking authentication
  if (loading || (!user && !profile)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user, don't render anything (redirect will happen)
  if (!user) {
    return null
  }

  // If user exists but profile is still loading, show loading
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your dashboard...</p>
        </div>
      </div>
    )
  }

  // If user has profile but role is not allowed, don't render anything (redirect will happen)
  if (!allowedRoles.includes(profile.role)) {
    return null
  }

  // User is authenticated and has appropriate role
  return <>{children}</>
}

import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/student/dashboard',
  '/student/',
]

// Routes that should redirect to dashboard if already logged in
const authRoutes = [
  '/login',
]

// Public routes (no authentication required)
const publicRoutes = [
  '/',
  '/courses',
  '/programs',
  '/about',
  '/contact',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookies
  const token = request.cookies.get('odel_auth')?.value

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname === route)
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // API routes don't need middleware protection (they handle their own auth)
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Redirect old /auth paths to /login for consolidation
  if (pathname.startsWith('/auth')) {
    // Check if authenticated
    if (token) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If accessing protected routes, verify authentication
  if (isProtectedRoute) {
    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify token is still valid by checking with the verify endpoint
    try {
      const verifyResponse = await fetch(
        new URL('/api/auth/verify', request.url),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `odel_auth=${token}`
          }
        }
      )

      if (!verifyResponse.ok) {
        // Token is invalid or expired, redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('odel_auth')
        return response
      }

      // Token is valid, allow access
      return NextResponse.next()
    } catch (error) {
      console.error('Middleware auth verification error:', error)
      // On error, allow access to be safe, but could also redirect
      return NextResponse.next()
    }
  }

  // If accessing auth routes (login/register) while logged in, redirect to dashboard
  if (isAuthRoute && token) {
    // Try to verify token is still valid
    try {
      const verifyResponse = await fetch(
        new URL('/api/auth/verify', request.url),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `odel_auth=${token}`
          }
        }
      )

      if (verifyResponse.ok) {
        // Token is valid, redirect to dashboard
        return NextResponse.redirect(new URL('/student/dashboard', request.url))
      }
    } catch (error) {
      console.error('Middleware token check error:', error)
      // If verification fails, allow access to login page
    }
  }

  // Public routes - allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

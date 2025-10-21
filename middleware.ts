import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

// Routes that require authentication
const PROTECTED_ROUTES = {
  student: ['/student/dashboard'],
  admin: ['/admin/dashboard', '/admin/settings']
}

// Public routes (no auth needed)
const PUBLIC_ROUTES = [
  '/auth',
  '/auth/verify',
  '/admin/login',
  '/',
  '/about',
  '/contact',
  '/courses',
  '/programs'
]

async function verifyToken(token: string, type: 'student' | 'admin') {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const payload = verified.payload as any
    
    // Check token type matches route type
    if (type === 'student' && payload.type !== 'student') {
      return null
    }
    if (type === 'admin' && payload.type !== 'admin') {
      return null
    }
    
    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check student protected routes
  const isStudentRoute = PROTECTED_ROUTES.student.some(route =>
    pathname.startsWith(route)
  )

  if (isStudentRoute) {
    const studentToken = request.cookies.get('odel_auth')?.value
    
    if (!studentToken) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Verify token
    const payload = await verifyToken(studentToken, 'student')
    if (!payload) {
      // Token invalid or expired
      const response = NextResponse.redirect(new URL('/auth', request.url))
      response.cookies.delete('odel_auth')
      return response
    }

    // Token valid, continue
    return NextResponse.next()
  }

  // Check admin protected routes
  const isAdminRoute = PROTECTED_ROUTES.admin.some(route =>
    pathname.startsWith(route)
  )

  if (isAdminRoute) {
    const adminToken = request.cookies.get('odel_admin_auth')?.value
    
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify token
    const payload = await verifyToken(adminToken, 'admin')
    if (!payload) {
      // Token invalid or expired
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('odel_admin_auth')
      return response
    }

    // Token valid, continue
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)'
  ]
}

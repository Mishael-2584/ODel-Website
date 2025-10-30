'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import NotificationCenter from './NotificationCenter'
import { 
  FaBars, FaTimes, FaBook, FaUser, FaHome, 
  FaInfoCircle, FaPhone, FaTh, FaSignOutAlt, FaUserCircle, FaCalendarAlt, FaNewspaper
} from 'react-icons/fa'

interface StudentUser {
  email: string
  studentName: string
  moodleUsername: string
  moodleUserId: number
  roles?: string[]
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [studentData, setStudentData] = useState<StudentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const router = useRouter()

  // Check if student is logged in
  useEffect(() => {
    const checkStudentLogin = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          setStudentData(data.user)
        } else {
          setStudentData(null)
        }
      } catch (err) {
        setStudentData(null)
      } finally {
        setLoading(false)
      }
    }

    checkStudentLogin()
  }, [])

  const publicNavLinks = [
    { href: '/', label: 'Home', icon: FaHome },
    { 
      label: 'Academic',
      icon: FaBook,
      submenu: [
        { href: '/courses', label: 'ODeL Catalogue' },
        { href: '/programs', label: 'Programs' },
        { href: '/resources', label: 'Resources & FAQs' },
      ]
    },
    { 
      label: 'Discover',
      icon: FaTh,
      submenu: [
        { href: '/events', label: 'Events Calendar' },
        { href: '/about', label: 'About ODeL' },
        { href: '/news', label: 'News' },
      ]
    },
    { href: '/contact', label: 'Contact', icon: FaPhone },
  ]

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setStudentData(null)
      setIsOpen(false)
      router.push('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const getRoleBadgeStyle = (role: string) => {
    const styles: { [key: string]: string } = {
      'student': 'bg-blue-100 text-blue-800 border border-blue-300',
      'instructor': 'bg-purple-100 text-purple-800 border border-purple-300',
      'admin': 'bg-red-100 text-red-800 border border-red-300',
      'teacher': 'bg-purple-100 text-purple-800 border border-purple-300'
    }
    return styles[role] || 'bg-gray-100 text-gray-800 border border-gray-300'
  }

  const getRoleBadgeLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      'student': 'Student',
      'instructor': 'Instructor',
      'teacher': 'Teacher',
      'admin': 'Admin'
    }
    return labels[role] || role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-white p-1 rounded-lg group-hover:scale-110 transition-transform">
                <Image 
                  src="https://ueab.ac.ke/wp-content/uploads/2025/03/logo-2.png" 
                  alt="UEAB ODeL Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                  <h1 className="text-xl font-bold text-primary-600">UEAB ODeL</h1>
                  <p className="text-xs text-gray-500">eLearning Platform</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {publicNavLinks.map((link) => (
              <div key={link.label || link.href} className="relative group">
                {link.submenu ? (
                  <>
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors group-hover:text-primary-600">
                      {link.icon && <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                      <span>{link.label}</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-y-95 group-hover:scale-y-100 z-50">
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.href}
                          href={sublink.href}
                          className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {sublink.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors group"
                  >
                    {link.icon && <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                    <span>{link.label}</span>
                  </Link>
                )}
              </div>
            ))}
            
            {/* Dashboard Link - Only show when logged in */}
            {loading ? (
              <div className="flex items-center space-x-4">
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ) : studentData ? (
              /* Student is logged in */
              <div className="flex items-center space-x-4">
                <Link
                  href="/student/dashboard"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors group flex items-center space-x-2"
                >
                  <FaTh className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors group flex items-center space-x-2"
                >
                  <FaSignOutAlt className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              /* Student is not logged in */
              <div className="flex items-center space-x-4">
                <Link href="/login" className="btn-outline !py-2 !px-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <FaUser className="inline mr-2" />
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              {publicNavLinks.map((link) => (
                <div key={link.label || link.href}>
                  {link.submenu ? (
                    <>
                      <button
                        onClick={() => setOpenSubmenu(openSubmenu === link.label ? null : link.label)}
                        className="w-full flex items-center justify-between text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-colors px-3 py-2 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          {link.icon && <link.icon className="h-4 w-4" />}
                          <span>{link.label}</span>
                        </div>
                        <span className={`transition-transform ${openSubmenu === link.label ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      
                      {/* Mobile Submenu */}
                      {openSubmenu === link.label && (
                        <div className="pl-4 space-y-1 bg-white rounded-md mt-1">
                          {link.submenu.map((sublink) => (
                            <Link
                              key={sublink.href}
                              href={sublink.href}
                              className="flex items-center text-gray-600 hover:text-primary-600 hover:bg-primary-50 font-medium transition-colors px-3 py-2 rounded-md text-sm"
                              onClick={() => {
                                setIsOpen(false)
                                setOpenSubmenu(null)
                              }}
                            >
                              {sublink.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-colors px-3 py-2 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.icon && <link.icon className="h-4 w-4" />}
                      <span>{link.label}</span>
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Dashboard Link - Mobile */}
              {studentData && (
                <Link
                  href="/student/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors group px-3 py-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <FaTh className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}

              {/* Mobile Authentication */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {studentData ? (
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaUserCircle className="h-6 w-6 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">{studentData.studentName}</p>
                        <p className="text-xs text-gray-500">{studentData.email}</p>
                        {studentData.roles && studentData.roles.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {studentData.roles.map((role) => (
                              <span
                                key={role}
                                className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeStyle(role)}`}
                              >
                                {getRoleBadgeLabel(role)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-600 hover:text-red-600 font-medium transition-colors w-full px-3 py-2 rounded-md hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-3 py-2">
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors w-full px-3 py-2 rounded-md hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaUser className="h-4 w-4" />
                      <span>Login</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
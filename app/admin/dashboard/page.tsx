'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaUser, 
  FaSignOutAlt, 
  FaCog, 
  FaChartBar,
  FaUsers,
  FaFileAlt,
  FaLock 
} from 'react-icons/fa'

interface AdminData {
  id: string
  email: string
  fullName: string
  role: string
}

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const verifySession = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('odel_admin_auth='))
          ?.split('=')[1]

        if (!token) {
          router.push('/admin/login')
          return
        }

        // TODO: Verify admin token with backend
        // For now, decode from localStorage or implement backend verify endpoint
        const response = await fetch('/api/admin/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null)

        if (!response?.ok) {
          router.push('/admin/login')
          return
        }

        const data = await response.json()
        setAdminData(data.admin)
      } catch (err) {
        console.error('Error:', err)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-amber-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!adminData) {
    return null
  }

  const menuItems = [
    {
      icon: FaFileAlt,
      title: 'Content Management',
      description: 'Manage website pages and content',
      color: 'bg-blue-100 text-blue-600',
      href: '#'
    },
    {
      icon: FaUsers,
      title: 'User Management',
      description: 'View and manage students and admins',
      color: 'bg-green-100 text-green-600',
      href: '#'
    },
    {
      icon: FaChartBar,
      title: 'Analytics',
      description: 'View student enrollment and progress',
      color: 'bg-purple-100 text-purple-600',
      href: '#'
    },
    {
      icon: FaCog,
      title: 'Settings',
      description: 'Configure system and Moodle integration',
      color: 'bg-amber-100 text-amber-600',
      href: '#'
    },
    {
      icon: FaFileAlt,
      title: 'Audit Logs',
      description: 'View admin activity and changes',
      color: 'bg-red-100 text-red-600',
      href: '#'
    },
    {
      icon: FaLock,
      title: 'Security',
      description: 'Manage permissions and access control',
      color: 'bg-indigo-100 text-indigo-600',
      href: '#'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-amber-100">Welcome, {adminData.fullName} ({adminData.role})</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Admin Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white">
              <FaUser className="text-2xl" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{adminData.fullName}</h2>
              <p className="text-gray-600">{adminData.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Role: <span className="font-semibold text-amber-600 uppercase">{adminData.role}</span>
              </p>
            </div>
            <Link
              href="/admin/settings/profile"
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Management Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Management Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon
              return (
                <a
                  key={index}
                  href={item.href}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
                >
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className="text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                  <div className="mt-4 text-amber-600 font-medium text-sm">
                    Access →
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">0</p>
              <p className="text-gray-600 text-sm mt-2">Active Students</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-gray-600 text-sm mt-2">Courses</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">0</p>
              <p className="text-gray-600 text-sm mt-2">Admin Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-gray-600 text-sm mt-2">Transactions</p>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-2">📌 Administrator Notice:</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Additional management features coming soon</li>
            <li>• Ensure you keep audit logs of all changes</li>
            <li>• Contact IT support for technical issues</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  )
}

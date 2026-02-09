'use client'

import { useState, useEffect } from 'react'
import { 
  FaUserPlus, FaEdit, FaTrash, FaSpinner, FaCheckCircle, 
  FaTimes, FaUser, FaEnvelope, FaPhone, FaVenusMars, FaGraduationCap,
  FaSave, FaBan, FaCheck
} from 'react-icons/fa'

interface Counselor {
  id: string
  admin_user_id: string
  name: string
  email: string
  phone: string | null
  gender: 'male' | 'female'
  specialization: string[]
  bio: string | null
  is_active: boolean
  created_at: string
  admin_users?: {
    id: string
    email: string
    full_name: string
    role: string
  }
}

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
}

const COUNSELING_SERVICES = [
  'Individual Counseling',
  'Group Therapy',
  'Crisis Support',
  'Support Group',
  'VCT',
  'Peer Counseling',
  'Pre-Marital Counseling',
  'Family Therapy',
  'Mental Health Education',
]

export default function CounselorManager() {
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    adminUserId: '',
    name: '',
    email: '',
    phone: '',
    gender: 'female' as 'male' | 'female',
    specialization: [] as string[],
    bio: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchCounselors()
    fetchAdminUsers()
  }, [])

  const fetchCounselors = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/counseling/create-counselor', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setCounselors(data.counselors || [])
      }
    } catch (err) {
      console.error('Error fetching counselors:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAdminUsers(data.users || [])
        }
      }
    } catch (err) {
      console.error('Error fetching admin users:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    try {
      const token = localStorage.getItem('admin_token')
      const url = editingId 
        ? `/api/counseling/update-counselor`
        : `/api/counseling/create-counselor`
      
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId 
        ? { id: editingId, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(editingId ? 'Counselor updated successfully' : 'Counselor created successfully')
        setShowForm(false)
        setEditingId(null)
        resetForm()
        fetchCounselors()
      } else {
        setError(data.error || 'Failed to save counselor')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (counselor: Counselor) => {
    setFormData({
      adminUserId: counselor.admin_user_id,
      name: counselor.name,
      email: counselor.email,
      phone: counselor.phone || '',
      gender: counselor.gender,
      specialization: counselor.specialization || [],
      bio: counselor.bio || '',
    })
    setEditingId(counselor.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this counselor? This will also delete all their appointments.')) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/counseling/delete-counselor`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Counselor deleted successfully')
        fetchCounselors()
      } else {
        setError(data.error || 'Failed to delete counselor')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const toggleSpecialization = (service: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(service)
        ? prev.specialization.filter(s => s !== service)
        : [...prev.specialization, service]
    }))
  }

  const resetForm = () => {
    setFormData({
      adminUserId: '',
      name: '',
      email: '',
      phone: '',
      gender: 'female',
      specialization: [],
      bio: '',
    })
  }

  const handleNewCounselor = () => {
    resetForm()
    setEditingId(null)
    setShowForm(true)
  }

  const availableAdminUsers = adminUsers.filter(au => 
    !counselors.some(c => c.admin_user_id === au.id) || 
    (editingId && counselors.find(c => c.id === editingId)?.admin_user_id === au.id)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Counselor Management</h2>
          <p className="text-gray-400 mt-1">Create and manage counselor profiles</p>
        </div>
        <button
          onClick={handleNewCounselor}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <FaUserPlus />
          Add Counselor
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <FaTimes />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <FaCheckCircle />
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-6">
            {editingId ? 'Edit Counselor' : 'Create New Counselor'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaUser className="inline mr-2" />
                  Admin User *
                </label>
                <select
                  required
                  value={formData.adminUserId}
                  onChange={(e) => setFormData({ ...formData, adminUserId: e.target.value })}
                  disabled={!!editingId}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-600 outline-none disabled:opacity-50"
                >
                  <option value="">Select admin user...</option>
                  {availableAdminUsers.map(au => (
                    <option key={au.id} value={au.id}>
                      {au.full_name || au.email} ({au.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Select the admin user account for this counselor
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaVenusMars className="inline mr-2" />
                  Gender *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-600 outline-none"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaUser className="inline mr-2" />
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-600 outline-none"
                  placeholder="Counselor Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-600 outline-none"
                  placeholder="counselor@ueab.ac.ke"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaPhone className="inline mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-600 outline-none"
                  placeholder="0700 000 000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaGraduationCap className="inline mr-2" />
                Specializations
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COUNSELING_SERVICES.map(service => (
                  <label
                    key={service}
                    className="flex items-center gap-2 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialization.includes(service)}
                      onChange={() => toggleSpecialization(service)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-600 outline-none resize-none"
                placeholder="Brief description of the counselor's experience and expertise..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                {editingId ? 'Update Counselor' : 'Create Counselor'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  resetForm()
                }}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Counselors List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-4xl text-primary-600" />
        </div>
      ) : counselors.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg">No counselors found</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Counselor" to create one</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {counselors.map((counselor) => (
            <div
              key={counselor.id}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-primary-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">{counselor.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      counselor.is_active 
                        ? 'bg-green-500/20 text-green-300 border border-green-500' 
                        : 'bg-red-500/20 text-red-300 border border-red-500'
                    }`}>
                      {counselor.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500">
                      {counselor.gender === 'male' ? 'Male' : 'Female'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 mb-4">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-primary-600" />
                      <span>{counselor.email}</span>
                    </div>
                    {counselor.phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-primary-600" />
                        <span>{counselor.phone}</span>
                      </div>
                    )}
                    {counselor.admin_users && (
                      <div className="flex items-center gap-2">
                        <FaUser className="text-primary-600" />
                        <span>Admin: {counselor.admin_users.full_name || counselor.admin_users.email}</span>
                      </div>
                    )}
                  </div>

                  {counselor.specialization && counselor.specialization.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-400 mb-2">Specializations:</p>
                      <div className="flex flex-wrap gap-2">
                        {counselor.specialization.map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {counselor.bio && (
                    <p className="text-sm text-gray-400 mt-4">{counselor.bio}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(counselor)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(counselor.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

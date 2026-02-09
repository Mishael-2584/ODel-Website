'use client'

import { useState, useEffect } from 'react'
import { 
  FaCalendarAlt, FaClock, FaUser, FaEnvelope, FaPhone, 
  FaCheckCircle, FaTimes, FaVideo, FaSpinner, FaFilter,
  FaEye, FaComment
} from 'react-icons/fa'

interface Appointment {
  id: string
  student_name: string
  student_email: string
  student_phone: string | null
  counselor_id: string
  counselor_name?: string
  appointment_date: string
  appointment_time: string
  appointment_type: string
  preferred_gender: string | null
  reason: string | null
  message: string | null
  status: string
  zoom_meeting_id: string | null
  zoom_meeting_url: string | null
  zoom_start_url: string | null
  confirmed_at: string | null
  created_at: string
}

export default function CounselingManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [counselorId, setCounselorId] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
    fetchCounselorId()
  }, [filter])

  const fetchCounselorId = async () => {
    try {
      const adminData = localStorage.getItem('admin_user')
      if (adminData) {
        const admin = JSON.parse(adminData)
        const response = await fetch(`/api/counseling/my-counselor-id?adminId=${admin.id}`)
        const data = await response.json()
        if (data.success && data.counselorId) {
          setCounselorId(data.counselorId)
        }
      }
    } catch (err) {
      console.error('Error fetching counselor ID:', err)
    }
  }

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/counseling/appointments?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setAppointments(data.appointments || [])
      }
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (appointmentId: string) => {
    setActionLoading(appointmentId)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/counseling/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId })
      })

      const data = await response.json()
      if (data.success) {
        await fetchAppointments()
        if (selectedAppointment?.id === appointmentId) {
          setSelectedAppointment({ ...selectedAppointment, status: 'confirmed' })
        }
      } else {
        alert(data.error || 'Failed to confirm appointment')
      }
    } catch (err) {
      console.error('Error confirming appointment:', err)
      alert('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (appointmentId: string, reason?: string) => {
    const cancelReason = reason || prompt('Please provide a reason for cancellation:')
    if (!cancelReason) return

    setActionLoading(appointmentId)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/counseling/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId, reason: cancelReason })
      })

      const data = await response.json()
      if (data.success) {
        await fetchAppointments()
        if (selectedAppointment?.id === appointmentId) {
          setSelectedAppointment({ ...selectedAppointment, status: 'cancelled' })
        }
      } else {
        alert(data.error || 'Failed to cancel appointment')
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      alert('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatAppointmentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'confirmed': 'bg-green-100 text-green-800 border-green-300',
      'cancelled': 'bg-red-100 text-red-800 border-red-300',
      'completed': 'bg-blue-100 text-blue-800 border-blue-300',
    }
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const filteredAppointments = counselorId
    ? appointments.filter(apt => apt.counselor_id === counselorId)
    : appointments

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Counseling Appointments</h2>
          <p className="text-gray-400 mt-1">Manage student appointments and sessions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <FaFilter className="inline mr-2" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-4xl text-primary-600" />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg">No appointments found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-primary-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">{appointment.student_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-primary-600" />
                      <span>{formatDate(appointment.appointment_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-primary-600" />
                      <span>{appointment.appointment_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-primary-600" />
                      <span>{appointment.student_email}</span>
                    </div>
                    {appointment.student_phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-primary-600" />
                        <span>{appointment.student_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-primary-600 font-semibold">Type:</span>
                      <span>{formatAppointmentType(appointment.appointment_type)}</span>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setShowDetails(true)
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                  >
                    <FaEye />
                    Details
                  </button>
                  
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConfirm(appointment.id)}
                        disabled={actionLoading === appointment.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading === appointment.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheckCircle />
                        )}
                        Confirm
                      </button>
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        disabled={actionLoading === appointment.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading === appointment.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTimes />
                        )}
                        Cancel
                      </button>
                    </>
                  )}

                  {appointment.status === 'confirmed' && appointment.zoom_start_url && (
                    <a
                      href={appointment.zoom_start_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      title="Start Zoom meeting as host"
                    >
                      <FaVideo />
                      Start Meeting
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Appointment Details</h3>
              <button
                onClick={() => {
                  setShowDetails(false)
                  setSelectedAppointment(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <strong className="text-primary-600">Student Name:</strong> {selectedAppointment.student_name}
              </div>
              <div>
                <strong className="text-primary-600">Email:</strong> {selectedAppointment.student_email}
              </div>
              {selectedAppointment.student_phone && (
                <div>
                  <strong className="text-primary-600">Phone:</strong> {selectedAppointment.student_phone}
                </div>
              )}
              <div>
                <strong className="text-primary-600">Date:</strong> {formatDate(selectedAppointment.appointment_date)}
              </div>
              <div>
                <strong className="text-primary-600">Time:</strong> {selectedAppointment.appointment_time}
              </div>
              <div>
                <strong className="text-primary-600">Type:</strong> {formatAppointmentType(selectedAppointment.appointment_type)}
              </div>
              {selectedAppointment.reason && (
                <div>
                  <strong className="text-primary-600">Reason:</strong>
                  <p className="mt-1 p-3 bg-slate-700 rounded-lg">{selectedAppointment.reason}</p>
                </div>
              )}
              {selectedAppointment.message && (
                <div>
                  <strong className="text-primary-600">Message:</strong>
                  <p className="mt-1 p-3 bg-slate-700 rounded-lg">{selectedAppointment.message}</p>
                </div>
              )}
              <div>
                <strong className="text-primary-600">Status:</strong>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
              {selectedAppointment.zoom_start_url && (
                <div>
                  <strong className="text-primary-600">Zoom Meeting:</strong>
                  <div className="mt-2 space-y-2">
                    <a
                      href={selectedAppointment.zoom_start_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaVideo className="inline mr-2" />
                      Start Meeting (Host)
                    </a>
                    {selectedAppointment.zoom_meeting_url && (
                      <p className="text-sm text-gray-400 mt-2">
                        Student join link: <a href={selectedAppointment.zoom_meeting_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{selectedAppointment.zoom_meeting_url}</a>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {selectedAppointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleConfirm(selectedAppointment.id)
                      setShowDetails(false)
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirm Appointment
                  </button>
                  <button
                    onClick={() => {
                      handleCancel(selectedAppointment.id)
                      setShowDetails(false)
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  FaCalendarAlt, FaClock, FaUser, FaEnvelope, FaPhone, 
  FaCheckCircle, FaTimes, FaVideo, FaSpinner, FaFilter,
  FaEye, FaComment, FaSearch, FaEdit, FaTrash, FaChevronLeft, FaChevronRight
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
  const [showReschedule, setShowReschedule] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [counselorId, setCounselorId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Reschedule form
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

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
        setCurrentPage(1) // Reset to first page when filter changes
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
        alert('Appointment confirmed successfully')
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

    if (!confirm('Are you sure you want to cancel this appointment? The student will be notified via email.')) {
      return
    }

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
        alert('Appointment cancelled successfully. Student has been notified.')
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

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) {
      alert('Please select a new date and time')
      return
    }

    if (!confirm('Are you sure you want to reschedule this appointment? The student will be notified via email.')) {
      return
    }

    setActionLoading(selectedAppointment.id)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/counseling/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          newDate: rescheduleDate,
          newTime: rescheduleTime,
          reason: rescheduleReason || 'Appointment rescheduled by counselor'
        })
      })

      const data = await response.json()
      if (data.success) {
        await fetchAppointments()
        setShowReschedule(false)
        setShowDetails(false)
        setSelectedAppointment(null)
        setRescheduleDate('')
        setRescheduleTime('')
        setRescheduleReason('')
        alert('Appointment rescheduled successfully. Student has been notified.')
      } else {
        alert(data.error || 'Failed to reschedule appointment')
      }
    } catch (err) {
      console.error('Error rescheduling appointment:', err)
      alert('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to permanently delete this appointment? This action cannot be undone.')) {
      return
    }

    setActionLoading(appointmentId)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/counseling/delete?appointmentId=${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        await fetchAppointments()
        if (selectedAppointment?.id === appointmentId) {
          setShowDetails(false)
          setSelectedAppointment(null)
        }
        alert('Appointment deleted successfully')
      } else {
        alert(data.error || 'Failed to delete appointment')
      }
    } catch (err) {
      console.error('Error deleting appointment:', err)
      alert('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const fetchAvailableSlots = async (date: string) => {
    if (!date || !selectedAppointment) return
    
    setLoadingSlots(true)
    try {
      const response = await fetch(`/api/counseling/available-slots?counselorId=${selectedAppointment.counselor_id}&date=${date}`)
      const data = await response.json()
      if (data.success) {
        setAvailableSlots(data.slots || [])
      }
    } catch (err) {
      console.error('Error fetching available slots:', err)
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    if (rescheduleDate && selectedAppointment) {
      fetchAvailableSlots(rescheduleDate)
    }
  }, [rescheduleDate, selectedAppointment])

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

  // Filter appointments by counselor and search query
  const filteredAppointments = useMemo(() => {
    let filtered = counselorId
      ? appointments.filter(apt => apt.counselor_id === counselorId)
      : appointments

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(apt =>
        apt.student_name.toLowerCase().includes(query) ||
        apt.student_email.toLowerCase().includes(query) ||
        (apt.student_phone && apt.student_phone.includes(query)) ||
        apt.appointment_date.includes(query) ||
        apt.appointment_time.includes(query)
      )
    }

    return filtered
  }, [appointments, counselorId, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex)

  const getMinDate = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.toISOString().split('T')[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Counseling Appointments</h2>
          <p className="text-gray-400 mt-1">Manage student appointments and sessions</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, date, or time..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-600 focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-3 flex-wrap">
          {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status)
                setCurrentPage(1)
              }}
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
      </div>

      {/* Results Count */}
      <div className="text-gray-400 text-sm">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredAppointments.length)} of {filteredAppointments.length} appointments
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-4xl text-primary-600" />
        </div>
      ) : paginatedAppointments.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg">
            {searchQuery ? 'No appointments match your search' : 'No appointments found'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedAppointments.map((appointment) => (
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
                        <span className="truncate">{appointment.student_email}</span>
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

                    {/* Reschedule and Delete buttons for all statuses */}
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setRescheduleDate(appointment.appointment_date)
                        setRescheduleTime('')
                        setRescheduleReason('')
                        setShowReschedule(true)
                      }}
                      disabled={actionLoading === appointment.id}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <FaEdit />
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      disabled={actionLoading === appointment.id}
                      className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading === appointment.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaChevronLeft />
                Previous
              </button>
              <span className="text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {showDetails && selectedAppointment && !showReschedule && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full p-6 border border-slate-700 max-h-[90vh] overflow-y-auto">
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
              <button
                onClick={() => {
                  setRescheduleDate(selectedAppointment.appointment_date)
                  setRescheduleTime('')
                  setRescheduleReason('')
                  setShowReschedule(true)
                }}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <FaEdit className="inline mr-2" />
                Reschedule
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedAppointment.id)
                  setShowDetails(false)
                }}
                className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
              >
                <FaTrash className="inline mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showReschedule && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Reschedule Appointment</h3>
              <button
                onClick={() => {
                  setShowReschedule(false)
                  setRescheduleDate('')
                  setRescheduleTime('')
                  setRescheduleReason('')
                }}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-gray-300 mb-2"><strong>Current Appointment:</strong></p>
                <p className="text-white">{formatDate(selectedAppointment.appointment_date)} at {selectedAppointment.appointment_time}</p>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">New Date *</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value)
                    setRescheduleTime('')
                  }}
                  min={getMinDate()}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-600 focus:outline-none"
                  required
                />
              </div>

              {rescheduleDate && (
                <div>
                  <label className="block text-gray-300 mb-2">New Time *</label>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaSpinner className="animate-spin" />
                      Loading available slots...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-red-400">No available slots for this date</p>
                  ) : (
                    <select
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-600 focus:outline-none"
                      required
                    >
                      <option value="">Select a time</option>
                      {availableSlots.map((slot) => (
                        <option
                          key={slot.time}
                          value={slot.time}
                          disabled={!slot.available}
                          className={slot.available ? 'text-white' : 'text-gray-500'}
                        >
                          {slot.time} {!slot.available && '(Booked)'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2">Reason for Reschedule (Optional)</label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Explain why the appointment is being rescheduled..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowReschedule(false)
                    setRescheduleDate('')
                    setRescheduleTime('')
                    setRescheduleReason('')
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={!rescheduleDate || !rescheduleTime || actionLoading === selectedAppointment.id}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedAppointment.id ? (
                    <>
                      <FaSpinner className="inline mr-2 animate-spin" />
                      Rescheduling...
                    </>
                  ) : (
                    'Reschedule Appointment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

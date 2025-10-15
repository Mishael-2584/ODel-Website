'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { FaBell, FaTimes, FaCheckCircle, FaBook, FaCertificate, FaTrophy, FaCalendar, FaUsers, FaExclamationTriangle } from 'react-icons/fa'

interface Notification {
  id: string
  type: 'achievement' | 'course' | 'deadline' | 'certificate' | 'announcement' | 'warning'
  title: string
  message: string
  created_at: string
  read: boolean
  user_id: string
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Fallback to empty array if database error
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error

      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds)

      if (error) throw error

      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return FaTrophy
      case 'course':
        return FaBook
      case 'deadline':
        return FaCalendar
      case 'certificate':
        return FaCertificate
      case 'announcement':
        return FaBell
      case 'warning':
        return FaExclamationTriangle
      default:
        return FaBell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'text-gold-500'
      case 'course':
        return 'text-primary-600'
      case 'deadline':
        return 'text-red-500'
      case 'certificate':
        return 'text-accent-green'
      case 'announcement':
        return 'text-blue-500'
      case 'warning':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Don't show notification center if no user is logged in
  if (!user) {
    return null
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaBell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type)
                  const iconColor = getNotificationColor(notification.type)
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-primary-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`${iconColor} mt-1`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">{formatTime(notification.created_at)}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
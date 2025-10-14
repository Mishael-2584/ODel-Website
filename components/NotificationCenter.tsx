'use client'

import { useState } from 'react'
import { FaBell, FaTimes, FaCheckCircle, FaBook, FaCertificate, FaTrophy, FaCalendar } from 'react-icons/fa'

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'You earned the "Fast Learner" badge',
      time: '5 min ago',
      read: false,
      icon: FaTrophy,
      color: 'text-gold-500'
    },
    {
      id: 2,
      type: 'course',
      title: 'New Lesson Available',
      message: 'Module 3: Strategic Planning is now available',
      time: '1 hour ago',
      read: false,
      icon: FaBook,
      color: 'text-primary-600'
    },
    {
      id: 3,
      type: 'deadline',
      title: 'Assignment Due Soon',
      message: 'Business Admin Assignment due in 2 days',
      time: '2 hours ago',
      read: false,
      icon: FaCalendar,
      color: 'text-red-500'
    },
    {
      id: 4,
      type: 'certificate',
      title: 'Certificate Ready!',
      message: 'Your Digital Marketing certificate is ready to download',
      time: '1 day ago',
      read: true,
      icon: FaCertificate,
      color: 'text-accent-green'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
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
                <button 
                  onClick={markAllRead}
                  className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Mark all read
                </button>
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
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaBell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-primary-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`${notification.color} mt-1`}>
                        <notification.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 text-center">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


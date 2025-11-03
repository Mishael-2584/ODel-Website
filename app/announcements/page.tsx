'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  FaBell, FaCalendarAlt, FaTag, FaChevronRight, FaFilter,
  FaGraduationCap, FaMapMarkerAlt, FaUserCircle, FaNewspaper
} from 'react-icons/fa'

interface Announcement {
  id: string
  title: string
  description: string
  content: string
  category: string
  featured_image_url: string | null
  is_pinned: boolean
  published_at: string
  expires_at: string | null
  created_at: string
  author?: {
    id: string
    full_name: string
    email: string
  }
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: FaBell },
  { value: 'academic', label: 'Academic', icon: FaGraduationCap },
  { value: 'admission', label: 'Admission', icon: FaUserCircle },
  { value: 'financial', label: 'Financial', icon: FaMapMarkerAlt },
  { value: 'event', label: 'Event', icon: FaCalendarAlt },
  { value: 'deadline', label: 'Deadline', icon: FaTag },
  { value: 'maintenance', label: 'Maintenance', icon: FaNewspaper },
  { value: 'general', label: 'General', icon: FaBell },
]

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    general: 'bg-gray-500',
    academic: 'bg-blue-500',
    admission: 'bg-green-500',
    financial: 'bg-yellow-500',
    event: 'bg-purple-500',
    deadline: 'bg-red-500',
    maintenance: 'bg-orange-500',
    other: 'bg-gray-400',
  }
  return colors[category] || colors.general
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    fetchAnnouncements()
  }, [selectedCategory])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const url = selectedCategory === 'all' 
        ? '/api/announcements'
        : `/api/announcements?category=${selectedCategory}`
      
      const res = await fetch(url)
      const result = await res.json()
      
      if (result.success) {
        // Sort: pinned first, then by published date
        const sorted = (result.data || []).sort((a: Announcement, b: Announcement) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.published_at || b.created_at).getTime() - 
                 new Date(a.published_at || a.created_at).getTime()
        })
        setAnnouncements(sorted)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredAnnouncements = selectedCategory === 'all' 
    ? announcements 
    : announcements.filter(a => a.category === selectedCategory)

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.is_pinned)
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.is_pinned)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center text-white">
            <div className="inline-flex items-center bg-gold-500/20 backdrop-blur-sm border border-gold-500/30 rounded-full px-4 py-2 mb-6">
              <FaBell className="mr-2" />
              <span className="text-gold-300 text-sm font-semibold">Stay Informed</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Announcements & <span className="text-gold-400">Updates</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Stay up-to-date with the latest news, events, deadlines, and important information from UEAB ODeL.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <FaFilter className="text-gray-500 flex-shrink-0" />
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Announcements List */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading announcements...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-20">
              <FaBell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Announcements Found</h3>
              <p className="text-gray-600">There are no announcements in this category at the moment.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pinned Announcements */}
              {pinnedAnnouncements.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-8 bg-gold-500 rounded-full"></span>
                    Pinned Announcements
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {pinnedAnnouncements.map((announcement) => (
                      <div
                        key={announcement.id}
                        onClick={() => setSelectedAnnouncement(announcement)}
                        className="bg-gradient-to-br from-gold-50 to-yellow-50 border-2 border-gold-300 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group"
                      >
                        {announcement.featured_image_url && (
                          <img
                            src={announcement.featured_image_url}
                            alt={announcement.title}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(announcement.category)}`}>
                            {CATEGORIES.find(c => c.value === announcement.category)?.label || announcement.category}
                          </span>
                          <span className="px-3 py-1 bg-gold-500 text-white rounded-full text-xs font-semibold">
                            Pinned
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {announcement.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{formatDate(announcement.published_at || announcement.created_at)}</span>
                          <span className="flex items-center gap-1 text-primary-600 font-medium group-hover:gap-2 transition-all">
                            Read More <FaChevronRight />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Announcements */}
              {regularAnnouncements.length > 0 && (
                <div>
                  {pinnedAnnouncements.length > 0 && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 mt-12">
                      <span className="w-1 h-8 bg-primary-600 rounded-full"></span>
                      Recent Announcements
                    </h2>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularAnnouncements.map((announcement) => (
                      <div
                        key={announcement.id}
                        onClick={() => setSelectedAnnouncement(announcement)}
                        className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group"
                      >
                        {announcement.featured_image_url && (
                          <img
                            src={announcement.featured_image_url}
                            alt={announcement.title}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3 ${getCategoryColor(announcement.category)}`}>
                          {CATEGORIES.find(c => c.value === announcement.category)?.label || announcement.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {announcement.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{formatDate(announcement.published_at || announcement.created_at)}</span>
                          <span className="flex items-center gap-1 text-primary-600 font-medium group-hover:gap-2 transition-all">
                            Read More <FaChevronRight />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Announcement Modal */}
      {selectedAnnouncement && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {selectedAnnouncement.featured_image_url && (
                <img
                  src={selectedAnnouncement.featured_image_url}
                  alt={selectedAnnouncement.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(selectedAnnouncement.category)}`}>
                  {CATEGORIES.find(c => c.value === selectedAnnouncement.category)?.label || selectedAnnouncement.category}
                </span>
                {selectedAnnouncement.is_pinned && (
                  <span className="px-3 py-1 bg-gold-500 text-white rounded-full text-xs font-semibold">
                    Pinned
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedAnnouncement.title}</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{selectedAnnouncement.description}</p>
              {selectedAnnouncement.content && (
                <div 
                  className="prose prose-lg max-w-none mb-6"
                  dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                />
              )}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <p>Published: {formatDate(selectedAnnouncement.published_at || selectedAnnouncement.created_at)}</p>
                  {selectedAnnouncement.expires_at && (
                    <p>Expires: {formatDate(selectedAnnouncement.expires_at)}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}


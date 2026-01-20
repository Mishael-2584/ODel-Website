'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaYoutube, FaPlay, FaSpinner, FaClock, FaUsers, FaCalendarAlt, FaArrowLeft, FaHome, FaVideo, FaBroadcastTower, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Image from 'next/image'

interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  channelTitle: string
  videoId: string
  duration: string | null
  isLive: boolean
  isUpcoming: boolean
  liveViewers: number | null
  scheduledStartTime: string | null
  actualStartTime: string | null
}

type TabType = 'live' | 'videos'

export default function SpiritualCornerPage() {
  const [allVideos, setAllVideos] = useState<YouTubeVideo[]>([]) // Store all videos
  const [displayedVideos, setDisplayedVideos] = useState<YouTubeVideo[]>([]) // Videos for current page
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('live')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const videosPerPage = 50

  useEffect(() => {
    fetchAllVideos()
  }, [])

  useEffect(() => {
    // Update displayed videos when page changes or videos are loaded (for Videos tab)
    if (activeTab === 'videos' && allVideos.length > 0) {
      updateDisplayedVideos()
    }
  }, [currentPage, allVideos, activeTab])

  const fetchAllVideos = async (retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch a large batch to support pagination
      const response = await fetch('/api/youtube?maxResults=200', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      if (data.success) {
        setAllVideos(data.videos || [])
      } else {
        setError(data.error || 'Failed to load videos')
      }
    } catch (err: any) {
      if (retryCount < 2 && (err.message.includes('Failed to fetch') || err.message.includes('timeout'))) {
        console.log(`Retrying... (${retryCount + 1}/2)`)
        setTimeout(() => fetchAllVideos(retryCount + 1), 1000)
        return
      }
      setError(err.message || 'Failed to fetch videos. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const updateDisplayedVideos = () => {
    if (activeTab === 'videos') {
      // Filter to only regular videos (not live/upcoming) for Videos tab
      const regularOnly = allVideos.filter(v => !v.isLive && !v.isUpcoming)
      const startIndex = (currentPage - 1) * videosPerPage
      const endIndex = startIndex + videosPerPage
      setDisplayedVideos(regularOnly.slice(startIndex, endIndex))
      // Update total pages based on regular videos only
      setTotalPages(Math.ceil(regularOnly.length / videosPerPage))
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (tab === 'videos') {
      setCurrentPage(1)
      updateDisplayedVideos()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatDuration = (duration: string | null) => {
    if (!duration) return null
    
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return null

    const hours = match[1] ? parseInt(match[1]) : 0
    const minutes = match[2] ? parseInt(match[2]) : 0
    const seconds = match[3] ? parseInt(match[3]) : 0

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const openVideo = (video: YouTubeVideo) => {
    if (video.isLive || video.isUpcoming) {
      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')
    } else {
      setSelectedVideo(video)
    }
  }

  // Check if currently live based on schedule
  const isCurrentlyLive = () => {
    const now = new Date()
    const day = now.getDay() // 0 = Sunday, 3 = Wednesday, 5 = Friday, 6 = Saturday
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = hours * 60 + minutes

    // Wednesday 6-7pm GMT+3 (15:00-16:00 UTC, but we're in GMT+3 so 18:00-19:00 local)
    if (day === 3) {
      const start = 18 * 60 // 6pm
      const end = 19 * 60 // 7pm
      return currentTime >= start && currentTime < end
    }

    // Friday 6-7pm GMT+3
    if (day === 5) {
      const start = 18 * 60
      const end = 19 * 60
      return currentTime >= start && currentTime < end
    }

    // Saturday 9am-12pm GMT+3
    if (day === 6) {
      const start = 9 * 60 // 9am
      const end = 12 * 60 // 12pm
      if (currentTime >= start && currentTime < end) return true
      
      // Saturday night 6-7pm GMT+3
      const nightStart = 18 * 60
      const nightEnd = 19 * 60
      return currentTime >= nightStart && currentTime < nightEnd
    }

    return false
  }

  const getNextLiveTime = () => {
    const now = new Date()
    const day = now.getDay()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = hours * 60 + minutes

    // Calculate next live time
    const daysUntilWednesday = (3 - day + 7) % 7
    const daysUntilFriday = (5 - day + 7) % 7
    const daysUntilSaturday = (6 - day + 7) % 7

    const nextTimes = []

    // Wednesday 6pm
    if (daysUntilWednesday === 0 && currentTime < 18 * 60) {
      nextTimes.push({ day: 'Wednesday', time: '6:00 PM', date: now })
    } else {
      const wedDate = new Date(now)
      wedDate.setDate(now.getDate() + daysUntilWednesday)
      nextTimes.push({ day: 'Wednesday', time: '6:00 PM', date: wedDate })
    }

    // Friday 6pm
    if (daysUntilFriday === 0 && currentTime < 18 * 60) {
      nextTimes.push({ day: 'Friday', time: '6:00 PM', date: now })
    } else {
      const friDate = new Date(now)
      friDate.setDate(now.getDate() + daysUntilFriday)
      nextTimes.push({ day: 'Friday', time: '6:00 PM', date: friDate })
    }

    // Saturday 9am
    if (daysUntilSaturday === 0 && currentTime < 9 * 60) {
      nextTimes.push({ day: 'Saturday', time: '9:00 AM', date: now })
    } else {
      const satDate = new Date(now)
      satDate.setDate(now.getDate() + daysUntilSaturday)
      nextTimes.push({ day: 'Saturday', time: '9:00 AM', date: satDate })
    }

    // Saturday 6pm
    if (daysUntilSaturday === 0 && currentTime < 18 * 60) {
      nextTimes.push({ day: 'Saturday', time: '6:00 PM', date: now })
    } else {
      const satDate = new Date(now)
      satDate.setDate(now.getDate() + daysUntilSaturday)
      nextTimes.push({ day: 'Saturday', time: '6:00 PM', date: satDate })
    }

    // Sort by date and return the next one
    nextTimes.sort((a, b) => a.date.getTime() - b.date.getTime())
    return nextTimes[0]
  }

  const liveVideos = allVideos.filter(v => v.isLive)
  const upcomingVideos = allVideos.filter(v => v.isUpcoming)
  const regularVideos = allVideos.filter(v => !v.isLive && !v.isUpcoming)
  const latestVideos = regularVideos.slice(0, 5) // Latest 5 videos for Live tab
  const hasLiveStream = liveVideos.length > 0 || isCurrentlyLive()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/" 
              className="flex items-center gap-3 text-gray-700 hover:text-primary-600 transition-colors group"
            >
              <FaArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <FaHome className="text-xl" />
              <span className="font-semibold hidden sm:inline">UEAB ODeL</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl shadow-xl">
              <FaYoutube className="text-5xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">Spiritual Corner</h1>
              <p className="text-xl md:text-2xl text-blue-100 font-medium mb-2">Hope Channel Baraton</p>
              <p className="text-lg text-blue-100 max-w-3xl">
                Inspiring Faith & Growth - Watch sermons, spiritual messages, and live broadcasts
              </p>
            </div>
          </div>
        </div>
        {/* Decorative waves */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-white">
            <path d="M0,0 C300,80 600,40 900,80 C1050,100 1150,60 1200,80 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('live')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'live'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <FaBroadcastTower className="text-lg" />
              <span>Live Stream</span>
              {hasLiveStream && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('videos')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'videos'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <FaVideo className="text-lg" />
              <span>All Videos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <FaSpinner className="animate-spin text-6xl text-primary-600 mb-4" />
            <p className="text-xl text-gray-600">Loading videos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <p className="text-red-800 text-lg mb-2 font-semibold">⚠️ {error}</p>
            <p className="text-red-600 text-sm mb-6">
              Please make sure the YouTube API key is configured in your environment variables.
            </p>
            <button
              onClick={() => fetchAllVideos()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Live Tab Content */}
            {activeTab === 'live' && (
              <div className="space-y-8">
                {/* Live Status Card */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 md:p-8 shadow-lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex-shrink-0">
                      {hasLiveStream ? (
                        <div className="bg-red-600 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg">
                          <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                          </span>
                          <span className="font-bold text-lg">LIVE NOW</span>
                        </div>
                      ) : (
                        <div className="bg-gray-400 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg">
                          <FaCheckCircle className="text-xl" />
                          <span className="font-bold text-lg">No Live Stream</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {hasLiveStream ? 'Join Us Live!' : 'Currently Offline'}
                      </h2>
                      <p className="text-gray-700 mb-4">
                        {hasLiveStream 
                          ? 'We are currently broadcasting live. Click below to watch on YouTube!'
                          : 'We are not currently live. Check our schedule below for upcoming broadcasts.'
                        }
                      </p>
                      {hasLiveStream && (
                        <a
                          href="https://www.youtube.com/@hopechannelbaraton"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
                        >
                          <FaPlay />
                          Watch Live on YouTube
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Schedule */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <FaCalendarAlt className="text-primary-600" />
                    Live Broadcast Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaBroadcastTower className="text-blue-600" />
                        <span className="font-bold text-gray-900">Wednesday</span>
                      </div>
                      <p className="text-gray-700">6:00 PM - 7:00 PM (GMT+3)</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaBroadcastTower className="text-purple-600" />
                        <span className="font-bold text-gray-900">Friday</span>
                      </div>
                      <p className="text-gray-700">6:00 PM - 7:00 PM (GMT+3)</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaBroadcastTower className="text-green-600" />
                        <span className="font-bold text-gray-900">Saturday Morning</span>
                      </div>
                      <p className="text-gray-700">9:00 AM - 12:00 PM (GMT+3)</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaBroadcastTower className="text-orange-600" />
                        <span className="font-bold text-gray-900">Saturday Evening</span>
                      </div>
                      <p className="text-gray-700">6:00 PM - 7:00 PM (GMT+3)</p>
                    </div>
                  </div>
                  {!hasLiveStream && (
                    <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <p className="text-primary-800 font-medium">
                        <FaClock className="inline mr-2" />
                        Next Live: {getNextLiveTime().day} at {getNextLiveTime().time} (GMT+3)
                      </p>
                    </div>
                  )}
                </div>

                {/* Live Streams from YouTube */}
                {liveVideos.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      Currently Streaming
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {liveVideos.map((video) => (
                        <div
                          key={video.id}
                          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group border-2 border-red-200"
                          onClick={() => openVideo(video)}
                        >
                          <div className="relative">
                            <Image
                              src={video.thumbnail}
                              alt={video.title}
                              width={640}
                              height={360}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                              <div className="bg-red-600 text-white px-5 py-3 rounded-full flex items-center gap-2 font-bold shadow-lg">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                                LIVE
                              </div>
                            </div>
                            {video.liveViewers && (
                              <div className="absolute bottom-2 left-2 bg-black/80 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                                <FaUsers className="text-xs" />
                                <span>{video.liveViewers.toLocaleString()} watching</span>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/90 rounded-full p-5 shadow-xl">
                                <FaPlay className="text-primary-600 text-3xl ml-1" />
                              </div>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900">{video.title}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <FaCalendarAlt />
                              Started {formatDate(video.actualStartTime || video.publishedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Streams */}
                {upcomingVideos.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <FaClock className="text-yellow-500" />
                      Upcoming Broadcasts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingVideos.map((video) => (
                        <div
                          key={video.id}
                          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group border-2 border-yellow-200"
                          onClick={() => openVideo(video)}
                        >
                          <div className="relative">
                            <Image
                              src={video.thumbnail}
                              alt={video.title}
                              width={640}
                              height={360}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                              <div className="bg-yellow-500 text-white px-5 py-3 rounded-full font-bold shadow-lg">
                                UPCOMING
                              </div>
                            </div>
                            {video.scheduledStartTime && (
                              <div className="absolute bottom-2 left-2 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                                <FaClock className="inline mr-1" />
                                {new Date(video.scheduledStartTime).toLocaleString()}
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/90 rounded-full p-5 shadow-xl">
                                <FaPlay className="text-primary-600 text-3xl ml-1" />
                              </div>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900">{video.title}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <FaCalendarAlt />
                              {video.scheduledStartTime ? formatDate(video.scheduledStartTime) : formatDate(video.publishedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest Videos Section */}
                {latestVideos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FaVideo className="text-primary-600" />
                        Latest Videos
                      </h3>
                      <button
                        onClick={() => handleTabChange('videos')}
                        className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 transition-colors"
                      >
                        View All Videos
                        <FaChevronRight className="text-sm" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                      {latestVideos.map((video) => (
                        <div
                          key={video.id}
                          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                          onClick={() => openVideo(video)}
                        >
                          <div className="relative">
                            <Image
                              src={video.thumbnail}
                              alt={video.title}
                              width={640}
                              height={360}
                              className="w-full h-48 object-cover"
                            />
                            {video.duration && (
                              <div className="absolute bottom-2 right-2 bg-black/90 text-white px-2 py-1 rounded text-xs font-medium">
                                {formatDuration(video.duration)}
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                              <div className="bg-white/90 rounded-full p-4 shadow-xl">
                                <FaPlay className="text-primary-600 text-2xl ml-1" />
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-base mb-2 line-clamp-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                              {video.title}
                            </h3>
                            <p className="text-xs text-gray-600 flex items-center gap-2">
                              <FaCalendarAlt />
                              {formatDate(video.publishedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Videos Tab Content */}
            {activeTab === 'videos' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">All Videos</h2>
                  <p className="text-gray-600">{regularVideos.length} videos available</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {displayedVideos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                      onClick={() => openVideo(video)}
                    >
                      <div className="relative">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          width={640}
                          height={360}
                          className="w-full h-48 object-cover"
                        />
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/90 text-white px-2 py-1 rounded text-xs font-medium">
                            {formatDuration(video.duration)}
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <div className="bg-white/90 rounded-full p-4 shadow-xl">
                            <FaPlay className="text-primary-600 text-2xl ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FaCalendarAlt />
                          {formatDate(video.publishedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      <FaChevronLeft />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 7) {
                          pageNum = i + 1
                        } else if (currentPage <= 4) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 6 + i
                        } else {
                          pageNum = currentPage - 3 + i
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      Next
                      <FaChevronRight />
                    </button>
                  </div>
                )}

                {/* Page Info */}
                <div className="text-center mt-4 text-gray-600">
                  <p>
                    Showing {((currentPage - 1) * videosPerPage) + 1} - {Math.min(currentPage * videosPerPage, regularVideos.length)} of {regularVideos.length} videos
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="bg-white rounded-xl max-w-5xl w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 pr-4">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-light transition-colors flex-shrink-0"
              >
                ×
              </button>
            </div>
            <div className="aspect-video mb-4 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <FaCalendarAlt />
              <span>{formatDate(selectedVideo.publishedAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

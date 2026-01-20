import { NextRequest, NextResponse } from 'next/server'

/**
 * YouTube API Route for Spiritual Corner
 * 
 * Requires YOUTUBE_API_KEY in environment variables.
 * Get your API key from: https://console.cloud.google.com/
 * 
 * See YOUTUBE_API_SETUP.md for detailed setup instructions.
 */
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_CHANNEL_HANDLE = '@hopechannelbaraton'

// Cache for channel ID (doesn't change often)
let cachedChannelId: string | null = null

// Get channel ID from handle
async function getChannelId(): Promise<string | null> {
  if (cachedChannelId) return cachedChannelId

  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️ YouTube API key not configured')
    return null
  }

  try {
    // Try to get channel by handle first
    const handleResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(YOUTUBE_CHANNEL_HANDLE)}&type=channel&key=${YOUTUBE_API_KEY}`
    )

    if (!handleResponse.ok) {
      throw new Error(`YouTube API error: ${handleResponse.statusText}`)
    }

    const handleData = await handleResponse.json()
    
    if (handleData.items && handleData.items.length > 0) {
      cachedChannelId = handleData.items[0].snippet.channelId
      return cachedChannelId
    }

    // Fallback: try direct channel lookup
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${YOUTUBE_CHANNEL_HANDLE.replace('@', '')}&key=${YOUTUBE_API_KEY}`
    )

    if (channelResponse.ok) {
      const channelData = await channelResponse.json()
      if (channelData.items && channelData.items.length > 0) {
        cachedChannelId = channelData.items[0].id
        return cachedChannelId
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching channel ID:', error)
    return null
  }
}

// Fetch videos from channel
async function fetchChannelVideos(channelId: string, maxResults: number = 50) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured')
  }

  try {
    // Get uploads playlist ID
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    )

    if (!channelResponse.ok) {
      throw new Error(`YouTube API error: ${channelResponse.statusText}`)
    }

    const channelData = await channelResponse.json()
    
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('Channel not found')
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads

    if (!uploadsPlaylistId) {
      throw new Error('Uploads playlist not found')
    }

    // Get videos from uploads playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&order=date&key=${YOUTUBE_API_KEY}`
    )

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.statusText}`)
    }

    const videosData = await videosResponse.json()

    // Get detailed video information including live status
    const videoIds = videosData.items.map((item: any) => item.contentDetails.videoId).join(',')
    
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status,liveStreamingDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )

    if (!detailsResponse.ok) {
      throw new Error(`YouTube API error: ${detailsResponse.statusText}`)
    }

    const detailsData = await detailsResponse.json()

    // Combine and format video data
    const videos = detailsData.items.map((video: any) => {
      const isLive = video.snippet.liveBroadcastContent === 'live'
      const isUpcoming = video.snippet.liveBroadcastContent === 'upcoming'
      
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
        publishedAt: video.snippet.publishedAt,
        channelTitle: video.snippet.channelTitle,
        videoId: video.id,
        duration: video.contentDetails?.duration || null,
        isLive,
        isUpcoming,
        liveViewers: isLive ? video.liveStreamingDetails?.concurrentViewers : null,
        scheduledStartTime: isUpcoming ? video.liveStreamingDetails?.scheduledStartTime : null,
        actualStartTime: isLive ? video.liveStreamingDetails?.actualStartTime : null,
      }
    })

    // Sort: live streams first, then by published date (newest first)
    videos.sort((a: any, b: any) => {
      if (a.isLive && !b.isLive) return -1
      if (!a.isLive && b.isLive) return 1
      if (a.isUpcoming && !b.isUpcoming) return -1
      if (!a.isUpcoming && b.isUpcoming) return 1
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })

    return videos
  } catch (error) {
    console.error('Error fetching videos:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const maxResults = parseInt(searchParams.get('maxResults') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * maxResults

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'YouTube API key not configured',
          videos: []
        },
        { status: 500 }
      )
    }

    // Get channel ID
    const channelId = await getChannelId()
    
    if (!channelId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Channel not found',
          videos: []
        },
        { status: 404 }
      )
    }

    // Fetch more videos than needed to support pagination
    // YouTube API has a limit, so we'll fetch up to 200 and paginate client-side
    const fetchLimit = Math.min(maxResults * 3, 200) // Fetch 3 pages worth or max 200
    const allVideos = await fetchChannelVideos(channelId, fetchLimit)

    // Apply pagination
    const paginatedVideos = allVideos.slice(offset, offset + maxResults)
    const totalVideos = allVideos.length
    const totalPages = Math.ceil(totalVideos / maxResults)
    const hasNextPage = offset + maxResults < totalVideos
    const hasPrevPage = page > 1

    return NextResponse.json(
      { 
        success: true, 
        videos: paginatedVideos,
        count: paginatedVideos.length,
        totalCount: totalVideos,
        page,
        totalPages,
        hasNextPage,
        hasPrevPage,
        channelId
      },
      { 
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    )
  } catch (error: any) {
    console.error('YouTube API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch videos',
        videos: []
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { moodleService } from '@/lib/moodle'

// Get Moodle forum announcements for a user's courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get user's enrolled courses
    const userCourses = await moodleService.getUserCourses(parseInt(userId))
    
    // Fetch forum discussions from each course
    const announcements: any[] = []
    
    for (const course of userCourses) {
      try {
        // Get course contents which include forums
        const courseContents = await moodleService.getCourseContents(course.id)
        
        // Find all forums in the course
        const forums: any[] = []
        for (const section of courseContents) {
          if (section.modules) {
            for (const module of section.modules) {
              if (module.modname === 'forum' && module.visible === 1) {
                // Get the actual forum instance ID from module URL or ID
                const forumInstanceId = module.instance || module.id || module.url?.split('/mod/forum/view.php?id=')[1]
                if (forumInstanceId) {
                  forums.push({
                    id: forumInstanceId,
                    name: module.name,
                    type: module.visibleoncoursepage === 0 ? 'news' : 'general'
                  })
                }
              }
            }
          }
        }
        
        // Get discussions from each forum (especially announcement forums)
        for (const forum of forums) {
          try {
            // Get discussions for this forum using the forum instance ID
            // The API needs the forum instance ID, not course ID
            const discussions = await moodleService.getForumDiscussions(parseInt(forum.id))
            
            // Transform discussions into announcements format
            for (const discussion of discussions) {
              // Extract text content from message (remove HTML tags for description)
              const messageText = discussion.message 
                ? discussion.message.replace(/<[^>]*>/g, '').substring(0, 200)
                : ''
              
              announcements.push({
                id: `moodle_${discussion.id}`,
                moodle_post_id: discussion.id,
                moodle_forum_id: forum.id,
                title: discussion.name || discussion.subject || 'Announcement',
                description: messageText || 'No description available',
                content: discussion.message || '',
                category: 'academic',
                source: 'moodle',
                course_name: course.fullname || course.shortname,
                course_id: course.id,
                author_name: discussion.userfullname || discussion.author?.fullname || 'Instructor',
                created_at: new Date((discussion.created || discussion.timestart || Date.now() / 1000) * 1000).toISOString(),
                published_at: new Date((discussion.timemodified || discussion.created || Date.now() / 1000) * 1000).toISOString(),
                is_pinned: discussion.pinned === 1 || discussion.sticky === 1 || false,
                is_published: true,
                featured_image_url: null,
              })
            }
          } catch (forumError) {
            console.error(`Error fetching forum ${forum.id} discussions:`, forumError)
            // Continue with other forums
          }
        }
      } catch (error) {
        console.error(`Error fetching announcements for course ${course.id}:`, error)
        // Continue with other courses
      }
    }

    // Sort by published date (newest first)
    announcements.sort((a, b) => {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    })

    return NextResponse.json({
      success: true,
      data: announcements,
      count: announcements.length
    })
  } catch (error: any) {
    console.error('Error fetching Moodle announcements:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


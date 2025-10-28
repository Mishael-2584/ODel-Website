import { NextRequest, NextResponse } from 'next/server'

function toJson(res: Response) { return res.json().catch(() => ({})) }

async function fetchJson(url: string) {
  try { const r = await fetch(url, { cache: 'no-store' }); return await toJson(r) } catch { return {} }
}

export async function POST(req: NextRequest) {
  try {
    const { message, user, emailOnly } = await req.json()
    const lower = (message || '').toLowerCase()
    const origin = new URL(req.url).origin

    // Quick intents
    const isAdmissions = /admission|apply|register|icampus/.test(lower)
    const isPrograms = /programs|courses|catalog/.test(lower)
    const isEvents = /event|calendar/.test(lower)
    const isNews = /news|update/.test(lower)
    const isDeadlines = /deadline|assignment|due/.test(lower)
    const isGrades = /grade|report/.test(lower)
    const isContact = /contact|phone|email|map|location/.test(lower)

    // Logged-in personalization supplied by caller (session)
    const moodleUserId = user?.moodleUserId

    if (isAdmissions) {
      return NextResponse.json({
        type: 'links',
        data: {
          title: 'Admissions & Registration',
          text: 'Use iCampus to register. Your account syncs here automatically after registration.',
          links: [
            { label: 'iCampus Registration', url: 'http://icampus.ueab.ac.ke/iUserLog/Register' },
            { label: 'Programs', url: '/courses' }
          ]
        }
      })
    }

    if (isPrograms) {
      const programs = await fetchJson(`${origin}/api/smart-courses/programs`)
      return NextResponse.json({
        type: 'links',
        data: {
          title: 'Programs & Courses',
          text: 'Here are our programs. You can browse all courses and apply online.',
          links: [{ label: 'Browse Courses', url: '/courses' }],
          items: programs?.data?.slice?.(0, 6) || []
        }
      })
    }

    if (isEvents) {
      const events = await fetchJson(`${origin}/api/events/published`)
      return NextResponse.json({ type: 'links', data: { title: 'Upcoming Events', links: [{ label: 'Events Calendar', url: '/events' }], items: events?.data || [] } })
    }

    if (isNews) {
      const news = await fetchJson(`${origin}/api/news/published`)
      return NextResponse.json({ type: 'links', data: { title: 'Latest News', links: [{ label: 'News & Updates', url: '/news' }], items: news?.data || [] } })
    }

    if (isDeadlines && moodleUserId) {
      const deadlines = await fetchJson(`${origin}/api/moodle?action=assignments&userId=${moodleUserId}`)
      return NextResponse.json({ type: 'personal', data: { title: 'Your Upcoming Deadlines', items: deadlines?.data || [] } })
    }

    if (isGrades && moodleUserId) {
      const grades = await fetchJson(`${origin}/api/moodle?action=user-grades&userId=${moodleUserId}`)
      return NextResponse.json({ type: 'personal', data: { title: 'Your Grades', items: grades?.data || [] } })
    }

    if (isContact) {
      return NextResponse.json({
        type: 'links',
        data: {
          title: 'Contact UEAB ODeL',
          text: 'Reach out to us via phone or email, or view our campus on the map.',
          links: [
            { label: 'Contact Page', url: '/contact' },
            { label: 'Email ITS', url: 'mailto:odel@ueab.ac.ke' }
          ]
        }
      })
    }

    // Email-only lookup flow for registered users not logged in
    if (emailOnly) {
      const userRes = await fetchJson(`${origin}/api/moodle?action=user-by-email&email=${encodeURIComponent(emailOnly)}`)
      return NextResponse.json({ type: 'user-lookup', data: userRes?.data || null })
    }

    // Default fallback: suggest ticket creation
    return NextResponse.json({
      type: 'fallback',
      data: {
        title: "I couldn't find that.",
        text: 'I can connect you with support. Would you like me to create a helpdesk ticket for you?'
      }
    })
  } catch (e) {
    console.error('CRANE answer error', e)
    return NextResponse.json({ type: 'error', error: 'Failed to process request' }, { status: 500 })
  }
}

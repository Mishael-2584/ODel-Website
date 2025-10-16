import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_ZAMMAD_URL
    const apiToken = process.env.ZAMMAD_API_TOKEN

    if (!baseUrl || !apiToken) {
      return NextResponse.json({
        error: 'Missing Zammad configuration',
        message: 'Please check your environment variables'
      }, { status: 400 })
    }

    // Get all groups
    const groupsResponse = await fetch(`${baseUrl}/api/v1/groups`, {
      headers: {
        'Authorization': `Token token=${apiToken}`
      }
    })

    if (!groupsResponse.ok) {
      return NextResponse.json({
        error: `Failed to fetch groups: ${groupsResponse.status}`,
        message: 'Check your API token permissions'
      }, { status: groupsResponse.status })
    }

    const groups = await groupsResponse.json()

    // Get all priorities
    const prioritiesResponse = await fetch(`${baseUrl}/api/v1/ticket_priorities`, {
      headers: {
        'Authorization': `Token token=${apiToken}`
      }
    })

    let priorities = []
    if (prioritiesResponse.ok) {
      priorities = await prioritiesResponse.json()
    }

    // Get all states
    const statesResponse = await fetch(`${baseUrl}/api/v1/ticket_states`, {
      headers: {
        'Authorization': `Token token=${apiToken}`
      }
    })

    let states = []
    if (statesResponse.ok) {
      states = await statesResponse.json()
    }

    return NextResponse.json({
      success: true,
      groups: groups.map((group: any) => ({
        id: group.id,
        name: group.name,
        active: group.active,
        email: group.email
      })),
      priorities: priorities.map((priority: any) => ({
        id: priority.id,
        name: priority.name,
        active: priority.active
      })),
      states: states.map((state: any) => ({
        id: state.id,
        name: state.name,
        active: state.active
      })),
      recommendations: {
        suggestedGroupId: groups.find((g: any) => g.active && g.name.toLowerCase().includes('support'))?.id || groups[0]?.id,
        suggestedPriorityId: priorities.find((p: any) => p.active && p.name.toLowerCase().includes('normal'))?.id || priorities[0]?.id,
        suggestedStateId: states.find((s: any) => s.active && s.name.toLowerCase().includes('new'))?.id || states[0]?.id
      }
    })

  } catch (error) {
    console.error('Error fetching Zammad configuration:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch Zammad configuration'
    }, { status: 500 })
  }
}

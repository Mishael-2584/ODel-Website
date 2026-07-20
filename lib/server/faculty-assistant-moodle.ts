interface MoodleResponseError {
  exception?: string
  errorcode?: string
  message?: string
}

export async function getFacultyAssistantTeachingCourses(userId: number) {
  const result = await callMoodleConnector(
    'local_facultyassistant_get_teaching_courses',
    { userid: String(userId) },
  )
  return Array.isArray(result) ? result : []
}

async function callMoodleConnector(
  wsfunction: string,
  values: Record<string, string>,
) {
  const baseUrl = process.env.NEXT_PUBLIC_MOODLE_URL
  const token =
    process.env.FACULTY_ASSISTANT_MOODLE_TOKEN || process.env.MOODLE_API_TOKEN
  if (!baseUrl || !token) throw new Error('Moodle integration is not configured')

  const body = new URLSearchParams({
    wstoken: token,
    wsfunction,
    moodlewsrestformat: 'json',
    ...values,
  })
  const response = await fetch(`${baseUrl}/webservice/rest/server.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Moodle returned HTTP ${response.status}`)
  const result = (await response.json()) as MoodleResponseError | unknown
  if (
    result &&
    typeof result === 'object' &&
    ('exception' in result || 'errorcode' in result)
  ) {
    const error = result as MoodleResponseError
    throw new Error(error.message || error.errorcode || 'Moodle rejected the request')
  }
  return result
}

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

export async function getFacultyAssistantUserByEmail(email: string) {
  const result = await callMoodleConnector(
    'local_facultyassistant_get_user_by_email',
    { email },
  )
  if (!result || typeof result !== 'object') {
    throw new Error('Moodle returned an invalid user lookup response')
  }
  const user = result as Record<string, unknown>
  const id = Number(user.id)
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Moodle returned an invalid user identifier')
  }
  return {
    id,
    email: String(user.email || '').trim().toLowerCase(),
    username: String(user.username || '').trim(),
    fullname: String(user.fullname || '').trim(),
  }
}

export async function getFacultyAssistantQuestionCategories(
  userId: number,
  courseId: number,
) {
  const result = await callMoodleConnector(
    'local_facultyassistant_get_question_categories',
    { userid: String(userId), courseid: String(courseId) },
  )
  return Array.isArray(result) ? result : []
}

export async function getFacultyAssistantCourseGrades(
  userId: number,
  courseId: number,
) {
  const result = await callMoodleConnector(
    'local_facultyassistant_get_course_grades',
    { userid: String(userId), courseid: String(courseId) },
  )
  if (!result || typeof result !== 'object' || !('payloadjson' in result)) {
    throw new Error('Moodle returned an invalid grade sync response')
  }
  const payload = JSON.parse(String((result as { payloadjson: unknown }).payloadjson)) as {
    courseid?: unknown
    syncedat?: unknown
    items?: unknown
    students?: unknown
  }
  if (Number(payload.courseid) !== courseId || !Array.isArray(payload.items) || !Array.isArray(payload.students)) {
    throw new Error('Moodle grade sync response did not match the requested course')
  }
  if (payload.items.length > 500 || payload.students.length > 5000) {
    throw new Error('Moodle grade sync response exceeded the supported limits')
  }
  const syncedAt = Number(payload.syncedat)
  if (!Number.isFinite(syncedAt) || syncedAt <= 0) {
    throw new Error('Moodle returned an invalid grade sync timestamp')
  }

  const rawItems = payload.items.map((value) => normalizeGradeItem(value))
  if (rawItems.some((item) => !item)) {
    throw new Error('Moodle returned invalid grade item metadata')
  }
  const items = rawItems as MoodleGradeItem[]
  const nameCounts = new Map<string, number>()
  for (const item of items) {
    nameCounts.set(item.name, (nameCounts.get(item.name) || 0) + 1)
  }
  const columns = items.map((item) => ({
    ...item,
    column: gradeColumnName(item, nameCounts.get(item.name) || 0),
  }))
  const columnByItem = new Map(columns.map((item) => [item.itemId, item.column]))
  let missingStudentIds = 0
  const rows = payload.students.map((value) => {
    const student = normalizeGradeStudent(value)
    if (!student.studentId) missingStudentIds += 1
    const row: Record<string, string | number | null> = {
      'ID number': student.studentId,
      'First name': student.firstName,
      'Last name': student.lastName,
      'Full name': student.fullName,
      'Email address': student.email,
    }
    for (const grade of student.grades) {
      const column = columnByItem.get(grade.itemId)
      if (column) row[column] = grade.excluded ? null : grade.finalGrade
    }
    for (const column of columns) {
      if (!(column.column in row)) row[column.column] = null
    }
    return row
  })

  return {
    courseId,
    syncedAt: new Date(syncedAt * 1000).toISOString(),
    columns,
    rows,
    warnings: { missingStudentIds },
  }
}

export async function createFacultyAssistantQuestionCategory(options: {
  userId: number
  courseId: number
  name: string
}) {
  const result = await callMoodleConnector('local_facultyassistant_create_question_category', {
    userid: String(options.userId),
    courseid: String(options.courseId),
    name: options.name,
  })
  if (!result || typeof result !== 'object') {
    throw new Error('Moodle returned an invalid question category')
  }
  return result as {
    id: number
    name: string
    questioncount: number
    created: boolean
  }
}

export async function importFacultyAssistantGiftQuestions(options: {
  userId: number
  courseId: number
  categoryId: number
  gift: string
}) {
  return callMoodleConnector('local_facultyassistant_import_gift_questions', {
    userid: String(options.userId),
    courseid: String(options.courseId),
    categoryid: String(options.categoryId),
    gift: options.gift,
  })
}

export async function importFacultyAssistantQuestions(options: {
  userId: number
  courseId: number
  categoryId: number
  format: 'gift' | 'xml'
  content: string
}) {
  return callMoodleConnector('local_facultyassistant_import_questions', {
    userid: String(options.userId),
    courseid: String(options.courseId),
    categoryid: String(options.categoryId),
    format: options.format,
    content: options.content,
  })
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

type MoodleGradeItem = {
  itemId: number
  name: string
  itemType: string
  itemModule: string
  minimum: number
  maximum: number
  hidden: boolean
}

function normalizeGradeItem(value: unknown): MoodleGradeItem | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  const itemId = Number(item.id)
  const minimum = Number(item.minimum)
  const maximum = Number(item.maximum)
  if (
    !Number.isSafeInteger(itemId) || itemId <= 0 ||
    !Number.isFinite(minimum) || !Number.isFinite(maximum) || maximum <= minimum
  ) return null
  return {
    itemId,
    name: String(item.name || `Grade item ${itemId}`).trim().slice(0, 180),
    itemType: String(item.itemtype || '').slice(0, 30),
    itemModule: String(item.itemmodule || '').slice(0, 40),
    minimum,
    maximum,
    hidden: Boolean(item.hidden),
  }
}

function normalizeGradeStudent(value: unknown) {
  const student = value && typeof value === 'object'
    ? value as Record<string, unknown>
    : {}
  const grades = Array.isArray(student.grades) ? student.grades : []
  return {
    studentId: String(student.idnumber || '').trim().slice(0, 120),
    firstName: String(student.firstname || '').trim().slice(0, 160),
    lastName: String(student.lastname || '').trim().slice(0, 160),
    fullName: String(student.fullname || '').trim().slice(0, 320),
    email: String(student.email || '').trim().slice(0, 320),
    grades: grades.map((value) => {
      const grade = value && typeof value === 'object'
        ? value as Record<string, unknown>
        : {}
      const finalGrade = grade.finalgrade === null || grade.finalgrade === undefined
        ? null
        : Number(grade.finalgrade)
      return {
        itemId: Number(grade.itemid),
        finalGrade: finalGrade !== null && Number.isFinite(finalGrade) ? finalGrade : null,
        excluded: Boolean(grade.excluded),
      }
    }).filter((grade) => Number.isSafeInteger(grade.itemId) && grade.itemId > 0),
  }
}

function gradeColumnName(item: MoodleGradeItem, duplicateCount: number) {
  const identityNames = new Set(['id number', 'first name', 'last name', 'full name', 'email address'])
  const base = identityNames.has(item.name.toLowerCase()) ? `Grade: ${item.name}` : item.name
  return duplicateCount > 1 ? `${base} (Moodle #${item.itemId})` : base
}

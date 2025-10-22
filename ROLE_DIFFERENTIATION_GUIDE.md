# Role Differentiation System - Complete Guide

## Overview
The UEAB ODeL Platform now supports **automatic role detection** from Moodle, allowing the system to differentiate between students, instructors, and other users. Roles are detected during login and displayed in the navbar with visual badges.

---

## Architecture

### 1. Role Detection Flow

```
User Login
    ↓
Send Code (verify email in Moodle)
    ↓
Verify Code
    ↓
Fetch user roles from Moodle ← NEW
    ↓
Generate JWT token with roles ← NEW
    ↓
Store session with roles ← NEW
    ↓
Redirect to dashboard
    ↓
Display roles in navbar ← NEW
```

### 2. Role Detection from Moodle

**File:** `lib/moodle.ts`

**New Function:** `getUserRoles(userId: number): Promise<string[]>`

**Logic:**
```typescript
1. Start with ['student'] as default role
2. Fetch user's courses using core_user_get_courses
3. For each course, check if user has instructor role:
   - Role IDs 3, 4, 5, 6 indicate instructor/teacher
4. If any instructor role found:
   - Add 'instructor' to roles array
   - Stop searching (optimization)
5. Return unique roles: ['student'] or ['student', 'instructor']
```

**Instructor Role IDs (Moodle Standard):**
- `3` = Teacher
- `4` = Editing Teacher
- `5` = Non-editing Teacher
- `6` = Manager (could be instructor)

**Example Response:**
```javascript
// Student with no teaching role
['student']

// Instructor teaching courses
['student', 'instructor']
```

### 3. Teaching Courses Function

**Function:** `getUserTeachingCourses(userId: number): Promise<any[]>`

**Purpose:** Returns only courses where user is the instructor (for future "My Classes" feature)

**Returns:**
```javascript
[
  {
    id: 11394,
    fullname: 'MUSIC THEORY IV',
    shortname: 'MUTH201',
    roles: [{ roleid: 4, name: 'Editingteacher' }],
    ...
  }
]
```

---

## Session & Token Management

### JWT Token Structure

**Before (student-only):**
```json
{
  "email": "student@ueab.ac.ke",
  "moodleUserId": 4487,
  "moodleUsername": "smorsa2021",
  "studentName": "SAFARI HARRIET",
  "type": "student"
}
```

**After (with roles):**
```json
{
  "email": "student@ueab.ac.ke",
  "moodleUserId": 4487,
  "moodleUsername": "smorsa2021",
  "studentName": "SAFARI HARRIET",
  "roles": ["student", "instructor"],
  "type": "student"
}
```

### Session Creation Flow

**File:** `lib/passwordless-auth.ts`

**Function:** `createStudentSession()`

**Changes:**
```typescript
1. Fetch user by ID (name, email, username)
2. Fetch user roles from Moodle ← NEW
3. Log roles to console for debugging
4. Generate JWT with roles included ← NEW
5. Save session to database
6. Return JWT token
```

**Console Output Example:**
```
📋 User roles for smorsa2021: ["student", "instructor"]
```

---

## UI Display - Navbar

### Role Badge Display

**File:** `components/Navbar.tsx`

**Features:**
- ✅ Shows all user roles as color-coded badges
- ✅ Displays below user name/email
- ✅ Responsive on both desktop and mobile
- ✅ Different colors for different roles

### Badge Styling

| Role | Background | Text | Border | Icon |
|------|-----------|------|--------|------|
| `student` | bg-blue-100 | text-blue-800 | border-blue-300 | 👨‍🎓 |
| `instructor` | bg-purple-100 | text-purple-800 | border-purple-300 | 👨‍🏫 |
| `teacher` | bg-purple-100 | text-purple-800 | border-purple-300 | 👨‍🏫 |
| `admin` | bg-red-100 | text-red-800 | border-red-300 | 🔐 |

### Desktop Display
```
┌─────────────────────────────────┐
│ 👤 SAFARI HARRIET               │
│    student@ueab.ac.ke           │
│    [Student] [Instructor]       │  ← Role badges
│                                 │
│    [Logout]                     │
└─────────────────────────────────┘
```

### Mobile Display
```
┌─────────────────────────────────┐
│ 👤 SAFARI HARRIET               │
│    student@ueab.ac.ke           │
│    [Student]                    │
│    [Instructor]                 │
│                                 │
│    [Logout]                     │
└─────────────────────────────────┘
```

---

## Data Interfaces

### StudentUser Interface

**File:** `components/Navbar.tsx`

```typescript
interface StudentUser {
  email: string
  studentName: string
  moodleUsername: string
  moodleUserId: number
  roles?: string[]              // ← NEW
}
```

### StudentData Interface

**File:** `app/student/dashboard/page.tsx`

```typescript
interface StudentData {
  email: string
  studentName: string
  moodleUsername: string
  moodleUserId: number
  roles?: string[]              // ← NEW
}
```

---

## Implementation Details

### Step 1: Detect Roles (Moodle Service)

**File:** `lib/moodle.ts` (lines 1045-1106)

```typescript
async getUserRoles(userId: number): Promise<string[]> {
  const roles = ['student'] // Default
  
  // Fetch user's courses
  const coursesResult = await fetch(...)
  
  // Check each course for instructor role
  for (const course of coursesResult.courses) {
    if (hasInstructorRole(course.roles)) {
      roles.push('instructor')
      break
    }
  }
  
  return [...new Set(roles)]
}
```

### Step 2: Include Roles in JWT

**File:** `lib/passwordless-auth.ts` (lines 20-37)

```typescript
export function generateJWTToken(data: {
  email: string
  moodleUserId: number
  moodleUsername: string
  studentName: string
  roles?: string[]              // ← NEW parameter
}): string {
  return jwt.sign(
    {
      ...data,
      roles: data.roles || ['student'],  // ← NEW field
      type: 'student'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )
}
```

### Step 3: Fetch Roles During Session Creation

**File:** `lib/passwordless-auth.ts` (lines 188-241)

```typescript
export async function createStudentSession(...) {
  // Get user data
  const userResponse = await moodleService.getUserById(moodleUserId)
  
  // ← NEW: Fetch roles
  const userRoles = await moodleService.getUserRoles(moodleUserId)
  console.log(`📋 User roles for ${userResponse.username}:`, userRoles)
  
  // Generate token with roles
  const jwtToken = generateJWTToken({
    ...data,
    roles: userRoles  // ← NEW
  })
  
  // Save to database
  const { data, error } = await supabase
    .from('student_sessions')
    .insert({...})
}
```

### Step 4: Display Roles in Navbar

**File:** `components/Navbar.tsx` (lines 64-107)

```typescript
// Helper functions
const getRoleBadgeStyle = (role: string) => {
  const styles: { [key: string]: string } = {
    'student': 'bg-blue-100 text-blue-800 border border-blue-300',
    'instructor': 'bg-purple-100 text-purple-800 border border-purple-300',
    'admin': 'bg-red-100 text-red-800 border border-red-300',
  }
  return styles[role] || 'bg-gray-100 text-gray-800 border border-gray-300'
}

const getRoleBadgeLabel = (role: string) => {
  const labels: { [key: string]: string } = {
    'student': 'Student',
    'instructor': 'Instructor',
    'admin': 'Admin',
  }
  return labels[role] || role.charAt(0).toUpperCase() + role.slice(1)
}

// In render:
{studentData.roles && studentData.roles.length > 0 && (
  <div className="flex items-center gap-1 mt-1">
    {studentData.roles.map((role) => (
      <span
        key={role}
        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeStyle(role)}`}
      >
        {getRoleBadgeLabel(role)}
      </span>
    ))}
  </div>
)}
```

---

## Usage Examples

### Example 1: Login as Student (No Teaching Role)

**Console Output:**
```
📋 User roles for student123: ["student"]
```

**Navbar Display:**
```
👤 John Student
   john@ueab.ac.ke
   [Student]
   [Logout]
```

### Example 2: Login as Instructor (Teaching Courses)

**Console Output:**
```
📋 User roles for prof_smith: ["student", "instructor"]
```

**Navbar Display:**
```
👤 Prof. Smith
   prof.smith@ueab.ac.ke
   [Student] [Instructor]
   [Logout]
```

---

## Future Enhancements

### 1. Role-Based Dashboard
```typescript
if (studentData.roles.includes('instructor')) {
  // Show instructor dashboard with:
  // - List of teaching courses
  // - Student submissions
  // - Grade management
  // - Class analytics
} else {
  // Show student dashboard with:
  // - Enrolled courses
  // - Grades
  // - Assignments
}
```

### 2. Role-Based Navigation
```typescript
// Add instructor-specific links
if (studentData.roles.includes('instructor')) {
  navLinks.push(
    { href: '/instructor/classes', label: 'My Classes' },
    { href: '/instructor/submissions', label: 'Submissions' },
    { href: '/instructor/grades', label: 'Gradebook' }
  )
}
```

### 3. Permission Middleware
```typescript
// Protect instructor-only routes
export function requireInstructor(roles?: string[]) {
  return roles?.includes('instructor') || false
}
```

### 4. Admin Detection
```typescript
// Check Moodle admin status
async getIsAdmin(userId: number): Promise<boolean> {
  // Check if user has admin role in Moodle
  // (Currently not implemented - would need separate API call)
}
```

---

## Database Schema

### Current Tables
- `magic_codes` - Temporary login codes
- `student_sessions` - Active sessions with JWT tokens
- *(Roles currently stored only in JWT token, not in separate table)*

### Future Enhancement
```sql
-- Optional: Store role history for audit trails
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id INT NOT NULL,
  roles TEXT[] NOT NULL,
  detected_at TIMESTAMP DEFAULT NOW(),
  source TEXT DEFAULT 'moodle'
);
```

---

## Testing Checklist

### ✅ Role Detection
- [ ] Student (no teaching role) → `['student']`
- [ ] Instructor (teaching courses) → `['student', 'instructor']`
- [ ] Role detection works after login
- [ ] Roles appear in console output with 📋 emoji

### ✅ Navbar Display
- [ ] Desktop: Badges display below user name
- [ ] Mobile: Badges wrap correctly
- [ ] Colors match role type
- [ ] Labels are readable

### ✅ Session Management
- [ ] Roles persist across page reloads
- [ ] Roles accessible in student dashboard
- [ ] JWT token contains roles
- [ ] Roles still present after logout/login

### ✅ Edge Cases
- [ ] User with no roles → defaults to `['student']`
- [ ] User with multiple roles → all displayed
- [ ] Role API error → gracefully falls back to `['student']`

---

## Performance Impact

| Operation | Time | Notes |
|-----------|------|-------|
| Detect roles | ~200-500ms | Fetches user's courses from Moodle |
| Display roles | <1ms | Just badge rendering |
| Session creation | +200-500ms | Additional Moodle API call |
| Overall login time | +200-500ms | Minimal impact on UX |

---

## Troubleshooting

### Roles Not Showing in Navbar
1. Check browser console for 📋 emoji logs
2. Verify `/api/auth/verify` returns roles in JWT
3. Ensure Moodle API token has course access
4. Check Moodle user is enrolled in courses

### Role Detection Returns Only "Student"
1. User might not have any instructor roles in courses
2. Check in Moodle: Admin > Users > Browse course to see user roles
3. Roles must be: 3, 4, 5, or 6 to be detected as instructor
4. Test with a known instructor account

### Wrong Roles Displayed
1. Verify Moodle `core_user_get_courses` returns correct data
2. Check role IDs in Moodle system (Settings > Manage roles)
3. May need to add custom role IDs to `getUserRoles()` function

---

## Code References

| File | Feature | Lines |
|------|---------|-------|
| `lib/moodle.ts` | Role detection | 1045-1106 |
| `lib/passwordless-auth.ts` | JWT with roles | 20-37, 203-217 |
| `components/Navbar.tsx` | Badge display | 64-107, 118-130 |
| `app/student/dashboard/page.tsx` | StudentData interface | 19-24 |

---

## Next Steps

1. ✅ **Deploy & Test** - Verify roles work in production
2. ⏭️ **Instructor Dashboard** - Create separate dashboard for instructors
3. ⏭️ **Class Management** - Show teaching courses and students
4. ⏭️ **Permissions System** - Implement role-based access control
5. ⏭️ **Admin Panel** - Create admin-only management features

---

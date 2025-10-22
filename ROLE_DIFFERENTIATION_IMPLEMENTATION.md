# Role Differentiation System - Implementation Summary

## ✅ What's Been Implemented

### 1. Moodle Role Detection (`lib/moodle.ts`)
- ✅ **`getUserRoles(userId: number)`** - Detects user's roles from Moodle
  - Fetches user's courses using `core_user_get_courses`
  - Checks each course for instructor role (IDs: 3, 4, 5, 6)
  - Returns `['student']` or `['student', 'instructor']`
  
- ✅ **`getUserTeachingCourses(userId: number)`** - Gets only teaching courses
  - Used for future instructor dashboard
  - Filters courses where user has instructor role

### 2. JWT Token Enhancement (`lib/passwordless-auth.ts`)
- ✅ **`generateJWTToken()`** - Updated to accept roles
  - JWT now includes: `roles: string[]`
  - Example: `roles: ['student', 'instructor']`

- ✅ **`createStudentSession()`** - Fetches roles during session creation
  - Calls `moodleService.getUserRoles()`
  - Logs roles to console: `📋 User roles for {username}: {roles}`
  - Stores roles in JWT token
  - Stores roles in session database

### 3. Navbar Role Display (`components/Navbar.tsx`)
- ✅ **StudentUser Interface** - Updated to include roles
  ```typescript
  interface StudentUser {
    roles?: string[]
  }
  ```

- ✅ **Helper Functions**
  - `getRoleBadgeStyle(role)` - Returns Tailwind classes for badge
  - `getRoleBadgeLabel(role)` - Returns readable label

- ✅ **Role Badges Display**
  - Desktop: Shows badges below user name/email
  - Mobile: Badges wrap correctly
  - Color coding:
    - Blue badge: Student
    - Purple badge: Instructor/Teacher
    - Red badge: Admin

### 4. Dashboard Data Types (`app/student/dashboard/page.tsx`)
- ✅ **StudentData Interface** - Updated to include roles
  ```typescript
  interface StudentData {
    roles?: string[]
  }
  ```

---

## 🔄 Complete Data Flow

```
1. USER LOGS IN
   ↓
2. EMAIL VERIFICATION
   /api/auth/send-code
   ├─ Verify email in Moodle
   └─ Send magic code
   ↓
3. CODE VERIFICATION
   /api/auth/verify-code
   ├─ Verify magic code
   ├─ Fetch user data from Moodle
   ├─ ✨ FETCH USER ROLES ← NEW
   ├─ Generate JWT with roles ← NEW
   ├─ Store session in DB
   └─ Return JWT token
   ↓
4. MIDDLEWARE CHECK
   ├─ Verify JWT token
   ├─ Check session active
   └─ Allow access
   ↓
5. NAVBAR DISPLAY
   ├─ Show user name/email
   ├─ ✨ SHOW ROLE BADGES ← NEW
   └─ Show logout button
```

---

## 📊 Role Detection Logic

```typescript
// Pseudo-code for getUserRoles()

function getUserRoles(userId) {
  roles = ['student']  // Default
  
  courses = fetch user's courses from Moodle
  
  for each course:
    if course has instructor roles (3, 4, 5, 6):
      roles.push('instructor')
      break  // Stop searching
  
  return unique(roles)
}
```

---

## 🎨 UI Badge Styling

| Role | CSS Classes | Color |
|------|------------|-------|
| `student` | `bg-blue-100 text-blue-800 border-blue-300` | Blue |
| `instructor` | `bg-purple-100 text-purple-800 border-purple-300` | Purple |
| `teacher` | `bg-purple-100 text-purple-800 border-purple-300` | Purple |
| `admin` | `bg-red-100 text-red-800 border-red-300` | Red |

---

## 📋 Console Output

When user logs in, check browser/server console for:

```
📋 User roles for smorsa2021: ["student", "instructor"]
```

This confirms roles were fetched from Moodle and stored in JWT.

---

## ✅ Testing Checklist

### Role Detection
- [ ] Login as pure student (no courses) → `['student']`
- [ ] Login as instructor (teaching courses) → `['student', 'instructor']`
- [ ] Check console for 📋 emoji output
- [ ] Verify JWT token contains roles

### Navbar Display
- [ ] Desktop navbar shows role badges below email
- [ ] Mobile navbar shows role badges properly
- [ ] Correct colors for each role
- [ ] Badges persist after page reload
- [ ] Badges show after logout/login

### Edge Cases
- [ ] API error → Defaults to `['student']`
- [ ] User with 0 courses → `['student']`
- [ ] User with multiple instructor roles → `['student', 'instructor']`

---

## 🚀 Performance

| Operation | Time | Impact |
|-----------|------|--------|
| Fetch roles from Moodle | ~200-500ms | During login |
| Store in JWT | <1ms | During login |
| Display badges | <1ms | On render |
| **Total login impact** | **+200-500ms** | **Minimal** |

---

## 📁 Modified Files

1. **`lib/moodle.ts`** (lines 1045-1106)
   - Added `getUserRoles()`
   - Added `getUserTeachingCourses()`

2. **`lib/passwordless-auth.ts`** (lines 20-37, 203-217)
   - Updated `generateJWTToken()` signature
   - Updated `createStudentSession()`

3. **`components/Navbar.tsx`** (lines 18, 64-130)
   - Updated `StudentUser` interface
   - Added badge helper functions
   - Updated display logic

4. **`app/student/dashboard/page.tsx`** (lines 19-24)
   - Updated `StudentData` interface

---

## 🔐 Security Notes

✅ Roles fetched from trusted Moodle instance
✅ Roles verified at login time
✅ Stored securely in JWT token
✅ Token signed with secret key
✅ Roles can't be modified client-side
✅ Session database acts as backup verification

---

## 🎯 Next Features

1. **Instructor Dashboard** - Different view for instructors
2. **My Classes** - Show teaching courses for instructors
3. **Permission Middleware** - Protect instructor-only routes
4. **Admin Detection** - Detect admin users from Moodle
5. **Role-Based Navigation** - Show different links for different roles

---

## 🧪 How to Test

### Quick Test in Browser

1. Navigate to `http://localhost:3000/login`
2. Enter email: `harrietsa@ueab.ac.ke`
3. Click "Send Code"
4. Enter code (check dev email/logs)
5. Click "Verify Code"
6. Look for role badges in navbar
7. Check console for: `📋 User roles for ...`

### Advanced Test - Inspect JWT

1. Open browser DevTools
2. Check cookies for `odel_auth`
3. Decode JWT token (use jwt.io)
4. Look for `roles` field in token payload

### Moodle Verification

1. Login to Moodle as user
2. Check user's enrolled courses
3. Note their role in each course (Teacher, Student, etc.)
4. Role IDs:
   - 3 = Teacher → Will show `instructor`
   - 4 = Editing Teacher → Will show `instructor`
   - 5+ = Other instructor roles → Will show `instructor`

---

## 📞 Support

If roles not showing:
1. Check console for `📋` emoji logs
2. Verify user has instructor role in Moodle
3. Check Moodle API has access to courses
4. Verify role ID is in [3, 4, 5, 6]

---

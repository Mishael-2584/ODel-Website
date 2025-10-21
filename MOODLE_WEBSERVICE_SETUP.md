# 🔧 Moodle Web Service Setup Guide for UEAB ODeL

## 📋 **Required Web Service Functions**

### **1. 🔐 Authentication & User Management**
Add these functions to your external service:

```
core_user_get_users
core_user_get_users_by_field
core_user_get_user_preferences
core_user_get_course_user_profiles
```

### **2. 📚 Course & Enrollment Management**
```
core_course_get_courses
core_course_get_categories
core_course_get_course_contents
core_enrol_get_enrolled_users
core_enrol_get_users_courses
core_enrol_get_instance_info
```

### **3. 📊 Grades & Progress Tracking**
```
gradereport_user_get_grade_items
gradereport_user_get_grades_table
core_grades_get_grades
core_completion_get_activities_completion_status
core_completion_get_course_completion_status
```

### **4. 📝 Assignments & Activities**
```
mod_assign_get_assignments
mod_assign_get_submissions
mod_assign_get_grades
mod_quiz_get_quizzes_by_courses
mod_quiz_get_attempts
```

### **5. 💬 Communication**
```
core_message_get_messages
core_message_send_messages_to_conversation
core_message_get_conversation
core_message_get_conversations
```

### **6. 📅 Calendar & Events**
```
core_calendar_get_calendar_events
core_calendar_create_calendar_events
core_calendar_get_calendar_access_information
```

## 🚀 **Enhanced Student Features**

### **When Logged In, Students Can:**

1. **📊 Personal Dashboard**
   - View enrolled courses with progress
   - See upcoming assignments and deadlines
   - Track grades and performance
   - Access study analytics

2. **📚 Course Management**
   - Access course materials
   - Submit assignments
   - Participate in discussions
   - View course announcements

3. **📝 Assignment Center**
   - Submit assignments online
   - View feedback and grades
   - Track submission status
   - Download course resources

4. **💬 Communication Hub**
   - Message instructors
   - Join course discussions
   - Receive notifications
   - Access study groups

5. **📅 Academic Calendar**
   - View personal schedule
   - Track important dates
   - Set study reminders
   - Access exam schedules

6. **📊 Performance Analytics**
   - Grade trends over time
   - Course comparison
   - Study insights
   - Achievement tracking

## ✅ **Functions to Enable in Moodle External Service**

For Module 1 Module-Enhanced Features to work fully, ensure these functions are enabled:

### **Critical Functions (for enrollment data):**

1. **`core_enrol_get_enrolled_users`** ⭐ NEW & REQUIRED
   - Fetches list of enrolled users in a course
   - Returns user count, active users, last access times
   - **Needed for:** Real student enrollment counts instead of showing 0
   - **Location:** Site Admin → Server → Web Services → External Services → UEAB ODeL Integration → Add functions → Search "core_enrol_get_enrolled_users"

2. **`core_course_get_courses`** ✅ (Already enabled)
   - Fetches course information
   - Used to get course details and category assignments
   - Supports filtering by course ID

### **Supporting Functions (Already Should Be Enabled):**

- `core_course_get_categories` - Get course categories
- `core_enrol_get_users_courses` - Get courses a user is enrolled in
- `core_course_get_contents` - Get course content/modules

---

## 🔧 **How to Add core_enrol_get_enrolled_users**

### Step 1: Log into Moodle as Admin
- Go to: https://ielearning.ueab.ac.ke/admin/

### Step 2: Navigate to Web Services
- Site Administration → Server → Web Services → External Services
- Click "UEAB ODeL Integration" service

### Step 3: Add the Function
- Click "Add functions" button
- Search for: `core_enrol_get_enrolled_users`
- Select it from the dropdown
- Click "Add functions" button

### Step 4: Verify
- The function should now appear in the list of enabled functions

---

## 📊 **Expected Improvements After Adding Function**

| Feature | Before | After |
|---------|--------|-------|
| **Student Count Display** | Shows 0 (API limitation) | Shows actual enrolled users |
| **Load Speed** | Fast (no enrollment queries) | Slightly slower (fetching enrollment data) |
| **Data Accuracy** | Generic `enrolledusercount` | Real enrolled user count from `core_enrol_get_enrolled_users` |
| **Active Students Tracking** | Not available | Shows actively engaged users |

---

## ⚙️ **Function Capabilities**

`core_enrol_get_enrolled_users` returns:

```json
{
  "id": 123,
  "username": "student01",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@university.ac.ke",
  "lastaccess": 1697462400,
  "lastcourseaccess": 1697462400,
  "roles": [ ... ]
}
```

This includes:
- ✅ User ID and basic info
- ✅ Last access timestamp (to track active users)
- ✅ User roles in the course
- ✅ All enrolled users (up to limit specified)

---

## 💡 **Troubleshooting**

**Q: Function not showing in dropdown?**
- A: The token/service might not have permissions. Check if "UEAB ODeL Integration" service is enabled and has the right role assigned.

**Q: Getting "Access control exception"?**
- A: The function isn't enabled for the external service. Follow steps above to add it.

**Q: Still showing 0 students?**
- A: The courses might not have any formally enrolled students. Check in Moodle → Course → Participants to verify.

---

## 🔧 **Setup Instructions**

1. **Go to Site Administration → Server → Web services → External services**
2. **Edit your "UEAB ODeL Integration" service**
3. **Click "Functions" and add the functions listed above**
4. **Save changes**
5. **Test the integration**

## 🎯 **Next Steps**

1. Add the required functions to your Moodle service
2. Test the authentication system
3. Implement the student dashboard
4. Add assignment submission features
5. Enable communication features

This will give you a comprehensive, integrated platform that enhances the student experience while maintaining Moodle as the core learning system.

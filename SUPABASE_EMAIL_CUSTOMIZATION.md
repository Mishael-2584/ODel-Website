# Supabase Email Customization & Moodle Data Debugging Guide

## 📧 Part 1: Supabase Email Customization

### Overview
Supabase **fully supports custom email templates** for all authentication emails, including magic links. You can:
- ✅ Customize subject lines
- ✅ Design custom HTML email bodies
- ✅ Add your branding (logo, colors, fonts)
- ✅ Maintain all required placeholders for functionality

### Step 1: Access Email Templates

1. Log into your Supabase Dashboard
2. Select your project: **vsirtnqfvimtkgabxpzy**
3. Go to **Authentication** → **Email Templates** in the left sidebar
4. You'll see templates for:
   - Confirm signup
   - **Magic Link** (this is what we need!)
   - Password reset
   - Email change
   - Invite user

### Step 2: Customize the Magic Link Email

**Current Template** (in Supabase settings):
```
Subject: Confirm your signup
Body: Follow this link to confirm your user:
{{ .ConfirmationURL }}
```

**Custom Professional Template** (UEAB Branded):

**Subject Line:**
```
Your UEAB ODeL Login Code: {{ .Code }}
```

**Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .code-box {
            background-color: #f0f4ff;
            border-left: 4px solid #1e40af;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            letter-spacing: 4px;
            text-align: center;
            font-family: 'Courier New', monospace;
        }
        .code-label {
            font-size: 12px;
            color: #666;
            text-align: center;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .expiry {
            font-size: 14px;
            color: #d97706;
            background-color: #fef3c7;
            padding: 10px;
            border-radius: 4px;
            margin: 15px 0;
            text-align: center;
        }
        .button {
            display: inline-block;
            background-color: #1e40af;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            margin: 15px auto;
            text-align: center;
            font-weight: bold;
        }
        .button:hover {
            background-color: #1e3a8a;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e5e7eb;
        }
        .security-note {
            background-color: #f3f4f6;
            padding: 12px;
            border-radius: 4px;
            font-size: 13px;
            color: #374151;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>UEAB ODeL</h1>
            <p>University of Eastern Africa, Baraton</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                <p>Hello Student,</p>
                <p>Your magic code to access the ODeL Portal is:</p>
            </div>
            
            <div class="code-box">
                <div class="code-label">Your Login Code</div>
                <div class="code">{{ .Code }}</div>
            </div>
            
            <div class="expiry">
                ⏱️ This code expires in 10 minutes. Don't share it with anyone!
            </div>
            
            <p>Simply paste this code into the ODeL login page to access your courses, assignments, grades, and more.</p>
            
            <div class="security-note">
                <strong>🔒 Security Note:</strong> If you didn't request this code, please ignore this email. Your account remains secure.
            </div>
            
            <p>Need help? Contact us at support@ueab.ac.ke</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 UEAB ODeL Platform. All rights reserved.</p>
            <p>University of Eastern Africa, Baraton</p>
        </div>
    </div>
</body>
</html>
```

### Step 3: How to Apply This in Supabase

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Find **"Confirm signup"** template
3. Click **Edit** (pencil icon)
4. Replace the subject and body with the templates above
5. **Important**: Keep the placeholder `{{ .ConfirmationURL }}` or `{{ .Code }}` for the system to work
6. Click **Save**

---

## 🐛 Part 2: Debugging Moodle Data (Assignments, Calendar, Grades)

### Issue: Blank Data on Dashboard

If calendar events, assignments, or grades are showing blank:

### Step 1: Check the Server Logs

The API endpoints now have **verbose logging**. When the user loads the dashboard:

```
📡 Fetching calendar events for user 4487
📊 Retrieved 0 calendar events

📡 Fetching assignments for user 4487
📊 Retrieved 0 assignments

📡 Fetching grades for user 4487
📊 User enrolled in 3 courses
  Fetching grades for course: Business Administration (ID: 123)
    Grade response for Business Administration: { "usergrades": [...] }
    ✓ Grade recorded: 85.5
  Fetching grades for course: Mathematics (ID: 124)
    ⚠️ No grades found for course Mathematics
📈 Calculated average grade: 85.5 from 1 courses
```

### Step 2: Verify User Enrollment

Check if the test user (harrietsa@ueab.ac.ke / Moodle ID: 4487) actually has:
1. ✅ **Enrolled courses** → Check in Moodle: Participant tab in each course
2. ✅ **Calendar events** → Check if there are any calendar events created
3. ✅ **Grades entered** → Check if instructors have submitted grades
4. ✅ **Assignments created** → Check if there are active assignments

### Step 3: Common Issues & Fixes

#### Issue: "0 calendar events"
**Cause:** User has no calendar events OR Moodle calendar is not showing events
**Fix:**
1. In Moodle, go to **Calendar** → **New Event**
2. Create a test event
3. Set it to **User calendar** or **Course calendar**
4. Try dashboard again

#### Issue: "0 assignments"
**Cause:** No assignments in courses OR user not enrolled
**Fix:**
1. Verify user is enrolled in at least one course
2. In that course, go to **Assignments** → Create a test assignment
3. Make sure assignment is visible to students
4. Try dashboard again

#### Issue: "No grades found"
**Cause:** Grades table shows `null` or grades not published to students
**Fix:**
1. In Moodle, go to **Grades**
2. Enter a test grade for the user
3. Make sure **"Hide hidden grades"** is OFF (so students can see)
4. Try dashboard again

### Step 4: Check Moodle API Functions Are Enabled

Required functions for dashboard data:

```
✅ core_calendar_get_calendar_events
✅ mod_assign_get_assignments
✅ gradereport_user_get_grades_table
✅ core_enrol_get_enrolled_users
✅ core_user_get_users
```

**How to verify:**
1. In Moodle as admin: **Site administration** → **Server** → **Web services** → **External services**
2. Click on the service you're using
3. Verify all functions above are **checked (enabled)**

### Step 5: Performance Improvements

All endpoints now use **Supabase caching**:
- **First load**: Fetches from Moodle API (slow, but cached)
- **Subsequent loads**: Returns from cache (instant!)
- **Cache duration**: 30 minutes per endpoint
- **Cache keys**: `calendar_events_{userId}`, `assignments_{userId}`, `user_grades_{userId}`

**Browser console shows:**
```
✅ Cache HIT - Calendar events for user 4487
✅ Cache HIT - Assignments for user 4487
✅ Cache HIT - Grades for user 4487
```

---

## 🔧 Troubleshooting Checklist

- [ ] Verified test user is enrolled in courses (in Moodle)
- [ ] Created sample calendar events
- [ ] Created sample assignments
- [ ] Entered sample grades for the user
- [ ] Verified Moodle web service functions are enabled
- [ ] Checked server logs for specific errors
- [ ] Cleared browser cache / Supabase cache
- [ ] Customized email templates in Supabase dashboard

---

## 📝 Quick Reference

**Moodle Data Endpoints:**
```
GET /api/moodle?action=calendar-events&userId=4487
GET /api/moodle?action=assignments&userId=4487
GET /api/moodle?action=user-grades&userId=4487
```

**Supabase Email Config:**
- **Dashboard**: https://app.supabase.com → Authentication → Email Templates
- **Magic Link Field**: Use `{{ .ConfirmationURL }}` or `{{ .Code }}`
- **Test Mode**: Check email in browser console (dev mode)

---

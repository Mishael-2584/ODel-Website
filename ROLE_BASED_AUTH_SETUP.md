# 🎓 Role-Based Authentication System - Setup Guide

## ✅ What We've Built

A complete **role-based authentication system** with three user types:
1. **Students** - Take courses, track progress
2. **Instructors** - Create and manage courses
3. **Admins** - Manage entire platform

---

## 📦 Files Created

### 1. **Backend Configuration**
- ✅ `lib/supabase.ts` - Supabase client + TypeScript types
- ✅ `supabase/migrations/20250114000000_initial_schema.sql` - Complete database schema
- ✅ `contexts/AuthContext.tsx` - Authentication context with role-based access

### 2. **Dashboards**
- ✅ `app/student/dashboard/page.tsx` - Student portal
- ✅ `app/instructor/dashboard/page.tsx` - Instructor portal (TODO)
- ✅ `app/admin/dashboard/page.tsx` - Admin portal (TODO)

### 3. **Updated Files**
- ✅ `app/layout.tsx` - Added AuthProvider wrapper

---

## 🚀 Setup Instructions

### Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 2: Choose Your Backend Setup

#### **Option A: Supabase Cloud (Easiest - 5 minutes)**

1. **Create Account:**
   - Go to https://supabase.com
   - Sign up (free)
   - Create new project
   - Choose region closest to you
   - Wait 2 minutes for setup

2. **Get API Keys:**
   - Go to Project Settings → API
   - Copy:
     - Project URL
     - `anon` public key

3. **Update Environment Variables:**

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Create Database Schema:**
   - Go to SQL Editor in Supabase
   - Copy content from `supabase/migrations/20250114000000_initial_schema.sql`
   - Paste and run

5. **Done!** Your backend is ready

---

#### **Option B: Local Supabase (Full Control)**

1. **Install Docker Desktop:**
   - Download from https://www.docker.com/products/docker-desktop
   - Install and start Docker

2. **Install Supabase CLI:**
```bash
npm install -g supabase
```

3. **Initialize Supabase:**
```bash
cd "C:\Users\ODeL\Downloads\Documents\MISHAEL\ODel Website"
supabase init
```

4. **Start Supabase:**
```bash
supabase start
```

This will output:
```
API URL: http://localhost:54321
Studio URL: http://localhost:54323
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. **Update .env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-above
```

6. **Run Migrations:**
```bash
supabase db push
```

7. **Access Studio:**
   - Open http://localhost:54323
   - Browse your database with GUI

---

### Step 3: Test the System

1. **Start Your App:**
```bash
npm run dev
```

2. **Register First User:**
   - Go to http://localhost:3000/register
   - Create account as "Student"
   - Check email for confirmation (if using cloud)

3. **View Dashboard:**
   - After signup, auto-redirected to `/student/dashboard`
   - See your student portal!

4. **Create Test Users:**
   
**Instructor Account:**
```sql
-- In Supabase SQL Editor or Studio:
UPDATE profiles 
SET role = 'instructor' 
WHERE email = 'instructor@ueab.ac.ke';
```

**Admin Account:**
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@ueab.ac.ke';
```

---

## 🎯 Database Schema Overview

### Tables Created:

1. **profiles** - User profiles with roles
2. **courses** - All courses
3. **lessons** - Course content
4. **enrollments** - Student enrollments
5. **lesson_progress** - Track lesson completion
6. **assignments** - Course assignments
7. **submissions** - Student submissions
8. **notifications** - User notifications
9. **discussions** - Course forums
10. **discussion_replies** - Forum replies
11. **reviews** - Course ratings
12. **certificates** - Issued certificates

### Security:
- ✅ Row Level Security (RLS) enabled
- ✅ Role-based policies
- ✅ Students can only see their data
- ✅ Instructors can manage their courses
- ✅ Admins have full access

---

## 👥 User Roles & Permissions

### Student Role (`student`)
**Can:**
- ✅ Browse and enroll in courses
- ✅ View enrolled courses
- ✅ Track progress
- ✅ Submit assignments
- ✅ Participate in discussions
- ✅ Download certificates

**Cannot:**
- ❌ Create courses
- ❌ Manage other students
- ❌ Access admin features

**Dashboard:** `/student/dashboard`

---

### Instructor Role (`instructor`)
**Can:**
- ✅ Everything students can do
- ✅ Create new courses
- ✅ Edit own courses
- ✅ Add/remove lessons
- ✅ Create assignments
- ✅ Grade submissions
- ✅ View course analytics

**Cannot:**
- ❌ Edit other instructors' courses
- ❌ Access admin features
- ❌ Manage users

**Dashboard:** `/instructor/dashboard`

---

### Admin Role (`admin`)
**Can:**
- ✅ Everything instructors can do
- ✅ Manage all users
- ✅ Edit any course
- ✅ View platform analytics
- ✅ Manage system settings
- ✅ Access all data

**Dashboard:** `/admin/dashboard`

---

## 🔐 Authentication Flow

### Registration:
```typescript
1. User fills registration form
2. Selects role (student/instructor)
3. Supabase creates auth.users entry
4. Trigger creates profiles entry
5. User redirected to role-specific dashboard
```

### Login:
```typescript
1. User enters credentials
2. Supabase validates
3. Fetch user profile with role
4. Redirect based on role:
   - student → /student/dashboard
   - instructor → /instructor/dashboard
   - admin → /admin/dashboard
```

### Protected Routes:
```typescript
// Use in any page:
import { useRequireRole } from '@/contexts/AuthContext'

export default function Page() {
  const { profile } = useRequireRole(['student']) // or ['instructor', 'admin']
  
  // Page content...
}
```

---

## 📊 Dashboard Features

### Student Dashboard (`/student/dashboard`)
**Current Features:**
- ✅ Stats cards (enrolled, completed, certificates, hours)
- ✅ Enrolled courses list with progress bars
- ✅ Achievement badges
- ✅ Upcoming deadlines
- ✅ Quick actions

**Connects to Database:**
- ✅ Fetches real enrollments from Supabase
- ✅ Calculates stats from DB
- ✅ Shows actual progress

---

### Instructor Dashboard (`/instructor/dashboard`)
**Features (TODO):**
- ✅ Course management
- ✅ Student analytics
- ✅ Assignment grading
- ✅ Course creation wizard
- ✅ Revenue tracking
- ✅ Student progress overview

---

### Admin Dashboard (`/admin/dashboard`)
**Features (TODO):**
- ✅ User management
- ✅ All courses overview
- ✅ Platform analytics
- ✅ System settings
- ✅ Financial reports
- ✅ Content moderation

---

## 🔧 API Routes Examples

### Create Course (Instructor):
```typescript
// app/api/courses/route.ts
export async function POST(request: Request) {
  const { title, description, category } = await request.json()
  
  const { data, error } = await supabase
    .from('courses')
    .insert({
      title,
      description,
      category,
      instructor_id: user.id
    })
    .select()
    .single()
  
  return Response.json(data)
}
```

### Enroll in Course (Student):
```typescript
// app/api/enroll/route.ts
export async function POST(request: Request) {
  const { courseId } = await request.json()
  
  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      user_id: user.id,
      course_id: courseId
    })
  
  return Response.json(data)
}
```

---

## 📱 Frontend Usage Examples

### Fetch User's Courses:
```typescript
const { data: enrollments } = await supabase
  .from('enrollments')
  .select(`
    *,
    course:courses (
      id,
      title,
      description,
      instructor:profiles (full_name)
    )
  `)
  .eq('user_id', profile?.id)
```

### Check User Role:
```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { profile } = useAuth()
  
  if (profile?.role === 'admin') {
    return <AdminControls />
  }
  
  return <RegularView />
}
```

### Protected Link:
```tsx
{profile?.role === 'instructor' && (
  <Link href="/instructor/dashboard">
    Instructor Portal
  </Link>
)}
```

---

## 🚀 Next Steps

### Phase 1: Complete Dashboards (Week 1)
- [ ] Build Instructor Dashboard
- [ ] Build Admin Dashboard
- [ ] Add course creation UI
- [ ] Add student management

### Phase 2: Course Management (Week 2)
- [ ] Course creation wizard
- [ ] Lesson upload interface
- [ ] Video upload to Supabase Storage
- [ ] Assignment creation

### Phase 3: Student Features (Week 3)
- [ ] Enrollment system
- [ ] Video player integration
- [ ] Progress tracking
- [ ] Certificate generation

### Phase 4: Advanced Features (Week 4)
- [ ] Discussion forums
- [ ] Live chat
- [ ] Real-time notifications
- [ ] Analytics dashboards

---

## 💡 Quick Commands

### View Database:
```bash
# If using local Supabase:
supabase db studio

# Opens: http://localhost:54323
```

### Reset Database:
```bash
supabase db reset
```

### Create New Migration:
```bash
supabase migration new add_new_feature
```

### Export Data:
```bash
supabase db dump > backup.sql
```

---

## 🐛 Troubleshooting

### "Invalid API key":
- Check `.env.local` has correct keys
- Restart `npm run dev` after changing env

### "RLS Policy Error":
- Make sure user is logged in
- Check if user profile exists in `profiles` table

### "Cannot connect to Supabase":
- If local: Check Docker is running (`docker ps`)
- If cloud: Check internet connection

### No Profile After Signup:
- Check if trigger `on_auth_user_created` exists
- Manually create profile:
```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES ('user-id', 'email@example.com', 'Full Name', 'student');
```

---

## 📞 Support

Need help?
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Auth**: https://nextjs.org/docs/authentication
- **UEAB ODel**: odel@ueab.ac.ke

---

## ✅ Current Status

**Completed:**
- ✅ Database schema designed
- ✅ Authentication system built
- ✅ Student dashboard created
- ✅ Role-based access control
- ✅ Supabase integration

**In Progress:**
- ⏳ Instructor dashboard
- ⏳ Admin dashboard
- ⏳ Course creation UI

**Todo:**
- ⬜ Video upload system
- ⬜ Assignment grading
- ⬜ Certificate generation
- ⬜ Discussion forums

---

**🎉 You now have a professional role-based authentication system!**

Would you like me to:
1. Create the Instructor Dashboard?
2. Create the Admin Dashboard?
3. Build the course creation interface?
4. Set up video upload functionality?

Let me know what you'd like to build next! 🚀


# 🗄️ Database Setup Instructions

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Run the Database Schema

Copy and paste the **ENTIRE** content from the file:
`supabase/migrations/20250114000000_initial_schema.sql`

into the SQL Editor and click **RUN** button.

This will create:
- ✅ 12 database tables
- ✅ Row-level security policies
- ✅ Automatic triggers
- ✅ Indexes for performance
- ✅ All necessary functions

## Step 3: Verify Tables Created

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - profiles
   - courses
   - lessons
   - enrollments
   - lesson_progress
   - assignments
   - submissions
   - notifications
   - discussions
   - discussion_replies
   - reviews
   - certificates

## Step 4: Test Your Setup

Run this test query in SQL Editor:
```sql
SELECT * FROM profiles LIMIT 10;
```

If it runs without error, you're all set! ✅

## Quick Access Links

- **Your Supabase Dashboard**: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy
- **SQL Editor**: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/sql
- **Table Editor**: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/editor
- **Authentication**: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/auth/users

## After Database Setup

Once the database is set up, restart your dev server:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

Then you can:
1. Visit http://localhost:3000/register
2. Create your first account
3. Get auto-redirected to the student dashboard!

---

**Need help?** The SQL file is located at:
`supabase/migrations/20250114000000_initial_schema.sql`


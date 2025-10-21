# 🗄️ MANUAL DATABASE MIGRATION STEPS

Follow these steps to manually create the authentication tables in Supabase:

## Step 1: Go to Supabase Dashboard

1. Visit: https://app.supabase.com
2. Select your project: **UEAB ODeL**
3. Go to: **SQL Editor**

## Step 2: Create New Query

1. Click **"New Query"**
2. Copy the entire SQL from: `supabase/migrations/20251022_passwordless_auth.sql`
3. Paste it into the SQL editor

## Step 3: Execute Migration

1. Click **"Run"** (or press `Cmd+Enter` / `Ctrl+Enter`)
2. Wait for completion (should take 10-30 seconds)
3. You should see: ✅ **Success**

## Step 4: Verify Tables Created

Go to **Table Editor** in Supabase and verify these tables exist:

- ✅ `magic_codes`
- ✅ `student_sessions`
- ✅ `admin_users`
- ✅ `admin_sessions`
- ✅ `admin_audit_log`

## Step 5: Create First Admin Account

After migration is complete, run the setup script:

```bash
node scripts/setup-auth.js
```

This will:
1. Test Supabase connection
2. Create admin account: `admin@ueab.ac.ke`
3. Set password: `Changes@2025`

## Step 6: Test Authentication

### Student Login:
```
URL: http://localhost:3000/auth
Email: mishael01@ueab.ac.ke (or any Moodle email)
```

### Admin Login:
```
URL: http://localhost:3000/admin/login
Email: admin@ueab.ac.ke
Password: Changes@2025
```

## ⚠️ TROUBLESHOOTING

### Migration Failed
- Check SQL syntax in the file
- Ensure you have permission to create tables
- Try creating one table at a time

### Admin Account Not Created
- Ensure migration completed first
- Check SUPABASE_SERVICE_ROLE_KEY is correct in .env
- Try creating manually via Supabase UI:
  ```sql
  INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
  VALUES ('admin@ueab.ac.ke', 'bcrypt_hash', 'Admin', 'super_admin', true);
  ```

### Login Not Working
- Check `.env` has JWT_SECRET
- Verify cookies are enabled
- Check browser console for errors
- Ensure middleware.ts is in project root

## 📋 Migration SQL File Location

- **File:** `supabase/migrations/20251022_passwordless_auth.sql`
- **Size:** ~5KB
- **Tables:** 5
- **Functions:** 3
- **Indexes:** 9

## 🔐 Security Notes

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Magic codes expire after 10 minutes
- ✅ Passwords bcrypt hashed
- ✅ Sessions auto-cleanup
- ✅ Audit logs all admin actions

---

**Next:** After migration succeeds, you can test the complete authentication flow!

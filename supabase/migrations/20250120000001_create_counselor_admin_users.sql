-- Migration to create admin users for counselors
-- NOTE: This migration only creates entries in admin_users table
-- You must first create the auth users via Supabase Auth Dashboard or run the script:
-- node scripts/create-counselor-admins.js
--
-- After auth users are created, you can run this to ensure admin_users entries exist

-- This is a placeholder migration
-- The actual user creation should be done via:
-- 1. Supabase Auth Dashboard (Authentication → Users → Add User)
-- 2. Or run: node scripts/create-counselor-admins.js

-- After auth users are created, you can verify with:
-- SELECT id, email, full_name, role, is_active FROM admin_users WHERE email IN ('ogachia@ueab.ac.ke', 'ngetichl@ueab.ac.ke');

-- If you need to manually insert (after creating auth users), use:
/*
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES 
  (
    'AUTH_USER_ID_FOR_OGACHIA', -- Replace with actual auth user ID
    'ogachia@ueab.ac.ke',
    'Counselor Ogachia',
    'admin',
    true
  ),
  (
    'AUTH_USER_ID_FOR_NGETICH', -- Replace with actual auth user ID
    'ngetichl@ueab.ac.ke',
    'Counselor Ngetich',
    'admin',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;
*/

-- This migration file is informational only
-- Use the Node.js script for automatic creation

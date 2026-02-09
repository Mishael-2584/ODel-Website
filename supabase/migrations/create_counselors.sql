-- Step 1: Check existing admin users
-- Run this first to see what admin users you have
SELECT id, email, full_name, role, is_active 
FROM admin_users 
ORDER BY created_at;

-- Step 2: Create counselor profiles
-- Replace the admin_user_id values with actual UUIDs from Step 1
-- If you need to create admin users first, use the Supabase Auth dashboard or API

-- Option A: If admin users already exist, just create counselor profiles
-- Replace 'YOUR_ADMIN_USER_ID_1' and 'YOUR_ADMIN_USER_ID_2' with actual UUIDs

-- Counselor Loice
INSERT INTO counselors (admin_user_id, name, email, phone, gender, specialization, bio, is_active)
VALUES (
  'YOUR_ADMIN_USER_ID_1', -- Replace with actual admin user ID for Loice
  'Counselor Loice',
  'loice@ueab.ac.ke',
  '0705571104',
  'female',
  ARRAY['Individual Counseling', 'Crisis Support', 'Group Therapy', 'Support Group', 'VCT', 'Peer Counseling', 'Pre-Marital', 'Family Therapy', 'Mental Health Education'],
  'Experienced counselor providing comprehensive mental health support including individual counseling, crisis intervention, and group therapy sessions.',
  true
)
ON CONFLICT (admin_user_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  gender = EXCLUDED.gender,
  specialization = EXCLUDED.specialization,
  bio = EXCLUDED.bio,
  is_active = EXCLUDED.is_active;

-- Counselor Pr. Zachary
INSERT INTO counselors (admin_user_id, name, email, phone, gender, specialization, bio, is_active)
VALUES (
  'YOUR_ADMIN_USER_ID_2', -- Replace with actual admin user ID for Pr. Zachary
  'Counselor Pr. Zachary',
  'zachary@ueab.ac.ke',
  '0727416106',
  'male',
  ARRAY['Individual Counseling', 'Crisis Support', 'Group Therapy', 'Support Group', 'VCT', 'Peer Counseling', 'Pre-Marital', 'Family Therapy', 'Mental Health Education'],
  'Experienced counselor providing comprehensive mental health support including individual counseling, crisis intervention, and group therapy sessions.',
  true
)
ON CONFLICT (admin_user_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  gender = EXCLUDED.gender,
  specialization = EXCLUDED.specialization,
  bio = EXCLUDED.bio,
  is_active = EXCLUDED.is_active;

-- Step 3: Verify counselors were created
SELECT c.id, c.name, c.email, c.gender, c.is_active, au.email as admin_email, au.full_name as admin_name
FROM counselors c
LEFT JOIN admin_users au ON c.admin_user_id = au.id
ORDER BY c.created_at;

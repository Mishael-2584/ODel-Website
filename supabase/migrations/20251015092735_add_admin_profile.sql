-- Add admin profile for instructionaldesigner@ueab.ac.ke
-- This user ID comes from the Supabase auth system
INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    avatar_url,
    phone,
    department,
    created_at,
    updated_at
) VALUES (
    'cb2aa00e-a6c1-428d-aebd-51931117e8d1',
    'instructionaldesigner@ueab.ac.ke',
    'Instructional Designer',
    'admin',
    null,
    null,
    'Information Technology',
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Instructional Designer',
    department = 'Information Technology',
    updated_at = now();

-- Add a sample notification to test the system
INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    read,
    created_at
) VALUES (
    'cb2aa00e-a6c1-428d-aebd-51931117e8d1',
    'announcement',
    'Welcome to UEAB ODel Admin Panel!',
    'You have successfully logged in as an administrator. You can now manage users, courses, and send notifications.',
    false,
    now()
) ON CONFLICT DO NOTHING;

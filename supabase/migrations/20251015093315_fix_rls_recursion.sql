-- Fix RLS recursion issue by simplifying policies
-- Remove all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Allow all authenticated users to read profiles" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Remove all notification policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;

-- Create simple notification policies
CREATE POLICY "Allow all authenticated users to read notifications" ON notifications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to insert notifications" ON notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to update notifications" ON notifications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Now create the admin profile with RLS temporarily disabled
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

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

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a welcome notification
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

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

-- Re-enable notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

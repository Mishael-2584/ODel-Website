-- Fix RLS policies to allow admin profile creation
-- First, let's temporarily disable RLS to create the admin profile
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Insert the admin profile
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

-- Update the RLS policies to allow users to read their own profiles and admins to read all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Create more permissive policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert profiles" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Also fix notifications RLS
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Insert a welcome notification for the admin
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

-- Update notifications RLS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update notifications" ON notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

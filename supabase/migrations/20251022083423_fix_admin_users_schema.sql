-- Fix admin_users table schema
-- Remove password_hash column since we use Supabase Auth
-- This is a fix for the existing table

-- Check if password_hash column exists and drop it
ALTER TABLE IF EXISTS admin_users DROP COLUMN IF EXISTS password_hash CASCADE;

-- Ensure RLS is enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Public can view published news" ON news;
DROP POLICY IF EXISTS "Admins can manage all news" ON news;
DROP POLICY IF EXISTS "Public can view published events" ON events;
DROP POLICY IF EXISTS "Admins can manage all events" ON events;

-- Create new RLS policies for admin_users
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.role = 'admin'
    )
  );

-- Recreate RLS policies for news
CREATE POLICY "Public can view published news"
  ON news
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all news"
  ON news
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role IN ('admin', 'editor')
    )
  );

-- Recreate RLS policies for events
CREATE POLICY "Public can view published events"
  ON events
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all events"
  ON events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role IN ('admin', 'editor')
    )
  );

-- Admin Content Management System
-- News and Events tables for ODeL website admin panel
-- This migration runs after passwordless_auth migration creates admin_users

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  featured_image_url VARCHAR(500),
  image_bucket_path VARCHAR(500),
  author_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'draft',
  view_count INTEGER DEFAULT 0,
  CONSTRAINT status_check CHECK (status IN ('draft', 'published', 'archived'))
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  featured_image_url VARCHAR(500),
  image_bucket_path VARCHAR(500),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  event_type VARCHAR(50),
  organizer_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'draft',
  max_attendees INTEGER,
  attendee_count INTEGER DEFAULT 0,
  CONSTRAINT event_type_check CHECK (event_type IN ('webinar', 'workshop', 'lecture', 'conference', 'deadline', 'holiday', 'other')),
  CONSTRAINT status_check_event CHECK (status IN ('draft', 'published', 'archived', 'completed'))
);

-- Create indexes for faster queries
CREATE INDEX idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_author ON news(author_id);
CREATE INDEX idx_events_published ON events(is_published, start_date ASC);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date_range ON events(start_date, end_date);

-- Create RLS policies for news
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

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
      AND admin_users.role IN ('admin', 'editor', 'super_admin')
    )
  );

-- Create RLS policies for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

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
      AND admin_users.role IN ('admin', 'editor', 'super_admin')
    )
  );

-- Create activity log table for audit trail
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_log_admin ON admin_activity_log(admin_user_id);
CREATE INDEX idx_activity_log_action ON admin_activity_log(action);
CREATE INDEX idx_activity_log_created ON admin_activity_log(created_at DESC);

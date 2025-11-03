-- Announcements table for ODeL website
-- Allows admins to create custom announcements and integrates with Moodle announcements

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  featured_image_url VARCHAR(500),
  image_bucket_path VARCHAR(500),
  category VARCHAR(50) DEFAULT 'general',
  author_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft',
  -- Moodle integration fields
  moodle_forum_id INTEGER,
  moodle_post_id INTEGER,
  source VARCHAR(50) DEFAULT 'custom', -- 'custom' or 'moodle'
  CONSTRAINT category_check CHECK (category IN ('general', 'academic', 'admission', 'financial', 'event', 'deadline', 'maintenance', 'other')),
  CONSTRAINT status_check CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT source_check CHECK (source IN ('custom', 'moodle'))
);

-- Create indexes for faster queries
CREATE INDEX idx_announcements_published ON announcements(is_published, published_at DESC);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned, published_at DESC);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_slug ON announcements(slug);
CREATE INDEX idx_announcements_author ON announcements(author_id);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_source ON announcements(source);
CREATE INDEX idx_announcements_expires ON announcements(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);

-- Create RLS policies for announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public can view published announcements
CREATE POLICY "Public can view published announcements"
  ON announcements
  FOR SELECT
  USING (
    is_published = true 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND status = 'published'
  );

-- Admins can manage all announcements
CREATE POLICY "Admins can manage all announcements"
  ON announcements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role IN ('admin', 'editor', 'super_admin')
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_announcements_timestamp
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();


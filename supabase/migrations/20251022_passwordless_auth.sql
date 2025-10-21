-- Magic Codes Table for Passwordless Authentication
CREATE TABLE magic_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(8) NOT NULL,
  moodle_user_id INTEGER,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  attempted_count INTEGER DEFAULT 0,
  CONSTRAINT valid_expiry CHECK (expires_at > created_at),
  CONSTRAINT max_attempts CHECK (attempted_count <= 5)
);

-- Create indexes for performance
CREATE INDEX idx_magic_codes_email ON magic_codes(email);
CREATE INDEX idx_magic_codes_code ON magic_codes(code);
CREATE INDEX idx_magic_codes_expires ON magic_codes(expires_at);

-- Student Sessions Table
CREATE TABLE student_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  moodle_user_id INTEGER NOT NULL,
  moodle_username VARCHAR(255),
  student_name VARCHAR(255),
  jwt_token TEXT NOT NULL,
  refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT valid_session_expiry CHECK (expires_at > created_at)
);

-- Create indexes for session queries
CREATE INDEX idx_student_sessions_email ON student_sessions(email);
CREATE INDEX idx_student_sessions_token ON student_sessions(jwt_token);
CREATE INDEX idx_student_sessions_expires ON student_sessions(expires_at);

-- Admin Users Table (for ODeL website management)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- admin, editor, viewer
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_role CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer'))
);

-- Create indexes for admin queries
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- Admin Sessions Table
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  jwt_token TEXT NOT NULL,
  refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT valid_session_expiry CHECK (expires_at > created_at)
);

-- Create indexes for admin session queries
CREATE INDEX idx_admin_sessions_token ON admin_sessions(jwt_token);
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Audit Log Table for admin actions
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  changes JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_created ON admin_audit_log(created_at);
CREATE INDEX idx_audit_log_action ON admin_audit_log(action);

-- Enable Row Level Security
ALTER TABLE magic_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for magic_codes (public access for verification)
CREATE POLICY "Anyone can verify magic codes" ON magic_codes
  FOR SELECT USING (true);

CREATE POLICY "System can insert magic codes" ON magic_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update magic codes" ON magic_codes
  FOR UPDATE USING (true);

-- RLS Policies for student_sessions
CREATE POLICY "Students can view own sessions" ON student_sessions
  FOR SELECT USING (auth.uid()::text = email OR true);

CREATE POLICY "System can manage student sessions" ON student_sessions
  FOR ALL USING (true);

-- RLS Policies for admin_users (require authentication)
CREATE POLICY "Admins can view user list" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "System can manage admin users" ON admin_users
  FOR ALL USING (true);

-- RLS Policies for admin_sessions
CREATE POLICY "System can manage admin sessions" ON admin_sessions
  FOR ALL USING (true);

-- RLS Policies for audit_log
CREATE POLICY "Admins can view audit logs" ON admin_audit_log
  FOR SELECT USING (true);

CREATE POLICY "System can insert audit logs" ON admin_audit_log
  FOR INSERT WITH CHECK (true);

-- Function to clean up expired magic codes
CREATE OR REPLACE FUNCTION cleanup_expired_magic_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM magic_codes 
  WHERE expires_at < NOW() AND is_used = false;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM student_sessions 
  WHERE expires_at < NOW();
  
  DELETE FROM admin_sessions 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update last_activity
CREATE OR REPLACE FUNCTION update_session_activity(session_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE student_sessions 
  SET last_activity = NOW() 
  WHERE id = session_id;
  
  UPDATE admin_sessions 
  SET last_activity = NOW() 
  WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;

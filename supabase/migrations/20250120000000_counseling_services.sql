-- Counseling Services Tables
-- Supports appointment booking, counselor management, and Zoom integration

-- Counselors Table
CREATE TABLE IF NOT EXISTS counselors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female')),
  specialization TEXT[],
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(admin_user_id)
);

-- Counseling Appointments Table
CREATE TABLE IF NOT EXISTS counseling_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  student_phone VARCHAR(50),
  counselor_id UUID NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type VARCHAR(50) DEFAULT 'individual' CHECK (appointment_type IN ('individual', 'group', 'crisis', 'support_group', 'vct', 'peer', 'pre_marital', 'family', 'mental_health_education')),
  preferred_gender VARCHAR(20) CHECK (preferred_gender IN ('male', 'female', 'no_preference')),
  reason TEXT,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  zoom_meeting_id VARCHAR(255),
  zoom_meeting_url TEXT,
  zoom_start_url TEXT,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES admin_users(id),
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_time_slot UNIQUE (counselor_id, appointment_date, appointment_time)
);

-- Counselor Messages Table (for communication between students and counselors)
CREATE TABLE IF NOT EXISTS counselor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES counseling_appointments(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('student', 'counselor')),
  sender_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Counselor Availability Schedule (for managing available time slots)
CREATE TABLE IF NOT EXISTS counselor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT unique_counselor_day UNIQUE (counselor_id, day_of_week)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_counselors_admin_user ON counselors(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_counselors_active ON counselors(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_counselor ON counseling_appointments(counselor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON counseling_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON counseling_appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_student_email ON counseling_appointments(student_email);
CREATE INDEX IF NOT EXISTS idx_messages_appointment ON counselor_messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_availability_counselor ON counselor_availability(counselor_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_counselors_updated_at BEFORE UPDATE ON counselors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON counseling_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON counselor_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

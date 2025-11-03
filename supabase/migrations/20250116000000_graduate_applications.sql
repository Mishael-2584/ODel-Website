-- Graduate Application and Evaluation Form System
-- Based on UEAB's graduate application procedure

CREATE TABLE IF NOT EXISTS graduate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Personal Information
  surname VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
  nationality VARCHAR(100),
  id_passport_number VARCHAR(50),
  marital_status VARCHAR(20),
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  postal_address TEXT,
  physical_address TEXT,
  
  -- Program Information
  program_applied_for VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  mode_of_study VARCHAR(50) CHECK (mode_of_study IN ('Full-time', 'Part-time', 'Online')),
  entry_level VARCHAR(50),
  proposed_start_date DATE,
  
  -- Academic Qualifications
  undergraduate_degree VARCHAR(255),
  undergraduate_institution VARCHAR(255),
  undergraduate_year INTEGER,
  undergraduate_class VARCHAR(50),
  other_qualifications TEXT,
  
  -- Work Experience
  years_of_experience INTEGER DEFAULT 0,
  current_employer VARCHAR(255),
  current_position VARCHAR(255),
  work_experience_details TEXT,
  
  -- References
  referee1_name VARCHAR(255),
  referee1_position VARCHAR(255),
  referee1_institution VARCHAR(255),
  referee1_email VARCHAR(255),
  referee1_phone VARCHAR(20),
  referee2_name VARCHAR(255),
  referee2_position VARCHAR(255),
  referee2_institution VARCHAR(255),
  referee2_email VARCHAR(255),
  referee2_phone VARCHAR(20),
  
  -- Supporting Documents
  documents_uploaded JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{"type": "transcript", "filename": "...", "url": "..."}, ...]
  
  -- Application Status and Workflow
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
    'submitted',           -- Initial submission
    'under_review',        -- Being reviewed by admissions
    'pending_documents',   -- Missing documents
    'dean_review',         -- With Dean
    'faculty_review',      -- With Faculty
    'approved',            -- Application approved
    'rejected',            -- Application rejected
    'on_hold'              -- Temporarily on hold
  )),
  current_stage VARCHAR(100), -- Track which stage in UEAB procedure
  assigned_to UUID REFERENCES admin_users(id),
  
  -- Evaluation and Decisions
  admission_recommendation TEXT,
  admission_decision VARCHAR(50),
  decision_date TIMESTAMP WITH TIME ZONE,
  decision_by UUID REFERENCES admin_users(id),
  
  -- Internal Notes and Comments
  admin_notes TEXT,
  evaluation_notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Applicant metadata
  submitted_by_email VARCHAR(255),
  ip_address VARCHAR(45),
  
  -- Audit trail
  status_history JSONB DEFAULT '[]'::jsonb
  -- Structure: [{"status": "...", "changed_by": "...", "timestamp": "...", "notes": "..."}, ...]
);

-- Create indexes for faster queries
CREATE INDEX idx_graduate_applications_status ON graduate_applications(status);
CREATE INDEX idx_graduate_applications_application_number ON graduate_applications(application_number);
CREATE INDEX idx_graduate_applications_email ON graduate_applications(email);
CREATE INDEX idx_graduate_applications_submitted_at ON graduate_applications(submitted_at DESC);
CREATE INDEX idx_graduate_applications_program ON graduate_applications(program_applied_for);
CREATE INDEX idx_graduate_applications_assigned_to ON graduate_applications(assigned_to);

-- Function to generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  year_prefix VARCHAR(4);
  sequence_num INTEGER;
  app_number VARCHAR(50);
BEGIN
  year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 8) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM graduate_applications
  WHERE application_number LIKE year_prefix || 'GRA%'
  AND LENGTH(application_number) = 11; -- Format: YYYYGRA0000
  
  app_number := year_prefix || 'GRA' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN app_number;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_graduate_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_graduate_applications_timestamp
  BEFORE UPDATE ON graduate_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_graduate_applications_updated_at();

-- Function to track status changes
CREATE OR REPLACE FUNCTION track_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_history := COALESCE(OLD.status_history, '[]'::jsonb) || jsonb_build_object(
      'status', NEW.status,
      'previous_status', OLD.status,
      'changed_by', NEW.assigned_to,
      'timestamp', CURRENT_TIMESTAMP,
      'notes', NEW.admin_notes
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track status changes
CREATE TRIGGER track_status_changes
  BEFORE UPDATE ON graduate_applications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION track_application_status_change();

-- Create RLS policies
ALTER TABLE graduate_applications ENABLE ROW LEVEL SECURITY;

-- Applicants can view their own applications
CREATE POLICY "Applicants can view own applications"
  ON graduate_applications
  FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Applicants can insert their own applications
CREATE POLICY "Applicants can submit applications"
  ON graduate_applications
  FOR INSERT
  WITH CHECK (true); -- Allow public submissions

-- Admins can manage all applications
CREATE POLICY "Admins can manage all applications"
  ON graduate_applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role IN ('admin', 'editor', 'super_admin')
    )
  );


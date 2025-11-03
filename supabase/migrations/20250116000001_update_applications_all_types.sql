-- Update applications table to support all UEAB application types
-- PhD/Graduate/PGDA, Undergraduate, Diploma/Certificate

-- Add application_type column
ALTER TABLE graduate_applications 
  ADD COLUMN IF NOT EXISTS application_type VARCHAR(50) DEFAULT 'graduate' CHECK (application_type IN ('graduate', 'phd', 'pgda', 'undergraduate', 'diploma', 'certificate'));

-- Add application fee tracking
ALTER TABLE graduate_applications
  ADD COLUMN IF NOT EXISTS application_fee_amount DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS application_fee_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS application_fee_payment_proof VARCHAR(500),
  ADD COLUMN IF NOT EXISTS application_fee_payment_date TIMESTAMP WITH TIME ZONE;

-- Add document uploads tracking (comprehensive)
ALTER TABLE graduate_applications
  ADD COLUMN IF NOT EXISTS documents_status JSONB DEFAULT '{}'::jsonb;
-- Structure: {"degree_certificate": "uploaded", "transcript": "uploaded", "cv": "uploaded", etc.}

-- Add school leaving certificate (for undergraduate/diploma/certificate)
ALTER TABLE graduate_applications
  ADD COLUMN IF NOT EXISTS school_leaving_certificate VARCHAR(500);

-- Add CV/Resume (for graduate applications)
ALTER TABLE graduate_applications
  ADD COLUMN IF NOT EXISTS curriculum_vitae VARCHAR(500);

-- Add passport photo
ALTER TABLE graduate_applications
  ADD COLUMN IF NOT EXISTS passport_photo VARCHAR(500);

-- Add ID card copy
ALTER TABLE graduate_applications
  ADD COLUMN IF NOT EXISTS id_card_copy VARCHAR(500);

-- Add birth certificate copy
ALTER TABLE graduate_applications
  ADD COLUMN IF NOT EXISTS birth_certificate_copy VARCHAR(500);

-- Add KNQA certificate (for foreign qualifications)
ALTER TABLE graduate_applications
  ADD COLUMN IF NOT EXISTS knqa_certificate VARCHAR(500),
  ADD COLUMN IF NOT EXISTS has_foreign_qualification BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS knqa_certificate_required BOOLEAN DEFAULT false;

-- Add referee3 for graduate applications (they need 3 referees)
ALTER TABLE graduate_applications
  ADD COLUMN IF NOT EXISTS referee3_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS referee3_position VARCHAR(255),
  ADD COLUMN IF NOT EXISTS referee3_institution VARCHAR(255),
  ADD COLUMN IF NOT EXISTS referee3_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS referee3_phone VARCHAR(20);

-- Add KCSE/Secondary school information (for undergraduate/diploma/certificate)
ALTER TABLE graduate_applications
  ADD COLUMN IF NOT EXISTS kcse_year INTEGER,
  ADD COLUMN IF NOT EXISTS kcse_index_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS kcse_mean_grade VARCHAR(10),
  ADD COLUMN IF NOT EXISTS secondary_school_name VARCHAR(255);

-- Add index for application type
CREATE INDEX IF NOT EXISTS idx_graduate_applications_type ON graduate_applications(application_type);

-- Add index for fee payment status
CREATE INDEX IF NOT EXISTS idx_graduate_applications_fee_paid ON graduate_applications(application_fee_paid);


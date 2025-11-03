-- Complete application form fields to match UEAB manual form
-- Part 2: General Background and Study Preference
-- Part 3: Educational Background
-- Part 4: Employment Record  
-- Part 5: Career Objectives

-- Part 2 fields - Protected with DO block in case table doesn't exist yet
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'graduate_applications') THEN
    ALTER TABLE graduate_applications
      ADD COLUMN IF NOT EXISTS institution_current_or_last VARCHAR(255),
      ADD COLUMN IF NOT EXISTS proposed_month VARCHAR(20),
      ADD COLUMN IF NOT EXISTS degree_area VARCHAR(255),
      ADD COLUMN IF NOT EXISTS degree_option VARCHAR(255),
      ADD COLUMN IF NOT EXISTS campus_preference VARCHAR(255),
      ADD COLUMN IF NOT EXISTS language_of_instruction VARCHAR(255),
      ADD COLUMN IF NOT EXISTS english_proficiency_written VARCHAR(50),
      ADD COLUMN IF NOT EXISTS english_proficiency_spoken VARCHAR(50),
      ADD COLUMN IF NOT EXISTS accommodation_plan VARCHAR(50),
      ADD COLUMN IF NOT EXISTS accommodation_details TEXT,
      ADD COLUMN IF NOT EXISTS financing_method VARCHAR(100),
      ADD COLUMN IF NOT EXISTS financing_details TEXT,
      ADD COLUMN IF NOT EXISTS educational_background JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS employment_record JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS career_objectives TEXT,
      ADD COLUMN IF NOT EXISTS applicant_signature TEXT,
      ADD COLUMN IF NOT EXISTS signature_date DATE,
      ADD COLUMN IF NOT EXISTS supporting_documents_checklist JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS non_english_documents_note BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS documents_in_original_language TEXT,
      ADD COLUMN IF NOT EXISTS documents_translated_english TEXT;
      
    -- Create index for career objectives search
    CREATE INDEX IF NOT EXISTS idx_applications_career_objectives ON graduate_applications USING gin(to_tsvector('english', career_objectives));
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'graduate_applications') THEN
    COMMENT ON COLUMN graduate_applications.educational_background IS 'JSON array of educational institutions attended with dates and classifications';
    COMMENT ON COLUMN graduate_applications.employment_record IS 'JSON array of employment history with dates, employers, and positions';
    COMMENT ON COLUMN graduate_applications.supporting_documents_checklist IS 'JSON array of checked supporting documents';
  END IF;
END $$;


-- Add missing personal detail fields from UEAB application form

DO $$
BEGIN
  -- Only run if the table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'graduate_applications') THEN
    ALTER TABLE graduate_applications
      ADD COLUMN IF NOT EXISTS place_of_birth VARCHAR(255),
      ADD COLUMN IF NOT EXISTS country_of_residence VARCHAR(255),
      ADD COLUMN IF NOT EXISTS country_of_citizenship VARCHAR(255),
      ADD COLUMN IF NOT EXISTS coming_with_family BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS visa_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS year_of_entry_to_kenya INTEGER,
      ADD COLUMN IF NOT EXISTS religious_affiliation VARCHAR(50),
      ADD COLUMN IF NOT EXISTS church_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS church_address TEXT,
      ADD COLUMN IF NOT EXISTS has_physical_handicap BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS physical_handicap_details TEXT;
      
    -- Update existing nationality field to be more specific
    COMMENT ON COLUMN graduate_applications.nationality IS 'Country of nationality/citizenship';
    COMMENT ON COLUMN graduate_applications.country_of_citizenship IS 'Country of citizenship (may differ from nationality)';
    COMMENT ON COLUMN graduate_applications.country_of_residence IS 'Country where applicant currently resides';
  END IF;
END $$;


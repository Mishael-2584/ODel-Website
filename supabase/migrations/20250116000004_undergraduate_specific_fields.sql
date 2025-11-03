-- Add undergraduate-specific fields from UEAB undergraduate application form

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'graduate_applications') THEN
    -- Undergraduate-specific personal info (note: First Name, Second Name(s), Last Name order)
    ALTER TABLE graduate_applications
      ADD COLUMN IF NOT EXISTS first_name_order_note TEXT,
      ADD COLUMN IF NOT EXISTS second_names VARCHAR(255),
      
      -- Semester and program level
      ADD COLUMN IF NOT EXISTS semester_applying VARCHAR(50), -- 1st Semester (August), 2nd Semester (January), Inter-semester (May)
      ADD COLUMN IF NOT EXISTS semester_year INTEGER,
      ADD COLUMN IF NOT EXISTS level_of_program VARCHAR(50), -- PGDE, Undergraduate, Diploma, Certificate
      
      -- Language information
      ADD COLUMN IF NOT EXISTS language_instruction_secondary VARCHAR(255),
      ADD COLUMN IF NOT EXISTS mother_tongue VARCHAR(255),
      ADD COLUMN IF NOT EXISTS other_languages TEXT,
      
      -- Location details
      ADD COLUMN IF NOT EXISTS county VARCHAR(255),
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS sub_location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS village VARCHAR(255),
      
      -- Religion details
      ADD COLUMN IF NOT EXISTS religion VARCHAR(255),
      ADD COLUMN IF NOT EXISTS denomination VARCHAR(255),
      ADD COLUMN IF NOT EXISTS church_name VARCHAR(255),
      
      -- How they found out about UEAB
      ADD COLUMN IF NOT EXISTS found_out_about_ueab JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS found_out_details TEXT, -- JEAB Student/Worker name
      
      -- Recognition of Prior Learning (RPL)
      ADD COLUMN IF NOT EXISTS has_rpl_qualifications BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS rpl_details TEXT,
      ADD COLUMN IF NOT EXISTS rpl_evaluation_method JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS rpl_mode_of_study VARCHAR(50),
      ADD COLUMN IF NOT EXISTS rpl_certificate_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS has_been_employed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS previous_employers TEXT,
      
      -- Special needs (more detailed)
      ADD COLUMN IF NOT EXISTS special_needs_types JSONB DEFAULT '[]'::jsonb,
      
      -- Personal health
      ADD COLUMN IF NOT EXISTS personal_health_status VARCHAR(50), -- Good, Fair, Poor
      
      -- Family information
      ADD COLUMN IF NOT EXISTS father_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS father_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS father_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS father_religion VARCHAR(255),
      ADD COLUMN IF NOT EXISTS father_denomination VARCHAR(255),
      ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS mother_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS mother_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS mother_religion VARCHAR(255),
      ADD COLUMN IF NOT EXISTS mother_denomination VARCHAR(255),
      ADD COLUMN IF NOT EXISTS legal_guardian_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS legal_guardian_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS legal_guardian_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS parent_sda_employed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS parent_sda_employer_name VARCHAR(255),
      
      -- Consent and commitment
      ADD COLUMN IF NOT EXISTS consent_provider VARCHAR(50), -- Parent, Guardian, Sponsor
      ADD COLUMN IF NOT EXISTS consent_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS consent_signature TEXT,
      ADD COLUMN IF NOT EXISTS consent_date DATE,
      
      ADD COLUMN IF NOT EXISTS financial_responsibility_provider VARCHAR(50), -- Parent, Guardian, Sponsor, Other
      ADD COLUMN IF NOT EXISTS financial_responsibility_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS financial_responsibility_signature TEXT,
      ADD COLUMN IF NOT EXISTS financial_responsibility_date DATE,
      
      ADD COLUMN IF NOT EXISTS applicant_commitment_accepted BOOLEAN DEFAULT false,
      
      ADD COLUMN IF NOT EXISTS data_protection_consent_accepted BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS data_protection_consent_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS data_protection_consent_signature TEXT,
      ADD COLUMN IF NOT EXISTS data_protection_consent_date DATE,
      
      ADD COLUMN IF NOT EXISTS is_minor BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS minor_consent_provider VARCHAR(50),
      ADD COLUMN IF NOT EXISTS minor_consent_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS minor_consent_signature TEXT,
      ADD COLUMN IF NOT EXISTS minor_consent_date DATE,
      
      -- Payment information
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50), -- Mpesa, Bank Transfer
      ADD COLUMN IF NOT EXISTS payment_receipt_number VARCHAR(255),
      ADD COLUMN IF NOT EXISTS payment_transaction_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10), -- KES, USD
      
      -- Mpesa details
      ADD COLUMN IF NOT EXISTS mpesa_paybill VARCHAR(50) DEFAULT '4077813',
      ADD COLUMN IF NOT EXISTS mpesa_account VARCHAR(255) DEFAULT 'APPLICATION FEE',
      
      -- Bank details for USD
      ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255) DEFAULT 'University of Eastern Africa, Baraton',
      ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255) DEFAULT 'Kenya Commercial Bank',
      ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(255) DEFAULT 'Kapsabet',
      ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(255) DEFAULT '1102100692',
      ADD COLUMN IF NOT EXISTS bank_swift_code VARCHAR(50) DEFAULT 'KCBLKENX';
      
  END IF;
END $$;

COMMENT ON COLUMN graduate_applications.first_name_order_note IS 'Note about name order matching KCSE certificate';
COMMENT ON COLUMN graduate_applications.found_out_about_ueab IS 'JSON array of how applicant found out about UEAB';
COMMENT ON COLUMN graduate_applications.special_needs_types IS 'JSON array of special need types: Mental, Physical, Hearing, Sight, Sensory, Other';


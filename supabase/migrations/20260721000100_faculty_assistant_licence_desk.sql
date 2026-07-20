-- Administrative lifecycle fields for the separate Faculty Assistant Licence Desk.

ALTER TABLE faculty_assistant_upgrade_requests
  ADD COLUMN IF NOT EXISTS billing_period TEXT
    CHECK (billing_period IS NULL OR billing_period IN ('monthly', 'annual')),
  ADD COLUMN IF NOT EXISTS payment_reference TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS handled_by UUID,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS faculty_assistant_institution_licences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodle_instance TEXT UNIQUE NOT NULL,
  institution_name TEXT NOT NULL,
  features TEXT[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  source_request_id UUID REFERENCES faculty_assistant_upgrade_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE faculty_assistant_institution_licences ENABLE ROW LEVEL SECURITY;

ALTER TABLE faculty_assistant_entitlements
  ADD COLUMN IF NOT EXISTS billing_period TEXT
    CHECK (billing_period IS NULL OR billing_period IN ('monthly', 'annual')),
  ADD COLUMN IF NOT EXISTS source_request_id UUID
    REFERENCES faculty_assistant_upgrade_requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS institution_licence_id UUID
    REFERENCES faculty_assistant_institution_licences(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_fa_entitlements_active_expiry
  ON faculty_assistant_entitlements(is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_fa_institution_licences_active_expiry
  ON faculty_assistant_institution_licences(is_active, expires_at);

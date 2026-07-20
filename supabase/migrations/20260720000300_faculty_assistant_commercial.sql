-- Commercial requests and idempotent premium Moodle publishing.
-- These tables remain service-role only; no browser RLS policies are added.

CREATE TABLE IF NOT EXISTS faculty_assistant_publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_id UUID NOT NULL REFERENCES faculty_assistant_entitlements(id),
  idempotency_key TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  moodle_instance TEXT NOT NULL,
  moodle_user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'succeeded', 'failed')),
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (entitlement_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_fa_publish_jobs_user_created
  ON faculty_assistant_publish_jobs(moodle_instance, moodle_user_id, created_at DESC);

ALTER TABLE faculty_assistant_publish_jobs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS faculty_assistant_upgrade_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodle_instance TEXT NOT NULL,
  moodle_user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  requested_plan TEXT NOT NULL CHECK (requested_plan IN ('professional', 'institution')),
  phone TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'web',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'paid', 'activated', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fa_upgrade_requests_status_created
  ON faculty_assistant_upgrade_requests(status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fa_upgrade_requests_open_user_plan
  ON faculty_assistant_upgrade_requests(moodle_instance, moodle_user_id, requested_plan)
  WHERE status IN ('pending', 'contacted', 'paid');

ALTER TABLE faculty_assistant_upgrade_requests ENABLE ROW LEVEL SECURITY;

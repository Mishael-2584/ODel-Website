-- Additive schema for Faculty Assistant desktop authorization.
-- RLS is enabled without client policies: only the server-side service role can access these tables.

CREATE TABLE IF NOT EXISTS faculty_assistant_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodle_user_id INTEGER UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'professional' CHECK (plan IN ('professional', 'institution', 'pilot')),
  features TEXT[] NOT NULL DEFAULT ARRAY['profile:read', 'courses:read']::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_assistant_authorization_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  code_challenge_method TEXT NOT NULL CHECK (code_challenge_method = 'S256'),
  moodle_user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  scopes TEXT[] NOT NULL,
  entitlement_id UUID NOT NULL REFERENCES faculty_assistant_entitlements(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_assistant_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  moodle_user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  scopes TEXT[] NOT NULL,
  entitlement_id UUID NOT NULL REFERENCES faculty_assistant_entitlements(id),
  device_name TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  replaced_by UUID REFERENCES faculty_assistant_refresh_tokens(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS faculty_assistant_audit_log (
  id BIGSERIAL PRIMARY KEY,
  moodle_user_id INTEGER,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'denied', 'failed')),
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fa_codes_expires ON faculty_assistant_authorization_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_fa_refresh_user ON faculty_assistant_refresh_tokens(moodle_user_id);
CREATE INDEX IF NOT EXISTS idx_fa_refresh_expires ON faculty_assistant_refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_fa_audit_user_created ON faculty_assistant_audit_log(moodle_user_id, created_at DESC);

ALTER TABLE faculty_assistant_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_assistant_authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_assistant_refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_assistant_audit_log ENABLE ROW LEVEL SECURITY;

-- Pilot grant example (replace values; do not commit real user data):
-- INSERT INTO faculty_assistant_entitlements (moodle_user_id, email, plan, features)
-- VALUES (123, 'lecturer@ueab.ac.ke', 'pilot', ARRAY['profile:read', 'courses:read', 'grades:read']);

-- Namespace Moodle identities so local, staging, and production user IDs cannot collide.

ALTER TABLE faculty_assistant_entitlements
  ADD COLUMN IF NOT EXISTS moodle_instance TEXT NOT NULL DEFAULT 'ueab-production';

ALTER TABLE faculty_assistant_authorization_codes
  ADD COLUMN IF NOT EXISTS moodle_instance TEXT NOT NULL DEFAULT 'ueab-production';

ALTER TABLE faculty_assistant_refresh_tokens
  ADD COLUMN IF NOT EXISTS moodle_instance TEXT NOT NULL DEFAULT 'ueab-production';

ALTER TABLE faculty_assistant_audit_log
  ADD COLUMN IF NOT EXISTS moodle_instance TEXT;

ALTER TABLE faculty_assistant_entitlements
  DROP CONSTRAINT IF EXISTS faculty_assistant_entitlements_moodle_user_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fa_entitlement_instance_user
  ON faculty_assistant_entitlements(moodle_instance, moodle_user_id);

CREATE INDEX IF NOT EXISTS idx_fa_audit_instance_user_created
  ON faculty_assistant_audit_log(moodle_instance, moodle_user_id, created_at DESC);

-- Allow verified UEAB identities to use the offline Essential workspace while
-- preserving connected Moodle scopes for paid licences.

ALTER TABLE faculty_assistant_entitlements
  DROP CONSTRAINT IF EXISTS faculty_assistant_entitlements_plan_check;

ALTER TABLE faculty_assistant_entitlements
  ADD CONSTRAINT faculty_assistant_entitlements_plan_check
  CHECK (plan IN ('essential', 'professional', 'institution', 'pilot'));

ALTER TABLE faculty_assistant_entitlements
  ALTER COLUMN plan SET DEFAULT 'essential';

ALTER TABLE faculty_assistant_entitlements
  ALTER COLUMN features SET DEFAULT ARRAY['profile:read']::TEXT[];

COMMENT ON COLUMN faculty_assistant_entitlements.plan IS
  'Essential grants verified identity only; paid plans add connected Moodle and institution features.';

-- Institution-scoped grade moderation for Faculty Assistant.
-- All tables are service-role only; desktop and moderator clients use ODeL APIs.

CREATE TABLE IF NOT EXISTS faculty_assistant_moderation_settings (
  institution_licence_id UUID PRIMARY KEY
    REFERENCES faculty_assistant_institution_licences(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'optional'
    CHECK (mode IN ('disabled', 'optional', 'required')),
  retention_days INTEGER NOT NULL DEFAULT 2555
    CHECK (retention_days BETWEEN 30 AND 3650),
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO faculty_assistant_moderation_settings (institution_licence_id)
SELECT id
  FROM faculty_assistant_institution_licences
ON CONFLICT (institution_licence_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS faculty_assistant_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_licence_id UUID NOT NULL
    REFERENCES faculty_assistant_institution_licences(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  scope_type TEXT NOT NULL DEFAULT 'institution'
    CHECK (scope_type IN ('institution', 'school', 'course')),
  scope_values TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_licence_id, auth_user_id),
  UNIQUE (institution_licence_id, email)
);

ALTER TABLE faculty_assistant_moderators
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS faculty_assistant_moderation_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_licence_id UUID NOT NULL
    REFERENCES faculty_assistant_institution_licences(id) ON DELETE RESTRICT,
  entitlement_id UUID NOT NULL
    REFERENCES faculty_assistant_entitlements(id) ON DELETE RESTRICT,
  moodle_instance TEXT NOT NULL,
  moodle_user_id BIGINT NOT NULL,
  lecturer_email TEXT NOT NULL,
  lecturer_name TEXT NOT NULL,
  moodle_course_id BIGINT,
  course_code TEXT NOT NULL,
  course_title TEXT NOT NULL,
  academic_period TEXT NOT NULL DEFAULT '',
  school_name TEXT NOT NULL DEFAULT '',
  local_version_id TEXT NOT NULL,
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  version_checksum TEXT NOT NULL CHECK (version_checksum ~ '^[a-f0-9]{64}$'),
  previous_version_checksum TEXT,
  snapshot JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN (
      'submitted',
      'approved',
      'changes_requested',
      'superseded',
      'withdrawn'
    )),
  decision_note TEXT NOT NULL DEFAULT '',
  decided_by UUID REFERENCES faculty_assistant_moderators(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ,
  approval_receipt TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (
    institution_licence_id,
    entitlement_id,
    moodle_course_id,
    local_version_id
  )
);

CREATE TABLE IF NOT EXISTS faculty_assistant_moderation_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL
    REFERENCES faculty_assistant_moderation_submissions(id) ON DELETE RESTRICT,
  institution_licence_id UUID NOT NULL
    REFERENCES faculty_assistant_institution_licences(id) ON DELETE RESTRICT,
  moderator_id UUID NOT NULL
    REFERENCES faculty_assistant_moderators(id) ON DELETE RESTRICT,
  decision TEXT NOT NULL
    CHECK (decision IN ('approved', 'changes_requested')),
  note TEXT NOT NULL DEFAULT '',
  approval_receipt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fa_moderators_auth_active
  ON faculty_assistant_moderators(auth_user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_fa_moderation_submissions_institution_status
  ON faculty_assistant_moderation_submissions(
    institution_licence_id,
    status,
    submitted_at DESC
  );

CREATE INDEX IF NOT EXISTS idx_fa_moderation_submissions_lecturer_course
  ON faculty_assistant_moderation_submissions(
    entitlement_id,
    moodle_course_id,
    submitted_at DESC
  );

ALTER TABLE faculty_assistant_moderation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_assistant_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_assistant_moderation_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_assistant_moderation_decisions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION faculty_assistant_moderation_decide(
  p_submission_id UUID,
  p_moderator_auth_user_id UUID,
  p_decision TEXT,
  p_note TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submissionrow faculty_assistant_moderation_submissions%ROWTYPE;
  moderatorrow faculty_assistant_moderators%ROWTYPE;
  normalizednote TEXT := BTRIM(COALESCE(p_note, ''));
  receipt TEXT := NULL;
  inscope BOOLEAN := false;
BEGIN
  IF p_decision NOT IN ('approved', 'changes_requested') THEN
    RAISE EXCEPTION 'Invalid moderation decision' USING ERRCODE = '22023';
  END IF;
  IF p_decision = 'changes_requested' AND normalizednote = '' THEN
    RAISE EXCEPTION 'A correction note is required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO submissionrow
    FROM faculty_assistant_moderation_submissions
   WHERE id = p_submission_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Moderation submission not found' USING ERRCODE = 'P0002';
  END IF;
  IF submissionrow.status <> 'submitted' THEN
    RAISE EXCEPTION 'Moderation submission is no longer awaiting review'
      USING ERRCODE = '22023';
  END IF;

  SELECT * INTO moderatorrow
    FROM faculty_assistant_moderators
   WHERE auth_user_id = p_moderator_auth_user_id
     AND institution_licence_id = submissionrow.institution_licence_id
     AND is_active = true
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Moderator is not authorized for this institution'
      USING ERRCODE = '42501';
  END IF;

  inscope := moderatorrow.scope_type = 'institution'
    OR (
      moderatorrow.scope_type = 'school'
      AND EXISTS (
        SELECT 1
          FROM UNNEST(moderatorrow.scope_values) AS value
         WHERE LOWER(BTRIM(value)) = LOWER(BTRIM(submissionrow.school_name))
      )
    )
    OR (
      moderatorrow.scope_type = 'course'
      AND EXISTS (
        SELECT 1
          FROM UNNEST(moderatorrow.scope_values) AS value
         WHERE LOWER(BTRIM(value)) = LOWER(BTRIM(submissionrow.course_code))
            OR BTRIM(value) = COALESCE(submissionrow.moodle_course_id::TEXT, '')
      )
    );
  IF NOT inscope THEN
    RAISE EXCEPTION 'Moderator scope does not include this course'
      USING ERRCODE = '42501';
  END IF;

  IF p_decision = 'approved' THEN
    receipt := gen_random_uuid()::TEXT || '-' || gen_random_uuid()::TEXT;
    UPDATE faculty_assistant_moderation_submissions
       SET status = 'superseded', updated_at = NOW()
     WHERE institution_licence_id = submissionrow.institution_licence_id
       AND entitlement_id = submissionrow.entitlement_id
       AND moodle_course_id IS NOT DISTINCT FROM submissionrow.moodle_course_id
       AND id <> submissionrow.id
       AND status = 'approved';
  END IF;

  UPDATE faculty_assistant_moderation_submissions
     SET status = p_decision,
         decision_note = normalizednote,
         decided_by = moderatorrow.id,
         decided_at = NOW(),
         approval_receipt = receipt,
         updated_at = NOW()
   WHERE id = submissionrow.id;

  INSERT INTO faculty_assistant_moderation_decisions (
    submission_id,
    institution_licence_id,
    moderator_id,
    decision,
    note,
    approval_receipt
  ) VALUES (
    submissionrow.id,
    submissionrow.institution_licence_id,
    moderatorrow.id,
    p_decision,
    normalizednote,
    receipt
  );

  INSERT INTO faculty_assistant_audit_log (
    moodle_user_id,
    moodle_instance,
    action,
    resource_type,
    resource_id,
    outcome,
    details
  ) VALUES (
    submissionrow.moodle_user_id,
    submissionrow.moodle_instance,
    'moderation.' || p_decision,
    'moderation_submission',
    submissionrow.id::TEXT,
    'success',
    jsonb_build_object(
      'institutionLicenceId', submissionrow.institution_licence_id,
      'moderatorId', moderatorrow.id,
      'moderatorEmail', moderatorrow.email,
      'courseCode', submissionrow.course_code,
      'versionNumber', submissionrow.version_number,
      'versionChecksum', submissionrow.version_checksum
    )
  );

  RETURN jsonb_build_object(
    'id', submissionrow.id,
    'status', p_decision,
    'decisionNote', normalizednote,
    'decidedAt', NOW(),
    'moderatorName', moderatorrow.full_name,
    'approvalReceipt', receipt
  );
END;
$$;

REVOKE ALL ON FUNCTION faculty_assistant_moderation_decide(
  UUID, UUID, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION faculty_assistant_moderation_decide(
  UUID, UUID, TEXT, TEXT
) TO service_role;

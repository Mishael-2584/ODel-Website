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

CREATE OR REPLACE FUNCTION faculty_assistant_admin_activate_request(
  p_request_id UUID,
  p_plan TEXT,
  p_billing_period TEXT,
  p_features TEXT[],
  p_expires_at TIMESTAMPTZ,
  p_institution_name TEXT,
  p_payment_reference TEXT,
  p_admin_notes TEXT,
  p_admin_id UUID,
  p_admin_email TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requestrow faculty_assistant_upgrade_requests%ROWTYPE;
  entitlementrow faculty_assistant_entitlements%ROWTYPE;
  institutionlicenceid UUID := NULL;
BEGIN
  SELECT * INTO requestrow
    FROM faculty_assistant_upgrade_requests
   WHERE id = p_request_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Upgrade request not found' USING ERRCODE = 'P0002';
  END IF;
  IF requestrow.status NOT IN ('pending', 'contacted', 'paid') THEN
    RAISE EXCEPTION 'Upgrade request is not open for activation' USING ERRCODE = '22023';
  END IF;
  IF p_plan NOT IN ('professional', 'institution') OR requestrow.requested_plan <> p_plan THEN
    RAISE EXCEPTION 'Requested plan does not match activation plan' USING ERRCODE = '22023';
  END IF;
  IF p_billing_period NOT IN ('monthly', 'annual') OR p_expires_at <= NOW() THEN
    RAISE EXCEPTION 'Invalid billing period or expiry' USING ERRCODE = '22023';
  END IF;

  IF p_plan = 'institution' THEN
    IF NULLIF(BTRIM(p_institution_name), '') IS NULL THEN
      RAISE EXCEPTION 'Institution name is required' USING ERRCODE = '22023';
    END IF;
    INSERT INTO faculty_assistant_institution_licences (
      moodle_instance, institution_name, features, is_active, expires_at,
      source_request_id, updated_at
    ) VALUES (
      requestrow.moodle_instance, BTRIM(p_institution_name), p_features, true,
      p_expires_at, requestrow.id, NOW()
    )
    ON CONFLICT (moodle_instance) DO UPDATE SET
      institution_name = EXCLUDED.institution_name,
      features = EXCLUDED.features,
      is_active = true,
      expires_at = EXCLUDED.expires_at,
      source_request_id = EXCLUDED.source_request_id,
      updated_at = NOW()
    RETURNING id INTO institutionlicenceid;
  END IF;

  INSERT INTO faculty_assistant_entitlements (
    moodle_instance, moodle_user_id, email, plan, features, is_active,
    expires_at, billing_period, source_request_id, institution_licence_id, updated_at
  ) VALUES (
    requestrow.moodle_instance, requestrow.moodle_user_id, requestrow.email,
    p_plan, p_features, true, p_expires_at, p_billing_period, requestrow.id,
    institutionlicenceid, NOW()
  )
  ON CONFLICT (moodle_instance, moodle_user_id) DO UPDATE SET
    email = EXCLUDED.email,
    plan = EXCLUDED.plan,
    features = EXCLUDED.features,
    is_active = true,
    expires_at = EXCLUDED.expires_at,
    billing_period = EXCLUDED.billing_period,
    source_request_id = EXCLUDED.source_request_id,
    institution_licence_id = EXCLUDED.institution_licence_id,
    updated_at = NOW()
  RETURNING * INTO entitlementrow;

  UPDATE faculty_assistant_upgrade_requests SET
    status = 'activated',
    billing_period = p_billing_period,
    payment_reference = p_payment_reference,
    admin_notes = p_admin_notes,
    handled_by = p_admin_id,
    activated_at = NOW(),
    updated_at = NOW()
  WHERE id = requestrow.id;

  INSERT INTO faculty_assistant_audit_log (
    moodle_user_id, moodle_instance, action, resource_type, resource_id,
    outcome, details
  ) VALUES (
    requestrow.moodle_user_id, requestrow.moodle_instance, 'licence.activation',
    'upgrade_request', requestrow.id::TEXT, 'success',
    jsonb_build_object(
      'plan', p_plan,
      'billingPeriod', p_billing_period,
      'entitlementId', entitlementrow.id,
      'institutionLicenceId', institutionlicenceid,
      'expiresAt', p_expires_at,
      'adminId', p_admin_id,
      'adminEmail', p_admin_email
    )
  );

  RETURN jsonb_build_object(
    'id', entitlementrow.id,
    'plan', entitlementrow.plan,
    'expires_at', entitlementrow.expires_at,
    'features', entitlementrow.features,
    'institution_licence_id', institutionlicenceid
  );
END;
$$;

CREATE OR REPLACE FUNCTION faculty_assistant_admin_update_institution(
  p_institution_id UUID,
  p_action TEXT,
  p_expires_at TIMESTAMPTZ,
  p_admin_id UUID,
  p_admin_email TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  institutionrow faculty_assistant_institution_licences%ROWTYPE;
  affectedentitlements INTEGER := 0;
BEGIN
  SELECT * INTO institutionrow
    FROM faculty_assistant_institution_licences
   WHERE id = p_institution_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Institution licence not found' USING ERRCODE = 'P0002';
  END IF;
  IF p_action NOT IN ('revoke', 'restore', 'extend') THEN
    RAISE EXCEPTION 'Invalid institution action' USING ERRCODE = '22023';
  END IF;

  IF p_action = 'revoke' THEN
    UPDATE faculty_assistant_institution_licences
       SET is_active = false, updated_at = NOW()
     WHERE id = institutionrow.id;
    UPDATE faculty_assistant_entitlements
       SET is_active = false, updated_at = NOW()
     WHERE institution_licence_id = institutionrow.id;
    GET DIAGNOSTICS affectedentitlements = ROW_COUNT;
  ELSIF p_action = 'extend' THEN
    IF p_expires_at IS NULL OR p_expires_at <= NOW() THEN
      RAISE EXCEPTION 'A future expiry is required' USING ERRCODE = '22023';
    END IF;
    UPDATE faculty_assistant_institution_licences
       SET is_active = true, expires_at = p_expires_at, updated_at = NOW()
     WHERE id = institutionrow.id;
    UPDATE faculty_assistant_entitlements
       SET is_active = true, expires_at = p_expires_at, updated_at = NOW()
     WHERE institution_licence_id = institutionrow.id;
    GET DIAGNOSTICS affectedentitlements = ROW_COUNT;
  ELSE
    UPDATE faculty_assistant_institution_licences
       SET is_active = true, updated_at = NOW()
     WHERE id = institutionrow.id;
  END IF;

  SELECT * INTO institutionrow
    FROM faculty_assistant_institution_licences
   WHERE id = institutionrow.id;

  INSERT INTO faculty_assistant_audit_log (
    moodle_instance, action, resource_type, resource_id, outcome, details
  ) VALUES (
    institutionrow.moodle_instance, 'institution.' || p_action,
    'institution_licence', institutionrow.id::TEXT, 'success',
    jsonb_build_object(
      'adminId', p_admin_id,
      'adminEmail', p_admin_email,
      'institutionName', institutionrow.institution_name,
      'affectedEntitlements', affectedentitlements
    )
  );

  RETURN jsonb_build_object(
    'id', institutionrow.id,
    'is_active', institutionrow.is_active,
    'expires_at', institutionrow.expires_at,
    'affected_entitlements', affectedentitlements
  );
END;
$$;

CREATE OR REPLACE FUNCTION faculty_assistant_admin_update_request_status(
  p_request_id UUID,
  p_status TEXT,
  p_payment_reference TEXT,
  p_admin_notes TEXT,
  p_admin_id UUID,
  p_admin_email TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requestrow faculty_assistant_upgrade_requests%ROWTYPE;
BEGIN
  IF p_status NOT IN ('contacted', 'paid', 'declined') THEN
    RAISE EXCEPTION 'Invalid request status' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO requestrow
    FROM faculty_assistant_upgrade_requests
   WHERE id = p_request_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Upgrade request not found' USING ERRCODE = 'P0002';
  END IF;
  IF requestrow.status NOT IN ('pending', 'contacted', 'paid') THEN
    RAISE EXCEPTION 'Upgrade request is not open for changes' USING ERRCODE = '22023';
  END IF;

  UPDATE faculty_assistant_upgrade_requests SET
    status = p_status,
    payment_reference = p_payment_reference,
    admin_notes = p_admin_notes,
    handled_by = p_admin_id,
    updated_at = NOW()
  WHERE id = requestrow.id;

  INSERT INTO faculty_assistant_audit_log (
    moodle_user_id, moodle_instance, action, resource_type, resource_id,
    outcome, details
  ) VALUES (
    requestrow.moodle_user_id, requestrow.moodle_instance,
    'licence.request.' || p_status, 'upgrade_request', requestrow.id::TEXT,
    'success', jsonb_build_object('adminId', p_admin_id, 'adminEmail', p_admin_email)
  );

  RETURN jsonb_build_object('id', requestrow.id, 'status', p_status);
END;
$$;

REVOKE ALL ON FUNCTION faculty_assistant_admin_activate_request(UUID, TEXT, TEXT, TEXT[], TIMESTAMPTZ, TEXT, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION faculty_assistant_admin_update_institution(UUID, TEXT, TIMESTAMPTZ, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION faculty_assistant_admin_update_request_status(UUID, TEXT, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION faculty_assistant_admin_activate_request(UUID, TEXT, TEXT, TEXT[], TIMESTAMPTZ, TEXT, TEXT, TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION faculty_assistant_admin_update_institution(UUID, TEXT, TIMESTAMPTZ, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION faculty_assistant_admin_update_request_status(UUID, TEXT, TEXT, TEXT, UUID, TEXT) TO service_role;

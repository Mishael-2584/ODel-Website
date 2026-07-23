-- Institution licences can be sold for one semester or for a discounted year.

ALTER TABLE faculty_assistant_upgrade_requests
  DROP CONSTRAINT IF EXISTS faculty_assistant_upgrade_requests_billing_period_check;
ALTER TABLE faculty_assistant_upgrade_requests
  ADD CONSTRAINT faculty_assistant_upgrade_requests_billing_period_check
  CHECK (billing_period IS NULL OR billing_period IN ('monthly', 'semester', 'annual'));

ALTER TABLE faculty_assistant_entitlements
  DROP CONSTRAINT IF EXISTS faculty_assistant_entitlements_billing_period_check;
ALTER TABLE faculty_assistant_entitlements
  ADD CONSTRAINT faculty_assistant_entitlements_billing_period_check
  CHECK (billing_period IS NULL OR billing_period IN ('monthly', 'semester', 'annual'));

ALTER TABLE faculty_assistant_institution_licences
  ADD COLUMN IF NOT EXISTS billing_period TEXT;
UPDATE faculty_assistant_institution_licences
   SET billing_period = 'annual'
 WHERE billing_period IS NULL;
ALTER TABLE faculty_assistant_institution_licences
  ALTER COLUMN billing_period SET DEFAULT 'annual',
  ALTER COLUMN billing_period SET NOT NULL,
  DROP CONSTRAINT IF EXISTS faculty_assistant_institution_licences_billing_period_check;
ALTER TABLE faculty_assistant_institution_licences
  ADD CONSTRAINT faculty_assistant_institution_licences_billing_period_check
  CHECK (billing_period IN ('semester', 'annual'));

CREATE OR REPLACE FUNCTION faculty_assistant_admin_activate_request_v2(
  p_request_id UUID,
  p_plan TEXT,
  p_billing_period TEXT,
  p_features TEXT[],
  p_expires_at TIMESTAMPTZ,
  p_institution_name TEXT,
  p_email_domains TEXT[],
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
  normalizeddomains TEXT[] := '{}';
  requestdomain TEXT;
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
  IF (
    (p_plan = 'professional' AND p_billing_period NOT IN ('monthly', 'annual'))
    OR (p_plan = 'institution' AND p_billing_period NOT IN ('semester', 'annual'))
    OR p_expires_at <= NOW()
  ) THEN
    RAISE EXCEPTION 'Invalid billing period or expiry' USING ERRCODE = '22023';
  END IF;

  IF p_plan = 'institution' THEN
    IF NULLIF(BTRIM(p_institution_name), '') IS NULL THEN
      RAISE EXCEPTION 'Institution name is required' USING ERRCODE = '22023';
    END IF;
    SELECT COALESCE(ARRAY_AGG(DISTINCT domain), '{}') INTO normalizeddomains
      FROM (
        SELECT LOWER(TRIM(LEADING '@' FROM BTRIM(value))) AS domain
          FROM UNNEST(COALESCE(p_email_domains, '{}')) AS value
      ) domains
     WHERE domain ~ '^[a-z0-9][a-z0-9.-]*[a-z0-9]$'
       AND domain NOT LIKE '%..%'
       AND POSITION('.' IN domain) > 0;
    IF CARDINALITY(normalizeddomains) = 0 THEN
      RAISE EXCEPTION 'At least one valid institution email domain is required' USING ERRCODE = '22023';
    END IF;
    requestdomain := LOWER(SPLIT_PART(requestrow.email, '@', 2));
    IF NOT requestdomain = ANY(normalizeddomains) THEN
      RAISE EXCEPTION 'Request email is outside the approved institution domains' USING ERRCODE = '22023';
    END IF;

    INSERT INTO faculty_assistant_institution_licences (
      moodle_instance, institution_name, email_domains, features, is_active,
      expires_at, billing_period, source_request_id, updated_at
    ) VALUES (
      requestrow.moodle_instance, BTRIM(p_institution_name), normalizeddomains,
      p_features, true, p_expires_at, p_billing_period, requestrow.id, NOW()
    )
    ON CONFLICT (moodle_instance) DO UPDATE SET
      institution_name = EXCLUDED.institution_name,
      email_domains = EXCLUDED.email_domains,
      features = EXCLUDED.features,
      is_active = true,
      expires_at = EXCLUDED.expires_at,
      billing_period = EXCLUDED.billing_period,
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
    status = 'activated', billing_period = p_billing_period,
    payment_reference = p_payment_reference, admin_notes = p_admin_notes,
    handled_by = p_admin_id, activated_at = NOW(), updated_at = NOW()
  WHERE id = requestrow.id;

  INSERT INTO faculty_assistant_audit_log (
    moodle_user_id, moodle_instance, action, resource_type, resource_id,
    outcome, details
  ) VALUES (
    requestrow.moodle_user_id, requestrow.moodle_instance, 'licence.activation',
    'upgrade_request', requestrow.id::TEXT, 'success',
    jsonb_build_object(
      'plan', p_plan, 'billingPeriod', p_billing_period,
      'entitlementId', entitlementrow.id,
      'institutionLicenceId', institutionlicenceid,
      'institutionDomains', normalizeddomains,
      'expiresAt', p_expires_at, 'adminId', p_admin_id,
      'adminEmail', p_admin_email
    )
  );

  RETURN jsonb_build_object(
    'id', entitlementrow.id, 'plan', entitlementrow.plan,
    'expires_at', entitlementrow.expires_at, 'features', entitlementrow.features,
    'billing_period', entitlementrow.billing_period,
    'institution_licence_id', institutionlicenceid,
    'institution_domains', normalizeddomains
  );
END;
$$;

REVOKE ALL ON FUNCTION faculty_assistant_admin_activate_request_v2(
  UUID, TEXT, TEXT, TEXT[], TIMESTAMPTZ, TEXT, TEXT[], TEXT, TEXT, UUID, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION faculty_assistant_admin_activate_request_v2(
  UUID, TEXT, TEXT, TEXT[], TIMESTAMPTZ, TEXT, TEXT[], TEXT, TEXT, UUID, TEXT
) TO service_role;

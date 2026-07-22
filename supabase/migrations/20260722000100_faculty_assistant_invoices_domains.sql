ALTER TABLE faculty_assistant_upgrade_requests
  ADD COLUMN IF NOT EXISTS invoice_status TEXT NOT NULL DEFAULT 'not_sent'
    CHECK (invoice_status IN ('not_sent', 'sent', 'failed')),
  ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invoice_error TEXT NOT NULL DEFAULT '';

ALTER TABLE faculty_assistant_institution_licences
  ADD COLUMN IF NOT EXISTS email_domains TEXT[] NOT NULL DEFAULT '{}';

WITH request_domains AS (
  SELECT
    request.id,
    LOWER(BTRIM(SPLIT_PART(request.email, '@', 2))) AS domain
  FROM faculty_assistant_upgrade_requests AS request
)
UPDATE faculty_assistant_institution_licences AS licence
   SET email_domains = ARRAY[request.domain]
  FROM request_domains AS request
 WHERE request.id = licence.source_request_id
   AND CARDINALITY(licence.email_domains) = 0
   AND request.domain ~ '^[a-z0-9][a-z0-9.-]*[a-z0-9]$'
   AND request.domain NOT LIKE '%..%'
   AND POSITION('.' IN request.domain) > 0;

UPDATE faculty_assistant_institution_licences AS licence
   SET email_domains = '{}'
 WHERE EXISTS (
   SELECT 1
     FROM UNNEST(licence.email_domains) AS domain
    WHERE domain !~ '^[a-z0-9][a-z0-9.-]*[a-z0-9]$'
       OR domain LIKE '%..%'
       OR POSITION('.' IN domain) = 0
 );

DROP FUNCTION IF EXISTS faculty_assistant_admin_activate_request(
  UUID, TEXT, TEXT, TEXT[], TIMESTAMPTZ, TEXT, TEXT, TEXT, UUID, TEXT
);

CREATE OR REPLACE FUNCTION faculty_assistant_admin_activate_request(
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
  IF p_billing_period NOT IN ('monthly', 'annual') OR p_expires_at <= NOW() THEN
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
      expires_at, source_request_id, updated_at
    ) VALUES (
      requestrow.moodle_instance, BTRIM(p_institution_name), normalizeddomains,
      p_features, true, p_expires_at, requestrow.id, NOW()
    )
    ON CONFLICT (moodle_instance) DO UPDATE SET
      institution_name = EXCLUDED.institution_name,
      email_domains = EXCLUDED.email_domains,
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
    'institution_licence_id', institutionlicenceid,
    'institution_domains', normalizeddomains
  );
END;
$$;

REVOKE ALL ON FUNCTION faculty_assistant_admin_activate_request(
  UUID, TEXT, TEXT, TEXT[], TIMESTAMPTZ, TEXT, TEXT[], TEXT, TEXT, UUID, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION faculty_assistant_admin_activate_request(
  UUID, TEXT, TEXT, TEXT[], TIMESTAMPTZ, TEXT, TEXT[], TEXT, TEXT, UUID, TEXT
) TO service_role;

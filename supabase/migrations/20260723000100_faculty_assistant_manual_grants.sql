CREATE OR REPLACE FUNCTION public.faculty_assistant_admin_grant_professional(
  p_moodle_instance TEXT,
  p_moodle_user_id INTEGER,
  p_email TEXT,
  p_expires_at TIMESTAMPTZ,
  p_admin_id TEXT,
  p_admin_email TEXT
)
RETURNS public.faculty_assistant_entitlements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_plan TEXT;
  granted public.faculty_assistant_entitlements;
BEGIN
  IF NULLIF(BTRIM(p_moodle_instance), '') IS NULL
     OR p_moodle_user_id <= 0
     OR NULLIF(BTRIM(p_email), '') IS NULL
     OR p_expires_at <= NOW() THEN
    RAISE EXCEPTION 'invalid_professional_grant';
  END IF;

  SELECT plan
    INTO current_plan
    FROM public.faculty_assistant_entitlements
   WHERE moodle_instance = BTRIM(p_moodle_instance)
     AND moodle_user_id = p_moodle_user_id;

  IF current_plan = 'institution' THEN
    RAISE EXCEPTION 'institution_entitlement_managed';
  END IF;

  INSERT INTO public.faculty_assistant_entitlements (
    moodle_instance,
    moodle_user_id,
    email,
    plan,
    features,
    is_active,
    expires_at,
    billing_period,
    updated_at
  )
  VALUES (
    BTRIM(p_moodle_instance),
    p_moodle_user_id,
    LOWER(BTRIM(p_email)),
    'professional',
    ARRAY['profile:read', 'courses:read', 'grades:read', 'questions:write']::TEXT[],
    TRUE,
    p_expires_at,
    'annual',
    NOW()
  )
  ON CONFLICT (moodle_instance, moodle_user_id)
  DO UPDATE SET
    email = EXCLUDED.email,
    plan = 'professional',
    features = EXCLUDED.features,
    is_active = TRUE,
    expires_at = EXCLUDED.expires_at,
    billing_period = 'annual',
    institution_licence_id = NULL,
    updated_at = NOW()
  RETURNING * INTO granted;

  INSERT INTO public.faculty_assistant_audit_log (
    moodle_user_id,
    moodle_instance,
    action,
    resource_type,
    resource_id,
    outcome,
    details
  )
  VALUES (
    p_moodle_user_id,
    BTRIM(p_moodle_instance),
    'licence.manual_grant',
    'entitlement',
    granted.id::TEXT,
    'success',
    jsonb_build_object(
      'adminId', p_admin_id,
      'adminEmail', p_admin_email,
      'email', LOWER(BTRIM(p_email)),
      'plan', 'professional',
      'billingPeriod', 'annual'
    )
  );

  RETURN granted;
END;
$$;

REVOKE ALL ON FUNCTION public.faculty_assistant_admin_grant_professional(
  TEXT, INTEGER, TEXT, TIMESTAMPTZ, TEXT, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.faculty_assistant_admin_grant_professional(
  TEXT, INTEGER, TEXT, TIMESTAMPTZ, TEXT, TEXT
) TO service_role;

CREATE OR REPLACE FUNCTION public.faculty_assistant_admin_update_entitlement(
  p_entitlement_id UUID,
  p_action TEXT,
  p_expires_at TIMESTAMPTZ,
  p_admin_id TEXT,
  p_admin_email TEXT
)
RETURNS public.faculty_assistant_entitlements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_entitlement public.faculty_assistant_entitlements;
  updated_entitlement public.faculty_assistant_entitlements;
BEGIN
  SELECT *
    INTO current_entitlement
    FROM public.faculty_assistant_entitlements
   WHERE id = p_entitlement_id
   FOR UPDATE;

  IF current_entitlement.id IS NULL THEN
    RAISE EXCEPTION 'entitlement_not_found';
  END IF;
  IF p_action NOT IN ('revoke', 'restore', 'extend') THEN
    RAISE EXCEPTION 'invalid_entitlement_action';
  END IF;
  IF p_action = 'extend' AND (p_expires_at IS NULL OR p_expires_at <= NOW()) THEN
    RAISE EXCEPTION 'invalid_entitlement_expiry';
  END IF;

  UPDATE public.faculty_assistant_entitlements
     SET is_active = CASE WHEN p_action = 'revoke' THEN FALSE ELSE TRUE END,
         expires_at = CASE
           WHEN p_action = 'extend' THEN p_expires_at
           ELSE expires_at
         END,
         updated_at = NOW()
   WHERE id = p_entitlement_id
  RETURNING * INTO updated_entitlement;

  IF p_action = 'revoke' THEN
    UPDATE public.faculty_assistant_refresh_tokens
       SET revoked_at = COALESCE(revoked_at, NOW())
     WHERE entitlement_id = p_entitlement_id
       AND revoked_at IS NULL;
  END IF;

  INSERT INTO public.faculty_assistant_audit_log (
    moodle_user_id,
    moodle_instance,
    action,
    resource_type,
    resource_id,
    outcome,
    details
  )
  VALUES (
    current_entitlement.moodle_user_id,
    current_entitlement.moodle_instance,
    'licence.' || p_action,
    'entitlement',
    p_entitlement_id::TEXT,
    'success',
    jsonb_build_object(
      'adminId', p_admin_id,
      'adminEmail', p_admin_email,
      'plan', current_entitlement.plan
    )
  );

  RETURN updated_entitlement;
END;
$$;

REVOKE ALL ON FUNCTION public.faculty_assistant_admin_update_entitlement(
  UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.faculty_assistant_admin_update_entitlement(
  UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT
) TO service_role;

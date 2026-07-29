-- PayNexus payment orders for Faculty Assistant Professional licences.
-- Institution licences remain contract-led because they require approved
-- domains and may exceed the gateway's single-payment limit.

CREATE TABLE IF NOT EXISTS public.faculty_assistant_payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE
    REFERENCES public.faculty_assistant_upgrade_requests(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL DEFAULT 'paynexus'
    CHECK (provider = 'paynexus'),
  account_reference TEXT NOT NULL UNIQUE,
  amount_kes INTEGER NOT NULL CHECK (amount_kes > 0),
  currency TEXT NOT NULL DEFAULT 'KES' CHECK (currency = 'KES'),
  phone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN (
      'created', 'pending', 'completed', 'failed', 'cancelled',
      'expired', 'activation_failed'
    )),
  stk_reference TEXT,
  stk_checkout_request_id TEXT,
  checkout_session_id TEXT,
  checkout_url TEXT,
  completed_reference TEXT,
  transaction_id TEXT,
  provider_transaction_id TEXT,
  last_provider_status TEXT NOT NULL DEFAULT '',
  failure_reason TEXT NOT NULL DEFAULT '',
  activation_email_status TEXT NOT NULL DEFAULT 'not_sent'
    CHECK (activation_email_status IN ('not_sent', 'sent', 'failed')),
  paid_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fa_payment_orders_stk_reference
  ON public.faculty_assistant_payment_orders(stk_reference)
  WHERE stk_reference IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fa_payment_orders_stk_checkout
  ON public.faculty_assistant_payment_orders(stk_checkout_request_id)
  WHERE stk_checkout_request_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fa_payment_orders_checkout_session
  ON public.faculty_assistant_payment_orders(checkout_session_id)
  WHERE checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fa_payment_orders_status_created
  ON public.faculty_assistant_payment_orders(status, created_at DESC);

ALTER TABLE public.faculty_assistant_payment_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.faculty_assistant_payment_orders FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.faculty_assistant_payment_orders TO service_role;

CREATE OR REPLACE FUNCTION public.faculty_assistant_complete_paynexus_payment(
  p_order_id UUID,
  p_provider_reference TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_transaction_id TEXT,
  p_provider_transaction_id TEXT,
  p_phone TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  orderrow public.faculty_assistant_payment_orders%ROWTYPE;
  requestrow public.faculty_assistant_upgrade_requests%ROWTYPE;
  entitlementrow public.faculty_assistant_entitlements%ROWTYPE;
  expectedamount INTEGER;
  expirybase TIMESTAMPTZ;
  newexpiry TIMESTAMPTZ;
BEGIN
  SELECT *
    INTO orderrow
    FROM public.faculty_assistant_payment_orders
   WHERE id = p_order_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment_order_not_found' USING ERRCODE = 'P0002';
  END IF;

  SELECT *
    INTO requestrow
    FROM public.faculty_assistant_upgrade_requests
   WHERE id = orderrow.request_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'upgrade_request_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF orderrow.status = 'completed' AND orderrow.activated_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'activated', false,
      'alreadyProcessed', true,
      'requestId', requestrow.id,
      'email', requestrow.email
    );
  END IF;

  IF requestrow.requested_plan <> 'professional'
     OR requestrow.billing_period NOT IN ('monthly', 'annual') THEN
    RAISE EXCEPTION 'payment_plan_not_automatable' USING ERRCODE = '22023';
  END IF;

  expectedamount := CASE
    WHEN requestrow.billing_period = 'monthly' THEN 1000
    ELSE 9000
  END;
  IF orderrow.amount_kes <> expectedamount
     OR p_amount <> expectedamount
     OR UPPER(BTRIM(COALESCE(p_currency, ''))) <> 'KES' THEN
    RAISE EXCEPTION 'payment_amount_or_currency_mismatch' USING ERRCODE = '22023';
  END IF;

  IF requestrow.status = 'activated' THEN
    UPDATE public.faculty_assistant_payment_orders
       SET status = 'completed',
           completed_reference = LEFT(BTRIM(COALESCE(p_provider_reference, '')), 120),
           transaction_id = LEFT(BTRIM(COALESCE(p_transaction_id, '')), 120),
           provider_transaction_id = LEFT(BTRIM(COALESCE(p_provider_transaction_id, '')), 120),
           last_provider_status = 'completed',
           paid_at = COALESCE(paid_at, NOW()),
           updated_at = NOW()
     WHERE id = orderrow.id;
    RETURN jsonb_build_object(
      'activated', false,
      'alreadyProcessed', true,
      'requestId', requestrow.id,
      'email', requestrow.email
    );
  END IF;

  IF requestrow.status NOT IN ('pending', 'contacted', 'paid') THEN
    RAISE EXCEPTION 'upgrade_request_not_open' USING ERRCODE = '22023';
  END IF;

  SELECT *
    INTO entitlementrow
    FROM public.faculty_assistant_entitlements
   WHERE moodle_instance = requestrow.moodle_instance
     AND moodle_user_id = requestrow.moodle_user_id
   FOR UPDATE;
  IF entitlementrow.plan = 'institution' THEN
    RAISE EXCEPTION 'institution_entitlement_managed' USING ERRCODE = '22023';
  END IF;

  expirybase := CASE
    WHEN entitlementrow.is_active = TRUE
      AND entitlementrow.expires_at IS NOT NULL
      AND entitlementrow.expires_at > NOW()
    THEN entitlementrow.expires_at
    ELSE NOW()
  END;
  newexpiry := expirybase + CASE
    WHEN requestrow.billing_period = 'monthly' THEN INTERVAL '1 month'
    ELSE INTERVAL '12 months'
  END;

  INSERT INTO public.faculty_assistant_entitlements (
    moodle_instance,
    moodle_user_id,
    email,
    plan,
    features,
    is_active,
    expires_at,
    billing_period,
    source_request_id,
    institution_licence_id,
    updated_at
  )
  VALUES (
    requestrow.moodle_instance,
    requestrow.moodle_user_id,
    LOWER(BTRIM(requestrow.email)),
    'professional',
    ARRAY['profile:read', 'courses:read', 'grades:read', 'questions:write']::TEXT[],
    TRUE,
    newexpiry,
    requestrow.billing_period,
    requestrow.id,
    NULL,
    NOW()
  )
  ON CONFLICT (moodle_instance, moodle_user_id)
  DO UPDATE SET
    email = EXCLUDED.email,
    plan = 'professional',
    features = EXCLUDED.features,
    is_active = TRUE,
    expires_at = EXCLUDED.expires_at,
    billing_period = EXCLUDED.billing_period,
    source_request_id = EXCLUDED.source_request_id,
    institution_licence_id = NULL,
    updated_at = NOW()
  RETURNING * INTO entitlementrow;

  UPDATE public.faculty_assistant_upgrade_requests
     SET status = 'activated',
         payment_reference = LEFT(BTRIM(COALESCE(p_provider_reference, '')), 120),
         admin_notes = CASE
           WHEN admin_notes = '' THEN 'Automatically activated after verified PayNexus payment.'
           ELSE admin_notes || E'\nAutomatically activated after verified PayNexus payment.'
         END,
         activated_at = NOW(),
         updated_at = NOW()
   WHERE id = requestrow.id;

  UPDATE public.faculty_assistant_payment_orders
     SET status = 'completed',
         completed_reference = LEFT(BTRIM(COALESCE(p_provider_reference, '')), 120),
         transaction_id = LEFT(BTRIM(COALESCE(p_transaction_id, '')), 120),
         provider_transaction_id = LEFT(BTRIM(COALESCE(p_provider_transaction_id, '')), 120),
         phone = LEFT(BTRIM(COALESCE(NULLIF(p_phone, ''), phone)), 40),
         last_provider_status = 'completed',
         failure_reason = '',
         paid_at = COALESCE(paid_at, NOW()),
         activated_at = NOW(),
         updated_at = NOW()
   WHERE id = orderrow.id;

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
    requestrow.moodle_user_id,
    requestrow.moodle_instance,
    'licence.payment_activation',
    'payment_order',
    orderrow.id::TEXT,
    'success',
    jsonb_build_object(
      'provider', 'paynexus',
      'paymentReference', LEFT(BTRIM(COALESCE(p_provider_reference, '')), 120),
      'requestId', requestrow.id,
      'entitlementId', entitlementrow.id,
      'plan', requestrow.requested_plan,
      'billingPeriod', requestrow.billing_period,
      'amountKes', expectedamount,
      'expiresAt', entitlementrow.expires_at
    )
  );

  RETURN jsonb_build_object(
    'activated', true,
    'alreadyProcessed', false,
    'requestId', requestrow.id,
    'email', requestrow.email,
    'displayName', requestrow.display_name,
    'plan', entitlementrow.plan,
    'billingPeriod', entitlementrow.billing_period,
    'expiresAt', entitlementrow.expires_at,
    'entitlementId', entitlementrow.id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.faculty_assistant_complete_paynexus_payment(
  UUID, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.faculty_assistant_complete_paynexus_payment(
  UUID, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT
) TO service_role;

CREATE OR REPLACE FUNCTION public.faculty_assistant_payment_report_summary()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH status_totals AS (
    SELECT status, COUNT(*)::BIGINT AS total
      FROM public.faculty_assistant_payment_orders
     GROUP BY status
  ),
  summary AS (
    SELECT
      COUNT(*)::BIGINT AS total,
      COALESCE(
        SUM(amount_kes) FILTER (WHERE paid_at IS NOT NULL),
        0
      )::BIGINT AS collected_kes
      FROM public.faculty_assistant_payment_orders
  )
  SELECT jsonb_build_object(
    'counts',
    jsonb_build_object('all', summary.total) ||
      COALESCE(
        (SELECT jsonb_object_agg(status, total) FROM status_totals),
        '{}'::JSONB
      ),
    'collectedKes',
    summary.collected_kes
  )
    FROM summary;
$$;

REVOKE ALL ON FUNCTION public.faculty_assistant_payment_report_summary()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.faculty_assistant_payment_report_summary()
  TO service_role;

-- Add Eversend without rewriting or deleting historical PayNexus orders.

ALTER TABLE public.faculty_assistant_payment_orders
  DROP CONSTRAINT IF EXISTS faculty_assistant_payment_orders_provider_check;
ALTER TABLE public.faculty_assistant_payment_orders
  ADD CONSTRAINT faculty_assistant_payment_orders_provider_check
  CHECK (provider IN ('paynexus', 'eversend'));

CREATE INDEX IF NOT EXISTS idx_fa_payment_orders_provider_status
  ON public.faculty_assistant_payment_orders(provider, status, created_at DESC);

-- The original transactional activation function remains available for
-- PayNexus. This provider-aware wrapper verifies the order/provider match and
-- reuses that proven transaction for Eversend before correcting provider
-- wording in the same database transaction.
CREATE OR REPLACE FUNCTION public.faculty_assistant_complete_payment(
  p_order_id UUID,
  p_provider TEXT,
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
  orderprovider TEXT;
  activation JSONB;
  requestid UUID;
BEGIN
  IF p_provider NOT IN ('paynexus', 'eversend') THEN
    RAISE EXCEPTION 'unsupported_payment_provider' USING ERRCODE = '22023';
  END IF;

  SELECT provider
    INTO orderprovider
    FROM public.faculty_assistant_payment_orders
   WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment_order_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF orderprovider <> p_provider THEN
    RAISE EXCEPTION 'payment_provider_mismatch' USING ERRCODE = '22023';
  END IF;

  activation := public.faculty_assistant_complete_paynexus_payment(
    p_order_id,
    p_provider_reference,
    p_amount,
    p_currency,
    p_transaction_id,
    p_provider_transaction_id,
    p_phone
  );

  IF p_provider = 'eversend' AND COALESCE((activation->>'activated')::BOOLEAN, FALSE) THEN
    requestid := NULLIF(activation->>'requestId', '')::UUID;
    UPDATE public.faculty_assistant_upgrade_requests
       SET admin_notes = REPLACE(
             admin_notes,
             'Automatically activated after verified PayNexus payment.',
             'Automatically activated after verified Eversend payment.'
           ),
           updated_at = NOW()
     WHERE id = requestid;

    UPDATE public.faculty_assistant_audit_log
       SET details = jsonb_set(details, '{provider}', to_jsonb('eversend'::TEXT), TRUE)
     WHERE action = 'licence.payment_activation'
       AND resource_type = 'payment_order'
       AND resource_id = p_order_id::TEXT
       AND details->>'provider' = 'paynexus';
  END IF;

  RETURN activation || jsonb_build_object('provider', p_provider);
END;
$$;

REVOKE ALL ON FUNCTION public.faculty_assistant_complete_payment(
  UUID, TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.faculty_assistant_complete_payment(
  UUID, TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT
) TO service_role;

-- Close an unpaid upgrade request without deleting its commercial history.
-- This releases the open-request uniqueness constraint so a lecturer can
-- start a fresh test or retry while retaining the old request and order.

CREATE OR REPLACE FUNCTION public.faculty_assistant_admin_close_request_for_retry(
  p_request_id UUID,
  p_admin_notes TEXT,
  p_admin_id UUID,
  p_admin_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requestrow public.faculty_assistant_upgrade_requests%ROWTYPE;
  orderrow public.faculty_assistant_payment_orders%ROWTYPE;
  closereason TEXT;
BEGIN
  SELECT *
    INTO requestrow
    FROM public.faculty_assistant_upgrade_requests
   WHERE id = p_request_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'upgrade_request_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF requestrow.status NOT IN ('pending', 'contacted') THEN
    RAISE EXCEPTION 'upgrade_request_not_closeable' USING ERRCODE = '22023';
  END IF;

  SELECT *
    INTO orderrow
    FROM public.faculty_assistant_payment_orders
   WHERE request_id = requestrow.id
   FOR UPDATE;
  IF FOUND AND (
    orderrow.status = 'completed'
    OR orderrow.paid_at IS NOT NULL
    OR orderrow.activated_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'paid_request_cannot_be_closed' USING ERRCODE = '22023';
  END IF;
  IF orderrow.id IS NOT NULL AND orderrow.status = 'pending' THEN
    RAISE EXCEPTION 'payment_order_still_pending' USING ERRCODE = '22023';
  END IF;

  closereason := LEFT(COALESCE(NULLIF(BTRIM(p_admin_notes), ''),
    'Closed by the Licence Desk to allow a fresh upgrade request.'), 1500);

  IF orderrow.id IS NOT NULL THEN
    UPDATE public.faculty_assistant_payment_orders
       SET status = 'cancelled',
           last_provider_status = 'closed_by_licence_desk',
           failure_reason = LEFT('Closed before payment by Licence Desk: ' || closereason, 1000),
           otp_pin_id = NULL,
           otp_requested_at = NULL,
           otp_expires_at = NULL,
           updated_at = NOW()
     WHERE id = orderrow.id;
  END IF;

  UPDATE public.faculty_assistant_upgrade_requests
     SET status = 'declined',
         admin_notes = closereason,
         handled_by = p_admin_id,
         updated_at = NOW()
   WHERE id = requestrow.id;

  INSERT INTO public.faculty_assistant_audit_log (
    moodle_user_id,
    moodle_instance,
    action,
    resource_type,
    resource_id,
    outcome,
    details
  ) VALUES (
    requestrow.moodle_user_id,
    requestrow.moodle_instance,
    'licence.request.closed_for_retry',
    'upgrade_request',
    requestrow.id::TEXT,
    'success',
    jsonb_build_object(
      'adminId', p_admin_id,
      'adminEmail', p_admin_email,
      'reason', closereason,
      'paymentOrderId', orderrow.id,
      'previousRequestStatus', requestrow.status,
      'previousPaymentStatus', orderrow.status
    )
  );

  RETURN jsonb_build_object(
    'id', requestrow.id,
    'status', 'declined',
    'closedForRetry', TRUE,
    'paymentOrderId', orderrow.id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.faculty_assistant_admin_close_request_for_retry(
  UUID, TEXT, UUID, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.faculty_assistant_admin_close_request_for_retry(
  UUID, TEXT, UUID, TEXT
) TO service_role;

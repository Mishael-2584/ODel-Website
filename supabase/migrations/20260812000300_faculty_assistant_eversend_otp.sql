-- Eversend requires phone verification for collection accounts that have not
-- been exempted from its OTP flow. The PIN itself is never stored.

ALTER TABLE public.faculty_assistant_payment_orders
  ADD COLUMN IF NOT EXISTS otp_pin_id TEXT,
  ADD COLUMN IF NOT EXISTS otp_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS otp_send_count SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS otp_attempt_count SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE public.faculty_assistant_payment_orders
  DROP CONSTRAINT IF EXISTS faculty_assistant_payment_orders_otp_send_count_check;
ALTER TABLE public.faculty_assistant_payment_orders
  ADD CONSTRAINT faculty_assistant_payment_orders_otp_send_count_check
  CHECK (otp_send_count BETWEEN 0 AND 3);

ALTER TABLE public.faculty_assistant_payment_orders
  DROP CONSTRAINT IF EXISTS faculty_assistant_payment_orders_otp_attempt_count_check;
ALTER TABLE public.faculty_assistant_payment_orders
  ADD CONSTRAINT faculty_assistant_payment_orders_otp_attempt_count_check
  CHECK (otp_attempt_count BETWEEN 0 AND 5);

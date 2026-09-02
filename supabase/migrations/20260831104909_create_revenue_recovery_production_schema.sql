/*
# Revenue Recovery Production Schema

## Overview
Creates the full production database schema for the AI Revenue Recovery system.
5 new tables (customers, payments, recovery_actions, webhook_events, recovery_config)
plus new columns on the existing recovery_cases table.

## New Tables
- customers: customer info synced from Razorpay
- payments: all payment records from Razorpay webhooks
- recovery_actions: tracks every recovery action (retry, whatsapp, email, escalate)
- webhook_events: idempotency store for Razorpay webhooks
- recovery_config: configurable recovery engine parameters

## Modified Tables
- recovery_cases: extended with payment_id, customer_id, ai_analysis, ai_recommendation, selected_action, retry_count, next_action_at, recovered_at, escalated_at, failure_reason, failure_code

## Security
- RLS enabled on all new tables
- Policies allow anon+authenticated CRUD (single-tenant dashboard app)
- Unique constraints enforce idempotency on razorpay_payment_id and webhook event_id

## Important Notes
1. Existing recovery_cases and recovery_runs tables preserved — only extended
2. Unique constraints enforce idempotency
3. Indexes on frequently-queried columns
4. Foreign keys use ON DELETE CASCADE
*/

-- ============================================================
-- 1. customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  razorpay_customer_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers" ON customers FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_customers_razorpay_id ON customers(razorpay_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ============================================================
-- 2. payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  razorpay_payment_id text UNIQUE,
  razorpay_order_id text,
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  failure_reason text,
  failure_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================================
-- 3. recovery_cases — extend existing table with new columns
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'payment_id') THEN
    ALTER TABLE recovery_cases ADD COLUMN payment_id uuid REFERENCES payments(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'customer_id') THEN
    ALTER TABLE recovery_cases ADD COLUMN customer_id uuid REFERENCES customers(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'failure_reason') THEN
    ALTER TABLE recovery_cases ADD COLUMN failure_reason text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'failure_code') THEN
    ALTER TABLE recovery_cases ADD COLUMN failure_code text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'ai_analysis') THEN
    ALTER TABLE recovery_cases ADD COLUMN ai_analysis jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'ai_recommendation') THEN
    ALTER TABLE recovery_cases ADD COLUMN ai_recommendation jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'selected_action') THEN
    ALTER TABLE recovery_cases ADD COLUMN selected_action text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'retry_count') THEN
    ALTER TABLE recovery_cases ADD COLUMN retry_count integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'next_action_at') THEN
    ALTER TABLE recovery_cases ADD COLUMN next_action_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'recovered_at') THEN
    ALTER TABLE recovery_cases ADD COLUMN recovered_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_cases' AND column_name = 'escalated_at') THEN
    ALTER TABLE recovery_cases ADD COLUMN escalated_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_recovery_cases_payment_id ON recovery_cases(payment_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_customer_id ON recovery_cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_status ON recovery_cases(status);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_next_action_at ON recovery_cases(next_action_at);

-- ============================================================
-- 4. recovery_actions
-- ============================================================
CREATE TABLE IF NOT EXISTS recovery_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recovery_case_id uuid NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('retry_payment', 'whatsapp', 'email', 'escalate')),
  channel text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'completed')),
  message text,
  provider_message_id text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE recovery_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recovery_actions" ON recovery_actions;
CREATE POLICY "anon_select_recovery_actions" ON recovery_actions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recovery_actions" ON recovery_actions;
CREATE POLICY "anon_insert_recovery_actions" ON recovery_actions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recovery_actions" ON recovery_actions;
CREATE POLICY "anon_update_recovery_actions" ON recovery_actions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_recovery_actions" ON recovery_actions;
CREATE POLICY "anon_delete_recovery_actions" ON recovery_actions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_recovery_actions_case_id ON recovery_actions(recovery_case_id);
CREATE INDEX IF NOT EXISTS idx_recovery_actions_status ON recovery_actions(status);

-- ============================================================
-- 5. webhook_events
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'razorpay',
  event_id text NOT NULL,
  event_type text,
  payload jsonb,
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider, event_id)
);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_webhook_events" ON webhook_events;
CREATE POLICY "anon_select_webhook_events" ON webhook_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_webhook_events" ON webhook_events;
CREATE POLICY "anon_insert_webhook_events" ON webhook_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_webhook_events" ON webhook_events;
CREATE POLICY "anon_update_webhook_events" ON webhook_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_webhook_events" ON webhook_events;
CREATE POLICY "anon_delete_webhook_events" ON webhook_events FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);

-- ============================================================
-- 6. recovery_config
-- ============================================================
CREATE TABLE IF NOT EXISTS recovery_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recovery_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recovery_config" ON recovery_config;
CREATE POLICY "anon_select_recovery_config" ON recovery_config FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recovery_config" ON recovery_config;
CREATE POLICY "anon_insert_recovery_config" ON recovery_config FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recovery_config" ON recovery_config;
CREATE POLICY "anon_update_recovery_config" ON recovery_config FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed default configuration values
INSERT INTO recovery_config (key, value) VALUES
  ('MAX_RETRY_ATTEMPTS', '2'),
  ('RETRY_DELAY_MINUTES', '360'),
  ('ESCALATION_THRESHOLD', '3'),
  ('FOLLOWUP_DELAY_HOURS', '24'),
  ('MAX_AMOUNT_AUTO_RETRY', '50000'),
  ('AI_CONFIDENCE_THRESHOLD', '70')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 7. updated_at trigger function (reusable)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_customers_updated_at ON customers;
CREATE TRIGGER trigger_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_payments_updated_at ON payments;
CREATE TRIGGER trigger_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_recovery_config_updated_at ON recovery_config;
CREATE TRIGGER trigger_recovery_config_updated_at BEFORE UPDATE ON recovery_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
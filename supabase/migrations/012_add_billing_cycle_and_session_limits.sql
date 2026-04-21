-- ============================================================
-- Billing cycle, session limits, and subscription period
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly', 'yearly'));

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS sessions_used_this_month integer DEFAULT 0;

-- monthly_session_limit defaults to 5 (free tier).
-- Update to 150 for jobSeeker, 30 for student at subscription time.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS monthly_session_limit integer DEFAULT 5;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz;

-- ============================================================
-- Reset session counter on the 1st of every month at midnight UTC
-- ============================================================

SELECT cron.schedule(
  'reset-monthly-sessions',
  '0 0 1 * *',
  $$ UPDATE users SET sessions_used_this_month = 0 $$
);

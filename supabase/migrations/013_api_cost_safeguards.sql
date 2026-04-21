-- ============================================================
-- API cost safeguards and session limits
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS session_hard_cap integer DEFAULT 5;
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_cost_this_month numeric(10,4) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_cost_limit numeric(10,4) DEFAULT 1.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS flagged_for_review boolean DEFAULT false;

-- ============================================================
-- increment_api_cost — called by track-api-cost edge function
-- ============================================================

CREATE OR REPLACE FUNCTION increment_api_cost(user_id_input uuid, cost_to_add numeric)
RETURNS void AS $$
  UPDATE users
  SET api_cost_this_month = api_cost_this_month + cost_to_add
  WHERE id = user_id_input;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- Default limits per plan tier
-- Adjust session_hard_cap and api_cost_limit per plan.
-- Run after any plan upgrade/downgrade as well.
-- ============================================================

-- Free
UPDATE users
SET session_hard_cap = 5, monthly_session_limit = 5, api_cost_limit = 1.50
WHERE plan = 'free';

-- Job Seeker (plan value in DB — update to match your enum)
UPDATE users
SET session_hard_cap = 80, monthly_session_limit = 60, api_cost_limit = 12.00
WHERE plan = 'job_seeker';

-- Student
UPDATE users
SET session_hard_cap = 35, monthly_session_limit = 25, api_cost_limit = 6.00
WHERE plan = 'student';

-- ============================================================
-- Monthly reset — extend existing cron to also clear cost +
-- unflag accounts (drop old job first to avoid duplicate name)
-- ============================================================

SELECT cron.unschedule('reset-monthly-sessions');

SELECT cron.schedule(
  'reset-monthly-sessions',
  '0 0 1 * *',
  $$
  UPDATE users SET
    sessions_used_this_month = 0,
    api_cost_this_month = 0,
    flagged_for_review = false
  $$
);

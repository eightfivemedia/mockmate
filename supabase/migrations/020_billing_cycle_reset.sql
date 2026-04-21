-- Add sessions_reset_at to track per-user billing cycle reset date
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS sessions_reset_at timestamptz DEFAULT now();

-- Backfill existing users with current timestamp as their reset anchor
UPDATE users SET sessions_reset_at = now() WHERE sessions_reset_at IS NULL;

-- Remove the 1st-of-month cron job (replaced by per-user cycle reset)
SELECT cron.unschedule('reset-monthly-sessions');

-- Daily cron: reset sessions for users whose 30-day cycle has elapsed
SELECT cron.schedule(
  'reset-sessions-by-cycle',
  '0 0 * * *',   -- runs daily at midnight UTC
  $$
    UPDATE users
    SET
      sessions_used_this_month = 0,
      sessions_reset_at = now()
    WHERE sessions_reset_at + interval '30 days' <= now();
  $$
);

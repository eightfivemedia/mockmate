-- Enable pg_cron extension (requires Supabase Pro or pg_cron enabled in project settings)
-- This migration sets up a monthly cron job to reset sessions_used_this_month for all users.

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant pg_cron usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule the reset to run at midnight UTC on the 1st of every month
SELECT cron.schedule(
  'reset-monthly-sessions',        -- job name
  '0 0 1 * *',                     -- cron expression: 1st of month at 00:00 UTC
  $$
    UPDATE users
    SET sessions_used_this_month = 0
    WHERE sessions_used_this_month > 0;
  $$
);

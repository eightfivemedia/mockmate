-- ============================================================
-- Student tier verification columns
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS student_verified_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_tier_expires_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_reverification_sent_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_discount_active boolean DEFAULT false;

-- Index for the daily cron query — only indexes rows that have a value
CREATE INDEX IF NOT EXISTS idx_users_student_tier_expires_at
  ON users(student_tier_expires_at)
  WHERE student_tier_expires_at IS NOT NULL;

-- ============================================================
-- Update the handle_new_user trigger to set student fields
-- for .edu signups automatically
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_is_student boolean;
  v_now timestamptz;
BEGIN
  v_now := now();
  v_is_student := new.email ILIKE '%.edu';

  INSERT INTO public.users (
    id,
    email,
    name,
    plan,
    credits,
    student_verified_at,
    student_tier_expires_at,
    student_discount_active
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    'free',
    5,
    CASE WHEN v_is_student THEN v_now ELSE NULL END,
    CASE WHEN v_is_student THEN v_now + INTERVAL '12 months' ELSE NULL END,
    v_is_student
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'handle_new_user error for %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Cron job: daily student expiry check at 9am UTC
-- Requires pg_cron and pg_net extensions to be enabled in
-- Supabase dashboard → Database → Extensions
-- Replace [YOUR_PROJECT_REF] and [YOUR_SERVICE_ROLE_KEY] with
-- your actual values before running this block.
-- ============================================================

-- SELECT cron.schedule(
--   'check-student-expiry-daily',
--   '0 9 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://qvlvcpkdcostjftosjie.supabase.co/functions/v1/check-student-expiry',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   )
--   $$
-- );

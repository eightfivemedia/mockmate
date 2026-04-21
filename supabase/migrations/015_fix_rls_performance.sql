-- ============================================================
-- Fix RLS performance warnings:
-- 1. Wrap auth.uid() / auth.role() in (select ...) to prevent
--    per-row re-evaluation (auth_rls_initplan)
-- 2. Scope service role policies to TO service_role so they
--    don't overlap with user policies (multiple_permissive_policies)
-- ============================================================

-- ── users ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Service role can manage all users" ON public.users
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── interview_sessions ───────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Service role can manage all sessions" ON public.interview_sessions;

CREATE POLICY "Users can view own sessions" ON public.interview_sessions
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own sessions" ON public.interview_sessions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own sessions" ON public.interview_sessions
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own sessions" ON public.interview_sessions
  FOR DELETE USING ((select auth.uid()) = user_id);

CREATE POLICY "Service role can manage all sessions" ON public.interview_sessions
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── session_analytics ────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own session analytics" ON public.session_analytics;
DROP POLICY IF EXISTS "Users can insert own session analytics" ON public.session_analytics;
DROP POLICY IF EXISTS "Service role can manage all session analytics" ON public.session_analytics;

CREATE POLICY "Users can view own session analytics" ON public.session_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE id = session_analytics.session_id
      AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own session analytics" ON public.session_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE id = session_analytics.session_id
      AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Service role can manage all session analytics" ON public.session_analytics
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── question_analytics ───────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own question analytics" ON public.question_analytics;
DROP POLICY IF EXISTS "Users can insert own question analytics" ON public.question_analytics;
DROP POLICY IF EXISTS "Service role can manage all question analytics" ON public.question_analytics;

CREATE POLICY "Users can view own question analytics" ON public.question_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE id = question_analytics.session_id
      AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own question analytics" ON public.question_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE id = question_analytics.session_id
      AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Service role can manage all question analytics" ON public.question_analytics
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── user_analytics ───────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can update own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Service role can manage all user analytics" ON public.user_analytics;

CREATE POLICY "Users can view own analytics" ON public.user_analytics
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own analytics" ON public.user_analytics
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Service role can manage all user analytics" ON public.user_analytics
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── question_cache ───────────────────────────────────────────
DROP POLICY IF EXISTS "Service role can manage all cache" ON public.question_cache;

CREATE POLICY "Service role can manage all cache" ON public.question_cache
  TO service_role
  USING (true)
  WITH CHECK (true);

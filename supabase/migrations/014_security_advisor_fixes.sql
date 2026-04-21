-- ============================================================
-- Fix: Function Search Path Mutable (Security Advisor warnings)
-- All SECURITY DEFINER / trigger functions must pin search_path
-- ============================================================

-- 1. handle_new_user
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. increment_api_cost
CREATE OR REPLACE FUNCTION public.increment_api_cost(user_id_input uuid, cost_to_add numeric)
RETURNS void AS $$
  UPDATE public.users
  SET api_cost_this_month = api_cost_this_month + cost_to_add
  WHERE id = user_id_input;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. update_user_analytics
CREATE OR REPLACE FUNCTION public.update_user_analytics()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_analytics (
    user_id, total_sessions, total_questions_answered, average_session_score,
    favorite_role, average_time_per_question, completion_rate, last_active
  )
  SELECT
    ins.user_id,
    count(sa.id) AS total_sessions,
    sum(sa.questions_answered) AS total_questions_answered,
    avg(sa.average_rating) AS average_session_score,
    mode() WITHIN GROUP (ORDER BY sa.role) AS favorite_role,
    avg(sa.average_time_per_question) AS average_time_per_question,
    avg(sa.questions_answered::numeric / sa.total_questions * 100) AS completion_rate,
    now() AS last_active
  FROM public.session_analytics sa
  JOIN public.interview_sessions ins ON sa.session_id = ins.id
  WHERE ins.user_id = (SELECT user_id FROM public.interview_sessions WHERE id = NEW.session_id)
  GROUP BY ins.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    total_questions_answered = EXCLUDED.total_questions_answered,
    average_session_score = EXCLUDED.average_session_score,
    favorite_role = EXCLUDED.favorite_role,
    average_time_per_question = EXCLUDED.average_time_per_question,
    completion_rate = EXCLUDED.completion_rate,
    last_active = EXCLUDED.last_active,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4. cleanup_old_cache
CREATE OR REPLACE FUNCTION public.cleanup_old_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.question_cache
  WHERE last_used < now() - INTERVAL '30 days'
  AND usage_count < 3;
END;
$$ LANGUAGE plpgsql SET search_path = public;

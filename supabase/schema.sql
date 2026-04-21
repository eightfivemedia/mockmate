-- ============================================================
-- MockMate - Complete Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor on a fresh project
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Users table (mirrors auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  plan text not null default 'free' check (plan in ('free', 'monthly', 'credit-based')),
  credits integer not null default 5,
  profile_image_url text check (profile_image_url is null or profile_image_url like 'https://%'),
  created_at timestamp with time zone not null default now()
);

-- Interview sessions
create table if not exists interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  type text not null check (type in ('technical', 'behavioral', 'mixed')),
  role text not null,
  experience_level text not null check (experience_level in ('entry', 'mid', 'senior')),
  mode text not null default 'chat' check (mode in ('chat', 'questions')),
  questions jsonb default '[]'::jsonb,
  resume_text text,
  job_description_text text,
  resume_file_path text,
  job_description_file_path text,
  score numeric(3,1),
  feedback text,
  duration_minutes integer,
  questions_answered integer default 0,
  created_at timestamp with time zone not null default now(),
  completed_at timestamp with time zone
);

-- Question analytics (per-question tracking)
create table if not exists question_analytics (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references interview_sessions(id) on delete cascade,
  question_id integer not null,
  question_type text not null check (question_type in ('technical', 'behavioral')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  time_spent integer not null, -- seconds
  answer_length integer not null, -- character count
  skipped boolean not null default false,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone not null default now()
);

-- Session analytics (per-session summary)
create table if not exists session_analytics (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references interview_sessions(id) on delete cascade,
  role text not null,
  experience_level text not null,
  total_questions integer not null,
  questions_answered integer not null,
  questions_skipped integer not null,
  average_time_per_question numeric(8,2) not null,
  average_answer_length numeric(8,2) not null,
  average_rating numeric(3,2),
  total_session_time integer not null, -- seconds
  completed_at timestamp with time zone not null,
  created_at timestamp with time zone not null default now()
);

-- User analytics (aggregated, one row per user)
create table if not exists user_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  total_sessions integer not null default 0,
  total_questions_answered integer not null default 0,
  average_session_score numeric(3,2),
  favorite_role text,
  average_time_per_question numeric(8,2),
  completion_rate numeric(5,2), -- percentage
  last_active timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Question cache (reduces OpenAI API calls)
create table if not exists question_cache (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  experience_level text not null,
  response_format text not null,
  questions jsonb not null,
  usage_count integer not null default 1,
  last_used timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  hash text not null unique
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_interview_sessions_user_id on interview_sessions(user_id);
create index if not exists idx_interview_sessions_created_at on interview_sessions(created_at desc);
create index if not exists idx_interview_sessions_role on interview_sessions(role);
create index if not exists idx_interview_sessions_experience_level on interview_sessions(experience_level);

create index if not exists idx_question_analytics_session_id on question_analytics(session_id);
create index if not exists idx_question_analytics_question_type on question_analytics(question_type);
create index if not exists idx_question_analytics_difficulty on question_analytics(difficulty);

create index if not exists idx_session_analytics_session_id on session_analytics(session_id);
create index if not exists idx_session_analytics_role on session_analytics(role);
create index if not exists idx_session_analytics_experience_level on session_analytics(experience_level);

create index if not exists idx_user_analytics_user_id on user_analytics(user_id);
create index if not exists idx_user_analytics_last_active on user_analytics(last_active desc);

create index if not exists idx_question_cache_role on question_cache(role);
create index if not exists idx_question_cache_experience_level on question_cache(experience_level);
create index if not exists idx_question_cache_hash on question_cache(hash);
create index if not exists idx_question_cache_usage_count on question_cache(usage_count desc);
create index if not exists idx_question_cache_last_used on question_cache(last_used desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table users enable row level security;
alter table interview_sessions enable row level security;
alter table question_analytics enable row level security;
alter table session_analytics enable row level security;
alter table user_analytics enable row level security;
alter table question_cache enable row level security;

-- users policies
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

create policy "Service role can manage all users" on users
  for all using (auth.role() = 'service_role');

-- interview_sessions policies
create policy "Users can view own sessions" on interview_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own sessions" on interview_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own sessions" on interview_sessions
  for update using (auth.uid() = user_id);

create policy "Users can delete own sessions" on interview_sessions
  for delete using (auth.uid() = user_id);

create policy "Service role can manage all sessions" on interview_sessions
  for all using (auth.role() = 'service_role');

-- question_analytics policies
create policy "Users can view own question analytics" on question_analytics
  for select using (
    session_id in (select id from interview_sessions where user_id = auth.uid())
  );

create policy "Users can insert own question analytics" on question_analytics
  for insert with check (
    session_id in (select id from interview_sessions where user_id = auth.uid())
  );

create policy "Service role can manage all question analytics" on question_analytics
  for all using (auth.role() = 'service_role');

-- session_analytics policies
create policy "Users can view own session analytics" on session_analytics
  for select using (
    session_id in (select id from interview_sessions where user_id = auth.uid())
  );

create policy "Users can insert own session analytics" on session_analytics
  for insert with check (
    session_id in (select id from interview_sessions where user_id = auth.uid())
  );

create policy "Service role can manage all session analytics" on session_analytics
  for all using (auth.role() = 'service_role');

-- user_analytics policies
create policy "Users can view own analytics" on user_analytics
  for select using (auth.uid() = user_id);

create policy "Users can update own analytics" on user_analytics
  for update using (auth.uid() = user_id);

create policy "Service role can manage all user analytics" on user_analytics
  for all using (auth.role() = 'service_role');

-- question_cache policies (service role only — users don't access directly)
create policy "Service role can manage all cache" on question_cache
  for all using (auth.role() = 'service_role');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, plan, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    'free',
    5
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then
    raise log 'handle_new_user error for %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update user analytics when a session completes
create or replace function update_user_analytics()
returns trigger as $$
declare
  v_user_id uuid;
begin
  select user_id into v_user_id
  from interview_sessions
  where id = new.session_id;

  insert into user_analytics (
    user_id,
    total_sessions,
    total_questions_answered,
    average_session_score,
    favorite_role,
    average_time_per_question,
    completion_rate,
    last_active
  )
  select
    v_user_id,
    count(sa.id),
    sum(sa.questions_answered),
    avg(sa.average_rating),
    mode() within group (order by sa.role),
    avg(sa.average_time_per_question),
    avg(sa.questions_answered::numeric / nullif(sa.total_questions, 0) * 100),
    now()
  from session_analytics sa
  join interview_sessions is2 on sa.session_id = is2.id
  where is2.user_id = v_user_id
  on conflict (user_id) do update set
    total_sessions = excluded.total_sessions,
    total_questions_answered = excluded.total_questions_answered,
    average_session_score = excluded.average_session_score,
    favorite_role = excluded.favorite_role,
    average_time_per_question = excluded.average_time_per_question,
    completion_rate = excluded.completion_rate,
    last_active = excluded.last_active,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_update_user_analytics on session_analytics;
create trigger trigger_update_user_analytics
  after insert on session_analytics
  for each row execute function update_user_analytics();

-- Cache cleanup function
create or replace function cleanup_old_cache()
returns void as $$
begin
  delete from question_cache
  where last_used < now() - interval '30 days'
  and usage_count < 3;
end;
$$ language plpgsql security definer;

-- ============================================================
-- STORAGE
-- ============================================================
-- Run these separately in Supabase Dashboard > Storage
-- 1. Create a bucket named: profile-images (public: false)
-- Then run the policies below:

create policy "profile-images: upload own" on storage.objects
  for insert with check (
    bucket_id = 'profile-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile-images: view own" on storage.objects
  for select using (
    bucket_id = 'profile-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile-images: update own" on storage.objects
  for update using (
    bucket_id = 'profile-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'profile-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile-images: delete own" on storage.objects
  for delete using (
    bucket_id = 'profile-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

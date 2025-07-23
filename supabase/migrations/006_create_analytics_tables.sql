-- Create analytics tables for tracking user performance

-- Question analytics table
create table question_analytics (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references interview_sessions(id) on delete cascade,
  question_id integer not null,
  question_type text not null check (question_type in ('technical', 'behavioral')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  time_spent integer not null, -- in seconds
  answer_length integer not null, -- character count
  skipped boolean not null default false,
  rating integer check (rating >= 1 and rating <= 5), -- user self-rating
  created_at timestamp with time zone not null default now()
);

-- Session analytics table
create table session_analytics (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references interview_sessions(id) on delete cascade,
  role text not null,
  experience_level text not null,
  total_questions integer not null,
  questions_answered integer not null,
  questions_skipped integer not null,
  average_time_per_question numeric(8,2) not null,
  total_session_time integer not null, -- in seconds
  average_answer_length numeric(8,2) not null,
  average_rating numeric(3,2),
  completed_at timestamp with time zone not null,
  created_at timestamp with time zone not null default now()
);

-- User analytics summary table
create table user_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
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

-- Enable Row Level Security
alter table question_analytics enable row level security;
alter table session_analytics enable row level security;
alter table user_analytics enable row level security;

-- Create policies for question_analytics
create policy "Users can view own question analytics" on question_analytics
  for select using (
    session_id in (
      select id from interview_sessions where user_id = auth.uid()
    )
  );

create policy "Users can insert own question analytics" on question_analytics
  for insert with check (
    session_id in (
      select id from interview_sessions where user_id = auth.uid()
    )
  );

-- Create policies for session_analytics
create policy "Users can view own session analytics" on session_analytics
  for select using (
    session_id in (
      select id from interview_sessions where user_id = auth.uid()
    )
  );

create policy "Users can insert own session analytics" on session_analytics
  for insert with check (
    session_id in (
      select id from interview_sessions where user_id = auth.uid()
    )
  );

-- Create policies for user_analytics
create policy "Users can view own analytics" on user_analytics
  for select using (auth.uid() = user_id);

create policy "Users can update own analytics" on user_analytics
  for update using (auth.uid() = user_id);

create policy "Service role can manage all analytics" on question_analytics
  for all using (auth.role() = 'service_role');

create policy "Service role can manage all analytics" on session_analytics
  for all using (auth.role() = 'service_role');

create policy "Service role can manage all analytics" on user_analytics
  for all using (auth.role() = 'service_role');

-- Create indexes for better performance
create index idx_question_analytics_session_id on question_analytics(session_id);
create index idx_question_analytics_question_type on question_analytics(question_type);
create index idx_question_analytics_difficulty on question_analytics(difficulty);
create index idx_session_analytics_session_id on session_analytics(session_id);
create index idx_session_analytics_role on session_analytics(role);
create index idx_session_analytics_experience_level on session_analytics(experience_level);
create index idx_user_analytics_user_id on user_analytics(user_id);
create index idx_user_analytics_last_active on user_analytics(last_active desc);

-- Create function to update user analytics
create or replace function update_user_analytics()
returns trigger as $$
begin
  -- Update user analytics when session analytics are inserted
  insert into user_analytics (user_id, total_sessions, total_questions_answered, average_session_score, favorite_role, average_time_per_question, completion_rate, last_active)
  select 
    is.user_id,
    count(sa.id) as total_sessions,
    sum(sa.questions_answered) as total_questions_answered,
    avg(sa.average_rating) as average_session_score,
    mode() within group (order by sa.role) as favorite_role,
    avg(sa.average_time_per_question) as average_time_per_question,
    avg(sa.questions_answered::numeric / sa.total_questions * 100) as completion_rate,
    now() as last_active
  from session_analytics sa
  join interview_sessions is on sa.session_id = is.id
  where is.user_id = (select user_id from interview_sessions where id = new.session_id)
  group by is.user_id
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
$$ language plpgsql;

-- Create trigger to automatically update user analytics
create trigger trigger_update_user_analytics
  after insert on session_analytics
  for each row
  execute function update_user_analytics(); 
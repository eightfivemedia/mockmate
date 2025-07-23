-- Create interview_sessions table
create table interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  type text not null check (type in ('technical', 'behavioral', 'mixed')),
  score numeric(3,1),
  duration_minutes integer,
  questions_answered integer default 0,
  created_at timestamp with time zone not null default now(),
  completed_at timestamp with time zone
);

-- Enable Row Level Security
alter table interview_sessions enable row level security;

-- Create policies
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

-- Create index for better performance
create index idx_interview_sessions_user_id on interview_sessions(user_id);
create index idx_interview_sessions_created_at on interview_sessions(created_at desc);
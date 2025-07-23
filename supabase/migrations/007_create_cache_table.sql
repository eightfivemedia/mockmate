-- Create question cache table for storing generated questions

create table question_cache (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  experience_level text not null,
  response_format text not null,
  questions jsonb not null,
  usage_count integer not null default 1,
  last_used timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  hash text not null unique -- For identifying similar question sets
);

-- Enable Row Level Security
alter table question_cache enable row level security;

-- Create policies for question_cache
create policy "Service role can manage all cache" on question_cache
  for all using (auth.role() = 'service_role');

-- Create indexes for better performance
create index idx_question_cache_role on question_cache(role);
create index idx_question_cache_experience_level on question_cache(experience_level);
create index idx_question_cache_hash on question_cache(hash);
create index idx_question_cache_usage_count on question_cache(usage_count desc);
create index idx_question_cache_last_used on question_cache(last_used desc);

-- Create function to clean up old cache entries
create or replace function cleanup_old_cache()
returns void as $$
begin
  -- Delete cache entries older than 30 days with low usage
  delete from question_cache
  where last_used < now() - interval '30 days'
  and usage_count < 3;
end;
$$ language plpgsql;

-- Create a scheduled job to clean up old cache (if using pg_cron)
-- select cron.schedule('cleanup-cache', '0 2 * * *', 'select cleanup_old_cache();');
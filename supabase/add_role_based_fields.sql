-- Add role-based question generation fields to interview_sessions table
-- Run this in your Supabase SQL Editor

-- Add new columns
alter table interview_sessions
add column role text,
add column experience_level text check (experience_level in ('entry', 'mid', 'senior')),
add column questions jsonb,
add column resume_file_path text,
add column job_description_file_path text;

-- Update existing records to have default values
update interview_sessions
set
  role = 'Software Developer',
  experience_level = 'mid',
  questions = '[]'::jsonb
where role is null;

-- Make role and experience_level required for new sessions
alter table interview_sessions
alter column role set not null,
alter column experience_level set not null;

-- Add index for role-based queries
create index idx_interview_sessions_role on interview_sessions(role);
create index idx_interview_sessions_experience_level on interview_sessions(experience_level);
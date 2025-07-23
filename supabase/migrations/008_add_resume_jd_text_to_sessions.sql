-- Add resume_text and job_description_text columns to interview_sessions
ALTER TABLE interview_sessions
ADD COLUMN resume_text text,
ADD COLUMN job_description_text text;
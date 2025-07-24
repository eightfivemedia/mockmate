-- Add 'mode' column to interview_sessions
ALTER TABLE interview_sessions ADD COLUMN mode TEXT DEFAULT 'chat';
-- Optionally, add a check constraint for allowed values
ALTER TABLE interview_sessions ADD CONSTRAINT mode_check CHECK (mode IN ('chat', 'questions')); 
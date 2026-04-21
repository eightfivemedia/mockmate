-- Add chat_messages and qa_records JSONB columns to interview_sessions
-- chat_messages: stores the full conversation history for chat-mode sessions
-- qa_records: stores each question/answer/score/feedback for questions-mode sessions

ALTER TABLE interview_sessions
  ADD COLUMN IF NOT EXISTS chat_messages jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS qa_records jsonb DEFAULT '[]'::jsonb;

-- Add indexes for faster lookups when fetching session history
CREATE INDEX IF NOT EXISTS idx_interview_sessions_chat_messages
  ON interview_sessions USING gin (chat_messages)
  WHERE chat_messages IS NOT NULL AND chat_messages != '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_interview_sessions_qa_records
  ON interview_sessions USING gin (qa_records)
  WHERE qa_records IS NOT NULL AND qa_records != '[]'::jsonb;

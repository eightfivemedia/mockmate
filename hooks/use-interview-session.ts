import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Question {
  id: number;
  type: 'technical' | 'behavioral';
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface InterviewSession {
  id: string;
  user_id: string;
  title: string;
  type: string;
  role: string;
  experience_level: string;
  questions: Question[];
  score?: number;
  duration_minutes?: number;
  questions_answered: number;
  created_at: string;
  completed_at?: string;
  resume_file_path?: string;
  job_description_file_path?: string;
  resume_text?: string;
  job_description_text?: string;
}

export function useInterviewSession(sessionId: string | null) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    async function fetchSession() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error) {
          throw error;
        }

        setSession(data);
      } catch (err) {
        console.error('Error fetching interview session:', err);
        setError(err instanceof Error ? err.message : 'Failed to load interview session');
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  const updateSession = async (updates: Partial<InterviewSession>) => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSession(data);
      return data;
    } catch (err) {
      console.error('Error updating interview session:', err);
      throw err;
    }
  };

  return {
    session,
    loading,
    error,
    updateSession
  };
} 
'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface InterviewSession {
  id: string
  user_id: string
  title: string
  type: 'technical' | 'behavioral' | 'mixed'
  score?: number
  duration_minutes?: number
  questions_answered?: number
  created_at: string
  completed_at?: string
}

interface UseUserInterviewsState {
  sessions: InterviewSession[]
  loading: boolean
  error: string | null
}

export function useUserInterviews(userId: string | null) {
  const [state, setState] = useState<UseUserInterviewsState>({
    sessions: [],
    loading: false,
    error: null,
  })

  const fetchUserInterviews = useCallback(async () => {
    if (!userId) {
      setState({
        sessions: [],
        loading: false,
        error: null,
      })
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase
        .from('interview_sessions')
        .select(`
          id,
          user_id,
          title,
          type,
          score,
          duration_minutes,
          questions_answered,
          created_at,
          completed_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        throw new Error(`Failed to fetch interviews: ${error.message}`)
      }

      setState({
        sessions: data || [],
        loading: false,
        error: null,
      })

      // Show success toast if interviews were loaded
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} interview sessions`)
      }
    } catch (error) {
      console.error('Error fetching user interviews:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setState({
        sessions: [],
        loading: false,
        error: errorMessage,
      })
      
      // Show error toast
      toast.error(`Failed to load interviews: ${errorMessage}`)
    }
  }, [userId])

  useEffect(() => {
    fetchUserInterviews()
  }, [fetchUserInterviews])

  // Helper function to refresh interviews
  const refreshInterviews = useCallback(() => {
    fetchUserInterviews()
  }, [fetchUserInterviews])

  // Helper function to add a new interview session
  const addInterviewSession = useCallback((newSession: Omit<InterviewSession, 'id' | 'created_at'>) => {
    setState(prev => ({
      ...prev,
      sessions: [newSession as InterviewSession, ...prev.sessions.slice(0, 4)], // Keep only 5 most recent
    }))
  }, [])

  // Helper function to update an interview session
  const updateInterviewSession = useCallback((sessionId: string, updates: Partial<InterviewSession>) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId ? { ...session, ...updates } : session
      ),
    }))
  }, [])

  // Helper function to remove an interview session
  const removeInterviewSession = useCallback((sessionId: string) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.filter(session => session.id !== sessionId),
    }))
  }, [])

  return {
    sessions: state.sessions,
    loading: state.loading,
    error: state.error,
    refreshInterviews,
    addInterviewSession,
    updateInterviewSession,
    removeInterviewSession,
    // Convenience getters
    totalSessions: state.sessions.length,
    hasSessions: state.sessions.length > 0,
    averageScore: state.sessions.length > 0
      ? state.sessions
          .filter(session => session.score !== null && session.score !== undefined)
          .reduce((sum, session) => sum + (session.score || 0), 0) / 
          state.sessions.filter(session => session.score !== null && session.score !== undefined).length
      : 0,
  }
} 
'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'

interface UserProfileState {
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useUserProfile() {
  const [state, setState] = useState<UserProfileState>({
    profile: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let mounted = true

    const fetchUserProfile = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`)
        }

        if (!session?.user) {
          if (mounted) {
            setState({
              profile: null,
              loading: false,
              error: null,
            })
          }
          return
        }

        // Fetch user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          throw new Error(`Profile fetch error: ${profileError.message}`)
        }

        if (mounted) {
          setState({
            profile,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        if (mounted) {
          setState({
            profile: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
          })
        }
      }
    }

    // Initial fetch
    fetchUserProfile()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile()
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setState({
              profile: null,
              loading: false,
              error: null,
            })
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Helper function to refresh profile data
  const refreshProfile = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setState({
          profile: null,
          loading: false,
          error: null,
        })
        return
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        throw new Error(`Profile refresh error: ${error.message}`)
      }

      setState({
        profile,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error refreshing user profile:', error)
      setState({
        profile: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  return {
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    refreshProfile,
    // Convenience getters for common profile fields
    email: state.profile?.email || null,
    name: state.profile?.name || null,
    plan: state.profile?.plan || null,
    credits: state.profile?.credits || 0,
  }
}
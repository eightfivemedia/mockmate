'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      console.log('useAuth: Getting initial session...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('useAuth: Initial session:', session)

      if (!mounted) return

      if (session?.user) {
        const profile = await getUserProfile(session.user.id)
        console.log('useAuth: Setting auth state with profile:', profile)
        if (mounted) {
          setAuthState({
            user: session.user,
            session,
            profile,
            loading: false,
          })
        }
      } else {
        console.log('useAuth: No session, setting empty auth state')
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
          })
        }
      }
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && authState.loading) {
        console.log('useAuth: Timeout reached, setting loading to false')
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }, 5000) // 5 second timeout

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await getUserProfile(session.user.id)
          setAuthState({
            user: session.user,
            session,
            profile,
            loading: false,
          })
        } else {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
          })
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('useAuth: Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      console.log('useAuth: Profile fetched successfully:', data)
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    console.log('useAuth: signUpWithEmail called with:', { email, name });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    console.log('useAuth: signUp result:', { data, error });

    // If signup was successful, try to create profile manually if needed
    if (data.user && !error) {
      console.log('useAuth: Signup successful, checking if profile exists...');

      // Wait a moment for the trigger to potentially work
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('useAuth: Profile check after signup:', { profile, profileError });

      // If no profile exists, create one manually
      if (!profile && !profileError) {
        console.log('useAuth: Creating profile manually...');
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: name || data.user.user_metadata?.name || data.user.user_metadata?.full_name,
            plan: 'free',
            credits: 5,
          })
          .select()
          .single();

        console.log('useAuth: Manual profile creation result:', { newProfile, createError });
      }
    }

    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  }
}
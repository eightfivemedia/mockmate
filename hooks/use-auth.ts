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

// ── Cache helpers ────────────────────────────────────────────
const CACHE_KEY = 'mockmate_auth_cache'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

type AuthCache = {
  user: Pick<User, 'id' | 'email'>
  profile: UserProfile | null
  cachedAt: number
}

function readCache(): AuthCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cache: AuthCache = JSON.parse(raw)
    if (Date.now() - cache.cachedAt > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return cache
  } catch {
    return null
  }
}

function writeCache(user: User, profile: UserProfile | null) {
  try {
    const cache: AuthCache = {
      user: { id: user.id, email: user.email },
      profile,
      cachedAt: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {}
}

function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {}
}
// ────────────────────────────────────────────────────────────

const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const fetchPromise = supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    const timeoutPromise = new Promise<{ data: null; error: Error }>(
      (_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)
    )

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise])
    if (error) return null
    return data
  } catch {
    return null
  }
}

export function useAuth() {
  // Server and client both start with loading: true to avoid hydration mismatch.
  // Cache is read in useEffect (client-only) immediately after mount.
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    let mounted = true

    // Restore from cache immediately — happens before onAuthStateChange resolves
    const cache = readCache()
    if (cache && mounted) {
      setAuthState({
        user: cache.user as User,
        session: null,
        profile: cache.profile,
        loading: false,
      })
    }

    // Safety net: if onAuthStateChange never fires, clear loading after 6s
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        setAuthState(prev => prev.loading ? { ...prev, loading: false } : prev)
      }
    }, 6000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (session?.user) {
          // Fetch fresh profile in background — cache means UI is already visible
          const profile = await getUserProfile(session.user.id)
          if (mounted) {
            writeCache(session.user, profile)
            setAuthState({ user: session.user, session, profile, loading: false })
          }
        } else {
          clearCache()
          if (mounted) {
            setAuthState({ user: null, session: null, profile: null, loading: false })
          }
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (data.user && !error) {
      await new Promise(resolve => setTimeout(resolve, 800))

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existing) {
        const userEmail = data.user.email!
        const isStudent = userEmail.toLowerCase().endsWith('.edu')
        const now = new Date().toISOString()
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

        await supabase.from('users').insert({
          id: data.user.id,
          email: userEmail,
          name: name || data.user.user_metadata?.name || data.user.user_metadata?.full_name,
          plan: 'free',
          credits: 5,
          sessions_reset_at: new Date().toISOString(),
          ...(isStudent && {
            student_verified_at: now,
            student_tier_expires_at: expiresAt,
            student_discount_active: true,
          }),
        })
      }
    }

    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    clearCache()
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

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Auth callback: Starting...');
      
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/login?error=auth_callback_failed')
        return
      }

      console.log('Auth callback: Session data:', data);

      if (data.session) {
        console.log('Auth callback: User authenticated:', data.session.user.id);
        
        // Check if user profile exists, if not create one
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single()

        console.log('Auth callback: Profile check result:', { profile, profileError });

        if (!profile) {
          console.log('Auth callback: No profile found, creating one...');
          
          // Create user profile
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: data.session.user.id,
              email: data.session.user.email!,
              name: data.session.user.user_metadata?.name || data.session.user.user_metadata?.full_name,
              plan: 'free',
              credits: 5, // Give 5 free credits
            })
            .select()
            .single()

          console.log('Auth callback: Profile creation result:', { newProfile, createError });

          if (createError) {
            console.error('Error creating user profile:', createError)
            // Still redirect to dashboard, profile can be created later
          }
        }

        router.push('/dashboard')
      } else {
        console.log('Auth callback: No session, redirecting to login');
        router.push('/auth/login')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
} 
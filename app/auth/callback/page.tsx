'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        router.push('/auth/login?error=auth_callback_failed')
        return
      }

      if (data.session) {
        // Check if user profile exists, if not create one
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.session.user.id)
          .single()

        if (!profile) {
          const userEmail = data.session.user.email!;
          const isStudent = userEmail.toLowerCase().endsWith('.edu');
          const now = new Date().toISOString();
          const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

          await supabase
            .from('users')
            .insert({
              id: data.session.user.id,
              email: userEmail,
              name: data.session.user.user_metadata?.name || data.session.user.user_metadata?.full_name,
              plan: 'free',
              credits: 5,
              monthly_session_limit: 5,
              sessions_reset_at: new Date().toISOString(),
              ...(isStudent && {
                student_verified_at: now,
                student_tier_expires_at: expiresAt,
                student_discount_active: true,
              }),
            })

          // Send welcome email (fire-and-forget)
          fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-welcome-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
            },
          }).catch(() => {/* ignore failures */})
        }

        // Check for a pending plan from the pricing page
        try {
          const raw = localStorage.getItem('mockmate_pending_plan');
          if (raw) {
            const { plan, interval } = JSON.parse(raw);
            localStorage.removeItem('mockmate_pending_plan');

            const res = await fetch('/api/stripe/checkout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.session.access_token}`,
              },
              body: JSON.stringify({ plan, interval }),
            });
            const json = await res.json();
            if (json.url) {
              window.location.href = json.url;
              return;
            }
          }
        } catch {
          // If checkout fails, fall through to dashboard
        }

        router.push('/dashboard')
      } else {
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

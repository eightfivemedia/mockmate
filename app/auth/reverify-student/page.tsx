'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Target, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'not-edu' | 'unauthenticated' | 'error';

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #EEECF8',
  borderRadius: '20px',
  boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
  padding: '40px 32px',
};

const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)',
  boxShadow: '0 4px 20px rgba(91, 108, 249, 0.3)',
};

export default function ReverifyStudentPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setStatus('unauthenticated');
        return;
      }

      if (!session.user.email?.toLowerCase().endsWith('.edu')) {
        setStatus('not-edu');
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/reverify-student`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (res.ok) {
        const json = await res.json();
        setExpiresAt(json.student_tier_expires_at);
        setStatus('success');
      } else {
        setStatus('error');
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#F5F5F7' }}>
      <div className="w-full max-w-sm">
        <div style={cardStyle} className="text-center">

          {/* Logo */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}
          >
            <Target className="w-6 h-6 text-white" />
          </div>

          {/* Loading */}
          {status === 'loading' && (
            <>
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: '#8B5CF6' }} />
              <p className="text-sm text-[#1A1A2E60]">Verifying your student status…</p>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-[#1A1A2E] mb-2">Student status confirmed</h1>
              <p className="text-sm text-[#1A1A2E60] mb-1">Your student discount is active for another 12 months.</p>
              {expiresAt && (
                <p className="text-xs text-[#1A1A2E30] mb-8">
                  Next renewal: {new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
              <Link href="/dashboard">
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={btnPrimary}
                >
                  Go to dashboard
                </button>
              </Link>
            </>
          )}

          {/* Not .edu */}
          {status === 'not-edu' && (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-[#1A1A2E] mb-2">Not a .edu email</h1>
              <p className="text-sm text-[#1A1A2E60] mb-8">
                Student pricing requires a .edu email address. Your current account email doesn't qualify.
              </p>
              <Link href="/dashboard/settings">
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#4A4A6A] hover:bg-[#F8F7FC] transition-colors"
                  style={{ border: '1px solid #EEECF8' }}
                >
                  Back to settings
                </button>
              </Link>
            </>
          )}

          {/* Unauthenticated */}
          {status === 'unauthenticated' && (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-50">
                <XCircle className="w-6 h-6 text-amber-500" />
              </div>
              <h1 className="text-xl font-bold text-[#1A1A2E] mb-2">Sign in required</h1>
              <p className="text-sm text-[#1A1A2E60] mb-8">
                Please sign in to your MockMate account first, then follow the re-verification link again.
              </p>
              <Link href="/auth/login">
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={btnPrimary}
                >
                  Sign in
                </button>
              </Link>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-[#1A1A2E] mb-2">Something went wrong</h1>
              <p className="text-sm text-[#1A1A2E60] mb-8">
                We couldn't verify your student status. Please try again or contact support.
              </p>
              <button
                onClick={() => setStatus('loading')}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={btnPrimary}
              >
                Try again
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

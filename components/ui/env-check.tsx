'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean;
    supabaseKey: boolean;
    openaiKey: boolean;
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    openaiKey: false,
  });

  useEffect(() => {
    // Check environment variables (only client-side accessible ones)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    setEnvStatus({
      supabaseUrl: !!supabaseUrl && supabaseUrl !== 'placeholder',
      supabaseKey: !!supabaseKey && supabaseKey !== 'placeholder',
      openaiKey: true, // We can't check this on client side, assume it's configured
    });
  }, []);

  const hasIssues = !envStatus.supabaseUrl || !envStatus.supabaseKey;

  if (!hasIssues) {
    return null;
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Configuration Required</AlertTitle>
      <AlertDescription className="text-orange-700">
        <div className="space-y-1 text-sm">
          {!envStatus.supabaseUrl && (
            <p>• NEXT_PUBLIC_SUPABASE_URL is not configured</p>
          )}
          {!envStatus.supabaseKey && (
            <p>• NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured</p>
          )}
          <p className="mt-2">
            Please check your <code className="bg-orange-100 px-1 rounded">.env.local</code> file 
            and ensure all required environment variables are set.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
} 
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold gradient-text">Check Your Email</h2>
          <p className="text-muted-foreground mt-2">We&apos;ve sent you a verification link</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              Click the link in your email to complete your registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or try signing up again.
              </p>

              <div className="space-y-3">
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">
                    Try Again
                  </Button>
                </Link>

                <Link href="/auth/login">
                  <Button className="w-full btn-primary">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
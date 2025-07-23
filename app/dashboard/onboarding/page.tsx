'use client';

import { Onboarding } from '@/components/dashboard/onboarding';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';

export default function OnboardingPage() {
  const { profile } = useAuth();
  
  return (
    <DashboardLayout>
      <Onboarding userName={profile?.name} />
    </DashboardLayout>
  );
} 
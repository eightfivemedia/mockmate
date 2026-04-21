import { PastSessions } from '@/components/dashboard/past-sessions';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function SessionsPage() {
  return (
    <DashboardLayout>
      <PastSessions />
    </DashboardLayout>
  );
}
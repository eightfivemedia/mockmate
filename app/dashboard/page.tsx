import DashboardHome from '@/components/dashboard/dashboard-home';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <DashboardHome />
      </div>
    </DashboardLayout>
  );
}
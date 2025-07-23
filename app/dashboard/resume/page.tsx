import { ResumeChecker } from '@/components/dashboard/resume-checker';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function ResumePage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <ResumeChecker />
      </div>
    </DashboardLayout>
  );
} 
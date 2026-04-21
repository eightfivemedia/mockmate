import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Clock, FileText, Sparkles, Target, Layers } from 'lucide-react';

export default function CreateResumePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col pb-6">

        {/* Header */}
        <div className="shrink-0 pt-6 mb-5">
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Create Resume</h1>
          <p className="text-sm text-[#1A1A2E60] mt-1">Build a professional resume with AI assistance</p>
        </div>

        {/* Coming Soon Card */}
        <div
          className="flex flex-col items-center justify-center flex-1 rounded-2xl mb-6"
          style={{
            background: 'white',
            border: '1px solid #EEECF8',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
            padding: '32px',
          }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}
          >
            <Sparkles className="w-8 h-8 text-[#8B5CF6]" />
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)',
              color: '#5B6CF9',
              border: '1px solid #E0DCFA',
            }}
          >
            <Clock className="w-3 h-3" />
            Coming Soon
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-3">AI Resume Builder</h2>
          <p className="text-sm text-[#1A1A2E60] max-w-md text-center mb-10">
            Our resume builder will help you create professional, ATS-friendly resumes tailored to your target roles.
          </p>

          {/* Feature pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 max-w-lg w-full">
            {[
              { icon: FileText, label: 'AI-Powered',    desc: 'Smart suggestions and content optimization' },
              { icon: Target,   label: 'ATS-Friendly',  desc: 'Optimized for applicant tracking systems'  },
              { icon: Layers,   label: 'Customizable',  desc: 'Multiple templates and layouts'            },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                  style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}
                >
                  <Icon className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <p className="text-sm font-semibold text-[#1A1A2E]">{label}</p>
                <p className="text-xs text-[#1A1A2E50] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Release indicator */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: '#F8F7FC', border: '1px solid #EEECF8' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
            <p className="text-xs font-medium text-[#1A1A2E60]">Expected Release: Q2 2026</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

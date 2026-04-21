'use client';

import {
  Play,
  Target,
  Star,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingProps {
  userName?: string;
}

const steps = [
  {
    number: 'Step 1',
    title: 'Choose Your Focus',
    desc: 'Select between technical, behavioral, or mixed interview types',
    icon: Target,
  },
  {
    number: 'Step 2',
    title: 'Start Practicing',
    desc: 'Begin your first mock interview with AI-powered questions',
    icon: Play,
  },
  {
    number: 'Step 3',
    title: 'Get Feedback',
    desc: 'Receive detailed analysis and improvement suggestions',
    icon: CheckCircle,
  },
];

const cardStyle = {
  background: 'white',
  border: '1px solid #EEECF8',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
  padding: '24px',
};

export function Onboarding({ userName }: OnboardingProps) {
  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col items-center justify-center px-8 py-10 h-full overflow-y-auto">
      <div className="w-full max-w-3xl flex flex-col items-center gap-8">

        {/* Top icon + headline */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', boxShadow: '0 8px 32px rgba(91, 108, 249, 0.3)' }}
          >
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] text-center">
            Welcome to MockMate, {firstName}! 🎉
          </h1>
          <p className="text-sm text-[#1A1A2E60] text-center max-w-md">
            You're about to start your journey to interview success. Let's get you set up for your first practice session.
          </p>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {steps.map(({ number, title, desc, icon: Icon }) => (
            <div
              key={number}
              className="flex flex-col items-center text-center p-6 rounded-2xl"
              style={cardStyle}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}
              >
                <Icon className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <p className="text-xs font-semibold text-[#1A1A2E40] uppercase tracking-widest mb-1">{number}</p>
              <p className="text-sm font-bold text-[#1A1A2E] mb-2">{title}</p>
              <p className="text-xs text-[#1A1A2E50] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Ready to Start card */}
        <div
          className="w-full rounded-2xl p-8 flex flex-col items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, #5B6CF9 0%, #8B5CF6 60%, #C084FC 100%)',
            boxShadow: '0 8px 32px rgba(91, 108, 249, 0.25)',
            borderRadius: '16px',
          }}
        >
          <div className="text-center">
            <p className="text-lg font-bold text-white mb-1">Ready to Start?</p>
            <p className="text-sm text-white/70">Begin your first interview practice session in just a few clicks</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/interview">
              <button className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white text-[#5B6CF9] hover:bg-white/90 transition-opacity">
                Start Your First Interview
              </button>
            </Link>
            <Link href="/dashboard/sample-sessions">
              <button
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.3)' }}
              >
                View Sample Sessions
              </button>
            </Link>
          </div>
        </div>

        {/* What You'll Get + Interview Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

          {/* What You'll Get */}
          <div style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-4 flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5" />
              What You'll Get
            </p>
            <div className="space-y-3">
              {[
                'Realistic interview questions tailored to your role',
                'Instant feedback on your responses',
                'Performance analytics and progress tracking',
                'Tips and best practices for improvement',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1A1A2E80]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Formats */}
          <div style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-4 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" />
              Interview Formats
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ border: '1px solid #EEECF8' }}>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">Chat Mode</p>
                  <p className="text-xs text-[#1A1A2E50] mt-0.5">Conversational AI — back-and-forth dialogue</p>
                </div>
                <span className="bg-[#EEF0FF] text-[#5B6CF9] text-xs font-semibold px-2.5 py-1 rounded-full">Popular</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ border: '1px solid #EEECF8' }}>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">Questions Mode</p>
                  <p className="text-xs text-[#1A1A2E50] mt-0.5">Structured Q&A — requires resume or JD</p>
                </div>
                <span className="bg-[#F0FDF4] text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full">Focused</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ border: '1px solid #EEECF8' }}>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">Entry · Mid · Senior</p>
                  <p className="text-xs text-[#1A1A2E50] mt-0.5">Questions adapt to your experience level</p>
                </div>
                <span className="bg-[#FFF7ED] text-orange-500 text-xs font-semibold px-2.5 py-1 rounded-full">Adaptive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <p className="text-xs text-[#1A1A2E40]">Join thousands of professionals who have improved their interview skills</p>
          <Link href="/dashboard/interview">
            <button
              className="px-8 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)',
                boxShadow: '0 4px 20px rgba(91, 108, 249, 0.3)',
              }}
            >
              Let's Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useRouter } from 'next/navigation';
import { MessageCircle, LayoutList, ChevronDown, ChevronUp, ArrowRight, CheckCircle2 } from 'lucide-react';

const cardStyle = {
  background: 'white',
  border: '1px solid #EEECF8',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
};

type ChatSample = {
  id: number;
  title: string;
  level: string;
  mode: 'chat';
  score: number;
  sessionFeedback: string;
  messages: Array<{ role: 'ai' | 'user'; text: string }>;
};

type QuestionsSample = {
  id: number;
  title: string;
  level: string;
  mode: 'questions';
  score: number;
  qa: Array<{ q: string; a: string; score: number; feedback: string }>;
};

type Sample = ChatSample | QuestionsSample;

const samples: Sample[] = [
  {
    id: 1,
    title: 'Frontend Developer Interview',
    level: 'Mid Level',
    mode: 'chat',
    score: 8.2,
    sessionFeedback: "Strong technical depth throughout. You explained trade-offs clearly and backed answers with real experience. Work on being more concise in follow-up answers.",
    messages: [
      { role: 'user', text: "Hi, I'm ready to start. I'm a mid-level frontend dev, about 4 years in React." },
      { role: 'ai',   text: "Great, let's dive in. How do you handle state management in large React applications?" },
      { role: 'user', text: "I keep state as local as possible — if only one component needs it, it lives there. As it grows I lift it up, or use Context for auth and theme. For complex async state I reach for React Query." },
      { role: 'ai',   text: "How do you decide between Context and something like Zustand or Redux?" },
      { role: 'user', text: "Context is fine for low-frequency updates like user preferences. But for high-frequency updates the re-render overhead becomes a real problem. That's when I reach for Zustand — lightweight, no boilerplate." },
      { role: 'ai',   text: "Have you run into that performance issue in a real project?" },
      { role: 'user', text: "Yes — on a dashboard with shared filter state, every consumer re-rendered on every keystroke. We split the context and memoized the heavy consumers. Eventually moved filters to Zustand entirely and the jank disappeared." },
    ],
  },
  {
    id: 2,
    title: 'Product Manager Interview',
    level: 'Senior Level',
    mode: 'questions',
    score: 7.4,
    qa: [
      {
        q: 'Tell me about a time you had to make a product decision with incomplete data.',
        a: 'At my last company we needed to decide whether to build a native mobile app or invest in PWA improvements. We had limited research data, so I ran a 2-week spike: surveyed our top 50 customers, analyzed session data, and spoke with 5 churned users. We found 70% of power users were on desktop and mobile was mostly used for quick lookups. We chose PWA improvements — shipped faster and reduced mobile churn by 15%.',
        score: 8.0,
        feedback: 'Great STAR structure. You showed how to gather just enough signal to make a confident call under uncertainty.',
      },
      {
        q: 'How do you prioritize features when everything feels urgent?',
        a: "I use RICE scoring combined with stakeholder alignment. I quantify reach, impact, confidence, and effort for each candidate, then bring the top options to a session with engineering and design to pressure-test assumptions. I've found the conversation surfaces dependencies that change the ranking. I share the final stack-ranked list broadly so everyone understands the trade-offs.",
        score: 7.0,
        feedback: 'Solid framework. The stakeholder alignment step shows maturity. Try to anchor it with a specific example.',
      },
    ],
  },
  {
    id: 3,
    title: 'Data Scientist Interview',
    level: 'Entry Level',
    mode: 'chat',
    score: 6.8,
    sessionFeedback: "Good foundational knowledge and practical instincts. You showed real maturity in the stakeholder answer. Focus on being more precise with technical definitions under pressure.",
    messages: [
      { role: 'user', text: "Ready to go! I'm entry level, finished a data science bootcamp 6 months ago and have been working on a few personal projects." },
      { role: 'ai',   text: "Perfect, let's start there. How do you approach a new machine learning problem you haven't worked on before?" },
      { role: 'user', text: "I start by understanding the business objective before touching any data. What does success look like? Then I explore the data — distributions, missing values, correlations. I always try a simple baseline first, even linear regression, just to have something to beat." },
      { role: 'ai',   text: "What if the simple baseline actually performs well enough?" },
      { role: 'user', text: "Then I question whether we need something more complex. A model that's explainable and easy to maintain is often worth more than a 2% accuracy gain from a black box." },
      { role: 'ai',   text: "Have you ever had to explain that trade-off to someone?" },
      { role: 'user', text: "In a project for a marketing case study — I chose logistic regression over a random forest because the coefficients told me which behaviors to target. The accuracy was slightly lower but the insights were actually usable." },
    ],
  },
];

function ScoreRing({ score }: { score: number }) {
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : '#6366f1';
  const pct = score / 10;
  const r = 18; const circ = 2 * Math.PI * r;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#F0EEF8" strokeWidth="4" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

function SampleCard({ session }: { session: Sample }) {
  const [open, setOpen] = useState(false);
  const scoreColor = session.score >= 8 ? '#22c55e' : session.score >= 6 ? '#f59e0b' : '#6366f1';

  return (
    <div style={cardStyle} className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-5">
        <div className="relative shrink-0">
          <ScoreRing score={session.score} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color: scoreColor }}>{session.score}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1A1A2E]">{session.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#EEF0FF', color: '#5B6CF9' }}>
              {session.level}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)', color: '#8B5CF6' }}>
              {session.mode === 'chat'
                ? <><MessageCircle className="w-3 h-3" /> Chat</>
                : <><LayoutList className="w-3 h-3" /> Questions</>}
            </span>
          </div>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6CF9] hover:text-[#8B5CF6] transition-colors shrink-0"
        >
          {open ? 'Hide' : 'Preview'}
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#EEECF8]">
          {session.mode === 'chat' ? (
            /* ── Chat mode: message bubbles ── */
            <div className="p-5 space-y-3">
              {session.messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mb-0.5"
                      style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className="px-4 py-2.5 text-sm leading-relaxed max-w-[78%]"
                    style={msg.role === 'ai' ? {
                      background: '#F3F4F6',
                      color: '#1A1A2E',
                      borderRadius: '4px 18px 18px 18px',
                    } : {
                      background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)',
                      color: 'white',
                      borderRadius: '18px 4px 18px 18px',
                    }}
                  >
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0 flex items-center justify-center mb-0.5">
                      <span className="text-xs font-bold text-gray-500">U</span>
                    </div>
                  )}
                </div>
              ))}
              {/* Session feedback */}
              <div className="mt-4 flex items-start gap-3 rounded-xl p-4" style={{ background: '#EEF0FF', border: '1px solid #C4BFEF' }}>
                <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-[#5B6CF9]">Session Feedback</p>
                    <span className="text-xs font-bold" style={{ color: scoreColor }}>{session.score}/10</span>
                  </div>
                  <p className="text-xs text-[#1A1A2E70] leading-relaxed">{session.sessionFeedback}</p>
                </div>
              </div>
            </div>
          ) : (
            /* ── Questions mode: structured Q&A ── */
            <div className="divide-y divide-[#EEECF8]">
              {session.qa.map((item, i) => {
                const qColor = item.score >= 8 ? '#22c55e' : item.score >= 6 ? '#f59e0b' : '#6366f1';
                return (
                  <div key={i} className="p-5 space-y-3">
                    <p className="text-xs font-semibold text-[#1A1A2E40] uppercase tracking-widest">Question {i + 1}</p>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{item.q}</p>
                    <div className="rounded-xl p-4" style={{ background: '#F8F7FC', border: '1px solid #EEECF8' }}>
                      <p className="text-xs font-semibold text-[#1A1A2E40] uppercase tracking-widest mb-2">Sample Answer</p>
                      <p className="text-sm text-[#1A1A2E80] leading-relaxed">{item.a}</p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: '#EEF0FF', border: '1px solid #C4BFEF' }}>
                      <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-[#5B6CF9]">AI Feedback</p>
                          <span className="text-xs font-bold" style={{ color: qColor }}>{item.score}/10</span>
                        </div>
                        <p className="text-xs text-[#1A1A2E70] leading-relaxed">{item.feedback}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SampleSessionsPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E]">Sample Sessions</h1>
            <p className="text-sm text-[#1A1A2E60] mt-1">See what a MockMate interview looks like before you start.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/interview')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', boxShadow: '0 4px 20px rgba(91, 108, 249, 0.25)' }}
          >
            Start Your Own <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {samples.map(s => <SampleCard key={s.id} session={s} />)}
        </div>

      </div>
    </DashboardLayout>
  );
}

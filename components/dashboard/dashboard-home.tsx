'use client';

import { useRouter } from 'next/navigation';
import {
  Clock, TrendingUp, Play, History, ArrowRight,
  BarChart3, Target, Sparkles, ChevronRight,
  MessageCircle, LayoutList, Zap, FileText, Plus,
} from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useUserInterviews } from '@/hooks/use-user-interviews';
import { useAuth } from '@/hooks/use-auth';
import { TbGhost2 } from 'react-icons/tb';

function Bone({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />;
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(score / 10, 1);
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : '#6366f1';
  const r = 32; const circ = 2 * Math.PI * r;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
      <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        className="transition-all duration-700" />
    </svg>
  );
}

function StatCard({
  label, value, icon: Icon, highlight = false,
}: { label: string; value: string | number; icon: React.FC<React.SVGProps<SVGSVGElement>>; highlight?: boolean }) {
  return (
    <div
      className="rounded-2xl bg-white p-5 relative overflow-hidden flex flex-col gap-1"
      style={{
        border: '1px solid #EEECF8',
        borderTop: '3px solid transparent',
        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #5B6CF9, #8B5CF6)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}
        >
          <Icon className="w-4 h-4" style={{ color: '#8B5CF6' }} />
        </div>
      </div>
      {highlight ? (
        <span
          className="text-3xl font-bold leading-none tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {value}
        </span>
      ) : (
        <p className="text-3xl font-bold leading-none tracking-tight text-gray-900">{value}</p>
      )}
    </div>
  );
}

export default function DashboardHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading: profileLoading, plan, credits } = useUserProfile();
  const { sessions, loading: sessionsLoading } = useUserInterviews(user?.id || null);

  const loading = profileLoading || sessionsLoading;
  const firstName = profile?.name?.split(' ')[0] || 'there';
  const scored = sessions.filter(s => s.score != null);
  const avgScore = scored.length > 0 ? scored.reduce((s, x) => s + (x.score ?? 0), 0) / scored.length : 0;
  const bestScore = scored.length > 0 ? Math.max(...scored.map(s => s.score!)) : 0;
  const isNew = !loading && sessions.length === 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2"><Bone className="h-8 w-52" /><Bone className="h-4 w-72" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Bone key={i} className="h-24" />)}
        </div>
        <div className="grid lg:grid-cols-5 gap-5">
          <Bone className="lg:col-span-3 h-60" />
          <Bone className="lg:col-span-2 h-60" />
        </div>
        <div className="grid lg:grid-cols-5 gap-5">
          <Bone className="lg:col-span-2 h-40" />
          <Bone className="lg:col-span-3 h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Greeting ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E]">
            {isNew ? `Welcome, ${firstName}! 👋` : `Welcome back, ${firstName}! 👋`}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isNew
              ? 'Start your first mock interview to begin tracking your progress.'
              : `${sessions.length} session${sessions.length !== 1 ? 's' : ''} completed${avgScore > 0 ? ` · ${avgScore.toFixed(1)} avg score` : ''}`}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3.5 py-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-gray-500 capitalize">{plan ?? 'free'}</span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400">{credits === Infinity ? '∞' : credits} session{credits !== 1 ? 's' : ''} left</span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sessions Completed" value={sessions.length}                                          icon={Target}    />
        <StatCard label="Avg Score"           value={avgScore > 0  ? avgScore.toFixed(1)  : '—'}             icon={BarChart3} />
        <StatCard label="Best Score"          value={bestScore > 0 ? bestScore.toFixed(1) : '—'}             icon={TrendingUp}/>
        <StatCard label="Sessions Left"        value={credits === Infinity ? '∞' : credits}                    icon={Zap}       highlight />
      </div>

      {/* ── Row 2: CTA + Recent Sessions ── */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* CTA card */}
        <div
          className="lg:col-span-3 relative overflow-hidden rounded-2xl flex flex-col justify-between min-h-[240px] p-7"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 40%, #6d28d9 75%, #7c3aed 100%)' }}
        >
          {/* Glow blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-violet-400/25 rounded-full blur-2xl translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-blue-300/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/20">
              <Play className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">
              {isNew ? 'Start your first interview' : 'Start your next interview'}
            </h2>
            <p className="text-white/55 text-sm mt-2 leading-relaxed">
              AI-powered mock interviews tailored to your role, level, and resume — scored feedback on every answer.
            </p>
          </div>

          <div className="relative z-10 mt-8">
            {credits === 0 ? (
              <div className="inline-block px-5 py-2.5 text-sm text-white/40 border border-white/20 rounded-xl">
                No sessions remaining
              </div>
            ) : (
              <button
                onClick={() => router.push('/dashboard/interview')}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{ background: 'white', color: '#5B6CF9' }}
              >
                Start Practice
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Recent sessions */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-300" />
              Recent Sessions
            </h2>
            {sessions.length > 0 && (
              <button
                onClick={() => router.push('/dashboard/sessions')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 transition-colors"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 flex items-center justify-center">
                  <TbGhost2 className="w-16 h-16" style={{ color: '#8B5CF6', opacity: 0.25, strokeWidth: 1 }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-[#1A1A2E60]">No sessions yet</p>
                  <p className="text-xs text-[#1A1A2E30] mt-0.5">Completed interviews will appear here</p>
                </div>
              </div>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-gray-50 overflow-y-auto">
              {sessions.slice(0, 5).map((s) => {
                const sc = s.score;
                const dotCls = !sc
                  ? 'bg-gray-100 text-gray-400'
                  : sc >= 8 ? 'bg-green-50 text-green-500'
                  : sc >= 6 ? 'bg-amber-50 text-amber-500'
                  : 'bg-red-50 text-red-500';
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => router.push(`/dashboard/interview/session?id=${s.id}`)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className={`w-9 h-9 ${dotCls} rounded-xl flex flex-col items-center justify-center shrink-0`}>
                        {sc != null
                          ? <span className="text-xs font-bold leading-none">{sc.toFixed(1)}</span>
                          : <Clock className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{s.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                          <span>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="flex items-center gap-1">
                            {s.mode === 'questions'
                              ? <><LayoutList className="w-3 h-3" />Questions</>
                              : <><MessageCircle className="w-3 h-3" />Chat</>}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 shrink-0 transition-colors" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Row 3: Score ring + Quick actions ── */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* Avg score ring */}
        {avgScore > 0 ? (
          <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex items-center gap-5">
            <div className="relative shrink-0">
              <ScoreRing score={avgScore} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{avgScore.toFixed(1)}</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Avg Score</p>
              <p className="text-3xl font-bold text-gray-900 leading-none">
                {avgScore.toFixed(1)}<span className="text-base font-normal text-gray-400"> / 10</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                across {scored.length} scored session{scored.length !== 1 ? 's' : ''}
              </p>
              <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(avgScore / 10) * 100}%`,
                    background: avgScore >= 8 ? '#22c55e' : avgScore >= 6 ? '#f59e0b' : '#6366f1',
                  }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white border border-dashed border-gray-200 shadow-sm rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">No scores yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Complete a session to see your score</p>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-3">
          {[
            { label: 'Session History', sub: 'Review past interviews', path: '/dashboard/sessions',      icon: History  },
            { label: 'Resume Checker',  sub: 'Analyze your resume',    path: '/dashboard/resume',         icon: Target   },
            { label: 'Create Resume',   sub: 'Build with AI',          path: '/dashboard/create-resume',  icon: Sparkles },
            { label: 'Settings',        sub: 'Account & preferences',  path: '/dashboard/settings',       icon: FileText },
          ].map(({ label, sub, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md shadow-sm rounded-2xl p-4 text-left transition-all group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                <Icon className="w-4 h-4 text-[#5B6CF9]" />
              </div>
              <p className="text-sm font-semibold text-[#1A1A2E]">{label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#1A1A2E60' }}>{sub}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

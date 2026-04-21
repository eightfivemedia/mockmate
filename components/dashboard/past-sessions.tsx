'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, Target, TrendingUp, ChevronRight, MessageCircle, LayoutList, History } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUserInterviews } from '@/hooks/use-user-interviews';
import { TbGhost2 } from 'react-icons/tb';

function Bone({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />;
}

const statCardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #EEECF8',
  borderTop: '3px solid transparent',
  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #5B6CF9, #8B5CF6)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
  boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
  borderRadius: '16px',
  padding: '20px',
};

const listContainerStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #EEECF8',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
  padding: '8px',
};

export function PastSessions() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessions, loading } = useUserInterviews(user?.id || null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const scored = sessions.filter(s => s.score != null);
  const avgScore = scored.length > 0 ? scored.reduce((s, x) => s + (x.score ?? 0), 0) / scored.length : null;
  const totalMinutes = sessions.reduce((s, x) => s + (x.duration_minutes ?? 0), 0);
  const bestScore = scored.length > 0 ? Math.max(...scored.map(s => s.score!)) : null;

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title?.toLowerCase().includes(q) || s.type?.toLowerCase().includes(q) || s.experience_level?.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || s.mode === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) {
    return (
      <div className="flex flex-col px-8 pt-6 pb-6 h-full gap-5">
        <Bone className="h-8 w-48 shrink-0" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">{[...Array(4)].map((_, i) => <Bone key={i} className="h-24" />)}</div>
        <div className="space-y-2 flex-1">{[...Array(5)].map((_, i) => <Bone key={i} className="h-16" />)}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Past Sessions</h1>
        <p className="text-sm text-[#1A1A2E60] mt-1">Review your completed interview sessions and track your progress.</p>
      </div>

      {/* Stat cards */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {[
            { label: 'Sessions',      value: sessions.length,                                                                                              icon: History    },
            { label: 'Avg Score',     value: avgScore  != null ? `${avgScore.toFixed(1)}/10`  : '—',                                                      icon: Target     },
            { label: 'Best Score',    value: bestScore != null ? `${bestScore.toFixed(1)}/10` : '—',                                                      icon: TrendingUp },
            { label: 'Practice Time', value: totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`,         icon: Clock      },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={statCardStyle}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40]">{label}</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                  <Icon className="w-4 h-4 text-[#8B5CF6]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1A1A2E] leading-none">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {sessions.length > 0 && (
        <div className="flex gap-3 flex-col sm:flex-row shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A2E30]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sessions…"
              className="w-full rounded-xl border border-[#EEECF8] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#1A1A2E30] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 transition-all"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-xl border border-[#EEECF8] bg-white px-3 py-2.5 text-sm text-[#4A4A6A] focus:outline-none focus:border-[#8B5CF6] transition-all"
          >
            <option value="all">All formats</option>
            <option value="chat">Chat</option>
            <option value="questions">Questions</option>
          </select>
        </div>
      )}

      {/* Sessions list */}
      <div className="flex flex-col overflow-hidden" style={{ ...listContainerStyle, flex: 1, minHeight: 0, ...(sessions.length === 0 && { padding: '24px' }) }}>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
              <TbGhost2 className="w-9 h-9 text-[#8B5CF6]" style={{ strokeWidth: 1 }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1A1A2E60]">No sessions yet</p>
              <p className="text-xs text-[#1A1A2E30] mt-0.5">Complete your first interview to see it here</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/interview')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity mt-2"
              style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', boxShadow: '0 4px 20px rgba(91, 108, 249, 0.3)' }}
            >
              Start Interview
            </button>
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 py-14">
            <p className="text-sm text-[#1A1A2E40]">No sessions match your search.</p>
          </div>

        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-1">
            {filtered.map((session) => {
              const score = session.score;
              const scoreColor = score == null ? null : score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : '#ef4444';
              return (
                <button
                  key={session.id}
                  onClick={() => router.push(`/dashboard/interview/session?id=${session.id}`)}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-[#F8F7FC] transition-colors cursor-pointer text-left group w-full"
                >
                  {/* Left icon */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                      <History className="w-4 h-4 text-[#8B5CF6]" />
                    </div>

                    {/* Title + meta */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A2E] truncate">{session.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#1A1A2E40]">
                          {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {score != null && (
                          <span className="text-xs font-semibold" style={{ color: scoreColor! }}>{score.toFixed(1)}/10</span>
                        )}
                        {session.experience_level && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                            style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)', color: '#5B6CF9' }}
                          >
                            {session.experience_level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    <div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[#8B5CF6]"
                      style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}
                    >
                      {session.mode === 'questions'
                        ? <><LayoutList className="w-3 h-3" />Questions</>
                        : <><MessageCircle className="w-3 h-3" />Chat</>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#1A1A2E20] group-hover:text-[#8B5CF6] transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

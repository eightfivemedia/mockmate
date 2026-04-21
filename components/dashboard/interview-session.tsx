'use client';

import {
  Square, Mic, Send, ChevronRight, Clock, MessageSquare, Target,
  ThumbsUp, AlertCircle, Lightbulb, SkipForward, Loader2,
  CheckCircle2, FileText, Upload, X, Brain, LogOut,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInterviewSession } from '@/hooks/use-interview-session';
import { InterviewChat } from './interview-chat';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type Question       = { id: number; type: string; question: string; difficulty: 'easy' | 'medium' | 'hard' };
type AnswerFeedback = { score: number | null; feedback: string };
type QARecord       = { question: string; answer: string; score: number | null; feedback: string };

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #EEECF8',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
  padding: '24px',
};

export function InterviewSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('id') ?? null;
  const { session, loading, error, updateSession } = useInterviewSession(sessionId);
  const { profile } = useAuth();
  const { toast } = useToast();

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef     = useRef<HTMLInputElement>(null);

  const [currentQuestion, setCurrentQuestion]   = useState(0);
  const [answer, setAnswer]                     = useState('');
  const [isRecording, setIsRecording]           = useState(false);
  const [showFeedback, setShowFeedback]         = useState(false);
  const [sessionComplete, setSessionComplete]   = useState(false);
  const [interviewMode, setInterviewMode]       = useState<'chat' | 'questions'>('chat');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questions, setQuestions]               = useState<Question[]>([]);
  const [resumeFile, setResumeFile]             = useState<File | null>(null);
  const [jdFile, setJdFile]                     = useState<File | null>(null);
  const [uploadingResume, setUploadingResume]   = useState(false);
  const [uploadingJD, setUploadingJD]           = useState(false);
  const [scoringAnswer, setScoringAnswer]       = useState(false);
  const [currentFeedback, setCurrentFeedback]   = useState<AnswerFeedback | null>(null);
  const [qaRecords, setQaRecords]               = useState<QARecord[]>([]);
  const [sessionStartTime]                      = useState<Date>(new Date());
  const [generatingSessionFeedback, setGeneratingSessionFeedback] = useState(false);
  const [sessionFeedback, setSessionFeedback]   = useState<{ tips: string[]; strengths: string[]; averageScore: number } | null>(null);

  useEffect(() => {
    if (session?.questions && Array.isArray(session.questions) && session.questions.length > 0) {
      setQuestions(session.questions);
    } else {
      setQuestions([]);
    }
    setCurrentQuestion(0);
  }, [session]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          </div>
          <p className="text-sm text-[#1A1A2E50]">Loading your interview session…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A2E]">Session Not Found</h2>
            <p className="text-sm text-[#1A1A2E50] mt-1">{error || 'The interview session could not be loaded.'}</p>
          </div>
          <Link href="/dashboard/interview">
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', boxShadow: '0 4px 20px rgba(91, 108, 249, 0.3)' }}>
              Start New Interview
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Already-ended session (user returning to a completed session) ────────────
  if (session.completed_at && !sessionComplete) {
    const endedAt = new Date(session.completed_at);
    const sessionScore = session.score ?? null;
    const scoreColor = sessionScore !== null
      ? sessionScore >= 7 ? '#22c55e' : sessionScore >= 5 ? '#f59e0b' : '#ef4444'
      : null;
    const parsedFeedback: { tips?: string[]; strengths?: string[] } | null = (() => {
      if (!session.feedback) return null;
      try { return JSON.parse(session.feedback); } catch { return null; }
    })();

    const chatMessages = session.chat_messages ?? [];
    const qaRecords = session.qa_records ?? [];
    const isChat = session.mode === 'chat' || (chatMessages.length > 0 && qaRecords.length === 0);

    return (
      <div className="flex flex-col gap-5 pb-6">

        {/* Header */}
        <div className="shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
              <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A2E]">{session.title || `${session.role} Interview`}</h1>
              <p className="text-xs text-[#1A1A2E40] capitalize">
                {session.role} · {session.experience_level} · Ended{' '}
                {endedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                {endedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Score + metadata row */}
        {(sessionScore !== null || session.duration_minutes) && (
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {sessionScore !== null && (
              <div style={cardStyle} className="text-center">
                <p className="text-2xl font-bold leading-none" style={{ color: scoreColor! }}>
                  {sessionScore.toFixed(1)}<span className="text-sm font-normal text-[#1A1A2E40]">/10</span>
                </p>
                <p className="text-xs text-[#1A1A2E40] mt-1.5">Score</p>
              </div>
            )}
            {session.duration_minutes && (
              <div style={cardStyle} className="text-center">
                <p className="text-2xl font-bold text-[#1A1A2E] leading-none">{session.duration_minutes}m</p>
                <p className="text-xs text-[#1A1A2E40] mt-1.5">Duration</p>
              </div>
            )}
            {session.questions_answered > 0 && (
              <div style={cardStyle} className="text-center">
                <p className="text-2xl font-bold text-[#1A1A2E] leading-none">{session.questions_answered}</p>
                <p className="text-xs text-[#1A1A2E40] mt-1.5">{isChat ? 'Replies' : 'Questions'}</p>
              </div>
            )}
          </div>
        )}

        {/* Chat history */}
        {isChat && chatMessages.length > 0 && (
          <div style={{ ...cardStyle, padding: '0' }} className="flex flex-col overflow-hidden shrink-0">
            <div className="px-5 py-3.5 border-b border-[#EEECF8]">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Conversation
              </p>
            </div>
            <div className="flex flex-col gap-4 p-5 max-h-[520px] overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                      <Brain className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                  )}
                  {msg.role === 'assistant' ? (
                    <div className="rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]"
                      style={{ background: '#F8F7FC', border: '1px solid #EEECF8' }}>
                      <p className="text-sm text-[#1A1A2E] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]"
                      style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat mode — no messages yet */}
        {isChat && chatMessages.length === 0 && (
          <div style={cardStyle} className="text-center py-10">
            <p className="text-sm text-[#1A1A2E40]">No conversation history saved for this session.</p>
          </div>
        )}

        {/* Questions mode — Q&A records */}
        {!isChat && qaRecords.length > 0 && (
          <div className="flex flex-col gap-3 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> Questions & Answers
            </p>
            {qaRecords.map((qa, i) => {
              const qScore = qa.score;
              const qColor = qScore !== null ? qScore >= 7 ? '#22c55e' : qScore >= 5 ? '#f59e0b' : '#ef4444' : null;
              return (
                <div key={i} style={cardStyle}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-xs font-semibold text-[#1A1A2E40] uppercase tracking-widest">Q{i + 1}</p>
                    {qScore !== null && (
                      <span className="text-sm font-bold shrink-0" style={{ color: qColor! }}>{qScore}/10</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#1A1A2E] mb-2">{qa.question}</p>
                  {qa.answer && qa.answer !== '[Skipped]' && (
                    <div className="rounded-xl px-4 py-3 mb-3" style={{ background: '#F8F7FC', border: '1px solid #EEECF8' }}>
                      <p className="text-sm text-[#1A1A2E70] leading-relaxed whitespace-pre-wrap">{qa.answer}</p>
                    </div>
                  )}
                  {qa.answer === '[Skipped]' && (
                    <p className="text-xs italic text-[#1A1A2E30] mb-2">Skipped</p>
                  )}
                  {qa.feedback && qa.feedback !== 'Question skipped.' && (
                    <p className="text-xs text-[#1A1A2E50] leading-relaxed">{qa.feedback}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Questions mode — no Q&A records, show question list only */}
        {!isChat && qaRecords.length === 0 && session.questions?.length > 0 && (
          <div className="flex flex-col gap-3 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> Questions
            </p>
            {session.questions.map((q, i) => (
              <div key={i} style={cardStyle}>
                <p className="text-xs font-semibold text-[#1A1A2E40] uppercase tracking-widest mb-2">Q{i + 1}</p>
                <p className="text-sm text-[#1A1A2E] leading-relaxed">{q.question}</p>
              </div>
            ))}
          </div>
        )}

        {/* Feedback — tips & strengths */}
        {parsedFeedback && (parsedFeedback.strengths?.length || parsedFeedback.tips?.length) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
            {parsedFeedback.strengths && parsedFeedback.strengths.length > 0 && (
              <div style={cardStyle}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}>
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E]">What you did well</h3>
                </div>
                <ul className="space-y-2.5">
                  {parsedFeedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A2E70]">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {parsedFeedback.tips && parsedFeedback.tips.length > 0 && (
              <div style={cardStyle}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                    <Lightbulb className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E]">Tips for improvement</h3>
                </div>
                <ul className="space-y-2.5">
                  {parsedFeedback.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A2E70]">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#8B5CF6' }} />{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-3 shrink-0">
          <Link href="/dashboard/sessions" className="flex-1">
            <button className="w-full text-[#1A1A2E] text-sm font-semibold py-3 rounded-xl hover:bg-[#F8F7FC] transition-colors"
              style={{ border: '1px solid #EEECF8' }}>
              View Past Sessions
            </button>
          </Link>
          <Link href="/dashboard/interview" className="flex-1">
            <button className="w-full text-sm font-semibold py-3 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', boxShadow: '0 4px 20px rgba(91, 108, 249, 0.25)' }}>
              Start New Interview
            </button>
          </Link>
        </div>

      </div>
    );
  }

  const markSessionCompleted = async () => {
    await updateSession({ completed_at: new Date().toISOString() });
  };

  const canGenerateQuestions = !!session.resume_text || !!session.job_description_text;
  const progress = questions.length > 0 ? (currentQuestion / questions.length) * 100 : 0;

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const response = await fetch('/api/generate-questions-on-demand', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate questions');
      setQuestions(data.questions.map((q: string, i: number) => ({ id: i + 1, type: 'mixed', question: q, difficulty: 'medium' })));
    } catch {
      toast({ title: 'Error', description: 'Failed to generate questions.', variant: 'destructive' });
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || scoringAnswer) return;
    setScoringAnswer(true); setShowFeedback(false); setCurrentFeedback(null);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const token = authSession?.access_token;
      if (!token) throw new Error('Not authenticated');
      const response = await fetch('/api/score-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question: questions[currentQuestion].question, answer: answer.trim(), context: `${session.role} — ${session.experience_level} level` }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to score answer');
      setCurrentFeedback({ score: data.score, feedback: data.feedback });
      setShowFeedback(true);
      setQaRecords(prev => [...prev, { question: questions[currentQuestion].question, answer: answer.trim(), score: data.score, feedback: data.feedback }]);
    } catch {
      toast({ title: 'Error', description: 'Failed to score your answer.', variant: 'destructive' });
    } finally {
      setScoringAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1); setAnswer(''); setShowFeedback(false); setCurrentFeedback(null);
    } else {
      handleCompleteSession();
    }
  };

  const handleCompleteSession = async () => {
    setGeneratingSessionFeedback(true); setSessionComplete(true);
    await markSessionCompleted();
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const token = authSession?.access_token;
      if (!token) throw new Error('Not authenticated');
      const response = await fetch('/api/session-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sessionId: session.id, questionsAndAnswers: qaRecords, context: `${session.role} — ${session.experience_level} level`, startTime: sessionStartTime.toISOString(), endTime: new Date().toISOString() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate feedback');
      setSessionFeedback({ tips: data.feedback?.tips || [], strengths: data.feedback?.strengths || [], averageScore: data.averageScore || 0 });
    } catch {
      toast({ title: 'Error', description: 'Could not generate session feedback.', variant: 'destructive' });
    } finally {
      setGeneratingSessionFeedback(false);
    }
  };

  const handleSkipQuestion = () => {
    setQaRecords(prev => [...prev, { question: questions[currentQuestion].question, answer: '[Skipped]', score: 0, feedback: 'Question skipped.' }]);
    handleNextQuestion();
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/extract-text', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Failed to extract text');
    return (await response.json()).text || '';
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    setResumeFile(file); setUploadingResume(true);
    try {
      const text = await extractTextFromFile(file);
      await updateSession({ resume_text: text, resume_file_path: 'resume_uploaded' });
    } catch {
      toast({ title: 'Upload failed', description: 'Could not process resume.', variant: 'destructive' });
    } finally { setUploadingResume(false); }
  };

  const handleJDUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    setJdFile(file); setUploadingJD(true);
    try {
      const text = await extractTextFromFile(file);
      await updateSession({ job_description_text: text, job_description_file_path: 'jd_uploaded' });
    } catch {
      toast({ title: 'Upload failed', description: 'Could not process job description.', variant: 'destructive' });
    } finally { setUploadingJD(false); }
  };

  // ── Session Complete ─────────────────────────────────────────────────────────
  if (sessionComplete) {
    const durationMinutes = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000);
    const displayScore = sessionFeedback?.averageScore ? Math.round(sessionFeedback.averageScore * 10) / 10 : null;
    const scoreColor = displayScore !== null
      ? displayScore >= 7 ? '#22c55e' : displayScore >= 5 ? '#f59e0b' : '#6366f1'
      : '#9CA3AF';
    const barColor = displayScore !== null
      ? displayScore >= 7 ? '#22c55e' : displayScore >= 5 ? '#f59e0b' : '#6366f1'
      : '#e5e7eb';

    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-12">

        <div className="text-center pt-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)', border: '1px solid #C4BFEF' }}>
            <CheckCircle2 className="w-7 h-7 text-[#8B5CF6]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Interview Complete</h1>
          <p className="text-sm text-[#1A1A2E50] mt-1">
            {session.role} · {session.experience_level} level ·{' '}
            {qaRecords.filter(r => r.answer !== '[Skipped]').length} of {questions.length} questions answered
          </p>
        </div>

        <div style={cardStyle}>
          <div className="grid grid-cols-3 divide-x divide-[#EEECF8] text-center">
            <div className="px-4">
              {generatingSessionFeedback
                ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#8B5CF6] mb-1" />
                : <p className="text-3xl font-bold leading-none" style={{ color: scoreColor }}>
                    {displayScore ?? '—'}{displayScore && <span className="text-base font-normal text-[#1A1A2E40]">/10</span>}
                  </p>}
              <p className="text-xs font-medium text-[#1A1A2E40] mt-1.5">Overall Score</p>
            </div>
            <div className="px-4">
              <p className="text-3xl font-bold text-[#1A1A2E] leading-none">{questions.length}</p>
              <p className="text-xs font-medium text-[#1A1A2E40] mt-1.5">Questions</p>
            </div>
            <div className="px-4">
              <p className="text-3xl font-bold text-[#1A1A2E] leading-none">{durationMinutes}m</p>
              <p className="text-xs font-medium text-[#1A1A2E40] mt-1.5">Duration</p>
            </div>
          </div>

          {!generatingSessionFeedback && displayScore !== null && (
            <div className="mt-5">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F0EEF8' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(displayScore / 10) * 100}%`, background: barColor }} />
              </div>
            </div>
          )}
          {generatingSessionFeedback && (
            <p className="text-center text-sm text-[#1A1A2E40] mt-4">Generating your feedback…</p>
          )}
        </div>

        {!generatingSessionFeedback && sessionFeedback && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}>
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="text-sm font-semibold text-[#1A1A2E]">What you did well</h3>
              </div>
              <ul className="space-y-2.5">
                {sessionFeedback.strengths.length > 0 ? sessionFeedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A2E70]">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />{s}
                  </li>
                )) : <li className="text-sm text-[#1A1A2E40]">Complete more questions to see strengths.</li>}
              </ul>
            </div>
            <div style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                  <Lightbulb className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1A1A2E]">Tips for improvement</h3>
              </div>
              <ul className="space-y-2.5">
                {sessionFeedback.tips.length > 0 ? sessionFeedback.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A2E70]">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#8B5CF6' }} />{t}
                  </li>
                )) : <li className="text-sm text-[#1A1A2E40]">No specific tips at this time.</li>}
              </ul>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-[#1A1A2E30]">
          Scores and feedback are AI-generated for practice purposes only.
        </p>

        <div className="flex gap-3">
          <Link href="/dashboard/sessions" className="flex-1">
            <button className="w-full text-[#1A1A2E] text-sm font-semibold py-3 rounded-xl hover:bg-[#F8F7FC] transition-colors"
              style={{ border: '1px solid #EEECF8' }}>
              View All Sessions
            </button>
          </Link>
          <Link href="/dashboard/interview" className="flex-1">
            <button className="w-full text-sm font-semibold py-3 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', boxShadow: '0 4px 20px rgba(91, 108, 249, 0.25)' }}>
              Start New Interview
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Active Session ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col px-8 pt-6 pb-4 h-full gap-4">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Interview Session</h1>
          <p className="text-sm text-[#1A1A2E50] mt-0.5 capitalize">{session.role} · {session.experience_level} level</p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'white', border: '1px solid #EEECF8', color: '#4A4A6A' }}
        >
          <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
          {Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000)}m elapsed
        </div>
      </div>

      {/* Mode tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit shrink-0"
        style={{ background: 'white', border: '1px solid #EEECF8' }}
      >
        {[
          { id: 'chat',      label: 'Chat Mode',      icon: MessageSquare },
          { id: 'questions', label: 'Questions Mode',  icon: Target        },
        ].map(({ id, label, icon: Icon }) => {
          const active = interviewMode === id;
          return (
            <button
              key={id}
              onClick={() => setInterviewMode(id as 'chat' | 'questions')}
              className={`px-4 py-2 rounded-lg text-sm font-${active ? 'semibold' : 'medium'} flex items-center gap-2 transition-colors`}
              style={active
                ? { background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', color: 'white' }
                : { color: '#4A4A6A' }}
            >
              <Icon className="w-3.5 h-3.5" style={active ? {} : { color: '#8B8BAE' }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Chat Mode */}
      {interviewMode === 'chat' && sessionId && (
        <InterviewChat
          sessionId={sessionId}
          role={session.role}
          experienceLevel={session.experience_level}
          userName={profile?.name || 'Candidate'}
          resumeText={session.resume_text}
          jdText={session.job_description_text}
          onMarkCompleted={markSessionCompleted}
          onEndSession={() => router.push('/dashboard/sessions')}
        />
      )}

      {/* Questions Mode */}
      {interviewMode === 'questions' && (
        <div className="space-y-4 overflow-y-auto flex-1 pb-2">

          {/* Upload card */}
          {!canGenerateQuestions && (
            <div style={cardStyle}>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] flex items-center gap-2 mb-1">
                  <FileText className="w-3.5 h-3.5" /> Documents Required
                </p>
                <p className="text-sm font-semibold text-[#1A1A2E]">Upload a resume or job description to generate questions</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { ref: resumeInputRef, label: 'Resume', file: resumeFile, uploading: uploadingResume, handler: handleResumeUpload, onClear: () => setResumeFile(null) },
                  { ref: jdInputRef,     label: 'Job Description', file: jdFile, uploading: uploadingJD, handler: handleJDUpload, onClear: () => setJdFile(null) },
                ].map(({ ref, label, file, uploading, handler, onClear }) => (
                  <div key={label}>
                    <input ref={ref} type="file" accept=".txt,.pdf,.doc,.docx" onChange={handler} className="hidden" disabled={uploading} />
                    <p className="text-xs font-semibold text-[#1A1A2E40] uppercase tracking-widest mb-2">{label}</p>
                    {file ? (
                      <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                        style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)', border: '1px solid #C4BFEF' }}>
                        <FileText className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
                        <span className="text-sm text-[#1A1A2E] font-medium truncate flex-1">{file.name}</span>
                        {uploading
                          ? <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#8B5CF6]" />
                          : <button onClick={onClear} className="shrink-0 text-[#8B5CF6]"><X className="w-4 h-4" /></button>}
                      </div>
                    ) : (
                      <button
                        onClick={() => ref.current?.click()}
                        disabled={uploading}
                        className="w-full rounded-xl border-2 border-dashed border-[#D8D4F0] bg-[#F8F7FC] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#8B5CF6] hover:bg-[#F0EEF8] transition-all py-6 disabled:opacity-40"
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                          <Upload className="w-4 h-4 text-[#8B5CF6]" />
                        </div>
                        <p className="text-sm font-medium text-[#1A1A2E]">{uploading ? 'Uploading…' : `Upload ${label}`}</p>
                        <p className="text-xs text-[#1A1A2E30]">PDF, DOC, DOCX, TXT · Max 5MB</p>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate button */}
          {canGenerateQuestions && questions.length === 0 && (
            <div className="flex justify-center">
              <button onClick={handleGenerateQuestions} disabled={generatingQuestions}
                className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', boxShadow: '0 4px 20px rgba(91, 108, 249, 0.25)' }}>
                {generatingQuestions ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : 'Generate Questions'}
              </button>
            </div>
          )}

          {/* Progress bar */}
          {questions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#1A1A2E40]">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F0EEF8' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }} />
              </div>
            </div>
          )}

          {/* Current question card */}
          {questions[currentQuestion] && (
            <div style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Question {currentQuestion + 1}
                </p>
                <div className="flex gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                    style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)', color: '#5B6CF9' }}>
                    {questions[currentQuestion].type}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    questions[currentQuestion].difficulty === 'easy' ? 'bg-green-50 text-green-600'
                    : questions[currentQuestion].difficulty === 'hard' ? 'bg-red-50 text-red-500'
                    : 'bg-amber-50 text-amber-500'
                  }`}>
                    {questions[currentQuestion].difficulty}
                  </span>
                </div>
              </div>
              <p className="text-base text-[#1A1A2E] leading-relaxed">{questions[currentQuestion].question}</p>
            </div>
          )}

          {/* Answer card */}
          {questions[currentQuestion] && !showFeedback && (
            <div style={cardStyle}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-3">Your Answer</p>
              <textarea
                placeholder="Type your answer here…"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="w-full min-h-[140px] rounded-xl px-4 py-3 text-sm text-[#1A1A2E] placeholder:text-[#1A1A2E30] focus:outline-none focus:ring-2 resize-none transition-all"
                style={{ border: '1px solid #EEECF8', background: '#F8F7FC' }}
              />
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => setIsRecording(!isRecording)}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    isRecording ? 'bg-red-50 text-red-500' : 'text-[#4A4A6A] hover:bg-[#F8F7FC]'
                  }`}
                  style={{ border: isRecording ? '1px solid #FEE2E2' : '1px solid #EEECF8' }}>
                  {isRecording ? <><Square className="w-3 h-3" />Stop</> : <><Mic className="w-3 h-3" />Record</>}
                </button>
                <div className="flex gap-2">
                  <button onClick={handleSkipQuestion} disabled={scoringAnswer}
                    className="flex items-center gap-1 text-sm text-[#1A1A2E40] hover:text-[#1A1A2E60] disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors">
                    <SkipForward className="w-3 h-3" />Skip
                  </button>
                  <button onClick={handleSubmitAnswer} disabled={!answer.trim() || scoringAnswer}
                    className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
                    {scoringAnswer ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Scoring…</> : <><Send className="w-3.5 h-3.5" />Submit</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback card */}
          {showFeedback && currentFeedback && (
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #EEF0FF 0%, #F3EEFF 100%)', border: '1px solid #C4BFEF' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#5B6CF9] flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" /> AI Feedback
                </p>
                {currentFeedback.score !== null && (
                  <span className="text-2xl font-bold" style={{
                    color: currentFeedback.score >= 7 ? '#22c55e' : currentFeedback.score >= 5 ? '#f59e0b' : '#6366f1'
                  }}>
                    {currentFeedback.score}<span className="text-sm font-normal text-[#1A1A2E40]">/10</span>
                  </span>
                )}
              </div>
              {currentFeedback.score !== null && (
                <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.5)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(currentFeedback.score / 10) * 100}%`,
                      background: currentFeedback.score >= 7 ? '#22c55e' : currentFeedback.score >= 5 ? '#f59e0b' : '#6366f1',
                    }} />
                </div>
              )}
              <p className="text-sm text-[#1A1A2E80] leading-relaxed mb-3">{currentFeedback.feedback}</p>
              <p className="text-xs text-[#1A1A2E40] mb-4">AI-generated feedback for practice purposes only.</p>
              <div className="flex justify-end">
                <button onClick={handleNextQuestion}
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
                  {currentQuestion < questions.length - 1 ? <>Next Question <ChevronRight className="w-4 h-4" /></> : 'Complete Interview'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

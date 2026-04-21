'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { supabase } from '@/lib/supabase';
import {
  Play, FileText, Briefcase, Upload, X,
  Loader2, ArrowRight, MessageCircle, Target, Info,
} from 'lucide-react';
import { motion } from 'framer-motion';

const LEVELS = [
  { id: 'entry',  label: 'Entry Level',  sub: '0–2 years' },
  { id: 'mid',    label: 'Mid Level',    sub: '3–5 years' },
  { id: 'senior', label: 'Senior Level', sub: '5+ years'  },
] as const;

const MODES = [
  { id: 'chat',      label: 'Chat',      sub: 'Conversational AI interview', icon: MessageCircle },
  { id: 'questions', label: 'Questions', sub: 'Structured Q&A format',       icon: Target        },
] as const;

type Level = typeof LEVELS[number]['id'];
type Mode  = typeof MODES[number]['id'];

const experienceDescriptions: Record<string, string> = {
  'entry':  'Great for recent grads and career switchers. Questions focus on fundamentals and potential.',
  'mid':    'Ideal for professionals with 3–5 years. Questions balance technical depth with leadership.',
  'senior': 'For seasoned professionals. Expect strategic, cross-functional, and complex scenario questions.',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #EEECF8',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
  padding: '24px',
};

function UploadZone({ label, icon: Icon, file, onFile, onClear, uploading }: {
  label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  file: File | null; onFile: (f: File) => void; onClear: () => void; uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f); };

  return (
    <div className="flex-1 flex flex-col">
      <input ref={inputRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {file ? (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)', border: '1px solid #C4BFEF' }}>
          <Icon className="w-4 h-4 shrink-0" style={{ color: '#8B5CF6' }} />
          <span className="text-sm text-[#1A1A2E] font-medium truncate flex-1">{file.name}</span>
          {uploading
            ? <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: '#8B5CF6' }} />
            : <button onClick={onClear} className="shrink-0 transition-colors" style={{ color: '#8B5CF6' }}><X className="w-4 h-4" /></button>}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="flex-1 w-full rounded-xl border-2 border-dashed border-[#D8D4F0] bg-[#F8F7FC] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#8B5CF6] hover:bg-[#F0EEF8] transition-all py-6"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
            <Upload className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <p className="text-sm font-medium text-[#1A1A2E]">{label}</p>
          <p className="text-xs text-[#1A1A2E40]">PDF, DOC, DOCX, TXT · Max 5MB</p>
        </button>
      )}
    </div>
  );
}

export function StartInterview() {
  const { toast } = useToast();
  const [role, setRole] = useState('');
  const [level, setLevel] = useState<Level | ''>('');
  const [mode, setMode] = useState<Mode>('chat');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingJD, setUploadingJD] = useState(false);
  const [starting, setStarting] = useState(false);

  const canStart = role.trim().length > 0 && level !== '';
  const isDisabled = !canStart || starting || uploadingResume || uploadingJD;

  const extractText = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/extract-text', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Failed to extract text');
    return (await res.json()).text || '';
  };

  const handleResumeFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'File too large', description: 'Max 5MB.', variant: 'destructive' }); return; }
    setResumeFile(file); setUploadingResume(true);
    try { setResumeText(await extractText(file)); }
    catch { toast({ title: 'Upload failed', description: 'Could not read resume.', variant: 'destructive' }); setResumeFile(null); }
    finally { setUploadingResume(false); }
  };

  const handleJDFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'File too large', description: 'Max 5MB.', variant: 'destructive' }); return; }
    setJdFile(file); setUploadingJD(true);
    try { setJdText(await extractText(file)); }
    catch { toast({ title: 'Upload failed', description: 'Could not read job description.', variant: 'destructive' }); setJdFile(null); }
    finally { setUploadingJD(false); }
  };

  const handleStart = async () => {
    if (!canStart || starting) return;
    setStarting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated. Please log in again.');

      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: role.trim(), experienceLevel: level, responseFormat: 'mixed', resumeText: resumeText || undefined, jobDescriptionText: jdText || undefined, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'session_limit_reached') {
          toast({
            title: "You've used all your sessions this month",
            description: "Upgrade your plan for more sessions, or wait until the 1st of next month for your limit to reset.",
            action: (
              <ToastAction altText="Upgrade plan" onClick={() => window.location.href = '/dashboard/settings'}>
                Upgrade plan
              </ToastAction>
            ),
          });
          return;
        }
        throw new Error(data.error || 'Failed to create session');
      }
      window.location.href = `/dashboard/interview/session?id=${data.sessionId}`;
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to start interview. Please try again.', variant: 'destructive' });
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full pb-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Start an Interview</h1>
        <p className="text-sm text-[#1A1A2E60] mt-1">Configure your session and let the AI take it from there.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 grid-rows-[auto_auto_auto] gap-4 flex-1">

        {/* Cell 1 — Target Role (full width) */}
        <div className="col-span-12" style={cardStyle}>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-3">
            Target role <span className="text-red-400 normal-case tracking-normal font-normal">*</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Frontend Developer, Product Manager, Data Scientist"
            className="w-full rounded-xl border border-[#EEECF8] bg-[#F8F7FC] px-4 py-3 text-sm text-[#1A1A2E] placeholder:text-[#1A1A2E30] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 transition-all"
          />
        </div>

        {/* Cell 2 — Experience Level (7 cols) */}
        <div className="col-span-12 md:col-span-7" style={cardStyle}>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-3">
            Experience level <span className="text-red-400 normal-case tracking-normal font-normal">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            {LEVELS.map(({ id, label, sub }) => {
              const selected = level === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => setLevel(id)}
                  className="flex-1 rounded-xl px-4 py-3 sm:py-5 text-sm cursor-pointer text-center relative overflow-hidden"
                  animate={{
                    borderColor: selected ? 'transparent' : '#EEECF8',
                    color: selected ? '#ffffff' : '#4A4A6A',
                  }}
                  transition={{ duration: 0.18 }}
                  style={{ border: '1px solid #EEECF8', background: 'white' }}
                >
                  <motion.span
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', borderRadius: 'inherit' }}
                    animate={{ opacity: selected ? 1 : 0 }}
                    transition={{ duration: 0.18 }}
                  />
                  <span className="relative block font-semibold">{label}</span>
                  <motion.span
                    className="relative block text-xs mt-0.5"
                    animate={{ opacity: selected ? 0.7 : 0.4 }}
                    transition={{ duration: 0.18 }}
                  >
                    {sub}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
          {level && (
            <motion.p
              key={level}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-[#1A1A2E60] mt-3 leading-relaxed"
            >
              {experienceDescriptions[level]}
            </motion.p>
          )}
        </div>

        {/* Cell 3 — Interview Format (5 cols) */}
        <div className="col-span-12 md:col-span-5 flex flex-col" style={cardStyle}>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-3">
            Interview format
          </label>
          <div className="flex flex-col gap-2 flex-1">
            {MODES.map(({ id, label, sub, icon: Icon }) => {
              const questionsLocked = id === 'questions' && !resumeText && !jdText;
              const selected = mode === id;
              return selected ? (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className="rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all text-left"
                  style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/20">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-semibold">{label}</p>
                    <p className="text-xs text-white/70">{sub}</p>
                  </div>
                </button>
              ) : (
                <button
                  key={id}
                  onClick={() => !questionsLocked && setMode(id)}
                  disabled={questionsLocked}
                  className={`rounded-xl border border-[#EEECF8] p-3 flex items-center gap-3 transition-all text-left ${questionsLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-[#8B5CF6] hover:bg-[#F8F7FC]'}`}
                  style={{ background: 'white' }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                    <Icon className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">{label}</p>
                    <p className="text-xs text-[#1A1A2E40]">
                      {questionsLocked ? 'Upload a resume or JD to unlock' : sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cell 4 — Resume Upload (6 cols) */}
        <div className="col-span-12 md:col-span-6 flex flex-col" style={cardStyle}>
          <div className="flex items-center gap-1.5 mb-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40]">
              Resume
            </label>
            <span className="text-xs text-[#1A1A2E30] normal-case tracking-normal font-normal">— optional</span>
          </div>
          <UploadZone
            label="Upload resume"
            icon={FileText}
            file={resumeFile}
            onFile={handleResumeFile}
            onClear={() => { setResumeFile(null); setResumeText(''); }}
            uploading={uploadingResume}
          />
        </div>

        {/* Cell 5 — Job Description Upload (6 cols) */}
        <div className="col-span-12 md:col-span-6 flex flex-col" style={cardStyle}>
          <div className="flex items-center gap-1.5 mb-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40]">
              Job Description
            </label>
            <span className="text-xs text-[#1A1A2E30] normal-case tracking-normal font-normal">— optional</span>
          </div>
          <UploadZone
            label="Upload job description"
            icon={Briefcase}
            file={jdFile}
            onFile={handleJDFile}
            onClear={() => { setJdFile(null); setJdText(''); }}
            uploading={uploadingJD}
          />
        </div>

        {/* Cell 6 — Disclaimer + CTA (full width) */}
        <div className="col-span-12 flex flex-col gap-2">
          <p className="text-xs text-[#1A1A2E40] text-center flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            This interview is AI-conducted. Scores and feedback are for practice only — AI can make mistakes. Please double-check responses.
          </p>
          <button
            onClick={handleStart}
            disabled={isDisabled}
            className={`w-full rounded-xl py-3.5 font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity ${isDisabled ? 'cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
            style={{
              background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)',
              opacity: isDisabled ? 0.4 : 1,
              boxShadow: isDisabled ? 'none' : '0 4px 20px rgba(91, 108, 249, 0.3)',
            }}
          >
            {starting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Creating session…</>
              : <><Play className="w-4 h-4" />Start Interview<ArrowRight className="w-4 h-4 ml-1" /></>}
          </button>
        </div>

      </div>
    </div>
  );
}

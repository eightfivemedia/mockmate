'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Header } from '@/components/landing/header';
import {
  ArrowRight,
  Check,
  Brain,
  MessageSquare,
  BarChart3,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

// ─── Mockup card with sequential animation ────────────────────────────────────
function MockupCard() {
  const [questionVisible, setQuestionVisible] = useState(false);
  const [responseVisible, setResponseVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [annotation1Visible, setAnnotation1Visible] = useState(false);
  const [annotation2Visible, setAnnotation2Visible] = useState(false);
  const [idling, setIdling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(() => { if (!cancelled) fn(); }, ms);
      timers.push(id);
    };

    // Phase 1: question appears at 600ms
    t(() => setQuestionVisible(true), 600);
    // Phase 2: response 400ms after question (1000ms total)
    t(() => setResponseVisible(true), 1000);
    // Phase 3: feedback panel 600ms after response (1600ms total)
    t(() => setFeedbackVisible(true), 1600);
    // Phase 4: score counter starts immediately after feedback (1600ms total)
    t(() => {
      const duration = 800;
      const start = performance.now();
      const target = 84;
      const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = Math.min((now - start) / duration, 1);
        setScore(Math.round(ease(elapsed) * target));
        if (elapsed < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 1600);
    // Phase 5: annotation 1 at 300ms after score finishes (2700ms total)
    t(() => setAnnotation1Visible(true), 2700);
    // Phase 6: annotation 2 at 200ms after annotation 1 (2900ms total)
    t(() => setAnnotation2Visible(true), 2900);
    // Phase 7: start idle float after all animations done
    t(() => setIdling(true), 3200);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={idling ? { opacity: 1, y: [0, -6, 0] } : { opacity: 1, y: 0 }}
      transition={
        idling
          ? { y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.8, delay: 0.4 } }
          : { duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }
      }
      className="relative z-[3] rotate-1 hidden lg:block"
    >
      <div className="rounded-2xl bg-slate-800/90 border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-white/70">MockMate</span>
          </div>
          <span className="text-xs text-white/30">Senior Frontend Engineer</span>
        </div>
        {/* Chat area */}
        <div className="p-4 space-y-4 bg-slate-800/50 min-h-[140px]">
          {/* MockMate message */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={questionVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-slate-700/80 px-4 py-3 max-w-[85%]">
              <p className="text-xs text-white/80 leading-relaxed">You mentioned leading a design system migration. Walk me through how you handled cross-team adoption.</p>
            </div>
          </motion.div>
          {/* Candidate reply */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={responseVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-end"
          >
            <div className="rounded-2xl rounded-tr-none bg-blue-600/90 px-4 py-3 max-w-[80%]">
              <p className="text-xs text-white/90 leading-relaxed">Sure — we had 12 product teams. The biggest challenge was buy-in without a mandate, so I started with the two teams already feeling the pain...</p>
            </div>
          </motion.div>
        </div>
        {/* Feedback panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={feedbackVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="px-4 py-3 border-t border-white/5 bg-slate-900/40 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">Answer score</span>
            <span className="text-sm font-bold text-blue-400">{score} / 100</span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={annotation1Visible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-2"
          >
            <span className="text-green-400 text-xs mt-0.5">↑</span>
            <span className="text-xs text-white/50 leading-relaxed">Strong use of specific context and team scale</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={annotation2Visible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-2"
          >
            <span className="text-amber-400 text-xs mt-0.5">→</span>
            <span className="text-xs text-white/50 leading-relaxed">Quantify the adoption outcome for more impact</span>
          </motion.div>
        </motion.div>
        {/* Fake input bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-white/5 bg-slate-900/60">
          <span className="flex-1 text-xs text-white/20 bg-transparent outline-none">Continue your answer...</span>
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Spring config ────────────────────────────────────────────────────────────
const spring = { type: 'spring', stiffness: 100, damping: 20 } as const;

// ─── Magnetic button ─────────────────────────────────────────────────────────
function MagneticButton({
  children,
  className = '',
  ...props
}: React.ComponentProps<typeof Button>) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
    >
      <Button className={className} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}



// ─── Typewriter ───────────────────────────────────────────────────────────────
const ROLES = ['Engineers', 'Product Managers', 'Designers', 'Data Scientists', 'Analysts'];
function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = ROLES[idx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((idx + 1) % ROLES.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
      {displayed}
      <span className="animate-pulse text-blue-400">|</span>
    </span>
  );
}

// ─── Section transition variants ─────────────────────────────────────────────
const transitionEase = [0.76, 0, 0.24, 1] as const;
const transitionDuration = 0.7;

const sectionVariants = {
  enter: () => ({ opacity: 0, scale: 1.05 }),
  center: { opacity: 1, scale: 1, transition: { duration: transitionDuration, ease: transitionEase } },
  exit: () => ({ opacity: 0, scale: 0.95, transition: { duration: transitionDuration, ease: transitionEase } }),
};

const SECTION_IDS = ['hero', 'features', 'how-it-works', 'pricing', 'faq', 'cta'];

const PRICING = {
  jobSeeker: { monthly: 19, yearly: 16, yearlyTotal: 192, yearlySavings: 36 },
  student:   { monthly: 11, yearly: 9,  yearlyTotal: 108, yearlySavings: 24 },
};
const DARK_SECTIONS = [0, 5]; // hero (slate-900) and cta (slate-800)

// Module-level transition lock — never stale, never wrapped in React
let isTransitioning = false;

// ─── Main landing page ────────────────────────────────────────────────────────
export function LandingPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctaVideoRef = useRef<HTMLVideoElement>(null);
  const currentRef = useRef(0);
  const touchStartY = useRef(0);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Lock body scroll — desktop only
  useEffect(() => {
    if (isMobile) return;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobile]);

  const goTo = useCallback((next: number) => {
    if (isTransitioning) return;
    if (next < 0 || next >= SECTION_IDS.length) return;
    if (next === currentRef.current) return;
    isTransitioning = true;
    const prev = currentRef.current;
    currentRef.current = next;
    setDirection(next > prev ? 1 : -1);
    setCurrent(next);
    setTimeout(() => { isTransitioning = false; }, 800);
  }, []);

  // Wheel — accumulate delta so trackpad momentum scrolls don't skip sections
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let accumulated = 0;
    let resetTimer: ReturnType<typeof setTimeout>;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Reset accumulator if scroll pauses (momentum tail-off)
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { accumulated = 0; }, 200);
      if (isTransitioning) return;
      accumulated += e.deltaY;
      if (Math.abs(accumulated) < 60) return;
      const dir = accumulated > 0 ? 1 : -1;
      accumulated = 0;
      goTo(currentRef.current + dir);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(resetTimer);
    };
  }, [goTo]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') goTo(currentRef.current + 1);
      if (e.key === 'ArrowUp' || e.key === 'PageUp') goTo(currentRef.current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo]);

  // Touch swipe — desktop only (mobile uses native scroll)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (isMobile) return;
    touchStartY.current = e.touches[0].clientY;
  }, [isMobile]);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isMobile) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 50) delta > 0 ? goTo(currentRef.current + 1) : goTo(currentRef.current - 1);
  }, [isMobile, goTo]);

  const sections = [
    // 0 — Hero
    <div key="hero" id="hero" className="min-h-screen relative flex items-center overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-[1] opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: '72px 72px' }} />
      <div className="relative z-[3] container max-w-6xl mx-auto px-6 pt-24 pb-12 md:pt-20 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div className="relative z-[3] min-w-0 overflow-hidden text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-white/50 tracking-widest font-medium uppercase">Interview Coach</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-5xl font-bold text-white leading-[1.05] tracking-tight mb-6 max-w-full break-words">
              Practice smarter.<br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Interview </span>
              <Typewriter />
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-base md:text-lg text-white/65 leading-relaxed mb-10 max-w-[48ch] mx-auto lg:mx-0">
              MockMate reads your resume, knows the role, and runs a realistic mock interview. You get scored feedback on every answer — not generic tips.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-10">
              <Link href="/auth/signup">
                <MagneticButton className="h-12 px-8 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-sm group shadow-[0_0_32px_rgba(59,130,246,0.5)]">
                  Start for free <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </MagneticButton>
              </Link>
              <Link href="/auth/login">
                <MagneticButton variant="ghost" className="h-12 px-6 text-white font-medium rounded-xl text-sm border border-white/25 hover:border-white/40 hover:bg-white/10 hover:text-white backdrop-blur-sm">
                  Sign in
                </MagneticButton>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.55 }}
              className="flex flex-wrap justify-center lg:justify-start gap-5 text-xs text-white/45">
              {['Free to start', 'No credit card', 'Any role or level'].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-400/70" />{t}</span>
              ))}
            </motion.div>

            {/* Mini mockup — mobile only */}
            <div className="mt-8 w-full rounded-2xl bg-slate-800/90 border border-white/10 overflow-hidden lg:hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-white/70">AI Interviewer</span>
                </div>
                <span className="text-xs text-white/30">Senior Frontend Engineer</span>
              </div>
              <div className="p-3 space-y-3 bg-slate-800/50">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="rounded-xl rounded-tl-none bg-slate-700/80 px-3 py-2">
                    <p className="text-xs text-white/80 leading-relaxed">Walk me through how you handled cross-team adoption.</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="rounded-xl rounded-tr-none bg-blue-600/90 px-3 py-2 max-w-[85%]">
                    <p className="text-xs text-white/90 leading-relaxed">We started with the two teams already feeling the pain...</p>
                  </div>
                </div>
              </div>
              <div className="px-3 py-2.5 border-t border-white/5 bg-slate-900/40 flex items-center justify-between">
                <span className="text-xs text-white/40">Answer score</span>
                <span className="text-sm font-bold text-blue-400">84 / 100</span>
              </div>
            </div>
          </div>

          {/* Right column — animated mockup */}
          <MockupCard />
        </div>
      </div>
    </div>,

    // 1 — Features
    <div key="features" id="features" className="min-h-screen flex flex-col px-6 bg-white text-gray-900" style={{ paddingTop: '64px' }}>
      <div className="container max-w-5xl mx-auto flex flex-col justify-center flex-1 pb-8 md:pb-16">
        <p className="text-xs font-semibold text-blue-600 mb-4 tracking-widest uppercase">Features</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">Built for candidates who take prep seriously</h2>
        <div className="grid grid-cols-1 gap-4 mt-4">
          {/* Wide feature card */}
          <div className="rounded-2xl p-6 border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4 text-blue-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900">Resume-aware questions</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-[60ch]">Upload your resume and job description. MockMate generates questions that reference your actual experience — not a generic question bank.</p>
            <div className="rounded-xl bg-white border border-gray-100 p-4 grid sm:grid-cols-3 gap-3">
              {['You mentioned leading a migration to microservices at your last role...', 'Walk me through the tradeoff you made at Acme when the deadline moved...', 'Given this role focuses on ML infra, how does your experience with...'].map((q, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-blue-600">{i + 1}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Three cards below */}
          <div className="grid md:grid-cols-3 gap-4">
            {[{ icon: MessageSquare, color: 'violet' as const, title: 'Two interview modes', desc: 'Chat mode for back-and-forth conversation. Q&A mode to drill individual answers at your pace.' },
              { icon: BarChart3, color: 'green' as const, title: 'Scored feedback', desc: 'Every answer annotated. See exactly what landed and what fell flat, with a numeric score.' },
              { icon: Clock, color: 'purple' as const, title: 'Track progress', desc: 'Session history with scores so you can see real, measurable improvement.' },
            ].map(({ icon: Icon, color, title, desc }) => {
              const colorMap = { violet: { bg: 'bg-violet-100', icon: 'text-violet-600' }, green: { bg: 'bg-green-100', icon: 'text-green-600' }, purple: { bg: 'bg-purple-100', icon: 'text-purple-600' } };
              return (
                <div key={title} className="rounded-2xl p-5 border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-xl ${colorMap[color].bg} flex items-center justify-center flex-shrink-0`}><Icon className={`w-4 h-4 ${colorMap[color].icon}`} /></div>
                    <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,

    // 2 — How It Works
    <div key="how-it-works" id="how-it-works" className="min-h-screen flex flex-col px-6 bg-gray-50 text-gray-900" style={{ paddingTop: '64px' }}>
      <div className="container max-w-5xl mx-auto flex flex-col justify-center flex-1 pb-8 md:pb-16">
        <p className="text-xs font-semibold text-blue-600 mb-4 tracking-widest uppercase">How It Works</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">From resume to feedback in minutes</h2>
        <div className="flex flex-col gap-5 mt-4">
          {[
            { n: '01', title: 'Upload your resume and job description', desc: 'MockMate reads both and builds a question set tailored to your exact experience and the role\'s requirements.' },
            { n: '02', title: 'Run a realistic mock interview', desc: 'Choose chat mode for a natural back-and-forth or Q&A mode to drill answers one at a time. MockMate follows up, probes, and challenges you like a real interviewer.' },
            { n: '03', title: 'Review your scored feedback', desc: 'Every answer gets a numeric score and line-by-line annotations. You see exactly what worked, what fell flat, and what to improve before the real thing.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
                {parseInt(n)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,

    // 3 — Pricing
    <div key="pricing" id="pricing" className="min-h-screen flex flex-col px-6 bg-white text-gray-900" style={{ paddingTop: '64px' }}>
      <div className="container max-w-5xl mx-auto flex flex-col justify-center flex-1 pb-8 md:pb-16">
        <p className="text-xs font-semibold text-blue-600 mb-4 tracking-widest uppercase">Pricing</p>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Simple pricing</h2>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">2 months free</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 flex flex-col">
            <h3 className="font-semibold text-gray-900 mb-1">Free</h3>
            <p className="text-sm text-gray-500 mb-6">Try it before you commit</p>
            <div className="text-4xl font-bold text-gray-900 mb-8">Free</div>
            <div className="space-y-3 flex-1">{['5 mock sessions', 'Chat and Q&A modes', 'Scored feedback per answer'].map(f => (
              <div key={f} className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-300 flex-shrink-0" /><span className="text-sm text-gray-600">{f}</span></div>
            ))}</div>
            <Link href="/auth/signup" className="block mt-8"><Button variant="outline" className="w-full rounded-xl border-gray-200 h-11">Get started</Button></Link>
          </div>

          {/* Job Seeker */}
          <div className="rounded-2xl bg-blue-600 p-8 relative shadow-[0_0_0_1px_rgba(96,165,250,0.25),0_32px_64px_rgba(37,99,235,0.35)] flex flex-col">
            <div className="absolute -top-4 left-4 flex items-center gap-2">
              <Badge className="bg-white border border-blue-400 text-blue-600 text-sm font-bold px-4 py-1 pointer-events-none">Most popular</Badge>
              {billingCycle === 'yearly' && <span className="bg-green-400 text-green-900 text-xs font-bold px-2.5 py-1 rounded-full">Save $36</span>}
            </div>
            <h3 className="font-semibold text-white mb-1">Job Seeker</h3>
            <p className="text-sm text-blue-200/70 mb-4">For active job seekers</p>
            <div className="text-4xl font-bold text-white">
              ${billingCycle === 'monthly' ? PRICING.jobSeeker.monthly : PRICING.jobSeeker.yearly}
              <span className="text-lg font-normal text-blue-200/70 ml-1">/mo</span>
            </div>
            {billingCycle === 'yearly' && <p className="text-xs text-blue-200/60 mt-1 mb-4">Billed ${PRICING.jobSeeker.yearlyTotal}/yr</p>}
            {billingCycle === 'monthly' && <div className="mb-4" />}
            <div className="space-y-3 flex-1">{['Unlimited sessions', 'Resume and JD upload', 'Role-specific questions', 'Progress tracking', 'Session history', 'All interview types'].map(f => (
              <div key={f} className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-200 flex-shrink-0" /><span className="text-sm text-blue-50">{f}</span></div>
            ))}</div>
            <Link href={`/auth/signup?plan=pro&interval=${billingCycle}`} className="block mt-8"><Button className="w-full rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-semibold h-11">Get started</Button></Link>
          </div>

          {/* Student */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 flex flex-col relative">
            {billingCycle === 'yearly' && (
              <div className="absolute -top-4 right-4"><span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Save $24</span></div>
            )}
            <h3 className="font-semibold text-gray-900 mb-1">Student</h3>
            <p className="text-sm text-gray-500 mb-4">For students and new grads</p>
            <div className="text-4xl font-bold text-gray-900">
              ${billingCycle === 'monthly' ? PRICING.student.monthly : PRICING.student.yearly}
              <span className="text-lg font-normal text-gray-400 ml-1">/mo</span>
            </div>
            {billingCycle === 'yearly' && <p className="text-xs text-gray-400 mt-1 mb-1">Billed ${PRICING.student.yearlyTotal}/yr</p>}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mt-1 mb-6 w-fit">Must use .edu email</span>
            <div className="space-y-3 flex-1">{['20 sessions per month', 'Resume upload', 'Core feedback and scoring', 'Entry-level role focus'].map(f => (
              <div key={f} className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-300 flex-shrink-0" /><span className="text-sm text-gray-600">{f}</span></div>
            ))}</div>
            <Link href={`/auth/signup?plan=student&interval=${billingCycle}`} className="block mt-8"><Button variant="outline" className="w-full rounded-xl border-gray-200 h-11">Get started</Button></Link>
          </div>
        </div>
      </div>
    </div>,

    // 4 — FAQ
    <div key="faq" id="faq" className="min-h-screen flex flex-col px-6 bg-gray-50 text-gray-900" style={{ paddingTop: '64px' }}>
      <div className="container max-w-3xl mx-auto flex flex-col justify-center flex-1 pb-8 md:pb-16">
        <p className="text-xs font-semibold text-blue-600 mb-4 tracking-widest uppercase">FAQ</p>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-12">Questions</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {[
            { q: 'How is this different from practicing with ChatGPT?', a: "MockMate reads your actual resume and job description, so every question is grounded in your specific experience. It maintains full session context — following up on your previous answers exactly as a real interviewer would." },
            { q: 'What roles does it support?', a: 'Any role you can type in. Engineering, product management, design, data science, marketing, operations, sales, and more.' },
            { q: 'How does scoring work?', a: 'Each answer is evaluated on clarity, specificity, structure (STAR method where relevant), and relevance. You get a numeric score and annotated feedback.' },
            { q: 'Can I upload my actual resume?', a: 'Yes — PDF, DOCX, or TXT. MockMate extracts the content and generates questions that reference real things from your experience.' },
            { q: 'Is there a free tier?', a: 'Yes. Five full sessions, no credit card required. Enough to know whether it helps you before committing.' },
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-gray-200 bg-white rounded-xl px-4 data-[state=open]:shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline font-medium text-gray-900 py-4 text-sm">{item.q}</AccordionTrigger>
              <AccordionContent className="text-gray-500 leading-relaxed pb-4 text-sm">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>,

    // 5 — CTA
    <div
      key="cta"
      id="cta"
      className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-slate-900 py-20"
      onMouseEnter={() => ctaVideoRef.current?.play()}
      onMouseLeave={() => ctaVideoRef.current?.pause()}
    >
      <video ref={ctaVideoRef} muted playsInline preload="auto" loop
        className="absolute inset-0 w-full h-full object-cover opacity-20" src="/hero-video.mp4" />
      <div className="absolute inset-0" style={{ background: 'rgba(10,17,35,0.75)' }} />
      <div className="relative z-[1] container max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.02] tracking-tight mb-6">
          Your next <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">interview</span> starts here.
        </h2>
        <p className="text-white/60 mb-10 text-base">Free to start. No credit card. Cancel anytime.</p>
        <Link href="/auth/signup">
          <MagneticButton className="h-12 px-10 bg-gradient-to-r from-blue-400 to-violet-400 text-white hover:opacity-90 font-semibold rounded-xl text-base group shadow-[0_0_32px_rgba(139,92,246,0.4)]">
            Get started for free <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </MagneticButton>
        </Link>
      </div>
    </div>,
  ];

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#0a1123' }}>
        <Header activeSection="hero" goTo={goTo} />

        {/* ── HERO ── */}
        <section className="flex flex-col px-5 pb-10" style={{ paddingTop: '96px', background: '#0a1123' }}>
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 font-medium mb-5">
              <Brain className="w-3 h-3 text-blue-400" /> INTERVIEW COACH
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
              Practice smarter.<br />
              Interview <Typewriter />
            </h1>
            <p className="text-sm text-white/60 mb-7 max-w-xs leading-relaxed">
              MockMate reads your resume, knows the role, and runs a realistic mock interview. You get scored feedback on every answer — not generic tips.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs mb-6">
              <Link href="/auth/signup" className="w-full">
                <Button className="w-full h-12 rounded-xl font-semibold text-base bg-gradient-to-r from-blue-500 to-violet-500 text-white border-0">
                  Start for free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl border-white/20 text-white bg-transparent hover:bg-white/5">
                  Sign in
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/40 mb-8">
              <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Free to start</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3" /> No credit card</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Any role</span>
            </div>
            {/* Mini mockup card */}
            <div className="w-full max-w-xs rounded-2xl bg-slate-800/90 border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-white/70">AI Interviewer</span>
                </div>
                <span className="text-xs text-white/30">Senior Frontend Engineer</span>
              </div>
              <div className="p-3 space-y-3 bg-slate-800/50">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="rounded-xl rounded-tl-none bg-slate-700/80 px-3 py-2">
                    <p className="text-xs text-white/80 leading-relaxed">Walk me through how you handled cross-team adoption.</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="rounded-xl rounded-tr-none bg-blue-600/90 px-3 py-2 max-w-[85%]">
                    <p className="text-xs text-white/90 leading-relaxed">We started with the two teams already feeling the pain...</p>
                  </div>
                </div>
              </div>
              <div className="px-3 py-2.5 border-t border-white/5 bg-slate-900/40 flex items-center justify-between">
                <span className="text-xs text-white/40">Answer score</span>
                <span className="text-sm font-bold text-blue-400">84 / 100</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="flex flex-col px-5 py-12 bg-white">
          <p className="text-xs font-semibold text-blue-600 mb-3 tracking-widest uppercase">Features</p>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-6">Built for candidates who take prep seriously</h2>
          <div className="flex flex-col gap-3">
            {/* Main card */}
            <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Resume-aware questions</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">Upload your resume and job description. MockMate generates questions that reference your actual experience — not a generic question bank.</p>
            </div>
            {/* Three smaller cards */}
            {[
              { icon: MessageSquare, title: 'Two interview modes', desc: 'Chat mode for conversation. Q&A mode to drill answers at your pace.', color: 'text-violet-600', bg: 'bg-violet-100' },
              { icon: BarChart3, title: 'Scored feedback', desc: 'Every answer annotated with a numeric score and line-by-line notes.', color: 'text-green-600', bg: 'bg-green-100' },
              { icon: Clock, title: 'Track progress', desc: 'Session history with scores so you can see real improvement over time.', color: 'text-purple-600', bg: 'bg-purple-100' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-xl p-4 border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="flex flex-col px-5 py-12 bg-gray-50">
          <p className="text-xs font-semibold text-blue-600 mb-3 tracking-widest uppercase">How It Works</p>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-7">From resume to feedback in minutes</h2>
          <div className="flex flex-col gap-6">
            {[
              { n: '01', title: 'Upload your resume and job description', desc: 'MockMate reads both and builds a question set tailored to your exact experience and the role\'s requirements.' },
              { n: '02', title: 'Run a realistic mock interview', desc: 'Choose chat mode for a natural back-and-forth or Q&A mode to drill answers one at a time. MockMate follows up like a real interviewer.' },
              { n: '03', title: 'Review your scored feedback', desc: 'Every answer gets a numeric score and line-by-line annotations. See exactly what worked and what to improve.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
                  {parseInt(n)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="flex flex-col px-5 py-12 bg-white">
          <p className="text-xs font-semibold text-blue-600 mb-3 tracking-widest uppercase">Pricing</p>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-5">Simple pricing</h2>
          {/* Billing toggle */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
              >Monthly</button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
              >
                Yearly
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">2 months free</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-1">Free</h3>
              <p className="text-sm text-gray-500 mb-4">Try it before you commit</p>
              <div className="text-3xl font-bold text-gray-900 mb-4">Free</div>
              <div className="flex flex-col gap-2 mb-6">
                {['5 mock sessions', 'Chat and Q&A modes', 'Scored feedback per answer'].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full rounded-xl border-gray-200 h-11">Get started</Button>
              </Link>
            </div>
            {/* Job Seeker */}
            <div className="rounded-2xl bg-blue-600 p-5 relative flex flex-col" style={{ boxShadow: '0 0 0 1px rgba(96,165,250,0.25), 0 24px 48px rgba(37,99,235,0.35)' }}>
              <div className="absolute -top-3.5 left-4">
                <Badge className="bg-white border border-blue-400 text-blue-600 text-xs font-bold px-3 py-1 pointer-events-none">Most popular</Badge>
              </div>
              <h3 className="font-semibold text-white mb-1">Job Seeker</h3>
              <p className="text-sm text-blue-200/70 mb-3">For active job seekers</p>
              <div className="text-3xl font-bold text-white mb-1">
                ${billingCycle === 'monthly' ? PRICING.jobSeeker.monthly : PRICING.jobSeeker.yearly}
                <span className="text-base font-normal text-blue-200/70 ml-1">/mo</span>
              </div>
              {billingCycle === 'yearly' && <p className="text-xs text-blue-200/60 mb-3">Billed ${PRICING.jobSeeker.yearlyTotal}/yr · Save ${PRICING.jobSeeker.yearlySavings}</p>}
              <div className="flex flex-col gap-2 mb-6 mt-3">
                {['Unlimited sessions', 'Resume and JD upload', 'Role-specific questions', 'Progress tracking', 'Session history', 'All interview types'].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-blue-200 flex-shrink-0" />
                    <span className="text-sm text-blue-50">{f}</span>
                  </div>
                ))}
              </div>
              <Link href={`/auth/signup?plan=pro&interval=${billingCycle}`}>
                <Button className="w-full rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-semibold h-11">Get started</Button>
              </Link>
            </div>
            {/* Student */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 flex flex-col relative">
              {billingCycle === 'yearly' && (
                <div className="absolute -top-3.5 right-4">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Save $24</span>
                </div>
              )}
              <h3 className="font-semibold text-gray-900 mb-1">Student</h3>
              <p className="text-sm text-gray-500 mb-3">For students and new grads</p>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${billingCycle === 'monthly' ? PRICING.student.monthly : PRICING.student.yearly}
                <span className="text-base font-normal text-gray-400 ml-1">/mo</span>
              </div>
              {billingCycle === 'yearly' && <p className="text-xs text-gray-400 mb-2">Billed ${PRICING.student.yearlyTotal}/yr</p>}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mt-1 mb-4 w-fit">Must use .edu email</span>
              <div className="flex flex-col gap-2 mb-6">
                {['20 sessions per month', 'Resume upload', 'Core feedback and scoring', 'Entry-level role focus'].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}
              </div>
              <Link href={`/auth/signup?plan=student&interval=${billingCycle}`}>
                <Button variant="outline" className="w-full rounded-xl border-gray-200 h-11">Get started</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="flex flex-col px-5 py-12 bg-gray-50">
          <p className="text-xs font-semibold text-blue-600 mb-3 tracking-widest uppercase">FAQ</p>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-6">Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: 'How is this different from practicing with ChatGPT?', a: "MockMate reads your actual resume and job description, so every question is grounded in your specific experience. It maintains full session context — following up on your previous answers exactly as a real interviewer would." },
              { q: 'What roles does it support?', a: 'Any role you can type in. Engineering, product management, design, data science, marketing, operations, sales, and more.' },
              { q: 'How does scoring work?', a: 'Each answer is evaluated on clarity, specificity, structure (STAR method where relevant), and relevance. You get a numeric score and annotated feedback.' },
              { q: 'Can I upload my actual resume?', a: 'Yes — PDF, DOCX, or TXT. MockMate extracts the content and generates questions that reference real things from your experience.' },
              { q: 'Is there a free tier?', a: 'Yes. Five full sessions, no credit card required. Enough to know whether it helps you before committing.' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-gray-200 bg-white rounded-xl px-4 data-[state=open]:shadow-sm">
                <AccordionTrigger className="text-left hover:no-underline font-medium text-gray-900 py-4 text-sm">{item.q}</AccordionTrigger>
                <AccordionContent className="text-gray-500 leading-relaxed pb-4 text-xs">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ── CTA + FOOTER — footer inside so video stretches through both ── */}
        <section
          className="relative flex flex-col items-center justify-center px-5 pt-16 pb-8 text-center overflow-hidden"
          style={{ background: '#0a1123' }}
        >
          <video
            ref={ctaVideoRef}
            muted
            playsInline
            preload="auto"
            loop
            autoPlay
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            src="/hero-video.mp4"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(10,17,35,0.75)' }} />
          <div className="relative z-10 w-full flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight mb-4">
              Your next{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">interview</span>{' '}
              starts here.
            </h2>
            <p className="text-sm text-white/60 mb-8">Free to start. No credit card. Cancel anytime.</p>
            <Link href="/auth/signup" className="w-full max-w-xs mb-16">
              <Button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-400 to-violet-400 text-white font-semibold text-base"
                style={{ boxShadow: '0 0 32px rgba(139,92,246,0.4)' }}
              >
                Get started for free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            {/* Footer inline so video covers it */}
            <div className="flex items-center justify-center gap-5 text-xs text-white/30">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
                  <Brain className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="font-semibold text-white/50">MockMate</span>
              </div>
              <span>·</span>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </section>

      </div>
    );
  }

  // ── Desktop layout (scroll-jacking) ───────────────────────────────────────
  return (
    <div ref={containerRef} className="h-screen overflow-hidden flex flex-col" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <Header activeSection={SECTION_IDS[current]} goTo={goTo} />

      {/* ── ANIMATED SECTION ──────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={sectionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {sections[current]}
          </motion.div>
        </AnimatePresence>

        {/* Dot nav — colors adapt to dark/light section background */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
          {SECTION_IDS.map((id, i) => {
            const onDark = DARK_SECTIONS.includes(current);
            const active = i === current;
            return (
              <button
                key={id}
                onClick={() => goTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  active
                    ? onDark ? 'bg-white scale-150' : 'bg-gray-800 scale-150'
                    : onDark ? 'bg-white/30 hover:bg-white/70' : 'bg-gray-400/50 hover:bg-gray-700'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      {(() => {
        const footerDark = DARK_SECTIONS.includes(current);
        const textBase = footerDark ? 'text-white/80' : 'text-gray-500';
        const textHover = footerDark ? 'hover:text-white' : 'hover:text-gray-900';
        return (
          <footer className="fixed bottom-0 left-0 w-full z-50 py-4 px-6 bg-transparent">
            <div className="container max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center"><Brain className="w-3 h-3 text-white" /></div>
                <span className={`font-bold text-sm ${textBase}`}>MockMate</span>
              </div>
              <div className={`flex gap-6 text-xs ${textBase}`}>
                {[
                  { label: 'Features', id: 'features' },
                  { label: 'How It Works', id: 'how-it-works' },
                  { label: 'Pricing', id: 'pricing' },
                  { label: 'FAQ', id: 'faq' },
                ].map(({ label, id }) => (
                  <button key={label} onClick={() => { const i = SECTION_IDS.indexOf(id); if (i >= 0) goTo(i); }} className={`transition-colors ${textHover}`}>{label}</button>
                ))}
                <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer" className={`transition-colors ${textHover}`}>Privacy</Link>
                <Link href="/legal/terms" target="_blank" rel="noopener noreferrer" className={`transition-colors ${textHover}`}>Terms</Link>
              </div>
              <p className={`text-xs ${textBase}`}>© {new Date().getFullYear()} MockMate</p>
            </div>
          </footer>
        );
      })()}
    </div>
  );
}

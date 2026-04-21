'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/landing/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ArrowRight, Check, Brain, MessageSquare, BarChart3, Clock,
} from 'lucide-react';
import Link from 'next/link';

const SECTION_IDS = ['hero', 'features', 'how-it-works', 'pricing', 'faq', 'cta'];
const DARK_SECTIONS = [0, 5];
const PRICING = {
  jobSeeker: { monthly: 19, yearly: 16, yearlyTotal: 192, yearlySavings: 36 },
  student:   { monthly: 11, yearly: 9,  yearlyTotal: 108, yearlySavings: 24 },
};

const sectionVariants = {
  enter: (dir: number) => ({
    y: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir: number) => ({
    y: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
};

// Module-level lock — never stale
let isTransitioning = false;

export function LandingPageMobileExperiment() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const containerRef = useRef<HTMLDivElement>(null);
  const ctaVideoRef = useRef<HTMLVideoElement>(null);
  const currentRef = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Prevent native scroll/pull-to-refresh interfering
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  const goTo = useCallback((next: number) => {
    if (isTransitioning) return;
    if (next < 0 || next >= SECTION_IDS.length) return;
    if (next === currentRef.current) return;
    isTransitioning = true;
    const prev = currentRef.current;
    currentRef.current = next;
    setDirection(next > prev ? 1 : -1);
    setCurrent(next);
    setTimeout(() => { isTransitioning = false; }, 700);
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isTransitioning) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const elapsed = Date.now() - touchStartTime.current;
    const velocity = Math.abs(deltaY) / elapsed;
    const SWIPE_THRESHOLD = 40;
    const VELOCITY_THRESHOLD = 0.3;

    if (Math.abs(deltaY) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      goTo(currentRef.current + (deltaY > 0 ? 1 : -1));
    }
  }, [goTo]);

  // ── Sections ────────────────────────────────────────────────────────────────
  const sections = [

    // 0 — Hero
    <div key="hero" className="flex flex-col items-center justify-center px-5 text-center overflow-hidden"
      style={{ height: '100dvh', background: '#0a1123', paddingTop: '64px' }}>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 font-medium mb-5">
        <Brain className="w-3 h-3 text-blue-400" /> INTERVIEW COACH
      </div>
      <h1 className="text-3xl font-bold text-white leading-tight tracking-tight mb-4">
        Practice smarter.<br />
        <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
          Interview better.
        </span>
      </h1>
      <p className="text-sm text-white/60 mb-6 max-w-xs leading-relaxed">
        MockMate reads your resume, knows the role, and runs a realistic mock interview with scored feedback on every answer.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs mb-5">
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
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Free to start</span>
        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> No credit card</span>
        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Any role</span>
      </div>
    </div>,

    // 1 — Features
    <div key="features" className="flex flex-col justify-center px-5 overflow-y-auto"
      style={{ height: '100dvh', background: '#0f172a', paddingTop: '64px', paddingBottom: '24px' }}>
      <p className="text-xs font-semibold text-blue-400 mb-2 tracking-widest uppercase">Features</p>
      <h2 className="text-2xl font-bold text-white leading-tight mb-4">Built for candidates who take prep seriously</h2>
      <div className="flex flex-col gap-3">
        <div className="rounded-xl p-4 border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-900/60 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Resume-aware questions</h3>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">MockMate generates questions that reference your actual experience — not a generic question bank.</p>
        </div>
        {[
          { icon: MessageSquare, title: 'Two interview modes', desc: 'Chat mode for conversation. Q&A mode to drill answers at your pace.', color: 'text-violet-400', bg: 'bg-violet-900/40' },
          { icon: BarChart3, title: 'Scored feedback', desc: 'Every answer gets a numeric score and line-by-line annotations.', color: 'text-green-400', bg: 'bg-green-900/40' },
          { icon: Clock, title: 'Track progress', desc: 'Session history with scores so you can see real improvement over time.', color: 'text-purple-400', bg: 'bg-purple-900/40' },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="rounded-xl p-4 border border-white/10 bg-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>,

    // 2 — How It Works
    <div key="how-it-works" className="flex flex-col justify-center px-5"
      style={{ height: '100dvh', background: '#f9fafb', paddingTop: '64px' }}>
      <p className="text-xs font-semibold text-blue-600 mb-2 tracking-widest uppercase">How It Works</p>
      <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-6">From resume to feedback in minutes</h2>
      <div className="flex flex-col gap-6">
        {[
          { n: '01', title: 'Upload your resume and job description', desc: 'MockMate reads both and builds a question set tailored to your exact experience.' },
          { n: '02', title: 'Run a realistic mock interview', desc: 'Chat mode for back-and-forth or Q&A mode to drill answers. MockMate follows up like a real interviewer.' },
          { n: '03', title: 'Review your scored feedback', desc: 'Every answer gets a numeric score and annotations. See exactly what to improve before the real thing.' },
        ].map(({ n, title, desc }) => (
          <div key={n} className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
              {parseInt(n)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // 3 — Pricing
    <div key="pricing" className="flex flex-col justify-center px-5 overflow-y-auto"
      style={{ height: '100dvh', background: '#ffffff', paddingTop: '64px', paddingBottom: '24px' }}>
      <p className="text-xs font-semibold text-blue-600 mb-2 tracking-widest uppercase">Pricing</p>
      <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-4">Simple pricing</h2>
      <div className="flex items-center justify-center mb-4">
        <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
            Monthly
          </button>
          <button onClick={() => setBillingCycle('yearly')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
            Yearly
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">2 months free</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-0.5">Free</h3>
          <p className="text-xs text-gray-500 mb-3">Try it before you commit</p>
          <div className="text-2xl font-bold text-gray-900 mb-3">Free</div>
          <div className="flex flex-col gap-1.5 mb-4">
            {['5 mock sessions', 'Chat and Q&A modes', 'Scored feedback per answer'].map(f => (
              <div key={f} className="flex items-center gap-2"><Check className="w-3 h-3 text-gray-300 flex-shrink-0" /><span className="text-xs text-gray-600">{f}</span></div>
            ))}
          </div>
          <Link href="/auth/signup"><Button variant="outline" className="w-full rounded-xl border-gray-200 h-10 text-sm">Get started</Button></Link>
        </div>
        <div className="rounded-2xl bg-blue-600 p-4 relative flex flex-col" style={{ boxShadow: '0 0 0 1px rgba(96,165,250,0.25),0 16px 40px rgba(37,99,235,0.35)' }}>
          <div className="absolute -top-3 left-3">
            <Badge className="bg-white border border-blue-400 text-blue-600 text-xs font-bold px-2.5 py-0.5 pointer-events-none">Most popular</Badge>
          </div>
          <h3 className="font-semibold text-white mb-0.5">Job Seeker</h3>
          <p className="text-xs text-blue-200/70 mb-2">For active job seekers</p>
          <div className="text-2xl font-bold text-white mb-1">
            ${billingCycle === 'monthly' ? PRICING.jobSeeker.monthly : PRICING.jobSeeker.yearly}
            <span className="text-sm font-normal text-blue-200/70 ml-1">/mo</span>
          </div>
          {billingCycle === 'yearly' && <p className="text-xs text-blue-200/60 mb-2">Billed ${PRICING.jobSeeker.yearlyTotal}/yr · Save ${PRICING.jobSeeker.yearlySavings}</p>}
          <div className="flex flex-col gap-1.5 mb-4 mt-2">
            {['Unlimited sessions', 'Resume and JD upload', 'Role-specific questions', 'Progress tracking', 'Session history', 'All interview types'].map(f => (
              <div key={f} className="flex items-center gap-2"><Check className="w-3 h-3 text-blue-200 flex-shrink-0" /><span className="text-xs text-blue-50">{f}</span></div>
            ))}
          </div>
          <Link href={`/auth/signup?plan=pro&interval=${billingCycle}`}><Button className="w-full rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-semibold h-10 text-sm">Get started</Button></Link>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex flex-col relative">
          {billingCycle === 'yearly' && <div className="absolute -top-3 right-3"><span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Save $24</span></div>}
          <h3 className="font-semibold text-gray-900 mb-0.5">Student</h3>
          <p className="text-xs text-gray-500 mb-2">For students and new grads</p>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${billingCycle === 'monthly' ? PRICING.student.monthly : PRICING.student.yearly}
            <span className="text-sm font-normal text-gray-400 ml-1">/mo</span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mt-1 mb-3 w-fit">Must use .edu email</span>
          <div className="flex flex-col gap-1.5 mb-4">
            {['20 sessions per month', 'Resume upload', 'Core feedback and scoring', 'Entry-level role focus'].map(f => (
              <div key={f} className="flex items-center gap-2"><Check className="w-3 h-3 text-gray-300 flex-shrink-0" /><span className="text-xs text-gray-600">{f}</span></div>
            ))}
          </div>
          <Link href={`/auth/signup?plan=student&interval=${billingCycle}`}><Button variant="outline" className="w-full rounded-xl border-gray-200 h-10 text-sm">Get started</Button></Link>
        </div>
      </div>
    </div>,

    // 4 — FAQ
    <div key="faq" className="flex flex-col justify-center px-5"
      style={{ height: '100dvh', background: '#f9fafb', paddingTop: '64px' }}>
      <p className="text-xs font-semibold text-blue-600 mb-2 tracking-widest uppercase">FAQ</p>
      <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-5">Questions</h2>
      <Accordion type="single" collapsible className="space-y-2">
        {[
          { q: 'How is this different from ChatGPT?', a: "MockMate reads your actual resume and job description, so every question is grounded in your specific experience." },
          { q: 'What roles does it support?', a: 'Any role you can type in. Engineering, product, design, data science, marketing, operations, sales, and more.' },
          { q: 'How does scoring work?', a: 'Each answer is evaluated on clarity, specificity, structure, and relevance. You get a numeric score and annotated feedback.' },
          { q: 'Can I upload my actual resume?', a: 'Yes — PDF, DOCX, or TXT. MockMate extracts the content and generates questions that reference real things from your experience.' },
          { q: 'Is there a free tier?', a: 'Yes. Five full sessions, no credit card required.' },
        ].map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border border-gray-200 bg-white rounded-xl px-4 data-[state=open]:shadow-sm">
            <AccordionTrigger className="text-left hover:no-underline font-medium text-gray-900 py-3.5 text-sm">{item.q}</AccordionTrigger>
            <AccordionContent className="text-gray-500 leading-relaxed pb-3.5 text-xs">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>,

    // 5 — CTA
    <div key="cta" className="relative flex flex-col items-center justify-center px-5 text-center overflow-hidden"
      style={{ height: '100dvh', background: '#0a1123' }}>
      <video ref={ctaVideoRef} muted playsInline preload="auto" loop autoPlay
        className="absolute inset-0 w-full h-full object-cover opacity-20" src="/hero-video.mp4" />
      <div className="absolute inset-0" style={{ background: 'rgba(10,17,35,0.75)' }} />
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white leading-tight tracking-tight mb-4">
          Your next{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">interview</span>{' '}
          starts here.
        </h2>
        <p className="text-sm text-white/60 mb-8">Free to start. No credit card. Cancel anytime.</p>
        <Link href="/auth/signup" className="w-full max-w-xs">
          <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-400 to-violet-400 text-white font-semibold"
            style={{ boxShadow: '0 0 32px rgba(139,92,246,0.4)' }}>
            Get started for free <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>,
  ];

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-hidden"
      style={{ height: '100dvh' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Header activeSection={SECTION_IDS[current]} goTo={goTo} />

      {/* Animated sections */}
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

        {/* Dot nav */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
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
                    : onDark ? 'bg-white/30' : 'bg-gray-400/50'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 px-5 border-t border-white/10 shrink-0" style={{ background: '#0a1123' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-xs text-white/70">MockMate</span>
          </div>
          <div className="flex gap-4 text-xs text-white/40">
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-xs text-white/30">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

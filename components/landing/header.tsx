'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brain, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  activeSection?: string;
  goTo?: (index: number) => void;
}

// label → section index (matches SECTION_IDS in landing-page.tsx)
const navItems = [
  { label: 'Home', index: 0, id: 'hero' },
  { label: 'Features', index: 1, id: 'features' },
  { label: 'How It Works', index: 2, id: 'how-it-works' },
  { label: 'Pricing', index: 3, id: 'pricing' },
  { label: 'FAQ', index: 4, id: 'faq' },
];

export function Header({ activeSection, goTo }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (index: number) => {
    goTo?.(index);
    setIsMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 pt-5"
    >
      <header className="w-full max-w-5xl rounded-2xl border border-white/10 bg-gray-950/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex h-14 items-center justify-between px-6">
          <button onClick={() => handleNav(0)} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">MockMate</span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, i) => (
              <motion.button
                key={item.id}
                onClick={() => handleNav(item.index)}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`text-sm transition-colors font-medium ${activeSection === item.id ? 'text-white' : 'text-white/50 hover:text-white'}`}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5 font-medium">Sign in</Button>
              </Link>
              <Link href="/auth/signup">
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button size="sm" className="bg-gradient-to-r from-blue-400 to-violet-400 text-white hover:opacity-90 font-semibold rounded-xl px-4 border-0">Get started</Button>
                </motion.div>
              </Link>
            </div>
            <Button variant="ghost" size="icon"
              className="md:hidden w-8 h-8 text-white/60 hover:text-white hover:bg-white/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isMenuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-white/5 overflow-hidden"
            >
              <nav className="py-4 px-6 space-y-1">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNav(item.index)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`block w-full text-left py-2.5 text-sm transition-colors font-medium ${activeSection === item.id ? 'text-white' : 'text-white/50 hover:text-white'}`}
                  >
                    {item.label}
                  </motion.button>
                ))}
                <div className="border-t border-white/5 my-3 pt-3 space-y-2">
                  <Link href="/auth/login" className="block">
                    <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5">Sign in</Button>
                  </Link>
                  <Link href="/auth/signup" className="block">
                    <Button className="w-full bg-gradient-to-r from-blue-400 to-violet-400 text-white hover:opacity-90 font-semibold rounded-xl border-0">Get started</Button>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </motion.div>
  );
}

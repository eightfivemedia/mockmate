'use client';

import { Button } from '@/components/ui/button';
import { Target, Moon, Sun, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export function Header({ isDark, toggleTheme }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="absolute top-6 left-0 right-0 flex justify-center px-4 z-[100]">
        <header className="w-full max-w-5xl bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex items-center space-x-3 ml-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">MockMate</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
              <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="btn-primary">Get Started</Button>
                </Link>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t bg-white/90 backdrop-blur-md rounded-b-2xl">
              <nav className="py-4 space-y-2 px-4">
                <a href="#features" className="block py-2 text-sm font-medium hover:text-primary transition-colors">Features</a>
                <a href="#testimonials" className="block py-2 text-sm font-medium hover:text-primary transition-colors">Testimonials</a>
                <a href="#pricing" className="block py-2 text-sm font-medium hover:text-primary transition-colors">Pricing</a>
                <a href="#faq" className="block py-2 text-sm font-medium hover:text-primary transition-colors">FAQ</a>
                <div className="border-t my-2" />
                <div className="flex flex-col space-y-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="w-full btn-primary">Get Started</Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </header>
      </div>
    </>
  );
}
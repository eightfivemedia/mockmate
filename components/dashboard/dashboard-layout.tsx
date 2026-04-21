'use client';

import { useEffect, useState } from 'react';
import {
  Home, Play, History, Settings as SettingsIcon, Target,
  LogOut, Menu, X, GraduationCap, FileText, Plus,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/sonner';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard',       href: '/dashboard',              icon: Home },
  { name: 'Start Interview', href: '/dashboard/interview',    icon: Play },
  { name: 'Resume Checker',  href: '/dashboard/resume',       icon: FileText },
  { name: 'Create Resume',   href: '/dashboard/create-resume',icon: Plus },
  { name: 'Past Sessions',   href: '/dashboard/sessions',     icon: History },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) window.location.href = '/auth/login';
  }, [user, loading]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F7' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex gap-1.5">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? 'U').toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F5F7' }}>

      {/* ─── Sidebar ─── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-[220px] flex flex-col
        bg-white border-r border-[#EEECF8]
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-[64px] shrink-0 border-b border-[#EEECF8]">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}
          >
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[#1A1A2E]">MockMate</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  active ? 'text-white' : 'text-[#4A4A6A] hover:bg-[#F5F5F7] hover:text-[#1A1A2E]'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' } : {}}
              >
                <item.icon className="w-4 h-4 shrink-0" style={{ color: active ? 'white' : '#8B8BAE' }} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 shrink-0 border-t border-[#EEECF8] pt-3 mt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F5F7] transition-colors text-left">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
                  {profile?.profile_image_url ? (
                    <Image src={profile.profile_image_url} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white">{initials}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A2E] truncate leading-tight">{profile?.name || user.email}</p>
                  <p className="text-xs leading-tight mt-0.5 capitalize" style={{ color: '#8B8BAE' }}>{profile?.plan ?? 'free'} plan</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="top">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{profile?.name || 'Account'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/onboarding" className="cursor-pointer">
                  <GraduationCap className="w-4 h-4 mr-2" /> Onboarding
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <SettingsIcon className="w-4 h-4 mr-2" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* ─── Main content ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-[64px] bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight">MockMate</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            {mobileOpen ? <X className="w-4 h-4 text-gray-500" /> : <Menu className="w-4 h-4 text-gray-500" />}
          </button>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#F5F5F7' }}>
          <div className="px-4 py-4 md:px-8 md:py-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}

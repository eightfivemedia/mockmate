'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Camera, Loader2, AlertCircle,
  Zap, BookOpen, MessageSquare, Star, ExternalLink, ChevronRight, KeyRound,
  ChevronDown, Check,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

const tabs = ['Profile', 'Plan & Billing', 'Notifications', 'Help & Support'] as const;
type Tab = typeof tabs[number];

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #EEECF8',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(99, 82, 199, 0.06)',
  padding: '24px',
};

const inputCls = 'w-full rounded-xl border border-[#EEECF8] bg-[#F8F7FC] px-4 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#1A1A2E30] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 transition-all';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-[#1A1A2E60] mb-1.5">{children}</label>;
}

type NotificationKey = 'sessionReminders' | 'weeklyReport' | 'productUpdates' | 'tipsResources';

const notificationItems: { key: NotificationKey; label: string; desc: string }[] = [
  { key: 'sessionReminders', label: 'Session reminders',     desc: 'Get reminded to practice regularly' },
  { key: 'weeklyReport',     label: 'Weekly progress report', desc: 'Summary of your interview performance' },
  { key: 'productUpdates',   label: 'Product updates',        desc: 'New features and improvements' },
  { key: 'tipsResources',    label: 'Tips & resources',       desc: 'Interview tips and career advice' },
];

export function Settings() {
  const { profile, loading, signOut } = useAuth();
  const error = null;
  const refreshProfile = () => {};
  const email = profile?.email ?? null;
  const name = profile?.name ?? null;
  const plan = (profile?.plan ?? null) as string | null;
  const sessionsUsedRaw = (profile as any)?.sessions_used_this_month ?? 0;
  const sessionLimitRaw = (profile as any)?.monthly_session_limit ?? 5;
  const credits = sessionLimitRaw >= 500 ? Infinity : Math.max(0, sessionLimitRaw - sessionsUsedRaw);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>('Profile');
  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);
  const tabDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(e.target as Node)) {
        setTabDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [isDeleting, setIsDeleting] = useState(false);

  // Upgrade state
  const [isUpgrading, setIsUpgrading] = useState<'pro' | 'student' | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = async (plan: 'pro' | 'student') => {
    setIsUpgrading(plan);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ plan, interval: billingInterval }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        toast({ title: 'Error', description: json.error ?? 'Failed to start checkout', variant: 'destructive' });
        setIsUpgrading(null);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to start checkout. Please try again.', variant: 'destructive' });
      setIsUpgrading(null);
    }
  };

  // Notification state
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    sessionReminders: false,
    weeklyReport:     false,
    productUpdates:   false,
    tipsResources:    false,
  });

  useEffect(() => {
    if (name) {
      const parts = name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if (profile?.profile_image_url) setAvatarUrl(profile.profile_image_url);
  }, [name, profile]);

  useEffect(() => {
    const saved = localStorage.getItem('notification_prefs');
    if (saved) {
      try { setNotifications(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const { error } = await supabase.from('users').update({ name: fullName }).eq('id', profile.id);
    setIsSaving(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to save. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
      refreshProfile();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return;
    if (file.size > 2 * 1024 * 1024) return;

    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const fileName = `${profile.id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, { upsert: false });

    if (uploadError) {
      toast({ title: 'Upload failed', description: 'Could not upload photo.', variant: 'destructive' });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(fileName);
      await supabase.from('users').update({ profile_image_url: publicUrl }).eq('id', profile.id);
      setAvatarUrl(publicUrl);
      refreshProfile();
      toast({ title: 'Photo updated', description: 'Your profile photo has been changed.' });
    }
    setUploadingAvatar(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: 'Password too short', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please make sure both fields match.', variant: 'destructive' });
      return;
    }
    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsChangingPassword(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      await supabase.auth.signOut();
      window.location.href = '/auth/login';
    } catch {
      toast({ title: 'Error', description: 'Failed to delete account. Please contact support.', variant: 'destructive' });
      setIsDeleting(false);
    }
  };

  const handleToggle = (key: NotificationKey) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('notification_prefs', JSON.stringify(updated));
    toast({ title: 'Preference saved' });
  };

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col pb-6">
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl animate-pulse h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col pb-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-3 text-red-500 rounded-2xl p-6"
            style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const sessionsUsed = sessionsUsedRaw;
  const sessionLimit = credits === Infinity ? null : sessionLimitRaw;
  const usagePercent = sessionLimit ? Math.min(100, (sessionsUsed / sessionLimit) * 100) : 0;
  const currentBillingInterval = (profile as any)?.billing_interval ?? 'monthly';
  const isEduEmail = email?.toLowerCase().endsWith('.edu') ?? false;
  const studentExpiresAt = (profile as any)?.student_tier_expires_at as string | null ?? null;
  const studentDaysLeft = studentExpiresAt
    ? Math.ceil((new Date(studentExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="flex flex-col pb-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Settings</h1>
          <p className="text-sm text-[#1A1A2E60] mt-1">Manage your account and preferences</p>
        </div>

        {/* Tab nav — dropdown on mobile, pills on desktop */}
        <div className="sm:hidden relative" ref={tabDropdownRef}>
          <button
            onClick={() => setTabDropdownOpen(!tabDropdownOpen)}
            className="w-full flex items-center justify-between rounded-xl border border-[#EEECF8] bg-white px-4 py-2.5 text-sm font-medium text-[#1A1A2E] focus:outline-none"
          >
            <span>{activeTab}</span>
            <ChevronDown className={`w-4 h-4 text-[#8B8BAE] transition-transform duration-200 ${tabDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {tabDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-[#EEECF8] bg-white shadow-lg overflow-hidden">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab as Tab); setTabDropdownOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left hover:bg-[#F8F7FC] transition-colors border-b border-[#EEECF8] last:border-0"
                >
                  <span className={activeTab === tab ? 'text-[#5B6CF9]' : 'text-[#4A4A6A]'}>{tab}</span>
                  {activeTab === tab && <Check className="w-4 h-4 text-[#5B6CF9] shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          className="hidden sm:flex items-center gap-1 p-1 rounded-xl w-full"
          style={{ background: 'white', border: '1px solid #EEECF8' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all text-center ${
                activeTab === tab ? 'text-white' : 'text-[#4A4A6A] hover:bg-[#F8F7FC]'
              }`}
              style={activeTab === tab ? { background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'Profile' && (
          <>
            {/* Profile info card */}
            <div style={cardStyle} className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40]">Profile Info</p>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}>
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-white">{initials}</span>
                    )}
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6]" />
                    </div>
                  )}
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2 text-sm font-medium text-[#1A1A2E] rounded-xl px-4 py-2 hover:bg-[#F8F7FC] transition-colors disabled:opacity-50"
                    style={{ border: '1px solid #EEECF8' }}
                  >
                    <Camera className="w-4 h-4 text-[#8B8BAE]" />
                    {uploadingAvatar ? 'Uploading…' : 'Change photo'}
                  </button>
                  <p className="text-xs text-[#1A1A2E40] mt-1.5">JPG, PNG or WebP · Max 2 MB</p>
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First name</Label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <Label>Last name</Label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label>Email</Label>
                <input
                  type="email"
                  value={email ?? ''}
                  disabled
                  className="w-full rounded-xl border border-[#EEECF8] bg-[#F8F7FC] px-4 py-2.5 text-sm text-[#1A1A2E40] cursor-not-allowed"
                />
                <p className="text-xs text-[#1A1A2E30] mt-1.5">Email cannot be changed here.</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', boxShadow: '0 4px 20px rgba(91, 108, 249, 0.25)' }}
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>

            {/* Password card */}
            <div style={cardStyle} className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5" /> Password
              </p>

              <div className="space-y-3">
                <div>
                  <Label>New password</Label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label>Confirm new password</Label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                  className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', boxShadow: '0 4px 20px rgba(91, 108, 249, 0.25)' }}
                >
                  {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isChangingPassword ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </div>

            {/* Danger Zone card */}
            <div style={{
              background: 'white',
              border: '1px solid #FEE2E2',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(239, 68, 68, 0.06)',
              padding: '24px',
            }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-4">Danger Zone</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">Delete account</p>
                  <p className="text-xs text-[#1A1A2E50] mt-0.5">
                    Permanently delete your account and all data. This cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  style={{ border: '1px solid #FEE2E2' }}
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── PLAN & BILLING TAB ── */}
        {activeTab === 'Plan & Billing' && (
          <>
            {/* Current plan card */}
            <div style={cardStyle}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-4">Current Plan</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}>
                  <Zap className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A1A2E]">{plan === 'pro' ? 'Job Seeker' : plan === 'student' ? 'Student' : 'Free'} Plan</p>
                  <p className="text-xs text-[#1A1A2E50]">
                    {credits === Infinity ? 'Unlimited sessions' : `${sessionLimit ?? 5} sessions / month`}
                  </p>
                </div>
              </div>
            </div>

            {/* Student verification status — shown only for student plan */}
            {plan === 'student' && studentExpiresAt && (
              <div style={{
                ...cardStyle,
                ...(studentDaysLeft !== null && studentDaysLeft <= 30
                  ? { border: '1px solid #FDE68A', background: '#FFFBEB', boxShadow: '0 2px 12px rgba(245, 158, 11, 0.06)' }
                  : {}),
              }}>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-3">Student Verification</p>
                {studentDaysLeft !== null && studentDaysLeft <= 30 ? (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-amber-700">Discount expires soon</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Expires {new Date(studentExpiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} — re-verify your .edu email to keep your rate.
                      </p>
                    </div>
                    <a
                      href="/auth/reverify-student"
                      className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' }}
                    >
                      Re-verify
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A2E]">Student discount active</p>
                      <p className="text-xs text-[#1A1A2E50] mt-0.5">
                        Valid until {new Date(studentExpiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <a href="/auth/reverify-student" className="text-xs font-medium text-[#8B5CF6] hover:underline">
                      Re-verify
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Usage card */}
            <div style={cardStyle}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-4">Usage this month</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#1A1A2E70]">Sessions used</span>
                  <span className="font-semibold text-[#1A1A2E]">
                    {sessionsUsed} / {credits === Infinity ? '∞' : (sessionLimit ?? 5)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: '#F0EEF8' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: credits === Infinity ? '100%' : `${usagePercent}%`,
                      background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)',
                    }}
                  />
                </div>
                {credits !== Infinity && (
                  <p className="text-xs text-[#1A1A2E40]">
                    {credits} session{credits !== 1 ? 's' : ''} remaining this month
                  </p>
                )}
              </div>
            </div>

            {/* Plan cards — always visible */}
            <div style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40]">Plans</p>
                  {/* Monthly / Yearly toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#F0EEF8' }}>
                    {(['monthly', 'yearly'] as const).map(i => (
                      <button
                        key={i}
                        onClick={() => setBillingInterval(i)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                        style={billingInterval === i
                          ? { background: 'white', color: '#1A1A2E', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                          : { color: '#1A1A2E60' }
                        }
                      >
                        {i === 'yearly' ? 'Yearly (save ~30%)' : 'Monthly'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Job Seeker plan */}
                  <div
                    className="rounded-xl p-4 flex flex-col"
                    style={{ border: plan === 'pro' ? '1.5px solid #5B6CF9' : '1.5px solid #EEECF8', background: plan === 'pro' ? '#FAFAFE' : 'white' }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1A1A2E]">Job Seeker</p>
                      <p className="text-2xl font-bold text-[#1A1A2E] mt-1">
                        {billingInterval === 'monthly' ? '$19' : '$16'}
                        <span className="text-sm font-normal text-[#1A1A2E50]">/mo</span>
                      </p>
                      {billingInterval === 'yearly' && (
                        <p className="text-xs text-[#1A1A2E40] mt-0.5">Billed at $192/yr</p>
                      )}
                      <ul className="mt-2 space-y-1">
                        {['500 sessions / month', 'All question types', 'Priority AI feedback', 'Session history'].map(f => (
                          <li key={f} className="text-xs text-[#1A1A2E70] flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#5B6CF9] shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4">{(() => {
                      const isCurrentPlan = plan === 'pro' && currentBillingInterval === billingInterval;
                      return (
                        <button
                          onClick={() => !isCurrentPlan && handleUpgrade('pro')}
                          disabled={isUpgrading === 'pro' || isCurrentPlan}
                          className="w-full py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:cursor-default"
                          style={{ background: 'linear-gradient(135deg, #5B6CF9, #8B5CF6)', border: '1.5px solid transparent' }}
                        >
                          {isUpgrading === 'pro' && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isCurrentPlan ? 'Your Plan' : isUpgrading === 'pro' ? 'Redirecting...' : plan === 'pro' ? `Switch to ${billingInterval === 'yearly' ? 'Yearly' : 'Monthly'}` : 'Upgrade to Job Seeker'}
                        </button>
                      );
                    })()}</div>
                  </div>

                  {/* Student plan */}
                  <div
                    className="rounded-xl p-4 flex flex-col"
                    style={{ border: plan === 'student' ? '1.5px solid #8B5CF6' : '1.5px solid #EEECF8', background: plan === 'student' ? '#FDFCFF' : 'white' }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1A1A2E]">Student</p>
                      <p className="text-2xl font-bold text-[#1A1A2E] mt-1">
                        {billingInterval === 'monthly' ? '$11' : '$9'}
                        <span className="text-sm font-normal text-[#1A1A2E50]">/mo</span>
                      </p>
                      {billingInterval === 'yearly' && (
                        <p className="text-xs text-[#1A1A2E40] mt-0.5">Billed at $108/yr</p>
                      )}
                      <ul className="mt-2 space-y-1">
                        {['20 sessions / month', 'All question types', 'AI feedback', 'Requires .edu email'].map(f => (
                          <li key={f} className="text-xs text-[#1A1A2E70] flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#8B5CF6] shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4">{(() => {
                      const isCurrentPlan = plan === 'student' && currentBillingInterval === billingInterval;
                      const blocked = !isEduEmail && plan !== 'student';
                      return (
                        <div className="flex flex-col gap-1.5">
                          {blocked && (
                            <p className="text-xs text-center text-[#1A1A2E40]">Requires a .edu email address</p>
                          )}
                          <button
                            onClick={() => !isCurrentPlan && !blocked && handleUpgrade('student')}
                            disabled={isUpgrading === 'student' || isCurrentPlan || blocked}
                            className="w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:cursor-default"
                            style={{
                              border: '1.5px solid #EEECF8',
                              background: isCurrentPlan ? 'linear-gradient(135deg, #5B6CF9, #8B5CF6)' : undefined,
                              color: isCurrentPlan ? 'white' : blocked ? '#1A1A2E30' : '#8B5CF6',
                            }}
                          >
                            {isUpgrading === 'student' && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isCurrentPlan ? 'Your Plan' : isUpgrading === 'student' ? 'Redirecting...' : plan === 'student' ? `Switch to ${billingInterval === 'yearly' ? 'Yearly' : 'Monthly'}` : 'Upgrade to Student'}
                          </button>
                        </div>
                      );
                    })()}</div>
                  </div>
                </div>
              </div>
          </>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'Notifications' && (
          <div style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-4">Notifications</p>
            <div className="space-y-1">
              {notificationItems.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3.5 border-b border-[#EEECF8] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">{label}</p>
                    <p className="text-xs text-[#1A1A2E40] mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={notifications[key]}
                    onCheckedChange={() => handleToggle(key)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HELP & SUPPORT TAB ── */}
        {activeTab === 'Help & Support' && (
          <div style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E40] mb-4">Help & Support</p>
            <div className="space-y-2">
              {[
                { icon: BookOpen,      label: 'Documentation',  desc: 'Learn how to use MockMate effectively', href: '#' },
                { icon: MessageSquare, label: 'Contact Support', desc: 'Get help from our team',               href: 'mailto:support@mockmate.io' },
                { icon: Star,          label: 'Leave a Review',  desc: 'Help others discover MockMate',        href: '#' },
                { icon: ExternalLink,  label: 'Changelog',       desc: "See what's new in MockMate",           href: '#' },
              ].map(({ icon: Icon, label, desc, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7FC] transition-colors cursor-pointer group"
                  style={{ border: '1px solid #EEECF8' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #EEF0FF, #F3EEFF)' }}
                    >
                      <Icon className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{label}</p>
                      <p className="text-xs text-[#1A1A2E40]">{desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#1A1A2E20] group-hover:text-[#8B5CF6] transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

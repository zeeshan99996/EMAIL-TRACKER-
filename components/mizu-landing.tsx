'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  User,
  Mail,
  Lock,
  ArrowRight,
  Search,
  Pencil,
  Smartphone,
  Laptop,
  Check,
  Star,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { WebsiteHeader, ChromeIcon, MailTrackerLogo } from './website-header';

export function GmailColoredIcon({ className = 'w-5 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 5.5V18.5C1.5 19.6 2.4 20.5 3.5 20.5H6.5V11L1.5 7.25V5.5Z" fill="#4285F4" />
      <path d="M22.5 5.5V18.5C22.5 19.6 21.6 20.5 20.5 20.5H17.5V11L22.5 7.25V5.5Z" fill="#34A853" />
      <path d="M17.5 11V5.5L12 9.5L6.5 5.5V11L12 15L17.5 11Z" fill="#EA4335" />
      <path d="M1.5 5.5C1.5 4.1 3.1 3.2 4.2 4.1L6.5 5.8V11L1.5 7.25V5.5Z" fill="#C5221F" />
      <path d="M22.5 5.5C22.5 4.1 20.9 3.2 19.8 4.1L17.5 5.8V11L22.5 7.25V5.5Z" fill="#FBBC04" />
    </svg>
  );
}

export default function MizuLanding() {
  const router = useRouter();
  const [getStartedModalOpen, setGetStartedModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // When a returning user visits the site, landing page DOES NOT open - directly open dashboard!
  useEffect(() => {
    try {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const isExplicitLandingView = params?.get('view') === 'landing' || params?.get('portal') === 'true';

      if (params?.get('action') === 'get-started') {
        setGetStartedModalOpen(true);
      }

      if (isExplicitLandingView) {
        setIsRedirecting(false);
        return;
      }

      const savedUser = localStorage.getItem('mailify_submitted_user');
      const hasCookie =
        document.cookie.includes('warmup_user_session') ||
        document.cookie.includes('mailify_has_submitted');

      if (savedUser || hasCookie) {
        setIsRedirecting(true);
        router.replace('/dashboard');
        return;
      }

      // Check active server session
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setIsRedirecting(true);
            localStorage.setItem('mailify_submitted_user', JSON.stringify(data.user));
            router.replace('/dashboard');
          }
        })
        .catch(() => {});
    } catch {}
  }, [router]);

  const handleGetStartedClick = () => {
    const alreadySubmitted =
      hasSubmittedBefore ||
      (typeof window !== 'undefined' && !!localStorage.getItem('mailify_submitted_user'));

    if (alreadySubmitted) {
      router.push('/dashboard');
      return;
    }

    setAuthError(null);
    setGetStartedModalOpen(true);
  };

  const handleGetStartedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email.trim() || !password.trim()) {
      setAuthError('Email and password are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'get_started',
          email: email.trim(),
          password: password.trim(),
          name: fullName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setAuthError(data.error || 'Authentication failed');
        setIsSubmitting(false);
        return;
      }

      try {
        localStorage.setItem(
          'mailify_submitted_user',
          JSON.stringify({
            id: data.user?.id,
            email: data.user?.email,
            name: data.user?.name,
            submittedAt: Date.now(),
          })
        );
        document.cookie = 'mailify_has_submitted=1; max-age=31536000; path=/; samesite=lax';
      } catch {}

      setHasSubmittedBefore(true);
      setGetStartedModalOpen(false);
      router.push('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // If returning user, do not render landing page - redirecting to dashboard
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <MailTrackerLogo />
          <div className="w-5 h-5 border-2 border-[#18506D]/30 border-t-[#18506D] rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#8AEDFF]/40 selection:text-[#18506D] flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* HEADER SECTION (CLEAN WHITE, MATCHING REFERENCE) */}
      {/* ========================================================================= */}
      <WebsiteHeader onGetStartedClick={handleGetStartedClick} />

      {/* ========================================================================= */}
      {/* MAIN HERO SECTION */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: HEADLINE, SUBHEADLINE, CTA BUTTON & TRUST BADGES */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start text-left pr-0 lg:pr-6">
            
            {/* Main Headline with #18506D & #8AEDFF gradient */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] xl:text-[66px] font-extrabold text-slate-900 tracking-tight leading-[1.12] sm:leading-[1.08]">
              The best{' '}
              <span className="bg-gradient-to-r from-[#18506D] via-[#0284c7] to-[#8AEDFF] bg-clip-text text-transparent font-extrabold">
                Email
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#18506D] via-[#0284c7] to-[#8AEDFF] bg-clip-text text-transparent font-extrabold">
                Tracker
              </span>{' '}
              for Gmail.
            </h1>

            {/* Subheadline */}
            <p className="mt-6 sm:mt-7 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              <strong className="font-semibold text-slate-900">
                Know exactly when your emails are opened.
              </strong>{' '}
              MailTracker is the most advanced email tracking tool for Gmail and Chrome in 2026.
            </p>

            {/* CTA Button with Chrome Icon */}
            <div className="mt-8 sm:mt-9 flex flex-col items-start gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleGetStartedClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:py-4 rounded-xl text-white font-semibold text-base sm:text-[17px] bg-[#18506D] hover:bg-[#133e54] shadow-lg shadow-[#18506D]/20 hover:shadow-xl hover:shadow-[#18506D]/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
              >
                <ChromeIcon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                <span>Install MailTracker for Chrome</span>
              </button>

              <span className="text-xs sm:text-[13px] text-slate-500 font-medium pl-1">
                Install our MailTracker Chrome extension for FREE
              </span>
            </div>

            {/* Trust & Compatibility Badges Row */}
            <div className="mt-10 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              
              {/* 1. Gmail Logo & Text */}
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <GmailColoredIcon className="w-6 h-5 object-contain" />
                <span className="font-bold text-slate-700 text-sm">Gmail</span>
              </div>

              {/* 2. Available in the Chrome Web Store Badge */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-slate-50 text-slate-700 text-xs shadow-sm">
                <ChromeIcon className="w-4 h-4 shrink-0" />
                <div className="flex flex-col text-[11px] leading-tight">
                  <span className="text-slate-500 text-[10px]">Available in the</span>
                  <span className="font-semibold text-slate-800">Chrome Web Store</span>
                </div>
              </div>

              {/* 3. GDPR Compliant Badge */}
              <div
                className="w-8 h-8 rounded-full bg-[#1e3a8a] flex items-center justify-center relative shadow-sm"
                title="GDPR Compliant"
              >
                <svg className="w-6 h-6 text-amber-300 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="3.5" r="0.65" />
                  <circle cx="16.2" cy="4.6" r="0.65" />
                  <circle cx="19.4" cy="7.8" r="0.65" />
                  <circle cx="20.5" cy="12" r="0.65" />
                  <circle cx="19.4" cy="16.2" r="0.65" />
                  <circle cx="16.2" cy="19.4" r="0.65" />
                  <circle cx="12" cy="20.5" r="0.65" />
                  <circle cx="7.8" cy="19.4" r="0.65" />
                  <circle cx="4.6" cy="16.2" r="0.65" />
                  <circle cx="3.5" cy="12" r="0.65" />
                  <circle cx="4.6" cy="7.8" r="0.65" />
                  <circle cx="7.8" cy="4.6" r="0.65" />
                </svg>
                <span className="absolute text-[7px] font-black text-white uppercase tracking-tighter">
                  GDPR
                </span>
              </div>

              {/* 4. Certified / Privacy Shield Badge */}
              <div
                className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-sm"
                title="Security & Privacy Certified"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>

            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: GMAIL INBOX WINDOW MOCKUP WITH ACTIVE TRACKING POPOVER */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-6 xl:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[540px] rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_60px_-15px_rgba(24,80,109,0.14)] overflow-hidden transition-all hover:shadow-[0_25px_70px_-15px_rgba(24,80,109,0.2)]">
              
              {/* Window Top Controls Bar */}
              <div className="bg-[#f3f4f6]/80 px-4 py-2.5 flex items-center gap-1.5 border-b border-slate-200/70">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              </div>

              {/* Gmail Mockup Inner Header */}
              <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
                {/* Gmail Logo */}
                <div className="flex items-center gap-2">
                  <GmailColoredIcon className="w-4 h-3.5 object-contain" />
                  <span className="text-xs font-semibold text-slate-700">Gmail</span>
                </div>

                {/* Search Bar Pill */}
                <div className="flex-1 max-w-[260px] bg-[#f1f5f9] rounded-lg px-3 py-1.5 flex items-center gap-2 text-slate-400">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="w-24 h-2 bg-slate-300/60 rounded-full" />
                </div>
              </div>

              {/* Gmail Mockup Body (Sidebar + Email Table) */}
              <div className="flex min-h-[310px] bg-white">
                
                {/* Left Mini Sidebar */}
                <div className="w-28 sm:w-32 border-r border-slate-100 p-3 space-y-3.5 shrink-0 bg-white">
                  {/* Compose Button */}
                  <div className="bg-[#c2e7ff] text-[#001d35] text-[11px] font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Pencil className="w-3 h-3 text-[#001d35]" />
                    <span>Compose</span>
                  </div>

                  {/* Nav Item Bars */}
                  <div className="space-y-2 pt-1">
                    <div className="h-2.5 bg-slate-200/90 rounded-full w-5/6" />
                    <div className="h-2.5 bg-slate-200/60 rounded-full w-4/6" />
                    <div className="h-2.5 bg-slate-200/60 rounded-full w-3/6" />
                    <div className="h-2.5 bg-slate-200/60 rounded-full w-4/6" />
                  </div>
                </div>

                {/* Main Email Inbox Rows */}
                <div className="flex-1 p-3 space-y-2.5 relative overflow-visible">
                  
                  {/* Row 1: Featured Tracked Email (Greg Svensson) */}
                  <div className="relative group">
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-slate-50/90 border border-slate-100 text-xs">
                      {/* Checkbox */}
                      <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white shrink-0" />
                      
                      {/* Star */}
                      <Star className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                      {/* Double Blue Checkmarks (Read Receipts) */}
                      <div className="flex items-center -space-x-1.5 text-[#0284c7] shrink-0 font-bold" title="Read receipt active">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>

                      {/* Sender */}
                      <span className="font-semibold text-slate-800 text-[11px] shrink-0">
                        Greg Svensson
                      </span>

                      {/* Subject Preview */}
                      <span className="text-slate-500 text-[11px] truncate">
                        Let's talk about our last call
                      </span>
                    </div>

                    {/* ========================================================================= */}
                    {/* SIGNATURE POPUP TOOLTIP (EMAIL OPENED 3 TIMES) */}
                    {/* ========================================================================= */}
                    <div className="absolute top-[34px] left-8 sm:left-10 z-30 w-56 sm:w-60 bg-[#1c222c] text-white rounded-xl p-3 shadow-2xl border border-slate-700/60">
                      {/* Tooltip Pointer Triangle */}
                      <div className="absolute -top-1.5 left-4 w-3 h-3 bg-[#1c222c] border-t border-l border-slate-700/60 rotate-45" />

                      {/* Header */}
                      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-700/70">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <span>Email opened 3 times</span>
                          <span className="text-amber-400 text-xs">✍️</span>
                        </div>
                      </div>

                      {/* Open Events Timeline */}
                      <div className="pt-2 space-y-1.5 text-[11px]">
                        {/* Event 1 */}
                        <div className="flex items-center justify-between text-slate-300">
                          <span>7 minutes ago</span>
                          <Smartphone className="w-3 h-3 text-slate-400" />
                        </div>

                        {/* Event 2 */}
                        <div className="flex items-center justify-between text-slate-300">
                          <span>2 hours ago</span>
                          <Laptop className="w-3 h-3 text-slate-400" />
                        </div>

                        {/* Event 3 */}
                        <div className="flex items-center justify-between text-slate-300">
                          <span>1 day ago</span>
                          <Laptop className="w-3 h-3 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Placeholder Email */}
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs opacity-80">
                    <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white shrink-0" />
                    <Star className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                    <div className="w-16 h-2 bg-slate-200/90 rounded-full" />
                    <div className="flex-1 h-2 bg-slate-200/60 rounded-full" />
                  </div>

                  {/* Row 3: Placeholder Email */}
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs opacity-70">
                    <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white shrink-0" />
                    <Star className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                    <div className="w-20 h-2 bg-slate-200/90 rounded-full" />
                    <div className="flex-1 h-2 bg-slate-200/60 rounded-full" />
                  </div>

                  {/* Row 4: Placeholder Email */}
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs opacity-60">
                    <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white shrink-0" />
                    <Star className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                    <div className="w-14 h-2 bg-slate-200/90 rounded-full" />
                    <div className="flex-1 h-2 bg-slate-200/60 rounded-full" />
                  </div>

                  {/* Row 5: Placeholder Email */}
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs opacity-50">
                    <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white shrink-0" />
                    <Star className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                    <div className="w-16 h-2 bg-slate-200/90 rounded-full" />
                    <div className="flex-1 h-2 bg-slate-200/60 rounded-full" />
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* GET STARTED MODAL (CLEAN LIGHT THEME: NAME, EMAIL, PASSWORD, SUBMIT) */}
      {/* ========================================================================= */}
      {getStartedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="absolute inset-0"
            onClick={() => setGetStartedModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-left text-slate-900 z-10 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setGetStartedModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <MailTrackerLogo />
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleGetStartedSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greg Svensson"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#18506D] focus:ring-2 focus:ring-[#8AEDFF]/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. greg@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#18506D] focus:ring-2 focus:ring-[#8AEDFF]/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#18506D] focus:ring-2 focus:ring-[#8AEDFF]/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl bg-[#18506D] hover:bg-[#133e54] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-99 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Opening Dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



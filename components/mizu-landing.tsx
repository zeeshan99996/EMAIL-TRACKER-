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
  CheckCheck,
  MousePointerClick,
  Flame,
  Globe,
  BellRing,
  Send,
  Eye,
  TrendingUp,
  DownloadCloud,
  Quote,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { WebsiteHeader, ChromeIcon, MailTrackerLogo } from './website-header';
import { WebsiteFooter } from './website-footer';

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
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <MailTrackerLogo />
          <div className="w-5 h-5 border-2 border-[#18506D]/30 border-t-[#18506D] rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#7EE4FA]/40 selection:text-[#18506D] flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* HEADER SECTION (CLEAN OFF-WHITE, MATCHING REFERENCE) */}
      {/* ========================================================================= */}
      <WebsiteHeader onGetStartedClick={handleGetStartedClick} />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden pt-8 sm:pt-14 pb-16 sm:pb-20">
        {/* Subtle Ambient Light Glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-[#7EE4FA]/15 blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[#18506D]/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* ------------------------------------------------------------------- */}
            {/* LEFT COLUMN: HEADLINE, SUBHEADLINE, CTA BUTTON & TRUST BADGES */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start text-left pr-0 lg:pr-6">
              
              {/* Feature Pill Badge with #7EE4FA */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7EE4FA]/20 text-[#0e7490] border border-[#7EE4FA]/50 text-xs font-semibold shadow-sm mb-5 animate-pulse-slow">
                <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Next-Gen Gmail Telemetry & Warmup 2026</span>
              </div>

              {/* Main Headline with #18506D & #7EE4FA gradient */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-extrabold text-slate-900 tracking-tight leading-[1.12] sm:leading-[1.08]">
                The best{' '}
                <span className="bg-gradient-to-r from-[#18506D] via-[#0284c7] to-[#7EE4FA] bg-clip-text text-transparent font-extrabold">
                  Email
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#18506D] via-[#0284c7] to-[#7EE4FA] bg-clip-text text-transparent font-extrabold">
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-base sm:text-[17px] bg-[#18506D] hover:bg-[#133e54] shadow-lg shadow-[#18506D]/20 hover:shadow-xl hover:shadow-[#18506D]/30 border border-transparent hover:border-[#7EE4FA]/50 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
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
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-white text-slate-700 text-xs shadow-sm">
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

            {/* ------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: GMAIL INBOX WINDOW MOCKUP WITH ACTIVE TRACKING POPOVER */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-6 xl:col-span-5 w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-[540px] rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_60px_-15px_rgba(24,80,109,0.14)] overflow-hidden transition-all hover:shadow-[0_25px_70px_-15px_rgba(24,80,109,0.2)] hover:border-[#7EE4FA]/60">
                
                {/* Window Top Controls Bar */}
                <div className="bg-[#f1f5f9]/90 px-4 py-2.5 flex items-center gap-1.5 border-b border-slate-200/70">
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

                      {/* ===================================================================== */}
                      {/* SIGNATURE POPUP TOOLTIP (EMAIL OPENED 3 TIMES) */}
                      {/* ===================================================================== */}
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
                            <Smartphone className="w-3 h-3 text-[#7EE4FA]" />
                          </div>

                          {/* Event 2 */}
                          <div className="flex items-center justify-between text-slate-300">
                            <span>2 hours ago</span>
                            <Laptop className="w-3 h-3 text-[#7EE4FA]" />
                          </div>

                          {/* Event 3 */}
                          <div className="flex items-center justify-between text-slate-300">
                            <span>1 day ago</span>
                            <Laptop className="w-3 h-3 text-[#7EE4FA]" />
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
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: SOFTWARE WORKFLOW (HOW IT WORKS CARD) */}
      {/* ========================================================================= */}
      <section id="workflow" className="py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7EE4FA]/20 text-[#0e7490] border border-[#7EE4FA]/40 text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>HOW IT WORKS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Seamless 4-Step{' '}
              <span className="bg-gradient-to-r from-[#18506D] via-[#0284c7] to-[#7EE4FA] bg-clip-text text-transparent">
                Software Workflow
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              From fast 1-click integration to real-time open alerts and deliverability warmup, see how MailTracker handles your emails.
            </p>
          </div>

          {/* Master Workflow Card with Crisp Borders */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-[0_10px_35px_-10px_rgba(15,23,42,0.06)] hover:border-[#7EE4FA]/60 transition-all duration-300">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              
              {/* Step 1 */}
              <div className="flex flex-col p-5 rounded-2xl border border-slate-200/80 bg-[#f8fafc] hover:bg-white hover:border-[#7EE4FA] hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#18506D] text-[#7EE4FA] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <DownloadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#7EE4FA]/20 text-[#0e7490] border border-[#7EE4FA]/40">
                    STEP 01
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#18506D] transition-colors">
                  1-Click Extension Setup
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Install the free Chrome extension in under 30 seconds. Works instantly with personal Gmail and Google Workspace accounts.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-[#0e7490]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE4FA]" />
                  <span>Zero DNS setup required</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col p-5 rounded-2xl border border-slate-200/80 bg-[#f8fafc] hover:bg-white hover:border-[#7EE4FA] hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#18506D] text-[#7EE4FA] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Send className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#7EE4FA]/20 text-[#0e7490] border border-[#7EE4FA]/40">
                    STEP 02
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#18506D] transition-colors">
                  Send with Smart Telemetry
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Compose emails in Gmail as usual. MailTracker injects lightweight pixel tracking and HTTPS click redirect wraps automatically.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-[#0e7490]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE4FA]" />
                  <span>100% Invisible to recipients</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col p-5 rounded-2xl border border-slate-200/80 bg-[#f8fafc] hover:bg-white hover:border-[#7EE4FA] hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#18506D] text-[#7EE4FA] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <BellRing className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#7EE4FA]/20 text-[#0e7490] border border-[#7EE4FA]/40">
                    STEP 03
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#18506D] transition-colors">
                  Instant Real-Time Pings
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Get notified the instant your prospect opens the message or clicks links. Double checkmarks appear immediately in your Gmail view.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-[#0e7490]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE4FA]" />
                  <span>Double checkmark receipt</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col p-5 rounded-2xl border border-slate-200/80 bg-[#f8fafc] hover:bg-white hover:border-[#7EE4FA] hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#18506D] text-[#7EE4FA] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Flame className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#7EE4FA]/20 text-[#0e7490] border border-[#7EE4FA]/40">
                    STEP 04
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#18506D] transition-colors">
                  Warmup & Inbox Placement
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Protect your sender score with autonomous AI warmup routines. Prevent spam filters and keep cold outreach hitting the primary inbox.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-[#0e7490]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE4FA]" />
                  <span>99.4% Inbox placement</span>
                </div>
              </div>

            </div>

            {/* Workflow Footer Status Banner */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-800">MailTracker Core Telemetry Engine: Operational</span>
              </div>
              <button
                type="button"
                onClick={handleGetStartedClick}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e7490] hover:text-[#18506D] transition-colors"
              >
                <span>Try the interactive workflow now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: KEY FEATURES SECTION */}
      {/* ========================================================================= */}
      <section id="features" className="py-16 sm:py-24 bg-[#f1f5f9]/40 relative border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7EE4FA]/20 text-[#0e7490] border border-[#7EE4FA]/40 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>CORE CAPABILITIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Powerful Features Built for{' '}
              <span className="bg-gradient-to-r from-[#18506D] via-[#0284c7] to-[#7EE4FA] bg-clip-text text-transparent">
                High Performers
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Designed for sales reps, founders, recruiters, and consultants who need reliable read receipts and domain protection.
            </p>
          </div>

          {/* Features 6-Card Grid with Crisp Borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Feature 1: Double Checkmarks */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-[#7EE4FA] hover:shadow-[0_12px_30px_-5px_rgba(126,228,250,0.25)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#7EE4FA]/20 border border-[#7EE4FA]/50 text-[#0284c7] flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <CheckCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-[#18506D] transition-colors">
                Native Double Checkmarks
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                See blue double checks directly inside Gmail sent folders. Single check means sent, double check means read. No external tab required.
              </p>
            </div>

            {/* Feature 2: Link Click Telemetry */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-[#7EE4FA] hover:shadow-[0_12px_30px_-5px_rgba(126,228,250,0.25)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#7EE4FA]/20 border border-[#7EE4FA]/50 text-[#0284c7] flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-[#18506D] transition-colors">
                Link & Proposal Tracking
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Know which links in your email were clicked, how many times they were opened, and the exact minute your proposal was viewed.
              </p>
            </div>

            {/* Feature 3: Automated Warmup Network */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-[#7EE4FA] hover:shadow-[0_12px_30px_-5px_rgba(126,228,250,0.25)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#7EE4FA]/20 border border-[#7EE4FA]/50 text-[#0284c7] flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-[#18506D] transition-colors">
                Automated Inbox Warmup
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gradually warm up your email accounts and rescue messages from spam folders using an AI-managed peer-to-peer business network.
              </p>
            </div>

            {/* Feature 4: Email Verifier */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-[#7EE4FA] hover:shadow-[0_12px_30px_-5px_rgba(126,228,250,0.25)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#7EE4FA]/20 border border-[#7EE4FA]/50 text-[#0284c7] flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-[#18506D] transition-colors">
                Real-Time Address Verifier
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Validate recipient addresses on-the-fly. Block dead inboxes, spam traps, and catch-all domains before they hurt your reputation.
              </p>
            </div>

            {/* Feature 5: Device & Geolocation */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-[#7EE4FA] hover:shadow-[0_12px_30px_-5px_rgba(126,228,250,0.25)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#7EE4FA]/20 border border-[#7EE4FA]/50 text-[#0284c7] flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-[#18506D] transition-colors">
                Device & Geo Telemetry
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Discover if the recipient read your email on an iPhone, Android, or laptop, along with approximate city and timezone data.
              </p>
            </div>

            {/* Feature 6: Zero Storage Privacy */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-[#7EE4FA] hover:shadow-[0_12px_30px_-5px_rgba(126,228,250,0.25)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#7EE4FA]/20 border border-[#7EE4FA]/50 text-[#0284c7] flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-[#18506D] transition-colors">
                GDPR & Zero Content Stored
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We never store, read, or monetize your email body text or private attachments. Complete compliance with GDPR, HIPAA, and Google OAuth standards.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: CLIENT TESTIMONIALS SECTION */}
      {/* ========================================================================= */}
      <section id="testimonials" className="py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7EE4FA]/20 text-[#0e7490] border border-[#7EE4FA]/40 text-xs font-semibold mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>CLIENT TESTIMONIALS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Trusted by 45,000+ Founders &{' '}
              <span className="bg-gradient-to-r from-[#18506D] via-[#0284c7] to-[#7EE4FA] bg-clip-text text-transparent">
                Sales Teams
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Read how teams use real-time Gmail telemetry to time their follow-ups and close bigger deals.
            </p>
          </div>

          {/* Testimonials 4-Card Grid with Clean Borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Testimonial 1 */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/90 bg-white hover:border-[#7EE4FA] hover:shadow-lg transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Closed $45,000 Deal
                  </span>
                </div>
                <Quote className="w-7 h-7 text-[#7EE4FA]/40 mb-3" />
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic mb-6">
                  "We closed a $45,000 enterprise annual contract within 10 minutes of seeing the client open our proposal for the 4th time. Picking up the phone at that exact second was pure magic."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#18506D] text-[#7EE4FA] font-bold text-sm flex items-center justify-center shrink-0">
                  SJ
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sarah Jenkins</h4>
                  <p className="text-xs text-slate-500">VP of Sales at CloudScale</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/90 bg-white hover:border-[#7EE4FA] hover:shadow-lg transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#7EE4FA]/20 text-[#0e7490] border border-[#7EE4FA]/40">
                    100% Native Gmail
                  </span>
                </div>
                <Quote className="w-7 h-7 text-[#7EE4FA]/40 mb-3" />
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic mb-6">
                  "The double checkmarks directly in Gmail feel completely native. No heavy third-party dashboards needed—it just works right inside my inbox without slowing down Chrome."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#18506D] text-[#7EE4FA] font-bold text-sm flex items-center justify-center shrink-0">
                  MV
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Marcus Vance</h4>
                  <p className="text-xs text-slate-500">Managing Partner at Apex Growth Ventures</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/90 bg-white hover:border-[#7EE4FA] hover:shadow-lg transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    99.4% Deliverability
                  </span>
                </div>
                <Quote className="w-7 h-7 text-[#7EE4FA]/40 mb-3" />
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic mb-6">
                  "Our outbound cold email deliverability skyrocketed from 76% to 99.4% within 2 weeks of using the automated warmup network. Spam complaints dropped to practically zero."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#18506D] text-[#7EE4FA] font-bold text-sm flex items-center justify-center shrink-0">
                  ER
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Elena Rostova</h4>
                  <p className="text-xs text-slate-500">Head of Growth at HyperLeads</p>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/90 bg-white hover:border-[#7EE4FA] hover:shadow-lg transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#7EE4FA]/20 text-[#0e7490] border border-[#7EE4FA]/40">
                    Device Telemetry
                  </span>
                </div>
                <Quote className="w-7 h-7 text-[#7EE4FA]/40 mb-3" />
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic mb-6">
                  "Knowing whether an investor opened my pitch deck on their phone or on a 4K monitor gave me immense leverage in my follow-up strategy. Unmatched precision."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#18506D] text-[#7EE4FA] font-bold text-sm flex items-center justify-center shrink-0">
                  DK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">David Kim</h4>
                  <p className="text-xs text-slate-500">Founder & CEO at MetricFlow</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: CALL TO ACTION (PRE-FOOTER BANNER) */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#18506D] via-[#133e54] to-[#082838] border-2 border-[#7EE4FA]/40 p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-2xl shadow-[#18506D]/20">
            
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#7EE4FA]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#7EE4FA]/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7EE4FA]/20 text-[#7EE4FA] border border-[#7EE4FA]/40 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#7EE4FA]" />
                <span>START IN 30 SECONDS</span>
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Ready to know when your emails get opened?
              </h2>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-lg mx-auto">
                Install our free MailTracker Chrome extension today. No credit card required, zero complex setup.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleGetStartedClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-slate-900 font-bold text-base bg-[#7EE4FA] hover:bg-[#5cdbf7] shadow-lg shadow-[#7EE4FA]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <ChromeIcon className="w-5 h-5 shrink-0" />
                  <span>Install MailTracker for Chrome</span>
                </button>

                <button
                  type="button"
                  onClick={handleGetStartedClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold text-base bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 font-medium pt-2">
                🔒 Enterprise-grade security • GDPR compliant • Zero email body storage
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FOOTER */}
      {/* ========================================================================= */}
      <WebsiteFooter />

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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#18506D] focus:ring-2 focus:ring-[#7EE4FA]/50 transition-all"
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#18506D] focus:ring-2 focus:ring-[#7EE4FA]/50 transition-all"
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#18506D] focus:ring-2 focus:ring-[#7EE4FA]/50 transition-all"
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




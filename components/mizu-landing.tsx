'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { HeroIntegrationsBeam } from './hero-integrations-beam';

export default function MizuLanding() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      // If user explicitly navigated back to the website from the dashboard (?view=landing or ?portal=true), allow viewing the website!
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const isExplicitLandingView = params?.get('view') === 'landing' || params?.get('portal') === 'true';

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
    // If the person has already filled and submitted the form once, directly open dashboard!
    const alreadySubmitted =
      hasSubmittedBefore ||
      (typeof window !== 'undefined' &&
        !!localStorage.getItem('mailify_submitted_user'));

    if (alreadySubmitted) {
      router.push('/dashboard');
      return;
    }

    // First time visitor: show simple light theme form
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

      // Mark this user as registered/submitted in browser storage
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

      // Success! Open dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // If returning user, do not render landing page - redirecting to dashboard
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-[#01040f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/images/mailify-logo-white.png"
            alt="Mailify"
            className="h-9 w-auto object-contain animate-pulse"
          />
          <div className="w-5 h-5 border-2 border-[#53E2FE]/30 border-t-[#53E2FE] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050c1e] text-white font-sans relative overflow-x-hidden selection:bg-[#53E2FE]/20 selection:text-[#53E2FE]">
      {/* ========================================================================= */}
      {/* HD BLUE AND BLACK GRADIENT HERO MASTER SHOWCASE (FEATURING #53E2FE) */}
      {/* ========================================================================= */}
      <div className="min-h-screen w-full bg-gradient-to-b from-[#020512] via-[#021029]/95 to-[#04336c]/80 p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-[1440px] mx-auto rounded-[24px] sm:rounded-[38px] md:rounded-[46px] overflow-hidden border-2 border-[#53E2FE]/70 shadow-[0_20px_100px_rgba(83,226,254,0.4),0_0_60px_rgba(83,226,254,0.3)] relative hero-hd-blue-black-gradient text-white">
          {/* ========================================================================= */}
          {/* BACKGROUND GLOW AURAS, VERTICAL LINES & SINE WAVES (VIBRANT #53E2FE GLOW) */}
          {/* ========================================================================= */}

        {/* Left Side Vibrant #53E2FE Bloom - Positioned below top nav for crystal dark header contrast */}
        <div
          className="absolute -left-[14%] sm:-left-[7%] top-[35%] sm:top-[40%] w-[580px] sm:w-[780px] h-[580px] sm:h-[780px] rounded-full pointer-events-none -z-10 blur-[95px] sm:blur-[135px] opacity-90"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(83,226,254,0.85) 0%, rgba(14,165,233,0.65) 42%, rgba(2,132,199,0.35) 70%, transparent 85%)',
          }}
        />

        {/* Right Side High-Reaching Radiant #53E2FE Bloom */}
        <div
          className="absolute -right-[15%] sm:-right-[8%] top-[12%] sm:top-[16%] w-[620px] sm:w-[880px] h-[680px] sm:h-[920px] rounded-full pointer-events-none -z-10 blur-[95px] sm:blur-[135px] opacity-98"
          style={{
            background:
              'radial-gradient(ellipse at center, #53E2FE 0%, rgba(83,226,254,0.85) 35%, rgba(14,165,233,0.5) 65%, transparent 85%)',
          }}
        />

        {/* Bottom Center Horizon Intense White & #53E2FE Core Glow */}
        <div
          className="absolute -bottom-[20%] sm:-bottom-[26%] left-1/2 -translate-x-1/2 w-[900px] sm:w-[1400px] lg:w-[1700px] h-[480px] sm:h-[680px] rounded-[100%] pointer-events-none -z-10 blur-[80px] sm:blur-[110px]"
          style={{
            background:
              'radial-gradient(ellipse 85% 60% at 50% 100%, #ffffff 0%, #53E2FE 30%, rgba(83,226,254,0.85) 52%, rgba(2,132,199,0.4) 75%, transparent 100%)',
          }}
        />

        {/* Vertical Coordinate Grid Columns (16 Lines in Radiant #53E2FE) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none -z-10"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="verticalGridMaskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="85%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>
            <mask id="verticalGridMask">
              <rect width="100%" height="100%" fill="url(#verticalGridMaskGrad)" />
            </mask>
          </defs>
          <g mask="url(#verticalGridMask)" stroke="#53E2FE" strokeWidth="1.2" strokeOpacity="0.6">
            {[...Array(17)].map((_, i) => (
              <line key={i} x1={`${(i / 16) * 100}%`} y1="0" x2={`${(i / 16) * 100}%`} y2="100%" />
            ))}
          </g>
        </svg>

        {/* Intersecting Undulating Laser Sine Waves in Glowing #53E2FE */}
        <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-60 pointer-events-none -z-10 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 240"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveCyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#53E2FE" stopOpacity="0.2" />
                <stop offset="25%" stopColor="#53E2FE" stopOpacity="0.85" />
                <stop offset="65%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="85%" stopColor="#53E2FE" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#53E2FE" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="waveBlueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.15" />
                <stop offset="40%" stopColor="#53E2FE" stopOpacity="0.75" />
                <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="waveSubtleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Primary Sine Wave in Brilliant #53E2FE */}
            <path
              d="M 0 140 C 220 70, 420 180, 680 120 C 940 60, 1180 170, 1440 100"
              stroke="url(#waveCyanGrad)"
              strokeWidth="2.5"
              fill="none"
              style={{ filter: 'drop-shadow(0 0 8px rgba(83,226,254,0.6))' }}
            />
            {/* Counter Intersecting Sine Wave */}
            <path
              d="M 0 110 C 260 170, 520 80, 780 160 C 1040 220, 1260 110, 1440 150"
              stroke="url(#waveBlueGrad)"
              strokeWidth="2"
              fill="none"
            />
            {/* Gentle Harmonic Wave */}
            <path
              d="M 0 160 C 320 110, 600 190, 900 130 C 1140 85, 1320 150, 1440 120"
              stroke="url(#waveSubtleGrad)"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* TOP NAVIGATION BAR (FEATURING #53E2FE GLOW) */}
        {/* ========================================================================= */}
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-40">
          {/* Brand Logo: Mailify */}
          <Link href="/" className="flex items-center group py-1">
            <img
              src="/images/mailify-logo-white.png"
              alt="Mailify"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-white">
            <a href="#features" className="hover:text-[#53E2FE] transition-colors">
              Features
            </a>
            <a href="#platforms" className="hover:text-[#53E2FE] transition-colors">
              Platforms
            </a>
            <a href="#insights" className="hover:text-[#53E2FE] transition-colors">
              Insights
            </a>
            <a href="#pricing" className="hover:text-[#53E2FE] transition-colors">
              Pricing
            </a>
          </nav>

          {/* Action Button: Single Get Started Button */}
          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={handleGetStartedClick}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-full shadow-sm hover:shadow transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-[#53E2FE] rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-6 pt-3 pb-6 space-y-4 bg-[#080d1a]/95 backdrop-blur-xl border-b border-blue-900/40 shadow-2xl relative z-30 text-white">
            <nav className="flex flex-col space-y-3 text-base font-medium text-white">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#53E2FE] transition-colors">
                Features
              </a>
              <a href="#platforms" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#53E2FE] transition-colors">
                Platforms
              </a>
              <a href="#insights" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#53E2FE] transition-colors">
                Insights
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#53E2FE] transition-colors">
                Pricing
              </a>
            </nav>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGetStartedClick();
                }}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-full cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* HERO MAIN CONTENT SECTION */}
        {/* ========================================================================= */}
        <section className="relative min-h-[calc(100vh-100px)] flex flex-col justify-center items-center pt-8 pb-14 sm:pt-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          
          {/* Big Headline (User Requested) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight text-center max-w-4xl mx-auto leading-tight">
            Send <span className="text-[#53E2FE] opacity-80 font-light mx-1.5 sm:mx-2">•</span> Verify <span className="text-[#53E2FE] opacity-80 font-light mx-1.5 sm:mx-2">•</span> Warmup <span className="text-[#53E2FE] opacity-80 font-light mx-1.5 sm:mx-2">•</span> <span className="font-semibold text-white">Track</span>
          </h1>

          {/* Subheadline (User Requested) */}
          <p className="text-white text-sm sm:text-base md:text-lg font-light text-center max-w-3xl mx-auto mt-3 sm:mt-4 mb-4 sm:mb-6 leading-relaxed drop-shadow-sm">
            One powerful platform to send emails, track engagement, verify addresses, and warm up your inbox.
          </p>

          {/* ========================================================================= */}
          {/* HERO INTEGRATIONS BEAM ANIMATION (WHITE CONVERGING LINES, GMAIL, APPS SCRIPT, SHEETS, OUTLOOK, MIZU) */}
          {/* ========================================================================= */}
          <HeroIntegrationsBeam />

        </section>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GET STARTED MODAL (SIMPLE LIGHT THEME: NAME, EMAIL, PASSWORD, SUBMIT) */}
      {/* ========================================================================= */}
      {getStartedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setGetStartedModalOpen(false)}
          />

          {/* Clean Light-Theme Modal Card */}
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.35)] text-left text-slate-900 z-10 animate-in zoom-in-95 duration-150">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setGetStartedModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <img
                src="/images/mailify-logo-dark.png"
                alt="Mailify"
                className="h-8 sm:h-9 w-auto object-contain"
              />
              <div className="border-l border-slate-200 pl-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Get Started
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your details to open your dashboard
                </p>
              </div>
            </div>

            {/* Error Message Banner */}
            {authError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form: Name, Email, Password, Submit */}
            <form onSubmit={handleGetStartedSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-99 cursor-pointer disabled:opacity-70"
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


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Zap,
  Check,
  ChevronRight,
  Send,
  Mic,
  Paperclip,
  CheckCircle2,
  Menu,
  X,
  Sliders,
  Lock,
  Edit3,
  Plus,
  Minus,
  FileSpreadsheet,
  FileCode,
  Bell,
  ChevronDown,
  Lightbulb,
  Battery,
  Wifi,
  Signal,
  Headphones,
  ShoppingCart,
  Coffee,
  ArrowUp,
  CircleDot,
  Smartphone,
} from 'lucide-react';

export default function MizuLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [selectedFlow, setSelectedFlow] = useState<'drive' | 'linkedin' | 'slack'>('drive');
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [zoomScale, setZoomScale] = useState(1);

  // Hero view mode: 'generator' (matches new reference image) or 'mobile' (matches mobile ChatGPT mockup)
  const [heroViewMode, setHeroViewMode] = useState<'generator' | 'mobile'>('generator');
  const [selectedPlatform, setSelectedPlatform] = useState<'Android' | 'iOS' | 'Mac OS' | 'Windows'>('iOS');
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!generatePrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedSuccess(true);
      setTimeout(() => setGeneratedSuccess(false), 3000);
    }, 1200);
  };

  // Mobile ChatGPT showcase state
  const [mobileChat, setMobileChat] = useState<Array<{ id: number; sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      id: 1,
      sender: 'user',
      text: 'Track my business expenses and automatically sync them to Google Sheets.',
      time: '9:41 AM',
    },
    {
      id: 2,
      sender: 'assistant',
      text: "Done! I've categorized 2 new transactions ($54.00) and synced them live to your expense sheet.",
      time: '9:42 AM',
    },
  ]);
  const [mobileInput, setMobileInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleMobileSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mobileInput.trim()) return;
    const userText = mobileInput.trim();
    const newMsgId = Date.now();
    setMobileChat((prev) => [...prev, { id: newMsgId, sender: 'user', text: userText, time: 'Just now' }]);
    setMobileInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      setMobileChat((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: `Got it! Executing "${userText}" across your workspace with real-time sync.`,
          time: 'Just now',
        },
      ]);
      setIsAiTyping(false);
    }, 800);
  };

  // Typewriter effect simulation for placeholder if user hasn't typed
  const defaultPlaceholder = 'Tell Mizu What You Want';
  const [typedPlaceholder, setTypedPlaceholder] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedPlaceholder(defaultPlaceholder.slice(0, index));
      index++;
      if (index > defaultPlaceholder.length) {
        clearInterval(interval);
      }
    }, 85);
    return () => clearInterval(interval);
  }, []);

  const flowOptions = {
    drive: {
      leftPill: '✦ Back up my files to Google Drive every Friday.',
      service: 'Google Drive',
      badge: '234 Files processed',
      title: 'Mizu Auto Uploaded 234 Files',
      docCount: 1,
      sheetCount: 1,
      overrideCount: 1,
      targetIcon: 'drive',
    },
    linkedin: {
      leftPill: '✦ Post blog updates to LinkedIn automatically.',
      service: 'LinkedIn',
      badge: '48 Updates published',
      title: 'Mizu Auto Published 48 Posts',
      docCount: 3,
      sheetCount: 2,
      overrideCount: 0,
      targetIcon: 'linkedin',
    },
    slack: {
      leftPill: '✦ Notify me on Slack when a task is marked urgent.',
      service: 'Slack',
      badge: '18 Alerts routed',
      title: 'Mizu Auto Synced 18 Tasks',
      docCount: 2,
      sheetCount: 4,
      overrideCount: 1,
      targetIcon: 'slack',
    },
  };

  const handleFlowSelect = (flow: 'drive' | 'linkedin' | 'slack') => {
    setSelectedFlow(flow);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative overflow-x-hidden selection:bg-sky-100 selection:text-sky-900">
      {/* ========================================================================= */}
      {/* 2. TOP HERO MASTER SECTION (DARK SPACE BLACK & ELECTRIC BLUE GLOW AS IN REFERENCE) */}
      {/* ========================================================================= */}
      <div className="relative bg-[#000208] text-white overflow-hidden border-b border-blue-900/30">
        {/* ========================================================================= */}
        {/* BACKGROUND GLOW AURAS, VERTICAL LINES & SINE WAVES (EXACT MATCH TO REFERENCE) */}
        {/* ========================================================================= */}

        {/* Left Side Deep Royal Blue Bloom */}
        <div
          className="absolute -left-[14%] sm:-left-[7%] top-[25%] sm:top-[30%] w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full pointer-events-none -z-10 blur-[100px] sm:blur-[140px] opacity-90"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(37,99,235,0.75) 0%, rgba(29,78,216,0.5) 45%, rgba(30,58,138,0.2) 70%, transparent 85%)',
          }}
        />

        {/* Right Side High-Reaching Electric Azure Bloom */}
        <div
          className="absolute -right-[16%] sm:-right-[8%] top-[14%] sm:top-[18%] w-[600px] sm:w-[850px] h-[650px] sm:h-[900px] rounded-full pointer-events-none -z-10 blur-[110px] sm:blur-[150px] opacity-95"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(59,130,246,0.85) 0%, rgba(37,99,235,0.65) 45%, rgba(29,78,216,0.25) 75%, transparent 85%)',
          }}
        />

        {/* Bottom Center Horizon Intense White-Cyan Core Glow */}
        <div
          className="absolute -bottom-[22%] sm:-bottom-[30%] left-1/2 -translate-x-1/2 w-[850px] sm:w-[1300px] lg:w-[1600px] h-[450px] sm:h-[650px] rounded-[100%] pointer-events-none -z-10 blur-[90px] sm:blur-[120px]"
          style={{
            background:
              'radial-gradient(ellipse 75% 55% at 50% 100%, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.9) 20%, rgba(147,197,253,0.75) 38%, rgba(59,130,246,0.55) 58%, rgba(29,78,216,0.25) 80%, transparent 100%)',
          }}
        />

        {/* Vertical Coordinate Grid Columns (16 Lines Fading Out to Top) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none -z-10"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="verticalGridMaskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.02" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="85%" stopColor="#ffffff" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>
            <mask id="verticalGridMask">
              <rect width="100%" height="100%" fill="url(#verticalGridMaskGrad)" />
            </mask>
          </defs>
          <g mask="url(#verticalGridMask)" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.45">
            {[...Array(17)].map((_, i) => (
              <line key={i} x1={`${(i / 16) * 100}%`} y1="0" x2={`${(i / 16) * 100}%`} y2="100%" />
            ))}
          </g>
        </svg>

        {/* Intersecting Undulating Laser Sine Waves (Bottom Horizon) */}
        <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-56 pointer-events-none -z-10 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 240"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveCyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
                <stop offset="25%" stopColor="#60a5fa" stopOpacity="0.5" />
                <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="waveBlueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.1" />
                <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.5" />
                <stop offset="75%" stopColor="#60a5fa" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="waveSubtleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Primary Sine Wave */}
            <path
              d="M 0 140 C 220 70, 420 180, 680 120 C 940 60, 1180 170, 1440 100"
              stroke="url(#waveCyanGrad)"
              strokeWidth="1.75"
              fill="none"
            />
            {/* Counter Intersecting Sine Wave */}
            <path
              d="M 0 110 C 260 170, 520 80, 780 160 C 1040 220, 1260 110, 1440 150"
              stroke="url(#waveBlueGrad)"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Gentle Harmonic Wave */}
            <path
              d="M 0 160 C 320 110, 600 190, 900 130 C 1140 85, 1320 150, 1440 120"
              stroke="url(#waveSubtleGrad)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* TOP NAVIGATION BAR (DARK LUXURY THEME TO MATCH REFERENCE IMAGE) */}
        {/* ========================================================================= */}
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-40">
          {/* Brand Logo with Glowing Circular Ring as in Reference */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-full border-2 border-white/80 flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.4)] group-hover:border-white transition-all">
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white ml-0.5">
              mizu
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#platforms" className="hover:text-white transition-colors">
              Platforms
            </a>
            <a href="#insights" className="hover:text-white transition-colors">
              Insights
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 py-1"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-full shadow-sm hover:shadow transition-all hover:scale-[1.02] active:scale-98"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-6 pt-3 pb-6 space-y-4 bg-[#080d1a]/95 backdrop-blur-xl border-b border-blue-900/40 shadow-2xl relative z-30 text-white">
            <nav className="flex flex-col space-y-3 text-base font-medium text-slate-200">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">
                Features
              </a>
              <a href="#platforms" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">
                Platforms
              </a>
              <a href="#insights" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">
                Insights
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">
                Pricing
              </a>
            </nav>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-full"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* HERO MAIN CONTENT SECTION */}
        {/* ========================================================================= */}
        <section className="relative min-h-[calc(100vh-100px)] flex flex-col justify-center items-center pt-8 pb-14 sm:pt-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          
          {/* Mode Switcher Pill (App Generator or Mobile Chat Showcase) */}
          <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8 z-20">
            <div className="inline-flex items-center p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium">
              <button
                type="button"
                onClick={() => setHeroViewMode('generator')}
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  heroViewMode === 'generator'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>App Generator</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroViewMode('mobile')}
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  heroViewMode === 'mobile'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Chat (ChatGPT)</span>
              </button>
            </div>
          </div>

          {/* Big Headline (Exact to Reference Image) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight text-center max-w-4xl mx-auto leading-tight">
            Build Apps <span className="font-semibold text-white">People Love</span>
          </h1>

          {/* Subtitle (Exact to Reference Image) */}
          <p className="text-slate-300/90 text-sm sm:text-base font-light text-center max-w-2xl mx-auto mt-3 sm:mt-4 mb-8 sm:mb-10 leading-relaxed">
            From ideas to Apps, generate, design and ship native platform apps with an ai-powered workflow built for creators.
          </p>

          {/* ========================================================================= */}
          {/* VIEW MODE 1: FROSTED GLASS APP GENERATOR CARD (FROM REFERENCE IMAGE) */}
          {/* ========================================================================= */}
          {heroViewMode === 'generator' && (
            <div className="w-full max-w-2xl mx-auto relative z-20">
              <form
                onSubmit={handleGenerate}
                className="bg-white/85 sm:bg-white/90 backdrop-blur-2xl rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border border-white/70 shadow-[0_25px_60px_rgba(0,0,0,0.35)] text-left transition-all hover:shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
              >
                {/* Input prompt area */}
                <div className="min-h-[52px] flex items-start">
                  <input
                    type="text"
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    placeholder="Type something to generate"
                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm sm:text-base font-normal outline-none"
                  />
                </div>

                {/* Bottom Platform Pills & Generate Button */}
                <div className="mt-5 pt-4 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                  {/* Platform Pills */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {(['Android', 'iOS', 'Mac OS', 'Windows'] as const).map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => setSelectedPlatform(platform)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          selectedPlatform === platform
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>

                  {/* Generate Button */}
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-6 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium shadow-md transition-all hover:scale-[1.02] active:scale-98 ml-auto flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : generatedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Generated!</span>
                      </>
                    ) : (
                      <span>Generate</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW MODE 2: IPHONE CHATGPT MOBILE SHOWCASE */}
          {/* ========================================================================= */}
          {heroViewMode === 'mobile' && (
            <div className="w-full flex justify-center z-20 px-3 sm:px-0 relative">
              {/* iPhone 16 Pro Style Hardware Chassis */}
              <div className="w-full max-w-[340px] sm:max-w-[375px] h-[640px] sm:h-[680px] bg-white rounded-[46px] sm:rounded-[50px] border-[8px] sm:border-[10px] border-slate-950 shadow-[0_25px_80px_rgba(0,0,0,0.4),0_10px_30px_rgba(0,0,0,0.25)] ring-1 ring-slate-900/20 flex flex-col relative overflow-hidden transition-all duration-300">
                {/* Top iOS Status Bar with Dynamic Island */}
                <div className="bg-white/95 backdrop-blur-md pt-3 px-5 pb-2 flex items-center justify-between z-30 shrink-0 border-b border-slate-100/50">
                  <span className="text-[11px] font-semibold text-slate-800 tracking-tight">9:41</span>
                  
                  {/* Dynamic Island Notch */}
                  <div className="w-20 h-4.5 bg-black rounded-full flex items-center justify-end px-2 mx-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700/80" />
                  </div>

                  {/* Status Icons */}
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <Signal className="w-3 h-3 stroke-[2.2]" />
                    <Wifi className="w-3 h-3 stroke-[2.2]" />
                    <Battery className="w-4 h-4 stroke-[2.2]" />
                  </div>
                </div>

                {/* Inner Phone Content (Scrollable Area) */}
                <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-gradient-to-b from-sky-50/70 via-white to-white text-slate-900">
                  {/* Profile Bar & Actions */}
                  <div className="px-5 pt-3 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 p-[2px] shadow-sm">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-sky-700">
                          IM
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Personal</div>
                        <div className="text-xs font-bold text-slate-800">$8,690.00</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Notifications"
                        className="w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-2xs border border-slate-200/70 flex items-center justify-center text-slate-600 transition-colors"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Options"
                        className="w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-2xs border border-slate-200/70 flex items-center justify-center text-slate-600 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                      </button>
                    </div>
                  </div>

                  {/* Big Greeting: Hello, Imran */}
                  <div className="px-5 pt-1.5 pb-2 text-left">
                    <h2 className="text-xl sm:text-2xl font-light text-slate-700 tracking-tight">
                      Hello, <span className="font-bold text-slate-900">Imran</span>
                    </h2>
                  </div>

                  {/* Floating Auto-Categorized Cards */}
                  <div className="mx-4 my-1 p-3 rounded-2xl bg-gradient-to-r from-sky-500/90 to-blue-600/95 text-white shadow-md shadow-sky-500/20 space-y-2 text-left backdrop-blur-xs">
                    {/* Item 1: Grocery Store */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold leading-tight">Grocery Store</div>
                          <div className="text-[10px] text-sky-100 opacity-90">-$49.50 • Auto-categorized</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                        Food
                      </span>
                    </div>

                    <div className="h-px bg-white/15 w-full" />

                    {/* Item 2: Coffee Shop */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                          <Coffee className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold leading-tight">Coffee Shop</div>
                          <div className="text-[10px] text-sky-100 opacity-90">-$4.50 • Auto-categorized</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                        Cafe
                      </span>
                    </div>
                  </div>

                  {/* Chat Stream */}
                  <div className="flex-1 px-4 py-3 space-y-3 text-left">
                    <div className="text-center my-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100/90 px-2.5 py-0.5 rounded-full">
                        Today with Mizu AI
                      </span>
                    </div>

                    {mobileChat.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-start gap-2'}`}
                      >
                        {msg.sender === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                            <Sparkles className="w-3 h-3" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl ${
                            msg.sender === 'user'
                              ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs font-normal'
                              : 'bg-white text-slate-800 rounded-tl-xs shadow-2xs border border-slate-100'
                          }`}
                        >
                          {msg.text}
                          {msg.time && (
                            <div
                              className={`text-[9px] mt-1 text-right ${
                                msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                              }`}
                            >
                              {msg.time}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isAiTyping && (
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                          <Sparkles className="w-3 h-3" />
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-xs px-3 py-2 flex items-center gap-1 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.3s]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ChatGPT iOS Mobile Style Bottom Input Bar */}
                <form
                  onSubmit={handleMobileSend}
                  className="p-2.5 bg-white border-t border-slate-100/90 flex flex-col gap-1.5 shrink-0"
                >
                  <div className="flex items-center gap-2">
                    {/* Plus (+) Button */}
                    <button
                      type="button"
                      aria-label="Add attachment"
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Pill Input Container */}
                    <div className="flex-1 bg-slate-100/90 rounded-full px-3.5 py-1.5 flex items-center gap-2 border border-slate-200/50 focus-within:border-sky-400 focus-within:bg-white transition-all">
                      <input
                        type="text"
                        value={mobileInput}
                        onChange={(e) => setMobileInput(e.target.value)}
                        placeholder="Message Mizu..."
                        className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full font-normal"
                      />
                      <button
                        type="button"
                        aria-label="Voice input"
                        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Right Action Button (Send Arrow if text, Headphones if empty) */}
                    {mobileInput.trim() ? (
                      <button
                        type="submit"
                        aria-label="Send message"
                        className="w-8 h-8 rounded-full bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Voice conversation"
                        className="w-8 h-8 rounded-full bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* iPhone Home Indicator Line */}
                  <div className="w-28 h-1 bg-slate-300/80 rounded-full mx-auto mt-1 mb-0.5" />
                </form>
              </div>
            </div>
          )}

          {/* Floating Horizon Badge (Exact match to Reference Image) */}
          <div className="mt-8 sm:mt-12 flex items-center justify-center gap-2 text-slate-400 text-xs sm:text-sm font-light z-20">
            <span className="text-sky-400 text-base leading-none">•</span>
            <span>Launch app 10x faster</span>
          </div>

        </section>
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE WORKFLOW FLOW VISUALIZER (MOVED DOWN WITH GENEROUS SPACING) */}
      {/* ========================================================================= */}
      <section className="pt-16 sm:pt-24 md:pt-32 pb-12 sm:pb-20 max-w-5xl mx-auto relative px-4 sm:px-6">
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 relative">
            {/* ------------------------------------------------------------- */}
            {/* Left Column: Stacked Prompt Pills */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col items-center lg:items-end space-y-3 w-full lg:w-auto z-10">
              {/* Ghost Pill 1 */}
              <button
                type="button"
                onClick={() => handleFlowSelect('linkedin')}
                className={`text-xs px-4 py-2 rounded-full border transition-all cursor-pointer ${
                  selectedFlow === 'linkedin'
                    ? 'border-sky-500 bg-white shadow-md text-slate-800 font-medium scale-105'
                    : 'border-slate-200/80 bg-white/70 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                Post blog updates to LinkedIn...
              </button>

              {/* Active Hero Pill 2 (Highlighted with Sky Blue Ring) */}
              <button
                type="button"
                onClick={() => handleFlowSelect('drive')}
                className={`text-xs sm:text-sm px-5 py-2.5 rounded-full border-2 transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
                  selectedFlow === 'drive'
                    ? 'border-sky-500 bg-white text-slate-900 font-semibold shadow-sky-500/15 scale-105'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-sky-400'
                }`}
              >
                <span className="text-sky-500 text-sm">✦</span>
                <span>{flowOptions[selectedFlow].leftPill.replace('✦ ', '')}</span>
              </button>

              {/* Ghost Pill 3 */}
              <button
                type="button"
                onClick={() => handleFlowSelect('slack')}
                className={`text-xs px-4 py-2 rounded-full border transition-all cursor-pointer ${
                  selectedFlow === 'slack'
                    ? 'border-sky-500 bg-white shadow-md text-slate-800 font-medium scale-105'
                    : 'border-slate-200/80 bg-white/70 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                Notify me on Slack when a task is marked...
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Left Connecting Beam (Desktop) */}
            {/* ------------------------------------------------------------- */}
            <div className="hidden lg:flex items-center w-16 relative">
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 70 20">
                <line
                  x1="0"
                  y1="10"
                  x2="70"
                  y2="10"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="animate-flow-beam"
                />
                <circle cx="35" cy="10" r="3" fill="#0284c7" />
              </svg>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Center Circular Hub: Glowing Ring with App Logo & Doc Card */}
            {/* ------------------------------------------------------------- */}
            <div className="relative flex flex-col items-center justify-center z-20 my-4 lg:my-0">
              {/* Outer Vibrant Glowing Blue Ring */}
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-[3px] border-sky-500 bg-white shadow-[0_0_45px_rgba(56,189,248,0.45),inset_0_0_20px_rgba(56,189,248,0.15)] flex flex-col items-center justify-center relative transition-transform hover:scale-105">
                {/* Top icon badge anchored to the upper rim of the ring */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-sky-500 shadow-md flex items-center justify-center">
                  {selectedFlow === 'drive' && (
                    <span className="text-emerald-500 font-bold text-xs">▲</span>
                  )}
                  {selectedFlow === 'linkedin' && (
                    <span className="text-blue-600 font-bold text-xs">in</span>
                  )}
                  {selectedFlow === 'slack' && (
                    <span className="text-amber-500 font-bold text-xs">#</span>
                  )}
                </div>

                {/* Center Content: Clean white document preview card */}
                <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl shadow-sm flex flex-col items-center w-24">
                  <div className="w-7 h-8 bg-white border border-slate-300 rounded shadow-xs flex flex-col justify-center p-1 gap-1">
                    <span className="w-full h-1 bg-sky-400 rounded-full" />
                    <span className="w-3/4 h-1 bg-slate-300 rounded-full" />
                    <span className="w-1/2 h-1 bg-slate-300 rounded-full" />
                  </div>
                </div>

                {/* Bottom Badge Inside the Ring */}
                <div className="mt-2.5">
                  <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full shadow-xs">
                    {flowOptions[selectedFlow].badge}
                  </span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Right Connecting Beam (Desktop) */}
            {/* ------------------------------------------------------------- */}
            <div className="hidden lg:flex items-center w-16 relative">
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 70 20">
                <line
                  x1="0"
                  y1="10"
                  x2="70"
                  y2="10"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="animate-flow-beam"
                />
                <circle cx="35" cy="10" r="3" fill="#0284c7" />
              </svg>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Right Column: Status Card with Ghost Pills */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col items-center lg:items-start space-y-2 w-full lg:w-auto z-10">
              {/* Ghost Pill Above */}
              <div className="text-[11px] text-slate-400 opacity-40 font-medium px-4 py-1">
                {flowOptions[selectedFlow].title}...
              </div>

              {/* Main Active Card with Vivid Blue Border */}
              <div className="bg-white rounded-2xl border-2 border-sky-500 shadow-xl shadow-sky-500/10 p-4 w-full sm:w-72 text-left">
                <div className="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span>{flowOptions[selectedFlow].title}</span>
                  <CheckCircle2 className="w-4 h-4 text-sky-500" />
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                    <span className="block text-[10px] text-slate-500">Documents</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {flowOptions[selectedFlow].docCount}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                    <span className="block text-[10px] text-slate-500">Spreadsheets</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {flowOptions[selectedFlow].sheetCount}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                    <span className="block text-[10px] text-slate-500">Overrides</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {flowOptions[selectedFlow].overrideCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ghost Pill Below */}
              <div className="text-[11px] text-slate-400 opacity-40 font-medium px-4 py-1">
                {flowOptions[selectedFlow].title}...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PRODUCT PILLARS SECTION (EXACT DESIGN MATCH) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-6">
        {/* Section Heading */}
        <div className="text-left mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Product{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600">
              Pillars
            </span>
          </h2>
          <p className="mt-2.5 text-slate-500 text-sm sm:text-base font-normal">
            Mizu is the AI that turns your ideas into automations, without a single line of code.
          </p>
        </div>

        {/* Bento Grid: 2 Large Cards on Top, 2 Cards on Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* ------------------------------------------------------------- */}
          {/* CARD 1: AI-FIRST */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#f8fafc] rounded-[32px] border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group">
            {/* Visual 3D Layered Mockup */}
            <div className="relative min-h-[260px] sm:min-h-[300px] flex flex-col items-center justify-center p-4">
              {/* Neumorphic / Glass Backdrop Shape */}
              <div className="absolute inset-x-8 inset-y-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] pointer-events-none" />

              {/* Floating Top Pill */}
              <div className="relative z-10 mb-3 bg-white border border-sky-400/80 shadow-md shadow-sky-500/10 rounded-full px-4 py-1.5 text-xs text-slate-800 font-medium flex items-center gap-1.5">
                <span className="text-sky-500">✦</span>
                <span>Notify me on Slack when a task is marked urg...</span>
              </div>

              {/* Floating Dark AI Terminal Card */}
              <div className="relative z-10 w-full max-w-sm bg-[#18181f] text-white rounded-2xl p-4 shadow-2xl border border-slate-700/60 text-xs">
                <p className="text-slate-400 text-[11px] mb-1">
                  Notify whenever a task is marked urgent.
                </p>
                <p className="text-slate-200 text-xs font-normal leading-relaxed">
                  Watch Slack for tasks whose priority/status changes to Urgent. Post to Slack.
                </p>

                {/* Bottom Card Controls */}
                <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-slate-400">AI Prompt Ready</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Mic className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">
                      &gt;
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card Meta */}
            <div className="mt-6 pt-4 border-t border-slate-200/70">
              <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center mb-3 shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI-First</h3>
              <p className="text-sm text-slate-500 mt-1 font-normal">
                Mizu understands what you mean, not just what you say.
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 2: NO CODE */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#f8fafc] rounded-[32px] border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group">
            {/* Visual Workflow Builder Canvas Graphic */}
            <div className="relative min-h-[260px] sm:min-h-[300px] flex flex-col items-center justify-center p-2 bg-dot-grid rounded-2xl">
              {/* Floating Dark Top Toolbar */}
              <div className="w-48 bg-[#18181f] rounded-full px-3 py-1 text-[11px] text-slate-400 flex items-center justify-between mb-4 border border-slate-800 shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[10px] text-slate-300 font-mono">Workflow Canvas</span>
                <Sliders className="w-3 h-3 text-slate-400" />
              </div>

              {/* Node Diagram Elements */}
              <div className="w-full max-w-sm space-y-3 relative">
                {/* Node 1: Urgent Task Check */}
                <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <div>
                      <span className="font-bold text-slate-800 text-[11px] block">Urgent Task Check</span>
                      <span className="text-[10px] text-slate-400">Condition: Priority == 'Urgent'</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>

                {/* Connecting SVG Branch */}
                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-6 bg-sky-400 animate-pulse" />
                </div>

                {/* Node 2: Slack Agent */}
                <div className="bg-white rounded-xl border-2 border-sky-400 p-2.5 shadow-md text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                      #
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-[11px] block">Slack Agent</span>
                      <span className="text-[10px] text-slate-500">Post alert to #urgent-tasks</span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-sky-500" />
                </div>
              </div>
            </div>

            {/* Bottom Card Meta */}
            <div className="mt-6 pt-4 border-t border-slate-200/70">
              <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center mb-3 shadow-xs">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">No Code</h3>
              <p className="text-sm text-slate-500 mt-1 font-normal">
                Describe your flow — Mizu builds it.
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 3: INSTANT SETUP */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#f8fafc] rounded-[32px] border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group">
            {/* Visual Central Black Hub with Orbiting App Badges */}
            <div className="relative min-h-[220px] flex items-center justify-center">
              {/* Central Black Switch Hub */}
              <div className="w-16 h-16 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white fill-white" />
              </div>

              {/* Orbiting App Pills */}
              {/* Left: Gmail */}
              <div className="absolute left-6 sm:left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-lg flex items-center justify-center text-red-600 font-bold text-sm">
                M
              </div>

              {/* Left-top: Drive */}
              <div className="absolute left-16 sm:left-24 top-6 w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-emerald-500 font-bold text-xs">
                ▲
              </div>

              {/* Right: Slack */}
              <div className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-lg flex items-center justify-center text-amber-500 font-bold text-sm">
                #
              </div>

              {/* Right-bottom: Notion */}
              <div className="absolute right-16 sm:right-24 bottom-6 w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-900 font-bold text-xs">
                N
              </div>

              {/* Orbit connecting circle */}
              <div className="absolute w-48 h-48 rounded-full border border-dashed border-slate-300 pointer-events-none" />
            </div>

            {/* Bottom Card Meta */}
            <div className="mt-6 pt-4 border-t border-slate-200/70">
              <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center mb-3 shadow-xs">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Instant Setup</h3>
              <p className="text-sm text-slate-500 mt-1 font-normal">
                Connect your everyday tools in seconds without writing API code.
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 4: VISUAL CANVAS & LIVE EXECUTION */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#f8fafc] rounded-[32px] border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group">
            {/* Visual Canvas with Zoom Controls & Go Live Button */}
            <div className="relative min-h-[220px] bg-dot-grid rounded-2xl p-4 flex flex-col justify-between">
              {/* Top Controls Toolbar */}
              <div className="flex items-center justify-between">
                {/* Mini Canvas Toolbar */}
                <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 shadow-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.min(z + 0.1, 1.3))}
                    className="p-1 hover:bg-slate-100 rounded"
                    title="Zoom in"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.max(z - 0.1, 0.8))}
                    className="p-1 hover:bg-slate-100 rounded"
                    title="Zoom out"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-px h-3 bg-slate-200 mx-0.5" />
                  <button type="button" className="p-1 hover:bg-slate-100 rounded">
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button type="button" className="p-1 hover:bg-slate-100 rounded">
                    <Lock className="w-3 h-3" />
                  </button>
                </div>

                {/* Go Live Glowing Blue Pill Button */}
                <button
                  type="button"
                  onClick={() => setIsLiveActive(!isLiveActive)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                    isLiveActive
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Go Live</span>
                </button>
              </div>

              {/* Canvas Card: Notification Slack */}
              <div
                className="mt-4 bg-white border border-slate-200 rounded-xl p-3 shadow-md w-60 mx-auto transition-transform"
                style={{ transform: `scale(${zoomScale})` }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-xs text-slate-800">Notification • Slack</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Stay updated with real-time Slack notifications
                </p>
              </div>
            </div>

            {/* Bottom Card Meta */}
            <div className="mt-6 pt-4 border-t border-slate-200/70">
              <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center mb-3 shadow-xs">
                <Sliders className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Visual Canvas</h3>
              <p className="text-sm text-slate-500 mt-1 font-normal">
                Inspect, debug, and monitor your automations executing in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-[-2px]">
            <span className="w-2 h-3 bg-slate-900 rounded-full rotate-[-15deg]" />
            <span className="w-2 h-3.5 bg-slate-900 rounded-full" />
            <span className="w-2 h-3 bg-slate-900 rounded-full rotate-[15deg]" />
          </div>
          <span className="font-bold text-slate-900">mizu</span>
          <span className="text-slate-400">© 2026. All rights reserved.</span>
        </div>

        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
            App Dashboard
          </Link>
          <Link href="/dashboard/warmup" className="hover:text-slate-900 transition-colors">
            Warmup Fleet
          </Link>
          <a href="#privacy" className="hover:text-slate-900 transition-colors">
            Privacy
          </a>
          <a href="#terms" className="hover:text-slate-900 transition-colors">
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}

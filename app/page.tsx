'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Flame,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Send,
  Check,
  Lock,
  Globe,
  Menu,
  X,
  Building2,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeChatTab, setActiveChatTab] = useState<'warmup' | 'verifier' | 'tracker'>('warmup');
  const [chatInput, setChatInput] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

  // Interactive AI Copilot chat state
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; badge?: string; time: string }>>([
    {
      sender: 'ai',
      text: "Hello! I am your ERHA Technologies Email AI Copilot. I automatically monitor your inbox placement, rescue emails landing in spam, and optimize your cold outreach deliverability in real-time.",
      badge: 'Deliverability Engine Online',
      time: 'Just now',
    },
    {
      sender: 'user',
      text: "How do I ensure my 10 Google Workspace mailboxes achieve 99% inbox placement without getting blocked?",
      time: 'Just now',
    },
    {
      sender: 'ai',
      text: "I have configured a progressive Gemini AI warmup schedule across your 10 mailboxes: starting with 5 humanized peer-to-peer dialogues daily, ramping to 40. Any cold emails caught in Spam or Promotions are automatically extracted, marked 'Important', and replied to within 3 minutes.",
      badge: '99.4% Inbox Placement Active',
      time: 'Just now',
    },
  ]);

  const handlePromptClick = (prompt: string, aiReply: string, badge?: string) => {
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: prompt, time: 'Just now' },
      { sender: 'ai', text: aiReply, badge: badge || 'Autonomous AI Synced', time: 'Just now' },
    ]);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput('');
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Just now' },
      {
        sender: 'ai',
        text: `ERHA AI Copilot has analyzed "${userText}". Your SPF, DKIM, and DMARC records are validated. Real-time telemetry tracking pixel is active on all outgoing emails with 100% open-rate detection.`,
        badge: 'Reputation Score: 99.8%',
        time: 'Just now',
      },
    ]);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06182c] via-[#09294d] to-[#051628] text-white selection:bg-[#07B4D4] selection:text-white font-sans relative overflow-x-hidden">
      {/* ========================================================================= */}
      {/* Dynamic Ambient Blur Glows (#07B4D4 & #2784DC HD Frosted Touch) */}
      {/* ========================================================================= */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-tr from-[#07B4D4]/45 via-[#2784DC]/50 to-transparent rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed top-1/3 right-0 w-[750px] h-[750px] bg-gradient-to-bl from-[#2784DC]/50 via-[#07B4D4]/40 to-transparent rounded-full blur-[170px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-t from-[#07B4D4]/40 via-[#2784DC]/40 to-transparent rounded-full blur-[190px] pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#06182c]/80 border-b border-white/15 shadow-xl shadow-black/20 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 group-hover:border-[#07B4D4]/60 transition-all flex items-center justify-center shadow-lg shadow-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/erha-logo.png"
                alt="ERHA Technologies"
                className="h-7 w-auto object-contain drop-shadow"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-[#07B4D4] transition-colors flex items-center gap-1.5">
                <span>ERHA TECHNOLOGIES</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#07B4D4] -mt-0.5">
                Email Suite AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-white/80">
            <a href="#features" className="hover:text-[#07B4D4] transition-colors">
              Product
            </a>
            <a href="#how-it-works" className="hover:text-[#07B4D4] transition-colors">
              How It Works
            </a>
            <a href="#about-us" className="hover:text-[#07B4D4] transition-colors">
              About Us
            </a>
            <a href="#pricing" className="hover:text-[#07B4D4] transition-colors">
              Pricing
            </a>
            <a href="#privacy" className="hover:text-[#07B4D4] transition-colors">
              Privacy Policy
            </a>
            <a href="#contact" className="hover:text-[#07B4D4] transition-colors">
              Contact
            </a>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="px-3.5 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Mail className="w-3.5 h-3.5 text-[#07B4D4]" />
              <span>Email Tracker</span>
            </Link>

            <Link
              href="/dashboard/warmup"
              className="px-3.5 py-2 text-xs font-bold text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Warmup Fleet</span>
            </Link>

            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-[#07B4D4] to-[#2784DC] hover:from-[#05a0bd] hover:to-[#1e72c2] rounded-xl shadow-lg shadow-[#07B4D4]/30 transition-all flex items-center gap-1.5 hover:scale-[1.02] border border-white/20"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl bg-[#06182c]/95 border-b border-white/20 shadow-2xl">
            <div className="flex flex-col space-y-2 text-sm font-semibold text-white/80">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 hover:text-[#07B4D4]"
              >
                Product Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 hover:text-[#07B4D4]"
              >
                How It Works
              </a>
              <a
                href="#about-us"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 hover:text-[#07B4D4]"
              >
                About ERHA Technologies
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 hover:text-[#07B4D4]"
              >
                Pricing Tiers
              </a>
              <a
                href="#privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 hover:text-[#07B4D4]"
              >
                Privacy Policy
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 hover:text-[#07B4D4]"
              >
                Contact Us
              </a>
            </div>

            <div className="pt-3 border-t border-white/15 flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 text-center rounded-xl bg-white/10 text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#07B4D4]" />
                <span>Open Email Tracker</span>
              </Link>
              <Link
                href="/dashboard/warmup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 text-center rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/30 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Open Email Warmup</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION & CENTER AI CHAT VIEW (INSTANTLY.IO STYLE) */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl bg-gradient-to-r from-[#07B4D4]/20 to-[#2784DC]/20 border border-[#07B4D4]/40 text-cyan-200 text-xs font-bold uppercase tracking-wider mb-6 shadow-lg shadow-[#07B4D4]/10">
          <Sparkles className="w-3.5 h-3.5 text-[#07B4D4]" />
          <span>Next-Gen Enterprise Deliverability • Built by ERHA Technologies</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Scale Your Cold Outreach with{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#07B4D4] via-[#52b2ff] to-[#2784DC]">
            Autonomous AI Warmup
          </span>{' '}
          & Real-Time Tracking.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed">
          Never land in spam again. 10x your open rates with peer-to-peer Gemini AI email discussions, 100% pixel telemetry, and automated lead list verification.
        </p>

        {/* Hero CTA Button Cluster */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#07B4D4] to-[#2784DC] text-white font-black text-sm sm:text-base shadow-xl shadow-[#07B4D4]/35 hover:shadow-[#2784DC]/50 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 border border-white/20"
          >
            <Mail className="w-5 h-5 text-white" />
            <span>Launch Email Tracker</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>

          <Link
            href="/dashboard/warmup"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
          >
            <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>Launch AI Warmup Fleet</span>
          </Link>
        </div>

        <p className="mt-4 text-xs font-semibold text-white/70 flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Check className="w-4 h-4 text-[#07B4D4] stroke-[3]" /> 100% Free Setup
          </span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Check className="w-4 h-4 text-[#07B4D4] stroke-[3]" /> Zero DNS Friction
          </span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Check className="w-4 h-4 text-[#07B4D4] stroke-[3]" /> Google Apps Script & SMTP Ready
          </span>
        </p>

        {/* ========================================================================= */}
        {/* CENTER INTERACTIVE AI CHAT VIEW (LIKE INSTANTLY.IO - FROSTED HD GLASS) */}
        {/* ========================================================================= */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-1 bg-gradient-to-r from-[#07B4D4]/70 via-[#2784DC]/60 to-[#07B4D4]/50 shadow-2xl shadow-[#07B4D4]/25">
          <div className="backdrop-blur-2xl bg-[#06192e]/90 rounded-[22px] border border-white/15 overflow-hidden text-left shadow-2xl">
            {/* Terminal / Chat Header */}
            <div className="px-5 py-4 backdrop-blur-md bg-white/[0.06] border-b border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#07B4D4] to-[#2784DC] text-white flex items-center justify-center font-black shadow-lg shadow-[#07B4D4]/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>ERHA AI Deliverability Copilot</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h3>
                  <p className="text-[11px] text-white/60 font-medium">
                    Autonomous Reputation & Pixel Engine • Active Session
                  </p>
                </div>
              </div>

              {/* Chat Mode Pill Selectors */}
              <div className="flex items-center backdrop-blur-md bg-white/[0.08] p-1 rounded-xl border border-white/15 text-xs">
                <button
                  onClick={() => setActiveChatTab('warmup')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    activeChatTab === 'warmup'
                      ? 'bg-gradient-to-r from-[#07B4D4] to-[#2784DC] text-white shadow-md shadow-[#07B4D4]/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Warmup AI</span>
                </button>

                <button
                  onClick={() => setActiveChatTab('verifier')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    activeChatTab === 'verifier'
                      ? 'bg-gradient-to-r from-[#07B4D4] to-[#2784DC] text-white shadow-md shadow-[#07B4D4]/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>List Verifier</span>
                </button>

                <button
                  onClick={() => setActiveChatTab('tracker')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    activeChatTab === 'tracker'
                      ? 'bg-gradient-to-r from-[#07B4D4] to-[#2784DC] text-white shadow-md shadow-[#07B4D4]/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Pixel Telemetry</span>
                </button>
              </div>
            </div>

            {/* Live Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 backdrop-blur-md bg-white/[0.03] border-b border-white/10 text-xs text-white">
              <div className="p-2.5 rounded-xl backdrop-blur-md bg-white/[0.06] border border-white/10 flex items-center justify-between shadow-xs">
                <span className="text-white/60">Inbox Placement:</span>
                <span className="font-bold text-emerald-400">99.4%</span>
              </div>
              <div className="p-2.5 rounded-xl backdrop-blur-md bg-white/[0.06] border border-white/10 flex items-center justify-between shadow-xs">
                <span className="text-white/60">Avg Open Rate:</span>
                <span className="font-bold text-cyan-300">74.2%</span>
              </div>
              <div className="p-2.5 rounded-xl backdrop-blur-md bg-white/[0.06] border border-white/10 flex items-center justify-between shadow-xs">
                <span className="text-white/60">Spam Rescue:</span>
                <span className="font-bold text-amber-300">Instant AI</span>
              </div>
              <div className="p-2.5 rounded-xl backdrop-blur-md bg-white/[0.06] border border-white/10 flex items-center justify-between shadow-xs">
                <span className="text-white/60">Response Time:</span>
                <span className="font-bold text-white">&lt;14ms</span>
              </div>
            </div>

            {/* Chat Conversation Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[380px] overflow-y-auto">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-[#07B4D4] to-[#2784DC] text-white rounded-tr-xs shadow-[#07B4D4]/25'
                        : 'backdrop-blur-md bg-white/[0.08] border border-white/15 text-white rounded-tl-xs'
                    }`}
                  >
                    {m.badge && (
                      <div className="mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#07B4D4]/25 text-cyan-200 border border-[#07B4D4]/40">
                        {m.badge}
                      </div>
                    )}
                    <p>{m.text}</p>
                    <span
                      className={`block mt-2 text-[10px] text-right ${
                        m.sender === 'user' ? 'text-cyan-100' : 'text-white/50'
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Interactive Prompt Pills */}
            <div className="px-4 py-2.5 backdrop-blur-md bg-white/[0.03] border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
              <span className="text-[11px] font-bold text-cyan-300 uppercase shrink-0">Try Asking:</span>
              <button
                type="button"
                onClick={() =>
                  handlePromptClick(
                    'How does ERHA Technologies AI rescue emails from Gmail spam folders?',
                    'Our peer network periodically inspects recipient spam bins via IMAP/API. When an email is spotted, the AI marks it as "Not Spam", stars it, moves it directly to the primary inbox, and writes a contextual human-like reply to permanently train spam filters.',
                    'Spam Rescue Simulation Active'
                  )
                }
                className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.16] text-white/90 hover:text-white border border-white/15 hover:border-[#07B4D4]/60 transition-all shrink-0 cursor-pointer shadow-xs"
              >
                🔥 How does AI spam rescue work?
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePromptClick(
                    'Can I track emails sent from Gmail and Google Apps Script directly?',
                    'Yes! ERHA EmailTracker provides a 1-click Google Apps Script project. Just paste your API key, and every outgoing email from Gmail will automatically inject an invisible 1x1 telemetry pixel and branded redirect tracking links.',
                    'Google Apps Script Sync 100%'
                  )
                }
                className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.16] text-white/90 hover:text-white border border-white/15 hover:border-[#07B4D4]/60 transition-all shrink-0 cursor-pointer shadow-xs"
              >
                ✉ Track via Google Apps Script
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePromptClick(
                    'Verify 1,000 cold outreach emails before I hit send.',
                    'List Verifier check complete: 982 Valid MX domains, 12 Catch-all detected, 6 Disposable inboxes flagged and quarantined. Your projected bounce rate is under 0.8%!',
                    'Bounce Rate: < 0.8%'
                  )
                }
                className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.16] text-white/90 hover:text-white border border-white/15 hover:border-[#07B4D4]/60 transition-all shrink-0 cursor-pointer shadow-xs"
              >
                🛡️ Check List Deliverability
              </button>
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendChat} className="p-3 backdrop-blur-md bg-white/[0.05] border-t border-white/15 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask ERHA AI Copilot anything about deliverability, warmup, or tracking..."
                className="flex-1 backdrop-blur-md bg-white/[0.08] border border-white/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#07B4D4] transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#07B4D4] to-[#2784DC] text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity shrink-0 shadow-lg shadow-[#07B4D4]/25 cursor-pointer border border-white/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DETAILED STEP-BY-STEP GUIDE: HOW TO USE THE SOFTWARE */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/15">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-cyan-200 bg-gradient-to-r from-[#07B4D4]/20 to-[#2784DC]/20 px-3.5 py-1 rounded-full border border-[#07B4D4]/40 backdrop-blur-md">
            Step-by-Step Software Blueprint
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            How to Use ERHA Email Suite in 4 Easy Steps
          </h2>
          <p className="mt-4 text-white/75 text-base sm:text-lg font-medium">
            From setup to scaling: maximize deliverability, protect sender reputation, and get complete visibility on every email sent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 hover:border-[#07B4D4]/60 hover:bg-white/[0.10] transition-all group flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#07B4D4]/15 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#07B4D4]/25 to-[#2784DC]/25 text-cyan-300 border border-[#07B4D4]/40 flex items-center justify-center font-black text-lg mb-5 shadow-lg shadow-[#07B4D4]/20">
                01
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#07B4D4] transition-colors">
                Connect Your Mailboxes
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed">
                Connect your Google Workspace, Microsoft Outlook, or custom SMTP accounts in 60 seconds. Use our Google Apps Script integration for zero-config Gmail automation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-cyan-300 font-bold">
              <span>Google & SMTP Ready</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 hover:border-[#07B4D4]/60 hover:bg-white/[0.10] transition-all group flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#2784DC]/15 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#07B4D4]/25 to-[#2784DC]/25 text-cyan-300 border border-[#07B4D4]/40 flex items-center justify-center font-black text-lg mb-5 shadow-lg shadow-[#07B4D4]/20">
                02
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#07B4D4] transition-colors">
                Verify Recipient Lists
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed">
                Upload your cold leads into our built-in Email Verifier engine. Check DNS MX records, syntax, and disposable domains to keep bounce rates under 1%.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-cyan-300 font-bold">
              <span>Zero Bounce Guarantee</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 hover:border-[#07B4D4]/60 hover:bg-white/[0.10] transition-all group flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 to-amber-600/25 text-amber-300 border border-amber-400/40 flex items-center justify-center font-black text-lg mb-5 shadow-lg shadow-amber-500/20">
                03
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Activate AI Peer Warmup
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed">
                Our Gemini AI engine exchanges natural, varied conversations with active mailboxes in our fleet. Automatically pulls emails out of spam folders and marks them important.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-300 font-bold">
              <span>Spam Rescue Active</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 hover:border-[#07B4D4]/60 hover:bg-white/[0.10] transition-all group flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#07B4D4]/15 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#07B4D4]/25 to-[#2784DC]/25 text-cyan-300 border border-[#07B4D4]/40 flex items-center justify-center font-black text-lg mb-5 shadow-lg shadow-[#07B4D4]/20">
                04
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#07B4D4] transition-colors">
                Track Opens & Clicks Live
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed">
                Watch real-time opens, clicks, devices, and engagement timelines. Instant notifications alert you the exact moment a prospect reads your proposal.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-cyan-300 font-bold">
              <span>Sub-15ms Telemetry</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PRODUCT CORE FEATURES */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-cyan-200 bg-gradient-to-r from-[#07B4D4]/20 to-[#2784DC]/20 px-3.5 py-1 rounded-full border border-[#07B4D4]/40 backdrop-blur-md">
            Enterprise Feature Suite
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Everything Required for High-Volume Cold Outreach
          </h2>
          <p className="mt-4 text-white/75 text-base sm:text-lg">
            A cohesive platform replacing 4 separate SaaS subscriptions with one intelligent unified system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 hover:border-[#07B4D4]/60 shadow-2xl transition-all hover:bg-white/[0.10]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#07B4D4]/25 to-[#2784DC]/25 text-cyan-300 border border-[#07B4D4]/40 flex items-center justify-center mb-6 shadow-lg shadow-[#07B4D4]/20">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Invisible Pixel Tracking</h3>
            <p className="mt-3 text-sm text-white/75 leading-relaxed">
              Ultra-lightweight 1x1 transparent tracking pixels embedded automatically. Accurately flags first open, total read counts, and real-time link click timestamps.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-white/85 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#07B4D4]" /> Custom tracking domain support
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#07B4D4]" /> Bot filter to avoid false open triggers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#07B4D4]" /> Real-time webhook & browser alerts
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 hover:border-amber-400/60 shadow-2xl transition-all hover:bg-white/[0.10]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 to-amber-600/25 text-amber-300 border border-amber-400/40 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Gemini AI Mailbox Warmup</h3>
            <p className="mt-3 text-sm text-white/75 leading-relaxed">
              Peer-to-peer network warmups with Google DeepMind Gemini generated discussions. Ramps sender reputation progressively while keeping spam rates at 0%.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-white/85 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300" /> Automated Spam Folder rescue
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300" /> Targeted industry & ESP warmup pools
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300" /> Smart reply rate tuning (30% - 60%)
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 hover:border-[#07B4D4]/60 shadow-2xl transition-all hover:bg-white/[0.10]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#07B4D4]/25 to-[#2784DC]/25 text-cyan-300 border border-[#07B4D4]/40 flex items-center justify-center mb-6 shadow-lg shadow-[#07B4D4]/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Lead Verifier & Clean Engine</h3>
            <p className="mt-3 text-sm text-white/75 leading-relaxed">
              Never burn an outreach domain on stale leads. Real-time DNS MX lookups, catch-all filters, and spam trap detectors verify thousands of leads in seconds.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-white/85 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#07B4D4]" /> Bulk CSV & TXT list cleaning
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#07B4D4]" /> Disposable domain blacklist check
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#07B4D4]" /> Deliverability health report exports
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ABOUT US: ERHA TECHNOLOGIES (COMPANY SPOTLIGHT) */}
      {/* ========================================================================= */}
      <section id="about-us" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/15">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Company Story & Vision */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-200 bg-gradient-to-r from-[#07B4D4]/20 to-[#2784DC]/20 px-3.5 py-1 rounded-full border border-[#07B4D4]/40 backdrop-blur-md">
              About ERHA Technologies
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Pioneering Enterprise AI Infrastructure & Cloud Communications
            </h2>

            <p className="text-base text-white/80 leading-relaxed">
              <strong className="text-white font-bold">ERHA Technologies</strong> is an enterprise software and artificial intelligence development firm committed to building reliable, high-performance digital engines. Founded with the mission to solve modern email deliverability barriers, we engineer tools that empower sales agencies, growth teams, and founders to connect with confidence.
            </p>

            <p className="text-sm text-white/70 leading-relaxed">
              Traditional email services rely on outdated heuristics that cause 40% of authentic sales emails to land in spam. ERHA Technologies solves this through autonomous peer-to-peer AI conversation models, real-time edge telemetry, and zero-compromise security protocols.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/15">
                <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#07B4D4] to-cyan-200">10M+</span>
                <p className="text-xs text-white/70 font-semibold mt-1">Emails Tracked</p>
              </div>

              <div className="p-4 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/15">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">99.4%</span>
                <p className="text-xs text-white/70 font-semibold mt-1">Inbox Placement</p>
              </div>

              <div className="p-4 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/15 col-span-2 sm:col-span-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-300">&lt;15ms</span>
                <p className="text-xs text-white/70 font-semibold mt-1">Edge Latency</p>
              </div>
            </div>
          </div>

          {/* Right Column: Company Architectural Pillars */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 shadow-xl hover:border-[#07B4D4]/60 hover:bg-white/[0.10] transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#07B4D4]/25 to-[#2784DC]/25 text-cyan-300 border border-[#07B4D4]/40">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Bank-Grade Data Security</h4>
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                AES-256 encrypted credentials, tokenized OAuth2 connections, and isolated Supabase database partitions ensure absolute privacy.
              </p>
            </div>

            <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 shadow-xl hover:border-[#07B4D4]/60 hover:bg-white/[0.10] transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#07B4D4]/25 to-[#2784DC]/25 text-cyan-300 border border-[#07B4D4]/40">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Global Edge Network</h4>
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                Distributed edge workers power tracking endpoints across 300+ worldwide regions to guarantee lightning-fast pixel renders without email latency.
              </p>
            </div>

            <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 shadow-xl hover:border-[#07B4D4]/60 hover:bg-white/[0.10] transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#07B4D4]/25 to-[#2784DC]/25 text-cyan-300 border border-[#07B4D4]/40">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Enterprise Engineering Standards</h4>
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                Crafted by ERHA Technologies software architects with Next.js 14, TypeScript strict typing, and high-concurrency background job dispatchers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INSTANTLY.IO STYLE TRANSPARENT PRICING */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/15">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-cyan-200 bg-gradient-to-r from-[#07B4D4]/20 to-[#2784DC]/20 px-3.5 py-1 rounded-full border border-[#07B4D4]/40 backdrop-blur-md">
            Simple Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Predictable Plans for Growing Teams
          </h2>
          <p className="mt-4 text-white/75 text-base sm:text-lg">
            No hidden limits. Start free, upgrade when you scale.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl backdrop-blur-xl bg-white/[0.08] border border-white/20 text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-[#07B4D4] to-[#2784DC] text-white shadow-lg shadow-[#07B4D4]/30'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-cyan-200 text-[10px] font-black uppercase border border-white/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Starter */}
          <div className="p-8 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 shadow-2xl hover:bg-white/[0.09] transition-all flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Starter</h3>
              <p className="text-xs text-white/60 mt-1">Perfect for solo founders & testing campaigns.</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-white">$0</span>
                <span className="text-white/60 text-xs font-semibold">/ month</span>
              </div>

              <ul className="mt-8 space-y-3.5 text-xs text-white/80">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0" /> Up to 5,000 tracked emails / month
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0" /> 1 Mailbox Warmup Active
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0" /> Standard Google Apps Script plugin
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0" /> 500 email verifications / month
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard"
              className="mt-8 w-full py-3.5 px-4 rounded-xl backdrop-blur-md bg-white/15 hover:bg-white/25 text-white font-bold text-xs text-center transition-colors block border border-white/20"
            >
              Get Started Free
            </Link>
          </div>

          {/* Plan 2: Growth Pro (Featured) */}
          <div className="p-8 rounded-3xl backdrop-blur-2xl bg-gradient-to-b from-[#07B4D4]/25 via-[#2784DC]/20 to-white/[0.08] border-2 border-[#07B4D4] shadow-2xl shadow-[#07B4D4]/30 flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#07B4D4] to-[#2784DC] text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-[#07B4D4]/40 border border-white/20">
              Most Popular
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Growth AI Pro</h3>
              <p className="text-xs text-white/60 mt-1">For cold outbound teams scaling pipeline.</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#07B4D4] to-cyan-200">
                  {billingCycle === 'yearly' ? '$29' : '$39'}
                </span>
                <span className="text-white/60 text-xs font-semibold">/ month</span>
              </div>

              <ul className="mt-8 space-y-3.5 text-xs text-white">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0 stroke-[3]" /> <strong>Unlimited</strong> tracked emails
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0 stroke-[3]" /> <strong>10 Mailboxes</strong> Warmup Fleet
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0 stroke-[3]" /> Gemini AI Automated Spam Rescue
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0 stroke-[3]" /> Custom Branded Tracking Domains
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0 stroke-[3]" /> 10,000 lead verifications / month
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard"
              className="mt-8 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#07B4D4] to-[#2784DC] text-white font-black text-xs text-center shadow-xl shadow-[#07B4D4]/35 hover:scale-[1.02] transition-all block border border-white/20"
            >
              Start Free Trial →
            </Link>
          </div>

          {/* Plan 3: Enterprise Fleet */}
          <div className="p-8 rounded-3xl backdrop-blur-xl bg-white/[0.06] border border-white/15 shadow-2xl hover:bg-white/[0.09] transition-all flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Scale Fleet</h3>
              <p className="text-xs text-white/60 mt-1">High volume agencies & outbound departments.</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  {billingCycle === 'yearly' ? '$79' : '$99'}
                </span>
                <span className="text-white/60 text-xs font-semibold">/ month</span>
              </div>

              <ul className="mt-8 space-y-3.5 text-xs text-white/80">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0" /> Unlimited mailboxes warmup pool
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0" /> Dedicated IP Reputation Warmup
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0" /> Unlimited Lead List Verification
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#07B4D4] shrink-0" /> Dedicated ERHA Engineering Slack channel
                </li>
              </ul>
            </div>

            <a
              href="#contact"
              className="mt-8 w-full py-3.5 px-4 rounded-xl backdrop-blur-md bg-white/15 hover:bg-white/25 text-white font-bold text-xs text-center transition-colors block border border-white/20"
            >
              Contact Enterprise
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PRIVACY POLICY & SECURITY SECTION */}
      {/* ========================================================================= */}
      <section id="privacy" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/15">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-cyan-200 bg-gradient-to-r from-[#07B4D4]/20 to-[#2784DC]/20 px-3.5 py-1 rounded-full border border-[#07B4D4]/40 backdrop-blur-md">
            Security & Trust
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Strict Privacy & Zero Data Monetization
          </h2>
          <p className="mt-4 text-white/75 text-base sm:text-lg">
            ERHA Technologies adheres to highest enterprise data confidentiality standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/15 shadow-xl space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#07B4D4]" />
              <span>Zero-Data Selling Guarantee</span>
            </h4>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              We never sell, rent, or share your email lists, recipient details, or tracking telemetry with third parties or data brokers. Your prospect data is strictly yours.
            </p>
          </div>

          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/15 shadow-xl space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span>Google API Limited Use Compliance</span>
            </h4>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              Our Google Workspace integrations strictly adhere to Google API Services User Data Policy, ensuring authorized access only for deliverability and tracking actions.
            </p>
          </div>

          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/15 shadow-xl space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-300" />
              <span>AES-256 Encryption in Transit & Rest</span>
            </h4>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              All app passwords, tokens, and mailbox configurations are encrypted using military-grade AES-256 protocols and stored on isolated Supabase servers.
            </p>
          </div>

          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/15 shadow-xl space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>GDPR & CAN-SPAM Certified Protocols</span>
            </h4>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              Built-in compliance options allow custom tracking domain masking, automated unsubscribes, and zero cookie persistence for anonymous recipient reads.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CONTACT US SECTION */}
      {/* ========================================================================= */}
      <section id="contact" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/15">
        <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 backdrop-blur-2xl bg-gradient-to-b from-white/[0.10] via-white/[0.06] to-[#07B4D4]/10 border border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#07B4D4]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-200 bg-gradient-to-r from-[#07B4D4]/20 to-[#2784DC]/20 px-3.5 py-1 rounded-full border border-[#07B4D4]/40 backdrop-blur-md">
              Get in Touch with ERHA Technologies
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Have Questions or Need an Enterprise Setup?
            </h2>
            <p className="mt-2 text-white/75 text-sm">
              Our engineering team responds within 2 hours.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="p-8 rounded-2xl backdrop-blur-xl bg-emerald-500/15 border border-emerald-400/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/25 text-emerald-300 flex items-center justify-center mx-auto font-bold">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-bold text-white">Message Received!</h3>
              <p className="text-sm text-white/80">
                Thank you for reaching out to ERHA Technologies. Our team will contact you shortly at <strong>{contactForm.email}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/90 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/[0.08] border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#07B4D4] transition-colors shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/90 mb-1.5">Your Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/[0.08] border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#07B4D4] transition-colors shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5">Subject</label>
                <select
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#08223f] border border-white/20 text-sm text-white focus:outline-none focus:border-[#07B4D4] transition-colors shadow-xs"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Enterprise Warmup Fleet">Enterprise Warmup Fleet</option>
                  <option value="Google Apps Script Setup">Google Apps Script Setup</option>
                  <option value="Custom Deliverability Audit">Custom Deliverability Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Tell us about your team size, mailbox count, or deliverability goals..."
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/[0.08] border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#07B4D4] transition-colors shadow-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#07B4D4] to-[#2784DC] text-white font-black text-sm shadow-xl shadow-[#07B4D4]/35 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <span>Submit Message to ERHA Technologies</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-white/70 gap-2">
            <span>Direct Support: <strong className="text-white">admin@erha.com</strong></span>
            <span>Headquarters: ERHA Technologies Development Lab</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. GLOBAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/15 backdrop-blur-2xl bg-[#040f1d]/95 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/erha-logo.png"
                  alt="ERHA Technologies"
                  className="h-7 w-auto object-contain drop-shadow"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-white tracking-tight">ERHA TECHNOLOGIES</span>
                <span className="text-[10px] uppercase font-bold text-[#07B4D4] tracking-wider">AI Email Suite</span>
              </div>
            </Link>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Engineered by ERHA Technologies. Delivering autonomous AI warmups, real-time pixel telemetry, and email verification for growth teams worldwide.
            </p>
            <p className="text-xs text-white/70">
              Contact: <strong className="text-white">admin@erha.com</strong>
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Dashboards</h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link href="/dashboard" className="hover:text-[#07B4D4] transition-colors">
                  Email Tracker Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/warmup" className="hover:text-[#07B4D4] transition-colors">
                  AI Warmup Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/verifier" className="hover:text-[#07B4D4] transition-colors">
                  Email Verifier Tool
                </Link>
              </li>
              <li>
                <Link href="/dashboard/api-keys" className="hover:text-[#07B4D4] transition-colors">
                  Google Apps Script Keys
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <a href="#how-it-works" className="hover:text-[#07B4D4] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#about-us" className="hover:text-[#07B4D4] transition-colors">
                  About ERHA Technologies
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#07B4D4] transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#07B4D4] transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Legal & Trust</h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <a href="#privacy" className="hover:text-[#07B4D4] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#07B4D4] transition-colors">
                  Google API Compliance
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#07B4D4] transition-colors">
                  Data Security Standards
                </a>
              </li>
              <li>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Systems Operational
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/15 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© 2026 ERHA Technologies. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>Enterprise Deliverability Infrastructure</span>
            <span>•</span>
            <span>Made with precision by ERHA Technologies</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

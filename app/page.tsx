'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  Flame,
  Zap,
  ShieldCheck,
  MousePointerClick,
  Eye,
  Inbox,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Lock,
  Globe,
  Radio,
} from 'lucide-react';

export default function RootPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Ambient Glow Orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-48 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>EmailTracker AI</span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                v2.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Enterprise Deliverability & Tracking Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-medium">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping" />
            System Live & Connected
          </span>
        </div>
      </header>

      {/* Center Selection Section */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 py-8 md:py-12 my-auto">
        {/* Title & Prompt */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium mb-4 shadow-inner">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Select Your Destination Workspace</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Which dashboard would you like to open?
          </h2>
          <p className="text-sm md:text-base text-slate-400 mt-3.5">
            Choose between live email tracking analytics or the automated AI mailbox reputation warmup engine.
          </p>
        </div>

        {/* 2 Massive Selection Cards / Popups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Email Tracker Dashboard */}
          <Link
            href="/dashboard"
            className="group relative flex flex-col justify-between p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 hover:border-blue-500/80 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 backdrop-blur-xl"
          >
            {/* Gradient Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 group-hover:h-1.5 transition-all" />

            <div>
              {/* Header inside Card */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-md">
                  <Mail className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Live Opens & Clicks
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Email Tracker
              </h3>
              <p className="text-xs font-semibold text-blue-400/90 mt-1 uppercase tracking-wider">
                Pixel Tracking • Link Monitor • Verifier
              </p>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Track exactly when recipients open your emails and click your proposal links with zero latency. Includes real-time fake/disposable email detection.
              </p>

              {/* Feature Highlights Checklist */}
              <div className="mt-6 space-y-2.5 pt-6 border-t border-slate-800/80">
                <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Real-time 1x1 pixel email open tracking</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Link click counter & redirection analytics</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Fake & disposable email verifier (Bounce prevention)</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Google Apps Script & REST API ready</span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="mt-8 pt-4">
              <div className="w-full py-3.5 px-5 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all">
                <span>Open Email Tracker Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Email Warmup Dashboard */}
          <Link
            href="/dashboard/warmup"
            className="group relative flex flex-col justify-between p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 hover:border-amber-500/80 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1 backdrop-blur-xl"
          >
            {/* Gradient Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-400 group-hover:h-1.5 transition-all" />

            <div>
              {/* Header inside Card */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-amber-500 group-hover:to-orange-600 group-hover:text-white transition-all shadow-md">
                  <Flame className="w-7 h-7 fill-current" />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini AI Warmup
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                Email Warmup
              </h3>
              <p className="text-xs font-semibold text-amber-400/90 mt-1 uppercase tracking-wider">
                Deliverability • Reputation • Spam Rescue
              </p>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Automatically build sender reputation and rescue emails from spam folders using human-like Gemini AI peer-to-peer mailbox conversations.
              </p>

              {/* Feature Highlights Checklist */}
              <div className="mt-6 space-y-2.5 pt-6 border-t border-slate-800/80">
                <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Connect Gmail App Passwords & Hostinger/Titan SMTP</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Contextual AI peer-to-peer replies & threads</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Automated Spam Rescue (moves emails to Inbox)</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Targeted Account Warmup & Health progression</span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="mt-8 pt-4">
              <div className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 group-hover:from-amber-400 group-hover:to-orange-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all">
                <span>Open Email Warmup Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center space-x-2">
          <span>© 2026 EmailTracker AI Platform.</span>
          <span>•</span>
          <span>All rights reserved.</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Lock className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Supabase Cloud Persistent
          </span>
          <span>•</span>
          <span className="flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Gemini 3.6 Flash Engine
          </span>
        </div>
      </footer>
    </main>
  );
}


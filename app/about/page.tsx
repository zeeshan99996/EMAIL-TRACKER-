'use client';

import React from 'react';
import Link from 'next/link';
import { WebsiteHeader } from '@/components/website-header';
import { WebsiteFooter } from '@/components/website-footer';
import {
  ShieldCheck,
  Zap,
  Building2,
  Users,
  Target,
  Award,
  Globe2,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020512] text-white selection:bg-[#53E2FE]/20 selection:text-[#53E2FE] flex flex-col justify-between">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at center, #53E2FE 0%, rgba(14,165,233,0.5) 45%, transparent 75%)',
          }}
        />
        <div
          className="absolute top-[40%] -left-[15%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-25"
          style={{
            background:
              'radial-gradient(ellipse at center, #0284c7 0%, rgba(83,226,254,0.4) 50%, transparent 80%)',
          }}
        />
      </div>

      <WebsiteHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 sm:space-y-28">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#53E2FE]/10 border border-[#53E2FE]/30 text-[#53E2FE] text-xs sm:text-sm font-semibold shadow-[0_0_15px_rgba(83,226,254,0.2)]">
            <Sparkles className="w-4 h-4" />
            <span>Pioneering Next-Gen Deliverability</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Engineered for Perfect Deliverability.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#53E2FE] via-sky-300 to-white">
              Built by ERHA Technologies.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Mailify was conceived to solve the single greatest obstacle in modern outreach: getting your emails into the primary inbox and tracking engagement with zero delay.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* ABOUT THE SOFTWARE (MAILIFY) */}
        {/* ========================================================================= */}
        <section className="space-y-12">
          <div className="border-b border-slate-800 pb-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#53E2FE]">
              Software Architecture & Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              About Mailify 2.0
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-5 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                <strong className="text-white font-semibold">Mailify</strong> is an all-in-one email intelligence and deliverability infrastructure designed specifically for founders, sales teams, digital agencies, and high-volume senders.
              </p>
              <p>
                Modern mailbox providers (Google Workspace, Microsoft 365, Yahoo) enforce hyper-strict sender reputation algorithms. Even a few missed signals or unverified contacts can drop entire campaigns into the spam graveyard. Mailify counters this by providing a unified stack:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#53E2FE]/10 text-[#53E2FE] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Real-Time Zero-Pixel Tracking</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Instant alerts the millisecond a recipient opens your email or clicks your link, powered by Google Apps Script and custom redirect telemetry.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#c6f432]/10 text-[#c6f432] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Autonomous AI Warmup Fleet</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Automated peer-to-peer email warming with positive engagement signals, natural conversational replies, and spam rescue algorithms.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Syntax & MX Spam Verification</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Proactively checks every recipient address before sending to eliminate hard bounces and safeguard domain health.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Glassmorphic Showcase Card */}
            <div className="relative rounded-3xl bg-[#071126]/90 border border-[#53E2FE]/40 p-6 sm:p-8 shadow-[0_20px_70px_rgba(83,226,254,0.15)] space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1.5">
                    <img src="/images/mailify-logo-white.png" alt="Mailify" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Mailify Core Engine</h3>
                    <p className="text-xs text-slate-400">Live Telemetry & AI Fleet</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Active 24/7
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <p className="text-xs text-slate-400">Inbox Placement</p>
                  <p className="text-2xl font-black text-white mt-1">99.4%</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">↑ Industry top tier</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <p className="text-xs text-slate-400">Tracking Latency</p>
                  <p className="text-2xl font-black text-[#53E2FE] mt-1">&lt; 85ms</p>
                  <span className="text-[10px] text-slate-400 font-semibold">Real-time webhook</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <p className="text-xs text-slate-400">Warmup Accounts</p>
                  <p className="text-2xl font-black text-[#c6f432] mt-1">Unlimited</p>
                  <span className="text-[10px] text-slate-400 font-semibold">Fleet connectivity</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <p className="text-xs text-slate-400">Data Privacy</p>
                  <p className="text-2xl font-black text-white mt-1">100%</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Zero data selling</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ABOUT ERHA TECHNOLOGIES */}
        {/* ========================================================================= */}
        <section className="space-y-12">
          <div className="border-b border-slate-800 pb-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c6f432]">
              The Innovation Powerhouse
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              About ERHA Technologies
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7 space-y-5 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                <strong className="text-white font-semibold">ERHA Technologies</strong> is an agile technology studio and software engineering company committed to building mission-critical platforms, high-performance web products, and modern cloud infrastructure.
              </p>
              <p>
                At ERHA Technologies, we believe that world-class software is defined by three uncompromising principles:
                <span className="text-white font-medium"> absolute speed</span>,
                <span className="text-white font-medium"> rock-solid reliability</span>, and
                <span className="text-white font-medium"> intuitive human-centered design</span>.
              </p>
              <p>
                Our engineering team develops specialized systems ranging from real-time communication protocols and email deliverability frameworks to intelligent automation platforms. With Mailify, ERHA Technologies has engineered a turnkey solution that democratizes enterprise-grade deliverability for organizations of every size.
              </p>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <Building2 className="w-5 h-5 text-[#53E2FE] mb-2" />
                  <h4 className="font-bold text-white text-sm">Enterprise Engineering</h4>
                  <p className="text-xs text-slate-400 mt-1">Built using Next.js 14, TypeScript, Supabase, and distributed Google Cloud edge networks.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                  <h4 className="font-bold text-white text-sm">Compliance & Trust</h4>
                  <p className="text-xs text-slate-400 mt-1">Strict adherence to Google API Services User Data Policy, GDPR standards, and secure session management.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#091533] to-[#04091c] border border-blue-900/50 shadow-xl space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                    ET
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">ERHA Technologies</h3>
                    <p className="text-xs text-[#53E2FE] font-medium">Software Studio & Lab</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Headquarters</span>
                    <span className="font-semibold text-white">Global Cloud Presence</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Core Focus</span>
                    <span className="font-semibold text-white">Email Tech & SaaS Automation</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Technical Inquiries</span>
                    <span className="font-semibold text-[#53E2FE]">support@erhatechnologies.com</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Product Line</span>
                    <span className="font-semibold text-white">Mailify 2.0 Platform</span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-slate-100 text-slate-950 flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.02]"
                >
                  <span>Connect with ERHA Technologies</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-[#07193f] via-[#051a44] to-[#04336c] border border-[#53E2FE]/40 p-8 sm:p-12 text-center relative overflow-hidden shadow-[0_20px_80px_rgba(83,226,254,0.2)]">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Ready to Upgrade Your Email Deliverability?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Start tracking opens in real time and warming your domains automatically with Mailify today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/?action=get-started"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-white hover:bg-slate-100 text-slate-950 shadow-lg transition-transform hover:scale-105"
              >
                Get Started Now
              </Link>
              <Link
                href="/features"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 transition-colors"
              >
                Explore Features →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
}

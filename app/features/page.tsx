'use client';

import React from 'react';
import Link from 'next/link';
import { WebsiteHeader } from '@/components/website-header';
import { WebsiteFooter } from '@/components/website-footer';
import {
  Mail,
  Flame,
  ShieldCheck,
  BarChart3,
  Key,
  Inbox,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Terminal,
  Layers,
  Send,
} from 'lucide-react';

export default function FeaturesPage() {
  const featuresList = [
    {
      icon: Mail,
      title: 'Real-Time Gmail & Pixel Tracking',
      desc: 'Instant desktop and webhook alerts the moment your recipient opens your email or clicks on embedded links. Track device type, approximate location, and read duration.',
      badge: 'Zero Latency',
      accent: 'text-[#53E2FE] bg-[#53E2FE]/10 border-[#53E2FE]/30',
    },
    {
      icon: Flame,
      title: 'Autonomous AI Warmup Engine',
      desc: 'Protect your sender score with peer-to-peer inbox warming. Natural sending curves, human-like AI conversations, and automatic spam-folder rescue to keep you in the primary tab.',
      badge: 'AI Powered',
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      icon: ShieldCheck,
      title: 'Syntax & MX Spam Verification',
      desc: 'Verify recipient addresses prior to sending. Detect invalid syntax, dead MX records, disposable emails, and honeypot traps to prevent hard bounces from damaging your domain.',
      badge: 'Reputation Shield',
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Deliverability Analytics',
      desc: 'Track open rates, click-through rates, device fragmentation, hourly engagement heatmaps, and mailbox health scores in high-definition visual charts.',
      badge: 'Live Reports',
      accent: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    {
      icon: Inbox,
      title: 'Multi-Mailbox Fleet Command',
      desc: 'Consolidate multiple Google Workspace, Gmail, Microsoft 365, and custom SMTP accounts into a single control panel. Monitor warmups and tracking across your entire agency team.',
      badge: 'Fleet Scale',
      accent: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      icon: Key,
      title: 'Google Apps Script & REST API',
      desc: 'Deploy tracking directly within Google Sheets and Gmail using our pre-built Apps Script integration. Full REST API and webhooks for seamless CRM pipeline integration.',
      badge: 'Developer First',
      accent: 'text-[#53E2FE] bg-[#53E2FE]/10 border-[#53E2FE]/30',
    },
  ];

  const stepsList = [
    {
      step: '01',
      title: 'Sign Up & Generate Your API Key',
      desc: 'Create your Mailify account in under 30 seconds. Access your dashboard and grab your unique tracking token and API credentials from the Integrations tab.',
    },
    {
      step: '02',
      title: 'Deploy the Google Apps Script or Pixel',
      desc: 'Copy the ready-to-run Google Apps Script code into your Google Sheet or Gmail account, or insert the 1x1 transparent tracking pixel into your email campaigns.',
    },
    {
      step: '03',
      title: 'Activate the AI Warmup Fleet',
      desc: 'Connect your sending email accounts via secure App Password or OAuth. Configure your daily sending ramp, and let our peer-to-peer AI network build your sender reputation.',
    },
    {
      step: '04',
      title: 'Monitor Live Telemetry & Close Deals',
      desc: 'Watch real-time opens, clicks, and mailbox health metrics stream into your live dashboard. Follow up with leads at the exact second they are reviewing your proposal.',
    },
  ];

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
          className="absolute bottom-[20%] right-[-10%] w-[650px] h-[650px] rounded-full blur-[150px] opacity-25"
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
            <Zap className="w-4 h-4" />
            <span>Complete Deliverability & Tracking Suite</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Features Built for Senders Who{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#53E2FE] via-sky-300 to-white">
              Demand the Inbox.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Everything you need to send with confidence, track recipient engagement, eliminate bounce risk, and warm up your mailboxes automatically.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SOFTWARE FEATURES GRID */}
        {/* ========================================================================= */}
        <section className="space-y-12">
          <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#53E2FE]">
                Capabilities Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Mailify Core Features
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Engineered by ERHA Technologies to maximize outbound email effectiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuresList.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl bg-[#071126]/90 border border-slate-800 hover:border-[#53E2FE]/60 p-6 sm:p-7 shadow-lg transition-all duration-300 hover:shadow-[0_15px_40px_rgba(83,226,254,0.15)] hover:-translate-y-1 group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center group-hover:border-[#53E2FE]/60 transition-colors">
                        <Icon className="w-6 h-6 text-[#53E2FE]" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${f.accent}`}>
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-[#53E2FE] transition-colors">
                      {f.title}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center text-xs text-slate-400 group-hover:text-white transition-colors">
                    <span>Included in all accounts</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#53E2FE] ml-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW TO USE GUIDE (STEP-BY-STEP) */}
        {/* ========================================================================= */}
        <section className="space-y-12">
          <div className="border-b border-slate-800 pb-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#53E2FE]">
              User Walkthrough
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              How to Use Mailify in 4 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stepsList.map((st, i) => (
              <div
                key={i}
                className="relative rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-7 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="text-3xl font-black text-[#53E2FE]/30 group-hover:text-[#53E2FE] transition-colors">
                  {st.step}
                </div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Start Code Snippet preview */}
          <div className="rounded-3xl bg-[#060c1d] border border-blue-900/40 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#53E2FE]" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  Quick Integration Example (Apps Script & Pixel)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Google Apps Script</span>
            </div>

            <pre className="text-xs font-mono text-sky-200 overflow-x-auto bg-[#030612] p-4 rounded-xl border border-slate-800/80 leading-relaxed">
{`// Mailify Real-time Gmail & Apps Script Tracker
function sendTrackedEmail(recipient, subject, htmlBody) {
  var trackingUrl = "https://yourdomain.com/api/v1/track?id=" + generateUUID();
  var bodyWithPixel = htmlBody + '<img src="' + trackingUrl + '" width="1" height="1" style="display:none" />';
  
  GmailApp.sendEmail(recipient, subject, "", {
    htmlBody: bodyWithPixel
  });
}`}
            </pre>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-[#07193f] via-[#051a44] to-[#04336c] border border-[#53E2FE]/40 p-8 sm:p-12 text-center relative overflow-hidden shadow-[0_20px_80px_rgba(83,226,254,0.2)]">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Get Started with Mailify Today
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Experience flawless deliverability, real-time tracking insights, and automated inbox warmup.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/?action=get-started"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-white hover:bg-slate-100 text-slate-950 shadow-lg transition-transform hover:scale-105"
              >
                Launch Dashboard
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 transition-colors"
              >
                Contact Sales Team →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
}

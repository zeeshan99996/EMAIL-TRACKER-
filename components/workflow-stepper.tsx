'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  ShieldCheck,
  Send,
  BarChart3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  RotateCw,
} from 'lucide-react';

interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  badge: string;
  accentColor: {
    border: string;
    bg: string;
    text: string;
    badgeBg: string;
    iconBg: string;
    button: string;
  };
  icon: React.ReactNode;
  features: string[];
}

export function WorkflowStepper() {
  const steps: WorkflowStep[] = [
    {
      stepNumber: 1,
      title: 'Email Warmup',
      description: 'Build your sender reputation and improve inbox deliverability.',
      href: '/dashboard/warmup',
      buttonText: 'Open Warmup Fleet',
      badge: 'Step 1 • Reputation',
      accentColor: {
        border: 'border-purple-200 hover:border-purple-400',
        bg: 'from-purple-500/5 to-indigo-500/5',
        text: 'text-purple-600',
        badgeBg: 'bg-purple-100 text-purple-800',
        iconBg: 'bg-purple-600 text-white shadow-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700 text-white',
      },
      icon: <Flame className="w-5 h-5" />,
      features: ['Auto Warmup Ramp', 'Frequency Control', 'Real Inbox Activity'],
    },
    {
      stepNumber: 2,
      title: 'Email Verify',
      description: 'Clean your list and remove invalid, burner, or risky emails.',
      href: '/dashboard/verifier',
      buttonText: 'Clean Email List',
      badge: 'Step 2 • Clean List',
      accentColor: {
        border: 'border-emerald-200 hover:border-emerald-400',
        bg: 'from-emerald-500/5 to-teal-500/5',
        text: 'text-emerald-600',
        badgeBg: 'bg-emerald-100 text-emerald-800',
        iconBg: 'bg-emerald-600 text-white shadow-emerald-200',
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      },
      icon: <ShieldCheck className="w-5 h-5" />,
      features: ['Syntax Check', 'Disposable Check', 'Spam Trap Detection'],
    },
    {
      stepNumber: 3,
      title: 'Email Send',
      description: 'Send your emails through Google Apps Script & Sheets with ease.',
      href: '/dashboard/api-keys?tab=script',
      buttonText: 'Get Apps Script Code',
      badge: 'Step 3 • Delivery',
      accentColor: {
        border: 'border-sky-200 hover:border-sky-400',
        bg: 'from-sky-500/5 to-blue-500/5',
        text: 'text-sky-600',
        badgeBg: 'bg-sky-100 text-sky-800',
        iconBg: 'bg-sky-600 text-white shadow-sky-200',
        button: 'bg-sky-600 hover:bg-sky-700 text-white',
      },
      icon: <Send className="w-5 h-5" />,
      features: ['Connect Gmail & Sheets', 'Schedule Campaigns', 'Auto Pixel Injection'],
    },
    {
      stepNumber: 4,
      title: 'Email Track',
      description: 'Monitor opens, link clicks, who opened, when and how many times.',
      href: '/dashboard/emails',
      buttonText: 'View Tracked Emails',
      badge: 'Step 4 • Analytics',
      accentColor: {
        border: 'border-amber-200 hover:border-amber-400',
        bg: 'from-amber-500/5 to-orange-500/5',
        text: 'text-amber-600',
        badgeBg: 'bg-amber-100 text-amber-800',
        iconBg: 'bg-amber-600 text-white shadow-amber-200',
        button: 'bg-amber-600 hover:bg-amber-700 text-white',
      },
      icon: <BarChart3 className="w-5 h-5" />,
      features: ['1x1 Pixel Open Tracking', 'Link Click Redirection', 'Live 2.5s Real-time Sync'],
    },
  ];

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 fill-blue-600" />
            <span>All-in-One Email Platform</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Email Automation Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Warmup <span className="text-slate-300 mx-1">→</span> Verify <span className="text-slate-300 mx-1">→</span> Send <span className="text-slate-300 mx-1">→</span> Track
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            Active Automation Loop
          </span>
        </div>
      </div>

      {/* 4 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 relative">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            className={`rounded-2xl border ${step.accentColor.border} bg-gradient-to-b ${step.accentColor.bg} p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative group`}
          >
            {/* Step Top Bar */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className={`w-10 h-10 rounded-2xl ${step.accentColor.iconBg} flex items-center justify-center shadow-md`}>
                  {step.icon}
                </div>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${step.accentColor.badgeBg}`}>
                  {step.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {step.stepNumber}. {step.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[36px]">
                {step.description}
              </p>

              {/* Checklist */}
              <ul className="mt-4 space-y-2 pt-3 border-t border-slate-100">
                {step.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Link Button */}
            <div className="mt-5 pt-3">
              <Link
                href={step.href}
                className={`w-full py-2.5 px-3 rounded-xl ${step.accentColor.button} font-bold text-xs shadow-xs transition-transform active:scale-98 flex items-center justify-center gap-1.5 group-hover:gap-2`}
              >
                <span>{step.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Data Feedback Loop Banner (Matches bottom arrow in diagram) */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <RotateCw className="w-4 h-4" />
          </div>
          <span>
            <strong>Continuous Feedback Loop:</strong> Tracking data directly feeds into deliverability scoring, helping your inbox stay 100% warmed up and free of spam traps.
          </span>
        </div>

        <Link
          href="/dashboard/docs"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap"
        >
          View Full Guide →
        </Link>
      </div>
    </div>
  );
}

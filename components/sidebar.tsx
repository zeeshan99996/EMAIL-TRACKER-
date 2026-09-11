'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mail,
  ShieldCheck,
  BarChart3,
  Flame,
  Inbox,
  Target,
  Activity,
  TrendingUp,
  Sliders,
  FolderKanban,
  Key,
  Settings,
  BookOpen,
  LogOut,
  Zap,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { ProjectSelector } from './project-selector';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const trackerNavSections: NavSection[] = [
  {
    title: 'EMAIL TRACKING',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Tracked Emails', href: '/dashboard/emails', icon: Mail },
      { name: 'Email Verifier', href: '/dashboard/verifier', icon: ShieldCheck, badge: 'Clean', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'INTEGRATIONS & DEV',
    items: [
      { name: 'API & Apps Script', href: '/dashboard/api-keys', icon: Key },
      { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      { name: 'Documentation', href: '/dashboard/docs', icon: BookOpen },
    ],
  },
];

const warmupNavSections: NavSection[] = [
  {
    title: 'WARMUP & FLEET',
    items: [
      { name: 'Warmup Overview', href: '/dashboard/warmup', icon: Flame, badge: 'AI', badgeColor: 'bg-amber-500/20 text-amber-300' },
      { name: 'Connected Mailboxes', href: '/dashboard/warmup/accounts', icon: Inbox },
      { name: 'Targeted Campaigns', href: '/dashboard/warmup/targeted', icon: Target },
    ],
  },
  {
    title: 'MONITORING & AI',
    items: [
      { name: 'Activity & AI Logs', href: '/dashboard/warmup/events', icon: Activity },
      { name: 'Warmup Stats', href: '/dashboard/warmup/stats', icon: TrendingUp },
      { name: 'Warmup Settings', href: '/dashboard/warmup/settings', icon: Sliders },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      { name: 'Documentation', href: '/dashboard/docs', icon: BookOpen },
    ],
  },
];

export function Sidebar({
  mobileOpen = false,
  setMobileOpen,
}: {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const isWarmupMode = pathname.startsWith('/dashboard/warmup');
  const activeSections = isWarmupMode ? warmupNavSections : trackerNavSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container - Dark charcoal style */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#161922] text-slate-100 border-r border-slate-800/80 flex flex-col justify-between shrink-0 transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between sticky top-0 bg-[#161922] z-10">
            <Link href="/" title="Back to Main Hub" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-[#c6f432] text-slate-950 flex items-center justify-center font-black shadow-md shadow-[#c6f432]/20 transition-transform group-hover:scale-105">
                {isWarmupMode ? (
                  <Flame className="w-5 h-5 fill-current text-slate-950" />
                ) : (
                  <Zap className="w-5 h-5 fill-current text-slate-950" />
                )}
              </div>
              <div>
                <h1 className="font-bold text-white text-base tracking-tight group-hover:text-[#c6f432] transition-colors">
                  {isWarmupMode ? 'Email Warmup' : 'EmailTracker'}
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isWarmupMode ? 'AI Reputation Engine' : 'Live Opens & Clicks'}
                </p>
              </div>
            </Link>
            {setMobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-white md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Product Switcher (Email Tracker & Warmup centered & responsive) */}
          <div className="p-3 pb-1 space-y-2">
            <div className="bg-slate-100/95 p-1 rounded-2xl flex items-center border border-slate-200/80 text-xs shadow-inner w-full">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex-1 flex items-center justify-center py-2 px-2.5 rounded-xl font-bold transition-all text-xs ${
                  !isWarmupMode
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${!isWarmupMode ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className="truncate">Email Tracker</span>
              </Link>

              <Link
                href="/dashboard/warmup"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex-1 flex items-center justify-center py-2 px-2.5 rounded-xl font-bold transition-all text-xs ${
                  isWarmupMode
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 mr-1.5 shrink-0 fill-amber-500 text-amber-500" />
                <span className="truncate">Email Warmup</span>
              </Link>
            </div>

            {/* Portal Hub Button Down of Switcher */}
            <Link
              href="/"
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="w-full flex items-center justify-center py-2 px-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/70 rounded-xl transition-all border border-slate-800/80 hover:border-slate-700 shadow-xs group"
              title="Return to Main Selection Portal"
            >
              <span className="text-slate-400 group-hover:text-[#c6f432] transition-colors mr-1.5">←</span>
              <span>Back to Selection Portal Hub</span>
            </Link>
          </div>

          {/* Project Selector (shown in tracker mode) */}
          <div className="px-3 py-3">
            <ProjectSelector />
          </div>

          {/* Nav Sections */}
          <nav className="px-3 py-1 space-y-5">
            {activeSections.map((section) => (
              <div key={section.title}>
                <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' &&
                        item.href !== '/dashboard/warmup' &&
                        pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileOpen && setMobileOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 ${
                          isActive
                            ? 'bg-[#c6f432] text-slate-950 shadow-md shadow-[#c6f432]/10 font-bold'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${
                            isActive 
                              ? 'text-slate-950' 
                              : 'text-slate-400'
                          }`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-slate-950/15 text-slate-950'
                                : item.badgeColor || 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Accent Widget (like reference image) */}
        <div className="p-3">
          <div className="relative overflow-hidden p-3.5 rounded-2xl bg-[#c6f432]/10 border border-[#c6f432]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Google Apps Script</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Real-time Gmail tracking</p>
              </div>
              <Link
                href="/dashboard/api-keys"
                className="w-8 h-8 rounded-full bg-[#c6f432] text-slate-950 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                title="View Apps Script & API Key"
              >
                <ArrowUpRight className="w-4 h-4 font-bold stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer User Badge */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                ET
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">ERHA Technologies</p>
                <p className="text-[11px] text-slate-400 truncate">admin@erha.com</p>
              </div>
            </div>
            <Link
              href="/auth/login"
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

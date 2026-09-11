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
      { name: 'Tracker Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Tracked Emails', href: '/dashboard/emails', icon: Mail },
      { name: 'Email Verifier', href: '/dashboard/verifier', icon: ShieldCheck, badge: 'Clean', badgeColor: 'bg-emerald-100 text-emerald-700' },
      { name: 'Tracking Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'INTEGRATIONS & DEV',
    items: [
      { name: 'API Keys & Script', href: '/dashboard/api-keys', icon: Key },
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
      { name: 'Warmup Overview', href: '/dashboard/warmup', icon: Flame, badge: 'AI', badgeColor: 'bg-amber-100 text-amber-700' },
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <Link href={isWarmupMode ? "/dashboard/warmup" : "/dashboard"} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${
                isWarmupMode ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-blue-600'
              }`}>
                {isWarmupMode ? (
                  <Flame className="w-5 h-5 fill-current text-white" />
                ) : (
                  <Zap className="w-5 h-5 fill-current" />
                )}
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm tracking-tight">
                  {isWarmupMode ? 'Email Warmup AI' : 'Email Tracker AI'}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isWarmupMode ? 'Deliverability & Reputation' : 'Live Tracking & Analytics'}
                </p>
              </div>
            </Link>
            {setMobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Product Switcher Segmented Control */}
          <div className="p-3 pb-1">
            <div className="bg-slate-100/90 p-1 rounded-xl flex items-center border border-slate-200/80 shadow-inner">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  !isWarmupMode
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Mail className={`w-3.5 h-3.5 mr-1.5 ${!isWarmupMode ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>Tracker</span>
              </Link>
              <Link
                href="/dashboard/warmup"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isWarmupMode
                    ? 'bg-white text-amber-600 shadow-sm border border-slate-200/60 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 mr-1.5 ${isWarmupMode ? 'text-amber-500 fill-amber-500' : 'text-slate-500'}`} />
                <span>Warmup</span>
              </Link>
            </div>
          </div>

          {/* Project Selector (shown in tracker mode) */}
          <div className="px-3 py-2">
            <ProjectSelector />
          </div>

          {/* Nav Sections */}
          <nav className="px-2 py-1 space-y-4">
            {activeSections.map((section) => (
              <div key={section.title}>
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
                <div className="space-y-0.5">
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
                        className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          isActive
                            ? isWarmupMode
                              ? 'bg-amber-50 text-amber-800 font-semibold'
                              : 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${
                            isActive 
                              ? (isWarmupMode ? 'text-amber-600' : 'text-blue-600') 
                              : 'text-slate-400'
                          }`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.badgeColor || 'bg-slate-100 text-slate-600'
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

          {/* Cross-Product Switcher Card */}
          <div className="px-3 py-3">
            {isWarmupMode ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className="group block p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-200 transition-all text-left shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    Email Tracker
                  </span>
                  <span className="text-xs text-blue-600 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
                <p className="text-xs font-semibold text-slate-800">Track Opens & Clicks</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Switch to tracking pixels & analytics</p>
              </Link>
            ) : (
              <Link
                href="/dashboard/warmup"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className="group block p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 hover:border-amber-200 transition-all text-left shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center">
                    <Flame className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                    Email Warmup
                  </span>
                  <span className="text-xs text-amber-600 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
                <p className="text-xs font-semibold text-slate-800">Boost Deliverability</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Warm up mailboxes & rescue spam</p>
              </Link>
            )}
          </div>
        </div>

        {/* Footer User Badge */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                ET
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">ERHA Technologies</p>
                <p className="text-[10px] text-slate-500 truncate">admin@erha.com</p>
              </div>
            </div>
            <Link
              href="/auth/login"
              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
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

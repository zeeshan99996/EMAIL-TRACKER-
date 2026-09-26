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
      { name: 'Email Verifier', href: '/dashboard/verifier', icon: ShieldCheck, badge: 'Clean', badgeColor: 'bg-white/20 text-white font-bold border border-white/30' },
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
      { name: 'Warmup Overview', href: '/dashboard/warmup', icon: Flame, badge: 'AI', badgeColor: 'bg-white/20 text-white font-bold border border-white/30' },
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
  const [userInfo, setUserInfo] = React.useState<{ name?: string; email?: string } | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('mailify_submitted_user');
      if (stored) {
        setUserInfo(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mailify_submitted_user');
      document.cookie = 'mailify_has_submitted=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'warmup_user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/?view=landing';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container - Dark Style with Pure White Text */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0d131f] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 text-white ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Logo Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 group"
              onClick={() => setMobileOpen && setMobileOpen(false)}
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700/60 flex items-center justify-center p-1.5 shadow-md shadow-black/20 group-hover:border-[#53E2FE]/40 transition-all">
                <img
                  src="/mailify-logo-white.png"
                  alt="Mailify Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg tracking-tight text-white group-hover:text-slate-200 transition-colors">
                    MAILIFY
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#53E2FE] text-slate-950">
                    2.0
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-white">
                  {isWarmupMode ? 'Warmup Fleet' : 'Tracking Engine'}
                </span>
              </div>
            </Link>
            {setMobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-white hover:text-white rounded-lg md:hidden hover:bg-slate-800"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Mode Switcher Pill */}
          <div className="p-3 pb-0 space-y-2">
            <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex-1 flex items-center justify-center py-2 px-2.5 rounded-xl font-bold transition-all text-xs ${
                  !isWarmupMode
                    ? 'bg-[#53E2FE] text-slate-950 shadow-sm font-black'
                    : 'text-white font-bold hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Mail className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${!isWarmupMode ? 'text-slate-950' : 'text-white'}`} />
                <span className="truncate">Tracker</span>
              </Link>

              <Link
                href="/dashboard/warmup"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex-1 flex items-center justify-center py-2 px-2.5 rounded-xl font-bold transition-all text-xs ${
                  isWarmupMode
                    ? 'bg-[#53E2FE] text-slate-950 shadow-sm font-black'
                    : 'text-white font-bold hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${isWarmupMode ? 'fill-slate-950 text-slate-950' : 'fill-amber-500 text-amber-500'}`} />
                <span className="truncate">Email Warmup</span>
              </Link>
            </div>

            {/* Back to Website / Portal Hub */}
            <Link
              href="/?view=landing"
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="w-full flex items-center justify-center py-2 px-3 text-xs font-bold text-white hover:text-white bg-slate-900/60 hover:bg-slate-800/80 rounded-xl transition-all border border-slate-800 hover:border-slate-700 shadow-xs group"
              title="Return to Main Website"
            >
              <span className="text-[#53E2FE] mr-1.5 font-bold transition-transform group-hover:-translate-x-0.5">←</span>
              <span className="text-white font-bold">Back to Website</span>
            </Link>
          </div>

          {/* Project Selector (shown in tracker mode) */}
          {!isWarmupMode && (
            <div className="px-3 py-3">
              <ProjectSelector />
            </div>
          )}

          {/* Nav Sections */}
          <nav className="px-3 py-1 space-y-5">
            {activeSections.map((section) => (
              <div key={section.title}>
                <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-white">
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
                        className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-bold rounded-xl transition-all duration-150 ${
                          isActive
                            ? 'bg-[#53E2FE] text-slate-950 shadow-md shadow-[#53E2FE]/20 font-black'
                            : 'text-white font-bold hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${
                            isActive 
                              ? 'text-slate-950' 
                              : 'text-white'
                          }`} />
                          <span className={isActive ? 'text-slate-950 font-black' : 'text-white font-bold'}>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-slate-950/15 text-slate-950 font-black'
                                : 'bg-white/20 text-white font-bold'
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

        {/* Bottom Accent Widget */}
        <div className="p-3">
          <div className="relative overflow-hidden p-3.5 rounded-2xl bg-[#53E2FE]/10 border border-[#53E2FE]/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  {isWarmupMode ? 'AI Warmup Fleet' : 'Google Apps Script'}
                </p>
                <p className="text-[11px] font-medium text-white mt-0.5">
                  {isWarmupMode ? 'Automated mailbox ramp-up' : 'Real-time Gmail tracking'}
                </p>
              </div>
              <Link
                href={isWarmupMode ? '/dashboard/warmup/accounts' : '/dashboard/api-keys'}
                className="w-8 h-8 rounded-full bg-[#53E2FE] text-slate-950 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                title={isWarmupMode ? 'Manage Mailboxes' : 'View Apps Script & API Key'}
              >
                <ArrowUpRight className="w-4 h-4 font-bold stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer User Badge & Sign Out */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#53E2FE] to-blue-600 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                {userInfo?.name ? userInfo.name.substring(0, 2).toUpperCase() : 'ET'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {userInfo?.name || 'ERHA Technologies'}
                </p>
                <p className="text-[11px] font-medium text-white truncate">
                  {userInfo?.email || 'admin@erha.com'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 text-white hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

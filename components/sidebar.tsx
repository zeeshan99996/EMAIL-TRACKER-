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
      { name: 'Email Verifier', href: '/dashboard/verifier', icon: ShieldCheck, badge: 'Clean', badgeColor: 'bg-[#53E2FE]/20 text-[#53E2FE]' },
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

      {/* Sidebar Container - Website Hero Section Gradient */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#020512] via-[#021029] to-[#04336c] border-r border-[#53E2FE]/30 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 relative overflow-hidden text-white shadow-[8px_0_35px_rgba(2,16,41,0.7)] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Background Ambient Glows identical to Website Hero Section */}
        {/* Top-Left Ambient Cyan Bloom */}
        <div
          className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none blur-[65px] opacity-35 z-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(83,226,254,0.85) 0%, rgba(14,165,233,0.5) 45%, transparent 75%)',
          }}
        />

        {/* Mid-Right Vibrant #53E2FE Aurora */}
        <div
          className="absolute top-[40%] -right-16 w-52 h-52 rounded-full pointer-events-none blur-[70px] opacity-30 z-0"
          style={{
            background:
              'radial-gradient(ellipse at center, #53E2FE 0%, rgba(14,165,233,0.5) 40%, rgba(2,132,199,0.2) 70%, transparent 85%)',
          }}
        />

        {/* Bottom Horizon Intense White & #53E2FE Core Glow */}
        <div
          className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-72 h-44 rounded-full pointer-events-none blur-[60px] opacity-45 z-0"
          style={{
            background:
              'radial-gradient(ellipse at center, #ffffff 0%, #53E2FE 35%, rgba(4,51,108,0.8) 70%, transparent 90%)',
          }}
        />

        {/* Vertical Coordinate Grid Lines (Hero Texture) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-15"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sidebarGridGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#53E2FE" stopOpacity="0.05" />
              <stop offset="40%" stopColor="#53E2FE" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#53E2FE" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#53E2FE" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="url(#sidebarGridGrad)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#sidebarGridGrad)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="url(#sidebarGridGrad)" strokeWidth="1" strokeDasharray="4 6" />
        </svg>

        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto relative z-10">
          {/* Logo Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#53E2FE]/15 bg-[#020512]/30 backdrop-blur-xs">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 group"
              onClick={() => setMobileOpen && setMobileOpen(false)}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#020c24]/80 border border-[#53E2FE]/30 flex items-center justify-center p-1.5 shadow-md shadow-black/40 group-hover:border-[#53E2FE] transition-all">
                <img
                  src="/mailify-logo-white.png"
                  alt="Mailify Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg tracking-tight text-white group-hover:text-cyan-100 transition-colors">
                    MAILIFY
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#53E2FE] text-slate-950 shadow-xs">
                    2.0
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-300">
                  {isWarmupMode ? 'Warmup Fleet' : 'Tracking Engine'}
                </span>
              </div>
            </Link>
            {setMobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mode Switcher Pill */}
          <div className="p-3 pb-0 space-y-2">
            <div className="flex items-center bg-[#020c24]/75 p-1 rounded-2xl border border-blue-900/40 backdrop-blur-md">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex-1 flex items-center justify-center py-2 px-2.5 rounded-xl font-bold transition-all text-xs ${
                  !isWarmupMode
                    ? 'bg-[#53E2FE] text-slate-950 shadow-md shadow-[#53E2FE]/25 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Mail className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span className="truncate">Tracker</span>
              </Link>

              <Link
                href="/dashboard/warmup"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex-1 flex items-center justify-center py-2 px-2.5 rounded-xl font-bold transition-all text-xs ${
                  isWarmupMode
                    ? 'bg-[#53E2FE] text-slate-950 shadow-md shadow-[#53E2FE]/25 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Flame className="w-3.5 h-3.5 mr-1.5 shrink-0 fill-amber-500 text-amber-500" />
                <span className="truncate">Email Warmup</span>
              </Link>
            </div>

            {/* Back to Website / Portal Hub */}
            <Link
              href="/?view=landing"
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="w-full flex items-center justify-center py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-[#020c24]/50 hover:bg-[#020c24]/80 rounded-xl transition-all border border-blue-900/40 hover:border-[#53E2FE]/40 shadow-xs group backdrop-blur-sm"
              title="Return to Main Website"
            >
              <span className="text-[#53E2FE] mr-1.5 transition-transform group-hover:-translate-x-0.5">←</span>
              <span>Back to Website</span>
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
                <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#53E2FE]/70">
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
                            ? 'bg-[#53E2FE] text-slate-950 shadow-md shadow-[#53E2FE]/25 font-bold'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
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

        {/* Bottom Accent Widget (Website Hero Glass Style) */}
        <div className="relative z-10 p-3">
          <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-[#53E2FE]/15 to-[#04336c]/40 border border-[#53E2FE]/30 backdrop-blur-md shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Google Apps Script</p>
                <p className="text-[11px] text-slate-300 mt-0.5">Real-time Gmail tracking</p>
              </div>
              <Link
                href="/dashboard/api-keys"
                className="w-8 h-8 rounded-full bg-[#53E2FE] text-slate-950 flex items-center justify-center shadow-md shadow-[#53E2FE]/30 hover:scale-105 transition-transform"
                title="View Apps Script & API Key"
              >
                <ArrowUpRight className="w-4 h-4 font-bold stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer User Badge & Sign Out */}
        <div className="relative z-10 p-3 border-t border-[#53E2FE]/15 bg-[#020512]/30 backdrop-blur-xs space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#020c24]/75 border border-blue-900/40 backdrop-blur-md">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#53E2FE] to-blue-600 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {userInfo?.name ? userInfo.name.substring(0, 2).toUpperCase() : 'ET'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {userInfo?.name || 'ERHA Technologies'}
                </p>
                <p className="text-[11px] text-slate-300 truncate">
                  {userInfo?.email || 'admin@erha.com'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

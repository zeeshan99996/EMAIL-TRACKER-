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
      { name: 'Email Verifier', href: '/dashboard/verifier', icon: ShieldCheck, badge: 'Clean', badgeColor: 'bg-white/20 text-white font-black border border-white/30' },
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
      { name: 'Warmup Overview', href: '/dashboard/warmup', icon: Flame, badge: 'AI', badgeColor: 'bg-amber-400/25 text-white font-black border border-amber-400/40' },
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

      {/* Sidebar Container - Luminous Hero Section Gradient */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#0a2f64] via-[#0d478e] via-[#0f5ca8] to-[#0275b8] border-r border-[#53E2FE]/40 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 relative overflow-hidden text-white shadow-[10px_0_40px_rgba(2,16,41,0.5)] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Background Ambient Glows - Lighter & More Radiant */}
        {/* Top-Left Ambient Cyan Bloom */}
        <div
          className="absolute -top-10 -left-10 w-64 h-64 rounded-full pointer-events-none blur-[50px] opacity-65 z-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(83,226,254,0.75) 0%, rgba(14,165,233,0.45) 50%, transparent 75%)',
          }}
        />

        {/* Mid-Right Vibrant #53E2FE Aurora */}
        <div
          className="absolute top-[35%] -right-14 w-64 h-64 rounded-full pointer-events-none blur-[55px] opacity-60 z-0"
          style={{
            background:
              'radial-gradient(ellipse at center, #53E2FE 0%, rgba(14,165,233,0.55) 45%, rgba(2,132,199,0.3) 70%, transparent 85%)',
          }}
        />

        {/* Bottom Horizon Intense White & #53E2FE Core Glow */}
        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-56 rounded-full pointer-events-none blur-[50px] opacity-70 z-0"
          style={{
            background:
              'radial-gradient(ellipse at center, #ffffff 0%, #53E2FE 45%, rgba(4,51,108,0.7) 70%, transparent 95%)',
          }}
        />

        {/* Vertical Coordinate Grid Lines (Hero Texture) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-25"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sidebarGridGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="40%" stopColor="#53E2FE" stopOpacity="0.4" />
              <stop offset="85%" stopColor="#53E2FE" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="url(#sidebarGridGrad)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#sidebarGridGrad)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="url(#sidebarGridGrad)" strokeWidth="1" strokeDasharray="4 6" />
        </svg>

        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto relative z-10">
          {/* Logo Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-white/20 bg-black/15 backdrop-blur-xs">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 group"
              onClick={() => setMobileOpen && setMobileOpen(false)}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center p-1.5 shadow-md shadow-black/30 group-hover:border-[#53E2FE] transition-all">
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
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#53E2FE] text-slate-950 shadow-xs">
                    2.0
                  </span>
                </div>
                <span className="text-xs font-bold text-white tracking-wide">
                  {isWarmupMode ? 'Warmup Fleet' : 'Tracking Engine'}
                </span>
              </div>
            </Link>
            {setMobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-white hover:text-white rounded-lg md:hidden hover:bg-white/15"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Mode Switcher Pill */}
          <div className="p-3 pb-0 space-y-2">
            <div className="flex items-center bg-black/35 p-1 rounded-2xl border border-white/20 backdrop-blur-md">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex-1 flex items-center justify-center py-2 px-2.5 rounded-xl transition-all text-xs font-black ${
                  !isWarmupMode
                    ? 'bg-gradient-to-r from-blue-600 to-[#0284c7] text-white shadow-md border border-[#53E2FE] shadow-[#53E2FE]/25'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                <Mail className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${!isWarmupMode ? 'text-[#53E2FE]' : 'text-white'}`} />
                <span className="truncate text-white font-bold">Tracker</span>
              </Link>

              <Link
                href="/dashboard/warmup"
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex-1 flex items-center justify-center py-2 px-2.5 rounded-xl transition-all text-xs font-black ${
                  isWarmupMode
                    ? 'bg-gradient-to-r from-blue-600 to-[#0284c7] text-white shadow-md border border-[#53E2FE] shadow-[#53E2FE]/25'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                <Flame className="w-3.5 h-3.5 mr-1.5 shrink-0 fill-amber-400 text-amber-400" />
                <span className="truncate text-white font-bold">Email Warmup</span>
              </Link>
            </div>

            {/* Back to Website / Portal Hub */}
            <Link
              href="/?view=landing"
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="w-full flex items-center justify-center py-2.5 px-3 text-xs font-bold text-white bg-black/30 hover:bg-black/50 rounded-xl transition-all border border-white/25 hover:border-white/50 shadow-sm group backdrop-blur-sm"
              title="Return to Main Website"
            >
              <span className="text-[#53E2FE] mr-1.5 font-bold transition-transform group-hover:-translate-x-1">←</span>
              <span className="text-white font-bold">Back to Website</span>
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
                <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-white flex items-center space-x-1.5 drop-shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#53E2FE]"></span>
                  <span className="text-white font-black">{section.title}</span>
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
                        className={`flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600/95 to-[#0284c7]/95 text-white font-black border border-[#53E2FE] shadow-[0_4px_20px_rgba(83,226,254,0.35)]'
                            : 'text-white font-bold hover:bg-white/15 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${
                            isActive 
                              ? 'text-[#53E2FE]' 
                              : 'text-white'
                          }`} />
                          <span className="text-white font-bold">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-[#53E2FE] text-slate-950 font-black'
                                : item.badgeColor || 'bg-white/20 text-white font-black border border-white/30'
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
          <div className="relative overflow-hidden p-3.5 rounded-2xl bg-black/30 border border-white/30 backdrop-blur-md shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-white">Google Apps Script</p>
                <p className="text-xs font-semibold text-white mt-0.5">Real-time Gmail tracking</p>
              </div>
              <Link
                href="/dashboard/api-keys"
                className="w-8 h-8 rounded-full bg-[#53E2FE] text-slate-950 flex items-center justify-center shadow-md shadow-[#53E2FE]/40 hover:scale-105 transition-transform"
                title="View Apps Script & API Key"
              >
                <ArrowUpRight className="w-4 h-4 font-black stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer User Badge & Sign Out */}
        <div className="relative z-10 p-3 border-t border-white/20 bg-black/20 backdrop-blur-xs space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/35 border border-white/25 backdrop-blur-md">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#53E2FE] to-blue-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                {userInfo?.name ? userInfo.name.substring(0, 2).toUpperCase() : 'ET'}
              </div>
              <div className="truncate">
                <p className="text-xs font-black text-white truncate">
                  {userInfo?.name || 'ERHA Technologies'}
                </p>
                <p className="text-xs font-semibold text-white truncate">
                  {userInfo?.email || 'admin@erha.com'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 text-white hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-rose-500/35 hover:bg-rose-500/50 border border-rose-400/60 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-white" />
            <span className="text-white font-bold">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

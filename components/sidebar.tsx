'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mail,
  ShieldCheck,
  BarChart3,
  Inbox,
  Sliders,
  Settings,
  X,
  ArrowUpRight,
  Send,
  LogOut,
  LayoutTemplate,
} from 'lucide-react';

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

const cleanOutreachNavSections: NavSection[] = [
  {
    title: 'Cold Outreach Engine',
    items: [
      {
        name: 'Campaign Studio',
        href: '/dashboard/campaigns',
        icon: Send,
        badge: 'Main',
        badgeColor: 'bg-blue-600 text-white font-bold',
      },
      {
        name: 'Email Templates',
        href: '/dashboard/templates',
        icon: LayoutTemplate,
        badge: 'New',
        badgeColor: 'bg-emerald-600 text-white font-bold',
      },
      {
        name: 'Overview & Graph',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Tracked Emails',
        href: '/dashboard/emails',
        icon: Mail,
      },
      {
        name: 'Prospect Replies',
        href: '/dashboard/inbox',
        icon: Inbox,
        badge: 'Live',
        badgeColor: 'bg-emerald-600 text-white font-bold',
      },
      {
        name: 'Email Verifier',
        href: '/dashboard/verifier',
        icon: ShieldCheck,
      },
      {
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Senders & Config',
    items: [
      {
        name: 'Connected Mailboxes',
        href: '/dashboard/accounts',
        icon: Sliders,
        badge: 'Fleet',
        badgeColor: 'bg-slate-900 text-white font-bold',
      },
      {
        name: 'Settings & Sync',
        href: '/dashboard/settings',
        icon: Settings,
      },
    ],
  },
];

export function Sidebar({
  mobileOpen = false,
  setMobileOpen,
}: {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  userInfo?: any;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container - Clean Minimal Light Theme */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 text-slate-800 shrink-0 ${
          mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Logo Brand Header - Mailify */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 shrink-0">
            <Link
              href="/dashboard/campaigns"
              prefetch={false}
              className="flex items-center space-x-3 group"
              onClick={() => setMobileOpen && setMobileOpen(false)}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center p-1.5 shadow-xs">
                <img
                  src="/mailify-icon.png"
                  alt="Mailify Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-base tracking-tight text-slate-900">
                    Mailify
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500">
                  Google Sheet Engine
                </span>
              </div>
            </Link>
            {setMobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg md:hidden hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Campaign Studio Shortcut */}
          <div className="p-3 shrink-0">
            <Link
              href="/dashboard/campaigns"
              prefetch={false}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-bold transition-all shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>Campaign Studio</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Unified Nav Sections */}
          <nav className="px-3 py-1 space-y-4 flex-1">
            {cleanOutreachNavSections.map((section) => (
              <div key={section.title}>
                <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        prefetch={false}
                        onClick={() => setMobileOpen && setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-500'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeColor || 'bg-slate-100 text-slate-600 border border-slate-200'
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

        {/* Bottom Fast Status & Sign Out */}
        <div className="p-3 shrink-0 border-t border-slate-200 bg-slate-50/60 space-y-2">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-slate-900">Google Sheet Sync</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Connected</p>
            </div>
            <Link
              href="/dashboard/campaigns"
              prefetch={false}
              className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs"
              title="Launch Campaign Dispatcher"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            onClick={async () => {
              try {
                await fetch('/api/auth/signout', { method: 'POST' });
              } catch {}
              if (typeof window !== 'undefined') {
                localStorage.removeItem('mailify_submitted_user');
                document.cookie = 'mailify_has_submitted=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'warmup_user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                window.location.href = '/login';
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

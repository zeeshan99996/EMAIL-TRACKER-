'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mail,
  ShieldCheck,
  BarChart3,
  FolderKanban,
  Key,
  Settings,
  BookOpen,
  LogOut,
  Zap,
  X,
} from 'lucide-react';
import { ProjectSelector } from './project-selector';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Emails', href: '/dashboard/emails', icon: Mail },
  { name: 'Email Verifier', href: '/dashboard/verifier', icon: ShieldCheck },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Documentation', href: '/dashboard/docs', icon: BookOpen },
];

export function Sidebar({
  mobileOpen = false,
  setMobileOpen,
}: {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();

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
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm tracking-tight">EmailTracker</h1>
                <p className="text-[11px] text-slate-500 font-medium">Analytics & Tracking</p>
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

          {/* Project Selector */}
          <div className="p-3">
            <ProjectSelector />
          </div>

          {/* Nav Links */}
          <nav className="px-2 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
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

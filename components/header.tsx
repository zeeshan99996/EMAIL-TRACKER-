'use client';

import React from 'react';
import { Menu } from 'lucide-react';

export function Header({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick?: () => void;
}) {
  return (
    <header className="h-14 sm:h-15 bg-white border-b border-slate-200 px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
        <button
          onClick={onMenuClick || (() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('toggle-sidebar'));
            }
          })}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden cursor-pointer active:scale-95 shrink-0"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none truncate">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          System Active
        </span>
      </div>
    </header>
  );
}

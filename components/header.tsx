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
    <header className="h-14 sm:h-15 bg-white border-b border-slate-200 px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3 sm:space-x-4 -translate-y-1">
        <button
          onClick={onMenuClick || (() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('toggle-sidebar'));
            }
          })}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden cursor-pointer active:scale-95"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">{title}</h1>
      </div>
    </header>
  );
}

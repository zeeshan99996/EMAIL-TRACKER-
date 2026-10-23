'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Clear any legacy _et_sender cookie
    try {
      document.cookie = '_et_sender=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    } catch (e) {
      // ignore
    }

    const handleToggle = () => setMobileOpen((prev) => !prev);
    if (typeof window !== 'undefined') {
      window.addEventListener('toggle-sidebar', handleToggle);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('toggle-sidebar', handleToggle);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

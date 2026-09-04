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
    // Set persistent sender cookie so clicks and opens from this browser (e.g. in Gmail Sent folder) are excluded
    try {
      document.cookie = '_et_sender=1; path=/; max-age=315360000; SameSite=Lax';
    } catch (e) {
      console.warn('Could not set sender cookie:', e);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}


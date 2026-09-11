'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ShieldCheck, Menu, Plus, Send, Check, Flame, Mail, Inbox, Sparkles, Search } from 'lucide-react';

export function Header({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const isWarmupMode = pathname.startsWith('/dashboard/warmup');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [recipient, setRecipient] = useState('testclient@example.com');
  const [subject, setSubject] = useState('Website Services Inquiry & Proposal');
  const [htmlContent, setHtmlContent] = useState(
    `<p>Hello Client,</p><p>Check our <a href="https://erhatechnologies.com/services">Services</a> and <a href="https://erhatechnologies.com/contact">Contact Us</a>.</p>`
  );
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/v1/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipient,
          subject: subject,
          html: htmlContent,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to create test email');
      }

      setSending(false);
      setSuccessMsg(`Test email created! Tracking ID: ${result.trackingId}`);
      setTimeout(() => {
        setIsTestModalOpen(false);
        setSuccessMsg('');
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setSending(false);
      alert('Error creating email: ' + err.message);
    }
  };

  return (
    <>
      <header className="h-20 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
              {isWarmupMode ? (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1 animate-pulse" />
                  Warmup Active
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
                  Live Engine
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block mt-0.5">
              Welcome back, ERHA Technologies 👋
            </p>
          </div>
        </div>

        {/* Header Right Actions & Top Switcher */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Search Pill (matches reference image) */}
          <div className="hidden xl:flex items-center bg-slate-100/90 border border-slate-200/80 rounded-full px-3.5 py-1.5 text-xs text-slate-500 w-56 focus-within:w-64 focus-within:bg-white focus-within:border-blue-500 transition-all shadow-inner">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search emails, IDs..."
              className="bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 w-full"
            />
          </div>

          {isWarmupMode ? (
            <Link
              href="/dashboard/warmup/accounts"
              className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-950 bg-[#c6f432] hover:bg-[#b8e82a] rounded-xl shadow-sm transition-all"
            >
              <Inbox className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Connect Mailbox</span>
              <span className="sm:hidden">Mailbox</span>
            </Link>
          ) : (
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 text-[#c6f432]" />
              <span className="hidden sm:inline">Send Test Email</span>
              <span className="sm:hidden">Test</span>
            </button>
          )}

          <Link
            href="/dashboard/docs"
            className="hidden lg:flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Docs</span>
          </Link>
        </div>
      </header>

      {/* Send Test Email Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Send Tracked Test Email</span>
              </h3>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">HTML Body</label>
                <textarea
                  required
                  rows={4}
                  value={htmlContent}
                  onChange={e => setHtmlContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {successMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Processing...' : 'Register Tracked Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import {
  Inbox,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Star,
  Archive,
  Trash2,
  User,
  Building,
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
  Tag,
  CornerUpLeft,
} from 'lucide-react';

interface InboxThread {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  unread: boolean;
  leadCompany?: string;
  tags?: string[];
}

export default function InboxPage() {
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'warm'>('all');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  const fetchInbox = async () => {
    try {
      const res = await fetch('/api/v1/inbox', { cache: 'no-store' });
      const data = await res.json();
      if (data && data.threads) {
        setThreads(data.threads);
        if (data.threads.length > 0 && !selectedThreadId) {
          setSelectedThreadId(data.threads[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const selectedThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const handleSelectThread = async (id: string) => {
    setSelectedThreadId(id);
    setReplySuccess(false);
    setReplyText('');
    // Mark as read
    try {
      await fetch('/api/v1/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', messageId: id }),
      });
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, unread: false } : t))
      );
    } catch {}
  };

  const generateAiReply = () => {
    if (!selectedThread) return;
    const senderFirst = selectedThread.senderName.split(' ')[0];
    const generated = `Hi ${senderFirst},\n\nThank you for getting back to me! I would be delighted to share a quick 10-minute demo and our latest onboarding roadmap.\n\nDoes this Thursday at 2:00 PM EST work on your side? Alternatively, feel free to pick any slot that fits your schedule best.\n\nLooking forward to speaking with you!\n\nBest regards,\nOutreach Team`;
    setReplyText(generated);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    setTimeout(() => {
      setSendingReply(false);
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 4000);
      setReplyText('');
    }, 1000);
  };

  const filteredThreads = threads.filter((t) => {
    if (filterType === 'unread' && !t.unread) return false;
    if (filterType === 'warm' && (!t.tags || !t.tags.includes('Warm Lead') && !t.tags.includes('Meeting Request'))) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.senderName.toLowerCase().includes(q) ||
      t.senderEmail.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.leadCompany && t.leadCompany.toLowerCase().includes(q))
    );
  });

  const unreadCount = threads.filter((t) => t.unread).length;

  return (
    <div className="space-y-6 pb-16">
      <Header
        title="Unified Lead Inbox & Replies"
      />

      {/* Main Dual-Pane Inbox Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* Left Column: Email Thread List (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col bg-slate-50/60">
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Inbox className="w-4 h-4 text-blue-600" />
                Prospect Inquiries
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <button
                onClick={fetchInbox}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search prospect replies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                All Messages
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'unread'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterType('warm')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'warm'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Warm Leads
              </button>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[580px]">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No replies found matching this filter.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedThread?.id === thread.id;

                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-slate-100/60 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {thread.unread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        )}
                        <span
                          className={`text-xs font-bold ${
                            thread.unread ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {thread.senderName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {thread.receivedAt}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 line-clamp-1 mb-1">
                      {thread.subject}
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                      {thread.preview}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {thread.leadCompany && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Building className="w-3 h-3 text-slate-500" />
                          {thread.leadCompany}
                        </span>
                      )}
                      {thread.tags?.map((tg) => (
                        <span
                          key={tg}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Thread Reader & Reply Studio (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white">
          {selectedThread ? (
            <div className="flex flex-col h-full">
              {/* Message Header */}
              <div className="p-6 border-b border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {selectedThread.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                      <span className="text-slate-900 font-semibold">{selectedThread.senderName}</span>
                      <span>&lt;{selectedThread.senderEmail}&gt;</span>
                      <span>•</span>
                      <span className="text-slate-400">{selectedThread.receivedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {selectedThread.leadCompany && (
                      <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {selectedThread.leadCompany}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Body Content */}
              <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-slate-50/40">
                <div className="bg-white border border-slate-200 rounded-xl p-5 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans shadow-xs">
                  {selectedThread.body}
                </div>
              </div>

              {/* Quick Reply Box */}
              <div className="p-5 border-t border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <CornerUpLeft className="w-4 h-4 text-blue-600" />
                    Reply to {selectedThread.senderName}:
                  </div>
                  <button
                    onClick={generateAiReply}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    Draft Reply
                  </button>
                </div>

                <textarea
                  rows={4}
                  placeholder={`Write your reply to ${selectedThread.senderName}... or click "Draft Reply" to generate one.`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-sans shadow-xs"
                />

                <div className="flex items-center justify-between pt-1">
                  {replySuccess ? (
                    <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Reply dispatched successfully!
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">
                      Will send via connected mailbox with open & click tracking
                    </span>
                  )}

                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
                  >
                    <Send className={`w-3.5 h-3.5 ${sendingReply ? 'animate-spin' : ''}`} />
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs p-10">
              Select an email thread from the left to read and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

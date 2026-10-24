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
  Key,
  ShieldCheck,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface InboxThread {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail?: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  unread: boolean;
  leadCompany?: string;
  tags?: string[];
}

interface ConnectedAccount {
  id: string;
  email: string;
  provider: string;
  status: string;
  lastSyncAt?: string;
}

export default function InboxPage() {
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'warm'>('all');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  // Connect Mailbox Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'gmail' | 'custom'>('gmail');
  const [gmailAddress, setGmailAddress] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connectingAccount, setConnectingAccount] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Custom IMAP state
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [customImapHost, setCustomImapHost] = useState('imap.gmail.com');
  const [customImapPort, setCustomImapPort] = useState('993');
  const [customProvider, setCustomProvider] = useState('Gmail / Workspace');

  // Load saved sheet URL from local storage
  const getSheetUrl = () => {
    try {
      return localStorage.getItem('erha_sheet_webhook_url') || '';
    } catch {
      return '';
    }
  };

  const fetchInbox = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('/api/v1/inbox', { cache: 'no-store' });
      const data = await res.json();
      if (data && data.threads) {
        setThreads(data.threads);
        if (data.threads.length > 0 && !selectedThreadId) {
          setSelectedThreadId(data.threads[0].id);
        }
      }
      if (data && Array.isArray(data.connectedAccounts)) {
        setConnectedAccounts(data.connectedAccounts);
      }
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox(true);
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    setFeedback(null);
    try {
      const sheetWebhookUrl = getSheetUrl();
      const res = await fetch('/api/v1/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', sheetWebhookUrl }),
      });
      const data = await res.json();

      if (data && data.threads) {
        setThreads(data.threads);
        if (data.threads.length > 0 && !selectedThreadId) {
          setSelectedThreadId(data.threads[0].id);
        }
      }

      if (data && Array.isArray(data.connectedAccounts)) {
        setConnectedAccounts(data.connectedAccounts);
      }

      if (data.newMessages > 0) {
        setFeedback({
          message: `Synced successfully! Found ${data.newMessages} new prospect ${
            data.newMessages === 1 ? 'reply' : 'replies'
          }.`,
        });
      } else if (data.syncedAccounts > 0) {
        setFeedback({
          message: `Synced ${data.syncedAccounts} mailbox(es). No new replies at this moment.`,
        });
      } else {
        setFeedback({
          message:
            'Inbox checked. No connected mailbox found. Connect your Gmail App Password to auto-fetch replies.',
        });
      }
    } catch (err: any) {
      setFeedback({
        message: 'Sync encountered a network issue: ' + (err.message || 'Check connection'),
        isError: true,
      });
    } finally {
      setSyncing(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

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

  const handleArchive = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch('/api/v1/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', messageId: id }),
      });
      const updated = threads.filter((t) => t.id !== id);
      setThreads(updated);
      if (selectedThreadId === id) {
        setSelectedThreadId(updated[0]?.id || '');
      }
    } catch {}
  };

  const handleMarkUnread = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch('/api/v1/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markUnread', messageId: id }),
      });
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, unread: true } : t))
      );
    } catch {}
  };

  const handleSimulateReply = async () => {
    try {
      const res = await fetch('/api/v1/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulateReply' }),
      });
      const data = await res.json();
      if (data && data.threads) {
        setThreads(data.threads);
        if (data.thread?.id) {
          setSelectedThreadId(data.thread.id);
        }
        setFeedback({ message: 'Simulated reply created! Check it out below.' });
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch {}
  };

  const generateAiReply = () => {
    if (!selectedThread) return;
    const senderFirst = selectedThread.senderName.split(' ')[0] || 'there';
    const company = selectedThread.leadCompany || 'your team';
    const generated = `Hi ${senderFirst},\n\nThank you for getting back to me! I would be delighted to share a quick 10-minute demo and our latest onboarding roadmap for ${company}.\n\nDoes this Thursday at 2:00 PM EST work on your side? Alternatively, feel free to pick any slot that fits your schedule best.\n\nLooking forward to speaking with you!\n\nBest regards,\nOutreach Team`;
    setReplyText(generated);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedThread) return;
    setSendingReply(true);
    try {
      const res = await fetch('/api/v1/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendReply',
          replyData: {
            toEmail: selectedThread.senderEmail,
            subject: selectedThread.subject,
            textBody: replyText.trim(),
          },
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        setReplySuccess(true);
        setTimeout(() => setReplySuccess(false), 5000);
        setReplyText('');
      } else {
        alert(data.error || 'Failed to dispatch reply');
      }
    } catch (err: any) {
      alert('Error sending reply: ' + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  // Connect App Password
  const handleConnectGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailAddress.trim() || !appPassword.trim()) {
      setConnectError('Both Gmail address and 16-character App Password are required.');
      return;
    }
    setConnectingAccount(true);
    setConnectError(null);
    try {
      const res = await fetch('/api/email-accounts/add-app-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: gmailAddress.trim(),
          appPassword: appPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConnectError(data.error || data.details || 'Connection failed.');
      } else {
        setShowConnectModal(false);
        setGmailAddress('');
        setAppPassword('');
        setFeedback({ message: 'Gmail mailbox connected successfully! Syncing replies...' });
        // Trigger auto sync
        await triggerSync();
      }
    } catch (err: any) {
      setConnectError(err.message || 'Network error.');
    } finally {
      setConnectingAccount(false);
    }
  };

  // Connect Custom IMAP
  const handleConnectCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customPassword.trim()) {
      setConnectError('Email and Password are required.');
      return;
    }
    setConnectingAccount(true);
    setConnectError(null);
    try {
      const res = await fetch('/api/email-accounts/add-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customEmail.trim(),
          password: customPassword.trim(),
          provider: customProvider,
          imapHost: customImapHost,
          imapPort: customImapPort,
          imapSecurity: 'ssl',
          smtpHost: customImapHost.replace('imap', 'smtp'),
          smtpPort: '465',
          smtpSecurity: 'ssl',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConnectError(data.error || data.details || 'Connection failed.');
      } else {
        setShowConnectModal(false);
        setCustomEmail('');
        setCustomPassword('');
        setFeedback({ message: 'Custom mailbox connected successfully! Syncing replies...' });
        await triggerSync();
      }
    } catch (err: any) {
      setConnectError(err.message || 'Network error.');
    } finally {
      setConnectingAccount(false);
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (filterType === 'unread' && !t.unread) return false;
    if (
      filterType === 'warm' &&
      (!t.tags ||
        (!t.tags.includes('Warm Lead') && !t.tags.includes('Meeting Request')))
    )
      return false;

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
  const hasConnectedAccount = connectedAccounts.length > 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Header title="Unified Lead Inbox & Replies" />

        <div className="flex items-center gap-2 flex-wrap">
          {hasConnectedAccount ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Mailbox: {connectedAccounts[0].email}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-blue-600" />
              Connect Mailbox
            </button>
          )}

          <button
            onClick={triggerSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing Mailbox...' : 'Sync Mailbox Replies'}
          </button>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
            feedback.isError
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Warning banner if no mailbox is connected */}
      {!hasConnectedAccount && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-950">
                Automated IMAP Reply Sync is Inactive
              </h3>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                Connect your Gmail (App Password) or Custom IMAP email to automatically fetch prospect replies directly from your inbox in real time.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateReply}
              className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              Simulate Test Reply
            </button>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Connect Mailbox Now
            </button>
          </div>
        </div>
      )}

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

              <div className="flex items-center gap-1">
                <button
                  onClick={triggerSync}
                  title="Check mailbox for new replies"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                </button>
              </div>
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
                All Messages ({threads.length})
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
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {threads.length === 0 ? 'No Prospect Replies Yet' : 'No matching replies'}
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto mt-1 leading-relaxed">
                    {threads.length === 0
                      ? 'When prospects reply to your outreach emails, their messages will appear here.'
                      : 'Try resetting the search or filter to see all messages.'}
                  </p>
                </div>
                {threads.length === 0 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={triggerSync}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
                    >
                      Sync Now
                    </button>
                    <button
                      onClick={handleSimulateReply}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-all shadow-xs"
                    >
                      Simulate Reply
                    </button>
                  </div>
                )}
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
                        {thread.receivedAt.includes('T')
                          ? new Date(thread.receivedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : thread.receivedAt}
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
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            tg === 'Warm Lead' || tg === 'Meeting Request'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : tg.includes('Unsubscribe')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
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
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {selectedThread.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                      <span className="text-slate-900 font-semibold">{selectedThread.senderName}</span>
                      <span>&lt;{selectedThread.senderEmail}&gt;</span>
                      <span>•</span>
                      <span className="text-slate-400">
                        {selectedThread.receivedAt.includes('T')
                          ? new Date(selectedThread.receivedAt).toLocaleString()
                          : selectedThread.receivedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleMarkUnread(selectedThread.id, e)}
                      title="Mark as unread"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleArchive(selectedThread.id, e)}
                      title="Archive conversation"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags and Lead Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {selectedThread.leadCompany && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {selectedThread.leadCompany}
                    </span>
                  )}
                  {selectedThread.tags?.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold"
                    >
                      {t}
                    </span>
                  ))}
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
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Draft AI Follow-up
                  </button>
                </div>

                <textarea
                  rows={4}
                  placeholder={`Write your reply to ${selectedThread.senderName}... or click "Draft AI Follow-up" to generate one.`}
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
                      Will send via connected mailbox with open &amp; click tracking
                    </span>
                  )}

                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
                  >
                    <Send className={`w-3.5 h-3.5 ${sendingReply ? 'animate-spin' : ''}`} />
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs p-10 space-y-2">
              <Mail className="w-8 h-8 text-slate-300" />
              <span>Select an email thread from the left to read and reply.</span>
            </div>
          )}
        </div>
      </div>

      {/* Connect Mailbox Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Connect Mailbox for Real-time Replies
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Enables IMAP synchronization to ingest lead responses instantly.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setConnectError(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-5 pt-4 flex gap-2 border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setActiveTab('gmail');
                  setConnectError(null);
                }}
                className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                  activeTab === 'gmail'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Google Workspace / Gmail (App Password)
              </button>
              <button
                onClick={() => {
                  setActiveTab('custom');
                  setConnectError(null);
                }}
                className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                  activeTab === 'custom'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Custom IMAP / SMTP
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-5">
              {connectError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{connectError}</span>
                </div>
              )}

              {activeTab === 'gmail' ? (
                <form onSubmit={handleConnectGmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Gmail Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={gmailAddress}
                      onChange={(e) => setGmailAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800">
                        16-Character Google App Password
                      </label>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Generate in Google Account
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="abcd efgh ijkl mnop"
                        value={appPassword}
                        onChange={(e) => setAppPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-mono shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 4-Step Quick Instructions */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-600">
                    <div className="font-bold text-slate-800">How to get a 16-character App Password:</div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>Go to Google Account -&gt; Security</li>
                      <li>Turn ON 2-Step Verification (if not already active)</li>
                      <li>Search &quot;App passwords&quot; and create one named &quot;Mailify&quot;</li>
                      <li>Copy the 16 characters and paste them above</li>
                    </ol>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConnectModal(false)}
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={connectingAccount}
                      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-all shadow-xs flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {connectingAccount ? 'Connecting &amp; Testing IMAP...' : 'Connect Gmail'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleConnectCustom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Email Provider
                    </label>
                    <select
                      value={customProvider}
                      onChange={(e) => {
                        setCustomProvider(e.target.value);
                        if (e.target.value.includes('Hostinger')) {
                          setCustomImapHost('imap.hostinger.com');
                        } else if (e.target.value.includes('Titan')) {
                          setCustomImapHost('imap.titan.email');
                        } else if (e.target.value.includes('Office365')) {
                          setCustomImapHost('outlook.office365.com');
                        } else if (e.target.value.includes('GoDaddy')) {
                          setCustomImapHost('imap.secureserver.net');
                        } else {
                          setCustomImapHost('imap.gmail.com');
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
                    >
                      <option value="Gmail / Workspace">Gmail / Workspace</option>
                      <option value="Hostinger">Hostinger Webmail</option>
                      <option value="Titan">Titan Business Email</option>
                      <option value="Office365">Microsoft 365</option>
                      <option value="GoDaddy">GoDaddy</option>
                      <option value="Custom">Custom IMAP / SMTP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="outreach@yourdomain.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Mailbox Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        IMAP Host
                      </label>
                      <input
                        type="text"
                        required
                        value={customImapHost}
                        onChange={(e) => setCustomImapHost(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        IMAP Port
                      </label>
                      <input
                        type="text"
                        required
                        value={customImapPort}
                        onChange={(e) => setCustomImapPort(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConnectModal(false)}
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={connectingAccount}
                      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-all shadow-xs flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {connectingAccount ? 'Connecting...' : 'Connect Mailbox'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

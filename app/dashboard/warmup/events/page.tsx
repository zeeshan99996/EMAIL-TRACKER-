'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function WarmupEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescuing, setRescuing] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [rescueMessage, setRescueMessage] = useState<string | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (eventTypeFilter !== 'all') params.append('eventType', eventTypeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '50');

      const res = await fetch(`/api/warmup/events?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events || []);
      }
    } catch (err: any) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSpamRescue = async () => {
    setRescuing(true);
    setRescueMessage(null);
    try {
      const res = await fetch('/api/warmup/spam-rescue', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRescueMessage(`🛡️ Scan complete! ${data.totalRescued || 0} emails pulled from Spam to Inbox, ${data.totalMarkedImportant || 0} marked Important.`);
        await fetchEvents();
      } else {
        setRescueMessage(data.error || 'Spam rescue scan failed.');
      }
    } catch (err: any) {
      setRescueMessage(err.message || 'Spam rescue error');
    } finally {
      setRescuing(false);
    }
  };

  const handleManualCleanup = async () => {
    setCleaning(true);
    setRescueMessage(null);
    try {
      const res = await fetch('/api/warmup/cleanup', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRescueMessage(`🧹 Cleanup complete! Removed ${data.totalDeleted || 0} completed warmup emails across your fleet. Your real business emails remain completely untouched.`);
        await fetchEvents();
      } else {
        setRescueMessage(data.error || 'Cleanup failed.');
      }
    } catch (err: any) {
      setRescueMessage(err.message || 'Cleanup error');
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [eventTypeFilter, statusFilter]);

  const filteredEvents = events.filter((ev) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const eventType = (ev.event_type || '').toLowerCase();
    const source = (ev.source_account?.email || '').toLowerCase();
    const target = (ev.target_account?.email || '').toLowerCase();
    const thread = (ev.gmail_thread_id || '').toLowerCase();
    const action = (ev.metadata?.action || '').toLowerCase();
    const details = (ev.metadata?.details || '').toLowerCase();
    return eventType.includes(term) || source.includes(term) || target.includes(term) || thread.includes(term) || action.includes(term) || details.includes(term);
  });

  const getEventBadge = (type: string, status: string, metadata?: any) => {
    if (metadata?.action === 'spam_rescued') {
      return { icon: ShieldCheck, label: '🛡️ Rescued from Spam', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    }

    switch (type) {
      case 'message_sent':
        return { icon: Send, label: 'Message Sent', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'message_received':
        return { icon: Clock, label: 'Message Received', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'response_generated':
        return { icon: Sparkles, label: 'AI Reply Generated', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'response_sent':
        return { icon: MessageSquare, label: 'Response Sent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'limit_reached':
        return { icon: CheckCircle2, label: 'Thread Limit Reached', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'rate_limit':
        return { icon: AlertTriangle, label: 'Rate Limited', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'oauth_error':
        return { icon: AlertCircle, label: 'OAuth Error', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'job_failed':
        return { icon: AlertCircle, label: 'Job Failed', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { icon: Activity, label: type.replace(/_/g, ' '), color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-blue-600" />
            <span>Warmup Activity Stream</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time audit trail of peer email dispatches, AI replies, and Auto Spam Rescues.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleManualSpamRescue}
            disabled={rescuing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Scan all mailboxes, pull warmup emails from Spam to Inbox and mark Important"
          >
            {rescuing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>Scan & Rescue Spam</span>
          </button>

          <button
            onClick={handleManualCleanup}
            disabled={cleaning}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Auto-delete completed warmup emails only. Real emails are never touched."
          >
            {cleaning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Clean Warmup Emails</span>
          </button>

          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {rescueMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{rescueMessage}</span>
          </div>
          <button onClick={() => setRescueMessage(null)} className="text-slate-400 hover:text-slate-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search email, thread ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
          />
        </div>

        {/* Event Type Filter */}
        <div>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
          >
            <option value="all">All Event Types</option>
            <option value="message_sent">Message Sent</option>
            <option value="response_sent">Response Sent</option>
            <option value="response_generated">AI Generated</option>
            <option value="limit_reached">Thread Limit Reached</option>
            <option value="job_completed">Job Completed</option>
            <option value="job_failed">Job Failed</option>
            <option value="rate_limit">Rate Limit</option>
            <option value="oauth_error">OAuth Error</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Events Table / Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Activity className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No warmup activity events found</h3>
            <p className="text-xs text-slate-500">
              Start your warmup campaign or execute the worker to generate live activity.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEvents.map((ev) => {
              const badge = getEventBadge(ev.event_type, ev.status, ev.metadata);
              const Icon = badge.icon;

              return (
                <div
                  key={ev.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg border shrink-0 mt-0.5 ${badge.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.color}`}>
                          {badge.label}
                        </span>

                        {ev.gmail_thread_id && (
                          <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            thread:{ev.gmail_thread_id.slice(0, 10)}...
                          </span>
                        )}
                      </div>

                      {/* Source & Target details */}
                      <div className="text-slate-800">
                        {ev.source_account?.email && (
                          <span className="font-semibold text-slate-900">
                            From: {ev.source_account.email}
                          </span>
                        )}
                        {ev.target_account?.email && (
                          <span className="text-slate-500">
                            {' '}→ To: {ev.target_account.email}
                          </span>
                        )}
                      </div>

                      {/* Metadata / Error / Details summary */}
                      {ev.metadata?.subject && (
                        <p className="text-slate-600 text-[11px] italic">
                          &quot;{ev.metadata.subject}&quot;
                        </p>
                      )}

                      {ev.metadata?.details && (
                        <p className="text-emerald-700 text-[11px] font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          {ev.metadata.details}
                        </p>
                      )}

                      {ev.metadata?.error && (
                        <p className="text-rose-600 text-[11px]">
                          Error: {ev.metadata.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 md:self-center">
                    <div className="font-medium text-slate-700">
                      {formatRelativeTime(ev.created_at)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatDate(ev.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Users,
  CheckCircle2,
  Play,
  Pause,
  StopCircle,
  Clock,
  AlertTriangle,
  Send,
  Inbox,
  MessageSquare,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { WARMUP_LEVELS, calculateWarmupProgressPercent } from '@/lib/warmup/levels';

export default function WarmupDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, accountsRes, eventsRes] = await Promise.all([
        fetch('/api/warmup/stats'),
        fetch('/api/email-accounts'),
        fetch('/api/warmup/events?limit=6'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setMetrics(statsData.metrics);
      }

      if (accountsRes.ok) {
        const accData = await accountsRes.json();
        setAccounts(accData.accounts || []);
      }

      if (eventsRes.ok) {
        const evData = await eventsRes.json();
        setRecentEvents(evData.events || []);
      }
    } catch (err: any) {
      console.error('Error fetching warmup data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCampaignAction = async (action: 'start' | 'pause' | 'resume' | 'stop') => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/warmup/${action}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setFeedback({ message: data.error || `Failed to ${action} warmup`, isError: true });
      } else {
        setFeedback({ message: `Campaign ${action}ed successfully!`, isError: false });
        await fetchData();
      }
    } catch (err: any) {
      setFeedback({ message: err.message || `Failed to ${action} warmup`, isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Calculate fleet average warmup percentage
  const totalFleetProgress =
    accounts.length > 0
      ? Math.round(
          accounts.reduce((acc, curr) => {
            const totalSent = curr.warmup?.total_sent || 0;
            return acc + calculateWarmupProgressPercent(totalSent);
          }, 0) / accounts.length
        )
      : 0;

  const m = metrics || {
    totalAccounts: accounts.length,
    connectedAccounts: accounts.filter((a) => a.status === 'connected').length,
    warmupActive: accounts.filter((a) => a.warmup?.status === 'running').length,
    completedAccounts: accounts.filter((a) => (a.warmup?.warmup_level || 0) >= 4).length,
    inProgressAccounts: accounts.filter((a) => a.warmup?.status === 'running').length,
    queuedAccounts: accounts.filter((a) => a.warmup?.status === 'queued').length,
    pausedAccounts: accounts.filter((a) => a.warmup?.status === 'paused').length,
    errorAccounts: accounts.filter((a) => a.status === 'error' || a.status === 'token_expired').length,
    totalSentToday: 0,
    totalReceivedToday: 0,
    totalRepliesToday: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header & Campaign Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Email Warmup</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Standard Mode
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-account deliverability engine & peer-to-peer exchange monitor.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-center">
          <Link
            href="/dashboard/warmup"
            className="px-4 py-1.5 text-xs font-bold rounded-md bg-white text-slate-900 shadow-sm border border-slate-200"
          >
            Standard Warmup
          </Link>
          <Link
            href="/dashboard/warmup/targeted"
            className="px-4 py-1.5 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Targeted Warmup
          </Link>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleCampaignAction('start')}
            disabled={actionLoading || accounts.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Warmup</span>
          </button>

          <button
            onClick={() => handleCampaignAction('pause')}
            disabled={actionLoading || accounts.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause All</span>
          </button>

          <button
            onClick={() => handleCampaignAction('resume')}
            disabled={actionLoading || m.pausedAccounts === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resume</span>
          </button>

          <button
            onClick={() => handleCampaignAction('stop')}
            disabled={actionLoading || (m.warmupActive === 0 && m.queuedAccounts === 0)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>Stop</span>
          </button>

          <Link
            href="/dashboard/warmup/accounts"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Accounts</span>
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 shadow-xs ${
            feedback.isError
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {feedback.isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Fleet Warmup Progress Bar Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Average Fleet Warmup Score
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {totalFleetProgress >= 80 ? 'Optimal Sender Score' : totalFleetProgress >= 40 ? 'Good Progression' : 'Building Reputation'}
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {accounts.length} Connected Mailbox{accounts.length !== 1 ? 'es' : ''} in Warmup Fleet
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600">
            {totalFleetProgress}%
          </div>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 mb-3">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-700 rounded-full"
            style={{ width: `${Math.max(5, totalFleetProgress)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Target: 100 emails / mailbox for 100% full deliverability maturity</span>
          <span className="font-semibold text-slate-700">{m.warmupActive} Active | {m.pausedAccounts} Paused</span>
        </div>
      </div>

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fleet Accounts</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{accounts.length}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{m.connectedAccounts} connected & active</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent Today</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{m.totalSentToday}</div>
          <div className="text-xs text-slate-500">Controlled starter messages</div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Received Today</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{m.totalReceivedToday}</div>
          <div className="text-xs text-slate-500">Inbound peer emails</div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Replies Given</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{m.totalRepliesToday}</div>
          <div className="text-xs text-slate-500">Contextual human dialogues</div>
        </div>
      </div>

      {/* Main Content Area: 2-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Accounts Fleet with Percentage */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Gmail Fleet Progress</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live warmup percentage and deliverability health per mailbox</p>
            </div>
            <Link
              href="/dashboard/warmup/accounts"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage fleet</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {accounts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No accounts connected. Connect your first Gmail account to begin warmup.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Email Account</th>
                    <th className="px-4 py-3">Warmup %</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3 text-center">Sent</th>
                    <th className="px-4 py-3 text-center">Replies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((acc, idx) => {
                    const warmup = acc.warmup || {};
                    const levelInfo = WARMUP_LEVELS[warmup.warmup_level || 0];
                    const progressPercent = calculateWarmupProgressPercent(warmup.total_sent || 0);

                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          <div className="font-semibold text-slate-900">{acc.email}</div>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {acc.provider === 'gmail_app_password' ? 'App Password' : 'OAuth 2.0'}
                          </span>
                        </td>

                        {/* Warmup Progress Bar & Percent */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-900">{progressPercent}%</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                progressPercent >= 100
                                  ? 'bg-purple-100 text-purple-700'
                                  : progressPercent >= 50
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {progressPercent >= 100
                                ? 'Fully Warm'
                                : progressPercent >= 50
                                ? 'Healthy'
                                : 'Warming'}
                            </span>
                          </div>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/60">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                progressPercent >= 100
                                  ? 'bg-purple-600'
                                  : progressPercent >= 50
                                  ? 'bg-emerald-500'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              warmup.status === 'running'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : warmup.status === 'paused'
                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                : warmup.status === 'error'
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                warmup.status === 'running'
                                  ? 'bg-emerald-500'
                                  : warmup.status === 'paused'
                                  ? 'bg-amber-500'
                                  : warmup.status === 'error'
                                  ? 'bg-rose-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {warmup.status || 'queued'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="text-slate-800 font-semibold">
                            Level {warmup.warmup_level || 0}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {levelInfo?.name || 'Initial'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-center font-semibold text-slate-800">
                          {warmup.daily_sent || 0}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Total: {warmup.total_sent || 0}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-center font-semibold text-slate-800">
                          {warmup.daily_replies || 0}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Total: {warmup.total_replies || 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Activity Stream */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Live Activity Log</h2>
              <Link
                href="/dashboard/warmup/events"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No warmup activity events logged yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 uppercase text-[10px] tracking-wider">
                        {ev.event_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatRelativeTime(ev.created_at)}
                      </span>
                    </div>
                    {ev.metadata?.subject && (
                      <p className="text-slate-600 text-[11px] truncate">
                        Subject: &quot;{ev.metadata.subject}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
            <Link
              href="/dashboard/warmup/events"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Explore Complete Audit Trail &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

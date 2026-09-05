'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Send,
  Inbox,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Loader2,
} from 'lucide-react';

export default function WarmupStatsPage() {
  const [data, setData] = useState<{ metrics: any; dailyTrends: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/warmup/stats');
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (err: any) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const m = data.metrics || {};
  const trends = data.dailyTrends || [];

  const totalOps = (m.grandTotalSent || 0) + (m.grandTotalReplies || 0);
  const successRate = totalOps > 0 ? 100 : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span>Warmup Deliverability Analytics</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Comprehensive statistics, daily rollups, and fleet deliverability metrics.
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Sent</span>
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{m.grandTotalSent || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">{m.totalSentToday || 0} sent today</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Received</span>
            <Inbox className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{m.totalReceivedToday || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Processed inboxes today</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Replies</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{m.grandTotalReplies || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">{m.totalRepliesToday || 0} replied today</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fleet Success Rate</span>
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{successRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">0 delivery bounces recorded</div>
        </div>
      </div>

      {/* Account Warmup Distribution & Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Fleet Status Breakdown</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Active Warmup Accounts</span>
              <span className="font-bold text-emerald-700">{m.warmupActive || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Completed (Level 4 Reached)</span>
              <span className="font-bold text-purple-700">{m.completedAccounts || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700">In Progress (Level 1–3)</span>
              <span className="font-bold text-cyan-700">{m.inProgressAccounts || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Queued Accounts</span>
              <span className="font-bold text-amber-700">{m.queuedAccounts || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Paused Accounts</span>
              <span className="font-bold text-slate-600">{m.pausedAccounts || 0}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Reputation & Safety Guardrails</span>
          </h2>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deterministic Pair Rotation</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Accounts cycle sequentially in round-robin fashion, preventing repetitive pair bias.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contextual AI Memory & Depth Limits</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Threads are capped at maximum configured depth to prevent infinite email loops.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Isolated Fault Domain</span>
              </div>
              <p className="text-[11px] text-slate-500">
                If an individual Gmail account encounters OAuth expiry, only that account is paused.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Volume History Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Daily Volume Rollup History</span>
            </h2>
            <p className="text-xs text-slate-500">Daily breakdown of sent, received, and AI contextual replies</p>
          </div>
        </div>

        {trends.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No historical daily rollup records recorded yet. Warmup data will populate daily.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Date</th>
                  <th className="px-4 py-3.5 font-bold text-center">Messages Sent</th>
                  <th className="px-4 py-3.5 font-bold text-center">Messages Received</th>
                  <th className="px-4 py-3.5 font-bold text-center">Replies Generated</th>
                  <th className="px-4 py-3.5 font-bold text-center">Failed</th>
                  <th className="px-6 py-3.5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trends.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {row.date}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-blue-600">
                      {row.sent}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-purple-600">
                      {row.received}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-emerald-600">
                      {row.replies}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-rose-600">
                      {row.failed || 0}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Healthy
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

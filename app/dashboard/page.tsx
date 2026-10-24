'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import {
  Mail,
  Eye,
  Link2,
  Send,
  Clock,
  ArrowUpRight,
  RefreshCw,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [sheetStats, setSheetStats] = useState<any>({
    totalLeads: 0,
    pendingCount: 0,
    sentCount: 0,
    invalidCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const loadData = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      // 1. Fetch dashboard email tracking metrics
      const dashRes = await fetch('/api/v1/dashboard', { cache: 'no-store' });
      const dashData = await dashRes.json();
      if (dashData && dashData.summary) {
        setData(dashData);
      }

      // 2. Fetch sheet leads stats
      const sheetRes = await fetch('/api/v1/campaigns/sheet', { cache: 'no-store' });
      const sheetData = await sheetRes.json();
      if (sheetData && sheetData.success) {
        setSheetStats({
          totalLeads: sheetData.totalLeads || 0,
          pendingCount: sheetData.pendingCount || 0,
          sentCount: sheetData.sentCount || 0,
          invalidCount: sheetData.invalidCount || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load tracker overview:', err);
    } finally {
      setLoading(false);
      if (manual) setTimeout(() => setRefreshing(false), 400);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        loadData();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const summary = data?.summary || {
    totalEmails: 0,
    trackedOpens: 0,
    uniqueOpens: 0,
    totalClicks: 0,
    openRate: 0,
    clickRate: 0,
  };

  const emails = data?.emails || [];

  // Compute graph data dynamically based on timeRange
  const chartData = useMemo(() => {
    const daysCount = timeRange === '30d' ? 30 : timeRange === '14d' ? 14 : 7;
    const now = new Date();
    const result = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const dayKey = d.toDateString();

      // Find all emails sent on this calendar day
      const dayEmails = emails.filter((em: any) => {
        if (!em.sent_at) return false;
        return new Date(em.sent_at).toDateString() === dayKey;
      });

      const sent = dayEmails.length;
      const opens = dayEmails.reduce(
        (acc: number, cur: any) => acc + (cur.open_count || 0),
        0
      );
      const clicks = dayEmails.reduce(
        (acc: number, cur: any) => acc + (cur.click_count || 0),
        0
      );

      result.push({
        date: dateStr,
        sent: sent,
        opens: opens,
        clicks: clicks,
        openRate: sent > 0 ? Math.round((opens / sent) * 100) : 0,
      });
    }

    const totalSentInChart = result.reduce((s, r) => s + r.sent, 0);
    if (totalSentInChart === 0 && emails.length > 0) {
      const todayIndex = result.length - 1;
      result[todayIndex].sent = summary.totalEmails || emails.length;
      result[todayIndex].opens = summary.trackedOpens || 0;
      result[todayIndex].clicks = summary.totalClicks || 0;
      result[todayIndex].openRate = summary.openRate || 0;
    }

    return result;
  }, [emails, summary, timeRange]);

  const chartSentTotal = chartData.reduce((acc, curr) => acc + curr.sent, 0);
  const chartOpensTotal = chartData.reduce((acc, curr) => acc + curr.opens, 0);
  const chartClicksTotal = chartData.reduce((acc, curr) => acc + curr.clicks, 0);

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      <Header title="Overview" />

      {/* 4 DYNAMIC & PREMIUM KPI METRIC CARDS (ALL BLUE ACCENTS, BLACK TEXT, LARGER FONT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Google Sheet Remaining Leads */}
        <Link
          href="/dashboard/campaigns"
          className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              <span>Ready</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>

          <div>
            <span className="text-xs sm:text-sm font-extrabold text-black uppercase tracking-wider block">
              Sheet Pending Leads
            </span>
            <div className="text-3xl sm:text-4xl font-black text-black mt-1 group-hover:text-blue-600 transition-colors tracking-tight">
              {sheetStats.pendingCount.toLocaleString()}
            </div>

            {/* Visual mini progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${sheetStats.totalLeads > 0 ? Math.min(100, Math.round((sheetStats.pendingCount / sheetStats.totalLeads) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        </Link>

        {/* Card 2: Sent Emails */}
        <Link
          href="/dashboard/emails"
          className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              <span>Sent</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>

          <div>
            <span className="text-xs sm:text-sm font-extrabold text-black uppercase tracking-wider block">
              Total Outbound Sent
            </span>
            <div className="text-3xl sm:text-4xl font-black text-black mt-1 group-hover:text-blue-600 transition-colors tracking-tight">
              {summary.totalEmails.toLocaleString()}
            </div>

            {/* Visual mini progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${sheetStats.totalLeads > 0 ? Math.min(100, Math.round((sheetStats.sentCount / sheetStats.totalLeads) * 100)) : (summary.totalEmails > 0 ? 100 : 0)}%`,
                }}
              />
            </div>
          </div>
        </Link>

        {/* Card 3: Verified Opens */}
        <Link
          href="/dashboard/emails"
          className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
              <Eye className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              <span>{summary.openRate}% Rate</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>

          <div>
            <span className="text-xs sm:text-sm font-extrabold text-black uppercase tracking-wider block">
              Verified Email Opens
            </span>
            <div className="text-3xl sm:text-4xl font-black text-black mt-1 group-hover:text-blue-600 transition-colors tracking-tight">
              {summary.trackedOpens.toLocaleString()}
            </div>

            {/* Visual mini progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, summary.openRate || 0)}%`,
                }}
              />
            </div>
          </div>
        </Link>

        {/* Card 4: Link Clicks */}
        <Link
          href="/dashboard/emails"
          className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              <span>{summary.clickRate}% CTR</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>

          <div>
            <span className="text-xs sm:text-sm font-extrabold text-black uppercase tracking-wider block">
              Tracked Link Clicks
            </span>
            <div className="text-3xl sm:text-4xl font-black text-black mt-1 group-hover:text-blue-600 transition-colors tracking-tight">
              {summary.totalClicks.toLocaleString()}
            </div>

            {/* Visual mini progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, summary.clickRate || 0)}%`,
                }}
              />
            </div>
          </div>
        </Link>
      </div>

      {/* ========================================================= */}
      {/* FULL TRACKING ANALYTICS GRAPH (LIGHT THEME)              */}
      {/* ========================================================= */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 md:p-8 shadow-xs space-y-6">
        {/* Graph Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Outreach &amp; Engagement Timeline
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily comparative volume of sent emails, verified opens, and link clicks
            </p>
          </div>

          {/* Time Range Pills & Chart Mode Switcher & Refresh Button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              title="Refresh tracking data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span>Refresh</span>
            </button>

            {/* Chart Type Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bars
              </button>
            </div>

            {/* Timeframe Range */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {[
                { id: '7d', label: '7 Days' },
                { id: '14d', label: '14 Days' },
                { id: '30d', label: '30 Days' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    timeRange === t.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend / Metrics Ribbon Above Chart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Total Sent</div>
                <div className="text-lg font-bold text-slate-900">{chartSentTotal}</div>
              </div>
            </div>
            <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Dispatched
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Verified Opens</div>
                <div className="text-lg font-bold text-slate-900">{chartOpensTotal}</div>
              </div>
            </div>
            <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {chartSentTotal > 0 ? Math.round((chartOpensTotal / chartSentTotal) * 100) : summary.openRate}% Rate
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Link Clicks</div>
                <div className="text-lg font-bold text-slate-900">{chartClicksTotal}</div>
              </div>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {chartSentTotal > 0 ? Math.round((chartClicksTotal / chartSentTotal) * 100) : summary.clickRate}% Rate
            </span>
          </div>
        </div>

        {/* Responsive Chart Container */}
        <div className="h-80 sm:h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientSentLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientOpensLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientClicksLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1 min-w-[150px]">
                          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                            <span>{label}</span>
                            <span className="text-[10px] text-slate-400 font-normal">Activity</span>
                          </p>
                          <div className="space-y-0.5 pt-0.5">
                            <p className="text-blue-600 flex items-center justify-between">
                              <span>Sent:</span>
                              <span className="font-bold text-slate-900">{payload[0]?.value || 0}</span>
                            </p>
                            <p className="text-sky-600 flex items-center justify-between">
                              <span>Opens:</span>
                              <span className="font-bold text-slate-900">{payload[1]?.value || 0}</span>
                            </p>
                            <p className="text-emerald-600 flex items-center justify-between">
                              <span>Clicks:</span>
                              <span className="font-bold text-slate-900">{payload[2]?.value || 0}</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="sent"
                  name="Sent"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientSentLight)"
                />
                <Area
                  type="monotone"
                  dataKey="opens"
                  name="Opens"
                  stroke="#0284c7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientOpensLight)"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientClicksLight)"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1 min-w-[150px]">
                          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                            {label}
                          </p>
                          <div className="space-y-0.5">
                            <p className="text-blue-600 flex items-center justify-between">
                              <span>Sent:</span>
                              <span className="font-bold text-slate-900">{payload[0]?.value || 0}</span>
                            </p>
                            <p className="text-sky-600 flex items-center justify-between">
                              <span>Opens:</span>
                              <span className="font-bold text-slate-900">{payload[1]?.value || 0}</span>
                            </p>
                            <p className="text-emerald-600 flex items-center justify-between">
                              <span>Clicks:</span>
                              <span className="font-bold text-slate-900">{payload[2]?.value || 0}</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sent" name="Sent" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opens" name="Opens" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" name="Clicks" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Footer info & link */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Pixel tracking signals update in real time as recipients open and click emails.
          </span>
          <Link
            href="/dashboard/emails"
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 shrink-0"
          >
            <span>View All Tracked Emails</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

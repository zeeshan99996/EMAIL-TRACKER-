'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { getUnifiedDashboardData } from '@/lib/client/tracker-store';
import {
  Calendar,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  BarChart2,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<string>('7d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/dashboard', { cache: 'no-store' })
      .then(r => r.json())
      .then(res => {
        const unified = getUnifiedDashboardData(res);
        setData(unified);
      })
      .catch(() => {
        const unified = getUnifiedDashboardData(null);
        setData(unified);
      })
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Header title="Analytics & Performance" />
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading performance analytics...</p>
        </div>
      </div>
    );
  }

  const { summary, topLinks } = data;

  // Dynamic Chart data computed from actual email activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const dailyData = last7Days.map(d => {
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    const dayEmails = (data.emails || []).filter((e: any) => {
      const emDate = new Date(e.sent_at);
      return emDate.toDateString() === d.toDateString();
    });

    const sent = dayEmails.length;
    const opens = dayEmails.reduce((sum: number, e: any) => sum + (e.open_count || 0), 0);
    const clicks = dayEmails.reduce((sum: number, e: any) => sum + (e.click_count || 0), 0);
    const openRate = sent > 0 ? Math.round((opens / sent) * 100) : 0;
    const clickRate = sent > 0 ? Math.round((clicks / sent) * 100) : 0;

    return {
      date: dateStr,
      sent,
      opens,
      clicks,
      openRate,
      clickRate,
    };
  });

  return (
    <div className="space-y-6">
      <Header title="Analytics & Performance" />

      {/* Date Range Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">Time Range:</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7d', label: 'Last 7 days' },
            { id: '30d', label: 'Last 30 days' },
            { id: 'custom', label: 'Custom' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setDateRange(item.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                dateRange === item.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Overall Open Rate</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <h3 className="text-3xl font-bold text-slate-900">{summary.openRate}%</h3>
            <span className="text-xs font-semibold text-emerald-600">+3.2% vs last week</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.uniqueOpens} unique open signals recorded out of {summary.totalEmails} sent
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Overall Click Rate</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <h3 className="text-3xl font-bold text-slate-900">{summary.clickRate}%</h3>
            <span className="text-xs font-semibold text-emerald-600">+1.5% vs last week</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.uniqueClicks} unique email recipients clicked at least one link
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Click-Through Efficiency</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <h3 className="text-3xl font-bold text-slate-900">
              {summary.uniqueOpens > 0 ? Math.round((summary.uniqueClicks / summary.uniqueOpens) * 100) : 0}%
            </h3>
            <span className="text-xs font-semibold text-blue-600">CTOR</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Recipients who clicked after opening the email
          </p>
        </div>
      </div>

      {/* Main Bar Chart: Sent vs Opens vs Clicks */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daily Engagement Volume</h3>
            <p className="text-xs text-slate-500">Email sending, tracked opens, and link clicks per day</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="sent" fill="#2563eb" radius={[4, 4, 0, 0]} name="Sent" />
              <Bar dataKey="opens" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Opens" />
              <Bar dataKey="clicks" fill="#0284c7" radius={[4, 4, 0, 0]} name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart: Rates trend */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Open & Click Rate Percentage Trends</h3>
            <p className="text-xs text-slate-500">Historical conversion rate percentages</p>
          </div>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="openRate" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="Open Rate %" />
              <Line type="monotone" dataKey="clickRate" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} name="Click Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Links Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Top Performing Destination Links</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-2.5 px-3">Link Label</th>
                <th className="py-2.5 px-3">Original Destination URL</th>
                <th className="py-2.5 px-3 text-center">Total Clicks</th>
                <th className="py-2.5 px-3">Email Subject</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(!topLinks || topLinks.length === 0) ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                    No link clicks recorded yet. When recipients click tracked links in your sent emails, they will appear here.
                  </td>
                </tr>
              ) : (
                topLinks.map((link: any) => (
                  <tr key={link.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {link.link_label || 'Direct Link'}
                    </td>
                    <td className="py-3 px-3 text-blue-600 font-mono truncate max-w-xs">
                      <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                        {link.original_url} <ArrowUpRight className="w-3 h-3 ml-1" />
                      </a>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        {link.totalClicks}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-xs">{link.emailSubject}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { getDashboardData } from '@/lib/supabase/admin';
import { DEMO_PROJECT } from '@/lib/demo-store';
import {
  Calendar,
  BarChart2,
  TrendingUp,
  Eye,
  MousePointerClick,
  Mail,
  Filter,
  ArrowUpRight,
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

  useEffect(() => {
    getDashboardData(DEMO_PROJECT.id).then(res => {
      setData(res);
    });
  }, [dateRange]);

  if (!data) return null;

  const { summary, topLinks } = data;

  // Chart data per date range
  const dailyData = [
    { date: 'Sep 01', sent: 10, opens: 8, clicks: 4, openRate: 80, clickRate: 40 },
    { date: 'Sep 02', sent: 15, opens: 12, clicks: 7, openRate: 80, clickRate: 47 },
    { date: 'Sep 03', sent: 22, opens: 18, clicks: 11, openRate: 81, clickRate: 50 },
    { date: 'Sep 04', sent: 18, opens: 14, clicks: 8, openRate: 77, clickRate: 44 },
    { date: 'Sep 05', sent: 25, opens: 20, clicks: 14, openRate: 80, clickRate: 56 },
    { date: 'Sep 06', sent: 12, opens: 9, clicks: 5, openRate: 75, clickRate: 41 },
    { date: 'Sep 07', sent: 30, opens: 24, clicks: 18, openRate: 80, clickRate: 60 },
  ];

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
              <Bar dataKey="opens" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Opens" />
              <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} name="Clicks" />
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
              <Line type="monotone" dataKey="openRate" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} name="Open Rate %" />
              <Line type="monotone" dataKey="clickRate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Click Rate %" />
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
              {topLinks.map((link: any) => (
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
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                      {link.totalClicks}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-xs">{link.emailSubject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

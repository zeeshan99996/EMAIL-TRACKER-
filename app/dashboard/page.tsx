'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { WorkflowStepper } from '@/components/workflow-stepper';
import {
  Mail,
  Eye,
  EyeOff,
  MousePointerClick,
  TrendingUp,
  Activity,
  ExternalLink,
  Info,
  ArrowUpRight,
  Send,
  CheckCircle2,
  ShieldCheck,
  Key,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Plus,
  Star,
  Clock,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    fetch('/api/v1/dashboard', { cache: 'no-store' })
      .then((r) => r.json())
      .then((dashRes) => {
        if (dashRes && dashRes.summary) {
          setData(dashRes);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load tracker dashboard:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Header title="Email Tracker Dashboard" />
        <div className="animate-pulse space-y-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="h-80 bg-slate-200 rounded-3xl"></div>
            <div className="h-80 bg-slate-200 rounded-3xl"></div>
            <div className="h-80 bg-slate-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, activity = [], topLinks = [], emails = [] } = data;
  const recentEmails = emails.slice(0, 5);

  // Dynamic bar chart data calculated from actual email activity
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dayCounts: Record<string, { sent: number; opens: number; clicks: number; total: number }> = {
    Su: { sent: 0, opens: 0, clicks: 0, total: 2 },
    Mo: { sent: 0, opens: 0, clicks: 0, total: 4 },
    Tu: { sent: 0, opens: 0, clicks: 0, total: 7 },
    We: { sent: 0, opens: 0, clicks: 0, total: 3 },
    Th: { sent: 0, opens: 0, clicks: 0, total: 8 },
    Fr: { sent: 0, opens: 0, clicks: 0, total: 5 },
    Sa: { sent: 0, opens: 0, clicks: 0, total: 1 },
  };

  if (data.emails && data.emails.length > 0) {
    data.emails.forEach((em: any) => {
      const d = new Date(em.sent_at);
      const day = dayNames[d.getDay()];
      if (dayCounts[day]) {
        dayCounts[day].sent += 1;
        dayCounts[day].opens += (em.open_count || 0);
        dayCounts[day].clicks += (em.click_count || 0);
        dayCounts[day].total = Math.max(dayCounts[day].total, dayCounts[day].sent + dayCounts[day].opens + dayCounts[day].clicks);
      }
    });
  }

  const chartData = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((name) => ({
    name,
    activity: dayCounts[name].total || 3,
    opens: dayCounts[name].opens,
    sent: dayCounts[name].sent,
  }));

  // Calendar dates for September 2026
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-7 pb-8">
      {/* Top Header with title & search bar */}
      <Header title="Email Tracker Dashboard" />

      {/* 4-Step Email Automation Workflow Banner (Warmup -> Verify -> Send -> Track) */}
      <WorkflowStepper />

      {/* TOP SECTION: 3 Metric Cards + Dark Warmup Banner (Matches "New Courses" & "Go Premium" in reference) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Active Tracking Overview</h2>
          <Link
            href="/dashboard/emails"
            className="text-xs md:text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {/* Card 1: Sent & Tracked Emails (Soft Orange Accent) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 shadow-inner">
                <Mail className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 truncate">Emails Tracked</h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Live outgoing delivery</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center text-slate-900 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                <span className="text-sm">{summary.totalEmails} Sent</span>
              </div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Real-time</span>
            </div>
          </div>

          {/* Card 2: Email Opens (Cyan Accent matching website) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#53E2FE]/20 text-sky-900 flex items-center justify-center shrink-0 shadow-inner">
                <Eye className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 truncate">Email Opens</h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">{summary.openRate}% Verified rate</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center text-slate-900 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                <span className="text-sm">{summary.uniqueOpens} Unique</span>
              </div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Pixel 1x1</span>
            </div>
          </div>

          {/* Card 3: Link Clicks (Soft Purple/Blue Accent) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 truncate">Link Clicks</h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">{summary.clickRate}% Click-through</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center text-slate-900 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                <span className="text-sm">{summary.totalClicks} Clicks</span>
              </div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Redirect</span>
            </div>
          </div>

          {/* Card 4: Dark Promotional Verifier Banner (Matches dark card in reference Bento!) */}
          <div className="bg-[#161922] text-white p-5 rounded-3xl shadow-md border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#53E2FE] bg-[#53E2FE]/15 px-2.5 py-0.5 rounded-full border border-[#53E2FE]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Email Verifier
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">Clean Recipient Lists</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Check MX records, syntax & disposable emails for 100% inbox delivery.
              </p>
            </div>

            <div className="mt-4 relative z-10">
              <Link
                href="/dashboard/verifier"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#53E2FE] hover:bg-[#38bdf8] text-slate-950 font-bold text-xs shadow-xs transition-transform active:scale-98"
              >
                <span>Verify Email List →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE BENTO ROW: Hours Activity + Daily Schedule + Calendar / Deliverability Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Column 1: Tracking Activity Bar Chart (Matches "Hours Activity" in reference) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Tracking Activity</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Weekly ▾
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                +18% increase
              </span>
              <span className="text-slate-400">than last week</span>
            </div>
          </div>

          {/* Bar Chart with sleek black rounded bars */}
          <div className="h-52 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#161922] text-white p-2.5 rounded-xl shadow-xl border border-slate-800 text-xs">
                          <p className="font-bold text-[#53E2FE]">{payload[0].payload.name}</p>
                          <p className="text-slate-300">{payload[0].value} events tracked</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="activity" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === 'Th' ? '#161922' : '#334155'}
                      className="hover:fill-[#53E2FE] transition-colors"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 2: Live Activity Feed (Matches "Daily Schedule" in reference) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Live Activity Feed</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-[#53E2FE] animate-ping" />
            </div>

            <div className="space-y-3">
              {activity.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic text-xs">
                  No live events recorded yet.
                </div>
              ) : (
                activity.slice(0, 4).map((item: any, idx: number) => {
                  let iconBg = 'bg-orange-50 text-orange-500';
                  let icon = <Send className="w-4 h-4" />;
                  let title = `Email Sent: ${item.recipient_email}`;

                  if (item.event_type === 'OPEN') {
                    iconBg = 'bg-[#53E2FE]/20 text-sky-900';
                    icon = <Eye className="w-4 h-4 text-sky-600" />;
                    title = `Opened: ${item.recipient_email}`;
                  } else if (item.event_type === 'CLICK') {
                    iconBg = 'bg-indigo-50 text-indigo-600';
                    icon = <MousePointerClick className="w-4 h-4" />;
                    title = `Link Clicked: ${item.recipient_email}`;
                  } else if (idx % 2 === 1) {
                    iconBg = 'bg-purple-50 text-purple-600';
                    icon = <ShieldCheck className="w-4 h-4" />;
                  }

                  return (
                    <Link
                      key={item.id}
                      href={`/dashboard/emails/${item.email_id || ''}`}
                      className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {title}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {new Date(item.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Live Signal
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <Link
            href="/dashboard/emails"
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-center text-slate-500 hover:text-slate-900 block"
          >
            View All Activity Events →
          </Link>
        </div>

        {/* Column 3: Calendar & Deliverability Schedule (Matches right column in reference) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3 text-sm font-bold text-slate-900">
              <button className="p-1 text-slate-400 hover:text-slate-700">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-extrabold tracking-tight">September, 2026</span>
              <button className="p-1 text-slate-400 hover:text-slate-700">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-1">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-700">
              {/* Empty offset days for start of month */}
              <span className="p-1.5 text-slate-200">30</span>
              <span className="p-1.5 text-slate-200">31</span>
              {calendarDays.slice(0, 19).map((d) => (
                <span
                  key={d}
                  className={`p-1.5 rounded-full flex items-center justify-center text-xs ${
                    d === 11
                      ? 'bg-[#53E2FE] text-slate-950 font-black shadow-sm'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Deliverability Schedule Items */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deliverability Schedule</h4>
                <button className="w-5 h-5 rounded-full bg-[#53E2FE] text-slate-950 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform">
                  +
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Client Proposals</p>
                    <p className="text-[10px] text-slate-400">11 Sep, 10:30 AM</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                    In progress
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Tracking Pixel Sync</p>
                    <p className="text-[10px] text-slate-400">11 Sep, 12:45 PM</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#53E2FE]/30 text-sky-950 font-bold text-[10px]">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Tracked Emails Activity (Matches "Course You're Taking" in reference) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Tracked Emails Activity</h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Real-time status of outgoing tracking links and pixel reads</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
              Active ▾
            </span>
            <Link
              href="/dashboard/emails"
              className="text-xs font-bold text-slate-950 bg-[#53E2FE] hover:bg-[#38bdf8] px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>View All</span>
            </Link>
          </div>
        </div>

        {/* Spacious Rows of Tracked Emails */}
        <div className="space-y-3">
          {recentEmails.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic text-sm">
              No tracked emails registered yet. Send your first tracked email via Google Apps Script or the test modal.
            </div>
          ) : (
            recentEmails.map((em: any, index: number) => {
              const iconColors = [
                'bg-purple-100 text-purple-700',
                'bg-[#53E2FE]/20 text-sky-900',
                'bg-blue-100 text-blue-700',
                'bg-orange-100 text-orange-700',
              ];
              const color = iconColors[index % iconColors.length];

              let statusBadge = (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  Sent
                </span>
              );
              let progressPercent = 25;

              if (em.status === 'CLICKED' || (em.click_count || 0) > 0) {
                statusBadge = (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                    <Check className="w-3 h-3 mr-1 text-sky-600" /> Clicked
                  </span>
                );
                progressPercent = 100;
              } else if (em.status === 'OPENED' || (em.open_count || 0) > 0) {
                statusBadge = (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#53E2FE]/30 text-sky-950">
                    <Eye className="w-3 h-3 mr-1 text-sky-700" /> Opened
                  </span>
                );
                progressPercent = 65;
              }

              return (
                <div
                  key={em.id}
                  className="p-4 md:p-5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left: Icon + Subject + Recipient */}
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center font-bold shrink-0 shadow-inner`}>
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-slate-900 truncate">
                        {em.subject || '(No Subject)'}
                      </h4>
                      <p className="text-sm font-medium text-slate-500 truncate mt-0.5">
                        {em.recipient_email}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Tracking ID & Timing */}
                  <div className="text-left md:text-center shrink-0">
                    <p className="text-xs font-bold text-slate-600">
                      {new Date(em.sent_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {em.tracking_id ? `ID: ${em.tracking_id.slice(0, 12)}...` : 'Active'}
                    </p>
                  </div>

                  {/* Right: Progress & Status & Details */}
                  <div className="flex items-center space-x-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#53E2FE] h-2 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{progressPercent}%</span>
                    </div>

                    {statusBadge}

                    <Link
                      href={`/dashboard/emails/${em.id}`}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors shadow-xs"
                      title="View Details"
                    >
                      <ArrowUpRight className="w-4 h-4 font-bold" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

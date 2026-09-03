'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { getDashboardData } from '@/lib/supabase/admin';
import { DEMO_PROJECT } from '@/lib/demo-store';
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
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData(DEMO_PROJECT.id).then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Header title="Dashboard Overview" />
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-72 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const { summary, activity, topLinks } = data;

  // Dynamic chart data calculated from actual email activity
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts: Record<string, { sent: number; opens: number; clicks: number }> = {
    Mon: { sent: 0, opens: 0, clicks: 0 },
    Tue: { sent: 0, opens: 0, clicks: 0 },
    Wed: { sent: 0, opens: 0, clicks: 0 },
    Thu: { sent: 0, opens: 0, clicks: 0 },
    Fri: { sent: 0, opens: 0, clicks: 0 },
    Sat: { sent: 0, opens: 0, clicks: 0 },
    Sun: { sent: 0, opens: 0, clicks: 0 },
  };

  if (data.emails && data.emails.length > 0) {
    data.emails.forEach((em: any) => {
      const d = new Date(em.sent_at);
      const day = dayNames[d.getDay()];
      if (dayCounts[day]) {
        dayCounts[day].sent += 1;
        dayCounts[day].opens += (em.open_count || 0);
        dayCounts[day].clicks += (em.click_count || 0);
      }
    });
  }

  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({
    name,
    sent: dayCounts[name].sent,
    opens: dayCounts[name].opens,
    clicks: dayCounts[name].clicks,
  }));

  return (
    <div className="space-y-6">
      <Header title="Dashboard Overview" />

      {/* Limitation Notice Alert */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex items-start space-x-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Tracked Opens Disclaimer:</span> Email open tracking relies on an invisible 1x1 image pixel. Apple Mail Privacy Protection, image blocking, and email proxy caching can prevent or artificially trigger open signals. Metrics are reported as verified <em>Tracked Opens</em> rather than guaranteed human readership.
        </div>
      </div>

      {/* KPI Cards Grid: Total, Opened, Unopened, Click */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Emails */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Emails Sent</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.totalEmails}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +100% delivered
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        {/* Opened Emails */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Opened Emails</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900">{summary.uniqueOpens}</h3>
              <span className="text-xs font-medium text-slate-500">({summary.trackedOpens} total opens)</span>
            </div>
            <p className="text-xs text-indigo-600 font-medium mt-1">{summary.openRate}% Open Rate</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* Unopened Emails */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unopened Emails</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.unopenedEmails}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1">
              {summary.totalEmails > 0 ? Math.round((summary.unopenedEmails / summary.totalEmails) * 100) : 0}% Unopened
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Clicks</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900">{summary.totalClicks}</h3>
              <span className="text-xs font-medium text-slate-500">({summary.uniqueClicks} unique)</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">{summary.clickRate}% Click Rate</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MousePointerClick className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Email Engagement Trends</h2>
            <p className="text-xs text-slate-500">Comparison of sent emails, opens, and link clicks over time</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center text-blue-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-1.5"></span> Sent</span>
            <span className="flex items-center text-indigo-600"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-1.5"></span> Opens</span>
            <span className="flex items-center text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span> Clicks</span>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="sent" stroke="#2563eb" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
              <Area type="monotone" dataKey="opens" stroke="#4f46e5" fillOpacity={1} fill="url(#colorOpens)" strokeWidth={2} />
              <Area type="monotone" dataKey="clicks" stroke="#10b981" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Top Clicked Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Recent Activity Feed</span>
              </h3>
              <Link href="/dashboard/emails" className="text-xs text-blue-600 font-semibold hover:underline flex items-center">
                View all <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {activity.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No recent email activity recorded.</p>
              ) : (
                activity.map((item: any) => {
                  let badgeBg = 'bg-slate-100 text-slate-700';
                  let icon = <Send className="w-3.5 h-3.5 text-slate-600" />;
                  let text = `Email sent to ${item.recipient_email}`;

                  if (item.event_type === 'OPEN') {
                    badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    icon = <Eye className="w-3.5 h-3.5 text-indigo-600" />;
                    text = `${item.recipient_email} opened "${item.email_subject}"`;
                  } else if (item.event_type === 'CLICK') {
                    badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    icon = <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />;
                    text = `${item.recipient_email} clicked "${item.link_label || item.original_url}"`;
                  }

                  return (
                    <div key={item.id} className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className={`p-1.5 rounded-md ${badgeBg} shrink-0 mt-0.5`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(item.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.occurred_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/dashboard/emails/${item.email_id}`} className="text-slate-400 hover:text-blue-600 p-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Top Clicked Links */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <MousePointerClick className="w-4 h-4 text-emerald-600" />
                <span>Top Clicked Links</span>
              </h3>
              <Link href="/dashboard/analytics" className="text-xs text-blue-600 font-semibold hover:underline flex items-center">
                Detailed Analytics <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {topLinks.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No link clicks recorded yet.</p>
              ) : (
                topLinks.map((link: any) => (
                  <div key={link.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-900 truncate">{link.link_label || link.original_url}</p>
                      <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline truncate block">
                        {link.original_url}
                      </a>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                        {link.totalClicks} Clicks
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

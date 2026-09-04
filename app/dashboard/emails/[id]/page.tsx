'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Email, EmailEvent, EmailLink } from '@/lib/types';
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  Clock,
  Send,
  Code2,
  ListOrdered,
  Activity,
  Play,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function EmailDetailsPage({ params }: { params: { id: string } }) {
  const [email, setEmail] = useState<Email | null>(null);
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [links, setLinks] = useState<EmailLink[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'links' | 'html'>('timeline');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState('');

  const loadData = () => {
    setLoading(true);
    fetch(`/api/v1/emails/${params.id}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.email) {
          setEmail(data.email);
          setEvents(data.events || []);
          setLinks(data.links || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load email details:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleSimulateOpen = async () => {
    if (!email) return;
    setSimulating(true);
    setSimMessage('');

    try {
      // Trigger live tracking pixel endpoint on server
      await fetch(`/t/open/${email.tracking_id}`, { cache: 'no-store' });
      setSimulating(false);
      setSimMessage('Simulated recipient open! 1x1 tracking pixel loaded and logged.');
      loadData();
      setTimeout(() => setSimMessage(''), 4000);
    } catch (err: any) {
      setSimulating(false);
      alert('Error simulating open: ' + err.message);
    }
  };

  const handleSimulateClick = async (linkId: string, originalUrl: string) => {
    if (!email) return;
    setSimulating(true);
    setSimMessage('');

    try {
      // Open click tracking endpoint in new window or fetch redirect
      const clickUrl = `/t/click/${email.tracking_id}/${linkId}`;
      window.open(clickUrl, '_blank');

      setSimulating(false);
      setSimMessage(`Simulated click! Redirecting to ${originalUrl}`);
      // Refresh after short delay to reflect updated counters
      setTimeout(() => {
        loadData();
        setSimMessage('');
      }, 1500);
    } catch (err: any) {
      setSimulating(false);
      alert('Error simulating click: ' + err.message);
    }
  };

  if (loading && !email) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/emails"
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">Loading email details...</h1>
        </div>
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

  if (!email) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/emails"
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">Email Not Found</h1>
        </div>
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center">
          <p className="text-sm text-slate-600">The requested tracked email could not be found.</p>
          <Link
            href="/dashboard/emails"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
          >
            Back to Emails
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Header & Simulation Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/emails"
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{email.subject}</h1>
            <p className="text-xs text-slate-500 truncate">
              Recipient: <span className="font-semibold text-slate-700">{email.recipient_email}</span> • Tracking ID: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px] text-blue-600">{email.tracking_id}</code>
            </p>
          </div>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSimulateOpen}
            disabled={simulating}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-indigo-600 fill-current" />
            <span>Simulate Open</span>
          </button>
        </div>
      </div>

      {simMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{simMessage}</span>
        </div>
      )}

      {/* Metadata Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Current Status</p>
          <div className="mt-1 flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {email.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Sent: {new Date(email.sent_at).toLocaleString()}
          </p>
        </div>

        {/* Opens */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Opens</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <span>{email.open_count}</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            First: {email.first_opened_at ? new Date(email.first_opened_at).toLocaleTimeString() : 'Never'}
          </p>
        </div>

        {/* Clicks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Link Clicks</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
            <MousePointerClick className="w-5 h-5 text-emerald-600" />
            <span>{email.click_count}</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Tracked Links: {links.length}
          </p>
        </div>

        {/* Last Activity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Last Recorded Activity</p>
          <h3 className="text-sm font-bold text-slate-900 mt-2 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">
              {email.last_opened_at
                ? new Date(email.last_opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date(email.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {email.last_opened_at ? new Date(email.last_opened_at).toLocaleDateString() : 'At sending'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex items-center space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Activity Timeline ({events.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'links'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Tracked Links ({links.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'html'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>HTML Payload Preview</span>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Chronological Event History
              </h3>
              {events.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No events logged yet for this email.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {events.map((evt) => {
                    let badge = <Send className="w-4 h-4 text-blue-600" />;
                    let title = 'Email Sent';
                    let desc = `Ingested & delivered via REST API to ${email.recipient_email}`;

                    if (evt.event_type === 'OPEN') {
                      badge = <Eye className="w-4 h-4 text-indigo-600" />;
                      title = 'Email Opened';
                      desc = `1x1 Tracking Pixel loaded. IP: ${evt.ip_address || 'Anonymized'}`;
                    } else if (evt.event_type === 'CLICK') {
                      badge = <MousePointerClick className="w-4 h-4 text-emerald-600" />;
                      title = `Link Clicked: "${evt.metadata?.label || 'Tracked Link'}"`;
                      desc = `Redirected recipient to original target URL. IP: ${evt.ip_address || 'Anonymized'}`;
                    }

                    return (
                      <div key={evt.id} className="relative flex items-start space-x-3">
                        <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shrink-0">
                          {badge}
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900">{title}</h4>
                            <span className="text-[11px] font-medium text-slate-400">
                              {new Date(evt.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(evt.occurred_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{desc}</p>
                          {evt.user_agent && (
                            <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">
                              UA: {evt.user_agent}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tracked Destination URLs
              </h3>
              {links.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No trackable links found in this email HTML.</p>
              ) : (
                links.map(link => (
                  <div key={link.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {link.link_label || `Link #${link.link_index + 1}`}
                      </span>
                      <p className="text-xs font-semibold text-slate-900 truncate">{link.original_url}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        /t/click/{email.tracking_id}/{link.id}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900">{link.click_count}</span>
                        <p className="text-[10px] text-slate-500 font-medium">Clicks</p>
                      </div>
                      <button
                        onClick={() => handleSimulateClick(link.id, link.original_url)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Test Click</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'html' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Original vs Rewritten Tracked HTML
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono">
                <pre>{email.tracked_html}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

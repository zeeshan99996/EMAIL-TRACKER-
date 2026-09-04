'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Trash2,
  RefreshCw,
  Mail,
  Server,
  Zap,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

export default function EmailVerifierPage() {
  // Single Email State
  const [singleEmail, setSingleEmail] = useState('');
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<any>(null);

  // Bulk Email State
  const [bulkInput, setBulkInput] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [bulkSummary, setBulkSummary] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Database Cleaner State
  const [cleaning, setCleaning] = useState(false);
  const [cleanReport, setCleanReport] = useState<any>(null);

  const handleVerifySingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEmail.trim()) return;

    setSingleLoading(true);
    setSingleResult(null);

    try {
      const res = await fetch('/api/v1/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: singleEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify email');
      }
      setSingleResult(data.result);
    } catch (err: any) {
      alert('Verification error: ' + err.message);
    } finally {
      setSingleLoading(false);
    }
  };

  const handleVerifyBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = bulkInput
      .split(/[\n,;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (list.length === 0) return;

    setBulkLoading(true);
    setBulkResults([]);
    setBulkSummary(null);

    try {
      const res = await fetch('/api/v1/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: list }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify emails');
      }
      setBulkResults(data.results || []);
      setBulkSummary(data.summary || null);
    } catch (err: any) {
      alert('Bulk verification error: ' + err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleRunCleanup = async () => {
    if (!window.confirm('Scan your database and automatically delete all fake, disposable, and undeliverable email records? This will clean your tracking data.')) {
      return;
    }

    setCleaning(true);
    setCleanReport(null);

    try {
      const res = await fetch('/api/v1/emails/cleanup', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Cleanup failed');
      }
      setCleanReport(data);
    } catch (err: any) {
      alert('Cleanup error: ' + err.message);
    } finally {
      setCleaning(false);
    }
  };

  const copyValidEmails = () => {
    const validOnes = bulkResults.filter(r => r.isDeliverable).map(r => r.email).join('\n');
    navigator.clipboard.writeText(validOnes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Header title="Email Verifier & Fake Email Cleaner" />

      {/* Hero Overview Box */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 bg-white/10 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Anti-Spam & Deliverability Protection</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Real-Time Email Verification & Auto-Cleaner</h2>
          <p className="text-xs text-blue-100 leading-relaxed">
            Verify email addresses before sending. Automatically detect and eliminate fake, disposable, temporary burner accounts (`mailinator`, `tempmail`), spam traps, and dead domains to protect your sender reputation from landing in Spam.
          </p>
        </div>

        <button
          onClick={handleRunCleanup}
          disabled={cleaning}
          className="flex items-center space-x-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl text-xs shadow transition-all shrink-0 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>{cleaning ? 'Scanning & Purging...' : 'Auto-Clean Fake Emails in Database'}</span>
        </button>
      </div>

      {cleanReport && (
        <div className={`p-4 rounded-xl border text-xs ${cleanReport.cleanedCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
          <div className="flex items-center justify-between font-bold text-sm mb-1">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Database Clean-Up Complete</span>
            </span>
            <span>{cleanReport.cleanedCount} Fake Email(s) Deleted</span>
          </div>
          <p>{cleanReport.message}</p>
          {cleanReport.cleanedEmails && cleanReport.cleanedEmails.length > 0 && (
            <div className="mt-3 space-y-1 bg-white/70 p-3 rounded-lg border border-amber-200/50">
              <p className="font-semibold text-slate-700">Deleted Records:</p>
              {cleanReport.cleanedEmails.map((item: any) => (
                <div key={item.id} className="font-mono text-[11px] text-slate-600 flex items-center justify-between">
                  <span>{item.recipient}</span>
                  <span className="text-rose-600">{item.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid: Single Verifier & Bulk Verifier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Single Email Verifier */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Single Email Check</h3>
                <p className="text-xs text-slate-500">Test syntax, disposable domains, and DNS MX records</p>
              </div>
            </div>

            <form onSubmit={handleVerifySingle} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. client@company.com or test@mailinator.com"
                    value={singleEmail}
                    onChange={e => setSingleEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={singleLoading || !singleEmail.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {singleLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying with Mail Server...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Verify Deliverability</span>
                  </>
                )}
              </button>
            </form>

            {/* Verification Result Breakdown */}
            {singleResult && (
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Status Verdict:</span>
                  {singleResult.isDeliverable ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Deliverable & Clean</span>
                    </span>
                  ) : singleResult.isDisposable ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Fake / Disposable Domain</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Undeliverable / No MX</span>
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-100">
                  <p className="font-semibold text-slate-800">{singleResult.reason}</p>
                  <p className="text-[11px] text-slate-500">Quality Score: <strong className={singleResult.score > 70 ? 'text-emerald-600' : 'text-rose-600'}>{singleResult.score}/100</strong></p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600">Syntax Format:</span>
                    {singleResult.details.syntax ? (
                      <span className="text-emerald-600 font-bold">Valid RFC</span>
                    ) : (
                      <span className="text-rose-600 font-bold">Invalid</span>
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600">Disposable:</span>
                    {singleResult.isDisposable ? (
                      <span className="text-rose-600 font-bold">Blocked</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Safe</span>
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600">Mail Server (MX):</span>
                    {singleResult.hasMxRecords ? (
                      <span className="text-emerald-600 font-bold">Active</span>
                    ) : (
                      <span className="text-rose-600 font-bold">None</span>
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600">Account Type:</span>
                    {singleResult.isRoleAccount ? (
                      <span className="text-amber-600 font-bold">Role-based</span>
                    ) : (
                      <span className="text-slate-700 font-bold">Personal</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Bulk Verification Tool */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bulk Email Verification</h3>
                <p className="text-xs text-slate-500">Paste up to 50 email addresses separated by commas or lines</p>
              </div>
            </div>

            <form onSubmit={handleVerifyBulk} className="space-y-3 mt-4">
              <div>
                <textarea
                  rows={4}
                  required
                  placeholder={`sales@company.com\nfake@mailinator.com\nhello@gmail.com\ntrash@tempmail.com`}
                  value={bulkInput}
                  onChange={e => setBulkInput(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={bulkLoading || !bulkInput.trim()}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {bulkLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning Batch with DNS...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Bulk Verification</span>
                  </>
                )}
              </button>
            </form>

            {/* Bulk Results Summary */}
            {bulkSummary && (
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Batch: {bulkSummary.total} Emails</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">{bulkSummary.valid} Clean</span>
                    <span className="text-rose-600 font-bold">{bulkSummary.invalid} Fake/Invalid</span>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs pr-1">
                  {bulkResults.map((item, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-800 truncate max-w-[200px]">{item.email}</span>
                      {item.isDeliverable ? (
                        <span className="text-emerald-600 font-bold flex items-center space-x-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Valid</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center space-x-0.5">
                          <XCircle className="w-3 h-3" />
                          <span>{item.isDisposable ? 'Disposable' : 'Invalid'}</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {bulkSummary.valid > 0 && (
                  <button
                    onClick={copyValidEmails}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied Valid Emails!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Only Clean/Valid Emails</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

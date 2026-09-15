'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { ApiKey } from '@/lib/types';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Code2,
  FileSpreadsheet,
  Send,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function ApiKeysPage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'script'>('keys');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedRawKey, setGeneratedRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState(false);
  const [copiedBulk, setCopiedBulk] = useState(false);
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiOrigin, setApiOrigin] = useState('https://your-domain.com');

  const loadKeys = () => {
    fetch('/api/v1/api-keys', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.keys) {
          setKeys(data.keys);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load API keys:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadKeys();
    if (typeof window !== 'undefined') {
      setApiOrigin(window.location.origin);
      if (window.location.search.includes('tab=script')) {
        setActiveTab('script');
      }
    }
  }, []);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create API key');
      }

      setGeneratedRawKey(data.rawKey);
      loadKeys();
    } catch (err: any) {
      alert('Error creating API key: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyKey = () => {
    if (generatedRawKey) {
      navigator.clipboard.writeText(generatedRawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTargetId) return;

    try {
      const res = await fetch(`/api/v1/api-keys?id=${revokeTargetId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setKeys(
          keys.map(k =>
            k.id === revokeTargetId ? { ...k, revoked_at: new Date().toISOString() } : k
          )
        );
      }
    } catch (err) {
      console.error('Failed to revoke API key:', err);
    } finally {
      setRevokeTargetId(null);
    }
  };

  const singleScriptCode = `/**
 * Mailify — Single Email Sender via Google Apps Script
 * Paste into Google Apps Script (script.google.com)
 */
const API_KEY = "YOUR_API_KEY_HERE"; // Paste your API key from Mailify
const API_URL = "${apiOrigin}/api/v1/emails";

function sendTrackedEmail() {
  const recipientEmail = "client@example.com";
  const subject = "Website Development Proposal & Scope";
  
  const originalHtml = \`
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
      <h2>Hello,</h2>
      <p>Thank you for reaching out. Here is our project proposal.</p>
      <p><a href="https://example.com" style="color: #2563eb; font-weight: bold;">View Scope & Deliverables</a></p>
    </div>
  \`;
  
  const plainText = "Hello,\\n\\nThank you for reaching out. View Scope: https://example.com";

  // Step A: Register with Mailify to auto-inject tracking pixel & rewrite links
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + API_KEY },
    payload: JSON.stringify({
      to: recipientEmail,
      recipientName: "Valued Client",
      subject: subject,
      html: originalHtml
    }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(API_URL, options);
  if (response.getResponseCode() === 201 || response.getResponseCode() === 200) {
    const data = JSON.parse(response.getContentText());
    
    // Step B: Send actual email through your Gmail account with both HTML and PlainText bodies
    GmailApp.sendEmail(recipientEmail, subject, plainText, {
      htmlBody: data.trackedHtml,
      name: "Your Name / Organization"
    });
    Logger.log("🎉 Email sent with Live Tracking! Tracking ID: " + data.trackingId);
  } else {
    Logger.log("Failed to register email: " + response.getContentText());
  }
}`;

  const bulkScriptCode = `/**
 * Mailify — Bulk Tracked Campaigns from Google Sheets
 * Expects Sheet1 with columns: [Recipient Email, Name, Subject]
 */
const API_KEY = "YOUR_API_KEY_HERE";
const API_URL = "${apiOrigin}/api/v1/emails";

function sendBulkTrackedEmailsFromSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const email = rows[i][0];
    const name = rows[i][1];
    const subject = rows[i][2];
    if (!email) continue;

    const htmlBody = \`<p>Hi \${name},</p><p>Please review our proposal: <a href="https://example.com">Click Here</a></p>\`;
    const plainText = \`Hi \${name},\\n\\nPlease review our proposal: https://example.com\`;

    const res = UrlFetchApp.fetch(API_URL, {
      method: "post",
      contentType: "application/json",
      headers: { "Authorization": "Bearer " + API_KEY },
      payload: JSON.stringify({ to: email, recipientName: name, subject: subject, html: htmlBody }),
      muteHttpExceptions: true
    });

    if (res.getResponseCode() === 200 || res.getResponseCode() === 201) {
      const data = JSON.parse(res.getContentText());
      GmailApp.sendEmail(email, subject, plainText, { htmlBody: data.trackedHtml });
      Logger.log("Sent tracked email to: " + email);
    }
    Utilities.sleep(1000); // 1-second pause to respect Gmail limits
  }
}`;

  const copySingleScript = () => {
    navigator.clipboard.writeText(singleScriptCode);
    setCopiedSingle(true);
    setTimeout(() => setCopiedSingle(false), 2000);
  };

  const copyBulkScript = () => {
    navigator.clipboard.writeText(bulkScriptCode);
    setCopiedBulk(true);
    setTimeout(() => setCopiedBulk(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Header title="API & Google Apps Script Integration" />

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'keys'
              ? 'bg-[#161922] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Keys</span>
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'script'
              ? 'bg-[#161922] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4 text-sky-400" />
          <span>Google Apps Script (Send Emails)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#53E2FE] text-slate-950">
            Step 3
          </span>
        </button>
      </div>

      {/* TAB 1: API KEYS MANAGEMENT */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Project API Keys</h2>
              <p className="text-xs text-slate-500">
                Use these API keys to authenticate Google Apps Script or external REST client requests.
              </p>
            </div>
            <button
              onClick={() => {
                setGeneratedRawKey(null);
                setNewKeyName('');
                setIsCreateModalOpen(true);
              }}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New API Key</span>
            </button>
          </div>

          {/* Security Warning Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Security Best Practice:</span> Never expose API keys in client-side code, public repositories, or standard HTML. Store keys securely in your Google Apps Script editor. API key secrets are hashed using SHA-256 and stored securely.
            </div>
          </div>

          {/* API Keys Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Key Prefix</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Last Used</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Loading API keys...
                      </td>
                    </tr>
                  ) : keys.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No API keys found. Generate a key to begin.
                      </td>
                    </tr>
                  ) : (
                    keys.map((key) => {
                      const isRevoked = !!key.revoked_at;
                      return (
                        <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center space-x-2">
                            <Key className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{key.name}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{key.key_prefix}</td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(key.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {key.last_used_at
                              ? new Date(key.last_used_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date(key.last_used_at).toLocaleDateString() + ')'
                              : 'Never'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isRevoked ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                Revoked
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!isRevoked && (
                              <button
                                onClick={() => setRevokeTargetId(key.id)}
                                className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Revoke</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE APPS SCRIPT SENDER */}
      {activeTab === 'script' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-[#53E2FE] text-xs font-bold border border-sky-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 3 of 4: Email Send</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Google Apps Script & Google Sheets Integration
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Send 100% inbox-delivered emails directly through your official Gmail account. Mailify automatically registers each email, injects the hidden 1x1 tracking pixel, and rewrites URLs for live link click tracking!
              </p>
            </div>

            {/* Quick 3-step pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="font-bold text-[#53E2FE]">1. Copy API Key</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Generate your key from the API Keys tab.</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="font-bold text-[#53E2FE]">2. Paste in Apps Script</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Open script.google.com or Google Sheets.</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="font-bold text-[#53E2FE]">3. Click Run</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Emails send with live tracking in real time!</p>
              </div>
            </div>
          </div>

          {/* Current Live API Endpoint Indicator */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-700">Target Registration Endpoint:</span>
              <code className="ml-2 font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold select-all">
                {apiOrigin}/api/v1/emails
              </code>
            </div>
            <a
              href="https://script.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Open Google Apps Script</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Template 1: Single Email Sender */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>Option A: Single Tracked Email Sender (Gmail)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standard script to send high-priority proposals, cold outreach, or client emails with live open and click tracking.
                </p>
              </div>

              <button
                onClick={copySingleScript}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-sm transition-transform active:scale-98"
              >
                {copiedSingle ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSingle ? 'Copied Code!' : 'Copy Script'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-100 rounded-xl p-4 overflow-x-auto text-xs font-mono border border-slate-800 max-h-72">
              <pre>{singleScriptCode}</pre>
            </div>
          </div>

          {/* Template 2: Google Sheets Bulk Sender */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Option B: Bulk Campaign Sender from Google Sheets</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reads columns (Email, Name, Subject) from your active Google Sheet and sends personalized tracked emails automatically.
                </p>
              </div>

              <button
                onClick={copyBulkScript}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-sm transition-transform active:scale-98"
              >
                {copiedBulk ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBulk ? 'Copied Code!' : 'Copy Script'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-100 rounded-xl p-4 overflow-x-auto text-xs font-mono border border-slate-800 max-h-72">
              <pre>{bulkScriptCode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Generate Key */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Generate New API Key</h3>

            {!generatedRawKey ? (
              <form onSubmit={handleGenerateKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    API Key Friendly Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apps Script Marketing Outbound"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Generating...' : 'Generate Secret Key'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                  <p className="font-bold flex items-center">
                    <Check className="w-4 h-4 mr-1 text-emerald-600" /> API Key Generated Successfully!
                  </p>
                  <p className="mt-1">
                    Please copy your secret key now. <strong>You will not be able to see it again!</strong>
                  </p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-lg flex items-center justify-between space-x-2">
                  <code className="text-xs font-mono text-emerald-400 select-all truncate">
                    {generatedRawKey}
                  </code>
                  <button
                    onClick={handleCopyKey}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg cursor-pointer"
                  >
                    Done & Saved
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Revoke Confirmation */}
      {revokeTargetId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Revoke API Key?</h3>
            <p className="text-xs text-slate-500">
              Any Google Apps Script or service relying on this API key will immediately lose access and fail to send emails. This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setRevokeTargetId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm cursor-pointer"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

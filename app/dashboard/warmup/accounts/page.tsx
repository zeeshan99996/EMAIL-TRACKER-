'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Key,
  ShieldCheck,
  ExternalLink,
  X,
  Server,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { WARMUP_LEVELS, calculateWarmupProgressPercent } from '@/lib/warmup/levels';

function AccountsContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectingOAuth, setConnectingOAuth] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  // App Password Modal state
  const [showAppPasswordModal, setShowAppPasswordModal] = useState(false);
  const [appEmail, setAppEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [submittingAppPassword, setSubmittingAppPassword] = useState(false);
  const [appPasswordError, setAppPasswordError] = useState<string | null>(null);

  // Custom SMTP Modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customProvider, setCustomProvider] = useState('Hostinger');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [showCustomPass, setShowCustomPass] = useState(false);
  const [customImapHost, setCustomImapHost] = useState('imap.hostinger.com');
  const [customImapPort, setCustomImapPort] = useState('993');
  const [customImapSecurity, setCustomImapSecurity] = useState('ssl');
  const [customSmtpHost, setCustomSmtpHost] = useState('smtp.hostinger.com');
  const [customSmtpPort, setCustomSmtpPort] = useState('465');
  const [customSmtpSecurity, setCustomSmtpSecurity] = useState('ssl');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [submittingCustom, setSubmittingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    if (customProvider === 'Hostinger') {
      setCustomImapHost('imap.hostinger.com');
      setCustomImapPort('993');
      setCustomImapSecurity('ssl');
      setCustomSmtpHost('smtp.hostinger.com');
      setCustomSmtpPort('465');
      setCustomSmtpSecurity('ssl');
      setShowAdvancedSettings(false);
    } else if (customProvider === 'Hostinger (Titan Business Email)') {
      setCustomImapHost('imap.titan.email');
      setCustomImapPort('993');
      setCustomImapSecurity('ssl');
      setCustomSmtpHost('smtp.titan.email');
      setCustomSmtpPort('465');
      setCustomSmtpSecurity('ssl');
      setShowAdvancedSettings(false);
    } else if (customProvider === 'Gmail (SMTP)') {
      setCustomImapHost('imap.gmail.com');
      setCustomImapPort('993');
      setCustomImapSecurity('ssl');
      setCustomSmtpHost('smtp.gmail.com');
      setCustomSmtpPort('465');
      setCustomSmtpSecurity('ssl');
      setShowAdvancedSettings(false);
    } else if (customProvider === 'GoDaddy') {
      setCustomImapHost('imap.secureserver.net');
      setCustomImapPort('993');
      setCustomImapSecurity('ssl');
      setCustomSmtpHost('smtpout.secureserver.net');
      setCustomSmtpPort('465');
      setCustomSmtpSecurity('ssl');
      setShowAdvancedSettings(false);
    } else if (customProvider === 'Microsoft 365') {
      setCustomImapHost('outlook.office365.com');
      setCustomImapPort('993');
      setCustomImapSecurity('ssl');
      setCustomSmtpHost('smtp.office365.com');
      setCustomSmtpPort('587');
      setCustomSmtpSecurity('starttls');
      setShowAdvancedSettings(false);
    } else {
      setCustomImapHost('');
      setCustomImapPort('');
      setCustomSmtpHost('');
      setCustomSmtpPort('');
      setShowAdvancedSettings(true);
    }
  }, [customProvider]);

  useEffect(() => {
    const connectedParam = searchParams.get('connected');
    const emailParam = searchParams.get('email');
    const errorParam = searchParams.get('error');

    if (connectedParam === 'true' && emailParam) {
      setFeedback({
        message: `Successfully connected and initialized ${emailParam}!`,
        isError: false,
      });
    } else if (errorParam) {
      setFeedback({
        message: `Connection error: ${decodeURIComponent(errorParam)}`,
        isError: true,
      });
    }
  }, [searchParams]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/email-accounts');
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts || []);
      }
    } catch (err: any) {
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAppPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppPasswordError(null);
    setSubmittingAppPassword(true);

    try {
      const res = await fetch('/api/email-accounts/add-app-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: appEmail, appPassword }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setAppPasswordError(data.error || 'Failed to connect account with this app password');
        setSubmittingAppPassword(false);
        return;
      }

      setFeedback({
        message: data.message || `Successfully connected ${appEmail}!`,
        isError: false,
      });
      setShowAppPasswordModal(false);
      setAppEmail('');
      setAppPassword('');
      await fetchAccounts();
    } catch (err: any) {
      setAppPasswordError(err.message || 'Connection error');
    } finally {
      setSubmittingAppPassword(false);
    }
  };

  const handleAddCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    setSubmittingCustom(true);

    try {
      const res = await fetch('/api/email-accounts/add-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customEmail,
          password: customPassword,
          provider: customProvider,
          imapHost: customImapHost,
          imapPort: customImapPort,
          imapSecurity: customImapSecurity,
          smtpHost: customSmtpHost,
          smtpPort: customSmtpPort,
          smtpSecurity: customSmtpSecurity,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const errMsg = data.error || 'Failed to connect custom account';
        setCustomError(errMsg);
        if (data.isAuthError || errMsg.includes('Authentication') || errMsg.includes('Port') || errMsg.includes('connect')) {
          setShowAdvancedSettings(true);
        }
        setSubmittingCustom(false);
        return;
      }

      setFeedback({
        message: data.message || `Successfully connected ${customEmail}!`,
        isError: false,
      });
      setShowCustomModal(false);
      setCustomEmail('');
      setCustomPassword('');
      await fetchAccounts();
    } catch (err: any) {
      setCustomError(err.message || 'Connection error');
    } finally {
      setSubmittingCustom(false);
    }
  };

  const handleConnectOAuth = async () => {
    setConnectingOAuth(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/auth/google');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setFeedback({ message: data.error || 'Failed to start OAuth flow', isError: true });
        setConnectingOAuth(false);
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Connection error', isError: true });
      setConnectingOAuth(false);
    }
  };

  const handleAccountAction = async (
    accountId: string,
    action: 'start' | 'pause' | 'resume' | 'stop' | 'disconnect' | 'reconnect'
  ) => {
    setActionLoading(accountId + action);
    setFeedback(null);
    try {
      if (action === 'reconnect') {
        const res = await fetch(`/api/email-accounts/${accountId}/reconnect`);
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      if (action === 'disconnect') {
        const confirmed = window.confirm('Are you sure you want to remove this account from your fleet?');
        if (!confirmed) {
          setActionLoading(null);
          return;
        }

        // Optimistically remove from state
        setAccounts((prev) => prev.filter((a) => a.id !== accountId));

        const res = await fetch(`/api/email-accounts/${accountId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok || data.error) {
          setFeedback({ message: data.error || 'Failed to delete account', isError: true });
          await fetchAccounts();
        } else {
          setFeedback({ message: 'Account removed successfully', isError: false });
        }
        return;
      }

      const res = await fetch(`/api/warmup/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setFeedback({ message: data.error || `Failed to ${action} warmup`, isError: true });
      } else {
        setFeedback({ message: `Warmup ${action}ed for account!`, isError: false });
        await fetchAccounts();
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Action failed', isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGlobalWarmupAction = async (action: 'start' | 'pause') => {
    setActionLoading('global_' + action);
    setFeedback(null);
    try {
      const res = await fetch(`/api/warmup/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setFeedback({ message: data.error || `Failed to ${action} warmup for all accounts`, isError: true });
      } else {
        setFeedback({ message: `Warmup ${action === 'pause' ? 'paused' : 'started'} for all accounts!`, isError: false });
        await fetchAccounts();
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Action failed', isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Gmail Account Fleet</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {accounts.length} Connected
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect and manage multiple Gmail accounts using instant App Passwords or OAuth.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAppPasswordModal(true)}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>+ Add Gmail (App Password)</span>
          </button>

          <button
            onClick={() => {
              setCustomProvider('Hostinger');
              setShowAdvancedSettings(false);
              setShowCustomModal(true);
            }}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>+ Add Hostinger Email</span>
          </button>

          <button
            onClick={() => {
              setCustomProvider('Custom');
              setShowAdvancedSettings(true);
              setShowCustomModal(true);
            }}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Server className="w-4 h-4" />
            <span>+ Other SMTP</span>
          </button>

          <button
            onClick={handleConnectOAuth}
            disabled={connectingOAuth}
            title="Connect via Google OAuth browser consent"
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {connectingOAuth ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Plus className="w-4 h-4 text-slate-500" />
            )}
            <span>OAuth</span>
          </button>

          <button
            onClick={() => handleGlobalWarmupAction('pause')}
            disabled={actionLoading === 'global_pause'}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Pause warmup across all accounts"
          >
            {actionLoading === 'global_pause' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
            <span>Pause All</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 shadow-xs ${
            feedback.isError
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Accounts Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Gmail accounts connected yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add 2 or more Gmail accounts using their 16-character App Password to start peer warmup exchanges immediately!
              </p>
            </div>
            <button
              onClick={() => setShowAppPasswordModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Key className="w-4 h-4" />
              <span>+ Add First Gmail Account (App Password)</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Email / Mode</th>
                  <th className="px-4 py-3.5 font-bold">Connection</th>
                  <th className="px-4 py-3.5 font-bold">Warmup %</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-4 py-3.5 font-bold">Level</th>
                  <th className="px-4 py-3.5 font-bold text-center">Sent Today</th>
                  <th className="px-4 py-3.5 font-bold text-center">Received</th>
                  <th className="px-4 py-3.5 font-bold text-center">Replies</th>
                  <th className="px-4 py-3.5 font-bold">Next Activity</th>
                  <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc, index) => {
                  const warmup = acc.warmup || {};
                  const levelInfo = WARMUP_LEVELS[warmup.warmup_level || 0];
                  const isConnected = acc.status === 'connected';
                  const progressPercent = calculateWarmupProgressPercent(warmup.total_sent || 0);

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-[10px]">#{index + 1}</span>
                          <span className="font-semibold text-slate-900">{acc.email}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {acc.provider === 'gmail_app_password' 
                            ? 'Gmail App Password (SMTP/IMAP)' 
                            : acc.provider === 'hostinger_smtp' || acc.metadata?.providerName === 'Hostinger' || acc.metadata?.smtpHost?.includes('hostinger')
                            ? `Hostinger Business Email (${acc.metadata?.smtpHost || 'smtp.hostinger.com'})`
                            : acc.provider === 'gmail_smtp' || acc.metadata?.providerName === 'Gmail (SMTP)'
                            ? `Gmail SMTP (${acc.metadata?.smtpHost || 'smtp.gmail.com'})`
                            : acc.provider === 'custom_smtp' 
                            ? `Custom Email: ${acc.metadata?.smtpHost || 'SMTP/IMAP'}`
                            : 'Google OAuth 2.0 API'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            acc.status === 'connected'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : acc.status === 'token_expired'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              acc.status === 'connected'
                                ? 'bg-emerald-500'
                                : acc.status === 'token_expired'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {acc.status}
                        </span>
                      </td>

                      {/* Warmup Progress % */}
                      <td className="px-4 py-4 min-w-[140px]">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-black text-xs text-slate-900">{progressPercent}%</span>
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
                              ? 'Good Health'
                              : 'Warming Up'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
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
                        <span className="text-[10px] text-slate-400 block mt-1 font-medium">
                          {warmup.total_sent || 0} / 100 sent
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            warmup.status === 'running'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : warmup.status === 'paused'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : warmup.status === 'completed'
                              ? 'bg-purple-50 border-purple-200 text-purple-700'
                              : warmup.status === 'error'
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {warmup.status || 'queued'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800">
                          Level {warmup.warmup_level || 0}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {levelInfo?.name} ({levelInfo?.targetDailyVolume}/day)
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center font-bold text-slate-800">
                        {warmup.daily_sent || 0}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Total: {warmup.total_sent || 0}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center font-bold text-slate-800">
                        {warmup.daily_received || 0}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Total: {warmup.total_received || 0}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center font-bold text-slate-800">
                        {warmup.daily_replies || 0}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Total: {warmup.total_replies || 0}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {warmup.next_activity_at ? formatRelativeTime(warmup.next_activity_at) : 'Idle'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {warmup.status === 'running' ? (
                            <button
                              onClick={() => handleAccountAction(acc.id, 'pause')}
                              disabled={actionLoading !== null}
                              title="Pause Warmup"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-amber-600 transition-all cursor-pointer shadow-xs"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAccountAction(acc.id, 'start')}
                              disabled={actionLoading !== null || !isConnected}
                              title="Start Warmup"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-emerald-600 transition-all cursor-pointer disabled:opacity-40 shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleAccountAction(acc.id, 'disconnect')}
                            disabled={actionLoading !== null}
                            title="Disconnect Account"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* App Password Modal */}
      {showAppPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Connect Gmail via App Password</h2>
                  <p className="text-xs text-slate-500">No Google browser login needed</p>
                </div>
              </div>

              <button
                onClick={() => { setShowAppPasswordModal(false); setAppPasswordError(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {appPasswordError && (
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{appPasswordError}</span>
              </div>
            )}

            <form onSubmit={handleAddAppPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gmail Address
                </label>
                <input
                  type="email"
                  required
                  value={appEmail}
                  onChange={(e) => setAppEmail(e.target.value)}
                  placeholder="youraccount@gmail.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  16-Character Google App Password
                </label>
                <input
                  type="password"
                  required
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  placeholder="abcd efgh ijkl mnop"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs font-mono"
                />
              </div>

              {/* Instructions on how to get App Password */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>How to generate a Gmail App Password:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 pl-1 leading-relaxed">
                  <li>Go to your <strong>Google Account → Security</strong>.</li>
                  <li>Enable <strong>2-Step Verification</strong> if not already active.</li>
                  <li>Search or click <strong>&quot;App passwords&quot;</strong>.</li>
                  <li>Create a name (e.g. <em>&quot;Warmup Bot&quot;</em>) and copy the 16-character code.</li>
                </ol>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppPasswordModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingAppPassword}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submittingAppPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying with Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Verify & Connect Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom SMTP Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Mail className={`w-5 h-5 ${customProvider === 'Hostinger' ? 'text-indigo-600' : 'text-blue-600'}`} />
                  {customProvider === 'Hostinger' ? 'Connect Hostinger Business Email' : 'Connect Business / Custom Email'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {customProvider === 'Hostinger'
                    ? 'Instant connection via Hostinger Webmail & SMTP server.'
                    : 'Connect custom domain mailboxes via SMTP and IMAP.'}
                </p>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {customProvider === 'Hostinger' && (
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-950 flex items-start gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                  H
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-indigo-900">Hostinger Business Email Preset Active</div>
                  <div className="text-[11px] text-indigo-800 leading-relaxed">
                    Enter your Hostinger email address and your <strong>Mailbox password</strong> (the one used to log in at{' '}
                    <a
                      href="https://mail.hostinger.com"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-0.5"
                    >
                      mail.hostinger.com <ExternalLink className="w-2.5 h-2.5 inline" />
                    </a>
                    , <em>NOT</em> your main Hostinger hPanel account password). Auto-fallback between Port 465 (SSL) and Port 587 (STARTTLS) is enabled.
                  </div>
                </div>
              </div>
            )}

            {customProvider === 'Gmail (SMTP)' && (
              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/70 text-sky-950 flex items-start gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                  G
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-sky-900">Gmail SMTP Login Preset Active</div>
                  <div className="text-[11px] text-sky-700">
                    Auto-configured with <strong>smtp.gmail.com:465</strong> & <strong>imap.gmail.com:993</strong>. Use your 16-character Google App Password.
                  </div>
                </div>
              </div>
            )}

            {customError && (
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 space-y-2 mb-4 shadow-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="font-semibold">{customError}</span>
                </div>
                {customProvider.includes('Hostinger') && (
                  <div className="pl-6 text-[11px] text-rose-800 bg-white/80 p-3 rounded-lg border border-rose-200 space-y-2">
                    <p className="font-bold text-rose-950">💡 How to Fix & Connect Immediately:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                      <li>
                        <strong>Verify or Reset Mailbox Password:</strong> Log into{' '}
                        <a
                          href="https://hpanel.hostinger.com"
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-0.5"
                        >
                          Hostinger hPanel <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>{' '}
                        → <strong>Emails</strong> → your domain → <strong>Change Password</strong> for <em>info@erhatechnologies.com</em>.
                      </li>
                      <li>
                        <strong>Test at Webmail:</strong> Verify you can log into{' '}
                        <a
                          href="https://mail.hostinger.com"
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-0.5"
                        >
                          mail.hostinger.com <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>.
                      </li>
                      <li>
                        <strong>Titan Email Plan:</strong> If your Hostinger plan uses Titan Mail, switch the dropdown to <strong>Hostinger Business Email / Titan (smtp.titan.email)</strong>.
                      </li>
                      <li>
                        <strong>If routing via Gmail:</strong> Switch dropdown to <strong>Gmail (SMTP)</strong> and use a 16-character Google App Password.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleAddCustomEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Provider
                </label>
                <select
                  value={customProvider}
                  onChange={(e) => setCustomProvider(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                >
                  <option value="Hostinger">Hostinger Webmail (smtp.hostinger.com)</option>
                  <option value="Hostinger (Titan Business Email)">Hostinger Business Email / Titan (smtp.titan.email)</option>
                  <option value="Gmail (SMTP)">Gmail / Google Workspace (SMTP)</option>
                  <option value="GoDaddy">GoDaddy Webmail</option>
                  <option value="Microsoft 365">Microsoft 365 / Outlook</option>
                  <option value="Custom">Custom / Other IMAP & SMTP</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    {customProvider.includes('Hostinger') ? 'Hostinger Email' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder={customProvider.includes('Hostinger') ? 'info@yourdomain.com' : 'user@domain.com'}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      {customProvider.includes('Hostinger') ? 'Hostinger Password' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomPass(!showCustomPass)}
                      className="text-[11px] text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 font-medium cursor-pointer"
                    >
                      {showCustomPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showCustomPass ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showCustomPass ? 'text' : 'password'}
                      required
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs pr-9 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomPass(!showCustomPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showCustomPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 py-1 transition-colors cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>{showAdvancedSettings ? 'Hide Advanced Server Settings' : 'Show Advanced Server Settings & Ports (Optional)'}</span>
                  {showAdvancedSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvancedSettings && (
                  <div className="mt-2.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">IMAP Settings (Receiving)</div>
                      <div className="grid grid-cols-12 gap-2.5">
                        <div className="col-span-6">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Host</label>
                          <input type="text" required value={customImapHost} onChange={(e) => setCustomImapHost(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:outline-blue-500" />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Port</label>
                          <input type="text" required value={customImapPort} onChange={(e) => setCustomImapPort(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:outline-blue-500" />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Security</label>
                          <select value={customImapSecurity} onChange={(e) => setCustomImapSecurity(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-blue-500">
                            <option value="ssl">SSL/TLS</option>
                            <option value="starttls">STARTTLS</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SMTP Settings (Sending)</div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomSmtpPort('465');
                              setCustomSmtpSecurity('ssl');
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded font-medium border transition-colors cursor-pointer ${
                              customSmtpPort === '465'
                                ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Port 465 (SSL)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomSmtpPort('587');
                              setCustomSmtpSecurity('starttls');
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded font-medium border transition-colors cursor-pointer ${
                              customSmtpPort === '587'
                                ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Port 587 (STARTTLS)
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-2.5">
                        <div className="col-span-6">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Host</label>
                          <input type="text" required value={customSmtpHost} onChange={(e) => setCustomSmtpHost(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:outline-blue-500" />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Port</label>
                          <input type="text" required value={customSmtpPort} onChange={(e) => setCustomSmtpPort(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:outline-blue-500" />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Security</label>
                          <select value={customSmtpSecurity} onChange={(e) => setCustomSmtpSecurity(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-blue-500">
                            <option value="ssl">SSL/TLS</option>
                            <option value="starttls">STARTTLS</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingCustom}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer ${
                    customProvider === 'Hostinger' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-black'
                  }`}
                >
                  {submittingCustom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Testing Connections...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Verify & Connect {customProvider}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <AccountsContent />
    </Suspense>
  );
}

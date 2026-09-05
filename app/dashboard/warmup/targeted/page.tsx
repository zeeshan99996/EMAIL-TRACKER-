'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, Play, Pause, Square, AlertCircle, Loader2, Users, RefreshCw, Zap } from 'lucide-react';

export default function TargetedWarmupPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetId, setTargetId] = useState<string>('');
  const [selectedPeers, setSelectedPeers] = useState<Record<string, boolean>>({});
  const [dailyLimit, setDailyLimit] = useState(50);
  const [cooldown, setCooldown] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, campRes] = await Promise.all([
        fetch('/api/email-accounts'),
        fetch('/api/warmup/targeted')
      ]);
      const accData = await accRes.json();
      const campData = await campRes.json();
      
      const accs = accData.accounts || [];
      setAccounts(accs);
      setCampaigns(campData.campaigns || []);

      if (accs.length > 0 && !targetId) {
        setTargetId(accs[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePeer = (id: string) => {
    setSelectedPeers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveAndStart = async (autoPauseStandard = false) => {
    setError(null);
    setSubmitting(true);
    const peerAccountIds = Object.keys(selectedPeers).filter(id => selectedPeers[id]);
    
    if (peerAccountIds.length === 0) {
      setError("Please select at least one peer account.");
      setSubmitting(false);
      return;
    }

    try {
      // Step 1: Save Configuration
      const saveRes = await fetch('/api/warmup/targeted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAccountId: targetId,
          peerAccountIds,
          settings: { dailyLimit, cooldown },
          autoPauseStandard,
        })
      });
      const saveData = await saveRes.json();
      
      if (!saveRes.ok) throw new Error(saveData.error);
      const campaignId = saveData.campaignId;

      // Step 2: Start Campaign
      const startRes = await fetch(`/api/warmup/targeted/${campaignId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', autoPauseStandard })
      });
      const startData = await startRes.json();
      if (!startRes.ok) throw new Error(startData.error);

      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (campaignId: string, action: 'start' | 'pause' | 'stop' | 'trigger_cycle') => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/warmup/targeted/${campaignId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const activeCampaign = campaigns.find(c => c.status === 'running' || c.status === 'paused');

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Email Warmup</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Targeted Mode
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Focus all warmup activity on a single high-priority account using peers.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-center">
          <Link href="/dashboard/warmup" className="px-4 py-1.5 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
            Standard Warmup
          </Link>
          <Link href="/dashboard/warmup/targeted" className="px-4 py-1.5 text-xs font-bold rounded-md bg-white text-slate-900 shadow-sm border border-slate-200">
            Targeted Warmup
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-800">Warmup Notice</h4>
              <p className="text-xs text-rose-600 mt-1">{error}</p>
              {error.includes('Standard Warmup') && (
                <button
                  onClick={() => handleSaveAndStart(true)}
                  disabled={submitting}
                  className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>Pause Standard Warmup & Start Targeted</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeCampaign ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Active Targeted Campaign
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction(activeCampaign.id, 'trigger_cycle')}
                disabled={submitting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Force-run the next warmup cycle immediately (skip cooldown)"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Run Cycle Now</span>
              </button>

              {activeCampaign.status === 'running' ? (
                <button onClick={() => handleAction(activeCampaign.id, 'pause')} disabled={submitting} className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100">
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              ) : (
                <button onClick={() => handleSaveAndStart()} disabled={submitting} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100">
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
              )}
              <button onClick={() => handleAction(activeCampaign.id, 'stop')} disabled={submitting} className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100">
                <Square className="w-3.5 h-3.5" /> Stop
              </button>
            </div>
          </div>
          
          {/* Warmup Progress & Health Overview Banner */}
          <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Warmup Progression</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {activeCampaign.stats?.healthScore || 98}% Good Health
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    Level {activeCampaign.stats?.levelNum || 1}: {activeCampaign.stats?.levelName || 'Developing'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Target Account: {accounts.find(a => a.id === activeCampaign.target_email_account_id)?.email || 'Unknown'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">{activeCampaign.stats?.levelDescription || 'Gradually expanding volume and reputation.'}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-black text-purple-700">
                    {activeCampaign.stats?.progressPercent || 25}%
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Warmup Score</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-purple-200/60 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${activeCampaign.stats?.progressPercent || 25}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Account</span>
              <span className="text-sm font-semibold text-slate-900 truncate block" title={accounts.find(a => a.id === activeCampaign.target_email_account_id)?.email}>
                {accounts.find(a => a.id === activeCampaign.target_email_account_id)?.email || 'Unknown'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Emails Sent Today</span>
              <span className="text-sm font-bold text-slate-900">
                {activeCampaign.stats?.totalSent || 0} / {activeCampaign.daily_limit || 50}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Replies Received</span>
              <span className="text-sm font-bold text-emerald-600">
                {activeCampaign.stats?.totalReceived || 0} Replies
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Auto-Cycle Gap</span>
              <span className="text-sm font-bold text-indigo-600">
                Every {activeCampaign.cooldown_minutes || 10} mins
              </span>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-slate-400" /> Pending Jobs (Next Cycle)</h3>
            <div className="space-y-2">
              {activeCampaign.jobs?.filter((j: any) => j.status === 'queued').length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-100">No jobs queued. Waiting for cooldown.</div>
              ) : (
                activeCampaign.jobs?.filter((j: any) => j.status === 'queued').map((job: any) => (
                  <div key={job.id} className="text-xs flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700">{job.job_type === 'initial_send' ? 'Target -> Peer' : 'Peer -> Target'}</span>
                      <span className="text-[10px] text-slate-400">Scheduled: {new Date(job.scheduled_at).toLocaleString()}</span>
                    </div>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium text-[10px]">QUEUED</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Configure Targeted Campaign
            </h2>
            <p className="text-xs text-slate-500 mt-1">Select one account to build reputation for, and choose peers to support it.</p>
          </div>

          <div className="p-6 space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">1. Select Target Account</label>
              <select 
                value={targetId} 
                onChange={(e) => {
                  setTargetId(e.target.value);
                  setSelectedPeers({});
                }}
                className="w-full md:w-1/2 rounded-lg border border-slate-300 p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.email} ({acc.provider})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                2. Select Peer Accounts
              </label>
              <p className="text-xs text-slate-500 mb-3">These accounts will receive and reply to the target account&apos;s emails.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {accounts.filter(a => a.id !== targetId).map(acc => (
                  <label key={acc.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedPeers[acc.id] ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                    <input type="checkbox" checked={selectedPeers[acc.id] || false} onChange={() => handleTogglePeer(acc.id)} className="w-4 h-4 text-purple-600 rounded" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">{acc.email}</span>
                      <span className="text-[10px] text-slate-400">{acc.status}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">Daily Limit</label>
                <p className="text-[10px] text-slate-500 mb-2">Max emails sent by target account per day</p>
                <input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">Cycle Cooldown (Minutes)</label>
                <p className="text-[10px] text-slate-500 mb-2">Time to wait after emailing all peers before starting next cycle</p>
                <input type="number" value={cooldown} onChange={(e) => setCooldown(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveAndStart(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                Start Targeted Warmup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

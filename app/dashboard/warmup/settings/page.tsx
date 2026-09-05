'use client';

import { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Send,
} from 'lucide-react';

export default function WarmupSettingsPage() {
  const [config, setConfig] = useState({
    daily_limit: 20,
    min_delay_minutes: 3,
    max_delay_minutes: 5,
    max_messages_per_thread: 4,
    ai_enabled: true,
    enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/warmup/settings');
        const data = await res.json();
        if (res.ok && data.config) {
          setConfig({
            daily_limit: data.config.daily_limit ?? 20,
            min_delay_minutes: data.config.min_delay_minutes ?? 3,
            max_delay_minutes: data.config.max_delay_minutes ?? 5,
            max_messages_per_thread: data.config.max_messages_per_thread ?? 4,
            ai_enabled: data.config.ai_enabled ?? true,
            enabled: data.config.enabled ?? true,
          });
        }
      } catch (err: any) {
        console.error('Failed to load warmup settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    // Validation
    if (config.min_delay_minutes > config.max_delay_minutes) {
      setFeedback({
        message: 'Maximum delay cannot be smaller than minimum delay',
        isError: true,
      });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/warmup/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setFeedback({ message: data.error || 'Failed to save settings', isError: true });
      } else {
        setFeedback({ message: 'Warmup configuration updated successfully!', isError: false });
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Error saving settings', isError: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-blue-600" />
          <span>Warmup Campaign Settings</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure controlled exchange delays, daily volume limits, thread depth, and Gemini AI contextual replies.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 shadow-xs ${
            feedback.isError
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Campaign Master Toggle */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Campaign Status</span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    config.enabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {config.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Master switch to enable or pause all automatic background warmup jobs.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Volume & Limits */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            <span>Volume & Daily Limits</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Daily Warmup Limit (per account)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={config.daily_limit}
                onChange={(e) =>
                  setConfig({ ...config, daily_limit: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Maximum warmup emails an account can send per calendar day (default: 20).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Messages Per Thread (Loop Protection)
              </label>
              <input
                type="number"
                min="2"
                max="10"
                required
                value={config.max_messages_per_thread}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    max_messages_per_thread: parseInt(e.target.value, 10) || 2,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Stops thread exchange automatically once reached to prevent infinite loops (default: 4).
              </p>
            </div>
          </div>
        </div>

        {/* Delay Configuration */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Controlled Delays & Jitter</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Minimum Delay (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={config.min_delay_minutes}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    min_delay_minutes: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Minimum waiting time between peer email exchanges (default: 3 mins).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Maximum Delay (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="240"
                required
                value={config.max_delay_minutes}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    max_delay_minutes: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Upper bound for randomized scheduling window (default: 5 mins).
              </p>
            </div>
          </div>
        </div>

        {/* Gemini AI Contextual Responder */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Gemini AI Contextual Responses</span>
              </div>
              <p className="text-xs text-slate-500 max-w-xl">
                When enabled, incoming peer emails are analyzed and Gemini generates realistic, contextual replies referencing the actual conversation history.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.ai_enabled}
                onChange={(e) => setConfig({ ...config, ai_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Configuration...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

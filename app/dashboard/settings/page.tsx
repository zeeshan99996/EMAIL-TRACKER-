'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Settings, Shield, Globe, Link2, Eye, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const [anonymizeIp, setAnonymizeIp] = useState(true);
  const [trackOpens, setTrackOpens] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);
  const [excludedDomains, setExcludedDomains] = useState('unsubscribe.com, optout.org, privacy.net');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Header title="Platform & Project Settings" />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account Profile Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <span>Account Profile</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Account Name</label>
              <input
                type="text"
                defaultValue="ERHA Technologies"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Account Admin Email</label>
              <input
                type="email"
                defaultValue="admin@erhatechnologies.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Tracking Defaults Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Default Tracking Behavior</span>
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Enable Open Pixel Tracking</p>
                <p className="text-[11px] text-slate-500">Inject 1x1 transparent GIF into outgoing email HTML</p>
              </div>
              <input
                type="checkbox"
                checked={trackOpens}
                onChange={e => setTrackOpens(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Enable Link Click Tracking</p>
                <p className="text-[11px] text-slate-500">Automatically rewrite eligible HTTP/HTTPS links into tracked redirects</p>
              </div>
              <input
                type="checkbox"
                checked={trackClicks}
                onChange={e => setTrackClicks(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Privacy & Exclusions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Privacy & Link Exclusions</span>
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Anonymize Recipient IP Addresses</p>
                <p className="text-[11px] text-slate-500">Hash or strip exact client IP before saving events to database</p>
              </div>
              <input
                type="checkbox"
                checked={anonymizeIp}
                onChange={e => setAnonymizeIp(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Excluded Domains & Unsubscribe URLs (Comma Separated)
              </label>
              <textarea
                value={excludedDomains}
                onChange={e => setExcludedDomains(e.target.value)}
                placeholder="e.g. unsubscribe.com, optout.org"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Links matching these domain patterns will remain un-rewritten in the original HTML.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Settings Saved!' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

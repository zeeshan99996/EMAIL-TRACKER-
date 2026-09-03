'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { DEMO_API_KEYS } from '@/lib/demo-store';
import { generateApiKey } from '@/lib/security/api-key';
import { ApiKey } from '@/lib/types';
import { Key, Plus, Copy, Check, Trash2, AlertTriangle, ShieldAlert, EyeOff } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(DEMO_API_KEYS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedRawKey, setGeneratedRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null);

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const { rawKey, keyHash, keyPrefix } = generateApiKey();
    const newApiKeyRecord: ApiKey = {
      id: `key_${Date.now()}`,
      project_id: 'prj_demo_01',
      name: newKeyName.trim(),
      key_hash: keyHash,
      key_prefix: keyPrefix,
      last_used_at: null,
      created_at: new Date().toISOString(),
      revoked_at: null,
    };

    setKeys([newApiKeyRecord, ...keys]);
    setGeneratedRawKey(rawKey);
  };

  const handleCopyKey = () => {
    if (generatedRawKey) {
      navigator.clipboard.writeText(generatedRawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmRevoke = () => {
    if (revokeTargetId) {
      setKeys(
        keys.map(k =>
          k.id === revokeTargetId ? { ...k, revoked_at: new Date().toISOString() } : k
        )
      );
      setRevokeTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Header title="API Keys Management" />

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
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New API Key</span>
        </button>
      </div>

      {/* Security Warning Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Security Best Practice:</span> Never expose API keys in client-side code, public repositories, or standard HTML. Store keys securely in your Google Apps Script environment properties or environment variables. API key secrets are hashed using SHA-256 and stored securely.
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
              {keys.map((key) => {
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
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                  >
                    Generate Secret Key
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
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
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
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
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

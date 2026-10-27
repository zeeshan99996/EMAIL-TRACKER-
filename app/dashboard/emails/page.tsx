'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { getUnifiedEmailsList } from '@/lib/client/tracker-store';
import { Email } from '@/lib/types';
import {
  Search,
  Filter,
  Eye,
  Link2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  Trash2,
  RotateCw,
} from 'lucide-react';

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const itemsPerPage = 10;

  const loadData = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      let serverEmails: any[] = [];
      try {
        const res = await fetch('/api/v1/dashboard', { cache: 'no-store' });
        const data = await res.json();
        if (data && data.emails) {
          serverEmails = data.emails;
        }
      } catch {}

      const unified = getUnifiedEmailsList(serverEmails);
      setEmails(unified);
    } catch (err) {
      console.error('Failed to refresh emails:', err);
    } finally {
      if (manual) setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleDeleteEmail = async (id: string, recipientEmail: string) => {
    if (!window.confirm(`Are you sure you want to delete the tracked email for "${recipientEmail}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/emails/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmails(prev => prev.filter(e => e.id !== id));
      } else {
        alert('Failed to delete email');
      }
    } catch (err) {
      console.error('Delete email failed:', err);
      alert('Network error while deleting email');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete ALL tracked emails and start completely fresh? This cannot be undone.'
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      const res = await fetch('/api/v1/emails/cleanup?mode=all', { method: 'POST' });
      if (res.ok) {
        setEmails([]);
      } else {
        alert('Failed to clear emails');
      }
    } catch (err) {
      console.error('Clear all failed:', err);
      alert('Network error while clearing emails');
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredEmails = emails.filter(email => {
    const matchesSearch =
      email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (email.recipient_name && email.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || email.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage) || 1;
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <Header title="Tracked Emails" />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by recipient or subject..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 shadow-xs"
          />
        </div>

        {/* Filters & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="OPENED">Opened</option>
              <option value="CLICKED">Clicked</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Refresh now"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={isClearing || emails.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title="Clear all tracked emails to start completely fresh"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>{isClearing ? 'Clearing...' : 'Clear All'}</span>
          </button>

          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      {/* Email Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Sent At</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Opens</th>
                <th className="py-3.5 px-4 text-center">Clicks</th>
                <th className="py-3.5 px-4">First Open</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedEmails.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <Mail className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No tracked emails found.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Send a batch via the Campaign Studio to track outbound emails here.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedEmails.map(email => {
                  let statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      SENT
                    </span>
                  );
                  if (email.status === 'OPENED' || (email.open_count || 0) > 0) {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        OPENED
                      </span>
                    );
                  }
                  if (email.status === 'CLICKED' || (email.click_count || 0) > 0) {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        CLICKED
                      </span>
                    );
                  }

                  return (
                    <tr key={email.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{email.recipient_email}</div>
                        {email.recipient_name && (
                          <div className="text-[10px] text-slate-400">{email.recipient_name}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs truncate">
                        {email.subject}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(email.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(email.sent_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-center">{statusBadge}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-sky-600">
                        <span className="inline-flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5 text-sky-600" />
                          <span>{email.open_count}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                        <span className="inline-flex items-center space-x-1">
                          <Link2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{email.click_count}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {email.first_opened_at
                          ? new Date(email.first_opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            href={`/dashboard/emails/${email.id}`}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => handleDeleteEmail(email.id, email.recipient_email)}
                            disabled={deletingId === email.id}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            title="Delete this email"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{paginatedEmails.length}</span> of{' '}
            <span className="font-bold text-slate-900">{filteredEmails.length}</span> emails
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 bg-white rounded-lg disabled:opacity-30 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 bg-white rounded-lg disabled:opacity-30 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

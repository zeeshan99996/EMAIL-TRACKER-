'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import {
  FileSpreadsheet,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Sliders,
  ExternalLink,
  Mail,
  Building,
  Clock,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  FileCode,
  Info,
  ChevronDown,
  X,
  Search,
  Plus,
  Trash2,
  Save,
  Edit3,
} from 'lucide-react';
import Link from 'next/link';

interface LeadItem {
  row: number;
  name: string;
  email: string;
  company: string;
  status: string;
  sentAt?: string;
}

interface CustomTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isCustom?: boolean;
}

interface MailboxItem {
  id: string;
  name: string;
  email: string;
  provider?: string;
  isCustom?: boolean;
}

const PRESET_TEMPLATES: CustomTemplate[] = [
  {
    id: 'b2b-web',
    name: 'B2B Web & Tech Modernization',
    subject: 'Quick idea for {{company}} website & growth',
    body: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
  <p>Hi {{first_name}},</p>
  <p>I was taking a look at {{company}}'s recent initiatives and really admired the work your team is doing.</p>
  <p>We recently helped a similar company scale their outbound reach and optimize their web conversion by over 38%.</p>
  <p style="margin: 20px 0;">
    <a href="https://erhatechnologies.com/services" style="background-color: #2563eb; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
      View Our Case Studies & Scope
    </a>
  </p>
  <p>Would you be open to a quick 10-minute chat this Thursday to see if this could be relevant for {{company}}?</p>
  <p>Best regards,<br><strong>Outreach Team</strong></p>
</div>`,
  },
  {
    id: 'partnership',
    name: 'Strategic Partnership Intro',
    subject: 'Partnership scope with {{company}}',
    body: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
  <p>Hey {{first_name}},</p>
  <p>Hope you are having a productive week.</p>
  <p>We are expanding our network with technology leaders like {{company}} to collaborate on enterprise email deliverability and analytics.</p>
  <p>Here is our scope overview: <a href="https://erhatechnologies.com/portfolio" style="color: #2563eb; font-weight: bold;">Explore Platform Overview</a></p>
  <p>Are you free for a brief call next week to explore potential synergy?</p>
  <p>Warmly,<br><strong>Partnership Director</strong></p>
</div>`,
  },
  {
    id: 'follow-up',
    name: 'Gentle Friendly Follow-Up',
    subject: 'Following up on our note for {{company}}',
    body: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
  <p>Hi {{first_name}},</p>
  <p>I know schedules can get very busy, so I wanted to float this to the top of your inbox.</p>
  <p>Did you get a chance to review the proposal we shared for {{company}}?</p>
  <p>Happy to answer any questions or share a quick 2-minute walkthrough video.</p>
  <p>Best regards,<br><strong>Outreach Team</strong></p>
</div>`,
  },
];

export default function CampaignsPage() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [batchCount, setBatchCount] = useState<number>(10);
  const [filterTab, setFilterTab] = useState<'pending' | 'all' | 'sent' | 'invalid'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Workflow Active Step (1: Batch Leads -> 2: Sender -> 3: Template -> 4: Send)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Sender & Template State
  const [senderAccount, setSenderAccount] = useState('apps_script');
  const [templates, setTemplates] = useState<CustomTemplate[]>(PRESET_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState('b2b-web');
  const [subject, setSubject] = useState(PRESET_TEMPLATES[0].subject);
  const [bodyHtml, setBodyHtml] = useState(PRESET_TEMPLATES[0].body);
  const [verifyBeforeSend, setVerifyBeforeSend] = useState(true);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  // Template Modal State
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateSubject, setNewTemplateSubject] = useState('');
  const [newTemplateCode, setNewTemplateCode] = useState('');
  const [modalTab, setModalTab] = useState<'code' | 'preview'>('code');

  // Mailbox Fleet & Custom Senders State
  const [mailboxes, setMailboxes] = useState<MailboxItem[]>([
    {
      id: 'apps_script',
      name: 'Google Apps Script (Sheet Gmail Account)',
      email: 'Connected Google Sheet',
      provider: 'Apps Script',
    },
  ]);
  const [showAddMailboxModal, setShowAddMailboxModal] = useState(false);
  const [newMailboxName, setNewMailboxName] = useState('');
  const [newMailboxEmail, setNewMailboxEmail] = useState('');
  const [newMailboxProvider, setNewMailboxProvider] = useState('Google Workspace / Gmail');

  // Modals & Execution State
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState<{
    step: string;
    percent: number;
    log: string[];
    summary?: any;
  }>({
    step: 'Idle',
    percent: 0,
    log: [],
  });

  // Load leads from Sheet Webhook or Demo Data
  const fetchLeads = async (url?: string) => {
    setRefreshing(true);
    try {
      const targetUrl = url !== undefined ? url : sheetUrl;
      const endpoint = targetUrl.trim()
        ? `/api/v1/campaigns/sheet?webhookUrl=${encodeURIComponent(targetUrl.trim())}`
        : '/api/v1/campaigns/sheet';

      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      if (data && data.leads) {
        setLeads(data.leads);
        if (targetUrl.trim()) {
          try {
            localStorage.setItem('erha_sheet_webhook_url', targetUrl.trim());
          } catch {}
        }
        // Auto-select pending leads based on batchCount (or all leads if none marked sent)
        const pendingLeads = data.leads.filter(
          (l: LeadItem) => !l.status || !l.status.toLowerCase().includes('sent')
        );
        const toSelect = pendingLeads.length > 0 ? pendingLeads : data.leads;
        setSelectedRows(toSelect.slice(0, batchCount).map((l: LeadItem) => l.row));
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // 1. Load saved sheet URL
    try {
      const saved = localStorage.getItem('erha_sheet_webhook_url');
      if (saved && saved.trim()) {
        setSheetUrl(saved.trim());
        fetchLeads(saved.trim());
      } else {
        fetchLeads();
      }
    } catch {
      fetchLeads();
    }

    // 2. Load custom templates from localStorage
    try {
      const savedT = localStorage.getItem('erha_custom_campaign_templates');
      if (savedT) {
        const parsedT = JSON.parse(savedT);
        if (Array.isArray(parsedT) && parsedT.length > 0) {
          setTemplates([...PRESET_TEMPLATES, ...parsedT]);
        }
      }
    } catch {}

    // 3. Load custom mailboxes from localStorage
    try {
      const savedM = localStorage.getItem('erha_custom_mailboxes');
      if (savedM) {
        const parsedM = JSON.parse(savedM);
        if (Array.isArray(parsedM) && parsedM.length > 0) {
          setMailboxes((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = parsedM.filter((m: MailboxItem) => !existingIds.has(m.id));
            return [...prev, ...newOnes];
          });
        }
      }
    } catch {}

    // 4. Fetch platform connected accounts
    fetch('/api/email-accounts')
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray(d.accounts) && d.accounts.length > 0) {
          const fleetBoxes: MailboxItem[] = d.accounts.map((acc: any) => ({
            id: acc.id,
            name: acc.email,
            email: acc.email,
            provider: acc.provider || 'Connected Fleet',
          }));
          setMailboxes((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const newItems = fleetBoxes.filter((f) => !ids.has(f.id));
            return [...prev, ...newItems];
          });
        }
      })
      .catch(() => {});
  }, []);

  // When template changes
  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      setSubject(tmpl.subject);
      setBodyHtml(tmpl.body);
    }
    setActiveStep(4);
  };

  // Save current writing as a new reusable template
  const handleSaveCurrentAsTemplate = () => {
    if (!newTemplateTitle.trim()) return;
    const cleanSubject = newTemplateSubject.trim() || subject;
    const cleanBody = newTemplateCode.trim() || bodyHtml;

    const newTmpl: CustomTemplate = {
      id: `tmpl_${Date.now()}`,
      name: newTemplateTitle.trim(),
      subject: cleanSubject,
      body: cleanBody,
      isCustom: true,
    };
    const updated = [...templates, newTmpl];
    setTemplates(updated);
    setSelectedTemplateId(newTmpl.id);
    setSubject(cleanSubject);
    setBodyHtml(cleanBody);
    setActiveStep(4);
    try {
      const customs = updated.filter((t) => t.isCustom);
      localStorage.setItem('erha_custom_campaign_templates', JSON.stringify(customs));
    } catch {}
    setShowSaveTemplateModal(false);
    setNewTemplateTitle('');
    setNewTemplateSubject('');
    setNewTemplateCode('');
  };

  // Insert tag in template modal
  const insertModalTag = (tag: string, target: 'subject' | 'code') => {
    if (target === 'subject') {
      setNewTemplateSubject((prev) => prev + ` {{${tag}}}`);
    } else {
      setNewTemplateCode((prev) => prev + ` {{${tag}}}`);
    }
  };

  // Delete a custom template
  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    try {
      const customs = updated.filter((t) => t.isCustom);
      localStorage.setItem('erha_custom_campaign_templates', JSON.stringify(customs));
    } catch {}
    if (selectedTemplateId === id) {
      handleTemplateChange(PRESET_TEMPLATES[0].id);
    }
  };

  // Add a new sending mailbox
  const handleAddMailbox = () => {
    if (!newMailboxEmail.trim()) return;
    const cleanMail = newMailboxEmail.trim();
    const cleanName = newMailboxName.trim() || cleanMail;
    const newBox: MailboxItem = {
      id: `mb_${Date.now()}`,
      name: cleanName,
      email: cleanMail,
      provider: newMailboxProvider,
      isCustom: true,
    };
    const updated = [...mailboxes, newBox];
    setMailboxes(updated);
    setSenderAccount(newBox.id);
    setActiveStep(3);
    try {
      const customs = updated.filter((m) => m.isCustom);
      localStorage.setItem('erha_custom_mailboxes', JSON.stringify(customs));
    } catch {}
    setShowAddMailboxModal(false);
    setNewMailboxName('');
    setNewMailboxEmail('');
  };

  // Adjust batch selection
  const handleBatchCountChange = (count: number) => {
    setBatchCount(count);
    const pendingLeads = leads.filter(
      (l) => !l.status || !l.status.toLowerCase().includes('sent')
    );
    const toSelect = pendingLeads.length > 0 ? pendingLeads : leads;
    setSelectedRows(toSelect.slice(0, count).map((l) => l.row));
    setActiveStep(2);
  };

  // Toggle single lead selection
  const toggleSelectRow = (rowNum: number) => {
    if (selectedRows.includes(rowNum)) {
      setSelectedRows(selectedRows.filter((r) => r !== rowNum));
    } else {
      setSelectedRows([...selectedRows, rowNum]);
    }
  };

  // Select all visible leads
  const toggleSelectAllVisible = (visibleLeads: LeadItem[]) => {
    const allSelected = visibleLeads.every((l) => selectedRows.includes(l.row));
    if (allSelected) {
      setSelectedRows(selectedRows.filter((r) => !visibleLeads.some((l) => l.row === r)));
    } else {
      const newSelected = Array.from(new Set([...selectedRows, ...visibleLeads.map((l) => l.row)]));
      setSelectedRows(newSelected);
    }
  };

  // Insert variable into subject or body
  const insertVariable = (tag: string, target: 'subject' | 'body') => {
    if (target === 'subject') {
      setSubject((prev) => prev + ` {{${tag}}}`);
    } else {
      setBodyHtml((prev) => prev + ` {{${tag}}}`);
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const statusLower = (l.status || '').toLowerCase();
    const isSent = statusLower.includes('sent');
    const isInvalid = statusLower.includes('invalid') || statusLower.includes('fake');

    let matchesTab = true;
    if (filterTab === 'pending') {
      matchesTab = !isSent && !isInvalid;
    } else if (filterTab === 'sent') {
      matchesTab = isSent;
    } else if (filterTab === 'invalid') {
      matchesTab = isInvalid;
    }

    const matchesSearch =
      !searchQuery ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Selected lead objects to dispatch
  const selectedLeadObjects = leads.filter((l) => selectedRows.includes(l.row));
  const previewLead = selectedLeadObjects[0] || leads[0] || {
    name: 'Alex Rivera',
    email: 'alex@example.com',
    company: 'FinTech Pulse',
  };

  // Personalized preview text
  const previewSubject = subject
    .replace(/\{\{\s*name\s*\}\}/gi, previewLead.name)
    .replace(/\{\{\s*first_name\s*\}\}/gi, previewLead.name.split(' ')[0])
    .replace(/\{\{\s*company\s*\}\}/gi, previewLead.company || 'your company')
    .replace(/\{\{\s*email\s*\}\}/gi, previewLead.email);

  const previewBody = bodyHtml
    .replace(/\{\{\s*name\s*\}\}/gi, previewLead.name)
    .replace(/\{\{\s*first_name\s*\}\}/gi, previewLead.name.split(' ')[0])
    .replace(/\{\{\s*company\s*\}\}/gi, previewLead.company || 'your company')
    .replace(/\{\{\s*email\s*\}\}/gi, previewLead.email);

  // Dispatch campaign execution
  const executeDispatch = async () => {
    if (selectedLeadObjects.length === 0) return;

    const activeMailbox = mailboxes.find((m) => m.id === senderAccount);
    const mailboxDisplay = activeMailbox
      ? `${activeMailbox.name} (${activeMailbox.email})`
      : senderAccount === 'apps_script'
      ? 'Google Apps Script (Sheet Gmail)'
      : 'Platform Connected Mailbox';

    setShowDispatchModal(true);
    setIsDispatching(true);
    setDispatchProgress({
      step: 'Initializing Outreach Engine...',
      percent: 10,
      log: [
        `Starting batch dispatch for ${selectedLeadObjects.length} leads`,
        verifyBeforeSend
          ? 'Verifier Gate: ACTIVE (Filtering DNS MX & Disposable domains)'
          : 'Verifier Gate: BYPASSED',
        `Sending Mailbox: ${mailboxDisplay}`,
      ],
    });

    let progressTimer: any = null;

    try {
      progressTimer = setInterval(() => {
        setDispatchProgress((prev) => {
          if (prev.percent < 85) {
            const nextPercent = prev.percent + 15;
            const nextStep =
              nextPercent >= 70
                ? 'Injecting tracking pixels and generating redirect links...'
                : nextPercent >= 50
                ? 'Verifying mail exchanger (MX) availability...'
                : 'Verifying DNS records and filtering disposable domains...';
            return {
              ...prev,
              percent: nextPercent,
              step: nextStep,
            };
          }
          return prev;
        });
      }, 500);

      const response = await fetch('/api/v1/campaigns/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: selectedLeadObjects,
          senderAccountId: senderAccount,
          senderName: activeMailbox?.name,
          senderEmail: activeMailbox?.email,
          template: { subject, bodyHtml },
          sheetWebhookUrl: sheetUrl,
          skipVerification: !verifyBeforeSend,
        }),
      });

      if (progressTimer) clearInterval(progressTimer);

      const data = await response.json();

      if (data && data.success) {
        const results = data.results || [];
        const logs: string[] = [];

        results.forEach((r: any) => {
          if (r.sent) {
            logs.push(`SENT: ${r.name} (${r.email}) -> Marked SENT in Sheet with tracking pixel.`);
          } else if (r.status.includes('INVALID')) {
            logs.push(`INVALID: ${r.name} (${r.email}) -> Marked INVALID in Sheet.`);
          } else {
            logs.push(`FAILED: ${r.name} (${r.email}) -> ${r.reason}`);
          }
        });

        setDispatchProgress({
          step: 'Completed Successfully',
          percent: 100,
          log: [
            ...logs,
            `Summary: ${data.summary.sentCount} Sent, ${data.summary.invalidCount} Invalid Filtered, ${data.summary.failedCount} Failed.`,
            'Google Sheet status rows have been updated automatically.',
          ],
          summary: data.summary,
        });

        // Refresh leads
        await fetchLeads();
      } else {
        throw new Error(data.error || 'Dispatch returned failure');
      }
    } catch (err: any) {
      if (progressTimer) clearInterval(progressTimer);
      setDispatchProgress((p) => ({
        ...p,
        step: 'Error occurred during dispatch',
        percent: 100,
        log: [...p.log, `Error: ${err.message}`],
      }));
    } finally {
      setIsDispatching(false);
    }
  };

  const copyAppsScriptCode = () => {
    const code = `/**
 * Email Tracker & Outreach Platform — Google Sheet Webhook Sync Script
 * 1. Open Google Sheets -> Extensions -> Apps Script
 * 2. Paste this code and Deploy as Web App ("Execute as: Me", "Access: Anyone")
 * 3. Copy Web App URL into the Email Tracker Dashboard!
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getLeads';
    if (action === 'getLeads') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const data = sheet.getDataRange().getValues();
      const leads = [];
      for (let r = 1; r < data.length; r++) {
        if (!data[r][1] && !data[r][0]) continue;
        leads.push({
          row: r + 1,
          name: data[r][0] || 'Contact',
          email: String(data[r][1] || '').trim(),
          company: data[r][2] || '',
          status: data[r][3] || '',
          sentAt: data[r][4] || ''
        });
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        sheetTitle: sheet.getName(),
        leads: leads
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === 'updateStatus') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const updates = payload.updates || [];
      for (let i = 0; i < updates.length; i++) {
        const u = updates[i];
        if (u.row) {
          if (u.status) sheet.getRange(u.row, 4).setValue(u.status);
          if (u.sentAt) sheet.getRange(u.row, 5).setValue(u.sentAt);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, updated: updates.length })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const isLeadSent = (l: LeadItem) => !!(l.status && l.status.toLowerCase().includes('sent'));
  const isLeadInvalid = (l: LeadItem) => !!(l.status && (l.status.toLowerCase().includes('invalid') || l.status.toLowerCase().includes('fake')));
  const totalLeadsCount = leads.length;
  const pendingCount = leads.filter((l) => !isLeadSent(l) && !isLeadInvalid(l)).length;
  const sentCount = leads.filter(isLeadSent).length;
  const invalidCount = leads.filter(isLeadInvalid).length;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <Header title="Campaign Studio" />

      {/* TOP SHEET CONNECT BAR & METRIC CARDS (LIGHT THEME) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Google Sheet Integration</h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connected sheet syncs leads and writes "SENT" or "INVALID" back to your sheet rows.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCodeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <FileCode className="w-4 h-4 text-blue-600" />
              Apps Script Code
            </button>
            <button
              onClick={() => fetchLeads()}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Sync Sheet
            </button>
          </div>
        </div>

        {/* Sheet Webhook URL Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ExternalLink className="w-4 h-4 text-blue-600" />
            </div>
            <input
              type="text"
              placeholder="Paste Google Apps Script Web App URL (e.g., https://script.google.com/macros/s/.../exec)"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={() => fetchLeads(sheetUrl)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connect
          </button>
          <button
            onClick={() => {
              try {
                localStorage.removeItem('erha_sheet_webhook_url');
              } catch {}
              setSheetUrl('');
              fetchLeads('');
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium border border-slate-200 transition-colors shrink-0 text-center"
          >
            Load Sample Sheet
          </button>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Leads</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{totalLeadsCount}</div>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending</div>
              <div className="text-xl font-bold text-amber-700 mt-0.5">{pendingCount}</div>
            </div>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sent &amp; Tracked</div>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">{sentCount}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Filtered Fakes</div>
              <div className="text-xl font-bold text-rose-700 mt-0.5">{invalidCount}</div>
            </div>
            <ShieldCheck className="w-5 h-5 text-rose-600" />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: GOOGLE SHEET LEADS (FULL SCREEN / LIGHT THEME) */}
      {/* ========================================================= */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Google Sheet Leads
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {leads.length} Loaded
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Select leads individually or use batch controls below
              </p>
            </div>
          </div>

          {/* Quick Selection Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              {selectedRows.length} Leads Selected
            </span>
            {selectedRows.length > 0 && (
              <button
                onClick={() => setSelectedRows([])}
                className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 transition-colors font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalLeadsCount})
            </button>
            <button
              onClick={() => setFilterTab('sent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === 'sent'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sent ({sentCount})
            </button>
            <button
              onClick={() => setFilterTab('invalid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === 'invalid'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invalid ({invalidCount})
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>
        </div>

        {/* Select All Toggle Bar */}
        <div className="flex items-center justify-between text-xs px-2 py-1 text-slate-500">
          <button
            onClick={() => toggleSelectAllVisible(filteredLeads)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
          >
            {filteredLeads.length > 0 &&
            filteredLeads.every((l) => selectedRows.includes(l.row)) ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            Select All Visible ({filteredLeads.length})
          </button>
          <span className="text-[11px] text-slate-400">Showing {filteredLeads.length} leads</span>
        </div>

        {/* Full Width Leads Table */}
        <div className="overflow-x-auto max-h-[440px] overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3 w-12 text-center">Pick</th>
                <th className="p-3">Lead Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Company</th>
                <th className="p-3">Sheet Row</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No leads in batch</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Connect your Google Sheet Webhook URL above or click &quot;Import CSV / Paste Leads&quot; to load your outreach prospects.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedRows.includes(lead.row);
                  const isSent = lead.status && lead.status.toLowerCase().includes('sent');
                  const isInvalid =
                    lead.status &&
                    (lead.status.toLowerCase().includes('invalid') ||
                      lead.status.toLowerCase().includes('fake'));

                  return (
                    <tr
                      key={lead.row}
                      onClick={() => toggleSelectRow(lead.row)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70 hover:bg-blue-50'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleSelectRow(lead.row)}
                          className="text-slate-400 hover:text-slate-800 focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                            {lead.name ? lead.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <span>{lead.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-slate-600 text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {lead.email}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        {lead.company ? (
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{lead.company}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        Row {lead.row}
                      </td>
                      <td className="p-3">
                        {isSent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            SENT
                          </span>
                        ) : isInvalid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            INVALID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            PENDING
                          </span>
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

      {/* ========================================================= */}
      {/* SECTION 2: SEQUENTIAL DISPATCH CONSOLE (LIGHT THEME)      */}
      {/* ========================================================= */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
        {/* Stepper Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Automated Outreach Dispatcher
              </h3>
              <p className="text-xs text-slate-500">
                1. Select Batch &rarr; 2. Sender Email &rarr; 3. Template &rarr; 4. Verify &amp; Send
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Step:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((step) => (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                    activeStep === step
                      ? 'bg-blue-600 text-white shadow-xs'
                      : activeStep > step
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {activeStep > step ? '✓' : step}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Cascading Dropdowns & Action Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* STEP 1: BATCH SIZE / LEADS SELECTOR */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              activeStep === 1
                ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
                Select Leads to Send
              </label>
              <span className="text-[11px] font-bold text-blue-600">{selectedRows.length} Leads</span>
            </div>

            <div className="relative">
              <select
                value={batchCount}
                onChange={(e) => handleBatchCountChange(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 appearance-none font-semibold cursor-pointer shadow-xs"
              >
                <option value={10}>Send 10 Leads (Default)</option>
                <option value={5}>Send 5 Leads</option>
                <option value={12}>Send 12 Leads</option>
                <option value={15}>Send 15 Leads</option>
                <option value={20}>Send 20 Leads</option>
                <option value={pendingCount}>Send All Pending ({pendingCount})</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quick Batch Pills */}
            <div className="flex items-center gap-1 mt-2.5">
              {[5, 10, 12, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => handleBatchCountChange(cnt)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    selectedRows.length === cnt
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cnt}
                </button>
              ))}
              <button
                onClick={() => handleBatchCountChange(pendingCount)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedRows.length === pendingCount
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* STEP 2: SENDING EMAIL (MAILBOX) DROPDOWN */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              activeStep === 2
                ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
                Sending Email
              </label>
              <button
                type="button"
                onClick={() => setShowAddMailboxModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                Add Mail
              </button>
            </div>

            <div className="relative">
              <select
                value={senderAccount}
                onChange={(e) => {
                  setSenderAccount(e.target.value);
                  setActiveStep(3);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 appearance-none font-semibold cursor-pointer truncate pr-7 shadow-xs"
              >
                {mailboxes.map((mb) => (
                  <option key={mb.id} value={mb.id}>
                    {mb.name} {mb.email && mb.name !== mb.email ? `(${mb.email})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">
                {mailboxes.find((m) => m.id === senderAccount)?.email || 'Connected Google Sheet'}
              </span>
              <Link
                href="/dashboard/accounts"
                className="text-blue-600 hover:underline shrink-0 ml-1 font-semibold"
              >
                Fleet
              </Link>
            </div>
          </div>

          {/* STEP 3: TEMPLATE SELECT DROPDOWN */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              activeStep === 3
                ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
                Choose Template
              </label>
              <button
                type="button"
                onClick={() => {
                  setNewTemplateTitle(`My Outreach Template ${templates.length + 1}`);
                  setNewTemplateSubject(subject || 'Quick idea for {{company}}');
                  setNewTemplateCode(
                    bodyHtml ||
                      `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">\n  <p>Hi {{first_name}},</p>\n  <p>I came across {{company}} and wanted to reach out...</p>\n</div>`
                  );
                  setModalTab('code');
                  setShowSaveTemplateModal(true);
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                New
              </button>
            </div>

            <div className="relative">
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 appearance-none font-semibold cursor-pointer truncate pr-7 shadow-xs"
              >
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.isCustom ? `[Custom] ${tmpl.name}` : tmpl.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setShowTemplateEditor(!showTemplateEditor)}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                {showTemplateEditor ? 'Hide Editor' : 'Preview / Edit'}
              </button>
              {templates.find((t) => t.id === selectedTemplateId)?.isCustom && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteTemplate(selectedTemplateId, e)}
                  className="text-slate-400 hover:text-rose-600"
                  title="Delete Custom Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* STEP 4: SEND & VERIFY ACTION BUTTON */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              activeStep === 4
                ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    4
                  </span>
                  Verification &amp; Send
                </label>
              </div>

              {/* Verifier Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                <input
                  type="checkbox"
                  checked={verifyBeforeSend}
                  onChange={(e) => setVerifyBeforeSend(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500"
                />
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Auto-Verify &amp; Drop Fakes
                </span>
              </label>
            </div>

            {/* Launch CTA */}
            <button
              onClick={() => {
                if (selectedRows.length === 0) {
                  toggleSelectAllVisible(filteredLeads);
                  return;
                }
                executeDispatch();
              }}
              disabled={isDispatching || leads.length === 0}
              className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-xs transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {selectedRows.length === 0 ? `Select & Send All (${filteredLeads.length})` : `Verify & Send (${selectedRows.length})`}
            </button>
          </div>
        </div>

        {/* TEMPLATE PREVIEW & INLINE EDITOR (COLLAPSIBLE / LIGHT THEME) */}
        {showTemplateEditor && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
            {/* Left: Subject & Body Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  Customize Email Copy
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setNewTemplateTitle(`Pitch ${templates.length + 1}`);
                    setNewTemplateSubject(subject);
                    setNewTemplateCode(bodyHtml);
                    setModalTab('code');
                    setShowSaveTemplateModal(true);
                  }}
                  className="text-[11px] text-blue-600 hover:underline font-bold"
                >
                  Save as Template
                </button>
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">Subject Line:</label>
                  <div className="flex items-center gap-1">
                    {['name', 'first_name', 'company'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => insertVariable(tag, 'subject')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                      >
                        +{`{{${tag}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Email Body (HTML / Plain):
                  </label>
                  <div className="flex items-center gap-1">
                    {['first_name', 'company'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => insertVariable(tag, 'body')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                      >
                        +{`{{${tag}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono text-[11px] leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Right: Personalized Live Preview for Lead #1 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Live Preview for First Lead
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  {previewLead.name} ({previewLead.email})
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 min-h-[220px] shadow-xs">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-slate-500 text-[11px]">Subject: </span>
                  <span className="text-xs font-bold text-slate-900">{previewSubject}</span>
                </div>
                <div
                  className="text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: previewBody }}
                />
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Check className="w-3 h-3" />
                    Tracking Pixel Injected
                  </span>
                  <span className="flex items-center gap-1 text-blue-700">
                    <Check className="w-3 h-3" />
                    Click Redirect Links Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Code Modal for Google Apps Script */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCodeModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Google Sheet Apps Script Code</h3>
                <p className="text-xs text-slate-500">
                  Paste this script into your Google Sheet to enable 2-way sync
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="font-semibold text-slate-900">Quick Instructions:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>
                  Open your Google Sheet containing leads (Columns: Name, Email, Company, Status).
                </li>
                <li>
                  Click on <strong>Extensions &gt; Apps Script</strong>.
                </li>
                <li>
                  Delete existing code, paste the script below, and click <strong>Deploy &gt; New deployment &gt; Web app</strong>.
                </li>
                <li>
                  Set <em>Who has access</em> to <strong>"Anyone"</strong>, deploy, and copy the Web App URL into the dashboard!
                </li>
              </ol>
            </div>

            <div className="relative">
              <pre className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-[11px] text-blue-200 font-mono max-h-60 overflow-y-auto">
                {`// Google Sheet Webhook Sync Script for Email Tracker
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const leads = [];
  for (let r = 1; r < data.length; r++) {
    if (!data[r][1]) continue;
    leads.push({
      row: r + 1,
      name: data[r][0] || 'Contact',
      email: data[r][1],
      company: data[r][2] || '',
      status: data[r][3] || '',
      sentAt: data[r][4] || ''
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true, leads: leads })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  if (payload.action === 'updateStatus') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    payload.updates.forEach(u => {
      if (u.row) {
        if (u.status) sheet.getRange(u.row, 4).setValue(u.status);
        if (u.sentAt) sheet.getRange(u.row, 5).setValue(u.sentAt);
      }
    });
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }
}`}
              </pre>

              <button
                onClick={copyAppsScriptCode}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied' : 'Copy Script'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Progress Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Send className={`w-5 h-5 ${isDispatching ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Campaign Dispatch Progress</h3>
                  <p className="text-xs text-slate-500">{dispatchProgress.step}</p>
                </div>
              </div>
              {!isDispatching && (
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="text-slate-400 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Status</span>
                <span className="text-blue-600 font-bold">{dispatchProgress.percent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                  style={{ width: `${dispatchProgress.percent}%` }}
                ></div>
              </div>
            </div>

            {/* Live Event Log Stream */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[11px] max-h-56 overflow-y-auto space-y-1 text-slate-200">
              {dispatchProgress.log.map((line, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    line.includes('SENT')
                      ? 'text-emerald-400 font-semibold'
                      : line.includes('INVALID')
                      ? 'text-rose-400 font-semibold'
                      : line.includes('Summary')
                      ? 'text-amber-300 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Action Buttons when done */}
            {!isDispatching && (
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Link
                  href="/dashboard/emails"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  View Tracked Emails
                </Link>
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save / Add Template Modal with Code & Name (LIGHT THEME) */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto text-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create Email Template</h3>
                  <p className="text-[11px] text-slate-500">Add template name, subject line, and HTML or text code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Template Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Template Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. B2B Modern Tech Pitch, Follow Up, etc."
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* 2. Subject Line */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Subject Line:
                  </label>
                  <div className="flex items-center gap-1">
                    {['name', 'first_name', 'company'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertModalTag(tag, 'subject')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                      >
                        +{`{{${tag}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Quick idea for {{company}} website & outreach"
                  value={newTemplateSubject}
                  onChange={(e) => setNewTemplateSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* 3. Email Code Section (HTML / Text) with Live Preview Tab */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Email Code &amp; Body:
                    </label>
                    {/* Mode Toggle Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setModalTab('code')}
                        className={`px-2.5 py-0.5 rounded ${
                          modalTab === 'code'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Code (HTML / Plain)
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalTab('preview')}
                        className={`px-2.5 py-0.5 rounded ${
                          modalTab === 'preview'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Live Preview
                      </button>
                    </div>
                  </div>

                  {/* Variable insertion tags for Code */}
                  {modalTab === 'code' && (
                    <div className="flex items-center gap-1">
                      {['first_name', 'company'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => insertModalTag(tag, 'code')}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                        >
                          +{`{{${tag}}}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {modalTab === 'code' ? (
                  <div className="space-y-1">
                    <textarea
                      rows={8}
                      placeholder="Paste your HTML email template or plain text copy here..."
                      value={newTemplateCode}
                      onChange={(e) => setNewTemplateCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-blue-200 focus:outline-none focus:border-blue-500 font-mono leading-relaxed resize-none"
                    />
                    <div className="text-[10px] text-slate-500">
                      Paste HTML code or plain text. Use tags like {`{{first_name}}`} and {`{{company}}`} for personalization.
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 min-h-[180px] max-h-64 overflow-y-auto">
                    <div className="text-[11px] font-bold text-slate-700 border-b border-slate-200 pb-1.5">
                      Subject:{' '}
                      <span className="text-slate-900">
                        {newTemplateSubject
                          .replace(/\{\{\s*name\s*\}\}/gi, previewLead.name)
                          .replace(/\{\{\s*first_name\s*\}\}/gi, previewLead.name.split(' ')[0])
                          .replace(/\{\{\s*company\s*\}\}/gi, previewLead.company || 'your company')}
                      </span>
                    </div>
                    <div
                      className="text-xs text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: newTemplateCode
                          .replace(/\{\{\s*name\s*\}\}/gi, previewLead.name)
                          .replace(/\{\{\s*first_name\s*\}\}/gi, previewLead.name.split(' ')[0])
                          .replace(/\{\{\s*company\s*\}\}/gi, previewLead.company || 'your company')
                          .replace(/\{\{\s*email\s*\}\}/gi, previewLead.email),
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsTemplate}
                disabled={!newTemplateTitle.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
              >
                Save &amp; Use Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sending Mailbox Modal (LIGHT THEME) */}
      {showAddMailboxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Sending Mailbox</h3>
                  <p className="text-[11px] text-slate-500">Add an email address to send outreach from</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMailboxModal(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sender Display Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Outreach Director"
                  value={newMailboxName}
                  onChange={(e) => setNewMailboxName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sender Email Address:
                </label>
                <input
                  type="email"
                  placeholder="e.g. outreach@yourcompany.com"
                  value={newMailboxEmail}
                  onChange={(e) => setNewMailboxEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Provider / Account Type:
                </label>
                <select
                  value={newMailboxProvider}
                  onChange={(e) => setNewMailboxProvider(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Google Workspace / Gmail">Google Workspace / Gmail</option>
                  <option value="Microsoft 365 / Outlook">Microsoft 365 / Outlook</option>
                  <option value="Custom SMTP Server">Custom SMTP Server</option>
                  <option value="Direct Outreach Sender">Direct Outreach Sender</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Tip: Connect OAuth accounts in the{' '}
                  <Link href="/dashboard/accounts" className="underline font-bold text-blue-700">
                    Connected Mailboxes
                  </Link>{' '}
                  page anytime.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMailboxModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMailbox}
                disabled={!newMailboxEmail.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
              >
                Add Mailbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

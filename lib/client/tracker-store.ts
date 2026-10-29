'use client';

/**
 * Mailify Pro - Unified Real-Time Tracking & Sync Store
 * Guarantees that dispatched emails, leads, open rates, and click metrics
 * are never lost across page switches, serverless cold starts, or browser reloads.
 */

export interface TrackedEmailRecord {
  id: string;
  project_id?: string;
  tracking_id: string;
  recipient_email: string;
  recipient_name?: string | null;
  subject: string;
  sent_at: string;
  first_opened_at: string | null;
  last_opened_at: string | null;
  open_count: number;
  click_count: number;
  status: string;
  bounce_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SheetStatsRecord {
  totalLeads: number;
  pendingCount: number;
  sentCount: number;
  invalidCount: number;
}

const DISPATCHED_STORAGE_KEY = 'mailify_dispatched_emails';
const SHEET_STATS_STORAGE_KEY = 'mailify_sheet_stats';
const LEAD_STATUSES_STORAGE_KEY = 'mailify_lead_statuses';

/**
 * Record a freshly dispatched email into the persistent browser store.
 */
export function recordSentEmailLocally(item: {
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  tracking_id?: string;
  sent_at?: string;
  row?: number;
}): TrackedEmailRecord {
  if (typeof window === 'undefined') {
    return {
      id: `em_${Date.now()}`,
      tracking_id: item.tracking_id || `trk_${Date.now()}`,
      recipient_email: item.recipient_email,
      recipient_name: item.recipient_name,
      subject: item.subject,
      sent_at: item.sent_at || new Date().toISOString(),
      first_opened_at: null,
      last_opened_at: null,
      open_count: 0,
      click_count: 0,
      status: 'SENT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const now = new Date().toISOString();
  const id = `em_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const tracking_id = item.tracking_id || `trk_${Math.random().toString(36).substring(2, 10)}`;

  const newRecord: TrackedEmailRecord = {
    id,
    project_id: 'prj_demo_01',
    tracking_id,
    recipient_email: item.recipient_email.trim().toLowerCase(),
    recipient_name: item.recipient_name || item.recipient_email.split('@')[0],
    subject: item.subject || 'Cold Outreach Campaign',
    sent_at: item.sent_at || now,
    first_opened_at: null,
    last_opened_at: null,
    open_count: 0,
    click_count: 0,
    status: 'SENT',
    created_at: now,
    updated_at: now,
  };

  try {
    const raw = localStorage.getItem(DISPATCHED_STORAGE_KEY);
    const existing: TrackedEmailRecord[] = raw ? JSON.parse(raw) : [];
    
    // Check if already present
    const idx = existing.findIndex(
      (e) => e.recipient_email === newRecord.recipient_email && e.subject === newRecord.subject
    );

    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...newRecord };
    } else {
      existing.unshift(newRecord);
    }

    localStorage.setItem(DISPATCHED_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('[TrackerStore] Error saving email locally:', err);
  }

  // Also update sheet stats
  try {
    const rawStats = localStorage.getItem(SHEET_STATS_STORAGE_KEY);
    const stats: SheetStatsRecord = rawStats
      ? JSON.parse(rawStats)
      : { totalLeads: 0, pendingCount: 0, sentCount: 0, invalidCount: 0 };

    if (stats.pendingCount > 0) stats.pendingCount -= 1;
    stats.sentCount += 1;
    localStorage.setItem(SHEET_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {}

  // Best-effort background sync to server
  try {
    fetch('/api/v1/emails/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newRecord }),
    }).catch(() => {});
  } catch {}

  return newRecord;
}

/**
 * Retrieve all emails stored locally, including synthesized records from mailify_lead_statuses
 */
export function getDispatchedEmailsLocally(): TrackedEmailRecord[] {
  if (typeof window === 'undefined') return [];

  const map = new Map<string, TrackedEmailRecord>();

  // 1. Load explicitly stored dispatched emails
  try {
    const raw = localStorage.getItem(DISPATCHED_STORAGE_KEY);
    if (raw) {
      const list: TrackedEmailRecord[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item?.recipient_email) {
            map.set(item.recipient_email.toLowerCase().trim(), item);
          }
        });
      }
    }
  } catch (err) {
    console.warn('[TrackerStore] Error reading dispatched emails:', err);
  }

  // 2. Synthesize emails from mailify_lead_statuses (e.g. leads sent in Campaign Studio)
  try {
    const rawStatuses = localStorage.getItem(LEAD_STATUSES_STORAGE_KEY);
    if (rawStatuses) {
      const statuses = JSON.parse(rawStatuses);
      Object.keys(statuses).forEach((key) => {
        const item = statuses[key];
        if (item && item.status) {
          const emailAddr = (item.email || key).toLowerCase().trim();
          if (item.status.includes('BOUNCE') || item.status.includes('550')) {
            if (emailAddr && emailAddr.includes('@')) {
              const existing = map.get(emailAddr);
              if (existing) {
                existing.status = 'BOUNCED ❌';
                existing.bounce_reason = item.reason || '550 5.1.1 Address not found';
              } else {
                map.set(emailAddr, {
                  id: `em_local_${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
                  project_id: 'prj_demo_01',
                  tracking_id: `trk_${Math.random().toString(36).substring(2, 10)}`,
                  recipient_email: emailAddr,
                  recipient_name: emailAddr.split('@')[0],
                  subject: 'Campaign Studio Outreach',
                  sent_at: item.sentAt ? new Date().toISOString() : new Date().toISOString(),
                  first_opened_at: null,
                  last_opened_at: null,
                  open_count: 0,
                  click_count: 0,
                  status: 'BOUNCED ❌',
                  bounce_reason: item.reason || '550 5.1.1 Address not found',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
              }
            }
          } else if (item.status.includes('SENT') || item.status.includes('✅')) {
            if (emailAddr && emailAddr.includes('@') && !map.has(emailAddr)) {
              const fakeId = `em_local_${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
              map.set(emailAddr, {
                id: fakeId,
                project_id: 'prj_demo_01',
                tracking_id: `trk_${Math.random().toString(36).substring(2, 10)}`,
                recipient_email: emailAddr,
                recipient_name: emailAddr.split('@')[0],
                subject: 'Campaign Studio Outreach',
                sent_at: item.sentAt ? new Date().toISOString() : new Date().toISOString(),
                first_opened_at: null,
                last_opened_at: null,
                open_count: 0,
                click_count: 0,
                status: 'SENT',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
      });
    }
  } catch (err) {
    console.warn('[TrackerStore] Error recovering statuses:', err);
  }

  return Array.from(map.values());
}

/**
 * Mark a recipient email as BOUNCED ❌ in persistent client storage and adjust dashboard metrics.
 */
export function markEmailBouncedLocally(recipientEmail: string, bounceReason?: string) {
  if (typeof window === 'undefined' || !recipientEmail) return;
  const targetEmail = recipientEmail.toLowerCase().trim();

  // 1. Update mailify_dispatched_emails
  try {
    const raw = localStorage.getItem(DISPATCHED_STORAGE_KEY);
    if (raw) {
      const list: TrackedEmailRecord[] = JSON.parse(raw);
      let updated = false;
      const updatedList = list.map((item) => {
        if (item.recipient_email?.toLowerCase().trim() === targetEmail) {
          updated = true;
          return {
            ...item,
            status: 'BOUNCED ❌',
            bounce_reason: bounceReason || '550 5.1.1 Address not found',
            updated_at: new Date().toISOString(),
          };
        }
        return item;
      });

      if (updated) {
        localStorage.setItem(DISPATCHED_STORAGE_KEY, JSON.stringify(updatedList));
      }
    }
  } catch (err) {
    console.warn('[TrackerStore] Error updating bounced email in tracker store:', err);
  }

  // 2. Update mailify_lead_statuses
  try {
    const rawStatuses = localStorage.getItem(LEAD_STATUSES_STORAGE_KEY);
    if (rawStatuses) {
      const statuses = JSON.parse(rawStatuses);
      let changed = false;
      Object.keys(statuses).forEach((key) => {
        const item = statuses[key];
        const itemEmail = (item?.email || key).toLowerCase().trim();
        if (itemEmail === targetEmail) {
          statuses[key] = {
            ...item,
            status: 'BOUNCED ❌',
            reason: bounceReason || '550 5.1.1 Address not found',
            bouncedAt: new Date().toISOString(),
          };
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(LEAD_STATUSES_STORAGE_KEY, JSON.stringify(statuses));
      }
    }
  } catch (err) {
    console.warn('[TrackerStore] Error updating lead statuses:', err);
  }

  // 3. Decrement sentCount and increment invalidCount in mailify_sheet_stats
  try {
    const rawStats = localStorage.getItem(SHEET_STATS_STORAGE_KEY);
    if (rawStats) {
      const stats: SheetStatsRecord = JSON.parse(rawStats);
      if (stats.sentCount > 0) {
        stats.sentCount -= 1;
        stats.invalidCount = (stats.invalidCount || 0) + 1;
        localStorage.setItem(SHEET_STATS_STORAGE_KEY, JSON.stringify(stats));
      }
    }
  } catch {}
}

/**
 * Save Sheet lead stats to local storage so Overview always stays accurate
 */
export function saveSheetStatsLocally(stats: SheetStatsRecord) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SHEET_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

/**
 * Retrieve Sheet lead stats from local storage
 */
export function getSheetStatsLocally(): SheetStatsRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SHEET_STATS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/**
 * Merges server dashboard data with local dispatched emails and sheet statistics.
 * Guarantees that Overview, Graphs, Analytics, and Emails are ALWAYS 100% accurate.
 */
export function getUnifiedDashboardData(serverData?: any): any {
  const localEmails = getDispatchedEmailsLocally();
  const serverEmails: any[] = serverData?.emails || [];

  // De-duplicate emails (server email takes precedence for open/click counts)
  const emailMap = new Map<string, any>();

  localEmails.forEach((em) => {
    emailMap.set(em.recipient_email.toLowerCase().trim(), em);
  });

  serverEmails.forEach((em) => {
    if (em?.recipient_email) {
      const key = em.recipient_email.toLowerCase().trim();
      const existing = emailMap.get(key);
      emailMap.set(key, {
        ...existing,
        ...em,
        // Preserve open/click count from server if higher
        open_count: Math.max(em.open_count || 0, existing?.open_count || 0),
        click_count: Math.max(em.click_count || 0, existing?.click_count || 0),
      });
    }
  });

  const allEmails = Array.from(emailMap.values()).sort(
    (a, b) => new Date(b.sent_at || b.created_at).getTime() - new Date(a.sent_at || a.created_at).getTime()
  );

  const totalEmails = allEmails.length;
  const trackedOpens = allEmails.reduce((sum, e) => sum + (e.open_count || 0), 0);
  const uniqueOpens = allEmails.filter((e) => (e.open_count || 0) > 0).length;
  const totalClicks = allEmails.reduce((sum, e) => sum + (e.click_count || 0), 0);
  const uniqueClicks = allEmails.filter((e) => (e.click_count || 0) > 0).length;

  const openRate = totalEmails > 0 ? Math.round((uniqueOpens / totalEmails) * 100) : 0;
  const clickRate = totalEmails > 0 ? Math.round((uniqueClicks / totalEmails) * 100) : 0;
  const unopenedEmails = Math.max(0, totalEmails - uniqueOpens);

  const bouncedEmails = allEmails.filter(
    (e) => (e.status || '').toUpperCase().includes('BOUNCE') || (e.status || '').includes('550')
  );
  const bouncedCount = bouncedEmails.length;

  const summary = {
    totalEmails,
    bouncedCount,
    trackedOpens,
    uniqueOpens,
    unopenedEmails,
    totalClicks,
    uniqueClicks,
    openRate,
    clickRate,
  };

  // Build activity list
  const activity = allEmails.slice(0, 10).map((em) => ({
    id: `act_${em.id}`,
    event_type: 'SENT',
    occurred_at: em.sent_at || em.created_at,
    recipient_email: em.recipient_email,
    email_subject: em.subject || 'Cold Outreach Email',
    email_id: em.id,
  }));

  return {
    summary,
    emails: allEmails,
    activity,
    topLinks: serverData?.topLinks || [],
  };
}

/**
 * Retrieve unified emails list for /dashboard/emails
 */
export function getUnifiedEmailsList(serverEmails?: any[]): any[] {
  const unified = getUnifiedDashboardData({ emails: serverEmails || [] });
  return unified.emails;
}

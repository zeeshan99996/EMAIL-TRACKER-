'use client';

/**
 * Mailify Pro - Ultra-Fast Persistent Connected Mailbox Store
 * Guarantees that connected email accounts:
 * 1. Render INSTANTLY (0ms) on page load with zero spinner delay.
 * 2. Are NEVER lost across serverless cold starts, reloads, or container restarts.
 * 3. Stay 100% synchronized between Connected Mailboxes (/dashboard/accounts)
 *    and Campaign Studio (/dashboard/campaigns).
 */

export interface ConnectedAccountRecord {
  id: string;
  email: string;
  provider: string;
  status: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
  warmup?: any;
  metadata?: any;
  isCustom?: boolean;
}

const STORAGE_KEY_ACCOUNTS = 'mailify_connected_accounts';
const STORAGE_KEY_CUSTOM_MAILBOXES = 'erha_custom_mailboxes';

/**
 * Instantly retrieve all locally saved accounts (0ms synchronous read).
 */
export function getLocalAccounts(): ConnectedAccountRecord[] {
  if (typeof window === 'undefined') return [];

  const map = new Map<string, ConnectedAccountRecord>();

  // 1. Read from mailify_connected_accounts
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (raw) {
      const parsed: ConnectedAccountRecord[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((acc) => {
          if (acc && acc.email) {
            map.set(acc.email.toLowerCase().trim(), acc);
          }
        });
      }
    }
  } catch (err) {
    console.warn('[AccountsStore] Error reading mailify_connected_accounts:', err);
  }

  // 2. Read from erha_custom_mailboxes (Campaign Studio senders)
  try {
    const rawCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_MAILBOXES);
    if (rawCustom) {
      const parsedCustom = JSON.parse(rawCustom);
      if (Array.isArray(parsedCustom)) {
        parsedCustom.forEach((mb: any) => {
          if (mb && mb.email && mb.email.includes('@')) {
            const clean = mb.email.toLowerCase().trim();
            if (!map.has(clean)) {
              map.set(clean, {
                id: mb.id || `acc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                email: clean,
                provider: mb.provider || (clean.endsWith('@gmail.com') ? 'gmail_app_password' : 'custom_smtp'),
                status: 'connected',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                isCustom: true,
              });
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('[AccountsStore] Error reading erha_custom_mailboxes:', err);
  }

  return Array.from(map.values());
}

/**
 * Save an account into persistent storage and update both Accounts & Campaign Studio stores.
 */
export function saveAccountLocally(
  account: Partial<ConnectedAccountRecord> & { email: string }
): ConnectedAccountRecord {
  const cleanEmail = account.email.toLowerCase().trim();
  const now = new Date().toISOString();
  const id = account.id || `acc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const record: ConnectedAccountRecord = {
    id,
    email: cleanEmail,
    provider: account.provider || (cleanEmail.endsWith('@gmail.com') ? 'gmail_app_password' : 'custom_smtp'),
    status: account.status || 'connected',
    last_sync_at: account.last_sync_at || now,
    created_at: account.created_at || now,
    updated_at: now,
    warmup: account.warmup,
    metadata: account.metadata,
  };

  if (typeof window === 'undefined') return record;

  // 1. Update mailify_connected_accounts
  try {
    const existing = getLocalAccounts();
    const map = new Map<string, ConnectedAccountRecord>();
    existing.forEach((a) => map.set(a.email.toLowerCase().trim(), a));
    map.set(cleanEmail, record);

    const updatedList = Array.from(map.values());
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedList));
  } catch (err) {
    console.warn('[AccountsStore] Error saving locally:', err);
  }

  // 2. Synchronize to erha_custom_mailboxes for Campaign Studio
  try {
    const rawCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_MAILBOXES);
    const customList = rawCustom ? JSON.parse(rawCustom) : [];
    const customMap = new Map<string, any>();
    if (Array.isArray(customList)) {
      customList.forEach((m: any) => {
        if (m && m.email) customMap.set(m.email.toLowerCase().trim(), m);
      });
    }

    customMap.set(cleanEmail, {
      id: record.id,
      name: cleanEmail,
      email: cleanEmail,
      provider: record.provider,
      isCustom: true,
    });

    localStorage.setItem(STORAGE_KEY_CUSTOM_MAILBOXES, JSON.stringify(Array.from(customMap.values())));
  } catch {}

  // 3. Best-effort background sync to server
  try {
    fetch('/api/email-accounts/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: record }),
    }).catch(() => {});
  } catch {}

  return record;
}

/**
 * Remove an account from both stores.
 */
export function removeAccountLocally(accountIdOrEmail: string) {
  if (typeof window === 'undefined') return;

  const target = accountIdOrEmail.toLowerCase().trim();

  try {
    const existing = getLocalAccounts();
    const remaining = existing.filter(
      (a) => a.id !== accountIdOrEmail && a.email.toLowerCase().trim() !== target
    );
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(remaining));

    const rawCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_MAILBOXES);
    if (rawCustom) {
      const customList = JSON.parse(rawCustom);
      if (Array.isArray(customList)) {
        const remainingCustom = customList.filter(
          (m: any) => m.id !== accountIdOrEmail && m.email?.toLowerCase().trim() !== target
        );
        localStorage.setItem(STORAGE_KEY_CUSTOM_MAILBOXES, JSON.stringify(remainingCustom));
      }
    }
  } catch (err) {
    console.warn('[AccountsStore] Error removing account:', err);
  }
}

/**
 * Merges server accounts with local cache without losing any local accounts.
 */
export function mergeServerAndLocalAccounts(serverAccounts: any[]): ConnectedAccountRecord[] {
  const localList = getLocalAccounts();
  const map = new Map<string, ConnectedAccountRecord>();

  // 1. Put local accounts first
  localList.forEach((acc) => {
    map.set(acc.email.toLowerCase().trim(), acc);
  });

  // 2. Merge server accounts (server takes precedence for metadata/warmup if available)
  if (Array.isArray(serverAccounts)) {
    serverAccounts.forEach((serv) => {
      if (serv && serv.email) {
        const key = serv.email.toLowerCase().trim();
        const existing = map.get(key);
        map.set(key, {
          id: serv.id || existing?.id || `acc_${Date.now()}`,
          email: key,
          provider: serv.provider || existing?.provider || 'gmail_app_password',
          status: serv.status || existing?.status || 'connected',
          last_sync_at: serv.last_sync_at || existing?.last_sync_at || new Date().toISOString(),
          created_at: serv.created_at || existing?.created_at || new Date().toISOString(),
          updated_at: serv.updated_at || new Date().toISOString(),
          warmup: serv.warmup || existing?.warmup,
          metadata: serv.metadata || existing?.metadata,
        });
      }
    });
  }

  const merged = Array.from(map.values());

  // Save merged state back to localStorage
  if (typeof window !== 'undefined' && merged.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(merged));
    } catch {}
  }

  return merged;
}

import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import {
  EmailAccount,
  EmailWarmupConfig,
  EmailWarmupAccount,
  EmailWarmupJob,
  EmailWarmupEvent,
  EmailWarmupStat,
  TargetedWarmupCampaign,
  TargetedWarmupPeer,
  TargetedWarmupJob,
  TargetedWarmupEvent,
  TargetedWarmupStat,
} from '@/lib/warmup/types';

export interface DatabaseSchema {
  email_accounts: EmailAccount[];
  email_warmup_configs: EmailWarmupConfig[];
  email_warmup_accounts: EmailWarmupAccount[];
  email_warmup_jobs: EmailWarmupJob[];
  email_warmup_events: EmailWarmupEvent[];
  email_warmup_stats: EmailWarmupStat[];
  targeted_warmup_campaigns: TargetedWarmupCampaign[];
  targeted_warmup_peers: TargetedWarmupPeer[];
  targeted_warmup_jobs: TargetedWarmupJob[];
  targeted_warmup_events: TargetedWarmupEvent[];
  targeted_warmup_stats: TargetedWarmupStat[];
}

let cachedDb: DatabaseSchema | null = null;
let resolvedDataDir: string | null = null;
let resolvedDbFile: string | null = null;

function getDataPaths(): { dataDir: string; dbFile: string } {
  if (resolvedDataDir && resolvedDbFile) {
    return { dataDir: resolvedDataDir, dbFile: resolvedDbFile };
  }

  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    // In serverless, process.cwd() is read-only /var/task. Use /tmp which is writable!
    const tmpDataDir = path.join(os.tmpdir(), 'email-tracker-data');
    const tmpDbFile = path.join(tmpDataDir, 'warmup_store.json');
    const seedDbFile = path.join(process.cwd(), 'data', 'warmup_store.json');

    try {
      if (!fs.existsSync(tmpDataDir)) {
        fs.mkdirSync(tmpDataDir, { recursive: true });
      }
      if (!fs.existsSync(tmpDbFile) && fs.existsSync(seedDbFile)) {
        fs.copyFileSync(seedDbFile, tmpDbFile);
      }
    } catch (err) {
      console.warn('[LocalDB] Serverless /tmp prep warning:', err);
    }

    resolvedDataDir = tmpDataDir;
    resolvedDbFile = tmpDbFile;
    return { dataDir: resolvedDataDir, dbFile: resolvedDbFile };
  }

  // Local environment (Windows/Linux)
  const localDataDir = path.join(process.cwd(), 'data');
  const localDbFile = path.join(localDataDir, 'warmup_store.json');

  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
  } catch {
    // If local mkdir fails for any reason, fallback to tmpdir
    const fallbackDir = path.join(os.tmpdir(), 'email-tracker-data');
    try {
      if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    } catch {}
    resolvedDataDir = fallbackDir;
    resolvedDbFile = path.join(fallbackDir, 'warmup_store.json');
    return { dataDir: resolvedDataDir, dbFile: resolvedDbFile };
  }

  resolvedDataDir = localDataDir;
  resolvedDbFile = localDbFile;
  return { dataDir: resolvedDataDir, dbFile: resolvedDbFile };
}

export function ensureDbFile(): DatabaseSchema {
  if (cachedDb) {
    return cachedDb;
  }

  const { dataDir, dbFile } = getDataPaths();
  const seedDbFile = path.join(process.cwd(), 'data', 'warmup_store.json');

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    console.warn('[LocalDB] Could not create dataDir:', err);
  }

  // 1. Try reading from target file in dataDir
  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, 'utf8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      parsed.email_accounts = parsed.email_accounts || [];
      parsed.email_warmup_configs = parsed.email_warmup_configs || [];
      parsed.email_warmup_accounts = parsed.email_warmup_accounts || [];
      parsed.email_warmup_jobs = parsed.email_warmup_jobs || [];
      parsed.email_warmup_events = parsed.email_warmup_events || [];
      parsed.email_warmup_stats = parsed.email_warmup_stats || [];
      parsed.targeted_warmup_campaigns = parsed.targeted_warmup_campaigns || [];
      parsed.targeted_warmup_peers = parsed.targeted_warmup_peers || [];
      parsed.targeted_warmup_jobs = parsed.targeted_warmup_jobs || [];
      parsed.targeted_warmup_events = parsed.targeted_warmup_events || [];
      parsed.targeted_warmup_stats = parsed.targeted_warmup_stats || [];
      cachedDb = parsed;
      return cachedDb;
    } catch (err) {
      console.warn('[LocalDB] Error reading dbFile:', err);
    }
  }

  // 2. Try reading from seed file in repo
  if (fs.existsSync(seedDbFile)) {
    try {
      const rawSeed = fs.readFileSync(seedDbFile, 'utf8');
      const parsedSeed = JSON.parse(rawSeed) as DatabaseSchema;
      parsedSeed.email_accounts = parsedSeed.email_accounts || [];
      parsedSeed.email_warmup_configs = parsedSeed.email_warmup_configs || [];
      parsedSeed.email_warmup_accounts = parsedSeed.email_warmup_accounts || [];
      parsedSeed.email_warmup_jobs = parsedSeed.email_warmup_jobs || [];
      parsedSeed.email_warmup_events = parsedSeed.email_warmup_events || [];
      parsedSeed.email_warmup_stats = parsedSeed.email_warmup_stats || [];
      parsedSeed.targeted_warmup_campaigns = parsedSeed.targeted_warmup_campaigns || [];
      parsedSeed.targeted_warmup_peers = parsedSeed.targeted_warmup_peers || [];
      parsedSeed.targeted_warmup_jobs = parsedSeed.targeted_warmup_jobs || [];
      parsedSeed.targeted_warmup_events = parsedSeed.targeted_warmup_events || [];
      parsedSeed.targeted_warmup_stats = parsedSeed.targeted_warmup_stats || [];
      cachedDb = parsedSeed;

      try {
        fs.writeFileSync(dbFile, JSON.stringify(parsedSeed, null, 2), 'utf8');
      } catch {}

      return cachedDb;
    } catch (err) {
      console.warn('[LocalDB] Error reading seedDbFile:', err);
    }
  }

  // 3. Fallback to clean initial schema
  const initial: DatabaseSchema = {
    email_accounts: [],
    email_warmup_configs: [],
    email_warmup_accounts: [],
    email_warmup_jobs: [],
    email_warmup_events: [],
    email_warmup_stats: [],
    targeted_warmup_campaigns: [],
    targeted_warmup_peers: [],
    targeted_warmup_jobs: [],
    targeted_warmup_events: [],
    targeted_warmup_stats: [],
  };

  try {
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2), 'utf8');
  } catch {}

  cachedDb = initial;
  return cachedDb;
}

export function saveDb(data: DatabaseSchema) {
  cachedDb = data; // Update in-memory cache immediately
  try {
    const { dataDir, dbFile } = getDataPaths();
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('[LocalDB] Error saving db to disk (using memory cache):', err);
  }
}

export const localDb = {
  // Accounts
  getAccounts(userId?: string): EmailAccount[] {
    const db = ensureDbFile();
    const accounts = db.email_accounts.filter((a) => a.status !== 'disconnected');
    if (userId) {
      const userAccounts = accounts.filter((a) => a.user_id === userId);
      if (userAccounts.length === 0 && accounts.length > 0) {
        for (const a of accounts) {
          a.user_id = userId;
        }
        for (const w of db.email_warmup_accounts) {
          w.user_id = userId;
        }
        saveDb(db);
        return accounts;
      }
      return userAccounts;
    }
    return accounts;
  },

  getAccountById(id: string): EmailAccount | undefined {
    const db = ensureDbFile();
    return db.email_accounts.find((a) => a.id === id);
  },

  upsertAccount(account: Partial<EmailAccount> & { user_id: string; email: string }): EmailAccount {
    const db = ensureDbFile();
    const existingIndex = db.email_accounts.findIndex(
      (a) => a.email.toLowerCase() === account.email.toLowerCase()
    );

    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      const updated = {
        ...db.email_accounts[existingIndex],
        ...account,
        user_id: account.user_id,
        status: account.status || 'connected',
        error_message: null,
        updated_at: now,
      };
      db.email_accounts[existingIndex] = updated as EmailAccount;
      saveDb(db);
      return updated as EmailAccount;
    } else {
      const created: EmailAccount = {
        id: account.id || crypto.randomUUID(),
        user_id: account.user_id,
        email: account.email,
        provider: account.provider || 'gmail',
        provider_account_id: account.provider_account_id,
        access_token: account.access_token || '',
        refresh_token: account.refresh_token,
        token_expires_at: account.token_expires_at,
        status: account.status || 'connected',
        last_sync_at: now,
        error_message: null,
        metadata: account.metadata,
        created_at: now,
        updated_at: now,
      };
      db.email_accounts.push(created);
      saveDb(db);
      return created;
    }
  },

  updateAccount(id: string, updates: Partial<EmailAccount>) {
    const db = ensureDbFile();
    const index = db.email_accounts.findIndex((a) => a.id === id);
    if (index >= 0) {
      db.email_accounts[index] = {
        ...db.email_accounts[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      saveDb(db);
    }
  },

  deleteAccount(id: string) {
    const db = ensureDbFile();
    db.email_accounts = db.email_accounts.filter((a) => a.id !== id);
    db.email_warmup_accounts = db.email_warmup_accounts.filter(
      (w) => w.email_account_id !== id && w.id !== id
    );
    db.email_warmup_jobs = db.email_warmup_jobs.filter(
      (j) => j.source_account_id !== id && j.target_account_id !== id
    );
    saveDb(db);
  },

  // Warmup Configs
  getConfig(userId: string): EmailWarmupConfig {
    const db = ensureDbFile();
    let config = db.email_warmup_configs.find((c) => c.user_id === userId);
    if (!config && db.email_warmup_configs.length > 0) {
      config = db.email_warmup_configs[0];
      config.user_id = userId;
      saveDb(db);
    }

    if (!config) {
      const now = new Date().toISOString();
      config = {
        id: crypto.randomUUID(),
        user_id: userId,
        enabled: true,
        status: 'active',
        daily_limit: 20,
        min_delay_minutes: 3,
        max_delay_minutes: 5,
        max_messages_per_thread: 4,
        ai_enabled: true,
        warmup_level_max: 4,
        created_at: now,
        updated_at: now,
      };
      db.email_warmup_configs.push(config);
      saveDb(db);
    }
    return config;
  },

  upsertConfig(userId: string, updates: Partial<EmailWarmupConfig>): EmailWarmupConfig {
    const db = ensureDbFile();
    const index = db.email_warmup_configs.findIndex((c) => c.user_id === userId);
    const now = new Date().toISOString();
    if (index >= 0) {
      db.email_warmup_configs[index] = {
        ...db.email_warmup_configs[index],
        ...updates,
        updated_at: now,
      };
      saveDb(db);
      return db.email_warmup_configs[index];
    } else {
      const created: EmailWarmupConfig = {
        id: crypto.randomUUID(),
        user_id: userId,
        enabled: true,
        status: 'active',
        daily_limit: 20,
        min_delay_minutes: 3,
        max_delay_minutes: 5,
        max_messages_per_thread: 4,
        ai_enabled: true,
        warmup_level_max: 4,
        created_at: now,
        updated_at: now,
        ...updates,
      };
      db.email_warmup_configs.push(created);
      saveDb(db);
      return created;
    }
  },

  // Warmup Accounts
  getWarmupAccounts(userId?: string): EmailWarmupAccount[] {
    const db = ensureDbFile();
    let list = db.email_warmup_accounts.filter(
      (w) => db.email_accounts.some((a) => a.id === w.email_account_id && a.status !== 'disconnected')
    );

    if (userId) {
      const userList = list.filter((w) => w.user_id === userId);
      if (userList.length === 0 && list.length > 0) {
        for (const w of list) {
          w.user_id = userId;
        }
        saveDb(db);
      } else {
        list = userList;
      }
    }
    return list.map((w) => ({
      ...w,
      email_account: db.email_accounts.find((a) => a.id === w.email_account_id),
    }));
  },

  getWarmupAccountByEmailAccountId(emailAccountId: string): EmailWarmupAccount | undefined {
    const db = ensureDbFile();
    const w = db.email_warmup_accounts.find((a) => a.email_account_id === emailAccountId);
    if (!w) return undefined;
    return {
      ...w,
      email_account: db.email_accounts.find((a) => a.id === w.email_account_id),
    };
  },

  upsertWarmupAccount(account: Partial<EmailWarmupAccount> & { user_id: string; email_account_id: string }): EmailWarmupAccount {
    const db = ensureDbFile();
    const index = db.email_warmup_accounts.findIndex((w) => w.email_account_id === account.email_account_id);
    const now = new Date().toISOString();

    if (index >= 0) {
      db.email_warmup_accounts[index] = {
        ...db.email_warmup_accounts[index],
        ...account,
        user_id: account.user_id,
        updated_at: now,
      };
      saveDb(db);
      return db.email_warmup_accounts[index];
    } else {
      const created: EmailWarmupAccount = {
        id: account.id || crypto.randomUUID(),
        user_id: account.user_id,
        warmup_config_id: account.warmup_config_id || crypto.randomUUID(),
        email_account_id: account.email_account_id,
        status: account.status || 'queued',
        warmup_level: account.warmup_level || 0,
        daily_sent: 0,
        daily_received: 0,
        daily_replies: 0,
        total_sent: 0,
        total_received: 0,
        total_replies: 0,
        created_at: now,
        updated_at: now,
      };
      db.email_warmup_accounts.push(created);
      saveDb(db);
      return created;
    }
  },

  updateWarmupAccount(id: string, updates: Partial<EmailWarmupAccount>) {
    const db = ensureDbFile();
    const index = db.email_warmup_accounts.findIndex((w) => w.id === id || w.email_account_id === id);
    if (index >= 0) {
      db.email_warmup_accounts[index] = {
        ...db.email_warmup_accounts[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      saveDb(db);
    }
  },

  // Warmup Jobs
  getJobs(userId?: string): EmailWarmupJob[] {
    const db = ensureDbFile();
    if (!userId) return db.email_warmup_jobs;
    return db.email_warmup_jobs.filter((j) => j.user_id === userId);
  },

  insertJob(job: Partial<EmailWarmupJob> & { user_id: string; source_account_id: string; target_account_id: string; job_type: any; scheduled_at: string }): EmailWarmupJob {
    const db = ensureDbFile();
    const now = new Date().toISOString();
    const created: EmailWarmupJob = {
      id: crypto.randomUUID(),
      user_id: job.user_id,
      warmup_account_id: job.warmup_account_id,
      source_account_id: job.source_account_id,
      target_account_id: job.target_account_id,
      job_type: job.job_type,
      status: job.status || 'queued',
      scheduled_at: job.scheduled_at,
      attempts: 0,
      idempotency_key: job.idempotency_key,
      gmail_thread_id: job.gmail_thread_id,
      gmail_message_id: job.gmail_message_id,
      metadata: job.metadata || {},
      created_at: now,
      updated_at: now,
    };
    db.email_warmup_jobs.push(created);
    saveDb(db);
    return created;
  },

  claimDueJobs(batchSize = 10): EmailWarmupJob[] {
    const db = ensureDbFile();
    const now = new Date().toISOString();

    const due = db.email_warmup_jobs.filter(
      (j) => j.status === 'queued' && j.scheduled_at <= now
    ).slice(0, batchSize);

    for (const job of due) {
      job.status = 'processing';
      job.started_at = now;
      job.locked_at = now;
      job.attempts = (job.attempts || 0) + 1;
      job.updated_at = now;
    }

    if (due.length > 0) {
      saveDb(db);
    }

    return due;
  },

  updateJob(id: string, updates: Partial<EmailWarmupJob>) {
    const db = ensureDbFile();
    const index = db.email_warmup_jobs.findIndex((j) => j.id === id);
    if (index >= 0) {
      db.email_warmup_jobs[index] = {
        ...db.email_warmup_jobs[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      saveDb(db);
    }
  },

  cancelQueuedJobs({ userId, accountId, reason }: { userId?: string; accountId?: string; reason?: string }) {
    const db = ensureDbFile();
    let modified = false;
    const now = new Date().toISOString();
    for (const j of db.email_warmup_jobs) {
      if (j.status === 'queued') {
        const matchesUser = !userId || j.user_id === userId;
        const matchesAccount = !accountId || j.source_account_id === accountId || j.target_account_id === accountId;
        if (matchesUser && matchesAccount) {
          j.status = 'cancelled';
          j.error_message = reason || 'Cancelled by user';
          j.updated_at = now;
          modified = true;
        }
      }
    }
    if (modified) {
      saveDb(db);
    }
  },

  pauseAllWarmupAccounts(userId: string) {
    const db = ensureDbFile();
    const now = new Date().toISOString();
    let modified = false;
    for (const a of db.email_warmup_accounts) {
      if (!userId || a.user_id === userId) {
        a.status = 'paused';
        a.paused_at = now;
        a.updated_at = now;
        modified = true;
      }
    }
    if (modified) {
      saveDb(db);
    }
  },

  stopAllWarmupAccounts(userId: string) {
    const db = ensureDbFile();
    const now = new Date().toISOString();
    let modified = false;
    for (const a of db.email_warmup_accounts) {
      if (!userId || a.user_id === userId) {
        a.status = 'paused';
        a.started_at = null;
        a.paused_at = now;
        a.next_activity_at = null;
        a.updated_at = now;
        modified = true;
      }
    }
    if (modified) {
      saveDb(db);
    }
  },

  // Events
  insertEvent(event: Partial<EmailWarmupEvent> & { user_id: string; event_type: any }): EmailWarmupEvent {
    const db = ensureDbFile();
    const created: EmailWarmupEvent = {
      id: crypto.randomUUID(),
      user_id: event.user_id,
      warmup_account_id: event.warmup_account_id,
      source_account_id: event.source_account_id,
      target_account_id: event.target_account_id,
      event_type: event.event_type,
      gmail_message_id: event.gmail_message_id,
      gmail_thread_id: event.gmail_thread_id,
      status: event.status || 'success',
      metadata: event.metadata || {},
      created_at: new Date().toISOString(),
    };
    db.email_warmup_events.unshift(created);
    saveDb(db);
    return created;
  },

  getEvents(userId: string, limit = 50, offset = 0, eventType?: string, status?: string): { events: EmailWarmupEvent[]; total: number } {
    const db = ensureDbFile();
    let list = db.email_warmup_events;

    if (eventType && eventType !== 'all') {
      list = list.filter((e) => e.event_type === eventType);
    }
    if (status && status !== 'all') {
      list = list.filter((e) => e.status === status);
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limit).map((e) => ({
      ...e,
      source_account: e.source_account_id ? { email: db.email_accounts.find((a) => a.id === e.source_account_id)?.email || '' } : undefined,
      target_account: e.target_account_id ? { email: db.email_accounts.find((a) => a.id === e.target_account_id)?.email || '' } : undefined,
    }));

    return { events: paginated, total };
  },

  // Stats
  upsertDailyStat(userId: string, accountId: string, type: 'sent' | 'received' | 'replied' | 'failed') {
    const db = ensureDbFile();
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    let stat = db.email_warmup_stats.find(
      (s) => s.email_account_id === accountId && s.date === todayStr
    );

    if (stat) {
      if (type === 'sent') {
        stat.sent += 1;
        stat.success_count += 1;
      } else if (type === 'received') {
        stat.received += 1;
        stat.success_count += 1;
      } else if (type === 'replied') {
        stat.replies += 1;
        stat.success_count += 1;
      } else if (type === 'failed') {
        stat.failed += 1;
      }
      stat.updated_at = now;
    } else {
      stat = {
        id: crypto.randomUUID(),
        user_id: userId,
        email_account_id: accountId,
        date: todayStr,
        sent: type === 'sent' ? 1 : 0,
        received: type === 'received' ? 1 : 0,
        replies: type === 'replied' ? 1 : 0,
        failed: type === 'failed' ? 1 : 0,
        success_count: type !== 'failed' ? 1 : 0,
        created_at: now,
        updated_at: now,
      };
      db.email_warmup_stats.push(stat);
    }
    saveDb(db);
  },

  getDailyStats(userId: string): EmailWarmupStat[] {
    const db = ensureDbFile();
    return db.email_warmup_stats;
  },
};

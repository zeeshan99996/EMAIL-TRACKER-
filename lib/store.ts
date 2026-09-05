import fs from 'fs';
import path from 'path';
import os from 'os';
import { Email, EmailEvent, EmailLink, ApiKey, Project } from './types';

export interface LocalDbSchema {
  projects: Project[];
  apiKeys: ApiKey[];
  emails: Email[];
  emailLinks: EmailLink[];
  emailEvents: EmailEvent[];
}

export const DEFAULT_PROJECT: Project = {
  id: 'prj_demo_01',
  account_id: 'acc_demo_01',
  name: 'ERHA Technologies Outreach',
  description: 'Primary outbound sales and marketing emails',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEFAULT_API_KEYS: ApiKey[] = [
  {
    id: 'key_demo_01',
    project_id: DEFAULT_PROJECT.id,
    name: 'Apps Script Outbound Key',
    key_hash: '5af62ee581a710f47f714347ef0cc6ca1c6700008feba75991506fbdea07a123', // SHA256 of ek_live_demo123456789
    key_prefix: 'ek_live_demo1...',
    last_used_at: null,
    created_at: new Date().toISOString(),
    revoked_at: null,
  },
];

// File storage path (serverless-safe)
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? path.join(os.tmpdir(), 'email-tracker-data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'local-db.json');

// In-memory cache to guarantee ultra-fast reads & writes
let memoryCache: LocalDbSchema | null = null;

function initDb(): LocalDbSchema {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryCache = {
        projects: parsed.projects && parsed.projects.length > 0 ? parsed.projects : [DEFAULT_PROJECT],
        apiKeys: parsed.apiKeys && parsed.apiKeys.length > 0 ? parsed.apiKeys : [...DEFAULT_API_KEYS],
        emails: parsed.emails || [],
        emailLinks: parsed.emailLinks || [],
        emailEvents: parsed.emailEvents || [],
      };
      return memoryCache;
    }
  } catch (err) {
    console.warn('Failed to read local-db.json, re-initializing store:', err);
  }

  memoryCache = {
    projects: [DEFAULT_PROJECT],
    apiKeys: [...DEFAULT_API_KEYS],
    emails: [],
    emailLinks: [],
    emailEvents: [],
  };

  persistToDisk(memoryCache);
  return memoryCache;
}

function persistToDisk(data: LocalDbSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Warning: Could not write to local-db.json (running in memory-only environment):', err);
  }
}

export function getDb(): LocalDbSchema {
  return initDb();
}

export function saveDb(modifier: (db: LocalDbSchema) => void): LocalDbSchema {
  const db = initDb();
  modifier(db);
  persistToDisk(db);
  return db;
}

// Emails
export function getStoreEmails(projectId?: string): Email[] {
  const db = initDb();
  if (projectId && projectId !== 'all') {
    return db.emails.filter(e => e.project_id === projectId);
  }
  return db.emails;
}

export function getStoreEmailById(id: string): Email | undefined {
  const db = initDb();
  return db.emails.find(e => e.id === id || e.tracking_id === id);
}

export function addStoreEmail(email: Email): void {
  saveDb(db => {
    db.emails.unshift(email);
  });
}

export function updateStoreEmail(id: string, updates: Partial<Email>): Email | null {
  let updated: Email | null = null;
  saveDb(db => {
    const idx = db.emails.findIndex(e => e.id === id || e.tracking_id === id);
    if (idx !== -1) {
      db.emails[idx] = { ...db.emails[idx], ...updates, updated_at: new Date().toISOString() };
      updated = db.emails[idx];
    }
  });
  return updated;
}

export function deleteStoreEmail(id: string): boolean {
  let deleted = false;
  saveDb(db => {
    const idx = db.emails.findIndex(e => e.id === id || e.tracking_id === id);
    if (idx !== -1) {
      const emailId = db.emails[idx].id;
      db.emails.splice(idx, 1);
      db.emailLinks = db.emailLinks.filter(l => l.email_id !== emailId);
      db.emailEvents = db.emailEvents.filter(ev => ev.email_id !== emailId);
      deleted = true;
    }
  });
  return deleted;
}


// Links
export function addStoreEmailLinks(links: EmailLink[]): void {
  saveDb(db => {
    db.emailLinks.push(...links);
  });
}

export function getStoreEmailLinks(emailId: string): EmailLink[] {
  const db = initDb();
  return db.emailLinks.filter(l => l.email_id === emailId);
}

export function updateStoreEmailLink(id: string, updates: Partial<EmailLink>): EmailLink | null {
  let updated: EmailLink | null = null;
  saveDb(db => {
    const idx = db.emailLinks.findIndex(l => l.id === id);
    if (idx !== -1) {
      db.emailLinks[idx] = { ...db.emailLinks[idx], ...updates };
      updated = db.emailLinks[idx];
    }
  });
  return updated;
}

// Events
export function addStoreEmailEvent(event: EmailEvent): void {
  saveDb(db => {
    db.emailEvents.unshift(event);
  });
}

export function getStoreEmailEvents(emailId?: string): EmailEvent[] {
  const db = initDb();
  if (emailId) {
    return db.emailEvents.filter(e => e.email_id === emailId);
  }
  return db.emailEvents;
}

// API Keys
export function getStoreApiKeys(projectId?: string): ApiKey[] {
  const db = initDb();
  if (projectId) {
    return db.apiKeys.filter(k => k.project_id === projectId);
  }
  return db.apiKeys;
}

export function addStoreApiKey(key: ApiKey): void {
  saveDb(db => {
    db.apiKeys.unshift(key);
  });
}

export function revokeStoreApiKey(keyId: string): boolean {
  let success = false;
  saveDb(db => {
    const key = db.apiKeys.find(k => k.id === keyId);
    if (key) {
      key.revoked_at = new Date().toISOString();
      success = true;
    }
  });
  return success;
}

// Projects
export function getStoreProjects(): Project[] {
  const db = initDb();
  return db.projects;
}

export function addStoreProject(project: Project): void {
  saveDb(db => {
    db.projects.push(project);
  });
}

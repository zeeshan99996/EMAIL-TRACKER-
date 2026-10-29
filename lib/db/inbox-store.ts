import fs from 'fs';
import path from 'path';
import os from 'os';

export interface InboxThread {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail?: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  unread: boolean;
  leadCompany?: string;
  tags?: string[];
  isBounce?: boolean;
  bouncedRecipient?: string;
  bounceReason?: string;
}

let cachedInbox: InboxThread[] | null = null;
let resolvedInboxFile: string | null = null;

function getInboxFilePath(): string {
  if (resolvedInboxFile) return resolvedInboxFile;

  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), 'email-tracker-data');
    const tmpFile = path.join(tmpDir, 'inbox_store.json');
    const seedFile = path.join(process.cwd(), 'data', 'inbox_store.json');

    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      if (!fs.existsSync(tmpFile) && fs.existsSync(seedFile)) {
        fs.copyFileSync(seedFile, tmpFile);
      }
    } catch (err) {
      console.warn('[InboxStore] Serverless prep warning:', err);
    }

    resolvedInboxFile = tmpFile;
    return resolvedInboxFile;
  }

  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'inbox_store.json');

  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
  } catch {}

  resolvedInboxFile = localFile;
  return resolvedInboxFile;
}

export function loadInboxMessages(): InboxThread[] {
  if (cachedInbox) {
    return cachedInbox;
  }

  const filePath = getInboxFilePath();
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedInbox = parsed;
        return cachedInbox;
      }
    } catch (err) {
      console.warn('[InboxStore] Error reading inbox_store.json:', err);
    }
  }

  cachedInbox = [];
  return cachedInbox;
}

export function saveInboxMessages(threads: InboxThread[]): void {
  cachedInbox = threads;
  const filePath = getInboxFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(threads, null, 2), 'utf8');
  } catch (err) {
    console.warn('[InboxStore] Error saving inbox_store.json:', err);
  }
}

export const inboxStore = {
  getMessages(): InboxThread[] {
    return loadInboxMessages();
  },

  addMessages(newMessages: InboxThread[]): { addedCount: number; totalCount: number } {
    const existing = loadInboxMessages();
    const existingIds = new Set(existing.map((m) => m.id));
    const existingFingerprints = new Set(
      existing.map((m) => `${m.senderEmail.toLowerCase()}_${m.subject.trim()}`)
    );

    let addedCount = 0;
    const toPrepend: InboxThread[] = [];

    for (const msg of newMessages) {
      const fingerprint = `${msg.senderEmail.toLowerCase()}_${msg.subject.trim()}`;
      if (!existingIds.has(msg.id) && !existingFingerprints.has(fingerprint)) {
        toPrepend.push(msg);
        existingIds.add(msg.id);
        existingFingerprints.add(fingerprint);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      const updated = [...toPrepend, ...existing];
      saveInboxMessages(updated);
      return { addedCount, totalCount: updated.length };
    }

    return { addedCount: 0, totalCount: existing.length };
  },

  markRead(messageId: string): boolean {
    const existing = loadInboxMessages();
    const target = existing.find((m) => m.id === messageId);
    if (target) {
      target.unread = false;
      saveInboxMessages(existing);
      return true;
    }
    return false;
  },

  markUnread(messageId: string): boolean {
    const existing = loadInboxMessages();
    const target = existing.find((m) => m.id === messageId);
    if (target) {
      target.unread = true;
      saveInboxMessages(existing);
      return true;
    }
    return false;
  },

  archive(messageId: string): boolean {
    const existing = loadInboxMessages();
    const filtered = existing.filter((m) => m.id !== messageId);
    if (filtered.length !== existing.length) {
      saveInboxMessages(filtered);
      return true;
    }
    return false;
  },

  clearAll(): void {
    saveInboxMessages([]);
  },
};

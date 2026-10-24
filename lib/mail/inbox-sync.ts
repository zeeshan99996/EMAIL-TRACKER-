import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { localDb } from '@/lib/db/store';
import { decryptToken } from '@/lib/crypto/encryption';
import { inboxStore, InboxThread } from '@/lib/db/inbox-store';
import { EmailAccount } from '@/lib/warmup/types';

export interface SyncResult {
  success: boolean;
  syncedAccounts: number;
  newMessages: number;
  totalMessages: number;
  threads: InboxThread[];
  errors: string[];
}

function detectLeadTags(subject: string, body: string): string[] {
  const content = `${subject} ${body}`.toLowerCase();
  const tags: string[] = [];

  if (
    content.includes('call') ||
    content.includes('schedule') ||
    content.includes('meet') ||
    content.includes('calendar') ||
    content.includes('zoom') ||
    content.includes('demo')
  ) {
    tags.push('Meeting Request');
  }

  if (
    content.includes('interested') ||
    content.includes('pricing') ||
    content.includes('cost') ||
    content.includes('quote') ||
    content.includes('proposal') ||
    content.includes('more info') ||
    content.includes('sounds good') ||
    content.includes('yes') ||
    content.includes('sure')
  ) {
    tags.push('Warm Lead');
  }

  if (
    content.includes('unsubscribe') ||
    content.includes('remove me') ||
    content.includes('stop emailing') ||
    content.includes('not interested')
  ) {
    tags.push('Cold / Unsubscribe');
  }

  if (tags.length === 0) {
    tags.push('Prospect Reply');
  }

  return Array.from(new Set(tags));
}

export async function syncSingleAccountImap(account: EmailAccount, limit = 25): Promise<InboxThread[]> {
  const email = (account.email || '').trim();
  const rawToken = account.access_token || '';
  const decryptedPass = decryptToken(rawToken).trim();

  if (!email || !decryptedPass) {
    return [];
  }

  // Determine IMAP host and port
  let host = 'imap.gmail.com';
  let port = 993;
  let secure = true;

  if (account.metadata?.imap_host) {
    host = account.metadata.imap_host;
    port = Number(account.metadata.imap_port) || 993;
    secure = account.metadata.imap_security !== 'starttls' && account.metadata.imap_security !== 'none';
  } else if (!email.endsWith('@gmail.com') && !email.includes('@googlemail.com')) {
    // Try hostinger or common providers if indicated
    if (account.provider === 'hostinger') {
      host = 'imap.hostinger.com';
    } else if (account.provider === 'titan') {
      host = 'imap.titan.email';
    } else if (account.provider === 'godaddy') {
      host = 'imap.secureserver.net';
    } else if (account.provider === 'office365') {
      host = 'outlook.office365.com';
    }
  }

  const isGmailAppPass = host.includes('gmail.com') && decryptedPass.replace(/\s+/g, '').length === 16;
  const cleanPassword = isGmailAppPass ? decryptedPass.replace(/\s+/g, '') : decryptedPass;

  const client = new ImapFlow({
    host,
    port,
    secure,
    auth: {
      user: email,
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    logger: false,
    emitLogs: false,
  });

  client.on('error', () => {});

  const newThreads: InboxThread[] = [];

  try {
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('IMAP connection timed out')), 9000)
    );
    await Promise.race([connectPromise, timeoutPromise]);

    const lock = await client.getMailboxLock('INBOX');
    try {
      const mailbox = client.mailbox;
      const totalMessages = typeof mailbox === 'object' && mailbox ? (mailbox as any).exists || 0 : 0;

      if (totalMessages > 0) {
        const startSeq = Math.max(1, totalMessages - limit);
        for await (const msg of client.fetch(`${startSeq}:*`, {
          envelope: true,
          source: true,
          flags: true,
        })) {
          if (msg.source) {
            try {
              const parsed = await simpleParser(msg.source);
              const senderAddress =
                parsed.from?.value?.[0]?.address || parsed.from?.text || '';
              const senderName =
                parsed.from?.value?.[0]?.name ||
                senderAddress.split('@')[0] ||
                'Prospect';

              // Skip messages sent by the user themselves
              if (senderAddress.toLowerCase() === email.toLowerCase()) {
                continue;
              }

              const cleanBody = (parsed.text || parsed.html || '').trim();
              const preview = cleanBody
                .replace(/<[^>]*>?/gm, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 140);

              const isUnread = !msg.flags || !msg.flags.has('\\Seen');
              const subject = parsed.subject || '(No Subject)';

              newThreads.push({
                id: parsed.messageId || `imap_${msg.uid}_${Date.now()}`,
                senderName,
                senderEmail: senderAddress,
                recipientEmail: email,
                subject,
                preview: preview || 'New response received from recipient',
                body: cleanBody || preview,
                receivedAt: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
                unread: isUnread,
                tags: detectLeadTags(subject, cleanBody),
              });
            } catch {
              // Ignore single parsing error
            }
          }
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err: any) {
    try {
      await client.close();
    } catch {}
    console.warn(`[InboxSync] IMAP sync error for ${email}:`, err.message);
    throw err;
  }

  return newThreads;
}

export async function syncSheetReplies(sheetWebhookUrl: string): Promise<InboxThread[]> {
  if (!sheetWebhookUrl || !sheetWebhookUrl.startsWith('http')) return [];

  try {
    const url = new URL(sheetWebhookUrl);
    url.searchParams.set('action', 'getReplies');

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(6000),
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (data && data.success && Array.isArray(data.replies)) {
      return data.replies.map((r: any) => ({
        id: r.id || `sheet_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        senderName: r.senderName || 'Prospect',
        senderEmail: r.senderEmail || '',
        subject: r.subject || 'Follow up inquiry',
        preview: (r.preview || r.body || '').slice(0, 140),
        body: r.body || r.preview || '',
        receivedAt: r.receivedAt || new Date().toISOString(),
        unread: r.unread !== false,
        tags: detectLeadTags(r.subject || '', r.body || ''),
      }));
    }
  } catch (err: any) {
    console.warn('[InboxSync] Sheet replies sync notice:', err.message);
  }

  return [];
}

export async function runFullInboxSync(options?: {
  sheetWebhookUrl?: string;
  userId?: string;
}): Promise<SyncResult> {
  const accounts = localDb.getAccounts(options?.userId);
  const errors: string[] = [];
  let newMessagesCount = 0;
  let syncedAccountsCount = 0;

  // 1. Sync all registered email accounts via IMAP
  for (const acc of accounts) {
    try {
      const msgs = await syncSingleAccountImap(acc);
      syncedAccountsCount++;
      if (msgs.length > 0) {
        const { addedCount } = inboxStore.addMessages(msgs);
        newMessagesCount += addedCount;
      }
    } catch (err: any) {
      errors.push(`${acc.email}: ${err.message}`);
    }
  }

  // 2. Sync Google Sheet Webhook if available
  if (options?.sheetWebhookUrl) {
    try {
      const sheetMsgs = await syncSheetReplies(options.sheetWebhookUrl);
      if (sheetMsgs.length > 0) {
        const { addedCount } = inboxStore.addMessages(sheetMsgs);
        newMessagesCount += addedCount;
      }
    } catch (err: any) {
      errors.push(`Google Sheet Webhook: ${err.message}`);
    }
  }

  const allMessages = inboxStore.getMessages();

  return {
    success: errors.length === 0 || allMessages.length > 0,
    syncedAccounts: syncedAccountsCount,
    newMessages: newMessagesCount,
    totalMessages: allMessages.length,
    threads: allMessages,
    errors,
  };
}

import { decryptToken } from '@/lib/crypto/encryption';
import { localDb } from '@/lib/db/store';
import { targetedLocalDb } from '@/lib/db/targeted_store';
import { getAuthenticatedClientForAccount } from '@/lib/google/oauth';
import { google } from 'googleapis';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

interface RescueResult {
  accountId: string;
  email: string;
  rescuedCount: number;
  markedImportantCount: number;
}

const COMMON_SPAM_FOLDERS = [
  '[Gmail]/Spam',
  'Spam',
  'Junk',
  'Junk E-mail',
  'Junk Email',
  'INBOX.Spam',
  'INBOX.Junk',
];

/**
 * Rescues spam emails for Gmail OAuth accounts using Gmail API
 */
async function rescueGmailOAuthAccount(accountId: string, fleetEmails: string[]): Promise<RescueResult> {
  let rescuedCount = 0;
  let markedImportantCount = 0;

  try {
    const { oauth2Client, account } = await getAuthenticatedClientForAccount(accountId);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 1. Search for messages in SPAM folder
    const spamRes = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:spam',
      maxResults: 20,
    });

    const spamMessages = spamRes.data.messages || [];

    for (const msg of spamMessages) {
      if (!msg.id) continue;

      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject'],
      });

      const headers = detail.data.payload?.headers || [];
      const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
      const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || 'Warmup Message';

      // Check if fromHeader matches any of our fleet emails
      const isFromFleet = fleetEmails.some(fleetEmail => fromHeader.toLowerCase().includes(fleetEmail.toLowerCase()));

      if (isFromFleet) {
        // Move from SPAM to INBOX, Mark as Read, Important, and Starred!
        await gmail.users.messages.modify({
          userId: 'me',
          id: msg.id,
          requestBody: {
            removeLabelIds: ['SPAM', 'UNREAD'],
            addLabelIds: ['INBOX', 'IMPORTANT', 'STARRED'],
          },
        });
        rescuedCount++;

        // Log rescue event
        localDb.insertEvent({
          user_id: account.user_id,
          source_account_id: accountId,
          target_account_id: accountId,
          event_type: 'job_completed',
          status: 'success',
          metadata: {
            action: 'spam_rescued',
            sender: fromHeader,
            subject,
            details: 'Automatically pulled from SPAM, moved to INBOX, marked Important and Starred.',
          },
        });
      }
    }

    // 2. Also check INBOX to mark fleet emails as Important & Read
    const inboxRes = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:inbox is:unread',
      maxResults: 10,
    });

    for (const msg of inboxRes.data.messages || []) {
      if (!msg.id) continue;
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['From'],
      });
      const headers = detail.data.payload?.headers || [];
      const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
      if (fleetEmails.some(e => fromHeader.toLowerCase().includes(e.toLowerCase()))) {
        await gmail.users.messages.modify({
          userId: 'me',
          id: msg.id,
          requestBody: {
            removeLabelIds: ['UNREAD'],
            addLabelIds: ['IMPORTANT', 'STARRED'],
          },
        });
        markedImportantCount++;
      }
    }

    return {
      accountId,
      email: account.email,
      rescuedCount,
      markedImportantCount,
    };
  } catch (err: any) {
    console.error(`[Spam Rescue] OAuth error for account ${accountId}:`, err.message);
    return { accountId, email: '', rescuedCount: 0, markedImportantCount: 0 };
  }
}

/**
 * Rescues spam emails for IMAP / App Password / Custom SMTP accounts
 */
async function rescueImapAccount(account: any, fleetEmails: string[]): Promise<RescueResult> {
  let rescuedCount = 0;
  let markedImportantCount = 0;

  try {
    const appPassword = decryptToken(account.access_token).replace(/\s+/g, '');
    let host = 'imap.gmail.com';
    let port = 993;
    let secure = true;

    if (account.provider === 'custom_smtp' && account.metadata) {
      host = account.metadata.imapHost || 'imap.hostinger.com';
      port = Number(account.metadata.imapPort) || 993;
      secure = account.metadata.imapSecurity !== 'starttls';
    }

    const client = new ImapFlow({
      host,
      port,
      secure,
      auth: {
        user: account.email,
        pass: appPassword,
      },
      logger: false,
      emitLogs: false,
    });

    client.on('error', (err) => {
      // Suppress unhandled socket errors from crashing process
    });

    try {
      // 5-second connect timeout
      const connectPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('IMAP connection timed out')), 6000)
      );
      await Promise.race([connectPromise, timeoutPromise]);

      // 1. Find the spam folder dynamically across all providers
      const mailboxes = await client.list();
      const spamMailbox = mailboxes.find(mb => 
        mb.specialUse === '\\Spam' ||
        mb.path.toLowerCase().includes('spam') ||
        mb.path.toLowerCase().includes('junk') ||
        mb.name.toLowerCase().includes('spam') ||
        mb.name.toLowerCase().includes('junk')
      );

      if (spamMailbox) {
        try {
          const lock = await client.getMailboxLock(spamMailbox.path);
          try {
            const total = client.mailbox && typeof client.mailbox === 'object' ? (client.mailbox as any).exists || 0 : 0;
            if (total > 0) {
              const startSeq = Math.max(1, total - 50);
              const uidsToRescue: { uid: number; sender: string; subject: string }[] = [];

              for await (const msg of client.fetch(`${startSeq}:*`, { envelope: true, source: true, uid: true })) {
                if (msg.source && msg.uid) {
                  const parsed = await simpleParser(msg.source);
                  const fromText = (parsed.from?.text || '').toLowerCase();
                  const isFromFleet = fleetEmails.some(e => fromText.includes(e.toLowerCase()));

                  if (isFromFleet) {
                    uidsToRescue.push({
                      uid: msg.uid,
                      sender: parsed.from?.text || fromText,
                      subject: parsed.subject || 'Warmup Message',
                    });
                  }
                }
              }

              for (const item of uidsToRescue) {
                try {
                  await client.messageMove(String(item.uid), 'INBOX', { uid: true });
                  rescuedCount++;
                } catch {
                  try {
                    await client.messageCopy(String(item.uid), 'INBOX', { uid: true });
                    await client.messageDelete(String(item.uid), { uid: true });
                    rescuedCount++;
                  } catch {
                    // ignore
                  }
                }

                // Log event
                localDb.insertEvent({
                  user_id: account.user_id,
                  source_account_id: account.id,
                  target_account_id: account.id,
                  event_type: 'job_completed',
                  status: 'success',
                  metadata: {
                    action: 'spam_rescued',
                    sender: item.sender,
                    subject: item.subject,
                    details: 'Moved from Spam/Junk to INBOX and marked Read/Important.',
                  },
                });
              }
            }
          } finally {
            lock.release();
          }
        } catch (err: any) {
          console.error(`[Spam Rescue] Lock error on ${spamMailbox.path}:`, err.message);
        }
      }

      // 2. Open INBOX and mark warmup messages as Seen & Flagged
      try {
        const inboxLock = await client.getMailboxLock('INBOX');
        try {
          const total = client.mailbox && typeof client.mailbox === 'object' ? (client.mailbox as any).exists || 0 : 0;
          if (total > 0) {
            const startSeq = Math.max(1, total - 25);
            const uidsToMark: number[] = [];

            for await (const msg of client.fetch(`${startSeq}:*`, { envelope: true, source: true, uid: true })) {
              if (msg.source && msg.uid) {
                const parsed = await simpleParser(msg.source);
                const fromText = (parsed.from?.text || '').toLowerCase();
                if (fleetEmails.some(e => fromText.includes(e.toLowerCase()))) {
                  uidsToMark.push(msg.uid);
                }
              }
            }

            for (const uid of uidsToMark) {
              try {
                await client.messageFlagsAdd(String(uid), ['\\Seen', '\\Flagged'], { uid: true });
                markedImportantCount++;
              } catch {
                // ignore
              }
            }
          }
        } finally {
          inboxLock.release();
        }
      } catch {
        // ignore
      }
    } finally {
      try {
        await client.logout();
      } catch {
        try {
          await client.close();
        } catch {}
      }
    }

    return {
      accountId: account.id,
      email: account.email,
      rescuedCount,
      markedImportantCount,
    };
  } catch (err: any) {
    console.error(`[Spam Rescue] IMAP error for ${account.email}:`, err.message);
    return { accountId: account.id, email: account.email, rescuedCount: 0, markedImportantCount: 0 };
  }
}

let isSpamRescueRunning = false;

/**
 * Executes Spam Rescue & Deliverability Enhancement for all accounts of a user
 */
export async function runSpamRescueForUser(userId: string): Promise<RescueResult[]> {
  if (isSpamRescueRunning) {
    return [];
  }

  isSpamRescueRunning = true;
  try {
    const accounts = localDb.getAccounts(userId).filter(a => a.status === 'connected');
    if (accounts.length === 0) return [];

    const fleetEmails = accounts.map(a => a.email);
    const results: RescueResult[] = [];

    for (const account of accounts) {
      try {
        if (account.provider === 'gmail') {
          const res = await rescueGmailOAuthAccount(account.id, fleetEmails);
          results.push(res);
        } else {
          const res = await rescueImapAccount(account, fleetEmails);
          results.push(res);
        }
      } catch (err: any) {
        console.error(`[Spam Rescue] Failed for ${account.email}:`, err.message);
      }
      // Small delay between accounts to prevent IMAP connection limits
      await new Promise(r => setTimeout(r, 600));
    }

    return results;
  } finally {
    isSpamRescueRunning = false;
  }
}

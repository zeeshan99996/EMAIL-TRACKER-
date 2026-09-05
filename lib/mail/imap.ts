import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

export interface ImapConfig {
  host?: string;
  port?: number;
  secure?: boolean;
}

export async function fetchImapThreadMessages({
  email,
  appPassword,
  searchSubject,
  peerEmail,
  config,
}: {
  email: string;
  appPassword: string;
  searchSubject?: string;
  peerEmail?: string;
  config?: ImapConfig;
}): Promise<{ id: string; threadId: string; subject: string; from: string; to: string; date: string; body: string }[]> {
  const trimmed = (appPassword || '').trim();
  const isGmailAppPass = (!config?.host || config.host.includes('gmail.com')) && trimmed.replace(/\s+/g, '').length === 16;
  const cleanPassword = isGmailAppPass ? trimmed.replace(/\s+/g, '') : trimmed;

  const client = new ImapFlow({
    host: config?.host || 'imap.gmail.com',
    port: config?.port || 993,
    secure: config?.secure !== undefined ? config.secure : true,
    auth: {
      user: email.trim(),
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

  const messages: { id: string; threadId: string; subject: string; from: string; to: string; date: string; body: string }[] = [];

  try {
    // 8-second connection timeout
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('IMAP connection timed out')), 8000)
    );
    await Promise.race([connectPromise, timeoutPromise]);

    const lock = await client.getMailboxLock('INBOX');
    try {
      const mailbox = client.mailbox;
      const totalMessages = typeof mailbox === 'object' && mailbox ? (mailbox as any).exists || 10 : 10;
      const startSeq = Math.max(1, totalMessages - 3);

      for await (const msg of client.fetch(`${startSeq}:*`, { envelope: true, source: true })) {
        if (msg.source) {
          try {
            const parsed = await simpleParser(msg.source);
            messages.push({
              id: parsed.messageId || `${msg.uid}`,
              threadId: parsed.messageId || `${msg.uid}`,
              subject: parsed.subject || 'Project Update',
              from: parsed.from?.text || peerEmail || '',
              to: email,
              date: parsed.date?.toISOString() || new Date().toISOString(),
              body: parsed.text || parsed.html || '',
            });
          } catch {
            // ignore parse error
          }
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err: any) {
    // Non-blocking fallback
    try {
      await client.close();
    } catch {
      // ignore
    }
  }

  return messages;
}

/**
 * Validates that the provided email and password can connect to IMAP
 */
export async function verifyImapCredentials(email: string, appPassword: string, config?: ImapConfig): Promise<boolean> {
  const trimmed = (appPassword || '').trim();
  const isGmailAppPass = (!config?.host || config.host.includes('gmail.com')) && trimmed.replace(/\s+/g, '').length === 16;
  const cleanPassword = isGmailAppPass ? trimmed.replace(/\s+/g, '') : trimmed;

  const client = new ImapFlow({
    host: config?.host || 'imap.gmail.com',
    port: config?.port || 993,
    secure: config?.secure !== undefined ? config.secure : true,
    auth: {
      user: email.trim(),
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    logger: false,
    emitLogs: false,
  });

  client.on('error', () => {
    // Suppress unhandled socket errors
  });

  try {
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('IMAP connection timed out after 10 seconds')), 10000)
    );
    await Promise.race([connectPromise, timeoutPromise]);
    await client.logout();
    return true;
  } catch (err: any) {
    const isAuth =
      err.authenticationFailed ||
      err.responseStatus === 'NO' ||
      /auth|credential|password|login/i.test(err.message || '');

    if (isAuth) {
      const isHostinger = config?.host?.includes('hostinger');
      const authMessage = isHostinger
        ? `Hostinger IMAP Authentication Failed: Invalid email or password for ${email}. Please ensure you enter your Hostinger Email Account password (the one used at https://mail.hostinger.com), NOT your hPanel account password.`
        : `IMAP Authentication failed: Invalid email or password for ${email}.`;
      const enhancedErr = new Error(authMessage);
      (enhancedErr as any).code = 'EAUTH';
      throw enhancedErr;
    }
    throw err;
  } finally {
    try {
      await client.close();
    } catch {
      // ignore
    }
  }
}

/**
 * Automatically cleans up / deletes completed warmup messages from INBOX and Sent for an IMAP account
 */
export async function deleteImapWarmupMessages({
  email,
  appPassword,
  fleetEmails,
  config,
}: {
  email: string;
  appPassword: string;
  fleetEmails: string[];
  config?: ImapConfig;
}): Promise<number> {
  const trimmed = (appPassword || '').trim();
  const isGmailAppPass = (!config?.host || config.host.includes('gmail.com')) && trimmed.replace(/\s+/g, '').length === 16;
  const cleanPassword = isGmailAppPass ? trimmed.replace(/\s+/g, '') : trimmed;

  const client = new ImapFlow({
    host: config?.host || 'imap.gmail.com',
    port: config?.port || 993,
    secure: config?.secure !== undefined ? config.secure : true,
    auth: {
      user: email.trim(),
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

  let deletedCount = 0;

  try {
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('IMAP connection timed out')), 5000)
    );
    await Promise.race([connectPromise, timeoutPromise]);

    const targetMailboxes = ['INBOX', '[Gmail]/Sent Mail', 'Sent', 'Sent Messages', 'INBOX.Sent'];
    const mailboxes = await client.list();

    for (const mb of mailboxes) {
      const isTarget = targetMailboxes.some(t => t.toLowerCase() === mb.path.toLowerCase() || t.toLowerCase() === mb.name.toLowerCase());
      if (!isTarget) continue;

      try {
        const lock = await client.getMailboxLock(mb.path);
        try {
          const total = client.mailbox && typeof client.mailbox === 'object' ? (client.mailbox as any).exists || 0 : 0;
          if (total > 0) {
            const startSeq = Math.max(1, total - 25);
            for await (const msg of client.fetch(`${startSeq}:*`, { envelope: true, source: true })) {
              if (msg.source) {
                const parsed = await simpleParser(msg.source);
                const fromText = (parsed.from?.text || '').toLowerCase();
                const toText = (Array.isArray(parsed.to) ? parsed.to.map(t => t.text).join(' ') : (parsed.to?.text || '')).toLowerCase();

                // Check if either sender or receiver is part of our warmup fleet
                const isWarmup = fleetEmails.some(f => fromText.includes(f.toLowerCase()) || toText.includes(f.toLowerCase()));

                if (isWarmup && msg.uid) {
                  await client.messageDelete(String(msg.uid), { uid: true });
                  deletedCount++;
                }
              }
            }
          }
        } finally {
          lock.release();
        }
      } catch {
        // ignore mailbox lock error
      }
    }

    await client.logout();
  } catch (err: any) {
    try {
      await client.close();
    } catch {}
  }

  return deletedCount;
}

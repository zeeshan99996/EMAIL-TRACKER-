import { google } from 'googleapis';
import { getAuthenticatedClientForAccount } from './oauth';

export interface SendEmailParams {
  fromAccountId: string;
  toEmail: string;
  subject: string;
  body: string;
  inReplyTo?: string | null;
  references?: string | null;
  threadId?: string | null;
}

export interface ThreadMessageSummary {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  bodyText: string;
  date: string;
}

/**
 * Encodes a string to base64url format for Gmail API
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Builds standard RFC 2822 compliant MIME email
 */
function buildMimeMessage({
  from,
  to,
  subject,
  body,
  inReplyTo,
  references,
}: {
  from: string;
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string | null;
  references?: string | null;
}): string {
  const lines: string[] = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
  ];

  if (inReplyTo) {
    lines.push(`In-Reply-To: <${inReplyTo}>`);
  }
  if (references) {
    lines.push(`References: <${references}>`);
  }

  lines.push('', body);
  return lines.join('\r\n');
}

/**
 * Sends an email via Gmail API
 */
export async function sendEmail({
  fromAccountId,
  toEmail,
  subject,
  body,
  inReplyTo,
  references,
  threadId,
}: SendEmailParams): Promise<{ messageId: string; threadId: string }> {
  const { oauth2Client, account } = await getAuthenticatedClientForAccount(fromAccountId);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const rawMime = buildMimeMessage({
    from: account.email,
    to: toEmail,
    subject,
    body,
    inReplyTo,
    references,
  });

  const raw = base64UrlEncode(rawMime);

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw,
      threadId: threadId || undefined,
    },
  });

  const sentMessageId = res.data.id || '';
  const sentThreadId = res.data.threadId || sentMessageId;

  return {
    messageId: sentMessageId,
    threadId: sentThreadId,
  };
}

/**
 * Extracts plain text body from a Gmail message payload
 */
function extractBodyText(payload: any): string {
  if (!payload) return '';

  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf8');
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf8');
      }
      if (part.parts) {
        const nested = extractBodyText(part);
        if (nested) return nested;
      }
    }
  }

  return '';
}

/**
 * Retrieves all messages in a thread and parses their contents
 */
export async function fetchThreadMessages({
  accountId,
  threadId,
}: {
  accountId: string;
  threadId: string;
}): Promise<ThreadMessageSummary[]> {
  const { oauth2Client } = await getAuthenticatedClientForAccount(accountId);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const res = await gmail.users.threads.get({
    userId: 'me',
    id: threadId,
    format: 'full',
  });

  const messages = res.data.messages || [];
  const results: ThreadMessageSummary[] = [];

  for (const msg of messages) {
    const headers = msg.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    results.push({
      id: msg.id || '',
      threadId: msg.threadId || threadId,
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      snippet: msg.snippet || '',
      bodyText: extractBodyText(msg.payload),
      date: getHeader('Date'),
    });
  }

  return results;
}

/**
 * Trashes a warmup thread to keep inbox clean
 */
export async function trashThread({
  accountId,
  threadId,
}: {
  accountId: string;
  threadId: string;
}): Promise<boolean> {
  try {
    const { oauth2Client } = await getAuthenticatedClientForAccount(accountId);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    await gmail.users.threads.trash({
      userId: 'me',
      id: threadId,
    });
    return true;
  } catch (err: any) {
    console.error(`[Gmail] Failed to trash thread ${threadId}:`, err.message);
    return false;
  }
}

/**
 * Trashes a specific warmup message
 */
export async function trashMessage({
  accountId,
  messageId,
}: {
  accountId: string;
  messageId: string;
}): Promise<boolean> {
  try {
    const { oauth2Client } = await getAuthenticatedClientForAccount(accountId);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    await gmail.users.messages.trash({
      userId: 'me',
      id: messageId,
    });
    return true;
  } catch (err: any) {
    console.error(`[Gmail] Failed to trash message ${messageId}:`, err.message);
    return false;
  }
}

import { decryptToken } from '@/lib/crypto/encryption';
import { localDb } from '@/lib/db/store';
import { fetchThreadMessages as fetchOAuthThreadMessages, sendEmail as sendOAuthEmail, ThreadMessageSummary } from '@/lib/google/gmail';
import { fetchImapThreadMessages } from './imap';
import { sendSmtpEmail } from './smtp';

export type UnifiedEmailMessage = ThreadMessageSummary;

/**
 * Sends an email using either SMTP App Password or Gmail API OAuth
 */
export async function unifiedSendEmail({
  fromAccountId,
  toEmail,
  subject,
  body,
  html,
  inReplyTo,
  references,
  threadId,
}: {
  fromAccountId: string;
  toEmail: string;
  subject: string;
  body: string;
  html?: string;
  inReplyTo?: string;
  references?: string;
  threadId?: string;
}): Promise<{ messageId: string; threadId: string }> {
  const account = localDb.getAccountById(fromAccountId);
  if (!account) {
    throw new Error(`Account not found: ${fromAccountId}`);
  }

  if (account.provider === 'gmail_app_password' || account.provider === 'custom_smtp') {
    const appPassword = decryptToken(account.access_token);
    let config;
    if (account.provider === 'custom_smtp' && account.metadata) {
      config = {
        host: account.metadata.smtpHost,
        port: Number(account.metadata.smtpPort),
        secure: account.metadata.smtpSecurity !== 'starttls',
      };
    }
    const result = await sendSmtpEmail({
      email: account.email,
      appPassword,
      toEmail,
      subject,
      body,
      html,
      inReplyTo,
      references,
      config,
    });
    return {
      messageId: result.messageId,
      threadId: threadId || result.messageId,
    };
  }

  // Otherwise use Google OAuth Gmail API
  return await sendOAuthEmail({
    fromAccountId,
    toEmail,
    subject,
    body,
    inReplyTo,
    references,
    threadId,
  });
}

/**
 * Fetches thread messages using either IMAP or Gmail API OAuth
 */
export async function unifiedFetchThreadMessages({
  accountId,
  threadId,
  peerEmail,
  subject,
}: {
  accountId: string;
  threadId: string;
  peerEmail?: string;
  subject?: string;
}): Promise<UnifiedEmailMessage[]> {
  const account = localDb.getAccountById(accountId);
  if (!account) {
    throw new Error(`Account not found: ${accountId}`);
  }

  if (account.provider === 'gmail_app_password' || account.provider === 'custom_smtp') {
    const appPassword = decryptToken(account.access_token);
    let config;
    if (account.provider === 'custom_smtp' && account.metadata) {
      config = {
        host: account.metadata.imapHost,
        port: Number(account.metadata.imapPort),
        secure: account.metadata.imapSecurity !== 'starttls',
      };
    }
    const messages = await fetchImapThreadMessages({
      email: account.email,
      appPassword,
      searchSubject: subject,
      peerEmail,
      config,
    });

    if (messages.length > 0) {
      return messages.map((m) => ({
        id: m.id,
        threadId: m.threadId,
        subject: m.subject,
        from: m.from,
        to: m.to,
        date: m.date,
        snippet: m.body.slice(0, 100),
        bodyText: m.body,
      }));
    }

    return [
      {
        id: threadId,
        threadId,
        subject: subject || 'Warmup Discussion',
        from: peerEmail || 'peer@gmail.com',
        to: account.email,
        date: new Date().toISOString(),
        snippet: 'Hello, following up on our discussion.',
        bodyText: 'Hello, checking in on the project update and following up regarding our schedule.',
      },
    ];
  }

  // Otherwise use Google OAuth Gmail API
  return await fetchOAuthThreadMessages({
    accountId,
    threadId,
  });
}

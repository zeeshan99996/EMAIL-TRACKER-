import { describe, it, expect } from 'vitest';
import { localDb } from '@/lib/db/store';
import { decryptToken } from '@/lib/crypto/encryption';
import { generateUniqueStarterEmail, generateContextualWarmupReply } from '@/lib/ai/gemini';
import { verifyEmailAddress } from '@/lib/verification/email-verifier';

describe('Gmail Warmup & Verifier Integration', () => {
  it('should load connected email accounts from warmup_store.json', () => {
    const accounts = localDb.getAccounts();
    expect(accounts.length).toBeGreaterThan(0);
    const emails = accounts.map((a) => a.email);
    expect(emails).toContain('boomboom33204@gmail.com');
    expect(emails).toContain('erhatechnologiesai@gmail.com');
    expect(emails).toContain('muhammadzeeshan0477@gmail.com');
  });

  it('should successfully decrypt account access tokens', () => {
    const accounts = localDb.getAccounts();
    const gmailAccount = accounts.find((a) => a.provider === 'gmail_app_password');
    expect(gmailAccount).toBeDefined();

    const decrypted = decryptToken(gmailAccount?.access_token);
    expect(decrypted).toBeTruthy();
    expect(decrypted.length).toBe(16); // Standard 16-character Google App Password
  });

  it('should generate natural starter emails without forbidden warmup words', async () => {
    const email = await generateUniqueStarterEmail({
      senderEmail: 'test1@gmail.com',
      recipientEmail: 'test2@gmail.com',
      rotationIndex: 1,
    });

    expect(email.subject).toBeTruthy();
    expect(email.body).toBeTruthy();

    const lowerSubject = email.subject.toLowerCase();
    const lowerBody = email.body.toLowerCase();

    // Banned words check
    expect(lowerSubject).not.toContain('warmup');
    expect(lowerBody).not.toContain('warmup');
    expect(lowerBody).not.toContain('bot');
    expect(lowerBody).not.toContain('deliverability');
  });

  it('should generate contextual replies without forbidden words', async () => {
    const reply = await generateContextualWarmupReply({
      threadMessages: [
        {
          id: 'msg_1',
          threadId: 't_1',
          subject: 'Quick question about Thursday sync',
          from: 'test1@gmail.com',
          to: 'test2@gmail.com',
          date: new Date().toISOString(),
          snippet: 'Does 2pm work for our catchup?',
          bodyText: 'Hey, checking if Thursday at 2pm works for our catchup?',
        },
      ],
      recipientEmail: 'test2@gmail.com',
      senderEmail: 'test1@gmail.com',
    });

    expect(reply).toBeTruthy();
    const lowerReply = reply.toLowerCase();
    expect(lowerReply).not.toContain('warmup');
    expect(lowerReply).not.toContain('bot');
  });

  it('should reject invalid or disposable emails before warmup dispatch', async () => {
    const disposableCheck = await verifyEmailAddress('fakeuser@mailinator.com');
    expect(disposableCheck.valid).toBe(false);
    expect(disposableCheck.reason.toLowerCase()).toContain('disposable');

    const validCheck = await verifyEmailAddress('muhammadzeeshan0477@gmail.com');
    expect(validCheck.valid).toBe(true);
  });
});

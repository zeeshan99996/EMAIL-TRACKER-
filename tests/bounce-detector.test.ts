import { describe, it, expect } from 'vitest';
import { detectBounceFromMessage } from '@/lib/mail/bounce-detector';

describe('Mailify Pro - Email Bounce & Delivery Failure Detector', () => {
  it('should accurately detect Google Mail Delivery Subsystem 550 5.1.1 Address not found bounces', () => {
    const sender = 'Mail Delivery Subsystem <mailer-daemon@google.com>';
    const subject = 'Address not found';
    const body = `
      Your message wasn't delivered to erhatechnologisai@gmail.com because the address couldn't be found, or is unable to receive mail.

      LEARN MORE: https://support.google.com/mail/?p=NoSuchUser

      The response was:
      550 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's email address for typos or unnecessary spaces. af79cd13be357-940f01beb35sor1678237985a.1 - gsmtp
    `;

    const result = detectBounceFromMessage(sender, subject, body);

    expect(result.isBounce).toBe(true);
    expect(result.failedRecipient).toBe('erhatechnologisai@gmail.com');
    expect(result.statusCode).toBe('550 5.1.1');
    expect(result.bounceReason).toContain('does not exist');
  });

  it('should detect standard RFC DSN postmaster bounce with Final-Recipient', () => {
    const sender = 'postmaster@mail.outlook.com';
    const subject = 'Delivery Status Notification (Failure)';
    const body = `
      Action: failed
      Status: 5.1.1
      Diagnostic-Code: smtp; 550 5.1.1 User unknown
      Final-Recipient: rfc822; invalidlead@outlook.com
    `;

    const result = detectBounceFromMessage(sender, subject, body);

    expect(result.isBounce).toBe(true);
    expect(result.failedRecipient).toBe('invalidlead@outlook.com');
  });

  it('should detect mailbox quota / storage full bounce', () => {
    const sender = 'mailer-daemon@hostinger.com';
    const subject = 'Undelivered Mail Returned to Sender';
    const body = `
      This is an automated response.
      Your email to fullinbox@targetclient.com could not be delivered.
      Error: 552 Mailbox full or storage quota exceeded.
    `;

    const result = detectBounceFromMessage(sender, subject, body);

    expect(result.isBounce).toBe(true);
    expect(result.statusCode).toBe('552');
    expect(result.failedRecipient).toBe('fullinbox@targetclient.com');
  });

  it('should NOT flag legitimate prospect replies as bounces', () => {
    const sender = 'john.doe@acme-corp.com';
    const subject = 'Re: Quick inquiry about your services';
    const body = `
      Hi,
      Thanks for your note. We would love to book a quick 15-minute demo next Monday at 2pm.
      Please send over the Google Meet link.

      Best regards,
      John
    `;

    const result = detectBounceFromMessage(sender, subject, body);

    expect(result.isBounce).toBe(false);
    expect(result.failedRecipient).toBeUndefined();
  });
});

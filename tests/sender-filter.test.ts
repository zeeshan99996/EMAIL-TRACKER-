import { describe, it, expect } from 'vitest';
import { createTrackedEmail, recordOpenEvent, recordClickEvent, getEmailDetails } from '../lib/supabase/admin';
import { registerSenderIp, isSenderIp } from '../lib/security/sender-filter';
import { DEFAULT_PROJECT } from '../lib/store';

describe('Sender Activity Filtering (Self-Open and Self-Click Protection)', () => {
  it('should register and detect sender IP correctly', () => {
    expect(isSenderIp('192.168.1.50')).toBe(false);
    registerSenderIp('192.168.1.50');
    expect(isSenderIp('192.168.1.50')).toBe(true);
    expect(isSenderIp('127.0.0.1')).toBe(true);
  });

  it('should NOT increment click or open counters when sender clicks their own link in sent box (skipRecord=true)', async () => {
    // 1. Create an email
    const req = {
      to: 'client_target@example.com',
      recipientName: 'Real Client',
      subject: 'Important Business Proposal',
      html: '<p>Please see our <a href="https://erhatechnologies.com/proposal">Special Proposal</a></p>',
    };

    const res = await createTrackedEmail(DEFAULT_PROJECT.id, req, 'http://localhost:3000');
    expect(res.success).toBe(true);

    const emailDetailsBefore = await getEmailDetails(res.emailId);
    expect(emailDetailsBefore).not.toBeNull();
    expect(emailDetailsBefore!.email.open_count).toBe(0);
    expect(emailDetailsBefore!.email.click_count).toBe(0);

    const linkId = emailDetailsBefore!.links[0].id;

    // 2. Sender opens Sent box and clicks link (skipRecord = true)
    const senderRedirectUrl = await recordClickEvent(
      res.trackingId,
      linkId,
      '192.168.1.50',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'https://mail.google.com/',
      true // skipRecord = true
    );

    // Sender is still smoothly redirected to the target URL
    expect(senderRedirectUrl).toBe('https://erhatechnologies.com/proposal');

    // BUT counters remain ZERO (nothing is recorded on dashboard)
    const emailDetailsAfterSenderClick = await getEmailDetails(res.emailId);
    expect(emailDetailsAfterSenderClick!.email.open_count).toBe(0);
    expect(emailDetailsAfterSenderClick!.email.click_count).toBe(0);
    expect(emailDetailsAfterSenderClick!.email.status).toBe('SENT');

    // 3. Sender opens Sent box and loads pixel (skipRecord = true)
    const senderOpenResult = await recordOpenEvent(
      res.trackingId,
      '192.168.1.50',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'https://mail.google.com/',
      true // skipRecord = true
    );
    expect(senderOpenResult).toBe(false);

    const emailDetailsAfterSenderOpen = await getEmailDetails(res.emailId);
    expect(emailDetailsAfterSenderOpen!.email.open_count).toBe(0);
    expect(emailDetailsAfterSenderOpen!.email.status).toBe('SENT');

    // 4. Now the REAL RECIPIENT clicks the link (skipRecord = false)
    const recipientRedirectUrl = await recordClickEvent(
      res.trackingId,
      linkId,
      '203.0.113.195', // Recipient public IP
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      null,
      false // skipRecord = false
    );

    expect(recipientRedirectUrl).toBe('https://erhatechnologies.com/proposal');

    // Dashboard counters now correctly show recipient engagement!
    const emailDetailsAfterRecipientClick = await getEmailDetails(res.emailId);
    expect(emailDetailsAfterRecipientClick!.email.open_count).toBe(1);
    expect(emailDetailsAfterRecipientClick!.email.click_count).toBe(1);
    expect(emailDetailsAfterRecipientClick!.email.status).toBe('CLICKED');
  });
});

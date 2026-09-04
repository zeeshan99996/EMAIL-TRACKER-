import { describe, it, expect } from 'vitest';
import { createTrackedEmail, recordOpenEvent, recordClickEvent, getDashboardData, getEmailDetails } from '../lib/supabase/admin';
import { DEFAULT_PROJECT } from '../lib/store';
import fs from 'fs';
import path from 'path';

describe('Data Persistence & Tracking Lifecycle', () => {
  it('should create email, persist to store, track open and click, and survive reload', async () => {
    // 1. Create a tracked email
    const req = {
      to: 'client@company.com',
      recipientName: 'Test Client',
      subject: 'Quarterly Proposal & Scope',
      html: '<p>Hello, please check our <a href="https://example.com/proposal">Proposal Link</a>.</p>',
    };

    const res = await createTrackedEmail(DEFAULT_PROJECT.id, req, 'http://localhost:3000');
    expect(res.success).toBe(true);
    expect(res.trackingId).toMatch(/^trk_/);
    expect(res.emailId).toBeDefined();

    // 2. Check persistence file exists on disk
    const dbPath = path.join(process.cwd(), 'data', 'local-db.json');
    expect(fs.existsSync(dbPath)).toBe(true);
    const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const savedEmail = dbContent.emails.find((e: any) => e.tracking_id === res.trackingId);
    expect(savedEmail).toBeDefined();
    expect(savedEmail.recipient_email).toBe('client@company.com');
    expect(savedEmail.open_count).toBe(0);

    // 3. Simulate email open
    const openSuccess = await recordOpenEvent(res.trackingId, '127.0.0.1', 'Mozilla/5.0');
    expect(openSuccess).toBe(true);

    // 4. Retrieve email details
    const details = await getEmailDetails(res.emailId);
    expect(details).not.toBeNull();
    expect(details?.email.open_count).toBe(1);
    expect(details?.email.status).toBe('OPENED');
    expect(details?.links.length).toBe(1);
    expect(details?.events.length).toBeGreaterThanOrEqual(2); // SENT + OPEN

    // 5. Simulate link click
    const linkId = details!.links[0].id;
    const targetUrl = await recordClickEvent(res.trackingId, linkId, '127.0.0.1');
    expect(targetUrl).toBe('https://example.com/proposal');

    // 6. Verify dashboard query reflects persisted data
    const dashData = await getDashboardData(DEFAULT_PROJECT.id);
    expect(dashData.summary.totalEmails).toBeGreaterThanOrEqual(1);
    expect(dashData.summary.trackedOpens).toBeGreaterThanOrEqual(1);
    expect(dashData.summary.totalClicks).toBeGreaterThanOrEqual(1);

    // 7. Re-read raw disk file to ensure disk state is 100% in sync
    const reloadedDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const reloadedEmail = reloadedDb.emails.find((e: any) => e.tracking_id === res.trackingId);
    expect(reloadedEmail.open_count).toBe(1);
    expect(reloadedEmail.click_count).toBe(1);
    expect(reloadedEmail.status).toBe('CLICKED');
  });
});

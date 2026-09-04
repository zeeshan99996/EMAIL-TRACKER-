import { describe, it, expect } from 'vitest';
import { createTrackedEmail, getDashboardData } from '../lib/supabase/admin';

describe('Live Insert to Supabase', () => {
  it('should insert an email into Supabase table emails', async () => {
    const res = await createTrackedEmail(
      'prj_demo_01',
      {
        to: 'direct-check@example.com',
        recipientName: 'Direct Check',
        subject: 'Direct Supabase Table Verification',
        html: '<p>Testing direct Supabase table insert</p>',
      },
      'http://localhost:3000'
    );

    expect(res.success).toBe(true);
    console.log('Inserted email to Supabase! Email ID:', res.emailId, 'Tracking ID:', res.trackingId);
  });
});

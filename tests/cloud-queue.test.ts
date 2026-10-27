import { describe, it, expect, vi } from 'vitest';
import {
  startCloudCampaign,
  getActiveCloudCampaign,
  cancelCloudCampaign,
} from '@/lib/campaigns/cloud-queue';

describe('Cloud Campaign Queue Engine', () => {
  it('initializes a cloud campaign and runs in instant mode', async () => {
    const leads = [
      { id: 1, row: 2, name: 'Lead One', email: 'lead1@example.com', company: 'Company 1' },
      { id: 2, row: 3, name: 'Lead Two', email: 'lead2@example.com', company: 'Company 2' },
    ];

    const campaign = await startCloudCampaign({
      leads,
      senderAccountId: 'demo_sender',
      template: {
        subject: 'Hello {{name}}',
        bodyHtml: '<p>Testing {{company}}</p>',
      },
      mode: 'instant',
      skipVerification: true,
    });

    expect(campaign).toBeDefined();
    expect(campaign.totalLeads).toBe(2);
    expect(campaign.status).toBe('completed');
    expect(campaign.sentCount).toBe(2);

    const active = getActiveCloudCampaign();
    expect(active).toBeDefined();
    expect(active?.id).toBe(campaign.id);
  });

  it('cancels an active campaign gracefully', () => {
    const cancelled = cancelCloudCampaign();
    expect(cancelled).toBe(true);

    const active = getActiveCloudCampaign();
    expect(active?.status).toBe('cancelled');
  });
});

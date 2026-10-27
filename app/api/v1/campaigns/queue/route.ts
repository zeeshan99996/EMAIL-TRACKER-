import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveCloudCampaign,
  startCloudCampaign,
  cancelCloudCampaign,
  processNextDripLead,
} from '@/lib/campaigns/cloud-queue';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const campaign = getActiveCloudCampaign();

    // If campaign is running in drip mode and a lead is due, process it
    if (campaign && campaign.status === 'running' && campaign.nextRunAt && Date.now() >= campaign.nextRunAt) {
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
      const baseUrl = `${protocol}://${host}`;
      await processNextDripLead(baseUrl);
    }

    return NextResponse.json({
      success: true,
      campaign: getActiveCloudCampaign(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to get queue status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leads,
      senderAccountId,
      senderName,
      senderEmail,
      template,
      sheetWebhookUrl,
      skipVerification,
      mode = 'instant', // 'instant' or 'drip'
      cadenceSeconds = 120,
    } = body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'No leads provided for campaign queue' }, { status: 400 });
    }

    if (!template || !template.subject || !template.bodyHtml) {
      return NextResponse.json({ error: 'Valid email template required' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;

    const campaign = await startCloudCampaign({
      leads,
      senderAccountId,
      senderName,
      senderEmail,
      template,
      sheetWebhookUrl,
      skipVerification,
      mode,
      cadenceSeconds,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to start cloud campaign' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cancelled = cancelCloudCampaign();
    return NextResponse.json({
      success: true,
      cancelled,
      campaign: getActiveCloudCampaign(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to cancel campaign' }, { status: 500 });
  }
}

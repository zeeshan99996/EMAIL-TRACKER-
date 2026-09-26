import { localDb, loadDbFromSupabase, saveDbAsync } from '@/lib/db/store';
import { targetedLocalDb } from '@/lib/db/targeted_store';
import { logSecurityEvent } from '@/lib/security/audit';
import { scheduleTargetedWarmupJobsForUser } from '@/lib/warmup/targeted_scheduler';
import { processAllTargetedJobs } from '@/lib/warmup/targeted_worker';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      logSecurityEvent({
        event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        path: `/api/warmup/targeted/${params.id}`,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 0. Ensure latest data from Supabase Cloud Store
    await loadDbFromSupabase();

    const { action, autoPauseStandard } = await request.json(); // start, pause, stop, trigger_cycle
    const shouldAutoPause = autoPauseStandard !== false;
    const campaignId = params.id;

    let campaign = targetedLocalDb.getCampaignById(campaignId, session.user.id);
    if (!campaign) {
      const userCampaigns = targetedLocalDb.getCampaigns(session.user.id);
      campaign = userCampaigns.find(c => c.id === campaignId) 
        || userCampaigns.find(c => c.status === 'running' || c.status === 'paused')
        || userCampaigns[0];
    }
    if (!campaign) {
      const allCamp = targetedLocalDb.getCampaigns();
      campaign = allCamp.find(c => c.id === campaignId)
        || allCamp.find(c => c.status === 'running' || c.status === 'paused')
        || allCamp[0];
    }
    if (!campaign) {
      const accounts = localDb.getAccounts(session.user.id);
      if (accounts.length > 0) {
        const targetAcc = accounts.find(a => a.email.toLowerCase().includes('yasir') || a.email.toLowerCase().includes('erha')) || accounts[0];
        const peerAccs = accounts.filter(a => a.id !== targetAcc.id);
        campaign = targetedLocalDb.upsertCampaign({
          id: campaignId && campaignId !== 'undefined' ? campaignId : crypto.randomUUID(),
          user_id: session.user.id,
          target_email_account_id: targetAcc.id,
          status: action === 'pause' ? 'paused' : (action === 'stop' ? 'stopped' : 'running'),
          daily_limit: 50,
          started_at: new Date().toISOString()
        });
        for (const p of peerAccs) {
          targetedLocalDb.upsertPeer({
            campaign_id: campaign.id,
            email_account_id: p.id,
            enabled: true,
            status: 'running',
          });
        }
      }
    }

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found and could not be initialized.' }, { status: 404 });
    }

    const actualCampaignId = campaign.id;

    if (campaign.user_id !== session.user.id) {
      campaign.user_id = session.user.id;
      targetedLocalDb.upsertCampaign(campaign);
    }

    if (action === 'start' || action === 'trigger_cycle') {
      if (shouldAutoPause) {
        localDb.upsertConfig(session.user.id, { status: 'paused', enabled: false });
        const stdAccounts = localDb.getWarmupAccounts(session.user.id);
        for (const a of stdAccounts) {
          localDb.updateWarmupAccount(a.id, { status: 'paused', paused_at: new Date().toISOString() });
        }
        const jobs = localDb.getJobs(session.user.id);
        for (const j of jobs) {
          if (j.status === 'queued') {
            localDb.updateJob(j.id, { status: 'cancelled', error_message: 'Paused to run Targeted Warmup' });
          }
        }
      } else if (targetedLocalDb.isAccountActiveInStandardMode(campaign.target_email_account_id)) {
        return NextResponse.json({ error: 'Account is active in Standard Warmup. Conflict detected.' }, { status: 400 });
      }
      targetedLocalDb.upsertCampaign({ id: actualCampaignId, user_id: session.user.id, target_email_account_id: campaign.target_email_account_id, status: 'running', started_at: new Date().toISOString() });
      await scheduleTargetedWarmupJobsForUser(session.user.id, true);
      targetedLocalDb.expediteQueuedJobs(actualCampaignId);
      processAllTargetedJobs().catch(e => console.error('Targeted instant trigger error', e));
    } else if (action === 'pause') {
      targetedLocalDb.upsertCampaign({ id: actualCampaignId, user_id: session.user.id, target_email_account_id: campaign.target_email_account_id, status: 'paused', paused_at: new Date().toISOString() });
      targetedLocalDb.cancelPendingJobs(actualCampaignId);
    } else if (action === 'stop') {
      targetedLocalDb.upsertCampaign({ id: actualCampaignId, user_id: session.user.id, target_email_account_id: campaign.target_email_account_id, status: 'stopped', stopped_at: new Date().toISOString() });
      targetedLocalDb.cancelPendingJobs(actualCampaignId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Synchronously commit to Supabase Cloud Database
    await saveDbAsync(localDb.ensureDbFile());

    return NextResponse.json({ success: true, status: action, campaignId: actualCampaignId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await loadDbFromSupabase();
    const campaign = targetedLocalDb.getCampaignById(params.id, session.user.id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    const peers = targetedLocalDb.getPeers(campaign.id);
    const jobs = targetedLocalDb.getAllJobs(campaign.id);
    const events = targetedLocalDb.getEvents(campaign.id);
    return NextResponse.json({ campaign, peers, jobs, events });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

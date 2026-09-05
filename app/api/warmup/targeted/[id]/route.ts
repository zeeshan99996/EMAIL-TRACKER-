import { localDb } from '@/lib/db/store';
import { targetedLocalDb } from '@/lib/db/targeted_store';
import { logSecurityEvent } from '@/lib/security/audit';
import { scheduleTargetedWarmupJobsForUser } from '@/lib/warmup/targeted_scheduler';
import { processAllTargetedJobs } from '@/lib/warmup/targeted_worker';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

    const { action, autoPauseStandard } = await request.json(); // start, pause, stop, trigger_cycle
    const campaignId = params.id;

    const campaign = targetedLocalDb.getCampaignById(campaignId);
    if (!campaign || campaign.user_id !== session.user.id) {
      logSecurityEvent({
        event: 'FORBIDDEN_RESOURCE_ACCESS',
        userId: session.user.id,
        path: `/api/warmup/targeted/${campaignId}`,
        details: { action, campaignId },
      });
      return NextResponse.json({ error: 'Campaign not found or access denied.' }, { status: 404 });
    }

    if (action === 'start' || action === 'trigger_cycle') {
      if (autoPauseStandard) {
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
      targetedLocalDb.upsertCampaign({ id: campaignId, user_id: session.user.id, target_email_account_id: campaign.target_email_account_id, status: 'running', started_at: new Date().toISOString() });
      await scheduleTargetedWarmupJobsForUser(session.user.id, true);
      targetedLocalDb.expediteQueuedJobs(campaignId);
      processAllTargetedJobs().catch(e => console.error('Targeted instant trigger error', e));
    } else if (action === 'pause') {
      targetedLocalDb.upsertCampaign({ id: campaignId, user_id: session.user.id, target_email_account_id: campaign.target_email_account_id, status: 'paused', paused_at: new Date().toISOString() });
      targetedLocalDb.cancelPendingJobs(campaignId);
    } else if (action === 'stop') {
      targetedLocalDb.upsertCampaign({ id: campaignId, user_id: session.user.id, target_email_account_id: campaign.target_email_account_id, status: 'stopped', stopped_at: new Date().toISOString() });
      targetedLocalDb.cancelPendingJobs(campaignId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, status: action });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

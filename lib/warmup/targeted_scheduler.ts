import { targetedLocalDb } from '@/lib/db/targeted_store';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

function generateTargetedIdempotencyKey(
  sourceId: string,
  targetId: string,
  jobType: string,
  cycleIndex: number,
  date: string
) {
  return crypto
    .createHash('sha256')
    .update(`${sourceId}-${targetId}-${jobType}-${cycleIndex}-${date}`)
    .digest('hex');
}

export async function scheduleTargetedWarmupJobsForUser(
  userId: string,
  forceImmediate = false
): Promise<{ createdCount: number }> {
  const campaigns = targetedLocalDb.getCampaigns(userId).filter(c => c.status === 'running' && c.enabled);
  if (campaigns.length === 0) return { createdCount: 0 };

  let createdCount = 0;
  const nowStr = new Date().toISOString();
  const dateStr = nowStr.split('T')[0];

  for (const campaign of campaigns) {
    const peers = targetedLocalDb.getPeers(campaign.id).filter(p => p.enabled && p.status !== 'error');
    if (peers.length === 0) continue;

    // We need to schedule Cycle N
    // To determine cycle index, we count how many cycles we scheduled today
    const existingJobs = targetedLocalDb.getAllJobs(campaign.id).filter(j => j.scheduled_at.startsWith(dateStr));

    // Calculate current cycle index based on existing jobs (initial_send from target)
    const initialSendJobs = existingJobs.filter(j => j.job_type === 'initial_send' && j.source_account_id === campaign.target_email_account_id);
    const cycleIndex = Math.floor(initialSendJobs.length / peers.length);

    // Limit cycles based on daily limits
    if (initialSendJobs.length >= campaign.daily_limit) {
      continue; // Reached daily limit
    }

    // Determine when the next cycle should start
    let lastJobTime = new Date().getTime();
    if (existingJobs.length > 0) {
      const latestJob = existingJobs.reduce((prev, current) => (prev.scheduled_at > current.scheduled_at) ? prev : current);
      lastJobTime = new Date(latestJob.scheduled_at).getTime();
    }

    const nextCycleStartTime = lastJobTime + (campaign.cooldown_minutes * 60 * 1000);
    if (!forceImmediate && nextCycleStartTime > new Date().getTime() && existingJobs.length > 0) {
      // Check if any job is still pending or processing
      const hasPending = existingJobs.some(j => j.status === 'queued' || j.status === 'processing');
      if (hasPending) {
        continue;
      }
    }

    // It's time to schedule the next cycle!
    // Step 1: Target -> Peers (Initial Sends)
    const sendBaseTime = forceImmediate ? new Date().getTime() : Math.max(new Date().getTime(), nextCycleStartTime);
    
    for (let i = 0; i < peers.length; i++) {
      if (initialSendJobs.length + i >= campaign.daily_limit) break; // Don't exceed daily limit
      
      const peer = peers[i];
      // For immediate start: first peer starts now (0-30s), subsequent peers staggered by 1-2 minutes
      const sendDelayMs = i === 0 && existingJobs.length === 0 ? 0 : (i * 90 * 1000) + Math.floor(Math.random() * 30 * 1000);
      const scheduledSendTime = new Date(sendBaseTime + sendDelayMs);

      const sendIdemKey = generateTargetedIdempotencyKey(
        campaign.target_email_account_id,
        peer.email_account_id,
        'initial_send',
        cycleIndex,
        dateStr
      );

      // Check if job exists
      if (existingJobs.some(j => j.idempotency_key === sendIdemKey)) continue;

      targetedLocalDb.upsertJob({
        campaign_id: campaign.id,
        source_account_id: campaign.target_email_account_id,
        target_account_id: peer.email_account_id,
        job_type: 'initial_send',
        status: 'queued',
        scheduled_at: scheduledSendTime.toISOString(),
        idempotency_key: sendIdemKey,
        metadata: { cycle: cycleIndex },
      });
      createdCount++;
    }
  }

  return { createdCount };
}

import { localDb } from '@/lib/db/store';
import { targetedLocalDb } from '@/lib/db/targeted_store';
import { createTrackedEmail } from '@/lib/supabase/admin';
import { verifyEmailAddress } from '@/lib/verification/email-verifier';
import { generateContextualWarmupReply, generateUniqueStarterEmail } from '../ai/gemini';
import { unifiedFetchThreadMessages, unifiedSendEmail } from '../mail/unified';
import { scheduleTargetedWarmupJobsForUser } from './targeted_scheduler';

// SMART COOLDOWN TO ENSURE HIGH THROUGHPUT & AVOID GOOGLE SPAM
const STRICT_COOLDOWN_MS = 30 * 1000; // 30 seconds between sends from same account

export async function processTargetedWarmupJob(jobId: string): Promise<{ success: boolean; message?: string }> {
  const db = targetedLocalDb;
  const campaign = db.getCampaigns().find(c => db.getAllJobs(c.id).some(j => j.id === jobId));
  if (!campaign) return { success: false, message: 'Campaign not found' };

  const job = db.getAllJobs(campaign.id).find(j => j.id === jobId);
  if (!job || job.status !== 'queued') return { success: false, message: 'Job not ready' };

  try {
    db.upsertJob({ id: job.id, campaign_id: campaign.id, status: 'processing', started_at: new Date().toISOString() });

    // Ensure 30s gap between sends from the source account
    const sourceStats = db.getEvents(campaign.id).filter(e => e.source_account_id === job.source_account_id && e.event_type === 'message_sent');
    if (sourceStats.length > 0) {
      const lastSentMs = new Date(sourceStats[0].created_at).getTime();
      const timeSinceLastSend = Date.now() - lastSentMs;
      if (timeSinceLastSend < STRICT_COOLDOWN_MS) {
        db.upsertJob({ id: job.id, campaign_id: campaign.id, status: 'queued', started_at: null });
        return { success: false, message: `Cooldown active. Waiting ${Math.ceil((STRICT_COOLDOWN_MS - timeSinceLastSend)/1000)}s` };
      }
    }

    if (job.job_type === 'initial_send') {
      const sourceEmail = localDb.getAccountById(job.source_account_id)?.email || 'sender@example.com';
      const targetEmail = localDb.getAccountById(job.target_account_id)?.email || 'recipient@example.com';
      
      const emailContent = await generateUniqueStarterEmail({
        senderEmail: sourceEmail,
        recipientEmail: targetEmail,
        rotationIndex: Math.floor(Math.random() * 50),
      });
      // Pre-send verification
      const verifyRes = await verifyEmailAddress(targetEmail);
      if (!verifyRes.valid) {
        db.insertEvent({
          campaign_id: campaign.id,
          source_account_id: job.source_account_id,
          target_account_id: job.target_account_id,
          event_type: 'limit_reached',
          status: 'warning',
        });
        return { success: false, message: `Target email verification failed: ${verifyRes.reason}` };
      }

      // Email Tracker integration
      let trackedHtml: string | undefined = undefined;
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const tracked = await createTrackedEmail(
          'prj_demo_01',
          {
            to: targetEmail,
            subject: emailContent.subject,
            html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">${emailContent.body.replace(/\n/g, '<br>')}</div>`,
          },
          appUrl
        );
        trackedHtml = tracked.trackedHtml;
      } catch {
        // fallback
      }

      const result = await unifiedSendEmail({
        fromAccountId: job.source_account_id,
        toEmail: targetEmail,
        subject: emailContent.subject,
        body: emailContent.body,
        html: trackedHtml,
      });

      // Schedule the peer's reply (staggered within 1 to 3 minutes)
      const delayMs = Math.floor(Math.random() * 60 * 1000) + 60 * 1000;
      const scheduledReplyTime = new Date(Date.now() + delayMs);
      
      db.upsertJob({
        campaign_id: campaign.id,
        source_account_id: job.target_account_id,
        target_account_id: job.source_account_id,
        job_type: 'reply_response',
        status: 'queued',
        scheduled_at: scheduledReplyTime.toISOString(),
        gmail_thread_id: result.threadId,
        metadata: { parentJobId: job.id },
      });

      db.insertEvent({
        campaign_id: campaign.id,
        source_account_id: job.source_account_id,
        target_account_id: job.target_account_id,
        event_type: 'message_sent',
        gmail_message_id: result.messageId,
        gmail_thread_id: result.threadId,
        status: 'success',
      });

    } else if (job.job_type === 'reply_response') {
      const threadMsgs = await unifiedFetchThreadMessages({
        accountId: job.source_account_id,
        threadId: job.gmail_thread_id!,
      });

      if (!threadMsgs || threadMsgs.length === 0) {
        throw new Error('Thread not found yet');
      }

      const latestMsg = threadMsgs[threadMsgs.length - 1];
      let body = "Following up on this project update.";
      
      if (campaign.ai_enabled) {
        const sourceEmail = localDb.getAccountById(job.source_account_id)?.email || 'sender@example.com';
        const targetEmail = localDb.getAccountById(job.target_account_id)?.email || 'recipient@example.com';
        
        body = await generateContextualWarmupReply({
          threadMessages: threadMsgs,
          recipientEmail: targetEmail,
          senderEmail: sourceEmail,
        });
      }

      const replySubject = latestMsg.subject?.toLowerCase().startsWith('re:') ? latestMsg.subject : `Re: ${latestMsg.subject || 'Project Update'}`;

      // Email Tracker integration: reply
      let replyTrackedHtml: string | undefined = undefined;
      const targetRecipient = localDb.getAccountById(job.target_account_id)?.email || '';
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const tracked = await createTrackedEmail(
          'prj_demo_01',
          {
            to: targetRecipient,
            subject: replySubject,
            html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">${body.replace(/\n/g, '<br>')}</div>`,
          },
          appUrl
        );
        replyTrackedHtml = tracked.trackedHtml;
      } catch {
        // fallback
      }

      const result = await unifiedSendEmail({
        fromAccountId: job.source_account_id,
        toEmail: targetRecipient,
        subject: replySubject,
        body,
        html: replyTrackedHtml,
        inReplyTo: latestMsg.id,
        references: latestMsg.id,
        threadId: job.gmail_thread_id!,
      });

      db.insertEvent({
        campaign_id: campaign.id,
        source_account_id: job.source_account_id,
        target_account_id: job.target_account_id,
        event_type: 'response_sent',
        gmail_message_id: result.messageId,
        gmail_thread_id: job.gmail_thread_id!,
        status: 'success',
      });
    }

    db.upsertJob({ id: job.id, campaign_id: campaign.id, status: 'completed', completed_at: new Date().toISOString() });
    
    // Attempt to schedule next cycle if applicable
    await scheduleTargetedWarmupJobsForUser(campaign.user_id).catch(()=>false);
    
    return { success: true };
  } catch (err: any) {
    console.error(`Targeted Job Failed: ${err.message}`);
    const attempts = job.attempts + 1;
    if (attempts >= 3) {
      db.upsertJob({ id: job.id, campaign_id: campaign.id, status: 'failed', error_message: err.message, attempts });
    } else {
      // Retry in 2 minutes
      db.upsertJob({ 
        id: job.id, 
        campaign_id: campaign.id, 
        status: 'queued', 
        error_message: err.message, 
        attempts,
        scheduled_at: new Date(Date.now() + 2 * 60 * 1000).toISOString()
      });
    }
    return { success: false, message: err.message };
  }
}

let isTargetedWorkerRunning = false;

export async function processAllTargetedJobs(forceAll = false) {
  if (isTargetedWorkerRunning) {
    console.log('[Targeted Worker] Already running, skipping this tick.');
    return;
  }
  
  isTargetedWorkerRunning = true;
  try {
    const db = targetedLocalDb;
    let jobs = db.getPendingJobs();
    if (jobs.length === 0) {
      db.expediteQueuedJobs();
      jobs = db.getPendingJobs();
    }
    for (const job of jobs.slice(0, 3)) {
      await processTargetedWarmupJob(job.id);
    }
  } finally {
    isTargetedWorkerRunning = false;
  }
}

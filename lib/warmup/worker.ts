import { localDb } from '@/lib/db/store';
import { createAdminClient, createTrackedEmail } from '@/lib/supabase/admin';
import { verifyEmailAddress } from '@/lib/verification/email-verifier';
import { generateContextualWarmupReply, generateUniqueStarterEmail } from '../ai/gemini';
import { unifiedFetchThreadMessages, unifiedSendEmail } from '../mail/unified';
import { generateReplyIdempotencyKey } from './idempotency';
import { calculateLevelFromStats } from './levels';
import { calculateNextScheduledTime, isThreadLimitReached } from './limits';
import { scheduleWarmupJobsForUser } from './scheduler';
import { EmailWarmupJob } from './types';

const MAX_JOB_ATTEMPTS = 3;

async function claimDueJobs(batchSize = 10): Promise<EmailWarmupJob[]> {
  const supabase = createAdminClient();

  try {
    const { data: rpcJobs, error: rpcError } = await supabase.rpc('claim_warmup_jobs', {
      batch_size: batchSize,
    });

    if (!rpcError && rpcJobs && rpcJobs.length > 0) {
      return rpcJobs as EmailWarmupJob[];
    }
  } catch {
    // ignore
  }

  return localDb.claimDueJobs(batchSize);
}

async function updateAccountStats({
  userId,
  accountId,
  type,
}: {
  userId: string;
  accountId: string;
  type: 'sent' | 'received' | 'replied' | 'failed';
}) {
  const supabase = createAdminClient();

  // 1. Update in local store
  const warmupAcc = localDb.getWarmupAccountByEmailAccountId(accountId);
  if (warmupAcc) {
    const updates: any = {
      last_activity_at: new Date().toISOString(),
    };
    if (type === 'sent') {
      updates.daily_sent = (warmupAcc.daily_sent || 0) + 1;
      updates.total_sent = (warmupAcc.total_sent || 0) + 1;
      updates.warmup_level = calculateLevelFromStats(updates.total_sent, warmupAcc.warmup_level);
    } else if (type === 'received') {
      updates.daily_received = (warmupAcc.daily_received || 0) + 1;
      updates.total_received = (warmupAcc.total_received || 0) + 1;
    } else if (type === 'replied') {
      updates.daily_replies = (warmupAcc.daily_replies || 0) + 1;
      updates.total_replies = (warmupAcc.total_replies || 0) + 1;
    }
    localDb.updateWarmupAccount(warmupAcc.id, updates);
  }

  localDb.upsertDailyStat(userId, accountId, type);

  // 2. Try Supabase
  try {
    const { data: supaWarmup } = await supabase
      .from('email_warmup_accounts')
      .select('*')
      .eq('email_account_id', accountId)
      .single();

    if (supaWarmup) {
      const supaUpdates: Record<string, any> = {
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (type === 'sent') {
        supaUpdates.daily_sent = supaWarmup.daily_sent + 1;
        supaUpdates.total_sent = supaWarmup.total_sent + 1;
        supaUpdates.warmup_level = calculateLevelFromStats(supaUpdates.total_sent, supaWarmup.warmup_level);
      } else if (type === 'received') {
        supaUpdates.daily_received = supaWarmup.daily_received + 1;
        supaUpdates.total_received = supaWarmup.total_received + 1;
      } else if (type === 'replied') {
        supaUpdates.daily_replies = supaWarmup.daily_replies + 1;
        supaUpdates.total_replies = supaWarmup.total_replies + 1;
      }

      await supabase.from('email_warmup_accounts').update(supaUpdates).eq('id', supaWarmup.id);
    }
  } catch {
    // ignore
  }
}

async function processJob(job: EmailWarmupJob): Promise<{ success: boolean; error?: string }> {
  localDb.insertEvent({
    user_id: job.user_id,
    warmup_account_id: job.warmup_account_id,
    source_account_id: job.source_account_id,
    target_account_id: job.target_account_id,
    event_type: 'job_started',
    status: 'info',
    metadata: { job_type: job.job_type, attempt: job.attempts },
  });

  const config = localDb.getConfig(job.user_id);
  const minDelay = config.min_delay_minutes ?? 5;
  const maxDelay = config.max_delay_minutes ?? 7;
  const maxMessagesPerThread = config.max_messages_per_thread ?? 4;
  const isAiEnabled = config.ai_enabled ?? true;

  const sourceAcc = localDb.getAccountById(job.source_account_id);
  const targetAcc = localDb.getAccountById(job.target_account_id);

  if (!sourceAcc || !targetAcc) {
    throw new Error('Source or Target email account not found');
  }

  if (sourceAcc.status !== 'connected' || targetAcc.status !== 'connected') {
    throw new Error(`One or more accounts are not connected (Source: ${sourceAcc.status}, Target: ${targetAcc.status})`);
  }

  // Handle Initial Send Job: Generate Unique Human Starter Email
  if (job.job_type === 'initial_send') {
    const starter = isAiEnabled
      ? await generateUniqueStarterEmail({
          senderEmail: sourceAcc.email,
          recipientEmail: targetAcc.email,
          rotationIndex: job.metadata?.templateIndex,
        })
      : {
          subject: 'Quick check-in on project schedule',
          body: 'Hi there,\n\nHope your week is going well! Wanted to check in quickly to see if everything is on track for our upcoming milestones.\n\nBest regards,',
        };

    // Deliverability protection: Pre-send verification
    const verification = await verifyEmailAddress(targetAcc.email);
    if (!verification.valid) {
      localDb.insertEvent({
        user_id: job.user_id,
        warmup_account_id: job.warmup_account_id,
        source_account_id: sourceAcc.id,
        target_account_id: targetAcc.id,
        event_type: 'limit_reached',
        status: 'warning',
        metadata: { reason: `Pre-send verification rejected: ${verification.reason}` },
      });
      return { success: false, error: `Recipient rejected by deliverability verifier: ${verification.reason}` };
    }

    // Email Tracker integration: inject tracking pixel and log tracked email
    let trackedHtml: string | undefined = undefined;
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const tracked = await createTrackedEmail(
        'prj_demo_01',
        {
          to: targetAcc.email,
          subject: starter.subject,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">${starter.body.replace(/\n/g, '<br>')}</div>`,
        },
        appUrl
      );
      trackedHtml = tracked.trackedHtml;
    } catch {
      // Fallback if tracker registration encounters an issue
    }

    const { messageId, threadId } = await unifiedSendEmail({
      fromAccountId: sourceAcc.id,
      toEmail: targetAcc.email,
      subject: starter.subject,
      body: starter.body,
      html: trackedHtml,
    });

    localDb.insertEvent({
      user_id: job.user_id,
      warmup_account_id: job.warmup_account_id,
      source_account_id: sourceAcc.id,
      target_account_id: targetAcc.id,
      event_type: 'message_sent',
      gmail_message_id: messageId,
      gmail_thread_id: threadId,
      status: 'success',
      metadata: { subject: starter.subject, preview: starter.body.slice(0, 100) },
    });

    await updateAccountStats({ userId: job.user_id, accountId: sourceAcc.id, type: 'sent' });
    await updateAccountStats({ userId: job.user_id, accountId: targetAcc.id, type: 'received' });

    // Schedule Relevant Reply from Target Account back to Source Account
    const replyScheduledAt = calculateNextScheduledTime(minDelay, maxDelay);
    const replyIdempotencyKey = generateReplyIdempotencyKey({
      userId: job.user_id,
      sourceAccountId: targetAcc.id,
      targetAccountId: sourceAcc.id,
      threadId,
      messageId,
    });

    const targetWarmupAcc = localDb.getWarmupAccountByEmailAccountId(targetAcc.id);

    localDb.insertJob({
      user_id: job.user_id,
      warmup_account_id: targetWarmupAcc?.id,
      source_account_id: targetAcc.id,
      target_account_id: sourceAcc.id,
      job_type: 'reply_response',
      status: 'queued',
      scheduled_at: replyScheduledAt.toISOString(),
      idempotency_key: replyIdempotencyKey,
      gmail_thread_id: threadId,
      gmail_message_id: messageId,
      metadata: {
        initial_subject: starter.subject,
        last_subject: starter.subject,
        last_body: starter.body,
        thread_step: 1,
      },
    });

    return { success: true };
  }

  // Handle Reply Response Job: Generate Contextual Relevant Reply
  if (job.job_type === 'reply_response') {
    if (!job.gmail_thread_id) {
      throw new Error('Missing gmail_thread_id for reply job');
    }

    const threadStep = job.metadata?.thread_step ?? 1;

    if (isThreadLimitReached(threadStep, maxMessagesPerThread)) {
      localDb.insertEvent({
        user_id: job.user_id,
        warmup_account_id: job.warmup_account_id,
        source_account_id: sourceAcc.id,
        target_account_id: targetAcc.id,
        event_type: 'limit_reached',
        gmail_thread_id: job.gmail_thread_id,
        status: 'info',
        metadata: { threadStep, maxMessagesPerThread, reason: 'Thread depth limit reached' },
      });
      return { success: true };
    }

    // Build thread messages context directly from job metadata or IMAP fallback
    let threadHistory: any[] = [];
    if (job.metadata?.last_body) {
      threadHistory = [
        {
          id: job.gmail_message_id || 'msg_1',
          threadId: job.gmail_thread_id,
          subject: job.metadata?.initial_subject || 'Project Update',
          from: targetAcc.email,
          to: sourceAcc.email,
          date: new Date().toISOString(),
          snippet: job.metadata.last_body.slice(0, 100),
          bodyText: job.metadata.last_body,
        },
      ];
    } else {
      try {
        const fetched = await unifiedFetchThreadMessages({
          accountId: sourceAcc.id,
          threadId: job.gmail_thread_id,
          peerEmail: targetAcc.email,
          subject: job.metadata?.initial_subject,
        });
        if (fetched && fetched.length > 0) {
          threadHistory = fetched;
        }
      } catch {
        // ignore
      }
    }

    const replySubject = job.metadata?.initial_subject?.startsWith('Re:')
      ? job.metadata.initial_subject
      : `Re: ${job.metadata?.initial_subject || 'Project sync'}`;

    let replyBody = '';
    if (isAiEnabled) {
      try {
        replyBody = await generateContextualWarmupReply({
          threadMessages: threadHistory,
          recipientEmail: sourceAcc.email,
          senderEmail: targetAcc.email,
        });

        localDb.insertEvent({
          user_id: job.user_id,
          warmup_account_id: job.warmup_account_id,
          source_account_id: sourceAcc.id,
          target_account_id: targetAcc.id,
          event_type: 'response_generated',
          gmail_thread_id: job.gmail_thread_id,
          status: 'success',
          metadata: { preview: replyBody.slice(0, 120), threadStep },
        });
      } catch (aiErr: any) {
        console.error('[Worker] Gemini reply generation failed:', aiErr.message);
        replyBody = 'Thanks for reaching out! That works great on my end, looking forward to it.';
      }
    } else {
      replyBody = 'Thanks for following up! Everything looks good on my side.';
    }

    // Email Tracker integration: inject tracking pixel and log tracked reply
    let replyTrackedHtml: string | undefined = undefined;
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const tracked = await createTrackedEmail(
        'prj_demo_01',
        {
          to: targetAcc.email,
          subject: replySubject,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">${replyBody.replace(/\n/g, '<br>')}</div>`,
        },
        appUrl
      );
      replyTrackedHtml = tracked.trackedHtml;
    } catch {
      // Fallback
    }

    const { messageId: newReplyMsgId } = await unifiedSendEmail({
      fromAccountId: sourceAcc.id,
      toEmail: targetAcc.email,
      subject: replySubject,
      body: replyBody,
      html: replyTrackedHtml,
      inReplyTo: job.gmail_message_id || undefined,
      references: job.gmail_message_id || undefined,
      threadId: job.gmail_thread_id || undefined,
    });

    localDb.insertEvent({
      user_id: job.user_id,
      warmup_account_id: job.warmup_account_id,
      source_account_id: sourceAcc.id,
      target_account_id: targetAcc.id,
      event_type: 'response_sent',
      gmail_message_id: newReplyMsgId,
      gmail_thread_id: job.gmail_thread_id,
      status: 'success',
      metadata: { subject: replySubject, threadStep },
    });

    await updateAccountStats({ userId: job.user_id, accountId: sourceAcc.id, type: 'replied' });
    await updateAccountStats({ userId: job.user_id, accountId: targetAcc.id, type: 'received' });

    // Schedule Next Reply Back (targetAcc -> sourceAcc)
    const nextThreadStep = threadStep + 1;
    if (nextThreadStep < maxMessagesPerThread) {
      const nextScheduledAt = calculateNextScheduledTime(minDelay, maxDelay);
      const nextIdempotencyKey = generateReplyIdempotencyKey({
        userId: job.user_id,
        sourceAccountId: targetAcc.id,
        targetAccountId: sourceAcc.id,
        threadId: job.gmail_thread_id,
        messageId: newReplyMsgId,
      });

      const nextTargetWarmupAcc = localDb.getWarmupAccountByEmailAccountId(targetAcc.id);

      localDb.insertJob({
        user_id: job.user_id,
        warmup_account_id: nextTargetWarmupAcc?.id,
        source_account_id: targetAcc.id,
        target_account_id: sourceAcc.id,
        job_type: 'reply_response',
        status: 'queued',
        scheduled_at: nextScheduledAt.toISOString(),
        idempotency_key: nextIdempotencyKey,
        gmail_thread_id: job.gmail_thread_id,
        gmail_message_id: newReplyMsgId,
        metadata: {
          initial_subject: job.metadata?.initial_subject || replySubject,
          last_subject: replySubject,
          last_body: replyBody,
          thread_step: nextThreadStep,
        },
      });
    }

    return { success: true };
  }

  return { success: true };
}

let isStandardWorkerRunning = false;

export async function executeWarmupWorker(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  postponed: number;
  details: any[];
}> {
  if (isStandardWorkerRunning) {
    console.log('[Standard Worker] Already running, skipping this tick.');
    return { processed: 0, succeeded: 0, failed: 0, postponed: 0, details: [] };
  }

  isStandardWorkerRunning = true;
  try {
    console.log('[Worker] Starting job processing run...');
    const dueJobs = await claimDueJobs(5); // reduced batch size to 5 to prevent timeouts
    if (dueJobs.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0, postponed: 0, details: [] };
    }
    console.log(`[Worker] Claimed ${dueJobs.length} jobs`);

  let succeeded = 0;
  let failed = 0;
  let postponed = 0;
  const details: any[] = [];
  const impactedUserIds = new Set<string>();

  // Memory map to track send times during this batch to prevent burst sending
  const accountCooldownMap = new Map<string, number>();

  for (const job of dueJobs) {
    impactedUserIds.add(job.user_id);

    // ANTI-SPAM BURST PROTECTION: Strict minimum 3-minute gap between ANY emails from the same source account
    const warmupAcc = localDb.getWarmupAccountByEmailAccountId(job.source_account_id);
    const lastActiveStr = warmupAcc?.last_activity_at;
    const lastActive = lastActiveStr ? new Date(lastActiveStr).getTime() : 0;
    const memActive = accountCooldownMap.get(job.source_account_id) || 0;
    const mostRecentActivity = Math.max(lastActive, memActive);
    const timeSinceLastSend = Date.now() - mostRecentActivity;
    const STRICT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes strict gap

    if (timeSinceLastSend < STRICT_COOLDOWN_MS) {
      const waitNeeded = STRICT_COOLDOWN_MS - timeSinceLastSend;
      // Stagger slightly so multiple jobs don't pile up on the exact same millisecond
      const newScheduledTime = new Date(Date.now() + waitNeeded + Math.floor(Math.random() * 60000)).toISOString();
      localDb.updateJob(job.id, {
        status: 'queued', // put it back
        scheduled_at: newScheduledTime,
      });
      postponed++;
      details.push({ jobId: job.id, status: 'postponed', reason: 'Strict 5m anti-burst cooldown enforced' });
      continue;
    }

    try {
      // Mark this account as actively sending right now to prevent subsequent jobs in this loop from firing
      accountCooldownMap.set(job.source_account_id, Date.now());

      const result = await processJob(job);

      if (result.success) {
        succeeded++;
        localDb.updateJob(job.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          error_message: null,
        });

        localDb.insertEvent({
          user_id: job.user_id,
          warmup_account_id: job.warmup_account_id,
          source_account_id: job.source_account_id,
          target_account_id: job.target_account_id,
          event_type: 'job_completed',
          status: 'success',
          metadata: { jobId: job.id, job_type: job.job_type },
        });

        details.push({ jobId: job.id, status: 'completed' });
      }
    } catch (err: any) {
      failed++;
      console.error(`[Worker] Error processing job ${job.id}:`, err.message);

      let newStatus = 'failed';
      let retryScheduledAt = null;

      if (job.attempts < MAX_JOB_ATTEMPTS) {
        newStatus = 'queued';
        const backoffMs = Math.min(30 * 60 * 1000, Math.pow(2, job.attempts) * 2 * 60 * 1000);
        retryScheduledAt = new Date(Date.now() + backoffMs).toISOString();
      }

      localDb.updateJob(job.id, {
        status: newStatus as any,
        scheduled_at: retryScheduledAt || job.scheduled_at,
        completed_at: newStatus === 'failed' ? new Date().toISOString() : null,
        error_message: err.message || 'Unknown processing error',
      });

      localDb.insertEvent({
        user_id: job.user_id,
        warmup_account_id: job.warmup_account_id,
        source_account_id: job.source_account_id,
        target_account_id: job.target_account_id,
        event_type: 'job_failed',
        status: 'error',
        metadata: { jobId: job.id, error: err.message, willRetry: newStatus === 'queued' },
      });

      await updateAccountStats({
        userId: job.user_id,
        accountId: job.source_account_id,
        type: 'failed',
      });

      details.push({ jobId: job.id, status: newStatus, error: err.message });
    }
  }

  for (const userId of Array.from(impactedUserIds)) {
    try {
      await scheduleWarmupJobsForUser(userId);
    } catch (schedErr: any) {
      console.error(`[Worker] Scheduling error for user ${userId}:`, schedErr.message);
    }
  }

  return {
    processed: dueJobs.length,
    succeeded,
    failed,
    postponed,
    details,
  };
  } finally {
    isStandardWorkerRunning = false;
  }
}

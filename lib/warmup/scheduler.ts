import { localDb } from '@/lib/db/store';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSendIdempotencyKey } from './idempotency';
import { calculateNextScheduledTime, canAccountSendToday } from './limits';

export function generateDeterministicPairs(
  accounts: { id: string; emailAccountId: string }[]
): { sourceId: string; targetId: string }[] {
  const n = accounts.length;
  if (n < 2) return [];

  const pairs: { sourceId: string; targetId: string }[] = [];

  for (let offset = 1; offset < n; offset++) {
    for (let i = 0; i < n; i++) {
      const targetIndex = (i + offset) % n;
      pairs.push({
        sourceId: accounts[i].emailAccountId,
        targetId: accounts[targetIndex].emailAccountId,
      });
    }
  }

  return pairs;
}

export async function scheduleWarmupJobsForUser(userId: string): Promise<{ createdCount: number }> {
  // 1. Fetch user warmup config (Local or Supabase)
  let config = localDb.getConfig(userId);
  const supabase = createAdminClient();

  try {
    const { data: supaConfig } = await supabase
      .from('email_warmup_configs')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (supaConfig) config = supaConfig;
  } catch {
    // ignore
  }

  if (!config || !config.enabled || config.status !== 'active') {
    return { createdCount: 0 };
  }

  // 2. Fetch warmup accounts
  let warmupAccounts = localDb.getWarmupAccounts(userId).filter(
    (w) => (w.status === 'running' || w.status === 'queued') && w.email_account?.status === 'connected'
  );

  try {
    const { data: supaWarmup } = await supabase
      .from('email_warmup_accounts')
      .select(`
        id,
        email_account_id,
        status,
        warmup_level,
        daily_sent,
        daily_received,
        email_account:email_accounts!inner(id, status, email)
      `)
      .eq('user_id', userId)
      .in('status', ['running', 'queued'])
      .eq('email_account.status', 'connected')
      .order('created_at', { ascending: true });

    if (supaWarmup && supaWarmup.length > 0) {
      warmupAccounts = supaWarmup as any;
    }
  } catch {
    // ignore
  }

  if (!warmupAccounts || warmupAccounts.length < 2) {
    return { createdCount: 0 };
  }

  // 3. Generate deterministic pairs
  const accountList = warmupAccounts.map((a) => ({
    id: a.id,
    emailAccountId: a.email_account_id,
  }));

  const allPairs = generateDeterministicPairs(accountList);
  if (allPairs.length === 0) return { createdCount: 0 };

  const todayStr = new Date().toISOString().split('T')[0];
  let createdCount = 0;

  // Existing jobs
  let existingJobs = localDb.getJobs(userId);
  try {
    const { data: supaJobs } = await supabase
      .from('email_warmup_jobs')
      .select('source_account_id, target_account_id, scheduled_at, status')
      .eq('user_id', userId)
      .gte('scheduled_at', `${todayStr}T00:00:00.000Z`)
      .order('scheduled_at', { ascending: true });
    if (supaJobs) existingJobs = supaJobs as any;
  } catch {
    // ignore
  }

  const existingCount = existingJobs ? existingJobs.length : 0;
  let runningBaseDate = new Date();

  for (let i = 0; i < allPairs.length; i++) {
    const pairIndex = (existingCount + i) % allPairs.length;
    const pair = allPairs[pairIndex];

    const sourceWarmupAcc = warmupAccounts.find((a) => a.email_account_id === pair.sourceId);
    if (!sourceWarmupAcc) continue;

    const canSend = canAccountSendToday({
      dailySent: sourceWarmupAcc.daily_sent || 0,
      warmupLevel: sourceWarmupAcc.warmup_level || 0,
      campaignDailyLimit: config.daily_limit || 20,
    });

    if (!canSend) continue;

    const hasQueuedJob = existingJobs?.some(
      (j) => j.source_account_id === pair.sourceId && j.status === 'queued'
    );
    if (hasQueuedJob) continue;

    // First initial job is scheduled immediately (0 delay), subsequent jobs staggered with 5-7m delay
    let scheduledAt = new Date();
    if (existingCount > 0 || i > 0) {
      scheduledAt = calculateNextScheduledTime(
        config.min_delay_minutes ?? 5,
        config.max_delay_minutes ?? 7,
        runningBaseDate
      );
      runningBaseDate = scheduledAt;
    }

    const idempotencyKey = generateSendIdempotencyKey({
      userId,
      sourceAccountId: pair.sourceId,
      targetAccountId: pair.targetId,
      date: todayStr,
      index: pairIndex + existingCount,
    });

    const randomTopicIndex = (pairIndex + Math.floor(Math.random() * 50));

    // Save to local store
    localDb.insertJob({
      user_id: userId,
      warmup_account_id: sourceWarmupAcc.id,
      source_account_id: pair.sourceId,
      target_account_id: pair.targetId,
      job_type: 'initial_send',
      status: 'queued',
      scheduled_at: scheduledAt.toISOString(),
      idempotency_key: idempotencyKey,
      metadata: { templateIndex: randomTopicIndex },
    });

    localDb.insertEvent({
      user_id: userId,
      warmup_account_id: sourceWarmupAcc.id,
      source_account_id: pair.sourceId,
      target_account_id: pair.targetId,
      event_type: 'job_created',
      status: 'info',
      metadata: { scheduledAt: scheduledAt.toISOString(), pairIndex, type: 'initial_send' },
    });

    localDb.updateWarmupAccount(sourceWarmupAcc.id, {
      next_activity_at: scheduledAt.toISOString(),
      status: 'running',
    });

    // Also sync to Supabase if available
    try {
      await supabase.from('email_warmup_jobs').insert({
        user_id: userId,
        warmup_account_id: sourceWarmupAcc.id,
        source_account_id: pair.sourceId,
        target_account_id: pair.targetId,
        job_type: 'initial_send',
        status: 'queued',
        scheduled_at: scheduledAt.toISOString(),
        idempotency_key: idempotencyKey,
        metadata: { templateIndex: randomTopicIndex },
      });
    } catch {
      // ignore
    }

    createdCount++;
  }

  return { createdCount };
}

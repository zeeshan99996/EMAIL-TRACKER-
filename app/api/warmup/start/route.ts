import { localDb, loadDbFromSupabase, saveDbAsync } from '@/lib/db/store';
import { scheduleWarmupJobsForUser } from '@/lib/warmup/scheduler';
import { executeWarmupWorker } from '@/lib/warmup/worker';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 0. Ensure latest data from Supabase Cloud Store
    await loadDbFromSupabase();

    const body = await request.json().catch(() => ({}));
    const accountId = body.accountId;
    const userId = session.user.id;

    // 1. Update local store
    localDb.upsertConfig(userId, { enabled: true, status: 'active' });

    if (accountId) {
      localDb.updateWarmupAccount(accountId, {
        status: 'running',
        started_at: new Date().toISOString(),
        paused_at: null,
      });
    } else {
      const allWarmups = localDb.getWarmupAccounts(userId);
      for (const w of allWarmups) {
        localDb.updateWarmupAccount(w.id, {
          status: 'running',
          started_at: new Date().toISOString(),
          paused_at: null,
        });
      }
    }

    // 2. Try Supabase
    const adminSupabase = createAdminClient();
    try {
      await adminSupabase.from('email_warmup_configs').upsert({
        user_id: userId,
        enabled: true,
        status: 'active',
        updated_at: new Date().toISOString(),
      });

      if (accountId) {
        await adminSupabase
          .from('email_warmup_accounts')
          .update({
            status: 'running',
            started_at: new Date().toISOString(),
            paused_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('email_account_id', accountId)
          .eq('user_id', userId);
      } else {
        await adminSupabase
          .from('email_warmup_accounts')
          .update({
            status: 'running',
            started_at: new Date().toISOString(),
            paused_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .in('status', ['queued', 'paused', 'error']);
      }
    } catch {
      // ignore
    }

    // 3. Trigger scheduler
    const scheduleResult = await scheduleWarmupJobsForUser(userId);

    // 4. Immediately execute due jobs so the first warmup email sends right now!
    const workerResult = await executeWarmupWorker().catch((workerErr) => {
      console.error('[Start Route] Worker run error:', workerErr.message);
      return { processed: 0, succeeded: 0, failed: 0 };
    });

    localDb.insertEvent({
      user_id: userId,
      event_type: 'job_created',
      status: 'info',
      metadata: {
        action: 'warmup_started',
        targetAccountId: accountId || 'all',
        newJobs: scheduleResult.createdCount,
        executedJobs: workerResult.processed,
      },
    });

    // Persist to Supabase Cloud Database
    await saveDbAsync(localDb.ensureDbFile());

    return NextResponse.json({
      success: true,
      message: workerResult.succeeded > 0
        ? `Warmup started! First email sent immediately between connected accounts.`
        : `Warmup started! ${scheduleResult.createdCount} jobs scheduled.`,
      jobsCreated: scheduleResult.createdCount,
      workerExecuted: workerResult,
    });
  } catch (err: any) {
    console.error('[API Warmup Start] Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

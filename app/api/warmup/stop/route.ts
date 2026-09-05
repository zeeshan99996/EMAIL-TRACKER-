import { localDb, loadDbFromSupabase, saveDbAsync } from '@/lib/db/store';
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

    // 1. Update local store (Instant Batch)
    if (accountId) {
      localDb.updateWarmupAccount(accountId, {
        status: 'paused',
        started_at: null,
        paused_at: new Date().toISOString(),
        next_activity_at: null,
      });
      localDb.cancelQueuedJobs({ userId, accountId, reason: 'Warmup stopped for account' });
    } else {
      localDb.upsertConfig(userId, { status: 'stopped', enabled: false });
      localDb.stopAllWarmupAccounts(userId);
      localDb.cancelQueuedJobs({ userId, reason: 'Warmup campaign stopped by user' });
    }

    // 2. Try Supabase
    const adminSupabase = createAdminClient();
    try {
      if (accountId) {
        await adminSupabase
          .from('email_warmup_accounts')
          .update({
            status: 'queued',
            started_at: null,
            paused_at: null,
            next_activity_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('email_account_id', accountId)
          .eq('user_id', userId);

        await adminSupabase
          .from('email_warmup_jobs')
          .update({
            status: 'cancelled',
            error_message: 'Warmup stopped for account',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('status', 'queued')
          .or(`source_account_id.eq.${accountId},target_account_id.eq.${accountId}`);
      } else {
        await adminSupabase
          .from('email_warmup_configs')
          .update({
            status: 'stopped',
            enabled: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        await adminSupabase
          .from('email_warmup_accounts')
          .update({
            status: 'queued',
            started_at: null,
            paused_at: null,
            next_activity_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        await adminSupabase
          .from('email_warmup_jobs')
          .update({
            status: 'cancelled',
            error_message: 'Warmup campaign stopped by user',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('status', 'queued');
      }
    } catch {
      // ignore
    }

    localDb.insertEvent({
      user_id: userId,
      event_type: 'job_completed',
      status: 'info',
      metadata: { action: 'warmup_stopped', targetAccountId: accountId || 'all' },
    });

    // Synchronously commit to Supabase Cloud Database
    await saveDbAsync(localDb.ensureDbFile());

    return NextResponse.json({ success: true, message: 'Warmup stopped' });
  } catch (err: any) {
    console.error('[API Warmup Stop] Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

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
        paused_at: new Date().toISOString(),
      });
      localDb.cancelQueuedJobs({ userId, accountId, reason: 'Warmup paused for account' });
    } else {
      localDb.upsertConfig(userId, { status: 'paused', enabled: false });
      localDb.pauseAllWarmupAccounts(userId);
      localDb.cancelQueuedJobs({ userId, reason: 'Warmup paused by user' });
    }

    // 2. Try Supabase
    const adminSupabase = createAdminClient();
    try {
      if (accountId) {
        await adminSupabase
          .from('email_warmup_accounts')
          .update({
            status: 'paused',
            paused_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('email_account_id', accountId)
          .eq('user_id', userId);
      } else {
        await adminSupabase
          .from('email_warmup_configs')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('user_id', userId);

        await adminSupabase
          .from('email_warmup_accounts')
          .update({
            status: 'paused',
            paused_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('status', 'running');
      }
    } catch {
      // ignore
    }

    localDb.insertEvent({
      user_id: userId,
      event_type: 'job_completed',
      status: 'info',
      metadata: { action: 'warmup_paused', targetAccountId: accountId || 'all' },
    });

    // Synchronously commit to Supabase Cloud Database
    await saveDbAsync(localDb.ensureDbFile());

    return NextResponse.json({ success: true, message: 'Warmup paused' });
  } catch (err: any) {
    console.error('[API Warmup Pause] Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

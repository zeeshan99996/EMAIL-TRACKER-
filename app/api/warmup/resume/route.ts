import { localDb } from '@/lib/db/store';
import { scheduleWarmupJobsForUser } from '@/lib/warmup/scheduler';
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

    const body = await request.json().catch(() => ({}));
    const accountId = body.accountId;
    const userId = session.user.id;

    // 1. Update local store
    if (accountId) {
      localDb.updateWarmupAccount(accountId, {
        status: 'running',
        paused_at: null,
      });
    } else {
      localDb.upsertConfig(userId, { status: 'active', enabled: true });
      const accounts = localDb.getWarmupAccounts(userId);
      for (const a of accounts) {
        if (a.status === 'paused') {
          localDb.updateWarmupAccount(a.id, {
            status: 'running',
            paused_at: null,
          });
        }
      }
    }

    // 2. Try Supabase
    const adminSupabase = createAdminClient();
    try {
      if (accountId) {
        await adminSupabase
          .from('email_warmup_accounts')
          .update({
            status: 'running',
            paused_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('email_account_id', accountId)
          .eq('user_id', userId);
      } else {
        await adminSupabase
          .from('email_warmup_configs')
          .update({
            status: 'active',
            enabled: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        await adminSupabase
          .from('email_warmup_accounts')
          .update({
            status: 'running',
            paused_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('status', 'paused');
      }
    } catch {
      // ignore
    }

    const scheduleResult = await scheduleWarmupJobsForUser(userId);

    localDb.insertEvent({
      user_id: userId,
      event_type: 'job_created',
      status: 'info',
      metadata: { action: 'warmup_resumed', targetAccountId: accountId || 'all', newJobs: scheduleResult.createdCount },
    });

    return NextResponse.json({ success: true, message: 'Warmup resumed' });
  } catch (err: any) {
    console.error('[API Warmup Resume] Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

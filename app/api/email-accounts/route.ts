import { localDb } from '@/lib/db/store';
import { logSecurityEvent } from '@/lib/security/audit';
import { sanitizeAccountForClient } from '@/lib/security/redactor';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      logSecurityEvent({
        event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        path: '/api/email-accounts',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Try Supabase first
    try {
      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select(`
          id,
          user_id,
          email,
          provider,
          status,
          last_sync_at,
          error_message,
          created_at,
          updated_at,
          warmup_account:email_warmup_accounts(
            id,
            status,
            warmup_level,
            daily_sent,
            daily_received,
            daily_replies,
            total_sent,
            total_received,
            total_replies,
            next_activity_at,
            last_activity_at,
            started_at,
            completed_at,
            paused_at,
            error_message
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && accounts && accounts.length > 0) {
        const formatted = accounts.map((acc: any) => sanitizeAccountForClient({
          id: acc.id,
          email: acc.email,
          provider: acc.provider,
          status: acc.status,
          last_sync_at: acc.last_sync_at,
          error_message: acc.error_message,
          created_at: acc.created_at,
          updated_at: acc.updated_at,
          warmup: Array.isArray(acc.warmup_account) ? acc.warmup_account[0] : acc.warmup_account,
        }));
        return NextResponse.json({ accounts: formatted });
      }
    } catch {
      // ignore
    }

    // Fallback to Local Store
    const localAccounts = localDb.getAccounts(userId);
    const formattedLocal = localAccounts.map((acc) => {
      const warmup = localDb.getWarmupAccountByEmailAccountId(acc.id);
      return sanitizeAccountForClient({
        id: acc.id,
        email: acc.email,
        provider: acc.provider,
        status: acc.status,
        last_sync_at: acc.last_sync_at,
        error_message: acc.error_message,
        created_at: acc.created_at,
        updated_at: acc.updated_at,
        warmup,
      });
    });

    return NextResponse.json({ accounts: formattedLocal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

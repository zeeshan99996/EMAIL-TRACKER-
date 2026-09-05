import { localDb, loadDbFromSupabase } from '@/lib/db/store';
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

    // 1. Guarantee latest persistent state from Supabase Cloud Database!
    await loadDbFromSupabase();

    // 2. Retrieve persistent accounts
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
        metadata: acc.metadata,
        warmup,
      });
    });

    return NextResponse.json({ accounts: formattedLocal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

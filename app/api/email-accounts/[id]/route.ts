import { localDb, loadDbFromSupabase, saveDbAsync } from '@/lib/db/store';
import { logSecurityEvent } from '@/lib/security/audit';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let userId = 'usr_default_admin';
    const supabase = createServerSupabaseClient();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch {}

    // 0. Ensure latest data from Supabase Cloud Store
    await loadDbFromSupabase();

    const accountId = params.id;
    const account = localDb.getAccountById(accountId);

    // Enforce multi-tenant authorization only if a real session user exists
    if (account && account.user_id !== userId && userId !== 'usr_default_admin') {
      logSecurityEvent({
        event: 'FORBIDDEN_RESOURCE_ACCESS',
        userId,
        path: `/api/email-accounts/${accountId}`,
        details: { action: 'delete_attempt', targetAccountId: accountId },
      });
      return NextResponse.json({ error: 'Forbidden: You do not own this account.' }, { status: 403 });
    }

    // 1. Delete from store
    localDb.deleteAccount(accountId);

    // 2. Synchronously persist deletion to Supabase Cloud Database
    await saveDbAsync(localDb.ensureDbFile());

    // 2. Delete from Supabase if present
    try {
      await supabase.from('email_warmup_accounts').delete().eq('email_account_id', accountId);
      await supabase.from('email_accounts').delete().eq('id', accountId).eq('user_id', userId);
    } catch (err) {
      console.error('[API Delete Account] Supabase delete error:', err);
    }

    logSecurityEvent({
      event: 'ACCOUNT_DELETED',
      userId,
      path: `/api/email-accounts/${accountId}`,
      details: { accountId, email: account?.email },
    });

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (err: any) {
    console.error('[API Delete Account] Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}


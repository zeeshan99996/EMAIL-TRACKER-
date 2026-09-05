import { localDb, loadDbFromSupabase, saveDbAsync } from '@/lib/db/store';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const accountId = params.id;
    const adminSupabase = createAdminClient();

    // 1. Delete from store
    localDb.deleteAccount(accountId);

    // 2. Try Supabase delete
    try {
      await adminSupabase.from('email_accounts').delete().eq('id', accountId);
    } catch {
      // ignore
    }

    localDb.insertEvent({
      user_id: session.user.id,
      source_account_id: accountId,
      event_type: 'job_completed',
      status: 'info',
      metadata: { action: 'account_disconnected_and_deleted' },
    });

    // 3. Synchronously persist to Supabase Cloud Database
    await saveDbAsync(localDb.ensureDbFile());

    return NextResponse.json({ success: true, message: 'Account removed successfully' });
  } catch (err: any) {
    console.error('[API Disconnect] Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

import { localDb, loadDbFromSupabase } from '@/lib/db/store';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get('eventType') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const userId = session.user.id;

    // Guarantee latest persistent events from Supabase Cloud Database!
    await loadDbFromSupabase();

    // Try Supabase first
    const adminSupabase = createAdminClient();
    try {
      let query = adminSupabase
        .from('email_warmup_events')
        .select(`
          id,
          user_id,
          warmup_account_id,
          source_account_id,
          target_account_id,
          event_type,
          gmail_message_id,
          gmail_thread_id,
          status,
          metadata,
          created_at
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (eventType && eventType !== 'all') query = query.eq('event_type', eventType);
      if (status && status !== 'all') query = query.eq('status', status);

      const { data: supaEvents, count, error } = await query;
      if (!error && supaEvents && supaEvents.length > 0) {
        return NextResponse.json({ events: supaEvents, total: count || supaEvents.length });
      }
    } catch {
      // ignore
    }

    // Fallback to local DB
    const { events, total } = localDb.getEvents(userId, limit, offset, eventType, status);
    return NextResponse.json({ events, total });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

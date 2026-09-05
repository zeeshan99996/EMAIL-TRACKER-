import { localDb, loadDbFromSupabase, saveDbAsync } from '@/lib/db/store';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    await loadDbFromSupabase();
    let config = localDb.getConfig(userId);

    const adminSupabase = createAdminClient();
    try {
      const { data: supaConfig } = await adminSupabase
        .from('email_warmup_configs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (supaConfig) {
        config = supaConfig;
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      daily_limit,
      min_delay_minutes,
      max_delay_minutes,
      max_messages_per_thread,
      ai_enabled,
      enabled,
    } = body;

    const dailyLimitNum = parseInt(daily_limit, 10);
    const minDelayNum = parseInt(min_delay_minutes, 10);
    const maxDelayNum = parseInt(max_delay_minutes, 10);
    const maxThreadNum = parseInt(max_messages_per_thread, 10);

    if (isNaN(dailyLimitNum) || dailyLimitNum < 1 || dailyLimitNum > 100) {
      return NextResponse.json({ error: 'Daily limit must be between 1 and 100' }, { status: 400 });
    }

    if (isNaN(minDelayNum) || minDelayNum < 1 || minDelayNum > 120) {
      return NextResponse.json({ error: 'Minimum delay must be at least 1 minute' }, { status: 400 });
    }

    if (isNaN(maxDelayNum) || maxDelayNum < minDelayNum || maxDelayNum > 240) {
      return NextResponse.json(
        { error: 'Maximum delay must be greater than or equal to minimum delay' },
        { status: 400 }
      );
    }

    if (isNaN(maxThreadNum) || maxThreadNum < 2 || maxThreadNum > 10) {
      return NextResponse.json(
        { error: 'Max messages per thread must be between 2 and 10' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // 0. Ensure latest data from Supabase Cloud Store
    await loadDbFromSupabase();

    // 1. Update store
    const localUpdated = localDb.upsertConfig(userId, {
      daily_limit: dailyLimitNum,
      min_delay_minutes: minDelayNum,
      max_delay_minutes: maxDelayNum,
      max_messages_per_thread: maxThreadNum,
      ai_enabled: Boolean(ai_enabled),
      enabled: Boolean(enabled),
    });

    // 2. Synchronously persist to Supabase Cloud Database
    await saveDbAsync(localDb.ensureDbFile());

    // 3. Try Supabase individual table
    const adminSupabase = createAdminClient();
    try {
      await adminSupabase
        .from('email_warmup_configs')
        .upsert({
          user_id: userId,
          daily_limit: dailyLimitNum,
          min_delay_minutes: minDelayNum,
          max_delay_minutes: maxDelayNum,
          max_messages_per_thread: maxThreadNum,
          ai_enabled: Boolean(ai_enabled),
          enabled: Boolean(enabled),
          updated_at: new Date().toISOString(),
        });
    } catch {
      // ignore
    }

    return NextResponse.json({ config: localUpdated, message: 'Settings saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

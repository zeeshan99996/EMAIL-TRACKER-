import { runAutoCleanupForUser } from '@/lib/mail/auto_cleanup';
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

    const results = await runAutoCleanupForUser(session.user.id);
    const totalDeleted = results.reduce((sum, r) => sum + r.deletedCount, 0);

    return NextResponse.json({
      success: true,
      totalDeleted,
      results,
    });
  } catch (err: any) {
    console.error('[API Cleanup] Error:', err);
    return NextResponse.json({ error: err.message || 'Cleanup failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

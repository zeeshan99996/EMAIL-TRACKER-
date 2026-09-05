import { localDb, loadDbFromSupabase } from '@/lib/db/store';
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Guarantee latest persistent state from Supabase Cloud Database!
    await loadDbFromSupabase();

    // Use store as primary or fallback
    const accounts = localDb.getAccounts(userId);
    const totalAccounts = accounts.length;
    const connectedAccounts = accounts.filter((a) => a.status === 'connected').length;

    const warmupList = localDb.getWarmupAccounts(userId);

    let warmupActive = 0;
    let completedAccounts = 0;
    let inProgressAccounts = 0;
    let queuedAccounts = 0;
    let pausedAccounts = 0;
    let errorAccounts = 0;
    let totalSentToday = 0;
    let totalReceivedToday = 0;
    let totalRepliesToday = 0;
    let grandTotalSent = 0;
    let grandTotalReplies = 0;

    for (const w of warmupList) {
      if (w.status === 'error' || w.email_account?.status === 'error' || w.email_account?.status === 'token_expired') {
        errorAccounts++;
      } else if (w.status === 'running') {
        warmupActive++;
      } else if (w.status === 'paused') {
        pausedAccounts++;
      } else if (w.status === 'queued') {
        queuedAccounts++;
      }

      if (w.warmup_level >= 4 || w.status === 'completed') {
        completedAccounts++;
      } else if (w.warmup_level > 0) {
        inProgressAccounts++;
      }

      totalSentToday += w.daily_sent || 0;
      totalReceivedToday += w.daily_received || 0;
      totalRepliesToday += w.daily_replies || 0;
      grandTotalSent += w.total_sent || 0;
      grandTotalReplies += w.total_replies || 0;
    }

    const progressPercentage = totalAccounts > 0
      ? Math.round((completedAccounts / totalAccounts) * 100)
      : 0;

    const dailyStats = localDb.getDailyStats(userId);
    const dailyMap: Record<string, { date: string; sent: number; received: number; replies: number; failed: number }> = {};
    for (const st of dailyStats) {
      if (!dailyMap[st.date]) {
        dailyMap[st.date] = { date: st.date, sent: 0, received: 0, replies: 0, failed: 0 };
      }
      dailyMap[st.date].sent += st.sent;
      dailyMap[st.date].received += st.received;
      dailyMap[st.date].replies += st.replies;
      dailyMap[st.date].failed += st.failed;
    }

    const dailyTrends = Object.values(dailyMap);

    return NextResponse.json({
      metrics: {
        totalAccounts,
        connectedAccounts,
        warmupActive,
        completedAccounts,
        inProgressAccounts,
        queuedAccounts,
        pausedAccounts,
        errorAccounts,
        totalSentToday,
        totalReceivedToday,
        totalRepliesToday,
        grandTotalSent,
        grandTotalReplies,
        progressPercentage,
      },
      dailyTrends,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

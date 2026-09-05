import { runSpamRescueForUser } from '@/lib/mail/spam_rescue';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    const cronHeader = request.headers.get('x-cron-secret');
    const isSecretValid = cronSecret && (authHeader === `Bearer ${cronSecret}` || cronHeader === cronSecret);

    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let userId = session?.user?.id;
    if (!userId && isSecretValid) {
      userId = '8c7ef590-f0d4-4b63-b30d-51cc4f0dc701';
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await runSpamRescueForUser(userId);
    const totalRescued = results.reduce((sum, r) => sum + r.rescuedCount, 0);
    const totalMarkedImportant = results.reduce((sum, r) => sum + r.markedImportantCount, 0);

    return NextResponse.json({
      success: true,
      totalRescued,
      totalMarkedImportant,
      results,
    });
  } catch (err: any) {
    console.error('[API Spam Rescue] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to execute spam rescue' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

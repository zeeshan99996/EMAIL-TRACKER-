import { executeWarmupWorker } from '@/lib/warmup/worker';
import { processAllTargetedJobs } from '@/lib/warmup/targeted_worker';
import { runSpamRescueForUser } from '@/lib/mail/spam_rescue';
import { runAutoCleanupForUser } from '@/lib/mail/auto_cleanup';
import { logSecurityEvent } from '@/lib/security/audit';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // short-lived serverless limit

async function verifyWorkerAuth(request: NextRequest): Promise<{ authorized: boolean; authType: string }> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const cronHeader = request.headers.get('x-cron-secret');

  // Check Bearer CRON_SECRET or x-cron-secret header
  if (cronSecret) {
    if (authHeader === `Bearer ${cronSecret}` || cronHeader === cronSecret) {
      return { authorized: true, authType: 'cron_secret' };
    }
  }

  // Check if authenticated user session exists (for dashboard developer quick-run)
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      return { authorized: true, authType: 'user_session' };
    }
  } catch (err) {
    // ignore
  }

  return { authorized: false, authType: 'none' };
}

export async function GET(request: NextRequest) {
  const { authorized, authType } = await verifyWorkerAuth(request);
  if (!authorized) {
    logSecurityEvent({
      event: 'CRON_AUTH_FAILED',
      path: '/api/warmup/worker',
      details: { reason: 'Invalid or missing cron secret' },
    });
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret or session' }, { status: 401 });
  }

  logSecurityEvent({
    event: 'CRON_AUTH_SUCCESS',
    path: '/api/warmup/worker',
    details: { authType },
  });

  try {
    const result = await executeWarmupWorker();
    
    // Also process Targeted Mode jobs
    await processAllTargetedJobs().catch(e => console.error('Targeted job error', e));

    // Also trigger background Spam Rescue & Auto-Cleanup for user
    try {
      const supabase = createServerSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        runSpamRescueForUser(session.user.id).catch(e => console.error('Spam rescue error', e));
        runAutoCleanupForUser(session.user.id).catch(e => console.error('Auto cleanup error', e));
      }
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      standard: result,
      targeted: 'processed',
    });
  } catch (err: any) {
    console.error('[API /api/warmup/worker] Error:', err);
    return NextResponse.json({ error: err.message || 'Worker failure' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

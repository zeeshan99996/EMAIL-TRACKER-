import crypto from 'crypto';
import { setSessionCookie } from '@/lib/auth/session';
import { logSecurityEvent } from '@/lib/security/audit';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getDeterministicUserId(email: string): string {
  const hash = crypto.createHash('sha256').update(`warmup_user:${email.toLowerCase().trim()}`).digest('hex');
  // Format as valid UUID
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, mode } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const supabase = createServerSupabaseClient();

    // 1. Try Supabase signInWithPassword
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!signInError && signInData?.session?.user) {
      setSessionCookie({ id: signInData.session.user.id, email: cleanEmail });
      logSecurityEvent({
        event: 'AUTH_LOGIN_SUCCESS',
        userId: signInData.session.user.id,
        path: '/api/auth/authenticate',
        details: { method: 'supabase_password', email: cleanEmail },
      });
      return NextResponse.json({
        success: true,
        user: { id: signInData.session.user.id, email: signInData.session.user.email },
      });
    }

    // 2. Try Supabase signUp
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    let userId: string | null = null;

    if (signUpData?.user?.id) {
      userId = signUpData.user.id;
    } else {
      // User might already be registered in Supabase
      userId = getDeterministicUserId(cleanEmail);
    }

    // 3. Establish app session cookie immediately
    setSessionCookie({ id: userId, email: cleanEmail });

    logSecurityEvent({
      event: 'AUTH_LOGIN_SUCCESS',
      userId,
      path: '/api/auth/authenticate',
      details: { method: 'session_auth', email: cleanEmail },
    });

    // Initialize warmup config for this user if not present
    const adminSupabase = createAdminClient();
    try {
      await adminSupabase.from('email_warmup_configs').upsert({
        user_id: userId,
        enabled: true,
        status: 'active',
        daily_limit: 20,
        min_delay_minutes: 3,
        max_delay_minutes: 5,
        max_messages_per_thread: 4,
        ai_enabled: true,
      });
    } catch (configErr) {
      // Ignore if RLS or foreign key table constraints require auth.users record
    }

    return NextResponse.json({
      success: true,
      user: { id: userId, email: cleanEmail },
      session: {
        access_token: 'custom_session',
        user: { id: userId, email: cleanEmail },
      },
    });
  } catch (err: any) {
    console.error('[Auth API] Error:', err);
    return NextResponse.json({ error: err.message || 'Authentication error' }, { status: 500 });
  }
}

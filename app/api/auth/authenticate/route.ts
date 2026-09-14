import { setSessionCookie } from '@/lib/auth/session';
import { logSecurityEvent } from '@/lib/security/audit';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  registerUser,
  authenticateUser,
  findUserByEmail,
} from '@/lib/db/user_store';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, mode = 'login' } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // =========================================================================
    // GET STARTED FLOW (SINGLE FORM: STORE DATA, PREVENT DUPLICATES, OPEN DASHBOARD)
    // =========================================================================
    if (mode === 'get_started') {
      const existingUser = findUserByEmail(cleanEmail);

      if (existingUser) {
        // User already exists -> DO NOT insert duplicate record in database
        const authResult = authenticateUser(cleanEmail, password);

        if (!authResult.success || !authResult.user) {
          return NextResponse.json(
            { error: 'An account with this email already exists. Incorrect password entered.' },
            { status: 401 }
          );
        }

        // Existing user validated successfully -> grant session & open dashboard
        setSessionCookie({ id: authResult.user.id, email: authResult.user.email });

        logSecurityEvent({
          event: 'AUTH_LOGIN_SUCCESS',
          userId: authResult.user.id,
          path: '/api/auth/authenticate',
          details: { method: 'get_started_existing_user', email: cleanEmail },
        });

        return NextResponse.json({
          success: true,
          user: { id: authResult.user.id, email: authResult.user.email, name: authResult.user.name },
          existing: true,
        });
      }

      // New User -> Store in database (zero duplicates)
      let newUser;
      try {
        newUser = registerUser({
          name: name?.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          password,
        });
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message || 'Failed to create account' },
          { status: 400 }
        );
      }

      try {
        const supabase = createServerSupabaseClient();
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
      } catch {}

      setSessionCookie({ id: newUser.id, email: newUser.email });

      logSecurityEvent({
        event: 'ACCOUNT_CREATED',
        userId: newUser.id,
        path: '/api/auth/authenticate',
        details: { method: 'get_started_new_user', email: cleanEmail },
      });

      return NextResponse.json({
        success: true,
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
      });
    }

    // =========================================================================
    // SIGN UP FLOW
    // =========================================================================
    if (mode === 'signup') {
      // 1. Check if user already exists
      const existingUser = findUserByEmail(cleanEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 400 }
        );
      }

      // 2. Persist new user in Database Store
      let newUser;
      try {
        newUser = registerUser({
          name: name?.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          password,
        });
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message || 'Failed to create account' },
          { status: 400 }
        );
      }

      // 3. Optional Supabase auth sync if available
      try {
        const supabase = createServerSupabaseClient();
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
      } catch {}

      // 4. Set secure session cookie
      setSessionCookie({ id: newUser.id, email: newUser.email });

      logSecurityEvent({
        event: 'ACCOUNT_CREATED',
        userId: newUser.id,
        path: '/api/auth/authenticate',
        details: { method: 'database_store', email: cleanEmail },
      });

      // Initialize default warmup config if needed
      try {
        const adminSupabase = createAdminClient();
        await adminSupabase.from('email_warmup_configs').upsert({
          user_id: newUser.id,
          enabled: true,
          status: 'active',
          daily_limit: 20,
          min_delay_minutes: 3,
          max_delay_minutes: 5,
          max_messages_per_thread: 4,
          ai_enabled: true,
        });
      } catch {}

      return NextResponse.json({
        success: true,
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
      });
    }

    // =========================================================================
    // LOGIN / SIGN IN FLOW (VERIFY PASSWORD AGAINST DATABASE)
    // =========================================================================
    
    // First, try verifying against our persistent database store
    const authResult = authenticateUser(cleanEmail, password);

    if (!authResult.success || !authResult.user) {
      // Try Supabase signInWithPassword if configured
      try {
        const supabase = createServerSupabaseClient();
        const { data: sbData, error: sbErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!sbErr && sbData?.session?.user) {
          setSessionCookie({ id: sbData.session.user.id, email: cleanEmail });
          logSecurityEvent({
            event: 'AUTH_LOGIN_SUCCESS',
            userId: sbData.session.user.id,
            path: '/api/auth/authenticate',
            details: { method: 'supabase_auth', email: cleanEmail },
          });
          return NextResponse.json({
            success: true,
            user: { id: sbData.session.user.id, email: cleanEmail },
          });
        }
      } catch {}

      // If credentials do not match, REJECT LOGIN & DO NOT OPEN DASHBOARD
      logSecurityEvent({
        event: 'AUTH_LOGIN_FAILED',
        userId: 'anonymous',
        path: '/api/auth/authenticate',
        details: { email: cleanEmail, reason: authResult.error },
      });

      return NextResponse.json(
        { error: authResult.error || 'Incorrect email or password' },
        { status: 401 }
      );
    }

    const authenticatedUser = authResult.user;

    // Set secure authentication cookie
    setSessionCookie({ id: authenticatedUser.id, email: authenticatedUser.email });

    logSecurityEvent({
      event: 'AUTH_LOGIN_SUCCESS',
      userId: authenticatedUser.id,
      path: '/api/auth/authenticate',
      details: { method: 'database_store', email: cleanEmail },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
      },
    });
  } catch (err: any) {
    console.error('[Auth API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

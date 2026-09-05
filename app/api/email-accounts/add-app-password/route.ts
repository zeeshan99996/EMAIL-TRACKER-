import { encryptToken } from '@/lib/crypto/encryption';
import { localDb, loadDbFromSupabase, saveDbAsync } from '@/lib/db/store';
import { verifySmtpCredentials } from '@/lib/mail/smtp';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { scheduleWarmupJobsForUser } from '@/lib/warmup/scheduler';
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

    // 0. Ensure latest data from Supabase Cloud Store
    await loadDbFromSupabase();

    const { email, appPassword } = await request.json();

    if (!email || !appPassword) {
      return NextResponse.json(
        { error: 'Both Gmail address and 16-character App Password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = appPassword.replace(/\s+/g, '').trim();

    if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid Gmail address' }, { status: 400 });
    }

    // 1. Verify credentials with Gmail SMTP
    try {
      await verifySmtpCredentials(cleanEmail, cleanPassword);
    } catch (smtpErr: any) {
      console.error('[Add App Password] SMTP Verification error:', smtpErr.message);
      return NextResponse.json(
        {
          error:
            'Gmail login failed. Please ensure 2-Step Verification is enabled on this Google account and you generated a 16-character "App Password" from security settings.',
          details: smtpErr.message,
        },
        { status: 400 }
      );
    }

    // 2. Encrypt App Password
    const encryptedPassword = encryptToken(cleanPassword);
    const userId = session.user.id;

    // 3. Save to local store
    const localAcc = localDb.upsertAccount({
      user_id: userId,
      email: cleanEmail,
      provider: 'gmail_app_password',
      access_token: encryptedPassword,
      refresh_token: null,
      status: 'connected',
    });

    const localConfig = localDb.getConfig(userId);
    localDb.upsertWarmupAccount({
      user_id: userId,
      warmup_config_id: localConfig.id,
      email_account_id: localAcc.id,
      status: 'queued',
      warmup_level: 0,
    });

    localDb.insertEvent({
      user_id: userId,
      source_account_id: localAcc.id,
      event_type: 'job_created',
      status: 'info',
      metadata: { action: 'account_connected_app_password', email: cleanEmail },
    });

    // 4. Synchronously persist to Supabase Cloud Database
    await saveDbAsync(localDb.ensureDbFile());

    // 5. Try individual Supabase tables if present
    try {
      const adminSupabase = createAdminClient();
      const { data: supaAcc, error: accErr } = await adminSupabase.from('email_accounts').insert({
        id: localAcc.id,
        user_id: userId,
        email: cleanEmail,
        provider: 'gmail_app_password',
        access_token: encryptedPassword,
        status: 'connected',
        updated_at: new Date().toISOString(),
      }).select().single();
      if (accErr) {
        console.warn('Supabase insert failed, relying on localDb:', accErr.message);
      } else if (supaAcc) {
        const { error: warmupErr } = await adminSupabase.from('email_warmup_accounts').insert({
          id: crypto.randomUUID(),
          user_id: userId,
          warmup_config_id: localConfig.id,
          email_account_id: supaAcc.id,
          status: 'queued',
          warmup_level: 0,
        });
        if (warmupErr) console.warn('Supabase warmup insert failed:', warmupErr.message);
      }
    } catch (err: any) {
      console.warn('[API Add Account] Supabase sync error, relying on localDb:', err.message);
    }

    // 5. Trigger scheduler
    await scheduleWarmupJobsForUser(userId).catch(() => {});

    return NextResponse.json({
      success: true,
      account: {
        id: localAcc.id,
        email: localAcc.email,
        provider: 'gmail_app_password',
        status: 'connected',
      },
      message: `Successfully connected ${cleanEmail} via Gmail App Password!`,
    });
  } catch (err: any) {
    console.error('[Add App Password] Exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

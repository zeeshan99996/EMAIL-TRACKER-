import { encryptToken } from '@/lib/crypto/encryption';
import { localDb } from '@/lib/db/store';
import { verifySmtpCredentials, SmtpConfig } from '@/lib/mail/smtp';
import { verifyImapCredentials, ImapConfig } from '@/lib/mail/imap';
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

    const { email, password, imapHost, imapPort, imapSecurity, smtpHost, smtpPort, smtpSecurity, provider } = await request.json();

    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: 'Both email address and password are required.' },
        { status: 400 }
      );
    }

    if (!cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Smart Provider Resolution (Hostinger / Gmail / Custom)
    const provLower = (provider || '').toLowerCase();
    const isHostinger = provLower === 'hostinger' || (!smtpHost && !imapHost);
    const isGmailSmtp = provLower.includes('gmail') || smtpHost?.includes('gmail.com');

    const effectiveSmtpHost = smtpHost || (isHostinger ? 'smtp.hostinger.com' : isGmailSmtp ? 'smtp.gmail.com' : '');
    const effectiveSmtpPort = Number(smtpPort) || (smtpSecurity === 'starttls' ? 587 : 465);
    const effectiveSmtpSecurity = smtpSecurity || 'ssl';

    const effectiveImapHost = imapHost || (isHostinger ? 'imap.hostinger.com' : isGmailSmtp ? 'imap.gmail.com' : '');
    const effectiveImapPort = Number(imapPort) || 993;
    const effectiveImapSecurity = imapSecurity || 'ssl';

    if (!effectiveSmtpHost || !effectiveImapHost) {
      return NextResponse.json(
        { error: 'SMTP host and IMAP host are required.' },
        { status: 400 }
      );
    }

    const smtpConfig: SmtpConfig = {
      host: effectiveSmtpHost,
      port: effectiveSmtpPort,
      secure: effectiveSmtpSecurity !== 'starttls', // true for SSL/TLS (465), false for STARTTLS (587)
    };

    const imapConfig: ImapConfig = {
      host: effectiveImapHost,
      port: effectiveImapPort,
      secure: effectiveImapSecurity !== 'starttls',
    };

    let confirmedSmtpPort = effectiveSmtpPort;
    let confirmedSmtpSecurity = effectiveSmtpSecurity;

    // 1. Verify SMTP (with automatic fallback between port 465 SSL and port 587 STARTTLS)
    try {
      const verifyRes = await verifySmtpCredentials(cleanEmail, cleanPassword, smtpConfig);
      if (verifyRes && verifyRes.workingPort) {
        confirmedSmtpPort = verifyRes.workingPort;
        confirmedSmtpSecurity = verifyRes.workingSecure ? 'ssl' : 'starttls';
      }
    } catch (smtpErr: any) {
      console.error('[Add Custom Email] SMTP Verification error:', smtpErr.message);
      return NextResponse.json(
        {
          error: smtpErr.message || 'SMTP connection failed. Please check your SMTP host, port, and password.',
          details: smtpErr.originalError || smtpErr.code || smtpErr.message,
          isAuthError: smtpErr.code === 'EAUTH',
        },
        { status: 400 }
      );
    }

    // 2. Verify IMAP
    try {
      await verifyImapCredentials(cleanEmail, cleanPassword, imapConfig);
    } catch (imapErr: any) {
      console.error('[Add Custom Email] IMAP Verification error:', imapErr.message);
      return NextResponse.json(
        {
          error: imapErr.message || 'IMAP connection failed. Please check your IMAP host, port, and password.',
          details: imapErr.message,
          isAuthError: imapErr.code === 'EAUTH',
        },
        { status: 400 }
      );
    }

    // 3. Encrypt Password
    const encryptedPassword = encryptToken(cleanPassword);
    const userId = session.user.id;
    const metadata = {
      imapHost: effectiveImapHost,
      imapPort: effectiveImapPort,
      imapSecurity: effectiveImapSecurity,
      smtpHost: effectiveSmtpHost,
      smtpPort: confirmedSmtpPort,
      smtpSecurity: confirmedSmtpSecurity,
      providerName: provider || (isHostinger ? 'Hostinger' : isGmailSmtp ? 'Gmail (SMTP)' : 'Custom SMTP'),
    };

    const providerKey = isHostinger ? 'hostinger_smtp' : isGmailSmtp ? 'gmail_smtp' : 'custom_smtp';

    // 4. Save to local store
    const localAcc = localDb.upsertAccount({
      user_id: userId,
      email: cleanEmail,
      provider: providerKey,
      access_token: encryptedPassword,
      refresh_token: null,
      status: 'connected',
      metadata,
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
      metadata: { action: 'account_connected_custom_smtp', email: cleanEmail },
    });

    // 5. Save to Supabase (persistent cloud db)
    try {
      const adminSupabase = createAdminClient();
      const { data: supaAcc, error: accErr } = await adminSupabase.from('email_accounts').insert({
        id: localAcc.id,
        user_id: userId,
        email: cleanEmail,
        provider: 'custom_smtp',
        access_token: encryptedPassword,
        status: 'connected',
        metadata,
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

    // 6. Trigger scheduler
    await scheduleWarmupJobsForUser(userId).catch(() => {});

    return NextResponse.json({
      success: true,
      account: {
        id: localAcc.id,
        email: localAcc.email,
        provider: 'custom_smtp',
        status: 'connected',
      },
      message: `Successfully connected ${cleanEmail} via Custom SMTP/IMAP!`,
    });
  } catch (err: any) {
    console.error('[Add Custom Email] Exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

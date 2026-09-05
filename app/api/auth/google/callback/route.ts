import { encryptToken } from '@/lib/crypto/encryption';
import { localDb } from '@/lib/db/store';
import { exchangeCodeForTokens, verifyOAuthState } from '@/lib/google/oauth';
import { logSecurityEvent } from '@/lib/security/audit';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    console.error('[OAuth Callback] Google OAuth Error:', error);
    logSecurityEvent({
      event: 'OAUTH_STATE_INVALID',
      path: '/api/auth/google/callback',
      details: { error },
    });
    return NextResponse.redirect(`${appUrl}/dashboard/warmup/accounts?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    logSecurityEvent({
      event: 'OAUTH_STATE_INVALID',
      path: '/api/auth/google/callback',
      details: { reason: 'missing_code_or_state' },
    });
    return NextResponse.redirect(`${appUrl}/dashboard/warmup/accounts?error=missing_code_or_state`);
  }

  const stateData = verifyOAuthState(state);
  if (!stateData) {
    logSecurityEvent({
      event: 'OAUTH_STATE_INVALID',
      path: '/api/auth/google/callback',
      details: { reason: 'invalid_or_expired_state' },
    });
    return NextResponse.redirect(`${appUrl}/dashboard/warmup/accounts?error=invalid_or_expired_state`);
  }

  const userId = stateData.userId;
  const supabase = createAdminClient();

  try {
    const { tokens, email, id: providerAccountId } = await exchangeCodeForTokens(code);

    if (!email || !tokens.access_token) {
      return NextResponse.redirect(`${appUrl}/dashboard/warmup/accounts?error=failed_to_retrieve_email`);
    }

    logSecurityEvent({
      event: 'OAUTH_CALLBACK_SUCCESS',
      userId,
      path: '/api/auth/google/callback',
      details: { email },
    });

    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null;
    const tokenExpiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : new Date(Date.now() + 3500 * 1000).toISOString();

    let accountId = '';

    // Try Supabase first
    let supabaseSuccess = false;
    try {
      const { data: existingAccount, error: fetchErr } = await supabase
        .from('email_accounts')
        .select('id, refresh_token')
        .eq('user_id', userId)
        .eq('email', email)
        .maybeSingle();

      if (!fetchErr) {
        if (existingAccount) {
          const finalRefreshToken = encryptedRefreshToken || existingAccount.refresh_token;
          await supabase
            .from('email_accounts')
            .update({
              provider_account_id: providerAccountId,
              access_token: encryptedAccessToken,
              refresh_token: finalRefreshToken,
              token_expires_at: tokenExpiresAt,
              status: 'connected',
              last_sync_at: new Date().toISOString(),
              error_message: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingAccount.id);
          accountId = existingAccount.id;
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from('email_accounts')
            .insert({
              user_id: userId,
              email,
              provider: 'gmail',
              provider_account_id: providerAccountId,
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
              token_expires_at: tokenExpiresAt,
              status: 'connected',
              last_sync_at: new Date().toISOString(),
            })
            .select('id')
            .single();

          if (!insertErr && inserted) {
            accountId = inserted.id;
          }
        }

        if (accountId) {
          supabaseSuccess = true;
          // Ensure config & warmup accounts in Supabase
          const { data: config } = await supabase
            .from('email_warmup_configs')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

          let configId = config?.id;
          if (!configId) {
            const { data: newConfig } = await supabase
              .from('email_warmup_configs')
              .insert({
                user_id: userId,
                enabled: true,
                status: 'active',
                daily_limit: 20,
                min_delay_minutes: 3,
                max_delay_minutes: 5,
                max_messages_per_thread: 4,
                ai_enabled: true,
              })
              .select('id')
              .single();
            configId = newConfig?.id;
          }

          if (configId) {
            const { data: existingWarmupAcc } = await supabase
              .from('email_warmup_accounts')
              .select('id')
              .eq('email_account_id', accountId)
              .maybeSingle();

            if (existingWarmupAcc) {
              await supabase
                .from('email_warmup_accounts')
                .update({
                  status: 'running',
                  error_message: null,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingWarmupAcc.id);
            } else {
              await supabase.from('email_warmup_accounts').insert({
                user_id: userId,
                warmup_config_id: configId,
                email_account_id: accountId,
                status: 'queued',
                warmup_level: 0,
              });
            }
          }
        }
      }
    } catch (supaErr: any) {
      console.warn('[OAuth Callback] Supabase notice, using local store:', supaErr.message);
    }

    // Always keep Local DB synchronized
    const localAcc = localDb.upsertAccount({
      user_id: userId,
      email,
      provider: 'gmail',
      provider_account_id: providerAccountId,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: tokenExpiresAt,
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
      metadata: { action: 'account_connected', email },
    });

    return NextResponse.redirect(
      `${appUrl}/dashboard/warmup/accounts?connected=true&email=${encodeURIComponent(email)}`
    );
  } catch (err: any) {
    console.error('[OAuth Callback] Exception:', err);
    return NextResponse.redirect(
      `${appUrl}/dashboard/warmup/accounts?error=${encodeURIComponent(err.message || 'oauth_exchange_failed')}`
    );
  }
}

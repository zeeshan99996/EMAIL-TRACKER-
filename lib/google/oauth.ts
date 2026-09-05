import { google } from 'googleapis';
import crypto from 'crypto';
import { decryptToken, encryptToken } from '@/lib/crypto/encryption';
import { localDb } from '@/lib/db/store';
import { createAdminClient } from '@/lib/supabase/admin';

const SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
];

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured in environment');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function generateOAuthState(userId: string): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = JSON.stringify({ userId, nonce, timestamp: Date.now() });
  return encryptToken(payload);
}

export function verifyOAuthState(state: string): { userId: string } | null {
  try {
    const decrypted = decryptToken(state);
    const parsed = JSON.parse(decrypted);
    if (Date.now() - parsed.timestamp > 30 * 60 * 1000) {
      return null;
    }
    return { userId: parsed.userId };
  } catch (error) {
    return null;
  }
}

export function getAuthorizationUrl(userId: string): string {
  const oauth2Client = getOAuth2Client();
  const state = generateOAuthState(userId);

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();

  return {
    tokens,
    email: userInfo.data.email || '',
    id: userInfo.data.id || '',
  };
}

export async function getAuthenticatedClientForAccount(accountId: string) {
  const supabase = createAdminClient();

  let account: any = null;

  try {
    const { data: supaAccount } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', accountId)
      .single();
    if (supaAccount) {
      account = supaAccount;
    }
  } catch {
    // ignore
  }

  if (!account) {
    account = localDb.getAccountById(accountId);
  }

  if (!account) {
    throw new Error(`Account not found: ${accountId}`);
  }

  if (account.status === 'disconnected') {
    throw new Error(`Account is disconnected: ${account.email}`);
  }

  const oauth2Client = getOAuth2Client();
  const accessToken = decryptToken(account.access_token);
  const refreshToken = account.refresh_token ? decryptToken(account.refresh_token) : null;

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
    expiry_date: account.token_expires_at ? new Date(account.token_expires_at).getTime() : undefined,
  });

  const now = Date.now();
  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at).getTime() : 0;
  const isExpiringSoon = expiresAt - now < 5 * 60 * 1000;

  if (isExpiringSoon && refreshToken) {
    try {
      const refreshed = await oauth2Client.refreshAccessToken();
      const newTokens = refreshed.credentials;

      const newExpiry = newTokens.expiry_date
        ? new Date(newTokens.expiry_date).toISOString()
        : new Date(Date.now() + 3500 * 1000).toISOString();

      const encAccess = encryptToken(newTokens.access_token);
      const encRefresh = newTokens.refresh_token ? encryptToken(newTokens.refresh_token) : account.refresh_token;

      // Update Supabase if available
      try {
        await supabase
          .from('email_accounts')
          .update({
            access_token: encAccess,
            refresh_token: encRefresh,
            token_expires_at: newExpiry,
            status: 'connected',
            error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', accountId);
      } catch {
        // ignore
      }

      // Update Local DB
      localDb.updateAccount(accountId, {
        access_token: encAccess,
        refresh_token: encRefresh,
        token_expires_at: newExpiry,
        status: 'connected',
        error_message: null,
      });

      oauth2Client.setCredentials(newTokens);
    } catch (refreshErr: any) {
      console.error(`[OAuth] Refresh token error for ${account.email}:`, refreshErr.message);

      localDb.updateAccount(accountId, {
        status: 'token_expired',
        error_message: `Token refresh failed: ${refreshErr.message}`,
      });

      localDb.updateWarmupAccount(accountId, {
        status: 'error',
        error_message: 'OAuth token refresh failed',
      });

      throw new Error(`Token refresh failed for account ${account.email}`);
    }
  }

  return { oauth2Client, account };
}

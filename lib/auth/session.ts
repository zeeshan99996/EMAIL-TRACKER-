import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.ENCRYPTION_KEY || process.env.CRON_SECRET || 'fallback-session-secret-key-32b';
const COOKIE_NAME = 'warmup_user_session';

export interface AppUserSession {
  id: string;
  email: string;
  created_at: number;
}

/**
 * Creates an HMAC signed encrypted session token
 */
export function signSession(user: { id: string; email: string }): string {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    created_at: Date.now(),
  });

  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const base64Payload = Buffer.from(payload).toString('base64');
  return `${base64Payload}.${hmac}`;
}

/**
 * Verifies and decodes the session token
 */
export function verifySession(token: string | undefined | null): AppUserSession | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, hmac] = parts;
  const payload = Buffer.from(base64Payload, 'base64').toString('utf8');

  const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  if (hmac !== expectedHmac) {
    return null;
  }

  try {
    const data = JSON.parse(payload);
    return data as AppUserSession;
  } catch {
    return null;
  }
}

/**
 * Sets session cookie on Next.js headers
 */
export function setSessionCookie(user: { id: string; email: string }) {
  const token = signSession(user);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Gets session from cookie store
 */
export function getSessionFromCookies(): AppUserSession | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

/**
 * Clears session cookie
 */
export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

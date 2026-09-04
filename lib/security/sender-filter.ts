import { NextRequest } from 'next/server';

// Global in-memory cache of sender IP addresses to filter out self-opens and self-clicks
const SENDER_IPS = new Set<string>([
  '127.0.0.1',
  '::1',
  'localhost',
]);

/**
 * Registers an IP address as a known sender / dashboard user.
 */
export function registerSenderIp(ip?: string | null): void {
  if (!ip) return;
  const cleanIp = ip.split(',')[0].trim();
  if (cleanIp && cleanIp !== 'unknown') {
    SENDER_IPS.add(cleanIp);
  }
}

/**
 * Checks if a given IP belongs to a known sender / dashboard user.
 */
export function isSenderIp(ip?: string | null): boolean {
  if (!ip) return false;
  const cleanIp = ip.split(',')[0].trim();
  return SENDER_IPS.has(cleanIp);
}

/**
 * Checks if an incoming HTTP request is made by the sender (self-view or self-click).
 * Detection mechanisms:
 * 1. Persistent cookie `_et_sender=1` (set on dashboard visit)
 * 2. Client IP matches a known sender/dashboard IP
 */
export function isSenderRequest(req: NextRequest): { isSender: boolean; ip: string; reason?: string } {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const hasSenderCookie = req.cookies.get('_et_sender')?.value === '1';
  if (hasSenderCookie) {
    // Also ensure this IP is registered for any future non-cookie requests from the same network
    registerSenderIp(ip);
    return { isSender: true, ip, reason: 'sender_cookie' };
  }

  if (isSenderIp(ip)) {
    return { isSender: true, ip, reason: 'sender_ip' };
  }

  return { isSender: false, ip };
}

/**
 * Returns all currently registered sender IPs.
 */
export function getRegisteredSenderIps(): string[] {
  return Array.from(SENDER_IPS);
}


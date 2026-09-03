import crypto from 'crypto';

export interface GeneratedApiKey {
  rawKey: string;
  keyHash: string;
  keyPrefix: string;
}

/**
 * Generates a cryptographically secure API Key with format `ek_live_<32_hex_chars>`.
 */
export function generateApiKey(): GeneratedApiKey {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `ek_live_${randomBytes}`;
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = `${rawKey.slice(0, 13)}...`;

  return {
    rawKey,
    keyHash,
    keyPrefix,
  };
}

/**
 * Computes a SHA-256 hash hex string of the raw API key for secure storage.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey.trim()).digest('hex');
}

/**
 * Extracts key prefix for UI display (e.g., `ek_live_abc12...`).
 */
export function extractKeyPrefix(rawKey: string): string {
  if (rawKey.length <= 12) return rawKey;
  return `${rawKey.slice(0, 13)}...`;
}

import { describe, it, expect } from 'vitest';
import { generateApiKey, hashApiKey, extractKeyPrefix } from '../lib/security/api-key';

describe('API Key Security Module', () => {
  it('should generate secure raw key starting with ek_live_', () => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey();
    expect(rawKey).toMatch(/^ek_live_[a-f0-9]{48}$/);
    expect(keyHash.length).toBe(64); // SHA-256 hex string length
    expect(keyPrefix).toBe(rawKey.slice(0, 13) + '...');
  });

  it('should generate consistent SHA-256 hash for identical raw key', () => {
    const rawKey = 'ek_live_1234567890abcdef1234567890abcdef1234567890abcdef';
    const hash1 = hashApiKey(rawKey);
    const hash2 = hashApiKey(rawKey);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(rawKey);
  });

  it('should truncate key prefix properly', () => {
    expect(extractKeyPrefix('ek_live_123456789')).toBe('ek_live_12345...');
  });
});

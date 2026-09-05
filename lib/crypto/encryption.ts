import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard GCM IV length in bytes

function getMasterKey(): Buffer {
  const envKey =
    process.env.ENCRYPTION_KEY ||
    '9f8e7d6c5b4a3928172635445362718293a4b5c6d7e8f9011223344556677889';
  // Always produce exactly 32 bytes using SHA-256
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Encrypts sensitive string data (such as OAuth tokens) using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (hex encoded)
 */
export function encryptToken(text: string | null | undefined): string {
  if (!text) return '';
  try {
    const key = getMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption] Failed to encrypt token:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts AES-256-GCM encrypted token string.
 * Supports gracefully returning raw token if data was stored unencrypted during initial migrations.
 */
export function decryptToken(encryptedData: string | null | undefined): string {
  if (!encryptedData) return '';
  
  // Check if string matches the iv:authTag:ciphertext pattern
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    // If not encrypted format (e.g. legacy/plain), return as-is
    return encryptedData;
  }

  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getMasterKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Decryption] Failed to decrypt token');
    // Fallback: If decryption fails (e.g. key changed or legacy format), return raw if reasonable
    return encryptedData;
  }
}

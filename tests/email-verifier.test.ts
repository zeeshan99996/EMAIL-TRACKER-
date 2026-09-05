import { describe, it, expect } from 'vitest';
import {
  verifyEmail,
  isValidEmailSyntax,
  isDisposableDomain,
  isRoleAccount,
} from '../lib/verification/email-verifier';

describe('Email Verifier Engine', () => {
  it('should validate RFC syntax correctly', () => {
    expect(isValidEmailSyntax('user@example.com')).toBe(true);
    expect(isValidEmailSyntax('first.last+tag@sub.domain.org')).toBe(true);
    expect(isValidEmailSyntax('invalid-email')).toBe(false);
    expect(isValidEmailSyntax('@no-local-part.com')).toBe(false);
    expect(isValidEmailSyntax('spaces in@email.com')).toBe(false);
  });

  it('should detect known disposable and burner email domains', () => {
    expect(isDisposableDomain('mailinator.com')).toBe(true);
    expect(isDisposableDomain('tempmail.com')).toBe(true);
    expect(isDisposableDomain('10minutemail.com')).toBe(true);
    expect(isDisposableDomain('guerrillamail.com')).toBe(true);
    expect(isDisposableDomain('yopmail.com')).toBe(true);
    expect(isDisposableDomain('trashmail.net')).toBe(true);
    expect(isDisposableDomain('gmail.com')).toBe(false);
    expect(isDisposableDomain('outlook.com')).toBe(false);
  });

  it('should identify role-based and spam trap accounts', () => {
    expect(isRoleAccount('abuse')).toBe(true);
    expect(isRoleAccount('spamtrap')).toBe(true);
    expect(isRoleAccount('postmaster')).toBe(true);
    expect(isRoleAccount('john.doe')).toBe(false);
  });

  it('should reject disposable emails in full verifyEmail pipeline', async () => {
    const result = await verifyEmail('spammer123@mailinator.com');
    expect(result.isValid).toBe(false);
    expect(result.isDisposable).toBe(true);
    expect(result.isDeliverable).toBe(false);
    expect(result.score).toBe(0);
    expect(result.reason).toContain('Fake, disposable, or non-existent recipient');
  });

  it('should verify legitimate domains like google.com or gmail.com', async () => {
    const result = await verifyEmail('testuser@gmail.com');
    expect(result.isValid).toBe(true);
    expect(result.isDisposable).toBe(false);
    expect(result.hasMxRecords).toBe(true);
    expect(result.isDeliverable).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it('should detect synthetic and disposable test emails from user', async () => {
    const email1 = await verifyEmail('abcdsumphatyw230123@gmail.com');
    expect(email1.isValid).toBe(false);
    expect(email1.isDisposable).toBe(true);

    const email2 = await verifyEmail('akfood123@gmail.com');
    expect(email2.isValid).toBe(false);
    expect(email2.isDisposable).toBe(true);

    const email3 = await verifyEmail('tijiwe3710@crybio.com');
    expect(email3.isValid).toBe(false);
    expect(email3.isDisposable).toBe(true);
  });

  it('should detect non-existent domains without MX records', async () => {
    const result = await verifyEmail('user@nonexistent-mx-server-9988221199.org');
    expect(result.isValid).toBe(false);
    expect(result.hasMxRecords).toBe(false);
    expect(result.isDeliverable).toBe(false);
    expect(result.reason).toContain('does not exist or has no active mail servers');
  });
});

import { describe, it, expect } from 'vitest';
import { createEmailSchema } from '../lib/validation/email-schema';

describe('Email API Schema Validation', () => {
  it('should validate valid email payload', () => {
    const validPayload = {
      to: 'client@example.com',
      recipientName: 'Valued Client',
      subject: 'Website Development Proposal',
      html: '<p>Hello <a href="https://example.com">Link</a></p>',
    };

    const result = createEmailSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject invalid recipient email', () => {
    const invalidPayload = {
      to: 'not-an-email',
      subject: 'Test Subject',
      html: '<p>Test</p>',
    };

    const result = createEmailSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should reject missing subject or HTML', () => {
    const invalidPayload = {
      to: 'client@example.com',
      subject: '',
      html: '',
    };

    const result = createEmailSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});

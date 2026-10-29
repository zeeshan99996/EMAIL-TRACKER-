import { describe, it, expect } from 'vitest';
import { createSmtpTransporter } from '@/lib/mail/smtp';

describe('Gmail App Password Sanitization & Transporter', () => {
  it('should aggressively sanitize 16-character app passwords with spaces, dashes, or quotes', () => {
    const rawPass = ' abcd-efgh  ijkl  mnop ';
    const cleanPassword = rawPass.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();

    expect(cleanPassword).toBe('abcdefghijklmnop');
    expect(cleanPassword.length).toBe(16);
  });

  it('should sanitize app password containing non-breaking spaces or unicode quotes', () => {
    const rawWithUnicode = '\u00A0abcd\u200Befgh\u00A0ijkl\u00A0mnop\u00A0';
    const cleanPassword = rawWithUnicode.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();

    expect(cleanPassword).toBe('abcdefghijklmnop');
    expect(cleanPassword.length).toBe(16);
  });

  it('should properly configure nodemailer transporter with SNI servername for Gmail', () => {
    const transporter = createSmtpTransporter('muhammadzeeshan0477@gmail.com', 'abcd efgh ijkl mnop');

    expect(transporter).toBeDefined();
    expect(transporter.options).toBeDefined();
    // @ts-ignore
    expect(transporter.options.host).toBe('smtp.gmail.com');
    // @ts-ignore
    expect(transporter.options.port).toBe(465);
    // @ts-ignore
    expect(transporter.options.secure).toBe(true);
    // @ts-ignore
    expect(transporter.options.tls?.servername).toBe('smtp.gmail.com');
    // @ts-ignore
    expect(transporter.options.auth?.user).toBe('muhammadzeeshan0477@gmail.com');
    // @ts-ignore
    expect(transporter.options.auth?.pass).toBe('abcdefghijklmnop');
  });

  it('should support STARTTLS on port 587 when secure is false', () => {
    const transporter = createSmtpTransporter('user@gmail.com', 'abcd efgh ijkl mnop', {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
    });

    expect(transporter).toBeDefined();
    // @ts-ignore
    expect(transporter.options.port).toBe(587);
    // @ts-ignore
    expect(transporter.options.secure).toBe(false);
    // @ts-ignore
    expect(transporter.options.requireTLS).toBe(true);
  });
});

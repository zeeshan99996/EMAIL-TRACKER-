import nodemailer from 'nodemailer';

export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
}

export function createSmtpTransporter(email: string, appPassword: string, config?: SmtpConfig) {
  // Clean spaces from app password if present (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const cleanPassword = appPassword.replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: config?.host || 'smtp.gmail.com',
    port: config?.port || 465,
    secure: config?.secure !== undefined ? config.secure : true, // Use SSL by default
    auth: {
      user: email,
      pass: cleanPassword,
    },
  });
}

/**
 * Validates that the provided email and app password can connect to SMTP
 */
export async function verifySmtpCredentials(email: string, appPassword: string, config?: SmtpConfig): Promise<boolean> {
  const transporter = createSmtpTransporter(email, appPassword, config);
  return new Promise((resolve, reject) => {
    transporter.verify((error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Sends an email using Gmail SMTP with App Password
 */
export async function sendSmtpEmail({
  email,
  appPassword,
  toEmail,
  subject,
  body,
  html,
  inReplyTo,
  references,
  config,
}: {
  email: string;
  appPassword: string;
  toEmail: string;
  subject: string;
  body: string;
  html?: string;
  inReplyTo?: string;
  references?: string;
  config?: SmtpConfig;
}): Promise<{ messageId: string }> {
  const transporter = createSmtpTransporter(email, appPassword, config);

  const info = await transporter.sendMail({
    from: email,
    to: toEmail,
    subject,
    text: body,
    html: html || undefined,
    inReplyTo: inReplyTo || undefined,
    references: references || undefined,
  });

  return {
    messageId: info.messageId || `<${Date.now()}@gmail.com>`,
  };
}

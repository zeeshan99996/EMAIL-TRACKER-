import nodemailer from 'nodemailer';

export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
}

export function createSmtpTransporter(email: string, appPassword: string, config?: SmtpConfig) {
  // Safe password handling:
  // If it's a Gmail App Password format (e.g. 16 chars with spaces), strip spaces.
  // For standard passwords (Hostinger, custom domain), trim outer spaces without altering inner characters.
  const trimmed = (appPassword || '').trim();
  const isGmailAppPass = (!config?.host || config.host.includes('gmail.com')) && trimmed.replace(/\s+/g, '').length === 16;
  const cleanPassword = isGmailAppPass ? trimmed.replace(/\s+/g, '') : trimmed;

  const port = config?.port || (config?.secure === false ? 587 : 465);
  const secure = config?.secure !== undefined ? config.secure : port === 465;

  return nodemailer.createTransport({
    host: config?.host || 'smtp.gmail.com',
    port,
    secure,
    requireTLS: !secure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
      servername: config?.host,
    },
    auth: {
      user: email.trim(),
      pass: cleanPassword,
    },
  });
}

export interface SmtpVerifySuccess {
  success: true;
  workingHost: string;
  workingPort: number;
  workingSecure: boolean;
}

function isAuthError(err: any): boolean {
  if (!err) return false;
  const code = err.code || '';
  const responseCode = err.responseCode || 0;
  const msg = (err.message || '').toLowerCase();
  const resp = (err.response || '').toLowerCase();
  return (
    code === 'EAUTH' ||
    responseCode === 535 ||
    msg.includes('535') ||
    msg.includes('auth') ||
    msg.includes('credential') ||
    msg.includes('password') ||
    resp.includes('535') ||
    resp.includes('authentication')
  );
}

function verifySingle(transporter: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error('SMTP connection timed out after 10 seconds'));
      }
    }, 10000);

    transporter.verify((error: any) => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        if (error) reject(error);
        else resolve(true);
      }
    });
  });
}

/**
 * Validates that the provided email and password can connect to SMTP.
 * Automatically tries fallback port (465 <-> 587) if network/firewall prevents connection on first port.
 * For Hostinger accounts, also automatically tests Titan Email (smtp.titan.email) if smtp.hostinger.com rejects credentials.
 */
export async function verifySmtpCredentials(
  email: string,
  appPassword: string,
  config?: SmtpConfig
): Promise<SmtpVerifySuccess> {
  const host = config?.host || 'smtp.gmail.com';
  const initialPort = config?.port || (config?.secure === false ? 587 : 465);
  const initialSecure = config?.secure !== undefined ? config.secure : initialPort === 465;

  // 1. Try initial config
  const transporter1 = createSmtpTransporter(email, appPassword, {
    host,
    port: initialPort,
    secure: initialSecure,
  });

  try {
    await verifySingle(transporter1);
    return { success: true, workingHost: host, workingPort: initialPort, workingSecure: initialSecure };
  } catch (err1: any) {
    console.warn(`[SMTP Verify] Port ${initialPort} on ${host} failed:`, err1.message, err1.code);

    // If it's an authentication error on Hostinger, test if this mailbox is hosted on Titan Email (smtp.titan.email)
    if (isAuthError(err1)) {
      if (host.includes('hostinger')) {
        console.info(`[SMTP Verify] smtp.hostinger.com rejected auth. Testing if account is on Titan Email (smtp.titan.email)...`);
        try {
          const titanTransporter = createSmtpTransporter(email, appPassword, {
            host: 'smtp.titan.email',
            port: 465,
            secure: true,
          });
          await verifySingle(titanTransporter);
          console.info(`[SMTP Verify] Successfully connected via Titan Email (smtp.titan.email)!`);
          return {
            success: true,
            workingHost: 'smtp.titan.email',
            workingPort: 465,
            workingSecure: true,
          };
        } catch (titanErr: any) {
          console.warn(`[SMTP Verify] Titan Email attempt also failed:`, titanErr.message);
        }
      }

      const isHostinger = host.includes('hostinger') || host.includes('titan');
      const authMessage = isHostinger
        ? `Hostinger Authentication Failed: Invalid email or password for ${email}. Both Hostinger Webmail (smtp.hostinger.com) and Titan Email (smtp.titan.email) rejected the credentials. Please verify your Hostinger Mailbox password at https://mail.hostinger.com, or reset it in Hostinger hPanel (Emails -> Manage -> Change Password).`
        : `Authentication failed: Invalid email or password for ${email}.`;
      const enhancedErr = new Error(authMessage);
      (enhancedErr as any).code = 'EAUTH';
      (enhancedErr as any).originalError = err1.message;
      throw enhancedErr;
    }

    // Otherwise, it was a network/TLS/timeout error. Attempt alternate port on the same host!
    const fallbackPort = initialPort === 465 ? 587 : 465;
    const fallbackSecure = fallbackPort === 465;

    console.info(`[SMTP Verify] Attempting fallback to port ${fallbackPort} (secure: ${fallbackSecure})...`);

    const transporter2 = createSmtpTransporter(email, appPassword, {
      host,
      port: fallbackPort,
      secure: fallbackSecure,
    });

    try {
      await verifySingle(transporter2);
      console.info(`[SMTP Verify] Fallback to port ${fallbackPort} succeeded!`);
      return { success: true, workingHost: host, workingPort: fallbackPort, workingSecure: fallbackSecure };
    } catch (err2: any) {
      console.error(`[SMTP Verify] Fallback port ${fallbackPort} also failed:`, err2.message);

      if (isAuthError(err2)) {
        if (host.includes('hostinger')) {
          try {
            const titanTransporter = createSmtpTransporter(email, appPassword, {
              host: 'smtp.titan.email',
              port: 465,
              secure: true,
            });
            await verifySingle(titanTransporter);
            return {
              success: true,
              workingHost: 'smtp.titan.email',
              workingPort: 465,
              workingSecure: true,
            };
          } catch {}
        }

        const isHostinger = host.includes('hostinger') || host.includes('titan');
        const authMessage = isHostinger
          ? `Hostinger Authentication Failed: Invalid email or password for ${email}. Please check your Hostinger Mailbox password at https://mail.hostinger.com or reset it in Hostinger hPanel.`
          : `Authentication failed: Invalid email or password for ${email}.`;
        const enhancedErr = new Error(authMessage);
        (enhancedErr as any).code = 'EAUTH';
        throw enhancedErr;
      }

      // Both ports failed network connection
      throw new Error(
        `Failed to connect to SMTP server ${host}. Tried Port ${initialPort} (${err1.message}) and Port ${fallbackPort} (${err2.message}). Please verify that your SMTP host is correct and not blocked.`
      );
    }
  }
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

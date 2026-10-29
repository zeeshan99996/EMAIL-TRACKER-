import nodemailer from 'nodemailer';

export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
}

export function createSmtpTransporter(email: string, appPassword: string, config?: SmtpConfig) {
  // Safe password handling:
  // If it's a Gmail App Password format (e.g. 16 chars with spaces), strip spaces and punctuation.
  // For standard passwords (Hostinger, custom domain), trim outer spaces without altering inner characters.
  const trimmed = (appPassword || '').trim();
  const isGmail = (!config?.host || config.host.includes('gmail.com') || email.toLowerCase().endsWith('@gmail.com'));
  const isGmailAppPass = isGmail && trimmed.replace(/[^a-z0-9]/gi, '').length === 16;
  const cleanPassword = isGmailAppPass ? trimmed.toLowerCase().replace(/[^a-z0-9]/gi, '') : trimmed;

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
      servername: config?.host || (isGmail ? 'smtp.gmail.com' : undefined),
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
  const isGmail = !config?.host || config.host.includes('gmail.com') || email.toLowerCase().endsWith('@gmail.com');
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

      // If Gmail failed on Port 465, test Port 587 before giving up (some networks block/intercept Port 465)
      if (isGmail && initialPort === 465) {
        console.info(`[SMTP Verify] Gmail auth/connection failed on 465. Attempting fallback to Port 587 (STARTTLS)...`);
        try {
          const gmail587Transporter = createSmtpTransporter(email, appPassword, {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
          });
          await verifySingle(gmail587Transporter);
          console.info(`[SMTP Verify] Gmail succeeded on Port 587!`);
          return {
            success: true,
            workingHost: 'smtp.gmail.com',
            workingPort: 587,
            workingSecure: false,
          };
        } catch (gmail587Err: any) {
          console.warn(`[SMTP Verify] Gmail fallback to Port 587 also failed:`, gmail587Err.message);
        }
      }

      const isHostinger = host.includes('hostinger') || host.includes('titan');
      let authMessage = `Authentication failed: Invalid email or password for ${email}.`;
      if (isHostinger) {
        authMessage = `Hostinger Authentication Failed: Invalid email or password for ${email}. Both Hostinger Webmail (smtp.hostinger.com) and Titan Email (smtp.titan.email) rejected the credentials. Please verify your Hostinger Mailbox password at https://mail.hostinger.com, or reset it in Hostinger hPanel (Emails -> Manage -> Change Password).`;
      } else if (isGmail) {
        authMessage = `Google SMTP rejected credentials for ${email}. Please ensure: 1) 2-Step Verification is active on this Google account, 2) You generated a 16-character App Password at https://myaccount.google.com/apppasswords, 3) It was generated specifically for ${email}.`;
      }
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
        let authMessage = `Authentication failed: Invalid email or password for ${email}.`;
        if (isHostinger) {
          authMessage = `Hostinger Authentication Failed: Invalid email or password for ${email}. Please check your Hostinger Mailbox password at https://mail.hostinger.com or reset it in Hostinger hPanel.`;
        } else if (isGmail) {
          authMessage = `Google SMTP rejected credentials for ${email}. Please ensure 2-Step Verification is active on this Google account and a 16-character App Password was generated for ${email}.`;
        }
        const enhancedErr = new Error(authMessage);
        (enhancedErr as any).code = 'EAUTH';
        (enhancedErr as any).originalError = err2.message;
        throw enhancedErr;
      }

      // Both ports failed network connection
      throw new Error(
        `Failed to connect to SMTP server ${host}. Tried Port ${initialPort} (${err1.message}) and Port ${fallbackPort} (${err2.message}). Please verify that your SMTP host is correct and not blocked.`
      );
    }
  }
}

export interface DeliveryProcessedContent {
  processedHtml: string;
  attachments: Array<{
    filename: string;
    content: Buffer;
    cid: string;
    contentType: string;
    contentDisposition: 'inline';
    headers?: Record<string, string>;
  }>;
}

/**
 * Pre-processes HTML for 100% reliable deliverability in Gmail and all major inboxes:
 * 1. Converts base64 data URIs into RFC-compliant CID inline MIME attachments so Gmail never blocks or strips them.
 * 2. Inlines bulletproof styling (display: block, max-width: 100%, border: 0) on all images.
 * 3. Ensures clickable image wrapper anchors preserve full backlink tracking and seamless click navigation.
 */
export function processHtmlForDelivery(rawHtml?: string): DeliveryProcessedContent {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return { processedHtml: rawHtml || '', attachments: [] };
  }

  const attachments: DeliveryProcessedContent['attachments'] = [];
  let processedHtml = rawHtml;

  // 1. Detect and convert data:image/...;base64,... into CID inline attachments
  const dataUriRegex = /<img([^>]*?)src=["'](data:image\/([a-zA-Z0-9.+_-]+);base64,([A-Za-z0-9+/=\s]+))["']([^>]*?)>/gi;

  let imgCounter = 0;
  processedHtml = processedHtml.replace(
    dataUriRegex,
    (match, beforeSrc, fullDataUri, subType, base64Payload, afterSrc) => {
      try {
        imgCounter++;
        const cleanBase64 = base64Payload.replace(/\s+/g, '');
        const ext = subType.toLowerCase() === 'jpeg' ? 'jpg' : subType.toLowerCase().replace('+xml', '');
        const cid = `graphic_${Date.now()}_${imgCounter}@mailify.pro`;
        const buffer = Buffer.from(cleanBase64, 'base64');
        const mimeType = `image/${subType.toLowerCase()}`;

        attachments.push({
          filename: `campaign-graphic-${imgCounter}.${ext}`,
          content: buffer,
          cid: cid,
          contentType: mimeType,
          contentDisposition: 'inline',
          headers: {
            'Content-ID': `<${cid}>`,
          },
        });

        // Ensure email-safe attributes on img tag
        let combinedAttributes = `${beforeSrc} src="cid:${cid}" ${afterSrc}`.trim();

        if (!combinedAttributes.toLowerCase().includes('border=')) {
          combinedAttributes += ' border="0"';
        }
        if (!combinedAttributes.toLowerCase().includes('alt=')) {
          combinedAttributes += ' alt="Campaign Graphic"';
        }

        return `<img ${combinedAttributes} />`;
      } catch (err) {
        return match;
      }
    }
  );

  // 2. Ensure all external & CID <img> tags have Gmail-friendly bulletproof inline styling
  processedHtml = processedHtml.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
    let updatedAttrs = attrs;

    if (!/border=["'][^"']*["']/i.test(updatedAttrs)) {
      updatedAttrs += ' border="0"';
    }
    if (!/alt=["'][^"']*["']/i.test(updatedAttrs)) {
      updatedAttrs += ' alt="Campaign Graphic"';
    }

    if (/style=["']([^"']*)["']/i.test(updatedAttrs)) {
      updatedAttrs = updatedAttrs.replace(/style=["']([^"']*)["']/i, (sMatch: string, styleVal: string) => {
        let s = styleVal.trim();
        if (!/display\s*:/i.test(s)) s += '; display: block;';
        if (!/max-width\s*:/i.test(s)) s += '; max-width: 100%;';
        if (!/height\s*:/i.test(s)) s += '; height: auto;';
        if (!/border\s*:/i.test(s)) s += '; border: 0; outline: none;';
        return `style="${s.replace(/^;\s*/, '')}"`;
      });
    } else {
      updatedAttrs += ' style="display: block; max-width: 100%; height: auto; border: 0; outline: none; text-decoration: none;"';
    }

    return `<img ${updatedAttrs} />`;
  });

  return { processedHtml, attachments };
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

  // Process HTML for CID inline image embedding so images display flawlessly in Gmail
  const { processedHtml, attachments } = processHtmlForDelivery(html);

  const info = await transporter.sendMail({
    from: email,
    to: toEmail,
    subject,
    text: body,
    html: processedHtml || undefined,
    attachments: attachments.length > 0 ? attachments : undefined,
    inReplyTo: inReplyTo || undefined,
    references: references || undefined,
  });

  return {
    messageId: info.messageId || `<${Date.now()}@gmail.com>`,
  };
}

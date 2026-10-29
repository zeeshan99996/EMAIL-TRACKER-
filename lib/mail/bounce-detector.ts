/**
 * Mailify Pro - Email Bounce & Delivery Failure Detection Engine
 * Accurately analyzes incoming emails from mailer-daemon, postmaster, and mail delivery subsystems
 * to extract failed recipient addresses and SMTP bounce codes (e.g. 550 5.1.1 Address not found).
 */

export interface DetectedBounce {
  isBounce: boolean;
  failedRecipient?: string;
  bounceReason?: string;
  statusCode?: string;
  rawSnippet?: string;
}

/**
 * Checks if a message is an automated Delivery Status Notification (DSN) / Bounce.
 */
export function detectBounceFromMessage(
  sender: string,
  subject: string,
  body: string
): DetectedBounce {
  const sLower = (sender || '').toLowerCase().trim();
  const subjLower = (subject || '').toLowerCase().trim();
  const bLower = (body || '').toLowerCase().trim();

  // 1. Sender criteria
  const isBounceSender =
    sLower.includes('mailer-daemon') ||
    sLower.includes('postmaster') ||
    sLower.includes('mail delivery subsystem') ||
    sLower.includes('mailer-daemon@google.com') ||
    sLower.includes('mailer-daemon@googlemail.com') ||
    sLower.includes('mail delivery') ||
    sLower.includes('daemon');

  // 2. Subject criteria
  const isBounceSubject =
    subjLower.includes('delivery status notification') ||
    subjLower.includes('address not found') ||
    subjLower.includes('undelivered mail') ||
    subjLower.includes('mail delivery failed') ||
    subjLower.includes('failure notice') ||
    subjLower.includes('returned mail') ||
    subjLower.includes('could not be delivered') ||
    subjLower.includes('undeliverable') ||
    subjLower.includes('delivery failure');

  // 3. Body criteria
  const hasBounceKeywords =
    bLower.includes('550 5.1.1') ||
    bLower.includes('550-5.1.1') ||
    bLower.includes('the email account that you tried to reach does not exist') ||
    bLower.includes("address couldn't be found") ||
    bLower.includes('unable to receive mail') ||
    bLower.includes('recipient rejected') ||
    bLower.includes('user unknown') ||
    bLower.includes('action: failed') ||
    bLower.includes('status: 5.1.1') ||
    bLower.includes('nosuchuser');

  if (!isBounceSender && !isBounceSubject && !hasBounceKeywords) {
    return { isBounce: false };
  }

  // 4. Extract failed recipient email
  const recipientPatterns = [
    // Gmail: "Your message wasn't delivered to erhatechnologisai@gmail.com because..."
    /(?:wasn'?t delivered to|failed to deliver to|delivered to|unable to deliver to)\s+<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i,
    // RFC DSN: "Final-Recipient: rfc822; user@example.com"
    /Final-Recipient:\s*(?:rfc822;\s*)?<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i,
    // Original-Recipient: rfc822; user@example.com
    /Original-Recipient:\s*(?:rfc822;\s*)?<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i,
    // "account that you tried to reach does not exist: user@example.com"
    /(?:account that you tried to reach|tried to reach)\s*[:\(]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    // "To: user@example.com"
    /\bto:\s*<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i,
    // Generic bracketed email
    /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/i,
  ];

  let failedRecipient: string | undefined;

  for (const pattern of recipientPatterns) {
    const matches = Array.from(body.matchAll(new RegExp(pattern.source, 'gi')));
    for (const match of matches) {
      if (match && match[1]) {
        const candidate = match[1].toLowerCase().trim();
        // Ignore daemon addresses
        if (
          !candidate.includes('mailer-daemon') &&
          !candidate.includes('postmaster') &&
          !candidate.includes('google.com') &&
          !candidate.includes('example.com')
        ) {
          failedRecipient = candidate;
          break;
        }
      }
    }
    if (failedRecipient) break;
  }

  // Fallback: search anywhere in body for an email that isn't mailer-daemon/google
  if (!failedRecipient) {
    const allEmails = body.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi) || [];
    for (const email of allEmails) {
      const eClean = email.toLowerCase().trim();
      if (!eClean.includes('mailer-daemon') && !eClean.includes('google.com') && !eClean.includes('postmaster')) {
        failedRecipient = eClean;
        break;
      }
    }
  }

  // 5. Determine precise bounce reason
  let bounceReason = '550 5.1.1 Address not found (The email account does not exist)';
  let statusCode = '550';

  if (body.includes('550 5.1.1') || bLower.includes('does not exist') || bLower.includes('nosuchuser')) {
    bounceReason = '550 5.1.1 The email account does not exist (Address not found)';
    statusCode = '550 5.1.1';
  } else if (bLower.includes('mailbox full') || bLower.includes('quota exceeded') || bLower.includes('552')) {
    bounceReason = '552 Mailbox full or storage quota exceeded';
    statusCode = '552';
  } else if (bLower.includes('rejected') || bLower.includes('blocked') || bLower.includes('spam')) {
    bounceReason = '550 Blocked or rejected by recipient policy';
    statusCode = '550';
  } else if (bLower.includes('dns') || bLower.includes('domain not found') || bLower.includes('host not found')) {
    bounceReason = '550 Recipient domain does not exist or has invalid DNS';
    statusCode = '550';
  }

  return {
    isBounce: true,
    failedRecipient,
    bounceReason,
    statusCode,
    rawSnippet: body.slice(0, 200).replace(/\s+/g, ' ').trim(),
  };
}

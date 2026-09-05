/**
 * Credential Redaction & Sanitization Engine
 * Policy: Sensitive credentials are server-side only and are never returned to the client.
 */

export function sanitizeAccountForClient(account: any): any {
  if (!account) return null;

  const {
    access_token,
    refresh_token,
    password,
    appPassword,
    ...safeAccount
  } = account;

  // If metadata exists, redact any SMTP/IMAP passwords in metadata
  if (safeAccount.metadata) {
    const { password: metaPass, appPassword: metaAppPass, ...safeMetadata } = safeAccount.metadata;
    safeAccount.metadata = safeMetadata;
  }

  // If warmup object exists and has nested email_account, sanitize it
  if (safeAccount.warmup) {
    const safeWarmup = { ...safeAccount.warmup };
    if (safeWarmup.email_account) {
      safeWarmup.email_account = sanitizeAccountForClient(safeWarmup.email_account);
    }
    safeAccount.warmup = safeWarmup;
  }

  return safeAccount;
}

export function sanitizeCampaignForClient(campaign: any): any {
  if (!campaign) return null;

  const sanitized = { ...campaign };
  if (sanitized.target_account) {
    sanitized.target_account = sanitizeAccountForClient(sanitized.target_account);
  }
  if (Array.isArray(sanitized.peers)) {
    sanitized.peers = sanitized.peers.map((p: any) => ({
      ...p,
      email_account: sanitizeAccountForClient(p.email_account),
    }));
  }

  return sanitized;
}

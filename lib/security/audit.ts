import { localDb } from '@/lib/db/store';

export type SecurityAuditEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_SIGNOUT'
  | 'OAUTH_CONNECT_ATTEMPT'
  | 'OAUTH_CALLBACK_SUCCESS'
  | 'OAUTH_STATE_INVALID'
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_DELETED'
  | 'ACCOUNT_DISCONNECTED'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'FORBIDDEN_RESOURCE_ACCESS'
  | 'CRON_AUTH_SUCCESS'
  | 'CRON_AUTH_FAILED';

export interface SecurityAuditLog {
  event: SecurityAuditEventType;
  userId?: string | null;
  ip?: string | null;
  path?: string | null;
  details?: Record<string, any>;
  timestamp?: string;
}

/**
 * Sanitizes any object before logging to guarantee tokens, passwords, and secrets are NEVER logged.
 */
function sanitizeAuditDetails(details?: Record<string, any>): Record<string, any> {
  if (!details) return {};
  const forbiddenKeys = ['password', 'apppassword', 'token', 'access_token', 'refresh_token', 'secret', 'key', 'credential'];
  const sanitized: Record<string, any> = {};

  for (const [k, v] of Object.entries(details)) {
    if (forbiddenKeys.some(f => k.toLowerCase().includes(f))) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = sanitizeAuditDetails(v);
    } else {
      sanitized[k] = v;
    }
  }

  return sanitized;
}

/**
 * Records a security audit event
 */
export function logSecurityEvent(log: SecurityAuditLog) {
  const sanitizedDetails = sanitizeAuditDetails(log.details);
  const timestamp = log.timestamp || new Date().toISOString();

  const logEntry = {
    event: log.event,
    userId: log.userId || 'anonymous',
    ip: log.ip || 'unknown',
    path: log.path || '',
    details: sanitizedDetails,
    timestamp,
  };

  // 1. Structured console log
  console.log(`[SECURITY AUDIT] ${timestamp} [${log.event}] User:${logEntry.userId} Path:${logEntry.path}`, JSON.stringify(sanitizedDetails));

  // 2. Also record to local db events if user ID is known
  if (log.userId && log.userId !== 'anonymous') {
    try {
      localDb.insertEvent({
        user_id: log.userId,
        source_account_id: 'security_audit',
        target_account_id: 'security_audit',
        event_type: 'job_completed',
        status: log.event.includes('FAILED') || log.event.includes('UNAUTHORIZED') || log.event.includes('FORBIDDEN') ? 'error' : 'success',
        metadata: {
          audit_type: log.event,
          path: log.path,
          ...sanitizedDetails,
        },
      });
    } catch {
      // ignore
    }
  }
}

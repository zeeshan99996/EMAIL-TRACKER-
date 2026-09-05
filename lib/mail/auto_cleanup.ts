import { decryptToken } from '@/lib/crypto/encryption';
import { localDb } from '@/lib/db/store';
import { targetedLocalDb } from '@/lib/db/targeted_store';
import { trashThread } from '@/lib/google/gmail';
import { deleteImapWarmupMessages } from './imap';

export interface CleanupResult {
  accountId: string;
  email: string;
  deletedCount: number;
}

/**
 * Automatically deletes only warmup messages and completed threads for a user's fleet
 */
export async function runAutoCleanupForUser(userId: string): Promise<CleanupResult[]> {
  const accounts = localDb.getAccounts(userId).filter((a) => a.status === 'connected');
  if (accounts.length === 0) return [];

  const fleetEmails = accounts.map((a) => a.email);
  const results: CleanupResult[] = [];

  // Get completed thread IDs from standard & targeted warmup jobs
  const standardJobs = localDb.getJobs(userId).filter((j) => j.status === 'completed' && j.gmail_thread_id);
  const targetedCampaigns = targetedLocalDb.getCampaigns(userId);
  const targetedJobs: any[] = [];
  for (const c of targetedCampaigns) {
    targetedJobs.push(...targetedLocalDb.getAllJobs(c.id).filter((j) => j.status === 'completed' && j.gmail_thread_id));
  }

  const completedThreadIds = Array.from(
    new Set([
      ...standardJobs.map((j) => j.gmail_thread_id!),
      ...targetedJobs.map((j) => j.gmail_thread_id!),
    ])
  );

  for (const account of accounts) {
    let deletedCount = 0;

    try {
      if (account.provider === 'gmail') {
        // Delete completed warmup threads for this Gmail OAuth account
        for (const threadId of completedThreadIds) {
          const success = await trashThread({ accountId: account.id, threadId });
          if (success) deletedCount++;
        }
      } else {
        // IMAP / Custom SMTP cleanup
        const appPassword = decryptToken(account.access_token);
        let config;
        if (account.provider === 'custom_smtp' && account.metadata) {
          config = {
            host: account.metadata.imapHost || 'imap.hostinger.com',
            port: Number(account.metadata.imapPort) || 993,
            secure: account.metadata.imapSecurity !== 'starttls',
          };
        }

        deletedCount = await deleteImapWarmupMessages({
          email: account.email,
          appPassword,
          fleetEmails,
          config,
        });
      }

      if (deletedCount > 0) {
        localDb.insertEvent({
          user_id: userId,
          source_account_id: account.id,
          target_account_id: account.id,
          event_type: 'job_completed',
          status: 'info',
          metadata: {
            action: 'warmup_cleaned',
            deletedCount,
            details: `Cleaned up ${deletedCount} completed warmup messages to keep inbox clear.`,
          },
        });
      }

      results.push({
        accountId: account.id,
        email: account.email,
        deletedCount,
      });
    } catch (err: any) {
      console.error(`[Auto Cleanup] Error for ${account.email}:`, err.message);
      results.push({ accountId: account.id, email: account.email, deletedCount: 0 });
    }
  }

  return results;
}

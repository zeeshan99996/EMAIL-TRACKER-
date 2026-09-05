import { ensureDbFile, saveDb, DatabaseSchema } from './store';
import crypto from 'crypto';
import {
  TargetedWarmupCampaign,
  TargetedWarmupPeer,
  TargetedWarmupJob,
  TargetedWarmupEvent,
  TargetedWarmupStat,
  WarmupJobStatus,
  TargetedCampaignStatus,
} from '@/lib/warmup/types';

export const targetedLocalDb = {
  // Campaign
  getCampaigns(userId?: string): TargetedWarmupCampaign[] {
    const db = ensureDbFile();
    const campaigns = db.targeted_warmup_campaigns || [];
    if (!userId) return campaigns;
    return campaigns.filter(c => c.user_id === userId);
  },

  getCampaignByTargetAccountId(accountId: string): TargetedWarmupCampaign | undefined {
    const db = ensureDbFile();
    return (db.targeted_warmup_campaigns || []).find(c => c.target_email_account_id === accountId);
  },

  getCampaignById(campaignId: string): TargetedWarmupCampaign | undefined {
    const db = ensureDbFile();
    return (db.targeted_warmup_campaigns || []).find(c => c.id === campaignId);
  },

  upsertCampaign(campaign: Partial<TargetedWarmupCampaign> & { user_id: string; target_email_account_id: string }): TargetedWarmupCampaign {
    const db = ensureDbFile();
    const existingIndex = db.targeted_warmup_campaigns.findIndex(c => c.id === campaign.id || c.target_email_account_id === campaign.target_email_account_id);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const updated = {
        ...db.targeted_warmup_campaigns[existingIndex],
        ...campaign,
        updated_at: now,
      };
      db.targeted_warmup_campaigns[existingIndex] = updated as TargetedWarmupCampaign;
      saveDb(db);
      return updated as TargetedWarmupCampaign;
    } else {
      const created: TargetedWarmupCampaign = {
        id: campaign.id || crypto.randomUUID(),
        user_id: campaign.user_id,
        target_email_account_id: campaign.target_email_account_id,
        status: campaign.status || 'draft',
        enabled: campaign.enabled !== undefined ? campaign.enabled : true,
        daily_limit: campaign.daily_limit || 50,
        min_delay_minutes: campaign.min_delay_minutes || 2,
        max_delay_minutes: campaign.max_delay_minutes || 5,
        cooldown_minutes: campaign.cooldown_minutes || 10,
        max_messages_per_cycle: campaign.max_messages_per_cycle || 10,
        max_messages_per_thread: campaign.max_messages_per_thread || 4,
        ai_enabled: campaign.ai_enabled !== undefined ? campaign.ai_enabled : true,
        created_at: now,
        updated_at: now,
        started_at: campaign.started_at,
        paused_at: campaign.paused_at,
        stopped_at: campaign.stopped_at,
      };
      db.targeted_warmup_campaigns.push(created);
      saveDb(db);
      return created;
    }
  },

  // Peers
  getPeers(campaignId: string): TargetedWarmupPeer[] {
    const db = ensureDbFile();
    return (db.targeted_warmup_peers || []).filter(p => p.campaign_id === campaignId);
  },

  upsertPeer(peer: Partial<TargetedWarmupPeer> & { campaign_id: string; email_account_id: string }): TargetedWarmupPeer {
    const db = ensureDbFile();
    const existingIndex = db.targeted_warmup_peers.findIndex(p => p.campaign_id === peer.campaign_id && p.email_account_id === peer.email_account_id);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const updated = {
        ...db.targeted_warmup_peers[existingIndex],
        ...peer,
        updated_at: now,
      };
      db.targeted_warmup_peers[existingIndex] = updated as TargetedWarmupPeer;
      saveDb(db);
      return updated as TargetedWarmupPeer;
    } else {
      const created: TargetedWarmupPeer = {
        id: peer.id || crypto.randomUUID(),
        campaign_id: peer.campaign_id,
        email_account_id: peer.email_account_id,
        enabled: peer.enabled !== undefined ? peer.enabled : true,
        status: peer.status || 'queued',
        daily_sent: peer.daily_sent || 0,
        daily_received: peer.daily_received || 0,
        daily_replies: peer.daily_replies || 0,
        created_at: now,
        updated_at: now,
      };
      db.targeted_warmup_peers.push(created);
      saveDb(db);
      return created;
    }
  },

  // Jobs
  getPendingJobs(campaignId?: string): TargetedWarmupJob[] {
    const db = ensureDbFile();
    const now = new Date().toISOString();
    let jobs = (db.targeted_warmup_jobs || []).filter(j => j.status === 'queued' && j.scheduled_at <= now);
    if (campaignId) {
      jobs = jobs.filter(j => j.campaign_id === campaignId);
    }
    return jobs;
  },

  getAllJobs(campaignId: string): TargetedWarmupJob[] {
    const db = ensureDbFile();
    return (db.targeted_warmup_jobs || []).filter(j => j.campaign_id === campaignId);
  },

  upsertJob(job: Partial<TargetedWarmupJob> & { id?: string; campaign_id: string }): TargetedWarmupJob {
    const db = ensureDbFile();
    const existingIndex = job.id ? db.targeted_warmup_jobs.findIndex(j => j.id === job.id) : -1;
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const updated = {
        ...db.targeted_warmup_jobs[existingIndex],
        ...job,
        updated_at: now,
      };
      db.targeted_warmup_jobs[existingIndex] = updated as TargetedWarmupJob;
      saveDb(db);
      return updated as TargetedWarmupJob;
    } else {
      const created = {
        id: job.id || crypto.randomUUID(),
        campaign_id: job.campaign_id,
        source_account_id: job.source_account_id!,
        target_account_id: job.target_account_id!,
        job_type: job.job_type!,
        status: job.status || 'queued',
        scheduled_at: job.scheduled_at || now,
        attempts: job.attempts || 0,
        metadata: job.metadata || {},
        created_at: now,
        updated_at: now,
      };
      db.targeted_warmup_jobs.push(created as TargetedWarmupJob);
      saveDb(db);
      return created as TargetedWarmupJob;
    }
  },

  cancelPendingJobs(campaignId: string) {
    const db = ensureDbFile();
    let modified = false;
    for (const job of (db.targeted_warmup_jobs || [])) {
      if (job.campaign_id === campaignId && job.status === 'queued') {
        job.status = 'cancelled';
        job.updated_at = new Date().toISOString();
        modified = true;
      }
    }
    if (modified) saveDb(db);
  },

  expediteQueuedJobs(campaignId?: string) {
    const db = ensureDbFile();
    let modified = false;
    const now = new Date().toISOString();
    for (const job of (db.targeted_warmup_jobs || [])) {
      if ((!campaignId || job.campaign_id === campaignId) && job.status === 'queued') {
        job.scheduled_at = now;
        job.updated_at = now;
        modified = true;
      }
    }
    if (modified) saveDb(db);
  },

  // Events
  insertEvent(event: Partial<TargetedWarmupEvent> & { campaign_id: string; event_type: string }) {
    const db = ensureDbFile();
    const created = {
      id: crypto.randomUUID(),
      user_id: event.user_id || '',
      campaign_id: event.campaign_id,
      source_account_id: event.source_account_id,
      target_account_id: event.target_account_id,
      event_type: event.event_type as any,
      status: event.status || 'info',
      metadata: event.metadata || {},
      created_at: new Date().toISOString(),
    };
    db.targeted_warmup_events.push(created);
    saveDb(db);
    return created;
  },

  getEvents(campaignId: string): TargetedWarmupEvent[] {
    const db = ensureDbFile();
    return (db.targeted_warmup_events || []).filter(e => e.campaign_id === campaignId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  // Conflict Checking
  isAccountActiveInStandardMode(accountId: string): boolean {
    const db = ensureDbFile();
    const standardAcc = (db.email_warmup_accounts || []).find(a => a.email_account_id === accountId);
    if (!standardAcc) return false;
    
    // Check if the user's standard warmup config is paused or stopped
    const config = (db.email_warmup_configs || []).find(c => c.user_id === standardAcc.user_id);
    if (config && (config.status === 'paused' || config.status === 'stopped' || config.enabled === false)) {
      return false;
    }
    
    return standardAcc.status === 'running';
  },
};

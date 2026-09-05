export type EmailAccountStatus = 'connected' | 'error' | 'disconnected' | 'token_expired';

export interface EmailAccount {
  id: string;
  user_id: string;
  email: string;
  provider: string;
  provider_account_id?: string | null;
  access_token: string;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  status: EmailAccountStatus;
  last_sync_at?: string | null;
  error_message?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type WarmupCampaignStatus = 'active' | 'paused' | 'stopped';

export interface EmailWarmupConfig {
  id: string;
  user_id: string;
  enabled: boolean;
  status: WarmupCampaignStatus;
  daily_limit: number;
  min_delay_minutes: number;
  max_delay_minutes: number;
  max_messages_per_thread: number;
  ai_enabled: boolean;
  warmup_level_max: number;
  created_at: string;
  updated_at: string;
}

export type WarmupAccountStatus = 'queued' | 'running' | 'paused' | 'completed' | 'error' | 'disabled';

export interface EmailWarmupAccount {
  id: string;
  user_id: string;
  warmup_config_id: string;
  email_account_id: string;
  status: WarmupAccountStatus;
  warmup_level: number;
  daily_sent: number;
  daily_received: number;
  daily_replies: number;
  total_sent: number;
  total_received: number;
  total_replies: number;
  next_activity_at?: string | null;
  last_activity_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  paused_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  // Joined relationship
  email_account?: EmailAccount;
}

export type WarmupJobType = 'initial_send' | 'reply_response' | 'check_inbox';
export type WarmupJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface EmailWarmupJob {
  id: string;
  user_id: string;
  warmup_account_id?: string | null;
  source_account_id: string;
  target_account_id: string;
  job_type: WarmupJobType;
  status: WarmupJobStatus;
  scheduled_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  attempts: number;
  locked_at?: string | null;
  idempotency_key?: string | null;
  gmail_thread_id?: string | null;
  gmail_message_id?: string | null;
  metadata?: Record<string, any>;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  // Joined relationships
  source_account?: EmailAccount;
  target_account?: EmailAccount;
}

export type WarmupEventType =
  | 'job_created'
  | 'job_started'
  | 'message_sent'
  | 'message_received'
  | 'response_generated'
  | 'response_sent'
  | 'job_completed'
  | 'job_failed'
  | 'oauth_error'
  | 'rate_limit'
  | 'limit_reached'
  | 'skipped';

export interface EmailWarmupEvent {
  id: string;
  user_id: string;
  warmup_account_id?: string | null;
  source_account_id?: string | null;
  target_account_id?: string | null;
  event_type: WarmupEventType;
  gmail_message_id?: string | null;
  gmail_thread_id?: string | null;
  status: 'success' | 'warning' | 'error' | 'info';
  metadata?: Record<string, any>;
  created_at: string;
  // Joined
  source_account?: { email: string };
  target_account?: { email: string };
}

export interface EmailWarmupStat {
  id: string;
  user_id: string;
  email_account_id: string;
  date: string;
  sent: number;
  received: number;
  replies: number;
  failed: number;
  success_count: number;
  created_at: string;
  updated_at: string;
  email_account?: EmailAccount;
}

export interface WarmupLevelInfo {
  level: number;
  name: string;
  targetDailyVolume: number;
  description: string;
}

export interface DashboardMetrics {
  totalAccounts: number;
  connectedAccounts: number;
  warmupActive: number;
  completedAccounts: number;
  inProgressAccounts: number;
  queuedAccounts: number;
  pausedAccounts: number;
  errorAccounts: number;
  totalSentToday: number;
  totalReceivedToday: number;
  totalRepliesToday: number;
  progressPercentage: number;
}

// ----------------------------------------------------
// TARGETED WARMUP (MODE 2) TYPES
// ----------------------------------------------------

export type TargetedCampaignStatus = 'draft' | 'running' | 'paused' | 'stopped' | 'completed' | 'error';

export interface TargetedWarmupCampaign {
  id: string;
  user_id: string;
  target_email_account_id: string;
  status: TargetedCampaignStatus;
  enabled: boolean;
  daily_limit: number;
  min_delay_minutes: number;
  max_delay_minutes: number;
  cooldown_minutes: number;
  max_messages_per_cycle: number;
  max_messages_per_thread: number;
  ai_enabled: boolean;
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  paused_at?: string | null;
  stopped_at?: string | null;
  // Join
  target_account?: EmailAccount;
}

export interface TargetedWarmupPeer {
  id: string;
  campaign_id: string;
  email_account_id: string;
  enabled: boolean;
  status: WarmupAccountStatus;
  last_activity_at?: string | null;
  next_activity_at?: string | null;
  daily_sent: number;
  daily_received: number;
  daily_replies: number;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  // Join
  email_account?: EmailAccount;
}

export interface TargetedWarmupJob {
  id: string;
  campaign_id: string;
  source_account_id: string;
  target_account_id: string;
  job_type: WarmupJobType;
  status: WarmupJobStatus;
  scheduled_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  attempts: number;
  locked_at?: string | null;
  idempotency_key?: string | null;
  gmail_thread_id?: string | null;
  gmail_message_id?: string | null;
  metadata?: Record<string, any>;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  source_account?: EmailAccount;
  target_account?: EmailAccount;
}

export interface TargetedWarmupEvent {
  id: string;
  user_id: string;
  campaign_id: string;
  source_account_id?: string | null;
  target_account_id?: string | null;
  event_type: WarmupEventType;
  gmail_message_id?: string | null;
  gmail_thread_id?: string | null;
  status: 'success' | 'warning' | 'error' | 'info';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface TargetedWarmupStat {
  id: string;
  user_id: string;
  campaign_id: string;
  email_account_id: string;
  date: string;
  sent: number;
  received: number;
  replies: number;
  failed: number;
  success_count: number;
  created_at: string;
  updated_at: string;
}

export type EmailStatus = 'SENT' | 'OPENED' | 'CLICKED' | 'FAILED';

export type EventType = 'SENT' | 'OPEN' | 'CLICK';

export interface Account {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  account_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  account_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  project_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface Email {
  id: string;
  project_id: string;
  tracking_id: string;
  message_id: string | null;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  original_html: string;
  tracked_html: string;
  sent_at: string;
  first_opened_at: string | null;
  last_opened_at: string | null;
  open_count: number;
  click_count: number;
  status: EmailStatus;
  created_at: string;
  updated_at: string;
}

export interface EmailLink {
  id: string;
  email_id: string;
  original_url: string;
  link_label: string | null;
  link_index: number;
  click_count: number;
  first_clicked_at: string | null;
  last_clicked_at: string | null;
  created_at: string;
}

export interface EmailEvent {
  id: string;
  email_id: string;
  link_id: string | null;
  event_type: EventType;
  occurred_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referer: string | null;
  metadata: Record<string, any> | null;
}

export interface CreateEmailRequest {
  to: string;
  recipientName?: string | null;
  subject: string;
  html: string;
  messageId?: string | null;
}

export interface CreateEmailResponse {
  success: boolean;
  emailId: string;
  trackingId: string;
  status: EmailStatus;
  trackedHtml: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface AnalyticsSummary {
  totalEmails: number;
  trackedOpens: number;
  uniqueOpens: number;
  unopenedEmails: number;
  totalClicks: number;
  uniqueClicks: number;
  openRate: number; // percentage
  clickRate: number; // percentage
}

export interface TopLink {
  id: string;
  original_url: string;
  link_label: string | null;
  totalClicks: number;
  emailSubject: string;
  emailRecipient: string;
}

export interface ActivityEvent {
  id: string;
  event_type: EventType;
  occurred_at: string;
  recipient_email: string;
  email_subject: string;
  email_id: string;
  link_label?: string | null;
  original_url?: string | null;
}

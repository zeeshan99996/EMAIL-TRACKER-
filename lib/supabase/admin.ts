import { createClient } from '@supabase/supabase-js';
import { hashApiKey } from '../security/api-key';
import { processEmailHtml } from '../tracking/html-parser';
import {
  DEMO_API_KEYS,
  DEMO_EMAILS,
  DEMO_EMAIL_EVENTS,
  DEMO_EMAIL_LINKS,
  DEMO_PROJECT,
} from '../demo-store';
import {
  Email,
  EmailEvent,
  EmailLink,
  ApiKey,
  Project,
  CreateEmailRequest,
  CreateEmailResponse,
  AnalyticsSummary,
  ActivityEvent,
  TopLink,
} from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isDemoMode =
  process.env.DEMO_MODE === 'true' ||
  !supabaseUrl ||
  supabaseUrl.includes('mock') ||
  !serviceRoleKey ||
  serviceRoleKey.includes('mock');

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://mock.supabase.co',
  serviceRoleKey || 'mock-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Validates an incoming API Key and updates last_used_at timestamp.
 */
export async function validateApiKey(rawApiKey: string): Promise<ApiKey | null> {
  const keyHash = hashApiKey(rawApiKey);

  if (isDemoMode) {
    const key = DEMO_API_KEYS.find(
      k => (k.key_hash === keyHash || rawApiKey === 'ek_live_demo123456789') && !k.revoked_at
    );
    if (key) {
      key.last_used_at = new Date().toISOString();
      return key;
    }
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .is('revoked_at', null)
    .single();

  if (error || !data) return null;

  // Update last_used_at async
  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  return data as ApiKey;
}

/**
 * Creates and records a new tracked email.
 */
export async function createTrackedEmail(
  projectId: string,
  req: CreateEmailRequest,
  appUrl: string
): Promise<CreateEmailResponse> {
  const { trackingId, trackedHtml, links } = processEmailHtml(req.html, appUrl);
  const now = new Date().toISOString();
  const emailId = `em_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  const newEmail: Email = {
    id: emailId,
    project_id: projectId,
    tracking_id: trackingId,
    message_id: req.messageId || null,
    recipient_email: req.to,
    recipient_name: req.recipientName || null,
    subject: req.subject,
    original_html: req.html,
    tracked_html: trackedHtml,
    sent_at: now,
    first_opened_at: null,
    last_opened_at: null,
    open_count: 0,
    click_count: 0,
    status: 'SENT',
    created_at: now,
    updated_at: now,
  };

  if (isDemoMode) {
    DEMO_EMAILS.unshift(newEmail);

    // Save links
    links.forEach(link => {
      DEMO_EMAIL_LINKS.push({
        id: link.linkId,
        email_id: emailId,
        original_url: link.originalUrl,
        link_label: link.linkLabel,
        link_index: link.linkIndex,
        click_count: 0,
        first_clicked_at: null,
        last_clicked_at: null,
        created_at: now,
      });
    });

    // Save SENT event
    DEMO_EMAIL_EVENTS.unshift({
      id: `evt_${Date.now()}`,
      email_id: emailId,
      link_id: null,
      event_type: 'SENT',
      occurred_at: now,
      ip_address: null,
      user_agent: null,
      referer: null,
      metadata: null,
    });

    return {
      success: true,
      emailId,
      trackingId,
      status: 'SENT',
      trackedHtml,
    };
  }

  // Database mode
  const { data: insertedEmail, error: emailErr } = await supabaseAdmin
    .from('emails')
    .insert({
      project_id: projectId,
      tracking_id: trackingId,
      message_id: req.messageId || null,
      recipient_email: req.to,
      recipient_name: req.recipientName || null,
      subject: req.subject,
      original_html: req.html,
      tracked_html: trackedHtml,
      sent_at: now,
      status: 'SENT',
    })
    .select()
    .single();

  if (emailErr || !insertedEmail) {
    throw new Error(`Failed to store email: ${emailErr?.message}`);
  }

  // Insert links
  if (links.length > 0) {
    const linkInserts = links.map(link => ({
      id: link.linkId,
      email_id: insertedEmail.id,
      original_url: link.originalUrl,
      link_label: link.linkLabel,
      link_index: link.linkIndex,
      click_count: 0,
    }));
    await supabaseAdmin.from('email_links').insert(linkInserts);
  }

  // Insert SENT event
  await supabaseAdmin.from('email_events').insert({
    email_id: insertedEmail.id,
    event_type: 'SENT',
    occurred_at: now,
  });

  return {
    success: true,
    emailId: insertedEmail.id,
    trackingId,
    status: 'SENT',
    trackedHtml,
  };
}

/**
 * Handles an OPEN event for a tracking pixel request.
 */
export async function recordOpenEvent(
  trackingId: string,
  ipAddress?: string | null,
  userAgent?: string | null,
  referer?: string | null
): Promise<boolean> {
  const now = new Date().toISOString();

  if (isDemoMode) {
    const email = DEMO_EMAILS.find(e => e.tracking_id === trackingId);
    if (!email) return false;

    email.open_count += 1;
    if (!email.first_opened_at) email.first_opened_at = now;
    email.last_opened_at = now;
    if (email.status === 'SENT') email.status = 'OPENED';

    DEMO_EMAIL_EVENTS.unshift({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      email_id: email.id,
      link_id: null,
      event_type: 'OPEN',
      occurred_at: now,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      referer: referer || null,
      metadata: null,
    });
    return true;
  }

  // Supabase Mode
  const { data: email } = await supabaseAdmin
    .from('emails')
    .select('id, first_opened_at, open_count, status')
    .eq('tracking_id', trackingId)
    .single();

  if (!email) return false;

  const newStatus = email.status === 'SENT' ? 'OPENED' : email.status;
  const firstOpened = email.first_opened_at || now;

  await supabaseAdmin
    .from('emails')
    .update({
      open_count: email.open_count + 1,
      first_opened_at: firstOpened,
      last_opened_at: now,
      status: newStatus,
    })
    .eq('id', email.id);

  await supabaseAdmin.from('email_events').insert({
    email_id: email.id,
    event_type: 'OPEN',
    occurred_at: now,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    referer: referer || null,
  });

  return true;
}

/**
 * Handles a CLICK event for a tracked link request and returns the original destination URL.
 */
export async function recordClickEvent(
  trackingId: string,
  linkId: string,
  ipAddress?: string | null,
  userAgent?: string | null,
  referer?: string | null
): Promise<string | null> {
  const now = new Date().toISOString();

  if (isDemoMode) {
    const email = DEMO_EMAILS.find(e => e.tracking_id === trackingId);
    if (!email) return null;

    const link = DEMO_EMAIL_LINKS.find(l => l.id === linkId && l.email_id === email.id);
    if (!link) return null;

    // Update email counters
    email.click_count += 1;
    email.status = 'CLICKED';

    // Update link counters
    link.click_count += 1;
    if (!link.first_clicked_at) link.first_clicked_at = now;
    link.last_clicked_at = now;

    // Record Event
    DEMO_EMAIL_EVENTS.unshift({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      email_id: email.id,
      link_id: link.id,
      event_type: 'CLICK',
      occurred_at: now,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      referer: referer || null,
      metadata: { label: link.link_label },
    });

    return link.original_url;
  }

  // Supabase Mode
  const { data: email } = await supabaseAdmin
    .from('emails')
    .select('id, click_count')
    .eq('tracking_id', trackingId)
    .single();

  if (!email) return null;

  const { data: link } = await supabaseAdmin
    .from('email_links')
    .select('*')
    .eq('id', linkId)
    .eq('email_id', email.id)
    .single();

  if (!link) return null;

  // Update email
  await supabaseAdmin
    .from('emails')
    .update({
      click_count: email.click_count + 1,
      status: 'CLICKED',
    })
    .eq('id', email.id);

  // Update link
  await supabaseAdmin
    .from('email_links')
    .update({
      click_count: link.click_count + 1,
      first_clicked_at: link.first_clicked_at || now,
      last_clicked_at: now,
    })
    .eq('id', link.id);

  // Insert event
  await supabaseAdmin.from('email_events').insert({
    email_id: email.id,
    link_id: link.id,
    event_type: 'CLICK',
    occurred_at: now,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    referer: referer || null,
    metadata: { label: link.link_label },
  });

  return link.original_url;
}

/**
 * Dashboard queries & Analytics helper
 */
export async function getDashboardData(projectId: string = DEMO_PROJECT.id) {
  if (isDemoMode) {
    const emails = DEMO_EMAILS.filter(e => e.project_id === projectId);
    const totalEmails = emails.length;
    const trackedOpens = emails.reduce((sum, e) => sum + e.open_count, 0);
    const uniqueOpens = emails.filter(e => e.open_count > 0).length;
    const totalClicks = emails.reduce((sum, e) => sum + e.click_count, 0);
    const uniqueClicks = emails.filter(e => e.click_count > 0).length;

    const openRate = totalEmails > 0 ? Math.round((uniqueOpens / totalEmails) * 100) : 0;
    const clickRate = totalEmails > 0 ? Math.round((uniqueClicks / totalEmails) * 100) : 0;

    const unopenedEmails = Math.max(0, totalEmails - uniqueOpens);

    const summary: AnalyticsSummary = {
      totalEmails,
      trackedOpens,
      uniqueOpens,
      unopenedEmails,
      totalClicks,
      uniqueClicks,
      openRate,
      clickRate,
    };

    // Recent activity
    const activity: ActivityEvent[] = DEMO_EMAIL_EVENTS.map(evt => {
      const email = DEMO_EMAILS.find(e => e.id === evt.email_id);
      const link = DEMO_EMAIL_LINKS.find(l => l.id === evt.link_id);
      return {
        id: evt.id,
        event_type: evt.event_type,
        occurred_at: evt.occurred_at,
        recipient_email: email?.recipient_email || 'Unknown',
        email_subject: email?.subject || 'No Subject',
        email_id: evt.email_id,
        link_label: link?.link_label,
        original_url: link?.original_url,
      };
    });

    // Top Links
    const topLinks: TopLink[] = DEMO_EMAIL_LINKS.map(link => {
      const email = DEMO_EMAILS.find(e => e.id === link.email_id);
      return {
        id: link.id,
        original_url: link.original_url,
        link_label: link.link_label,
        totalClicks: link.click_count,
        emailSubject: email?.subject || 'Unknown Subject',
        emailRecipient: email?.recipient_email || 'Unknown Recipient',
      };
    })
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, 5);

    return {
      summary,
      emails,
      activity: activity.slice(0, 10),
      topLinks,
    };
  }

  // Supabase Mode
  let emailQuery = supabaseAdmin
    .from('emails')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId && projectId !== 'all' && projectId !== DEMO_PROJECT.id) {
    emailQuery = emailQuery.eq('project_id', projectId);
  }

  const { data: emails } = await emailQuery;

  const emailList: Email[] = emails || [];
  const totalEmails = emailList.length;
  const trackedOpens = emailList.reduce((sum, e) => sum + (e.open_count || 0), 0);
  const uniqueOpens = emailList.filter(e => e.open_count > 0).length;
  const totalClicks = emailList.reduce((sum, e) => sum + (e.click_count || 0), 0);
  const uniqueClicks = emailList.filter(e => e.click_count > 0).length;

  const openRate = totalEmails > 0 ? Math.round((uniqueOpens / totalEmails) * 100) : 0;
  const clickRate = totalEmails > 0 ? Math.round((uniqueClicks / totalEmails) * 100) : 0;

  const unopenedEmails = Math.max(0, totalEmails - uniqueOpens);

  const summary: AnalyticsSummary = {
    totalEmails,
    trackedOpens,
    uniqueOpens,
    unopenedEmails,
    totalClicks,
    uniqueClicks,
    openRate,
    clickRate,
  };

  // Get recent events
  const { data: events } = await supabaseAdmin
    .from('email_events')
    .select('*, emails(recipient_email, subject), email_links(link_label, original_url)')
    .order('occurred_at', { ascending: false })
    .limit(10);

  const activity: ActivityEvent[] = (events || []).map((evt: any) => ({
    id: evt.id,
    event_type: evt.event_type,
    occurred_at: evt.occurred_at,
    recipient_email: evt.emails?.recipient_email || 'Unknown',
    email_subject: evt.emails?.subject || 'No Subject',
    email_id: evt.email_id,
    link_label: evt.email_links?.link_label,
    original_url: evt.email_links?.original_url,
  }));

  // Top Links
  const { data: links } = await supabaseAdmin
    .from('email_links')
    .select('*, emails(subject, recipient_email)')
    .order('click_count', { ascending: false })
    .limit(5);

  const topLinks: TopLink[] = (links || []).map((l: any) => ({
    id: l.id,
    original_url: l.original_url,
    link_label: l.link_label,
    totalClicks: l.click_count,
    emailSubject: l.emails?.subject || 'Unknown Subject',
    emailRecipient: l.emails?.recipient_email || 'Unknown Recipient',
  }));

  return {
    summary,
    emails: emailList,
    activity,
    topLinks,
  };
}

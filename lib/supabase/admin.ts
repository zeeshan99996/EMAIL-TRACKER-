import { createClient } from '@supabase/supabase-js';
import { hashApiKey, generateApiKey } from '../security/api-key';
import { processEmailHtml } from '../tracking/html-parser';
import { isFakeOrDisposableEmail } from '../verification/email-verifier';
import {
  getStoreEmails,
  getStoreEmailById,
  addStoreEmail,
  updateStoreEmail,
  addStoreEmailLinks,
  getStoreEmailLinks,
  updateStoreEmailLink,
  addStoreEmailEvent,
  getStoreEmailEvents,
  getStoreApiKeys,
  addStoreApiKey,
  revokeStoreApiKey,
  getStoreProjects,
  addStoreProject,
  deleteStoreEmail,
  DEFAULT_PROJECT,
} from '../store';
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

export function createAdminClient() {
  return supabaseAdmin;
}

/**
 * Validates an incoming API Key and updates last_used_at timestamp.
 */
export async function validateApiKey(rawApiKey: string): Promise<ApiKey | null> {
  const keyHash = hashApiKey(rawApiKey);

  if (isDemoMode) {
    const keys = getStoreApiKeys();
    const key = keys.find(
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
 * Ensures a project exists in Supabase for foreign key consistency.
 */
async function ensureSupabaseProject(projectId: string): Promise<string> {
  // Check if project exists
  const { data: existing } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .single();

  if (existing) {
    return existing.id;
  }

  // Check any project
  const { data: anyProject } = await supabaseAdmin
    .from('projects')
    .select('id')
    .limit(1);

  if (anyProject && anyProject.length > 0) {
    return anyProject[0].id;
  }

  // Create default account first if none exists
  let accountId: string;
  const { data: anyAccount } = await supabaseAdmin.from('accounts').select('id').limit(1);
  if (anyAccount && anyAccount.length > 0) {
    accountId = anyAccount[0].id;
  } else {
    const { data: newAcc, error: accErr } = await supabaseAdmin
      .from('accounts')
      .insert({ name: 'ERHA Technologies' })
      .select()
      .single();
    if (accErr || !newAcc) {
      throw new Error(`Failed to create default account in Supabase: ${accErr?.message}`);
    }
    accountId = newAcc.id;
  }

  // Create default project
  const { data: newPrj, error: prjErr } = await supabaseAdmin
    .from('projects')
    .insert({
      id: projectId === 'prj_demo_01' ? undefined : projectId,
      account_id: accountId,
      name: 'ERHA Technologies Outreach',
      description: 'Primary outbound sales and marketing emails',
    })
    .select()
    .single();

  if (prjErr || !newPrj) {
    throw new Error(`Failed to create default project in Supabase: ${prjErr?.message}`);
  }

  return newPrj.id;
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

  // Email Verifier Interceptor:
  // If recipient is fake, disposable, or non-existent, return success to sender (so Apps Script completes without error),
  // but NEVER persist it to the database so it never appears on the dashboard!
  const fakeCheck = isFakeOrDisposableEmail(req.to);
  if (fakeCheck.isFake) {
    console.log(`[createTrackedEmail] Intercepted fake/disposable recipient "${req.to}" (${fakeCheck.reason}). Skipping persistence.`);
    return {
      success: true,
      emailId,
      trackingId,
      status: 'SENT',
      trackedHtml: req.html,
    };
  }

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
    // Save email in persistent local storage
    addStoreEmail(newEmail);

    // Save links
    const emailLinks: EmailLink[] = links.map(link => ({
      id: link.linkId,
      email_id: emailId,
      original_url: link.originalUrl,
      link_label: link.linkLabel,
      link_index: link.linkIndex,
      click_count: 0,
      first_clicked_at: null,
      last_clicked_at: null,
      created_at: now,
    }));
    addStoreEmailLinks(emailLinks);

    // Save SENT event
    addStoreEmailEvent({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
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

  // Database mode (Supabase PostgreSQL)
  const effectiveProjectId = await ensureSupabaseProject(projectId);

  const { data: insertedEmail, error: emailErr } = await supabaseAdmin
    .from('emails')
    .insert({
      project_id: effectiveProjectId,
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
    throw new Error(`Failed to store email in Supabase: ${emailErr?.message}`);
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
    const { error: linksErr } = await supabaseAdmin.from('email_links').insert(linkInserts);
    if (linksErr) {
      console.error('Error inserting email links into Supabase:', linksErr);
    }
  }

  // Insert SENT event
  const { error: eventErr } = await supabaseAdmin.from('email_events').insert({
    email_id: insertedEmail.id,
    event_type: 'SENT',
    occurred_at: now,
  });
  if (eventErr) {
    console.error('Error inserting SENT event into Supabase:', eventErr);
  }

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
  referer?: string | null,
  skipRecord: boolean = false
): Promise<boolean> {
  if (skipRecord) {
    return false;
  }

  const now = new Date().toISOString();

  if (isDemoMode) {
    const email = getStoreEmailById(trackingId);
    if (!email) return false;

    // Filter out immediate sub-second prefetch echoes within 2s of sending
    if (userAgent?.includes('GoogleImageProxy') && email.sent_at) {
      const elapsedMs = Date.now() - new Date(email.sent_at).getTime();
      if (elapsedMs < 2000) {
        console.log(`[Sender Filter] Ignored immediate prefetch echo within ${elapsedMs}ms of sending`);
        return false;
      }
    }

    const newOpenCount = email.open_count + 1;
    const firstOpened = email.first_opened_at || now;
    const newStatus = email.status === 'SENT' ? 'OPENED' : email.status;

    updateStoreEmail(email.id, {
      open_count: newOpenCount,
      first_opened_at: firstOpened,
      last_opened_at: now,
      status: newStatus,
    });

    addStoreEmailEvent({
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
    .select('id, sent_at, first_opened_at, open_count, status')
    .eq('tracking_id', trackingId)
    .single();

  if (!email) return false;

  // Filter out immediate sub-second prefetch echoes within 2s of sending
  if (userAgent?.includes('GoogleImageProxy') && email.sent_at) {
    const elapsedMs = Date.now() - new Date(email.sent_at).getTime();
    if (elapsedMs < 2000) {
      console.log(`[Sender Filter] Ignored immediate prefetch echo within ${elapsedMs}ms of sending`);
      return false;
    }
  }

  const newStatus = email.status === 'SENT' ? 'OPENED' : email.status;
  const firstOpened = email.first_opened_at || now;

  await supabaseAdmin
    .from('emails')
    .update({
      open_count: (email.open_count || 0) + 1,
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
  referer?: string | null,
  skipRecord: boolean = false
): Promise<string | null> {
  const now = new Date().toISOString();

  if (isDemoMode) {
    const email = getStoreEmailById(trackingId);
    if (!email) return null;

    const links = getStoreEmailLinks(email.id);
    const link = links.find(l => l.id === linkId);
    if (!link) return null;

    if (skipRecord) {
      return link.original_url;
    }

    // A click implies the recipient opened the email (even if spam filters blocked 1x1 pixel image loading)
    const needsOpen = !email.open_count || email.open_count === 0 || !email.first_opened_at;
    const newOpenCount = needsOpen ? ((email.open_count || 0) + 1) : email.open_count;
    const firstOpened = email.first_opened_at || now;

    // Update email counters
    updateStoreEmail(email.id, {
      open_count: newOpenCount,
      first_opened_at: firstOpened,
      last_opened_at: now,
      click_count: email.click_count + 1,
      status: 'CLICKED',
    });

    // Update link counters
    updateStoreEmailLink(link.id, {
      click_count: link.click_count + 1,
      first_clicked_at: link.first_clicked_at || now,
      last_clicked_at: now,
    });

    if (needsOpen) {
      addStoreEmailEvent({
        id: `evt_${Date.now()}_open_implied`,
        email_id: email.id,
        link_id: null,
        event_type: 'OPEN',
        occurred_at: now,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        referer: referer || null,
        metadata: { note: 'Open detected via link click' },
      });
    }

    // Record Event
    addStoreEmailEvent({
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
    .select('id, open_count, first_opened_at, click_count')
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

  if (skipRecord) {
    return link.original_url;
  }

  // A click implies the recipient opened the email (even if spam filters blocked 1x1 pixel image loading)
  const needsOpen = !email.open_count || email.open_count === 0 || !email.first_opened_at;
  const newOpenCount = needsOpen ? ((email.open_count || 0) + 1) : email.open_count;
  const firstOpened = email.first_opened_at || now;

  // Update email
  await supabaseAdmin
    .from('emails')
    .update({
      open_count: newOpenCount,
      first_opened_at: firstOpened,
      last_opened_at: now,
      click_count: (email.click_count || 0) + 1,
      status: 'CLICKED',
    })
    .eq('id', email.id);

  if (needsOpen) {
    await supabaseAdmin.from('email_events').insert({
      email_id: email.id,
      event_type: 'OPEN',
      occurred_at: now,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      referer: referer || null,
      metadata: { note: 'Open detected via link click' },
    });
  }

  // Update link
  await supabaseAdmin
    .from('email_links')
    .update({
      click_count: (link.click_count || 0) + 1,
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
export async function getDashboardData(projectId: string = DEFAULT_PROJECT.id) {
  if (isDemoMode) {
    const allStoreEmails = getStoreEmails(projectId);
    const validEmails: Email[] = [];
    for (const em of allStoreEmails) {
      if (isFakeOrDisposableEmail(em.recipient_email).isFake) {
        deleteStoreEmail(em.id);
      } else {
        validEmails.push(em);
      }
    }
    const emails = validEmails;
    const totalEmails = emails.length;
    const trackedOpens = emails.reduce((sum, e) => sum + (e.open_count || 0), 0);
    const uniqueOpens = emails.filter(e => (e.open_count || 0) > 0).length;
    const totalClicks = emails.reduce((sum, e) => sum + (e.click_count || 0), 0);
    const uniqueClicks = emails.filter(e => (e.click_count || 0) > 0).length;

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
    const allEvents = getStoreEmailEvents();
    const activity: ActivityEvent[] = allEvents
      .filter(evt => {
        const email = emails.find(e => e.id === evt.email_id);
        return email && !isFakeOrDisposableEmail(email.recipient_email).isFake;
      })
      .map(evt => {
        const email = emails.find(e => e.id === evt.email_id);
        const links = email ? getStoreEmailLinks(email.id) : [];
        const link = links.find(l => l.id === evt.link_id);
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
    const allLinks: EmailLink[] = [];
    emails.forEach(e => {
      allLinks.push(...getStoreEmailLinks(e.id));
    });

    const topLinks: TopLink[] = allLinks
      .map(link => {
        const email = emails.find(e => e.id === link.email_id);
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

  if (projectId && projectId !== 'all' && projectId !== DEFAULT_PROJECT.id) {
    emailQuery = emailQuery.eq('project_id', projectId);
  }

  const { data: rawEmails } = await emailQuery;

  // Real-time Email Verifier Auto-Cleaner:
  // Automatically identify fake, disposable, or non-existent emails, permanently purge them from Supabase, and hide them from the dashboard
  const fakeEmailIds: string[] = [];
  const validEmails: Email[] = [];

  for (const em of (rawEmails || [])) {
    const fakeCheck = isFakeOrDisposableEmail(em.recipient_email);
    if (fakeCheck.isFake) {
      fakeEmailIds.push(em.id);
    } else {
      validEmails.push(em);
    }
  }

  // Instantly purge fake emails from Supabase
  if (fakeEmailIds.length > 0) {
    console.log(`[Email Verifier Auto-Cleaner] Purging ${fakeEmailIds.length} fake/disposable emails from database:`, fakeEmailIds);
    try {
      await supabaseAdmin.from('email_events').delete().in('email_id', fakeEmailIds);
      await supabaseAdmin.from('email_links').delete().in('email_id', fakeEmailIds);
      await supabaseAdmin.from('emails').delete().in('id', fakeEmailIds);
    } catch (purgeErr) {
      console.error('[Email Verifier Auto-Cleaner] Purge error:', purgeErr);
    }
  }

  const emailList: Email[] = validEmails;
  const totalEmails = emailList.length;
  const trackedOpens = emailList.reduce((sum, e) => sum + (e.open_count || 0), 0);
  const uniqueOpens = emailList.filter(e => (e.open_count || 0) > 0).length;
  const totalClicks = emailList.reduce((sum, e) => sum + (e.click_count || 0), 0);
  const uniqueClicks = emailList.filter(e => (e.click_count || 0) > 0).length;

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
    .limit(20);

  const activity: ActivityEvent[] = (events || [])
    .filter((evt: any) => !fakeEmailIds.includes(evt.email_id) && !isFakeOrDisposableEmail(evt.emails?.recipient_email || '').isFake)
    .slice(0, 10)
    .map((evt: any) => ({
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
    .limit(10);

  const topLinks: TopLink[] = (links || [])
    .filter((l: any) => !fakeEmailIds.includes(l.email_id) && !isFakeOrDisposableEmail(l.emails?.recipient_email || '').isFake)
    .slice(0, 5)
    .map((l: any) => ({
      id: l.id,
      original_url: l.original_url,
      link_label: l.link_label,
      totalClicks: l.click_count,
      emailSubject: l.emails?.subject || 'Unknown Subject',
      emailRecipient: l.emails?.recipient_email || 'Unknown Recipient',
    }));

  return {
    summary,
    emails: validEmails,
    activity,
    topLinks,
  };
}

/**
 * Gets a single email by ID along with its links and events.
 */
export async function getEmailDetails(id: string) {
  if (isDemoMode) {
    const email = getStoreEmailById(id);
    if (!email) return null;

    const links = getStoreEmailLinks(email.id);
    const events = getStoreEmailEvents(email.id);

    return {
      email,
      links,
      events,
    };
  }

  // Supabase Mode
  const { data: email } = await supabaseAdmin
    .from('emails')
    .select('*')
    .or(`id.eq.${id},tracking_id.eq.${id}`)
    .single();

  if (!email) return null;

  // If email is fake or disposable, purge and return null
  if (isFakeOrDisposableEmail(email.recipient_email).isFake) {
    console.log(`[getEmailDetails] Purging fake email from Supabase: ${email.id} (${email.recipient_email})`);
    try {
      await supabaseAdmin.from('email_events').delete().eq('email_id', email.id);
      await supabaseAdmin.from('email_links').delete().eq('email_id', email.id);
      await supabaseAdmin.from('emails').delete().eq('id', email.id);
    } catch (purgeErr) {
      console.error('[getEmailDetails] Purge error:', purgeErr);
    }
    return null;
  }

  const { data: links } = await supabaseAdmin
    .from('email_links')
    .select('*')
    .eq('email_id', email.id)
    .order('link_index', { ascending: true });

  const { data: events } = await supabaseAdmin
    .from('email_events')
    .select('*')
    .eq('email_id', email.id)
    .order('occurred_at', { ascending: false });

  return {
    email,
    links: links || [],
    events: events || [],
  };
}

/**
 * Gets all API keys for a project.
 */
export async function getApiKeys(projectId?: string): Promise<ApiKey[]> {
  if (isDemoMode) {
    return getStoreApiKeys(projectId);
  }

  let query = supabaseAdmin.from('api_keys').select('*').order('created_at', { ascending: false });
  if (projectId && projectId !== 'all') {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching API keys from Supabase:', error);
    return [];
  }
  return data as ApiKey[];
}

/**
 * Creates a new API Key record.
 */
export async function createApiKey(projectId: string, name: string) {
  const { rawKey, keyHash, keyPrefix } = generateApiKey();
  const now = new Date().toISOString();
  const keyId = `key_${Date.now()}`;

  const newKey: ApiKey = {
    id: keyId,
    project_id: projectId,
    name,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    last_used_at: null,
    created_at: now,
    revoked_at: null,
  };

  if (isDemoMode) {
    addStoreApiKey(newKey);
    return { apiKey: newKey, rawKey };
  }

  const effectiveProjectId = await ensureSupabaseProject(projectId);
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      project_id: effectiveProjectId,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create API key in Supabase: ${error?.message}`);
  }

  return { apiKey: data as ApiKey, rawKey };
}

/**
 * Revokes an API Key.
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
  if (isDemoMode) {
    return revokeStoreApiKey(keyId);
  }

  const { error } = await supabaseAdmin
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', keyId);

  return !error;
}

/**
 * Gets all projects.
 */
export async function getProjects(): Promise<Project[]> {
  if (isDemoMode) {
    return getStoreProjects().filter(p => !p.id.startsWith('sys_'));
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .not('id', 'like', 'sys_%')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching projects from Supabase:', error);
    return [];
  }
  return data as Project[];
}

/**
 * Creates a new project.
 */
export async function createProject(name: string, description?: string): Promise<Project> {
  const now = new Date().toISOString();
  const projectId = `prj_${Date.now()}`;

  const newPrj: Project = {
    id: projectId,
    account_id: 'acc_demo_01',
    name,
    description: description || null,
    created_at: now,
    updated_at: now,
  };

  if (isDemoMode) {
    addStoreProject(newPrj);
    return newPrj;
  }

  // Supabase Mode: ensure account exists
  let accountId: string;
  const { data: anyAccount } = await supabaseAdmin.from('accounts').select('id').limit(1);
  if (anyAccount && anyAccount.length > 0) {
    accountId = anyAccount[0].id;
  } else {
    const { data: newAcc } = await supabaseAdmin.from('accounts').insert({ name: 'ERHA Technologies' }).select().single();
    accountId = newAcc?.id || 'acc_default';
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      account_id: accountId,
      name,
      description: description || null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create project in Supabase: ${error?.message}`);
  }

  return data as Project;
}

/**
 * Deletes a tracked email and its associated links and events.
 */
export async function deleteEmail(emailId: string): Promise<boolean> {
  if (isDemoMode) {
    return deleteStoreEmail(emailId);
  }

  // Supabase Mode: Delete email (associated links & events cascade delete automatically)
  const { error } = await supabaseAdmin
    .from('emails')
    .delete()
    .eq('id', emailId);

  if (error) {
    console.error('Error deleting email from Supabase:', error);
    return false;
  }

  return true;
}

/**
 * Retrieves all tracked emails.
 */
export async function getEmails(projectId?: string): Promise<Email[]> {
  if (isDemoMode) {
    return getStoreEmails(projectId).filter(e => !isFakeOrDisposableEmail(e.recipient_email).isFake);
  }

  let emailQuery = supabaseAdmin
    .from('emails')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId && projectId !== 'all' && projectId !== DEFAULT_PROJECT.id) {
    emailQuery = emailQuery.eq('project_id', projectId);
  }

  const { data, error } = await emailQuery;
  if (error) {
    console.error('Error fetching emails from Supabase:', error);
    return [];
  }

  const validEmails: Email[] = [];
  const fakeIds: string[] = [];
  for (const em of (data || [])) {
    if (isFakeOrDisposableEmail(em.recipient_email).isFake) {
      fakeIds.push(em.id);
    } else {
      validEmails.push(em);
    }
  }

  if (fakeIds.length > 0) {
    console.log(`[getEmails] Purging ${fakeIds.length} fake emails from Supabase`);
    try {
      await supabaseAdmin.from('email_events').delete().in('email_id', fakeIds);
      await supabaseAdmin.from('email_links').delete().in('email_id', fakeIds);
      await supabaseAdmin.from('emails').delete().in('id', fakeIds);
    } catch (purgeErr) {
      console.error('[getEmails] Purge error:', purgeErr);
    }
  }

  return validEmails;
}



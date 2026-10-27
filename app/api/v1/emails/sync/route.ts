import { NextRequest, NextResponse } from 'next/server';
import { addStoreEmail, getStoreEmails } from '@/lib/store';
import { Email } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const emailItem = body.email;

    if (!emailItem || !emailItem.recipient_email) {
      return NextResponse.json({ error: 'Valid email object required' }, { status: 400 });
    }

    const newEmail: Email = {
      id: emailItem.id || `em_${Date.now()}`,
      project_id: emailItem.project_id || 'prj_demo_01',
      tracking_id: emailItem.tracking_id || `trk_${Date.now()}`,
      message_id: null,
      recipient_email: emailItem.recipient_email.trim().toLowerCase(),
      recipient_name: emailItem.recipient_name || null,
      subject: emailItem.subject || 'Outreach Email',
      original_html: emailItem.original_html || '<p>Outreach message</p>',
      tracked_html: emailItem.tracked_html || '<p>Outreach message</p>',
      sent_at: emailItem.sent_at || new Date().toISOString(),
      first_opened_at: null,
      last_opened_at: null,
      open_count: 0,
      click_count: 0,
      status: 'SENT',
      created_at: emailItem.created_at || new Date().toISOString(),
      updated_at: emailItem.updated_at || new Date().toISOString(),
    };

    addStoreEmail(newEmail);

    return NextResponse.json({ success: true, count: getStoreEmails().length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
  }
}

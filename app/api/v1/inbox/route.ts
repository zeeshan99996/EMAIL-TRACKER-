import { NextRequest, NextResponse } from 'next/server';
import { localDb } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

interface InboxThread {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  unread: boolean;
  leadCompany?: string;
  tags?: string[];
}

// Clean unified inbox threads ready for real recipient replies
let INBOX_MESSAGES: InboxThread[] = [];

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      unreadCount: INBOX_MESSAGES.filter(m => m.unread).length,
      threads: INBOX_MESSAGES,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch inbox' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, messageId } = await req.json();

    if (action === 'markRead' && messageId) {
      const msg = INBOX_MESSAGES.find(m => m.id === messageId);
      if (msg) msg.unread = false;
      return NextResponse.json({ success: true });
    }

    if (action === 'markUnread' && messageId) {
      const msg = INBOX_MESSAGES.find(m => m.id === messageId);
      if (msg) msg.unread = true;
      return NextResponse.json({ success: true });
    }

    if (action === 'archive' && messageId) {
      INBOX_MESSAGES = INBOX_MESSAGES.filter(m => m.id !== messageId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update inbox' }, { status: 500 });
  }
}

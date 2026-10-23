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

let INBOX_MESSAGES: InboxThread[] = [
  {
    id: 'msg_01',
    senderName: 'Samantha Chen',
    senderEmail: 'samantha@cloudscale.ai',
    subject: 'Re: Quick inquiry regarding CloudScale AI outbound systems',
    preview: 'Hey! Thanks for reaching out. Yes, we are actively evaluating new cold outreach infrastructure...',
    body: `Hi team,\n\nThanks for reaching out! We are actually reviewing our outbound stack this quarter. Your email arrived at the right time.\n\nCould you share a quick 10-minute demo link or deck? What is your typical onboarding timeline?\n\nBest regards,\nSamantha Chen\nVP of Growth | CloudScale AI`,
    receivedAt: '12 minutes ago',
    unread: true,
    leadCompany: 'CloudScale AI',
    tags: ['Interested', 'Warm Lead'],
  },
  {
    id: 'msg_02',
    senderName: 'Elena Rostova',
    senderEmail: 'elena@vanguardventures.com',
    subject: 'Re: Partnership & Portfolio Growth Scope',
    preview: 'Hi! I went through your proposal link. Looks very solid. Are you free Thursday at 2 PM EST for a quick call?',
    body: `Hi there,\n\nI reviewed the proposal and portfolio link you sent over earlier today. The tracking and deliverability numbers look impressive.\n\nAre you available for a brief 15-minute introductory call this Thursday around 2:00 PM EST? Let me know and I will send a calendar invite.\n\nBest,\nElena Rostova\nPartner | Vanguard Ventures`,
    receivedAt: '1 hour ago',
    unread: true,
    leadCompany: 'Vanguard Ventures',
    tags: ['Meeting Request', 'High Priority'],
  },
  {
    id: 'msg_03',
    senderName: 'Alex Rivera',
    senderEmail: 'alex.rivera@fintechpulse.io',
    subject: 'Re: Scalable Email Infrastructure & Warmup',
    preview: 'Thanks for the follow-up. Do you support multi-seat teams with custom Google Sheet synchronization?',
    body: `Hello,\n\nThanks for checking in with our team. We do high-volume outreach across 8 SDRs.\n\nQuick question: does your platform support multiple Google Sheets attached to separate SDR mailboxes simultaneously?\n\nLooking forward to hearing from you.\n\nAlex Rivera\nFinTech Pulse`,
    receivedAt: '3 hours ago',
    unread: false,
    leadCompany: 'FinTech Pulse',
    tags: ['Inquiry'],
  },
  {
    id: 'msg_04',
    senderName: 'Marcus Brody',
    senderEmail: 'marcus.brody@nexusgrowth.co',
    subject: 'Re: Quick question about your cold email deliverability rate',
    preview: 'Got your email. Could you send over case studies from other B2B agencies you have worked with?',
    body: `Hey,\n\nReceived your note. We have had deliverability issues with Gmail recently, so your spam rescue mention caught my eye.\n\nDo you have any case studies from marketing or SaaS agencies? Would love to inspect the numbers before deciding.\n\nCheers,\nMarcus Brody`,
    receivedAt: 'Yesterday',
    unread: false,
    leadCompany: 'Nexus Growth',
    tags: ['Case Study Request'],
  },
];

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

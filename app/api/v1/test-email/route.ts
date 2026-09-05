import { NextRequest, NextResponse } from 'next/server';
import { createTrackedEmail } from '@/lib/supabase/admin';
import { DEFAULT_PROJECT } from '@/lib/store';
import { registerSenderIp } from '@/lib/security/sender-filter';
import { verifyEmail } from '@/lib/verification/email-verifier';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.to || !body.subject || !body.html) {
      return NextResponse.json(
        { success: false, error: 'Recipient email, subject, and HTML are required.' },
        { status: 400 }
      );
    }

    const verification = await verifyEmail(body.to);
    if (!verification.isValid || !verification.isDeliverable || verification.isDisposable) {
      return NextResponse.json(
        { success: false, error: `Recipient rejected: ${verification.reason}` },
        { status: 400 }
      );
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost'))
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
      : `${protocol}://${host}`;

    const projectId = body.projectId || DEFAULT_PROJECT.id;
    const result = await createTrackedEmail(
      projectId,
      {
        to: body.to,
        subject: body.subject,
        html: body.html,
        recipientName: body.recipientName || 'Valued Client',
      },
      appUrl
    );

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('Error in /api/v1/test-email:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create test email.' },
      { status: 500 }
    );
  }
}

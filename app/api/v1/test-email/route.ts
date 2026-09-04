import { NextRequest, NextResponse } from 'next/server';
import { createTrackedEmail } from '@/lib/supabase/admin';
import { DEFAULT_PROJECT } from '@/lib/store';
import { registerSenderIp } from '@/lib/security/sender-filter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.to || !body.subject || !body.html) {
      return NextResponse.json(
        { success: false, error: 'Recipient email, subject, and HTML are required.' },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    registerSenderIp(clientIp);

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

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

    const res = NextResponse.json(result, { status: 201 });
    res.cookies.set('_et_sender', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return res;
  } catch (err: any) {
    console.error('Error in /api/v1/test-email:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create test email.' },
      { status: 500 }
    );
  }
}

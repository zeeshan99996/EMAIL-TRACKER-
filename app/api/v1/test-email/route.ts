import { NextRequest, NextResponse } from 'next/server';
import { createTrackedEmail } from '@/lib/supabase/admin';
import { DEFAULT_PROJECT } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.to || !body.subject || !body.html) {
      return NextResponse.json(
        { success: false, error: 'Recipient email, subject, and HTML are required.' },
        { status: 400 }
      );
    }

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

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('Error in /api/v1/test-email:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create test email.' },
      { status: 500 }
    );
  }
}

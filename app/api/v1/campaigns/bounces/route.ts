import { NextRequest, NextResponse } from 'next/server';
import { checkRecentBounces } from '@/lib/mail/inbox-sync';
import { loadDbFromSupabase } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await loadDbFromSupabase().catch(() => {});

    const { searchParams } = new URL(req.url);
    const recipientEmail = searchParams.get('recipientEmail') || undefined;
    const accountEmail = searchParams.get('accountEmail') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 25;

    const bounces = await checkRecentBounces({
      accountEmail,
      targetRecipient: recipientEmail,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: bounces.length,
      bounces,
    });
  } catch (err: any) {
    console.error('[BouncesAPI] GET error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to check bounces' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await loadDbFromSupabase().catch(() => {});

    const body = await req.json().catch(() => ({}));
    const recipientEmail = body.recipientEmail || undefined;
    const accountEmail = body.accountEmail || undefined;
    const limit = body.limit ? Number(body.limit) : 25;

    const bounces = await checkRecentBounces({
      accountEmail,
      targetRecipient: recipientEmail,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: bounces.length,
      bounces,
    });
  } catch (err: any) {
    console.error('[BouncesAPI] POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to check bounces' },
      { status: 500 }
    );
  }
}

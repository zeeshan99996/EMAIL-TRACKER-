import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/verification/email-verifier';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Batch verification support
    if (Array.isArray(body.emails)) {
      const emailList: string[] = body.emails.slice(0, 50); // limit to 50 per batch
      const results = await Promise.all(emailList.map(e => verifyEmail(e)));
      const validCount = results.filter(r => r.isDeliverable).length;
      const invalidCount = results.length - validCount;

      return NextResponse.json({
        success: true,
        summary: {
          total: results.length,
          valid: validCount,
          invalid: invalidCount,
        },
        results,
      });
    }

    // Single verification
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Field "email" is required.' },
        { status: 400 }
      );
    }

    const result = await verifyEmail(body.email);
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error('Error in /api/v1/verify-email:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Email verification failed.' },
      { status: 500 }
    );
  }
}

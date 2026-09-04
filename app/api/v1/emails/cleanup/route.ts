import { NextRequest, NextResponse } from 'next/server';
import { getEmails, deleteEmail } from '@/lib/supabase/admin';
import { verifyEmail } from '@/lib/verification/email-verifier';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;

    const emails = await getEmails(projectId);
    if (!emails || emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No emails found to clean up.',
        scanned: 0,
        cleanedCount: 0,
        cleanedEmails: [],
      });
    }

    const cleanedEmails: Array<{ id: string; recipient: string; reason: string }> = [];

    for (const email of emails) {
      const verification = await verifyEmail(email.recipient_email);
      if (!verification.isValid || !verification.isDeliverable || verification.isDisposable) {
        const deleted = await deleteEmail(email.id);
        if (deleted) {
          cleanedEmails.push({
            id: email.id,
            recipient: email.recipient_email,
            reason: verification.reason,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      scanned: emails.length,
      cleanedCount: cleanedEmails.length,
      cleanedEmails,
      message:
        cleanedEmails.length > 0
          ? `Successfully removed ${cleanedEmails.length} fake or undeliverable email(s) from database.`
          : 'All emails in your database are clean and valid!',
    });
  } catch (err: any) {
    console.error('Error cleaning up fake emails:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to cleanup fake emails.' },
      { status: 500 }
    );
  }
}

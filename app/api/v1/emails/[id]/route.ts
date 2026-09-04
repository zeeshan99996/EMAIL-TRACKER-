import { NextRequest, NextResponse } from 'next/server';
import { getEmailDetails } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emailId = params.id;
    if (!emailId) {
      return NextResponse.json({ error: 'Email ID is required' }, { status: 400 });
    }

    const details = await getEmailDetails(emailId);
    if (!details) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json(details, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Error fetching email details:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch email details' },
      { status: 500 }
    );
  }
}

import { getSessionFromCookies } from '@/lib/auth/session';
import { findUserByEmail } from '@/lib/db/user_store';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionFromCookies();
    if (!session || !session.email) {
      return NextResponse.json({ authenticated: false });
    }

    const user = findUserByEmail(session.email);
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: user?.name || session.email.split('@')[0],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message });
  }
}

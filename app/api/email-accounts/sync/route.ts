import { NextRequest, NextResponse } from 'next/server';
import { localDb } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const account = body.account;
    const accounts = Array.isArray(body.accounts) ? body.accounts : account ? [account] : [];

    if (accounts.length === 0) {
      return NextResponse.json({ success: true, count: localDb.getAccounts().length });
    }

    for (const acc of accounts) {
      if (acc && acc.email && acc.email.includes('@')) {
        const cleanEmail = acc.email.toLowerCase().trim();
        localDb.upsertAccount({
          id: acc.id,
          user_id: 'usr_default_admin',
          email: cleanEmail,
          provider: acc.provider || (cleanEmail.endsWith('@gmail.com') ? 'gmail_app_password' : 'custom_smtp'),
          status: acc.status || 'connected',
          access_token: acc.access_token || '',
          metadata: acc.metadata,
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: localDb.getAccounts().length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
  }
}

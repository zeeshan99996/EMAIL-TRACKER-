import { clearSessionCookie } from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut().catch(() => {});
    clearSessionCookie();
    const res = NextResponse.json({ success: true });
    res.cookies.delete('mailify_has_submitted');
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error signing out' }, { status: 500 });
  }
}

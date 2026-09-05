import { clearSessionCookie } from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut().catch(() => {});
    clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error signing out' }, { status: 500 });
  }
}

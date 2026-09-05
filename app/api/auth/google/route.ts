import { getAuthorizationUrl } from '@/lib/google/oauth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authUrl = getAuthorizationUrl(session.user.id);
    return NextResponse.json({ url: authUrl });
  } catch (error: any) {
    console.error('[API /api/auth/google] Error generating auth URL:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

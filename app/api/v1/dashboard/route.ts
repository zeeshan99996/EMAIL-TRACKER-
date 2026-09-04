import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/supabase/admin';
import { registerSenderIp } from '@/lib/security/sender-filter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;

    // Automatically register current dashboard user's IP as a sender IP
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    registerSenderIp(clientIp);

    const data = await getDashboardData(projectId);

    const res = NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });

    // Tag the dashboard user's browser with a persistent sender cookie
    res.cookies.set('_et_sender', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      httpOnly: false,
    });

    return res;
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

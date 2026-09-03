import { NextRequest, NextResponse } from 'next/server';
import { recordOpenEvent } from '@/lib/supabase/admin';

// 1x1 Transparent GIF base64
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(
  req: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  const trackingId = params.trackingId;

  // Extract client metadata
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent');
  const referer = req.headers.get('referer');

  if (trackingId) {
    // Record event asynchronously
    recordOpenEvent(trackingId, ip, userAgent, referer).catch(err => {
      console.error('Error logging open event:', err);
    });
  }

  // Always return transparent 1x1 GIF with strict no-cache headers
  return new NextResponse(TRANSPARENT_GIF_BUFFER, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(TRANSPARENT_GIF_BUFFER.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { recordOpenEvent } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent');
  const referer = req.headers.get('referer');

  if (trackingId) {
    try {
      // Must await in serverless/Vercel environment so container does not freeze before DB write
      await recordOpenEvent(trackingId, ip, userAgent, referer, false);
    } catch (err) {
      console.error('Error logging open event:', err);
    }
  }

  const now = new Date().toUTCString();
  const nonce = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Always return transparent 1x1 GIF with strict no-cache headers for all CDNs and proxies
  return new NextResponse(TRANSPARENT_GIF_BUFFER, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(TRANSPARENT_GIF_BUFFER.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
      'Pragma': 'no-cache',
      'Expires': 'Mon, 26 Jul 1997 05:00:00 GMT',
      'Last-Modified': now,
      'ETag': `"${nonce}"`,
      'Surrogate-Control': 'no-store',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

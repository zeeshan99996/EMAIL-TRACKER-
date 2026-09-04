import { NextRequest, NextResponse } from 'next/server';
import { recordOpenEvent } from '@/lib/supabase/admin';
import { isSenderRequest } from '@/lib/security/sender-filter';

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
  const { isSender, ip, reason } = isSenderRequest(req);
  const userAgent = req.headers.get('user-agent');
  const referer = req.headers.get('referer');

  if (trackingId && !isSender) {
    // Record event asynchronously for recipient
    recordOpenEvent(trackingId, ip, userAgent, referer).catch(err => {
      console.error('Error logging open event:', err);
    });
  } else if (isSender) {
    console.log(`[Open Tracker] Self-open by sender ignored from ${ip} (reason: ${reason})`);
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

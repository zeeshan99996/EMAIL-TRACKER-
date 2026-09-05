import { NextRequest, NextResponse } from 'next/server';
import { recordClickEvent } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(
  req: NextRequest,
  { params }: { params: { trackingId: string; linkId: string } }
) {
  const { trackingId, linkId } = params;

  if (!trackingId || !linkId) {
    return NextResponse.json(
      { error: 'Invalid click tracking parameters' },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent');
  const referer = req.headers.get('referer');

  // Always record click event and update engagement status
  const destinationUrl = await recordClickEvent(
    trackingId,
    linkId,
    ip,
    userAgent,
    referer,
    false
  );

  if (!destinationUrl) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Link Not Found</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Link Not Found or Expired</h2>
          <p>The link you clicked could not be resolved.</p>
        </body>
      </html>`,
      {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  // Safe redirect (302 Found) to the exact registered destination URL with anti-cache headers
  return NextResponse.redirect(destinationUrl, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
    },
  });
}


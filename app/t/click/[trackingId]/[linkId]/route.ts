import { NextRequest, NextResponse } from 'next/server';
import { recordClickEvent } from '@/lib/supabase/admin';
import { isSenderRequest } from '@/lib/security/sender-filter';

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

  const { isSender, ip, reason } = isSenderRequest(req);
  const userAgent = req.headers.get('user-agent');
  const referer = req.headers.get('referer');

  if (isSender) {
    console.log(`[Click Tracker] Self-click by sender ignored from ${ip} (reason: ${reason})`);
  }

  // If sender, skipRecord=true so no click or open is recorded, but destination URL is resolved
  const destinationUrl = await recordClickEvent(
    trackingId,
    linkId,
    ip,
    userAgent,
    referer,
    isSender
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

  // Safe redirect (302 Found) to the exact registered destination URL
  return NextResponse.redirect(destinationUrl, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}


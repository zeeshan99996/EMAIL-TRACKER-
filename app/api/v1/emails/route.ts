import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, createTrackedEmail } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { createEmailSchema } from '@/lib/validation/email-schema';
import { registerSenderIp } from '@/lib/security/sender-filter';
import { verifyEmail } from '@/lib/verification/email-verifier';

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization Header Check
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing or invalid Authorization header. Expected format: Bearer <API_KEY>',
          },
        },
        { status: 401 }
      );
    }

    const rawApiKey = authHeader.substring(7).trim();

    // 2. Validate API Key
    const apiKeyRecord = await validateApiKey(rawApiKey);
    if (!apiKeyRecord) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_API_KEY',
            message: 'The API key is invalid or revoked.',
          },
        },
        { status: 401 }
      );
    }

    // 3. Rate Limit Check (100 requests / minute)
    const rateLimit = checkRateLimit(apiKeyRecord.key_hash, 100, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'API rate limit exceeded. Please wait before sending more emails.',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.reset - Math.floor(Date.now() / 1000)),
          },
        }
      );
    }

    // 4. Validate Payload Body
    const jsonBody = await req.json().catch(() => null);
    if (!jsonBody) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON request payload.',
          },
        },
        { status: 400 }
      );
    }

    const parseResult = createEmailSchema.safeParse(jsonBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email payload parameters.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // 5. Email Verification & Spam/Fake Recipient Protection
    const verification = await verifyEmail(parseResult.data.to);
    if (!verification.isValid || !verification.isDeliverable || verification.isDisposable) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_RECIPIENT_EMAIL',
            message: `Recipient email rejected: ${verification.reason}`,
            details: verification,
          },
        },
        { status: 400 }
      );
    }

    // 6. Determine Base App URL & Register Sender IP
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    registerSenderIp(clientIp);

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // 6. Create Tracked Email
    const result = await createTrackedEmail(apiKeyRecord.project_id, parseResult.data, appUrl);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('API Error in /api/v1/emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'An unexpected error occurred while processing the email.',
        },
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}

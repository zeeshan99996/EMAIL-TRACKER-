import { NextRequest, NextResponse } from 'next/server';
import { getApiKeys, createApiKey, revokeApiKey } from '@/lib/supabase/admin';
import { DEFAULT_PROJECT } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;

    const keys = await getApiKeys(projectId);
    return NextResponse.json({ keys }, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (err: any) {
    console.error('Error fetching API keys:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch API keys' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.name) {
      return NextResponse.json({ error: 'API key name is required' }, { status: 400 });
    }

    const projectId = body.projectId || DEFAULT_PROJECT.id;
    const result = await createApiKey(projectId, body.name);

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('Error creating API key:', err);
    return NextResponse.json({ error: err.message || 'Failed to create API key' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    const success = await revokeApiKey(keyId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('Error revoking API key:', err);
    return NextResponse.json({ error: err.message || 'Failed to revoke API key' }, { status: 500 });
  }
}

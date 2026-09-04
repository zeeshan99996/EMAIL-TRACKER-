import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json({ projects }, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (err: any) {
    console.error('Error fetching projects:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await createProject(body.name, body.description);
    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating project:', err);
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: 500 });
  }
}

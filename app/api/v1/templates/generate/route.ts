import { NextRequest, NextResponse } from 'next/server';
import { generateTemplate, GenerateTemplateRequest } from '@/lib/templates/generator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateTemplateRequest;

    if (!body || !body.prompt || !body.prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter a description or command for your template.' },
        { status: 400 }
      );
    }

    const template = await generateTemplate(body);

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error: any) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate template.' },
      { status: 500 }
    );
  }
}

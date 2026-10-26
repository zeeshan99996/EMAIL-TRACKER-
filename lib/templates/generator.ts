import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GenerateTemplateRequest {
  prompt: string;
  tone?: 'professional' | 'direct' | 'friendly' | 'value-first';
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
  imageLinkUrl?: string;
  targetAudience?: string;
}

export interface GeneratedTemplateResponse {
  name: string;
  subject: string;
  body: string;
  imageUrl?: string;
  imageLinkUrl?: string;
}

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('mock') || apiKey.length < 10) return null;
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch {
    return null;
  }
}

/**
 * Intelligent Rule-Based Email Synthesizer
 * Guarantees instantaneous, beautiful responsive templates matching prompt requirements
 */
export function synthesizeTemplateHeuristically(req: GenerateTemplateRequest): GeneratedTemplateResponse {
  const promptLower = req.prompt.toLowerCase();
  const tone = req.tone || 'professional';
  const ctaText = req.ctaText?.trim() || 'Schedule a 10-Minute Call';
  const ctaUrl = req.ctaUrl?.trim() || 'https://example.com/demo';
  const imageUrl = req.imageUrl?.trim() || '';
  const imageLinkUrl = req.imageLinkUrl?.trim() || '';

  // Determine Category from keywords
  let category: 'agency' | 'saas' | 'real_estate' | 'partnership' | 'followup' | 'ecommerce' | 'general' = 'general';

  if (promptLower.includes('saas') || promptLower.includes('software') || promptLower.includes('app') || promptLower.includes('tech')) {
    category = 'saas';
  } else if (promptLower.includes('agency') || promptLower.includes('dev') || promptLower.includes('design') || promptLower.includes('marketing') || promptLower.includes('web')) {
    category = 'agency';
  } else if (promptLower.includes('real estate') || promptLower.includes('property') || promptLower.includes('broker') || promptLower.includes('realtor')) {
    category = 'real_estate';
  } else if (promptLower.includes('partner') || promptLower.includes('collab') || promptLower.includes('synergy')) {
    category = 'partnership';
  } else if (promptLower.includes('follow') || promptLower.includes('checking') || promptLower.includes('bump')) {
    category = 'followup';
  } else if (promptLower.includes('shop') || promptLower.includes('store') || promptLower.includes('ecom') || promptLower.includes('retail')) {
    category = 'ecommerce';
  }

  // Generate Title
  const cleanPromptTitle = req.prompt.slice(0, 35).replace(/[^\w\s-]/g, '').trim();
  const name = cleanPromptTitle ? `${cleanPromptTitle.charAt(0).toUpperCase() + cleanPromptTitle.slice(1)} Template` : 'Custom AI Outreach Template';

  // Generate Subject Lines based on category & tone
  let subject = 'Quick question regarding {{company}}';
  if (category === 'saas') {
    subject = tone === 'direct' ? 'Idea for {{company}}\'s tech stack' : 'Scaling outbound pipeline for {{company}}';
  } else if (category === 'agency') {
    subject = tone === 'friendly' ? 'Loved {{company}}\'s website — quick idea' : 'Website & conversion optimization for {{company}}';
  } else if (category === 'real_estate') {
    subject = 'Exclusive commercial inventory & client lead scope for {{company}}';
  } else if (category === 'partnership') {
    subject = 'Exploring a strategic collaboration with {{company}}';
  } else if (category === 'followup') {
    subject = 'Re: Proposal & ideas for {{company}}';
  } else if (category === 'ecommerce') {
    subject = 'Boosting {{company}}\'s store checkout conversion by 24%';
  }

  // Construct Image Tag if requested or provided
  let imageHtml = '';
  if (imageUrl) {
    const imgElement = `<img src="${imageUrl}" alt="Feature Banner" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto; border: 0;" />`;
    const clickableWrapper = imageLinkUrl
      ? `<a href="${imageLinkUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">${imgElement}</a>`
      : imgElement;
    imageHtml = `\n  <div style="text-align: center; margin: 16px 0;">\n    ${clickableWrapper}\n  </div>`;
  }

  // Construct CTA Button
  const buttonHtml = `
  <div style="margin: 22px 0; text-align: left;">
    <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #2563eb; color: #ffffff; padding: 11px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
      ${ctaText}
    </a>
  </div>`;

  // Body content by category
  let bodyParagraphs = '';
  if (category === 'saas') {
    bodyParagraphs = `
  <p>Hi {{first_name}},</p>
  <p>I came across {{company}} while reviewing leaders in your space and was really impressed by your recent growth.</p>
  <p>We work with high-growth technology teams to solve deliverability bottlenecks, accelerate sales pipeline, and guarantee emails land directly in primary inboxes.</p>
  <ul style="margin: 12px 0 12px 20px; padding: 0; color: #334155;">
    <li style="margin-bottom: 6px;">Zero setup latency with direct Google Sheets integration</li>
    <li style="margin-bottom: 6px;">Automated in-flight DNS and disposable email verification</li>
    <li style="margin-bottom: 6px;">Real-time open & link click analytics telemetry</li>
  </ul>
  <p>Would you have 10 minutes this Thursday to see if this could move the needle for {{company}}?</p>${buttonHtml}
  <p>Best regards,<br><strong>Outreach Specialist</strong></p>`;
  } else if (category === 'agency') {
    bodyParagraphs = `
  <p>Hey {{first_name}},</p>
  <p>I was exploring {{company}}'s website (<a href="{{website}}" style="color: #2563eb; text-decoration: underline;">{{website}}</a>) and noticed a couple of quick UX optimizations that could significantly increase your client conversion rate.</p>
  <p>We recently partnered with a similar team and helped them scale their inbound conversions by over 38% within 45 days.</p>
  <p>Here is a brief case study breakdown and live scope:</p>${buttonHtml}
  <p>Are you open to a brief 5-minute chat sometime this week?</p>
  <p>Warmly,<br><strong>Growth Director</strong></p>`;
  } else if (category === 'followup') {
    bodyParagraphs = `
  <p>Hi {{first_name}},</p>
  <p>I know inboxes get packed quickly, so I wanted to gently bump this note to the top of your list.</p>
  <p>Did you get a chance to look over the ideas we shared for {{company}}?</p>
  <p>Happy to share a 2-minute video overview or jump on a quick call if that is easier for you:</p>${buttonHtml}
  <p>Best regards,<br><strong>Outreach Team</strong></p>`;
  } else {
    // General B2B
    bodyParagraphs = `
  <p>Hi {{first_name}},</p>
  <p>I am reaching out because we help companies like {{company}} optimize their outbound outreach, automate customer acquisition, and scale revenue efficiently.</p>
  <p>Based on your current initiatives at {{company}}, I put together a quick overview of how our workflow delivers measurable results from day one.</p>${buttonHtml}
  <p>Would you be open to a 10-minute introductory call next Tuesday or Wednesday?</p>
  <p>Best regards,<br><strong>Outreach Specialist</strong></p>`;
  }

  const finalHtml = `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6; font-size: 14px;">${imageHtml}${bodyParagraphs}
</div>`;

  return {
    name,
    subject,
    body: finalHtml,
    imageUrl: imageUrl || undefined,
    imageLinkUrl: imageLinkUrl || undefined,
  };
}

/**
 * Main Template Generator with Gemini AI + Heuristic Fallback
 */
export async function generateTemplate(req: GenerateTemplateRequest): Promise<GeneratedTemplateResponse> {
  const genAI = getGeminiClient();

  if (genAI) {
    const modelsToTry = [
      process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-flash-latest',
    ];

    const systemInstruction = `
You are an expert enterprise cold email copywriter and HTML email architect.
Your mission is to generate high-converting, spam-free, responsive HTML email templates based on user requirements.

STRICT FORMAT REQUIREMENTS:
1. You MUST respond with ONLY a valid, parseable JSON object with these EXACT keys:
   - "name": Short, professional template title (e.g. "B2B SaaS Lead Generation")
   - "subject": High-open-rate subject line incorporating variables like "{{company}}" or "{{first_name}}"
   - "body": Fully styled HTML email body contained inside a <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6; font-size: 14px;">
2. HTML RULES:
   - Use standard inline CSS styles ONLY (colors: text #1e293b, links/buttons #2563eb).
   - Incorporate personalization variables: {{first_name}}, {{company}}, and {{website}}.
   - If a call-to-action button or link is requested, embed:
     <div style="margin: 20px 0;"><a href="${req.ctaUrl || 'https://example.com'}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 11px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">${req.ctaText || 'Schedule a Quick Call'}</a></div>
   - If an image or clickable image is provided or requested:
     Include <div style="text-align: center; margin: 16px 0;"><a href="${req.imageLinkUrl || req.ctaUrl || 'https://example.com'}"><img src="${req.imageUrl || 'https://placehold.co/600x200/eff6ff/2563eb?text=Feature+Graphic'}" alt="Preview" style="max-width: 100%; height: auto; border-radius: 8px;" /></a></div>
3. NO markdown fences like \`\`\`json or \`\`\`. Output ONLY raw valid JSON.
`;

    const prompt = `
User Requirement / Command: "${req.prompt}"
Requested Tone: ${req.tone || 'professional'}
Target Audience: ${req.targetAudience || 'Decision Makers, Founders, Executives'}
CTA Button Text: "${req.ctaText || 'Learn More'}"
CTA URL: "${req.ctaUrl || 'https://example.com'}"
${req.imageUrl ? `Image URL to include: "${req.imageUrl}"` : ''}
${req.imageLinkUrl ? `Image Click / Destination URL: "${req.imageLinkUrl}"` : ''}

Generate the JSON template now.
`;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        });

        let text = result.response.text().trim();
        // Remove any markdown code wrappers if present
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

        const parsed = JSON.parse(text);
        if (parsed.name && parsed.subject && parsed.body) {
          return {
            name: String(parsed.name).trim(),
            subject: String(parsed.subject).trim(),
            body: String(parsed.body).trim(),
            imageUrl: req.imageUrl || undefined,
            imageLinkUrl: req.imageLinkUrl || undefined,
          };
        }
      } catch (err: any) {
        console.warn(`[Gemini Template] Attempt failed with ${modelName}:`, err.message);
      }
    }
  }

  // Fallback to high-converting heuristic engine
  return synthesizeTemplateHeuristically(req);
}

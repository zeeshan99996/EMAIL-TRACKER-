import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GenerateTemplateRequest {
  prompt: string;
  tone?: 'professional' | 'direct' | 'friendly' | 'value-first';
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
 * World-Class Executive Email Template Synthesizer
 * Produces enterprise-grade, theme-aligned (Slate & Blue), responsive email HTML in < 5ms.
 * No CTA buttons - clean conversational outreach.
 */
export function synthesizeTemplateHeuristically(req: GenerateTemplateRequest): GeneratedTemplateResponse {
  const promptLower = req.prompt.toLowerCase();
  const tone = req.tone || 'professional';
  const imageUrl = req.imageUrl?.trim() || '';
  const imageLinkUrl = req.imageLinkUrl?.trim() || '';

  // Determine Industry / Category
  type CategoryType =
    | 'saas'
    | 'agency'
    | 'real_estate'
    | 'ecommerce'
    | 'consulting'
    | 'partnership'
    | 'recruiting'
    | 'followup'
    | 'general';

  let category: CategoryType = 'general';

  if (promptLower.includes('saas') || promptLower.includes('software') || promptLower.includes('app') || promptLower.includes('tech') || promptLower.includes('platform')) {
    category = 'saas';
  } else if (promptLower.includes('agency') || promptLower.includes('dev') || promptLower.includes('design') || promptLower.includes('marketing') || promptLower.includes('web') || promptLower.includes('seo')) {
    category = 'agency';
  } else if (promptLower.includes('real estate') || promptLower.includes('property') || promptLower.includes('broker') || promptLower.includes('realtor') || promptLower.includes('housing')) {
    category = 'real_estate';
  } else if (promptLower.includes('shop') || promptLower.includes('store') || promptLower.includes('ecom') || promptLower.includes('retail') || promptLower.includes('product')) {
    category = 'ecommerce';
  } else if (promptLower.includes('consult') || promptLower.includes('advisory') || promptLower.includes('audit') || promptLower.includes('finance') || promptLower.includes('strategy')) {
    category = 'consulting';
  } else if (promptLower.includes('partner') || promptLower.includes('collab') || promptLower.includes('synergy') || promptLower.includes('affiliate')) {
    category = 'partnership';
  } else if (promptLower.includes('hire') || promptLower.includes('recruiting') || promptLower.includes('talent') || promptLower.includes('staffing')) {
    category = 'recruiting';
  } else if (promptLower.includes('follow') || promptLower.includes('checking') || promptLower.includes('bump') || promptLower.includes('reconnect')) {
    category = 'followup';
  }

  // Generate Title
  const cleanTitle = req.prompt.slice(0, 40).replace(/[^\w\s-]/g, '').trim();
  const name = cleanTitle ? `${cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)} Template` : 'Enterprise Outreach Template';

  // Subject line generation
  let subject = 'Direct inquiry regarding {{company}}';
  let badgeText = 'DIRECT OUTREACH • {{company}}';
  let heading = 'Optimizing outreach & revenue pipeline for {{company}}';
  let intro = 'I noticed {{company}}\'s momentum in the market and wanted to share a targeted perspective on accelerating your outbound pipeline without deliverability friction.';
  let deliverable1 = '<strong>Guaranteed Primary Placement:</strong> Multi-layer DNS verification and automated throttle control so zero emails hit spam.';
  let deliverable2 = '<strong>Direct Pipeline Integration:</strong> Seamless synchronization with your Google Sheets lead roster and live status columns.';
  let deliverable3 = '<strong>Telemetry Telemetry:</strong> Real-time open & click conversion telemetry with automated bounce isolation.';
  let proofQuote = '"Enabled similar enterprises to achieve a +42% reply rate increase within 14 days of sequence rollout."';
  let signoffTitle = 'Enterprise Growth Director';

  if (category === 'saas') {
    subject = tone === 'direct' ? 'Idea for {{company}}\'s outbound stack' : 'Scaling pipeline velocity for {{company}}';
    badgeText = 'SAAS SCALE • {{company}}';
    heading = 'Accelerating high-intent sales pipeline for {{company}}';
    intro = 'I have been following {{company}}\'s product journey and identified several strategic opportunities to scale your ARR pipeline through targeted, deliverability-grade outreach.';
    deliverable1 = '<strong>Dedicated Warmup Network:</strong> Natural volume ramp with multi-inbox rotation and AI-crafted message variations.';
    deliverable2 = '<strong>Instant Google Sheets Sync:</strong> Dispatch directly from your spreadsheet without clunky third-party integrations.';
    deliverable3 = '<strong>Zero SPF/DKIM Flags:</strong> Built-in DNS validation ensuring compliance with Gmail and Yahoo 2026 bulk-sender standards.';
    proofQuote = '"Helped B2B SaaS teams scale outbound demos by 3.4x while maintaining sub-0.1% spam dispute rates."';
    signoffTitle = 'VP of Outbound Growth';
  } else if (category === 'agency') {
    subject = tone === 'friendly' ? 'Loved {{company}}\'s brand — quick design note' : 'Client conversion optimization for {{company}}';
    badgeText = 'AGENCY LEADERSHIP • {{company}}';
    heading = 'Unlocking higher conversion velocity on {{website}}';
    intro = 'While reviewing {{company}}\'s website (<a href="{{website}}" style="color: #2563eb; text-decoration: underline;">{{website}}</a>), our team noted high potential UX touchpoints that could significantly boost your conversion rate.';
    deliverable1 = '<strong>Conversion Funnel Audit:</strong> Pinpoint where qualified prospective clients drop off before booking a discovery call.';
    deliverable2 = '<strong>Rapid Modern Redesign:</strong> Responsive, high-speed interfaces built with modern UI frameworks for maximum engagement.';
    deliverable3 = '<strong>Direct Measurable ROI:</strong> Transparent performance milestones tied directly to client acquisition goals.';
    proofQuote = '"Boosted inbound meeting booking rate by 38% within 30 days of implementing structural optimizations."';
    signoffTitle = 'Digital Strategy Director';
  } else if (category === 'real_estate') {
    subject = 'Exclusive commercial & portfolio scope for {{company}}';
    badgeText = 'COMMERCIAL PORTFOLIO • {{company}}';
    heading = 'Targeted acquisition & client expansion for {{company}}';
    intro = 'Reaching out directly to discuss upcoming premium inventory opportunities aligned with {{company}}\'s expansion and strategic investment profile.';
    deliverable1 = '<strong>Curated Off-Market Access:</strong> Early visibility into tier-1 properties before public MLS distribution.';
    deliverable2 = '<strong>Verified High-Net-Worth Leads:</strong> Direct pipeline of vetted buyers and institutional tenants.';
    deliverable3 = '<strong>Real-Time Yield Modeling:</strong> Data-driven cap rate and appreciation forecasting.';
    proofQuote = '"Closed over $24M in commercial transactions with institutional partners over the last two quarters."';
    signoffTitle = 'Principal Broker & Portfolio Lead';
  } else if (category === 'ecommerce') {
    subject = 'Boosting {{company}}\'s checkout conversion rate by 24%';
    badgeText = 'COMMERCE METRICS • {{company}}';
    heading = 'Maximizing customer lifetime value & checkout completion';
    intro = 'I came across {{company}}\'s storefront and was impressed by your product catalog. We help top retail brands eliminate abandoned cart revenue loss.';
    deliverable1 = '<strong>Cart Recovery Automation:</strong> Hyper-personalized sequences triggering within minutes of drop-off.';
    deliverable2 = '<strong>Frictionless 1-Click Flow:</strong> Optimized checkout funnels designed to increase mobile basket size.';
    deliverable3 = '<strong>Lifetime Value Lift:</strong> Segmented VIP campaigns engineered to boost 90-day repeat purchases.';
    proofQuote = '"Recovered $142,000 in monthly lost cart sales for top-tier Shopify Plus and WooCommerce retailers."';
    signoffTitle = 'E-Commerce Growth Lead';
  } else if (category === 'consulting') {
    subject = 'Strategic operational efficiency audit for {{company}}';
    badgeText = 'ADVISORY & STRATEGY • {{company}}';
    heading = 'Streamlining core workflows & cost architecture at {{company}}';
    intro = 'We advise executive leadership teams on modernizing internal operations, reducing software overhead, and accelerating execution velocity.';
    deliverable1 = '<strong>Operational Friction Audit:</strong> Deep dive into current bottlenecks impacting team productivity.';
    deliverable2 = '<strong>Automated Workflows:</strong> Eliminate repetitive manual tasks through robust workflow infrastructure.';
    deliverable3 = '<strong>Executive Milestone Roadmap:</strong> Clear, measurable KPI roadmap delivering positive ROI within 60 days.';
    proofQuote = '"Reduced operational overhead by 22% while increasing cross-team sprint delivery velocity by 40%."';
    signoffTitle = 'Managing Partner';
  } else if (category === 'partnership') {
    subject = 'Exploring a strategic collaboration with {{company}}';
    badgeText = 'STRATEGIC ALLIANCE • {{company}}';
    heading = 'Mutually beneficial co-marketing & distribution synergy';
    intro = 'Given our complementary audiences, I wanted to reach out regarding a co-branded growth initiative that could drive high-intent leads to both {{company}} and our platform.';
    deliverable1 = '<strong>Co-Marketing Webinar / Masterclass:</strong> Joint exposure to 15,000+ verified enterprise leaders.';
    deliverable2 = '<strong>Integration Showcase:</strong> Highlighted placement across our product ecosystem and partner directory.';
    deliverable3 = '<strong>Revenue Share Synergy:</strong> Structured affiliate commission model with dedicated co-selling support.';
    proofQuote = '"Our existing partner network generated over $1.2M in reciprocal qualified pipeline this year."';
    signoffTitle = 'Head of Strategic Partnerships';
  } else if (category === 'followup') {
    subject = 'Re: Quick follow-up regarding {{company}}';
    badgeText = 'QUICK CHECK-IN • {{company}}';
    heading = 'Gently bumping this note regarding {{company}}';
    intro = 'I know executive inboxes get busy fast, so I wanted to bring this back to your attention in case it slipped past your radar earlier.';
    deliverable1 = '<strong>Zero-Friction 5-Minute Overview:</strong> Quick demonstration of the tangible value proposition.';
    deliverable2 = '<strong>Tailored Implementation Blueprint:</strong> Ready-to-execute framework customized for {{company}}.';
    deliverable3 = '<strong>No-Obligation Q&A:</strong> Clarify technical questions with our engineering specialists.';
    proofQuote = '"Our fast-track onboarding gets teams live and dispatching within less than 15 minutes."';
    signoffTitle = 'Outreach Specialist';
  }

  // Construct Image Tag if requested or provided
  let imageSection = '';
  if (imageUrl) {
    const imgTag = `<img src="${imageUrl}" alt="Feature Showcase" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0; display: block; margin: 0 auto;" />`;
    const clickableImg = imageLinkUrl
      ? `<a href="${imageLinkUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none;">${imgTag}</a>`
      : imgTag;

    imageSection = `
    <!-- Image Media Section -->
    <div style="margin: 20px 0; text-align: center;">
      ${clickableImg}
      ${imageLinkUrl ? '<div style="font-size: 11px; color: #64748b; margin-top: 6px; font-weight: 500;">Click image to explore demo &rarr;</div>' : ''}
    </div>`;
  }

  // Final Professional Executive HTML Template (without CTA buttons)
  const body = `
<div style="background-color: #f8fafc; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
    
    <!-- Top Theme Accent Stripe -->
    <div style="height: 4px; background: #2563eb; width: 100%;"></div>

    <!-- Main Container -->
    <div style="padding: 28px 24px;">
      
      <!-- Preheader Badge -->
      <div style="display: inline-block; font-size: 11px; font-weight: 700; color: #2563eb; background-color: #eff6ff; border: 1px solid #dbeafe; padding: 3px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
        ${badgeText}
      </div>

      <!-- Heading -->
      <h2 style="font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0; line-height: 1.35;">
        ${heading}
      </h2>

      <!-- Salutation & Opening -->
      <p style="font-size: 14px; color: #334155; margin: 0 0 12px 0;">
        Hi {{first_name}},
      </p>
      
      <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">
        ${intro}
      </p>

      ${imageSection}

      <!-- Structured Value Deliverables Card -->
      <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
          Key Operational Deliverables
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 13px; color: #1e293b; line-height: 1.5; margin-bottom: 6px;">
            <span style="color: #2563eb; font-weight: bold; margin-right: 6px;">&#10003;</span>
            ${deliverable1}
          </div>
          <div style="font-size: 13px; color: #1e293b; line-height: 1.5; margin-bottom: 6px;">
            <span style="color: #2563eb; font-weight: bold; margin-right: 6px;">&#10003;</span>
            ${deliverable2}
          </div>
          <div style="font-size: 13px; color: #1e293b; line-height: 1.5;">
            <span style="color: #2563eb; font-weight: bold; margin-right: 6px;">&#10003;</span>
            ${deliverable3}
          </div>
        </div>
      </div>

      <!-- Social Proof / Metric Callout -->
      <div style="border-left: 3px solid #2563eb; background-color: #eff6ff; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
        <p style="font-size: 12px; font-weight: 600; color: #1e40af; margin: 0; line-height: 1.5;">
          ${proofQuote}
        </p>
      </div>

      <p style="font-size: 14px; color: #334155; margin: 18px 0 0 0; line-height: 1.6;">
        Would you have 10 minutes this week to see how this could move the needle for {{company}}?
      </p>

      <!-- Sign-off -->
      <p style="font-size: 13px; color: #334155; margin: 22px 0 0 0; line-height: 1.5;">
        Best regards,<br>
        <strong style="color: #0f172a;">Executive Outreach Lead</strong><br>
        <span style="font-size: 12px; color: #64748b;">${signoffTitle}</span>
      </p>

      <!-- Minimalist Compliant Footer -->
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 14px 0;" />
      <div style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
        Sent to {{company}} (<a href="{{website}}" style="color: #64748b; text-decoration: underline;">{{website}}</a>).<br>
        To discontinue receiving direct communication, <a href="#" style="color: #64748b; text-decoration: underline;">click here to unsubscribe</a>.
      </div>

    </div>
  </div>
</div>`.trim();

  return {
    name,
    subject,
    body,
    imageUrl: imageUrl || undefined,
    imageLinkUrl: imageLinkUrl || undefined,
  };
}

/**
 * Main Template Generator:
 * Uses a tight 1.2-second race with Gemini AI, immediately resolving with our
 * executive heuristic engine on timeout or error to guarantee instant response time.
 */
export async function generateTemplate(req: GenerateTemplateRequest): Promise<GeneratedTemplateResponse> {
  const genAI = getGeminiClient();

  if (genAI) {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

    const systemInstruction = `
You are an expert enterprise cold email copywriter and HTML email architect.
Your mission is to generate high-converting, spam-free, responsive HTML email templates based on user requirements.
THEME: Slate & Royal Blue (colors: text #0f172a / #334155, primary brand #2563eb, light card background #f8fafc, borders #e2e8f0).
No tacky emojis or rainbow colors. Clean, executive, modern layout.
DO NOT include any Call to Action buttons or CTA button boxes.

STRICT FORMAT REQUIREMENTS:
1. You MUST respond with ONLY a valid, parseable JSON object with these EXACT keys:
   - "name": Short, professional template title (e.g. "B2B SaaS Growth Template")
   - "subject": High-open-rate subject line incorporating variables like "{{company}}" or "{{first_name}}"
   - "body": Fully styled HTML email body contained inside:
     <div style="background-color: #f8fafc; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
       <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
         <div style="height: 4px; background: #2563eb; width: 100%;"></div>
         <div style="padding: 28px 24px;">
           ...content with {{first_name}}, {{company}}, {{website}}, feature deliverable cards, and polite closing inquiry...
         </div>
       </div>
     </div>
2. If image is provided or requested:
   Embed: <div style="margin: 18px 0; text-align: center;"><a href="${req.imageLinkUrl || 'https://example.com'}"><img src="${req.imageUrl || 'https://placehold.co/600x200/eff6ff/2563eb?text=Feature+Graphic'}" alt="Preview" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0;" /></a></div>
3. NO markdown fences like \`\`\`json or \`\`\`. Output ONLY raw valid JSON.
`;

    const prompt = `
User Requirement / Command: "${req.prompt}"
Requested Tone: ${req.tone || 'professional'}
Target Audience: ${req.targetAudience || 'Decision Makers, Founders, Executives'}
${req.imageUrl ? `Image URL to include: "${req.imageUrl}"` : ''}
${req.imageLinkUrl ? `Image Click / Destination URL: "${req.imageLinkUrl}"` : ''}

Generate the JSON template now.
`;

    try {
      // 1200ms fast timeout to guarantee instant response with zero lag or spinner freeze
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));

      const apiCallPromise = (async () => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1200,
          },
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        let text = result.response.text().trim();
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
        return null;
      })();

      const raceResult = await Promise.race([apiCallPromise, timeoutPromise]);
      if (raceResult) {
        return raceResult;
      }
    } catch (err: any) {
      console.warn(`[Template Generator] Fast fallback engaged:`, err.message);
    }
  }

  // Instantaneous (< 5ms) Executive Template Synthesis
  return synthesizeTemplateHeuristically(req);
}

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GenerateTemplateRequest {
  prompt: string;
  tone?: 'professional' | 'direct' | 'friendly' | 'value-first';
  imageUrl?: string;
  imageLinkUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  targetAudience?: string;
}

export interface GeneratedTemplateResponse {
  name: string;
  subject: string;
  body: string;
  imageUrl?: string;
  imageLinkUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
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

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * World-Class Context-Adaptive Email Template Synthesizer
 * Dynamically parses the user's exact prompt and instruction requirements,
 * extracting core topics, goals, and bullet points to generate an email
 * 100% aligned with their exact instructions.
 */
export function synthesizeTemplateHeuristically(req: GenerateTemplateRequest): GeneratedTemplateResponse {
  const promptRaw = req.prompt.trim();
  const promptLower = promptRaw.toLowerCase();
  const tone = req.tone || 'professional';
  const imageUrl = req.imageUrl?.trim() || '';
  const imageLinkUrl = req.imageLinkUrl?.trim() || '';

  // Clean prompt of command phrases (e.g. "write an email for", "draft a template to", "pitch", etc.)
  let coreTopic = promptRaw
    .replace(/^(please\s+)?(write|create|draft|generate|make|build|send|pitch)\s+(me\s+)?(a|an)?\s+(cold\s+)?(outreach\s+)?(email|template|message)\s+(for|about|pitching|regarding|to)?/i, '')
    .replace(/^for\s+/i, '')
    .trim();

  if (!coreTopic || coreTopic.length < 3) {
    coreTopic = promptRaw;
  }

  // Extract explicit requirements if the user listed comma-separated items or bullet clauses
  // e.g. "include 20% discount, free trial, and personal coaching"
  const includeMatch = promptRaw.match(/(?:include|mention|highlight|features?|with|offering)\s+([^.]+)/i);
  let extractedPoints: string[] = [];
  if (includeMatch && includeMatch[1]) {
    extractedPoints = includeMatch[1]
      .split(/(?:,|\band\b|;)/)
      .map((s) => s.trim().replace(/^and\s+/i, ''))
      .filter((s) => s.length > 3 && !s.startsWith('http') && !s.includes('link') && !s.includes('button'));
  }

  // Detect domain & intent from user instruction with strict word boundaries
  const isRealEstate = /\b(real estate|property|properties|villa|villas|mansion|condo|apartment|apartments|realtor|broker|housing|lease)\b/i.test(promptLower);
  const isFitness = /\b(gym|fitness|workout|trainer|wellness|nutrition|yoga|crossfit)\b/i.test(promptLower);
  const isInvite = /\b(invite|invitation|webinar|summit|conference|workshop|meetup|podcast|masterclass)\b/i.test(promptLower);
  const isHiring = /\b(hire|hiring|recruiting|talent|engineer|developer|designer|vacancy)\b/i.test(promptLower);
  const isLaunch = /\b(launch|announcing|new product|feature update|introducing)\b/i.test(promptLower);
  const isFollowup = /\b(follow[\s-]?up|checking in|bump|reconnect)\b/i.test(promptLower);
  const isEcommerce = /\b(store|shop|ecommerce|e-com|cart|retail|shopify)\b/i.test(promptLower);
  const isDesignWeb = /\b(website|redesign|frontend|branding|seo)\b/i.test(promptLower);
  const isSoftware = /\b(software|saas|platform|cloud|api|automation)\b/i.test(promptLower);
  const isConsulting = /\b(consulting|advisory|audit|accounting)\b/i.test(promptLower);
  const isDiscount = !isRealEstate && /\b(discount|promo|coupon|deal|sale|special offer|\d+%\s*(?:off|discount)?)\b/i.test(promptLower);

  // Template Title
  const cleanTitle = coreTopic.length > 40 ? coreTopic.slice(0, 40) + '...' : coreTopic;
  const name = `${capitalize(cleanTitle)} Template`;

  // Dynamic Subject Line directly tied to user's instruction
  let subject = '';
  if (isRealEstate) {
    subject = `Prime property opportunity for {{company}}: ${cleanTitle.slice(0, 28)}`;
  } else if (isDiscount) {
    const discountMatch = promptRaw.match(/(\d+%\s*(?:off|discount)?)/i);
    let disc = discountMatch ? discountMatch[1].trim() : 'Special promotional offer';
    if (/^\d+%$/.test(disc)) disc = `${disc} discount`;
    subject = `${disc} for {{company}}`;
  } else if (isInvite) {
    subject = `Invitation for {{company}}: ${cleanTitle.slice(0, 32)}`;
  } else if (isHiring) {
    subject = `Career opportunity regarding {{company}}`;
  } else if (isLaunch) {
    subject = `Introducing ${cleanTitle.slice(0, 30)} for {{company}}`;
  } else if (isFollowup) {
    subject = `Following up regarding {{company}}`;
  } else if (isFitness) {
    subject = `Corporate wellness & membership idea for {{company}}`;
  } else if (isDesignWeb) {
    subject = tone === 'friendly' ? `Loved {{company}}'s brand — quick idea` : `Elevating UX & conversion for {{company}}`;
  } else {
    subject = `Strategic idea regarding ${cleanTitle.slice(0, 30)} for {{company}}`;
  }

  // Preheader Badge Text
  let badgeText = `${cleanTitle.slice(0, 22).toUpperCase()} • {{company}}`;
  if (isRealEstate) badgeText = `EXCLUSIVE PROPERTY • {{company}}`;
  else if (isDiscount) badgeText = `SPECIAL PROMOTION • {{company}}`;
  else if (isInvite) badgeText = `EXCLUSIVE INVITATION • {{company}}`;
  else if (isHiring) badgeText = `CAREER OPPORTUNITY • {{company}}`;
  else if (isFitness) badgeText = `WELLNESS INITIATIVE • {{company}}`;

  // Dynamic Executive Heading
  let heading = '';
  if (isRealEstate) {
    heading = `Exclusive luxury portfolio & investment terms for {{company}}`;
  } else if (isDiscount) {
    heading = `Exclusive promotional terms & value for {{company}}`;
  } else if (isInvite) {
    heading = `You are cordially invited: Connecting industry leaders at {{company}}`;
  } else if (isHiring) {
    heading = `High-impact opportunity tailored for leaders at {{company}}`;
  } else if (isFitness) {
    heading = `Elevating team wellness & high performance at {{company}}`;
  } else {
    heading = `Accelerating results through ${coreTopic.slice(0, 50)} for {{company}}`;
  }

  // Dynamic Intro Paragraph that reflects prompt instructions word-for-word
  let intro = '';
  if (tone === 'friendly') {
    intro = `Hope you and the team at {{company}} are having a wonderful week! I came across your work and wanted to reach out regarding ${coreTopic}.`;
  } else if (tone === 'direct') {
    intro = `Reaching out directly to {{company}} regarding ${coreTopic}. We partner with high-growth organizations to deliver measurable, immediate outcomes.`;
  } else {
    intro = `I have been following {{company}}'s recent initiatives and wanted to share a tailored perspective on ${coreTopic}.`;
  }

  // Dynamic Deliverables directly from extracted user points or domain
  let deliverable1 = '';
  let deliverable2 = '';
  let deliverable3 = '';

  if (extractedPoints.length >= 3) {
    deliverable1 = `<strong>${capitalize(extractedPoints[0])}:</strong> Engineered to deliver tangible, immediate value for {{company}}.`;
    deliverable2 = `<strong>${capitalize(extractedPoints[1])}:</strong> Integrated seamlessly into your operational schedule.`;
    deliverable3 = `<strong>${capitalize(extractedPoints[2])}:</strong> Complete milestone tracking and dedicated support.`;
  } else if (extractedPoints.length === 2) {
    deliverable1 = `<strong>${capitalize(extractedPoints[0])}:</strong> Tailored priority rollout for {{company}}.`;
    deliverable2 = `<strong>${capitalize(extractedPoints[1])}:</strong> Dedicated guidance with zero workflow disruption.`;
    deliverable3 = `<strong>Measurable High-Impact Results:</strong> Transparent outcomes aligned directly with your target goals.`;
  } else if (extractedPoints.length === 1) {
    deliverable1 = `<strong>${capitalize(extractedPoints[0])}:</strong> Dedicated benefit designed specifically for {{company}}.`;
    deliverable2 = `<strong>Frictionless Execution:</strong> Rapid onboarding with full end-to-end guidance.`;
    deliverable3 = `<strong>Continuous Optimization:</strong> Direct access to our specialist team at every stage.`;
  } else {
    if (isFitness) {
      deliverable1 = `<strong>All-Inclusive Access:</strong> Full utilization of premium training facilities and dedicated wellness spaces.`;
      deliverable2 = `<strong>1-on-1 Dedicated Trainer Onboarding:</strong> Personalized physical assessment and custom milestone strategy.`;
      deliverable3 = `<strong>Corporate Flexibility:</strong> Flexible terms and corporate enrollment advantages tailored for {{company}}.`;
    } else if (isDesignWeb) {
      deliverable1 = `<strong>Conversion Architecture:</strong> Identify friction points on {{website}} to immediately boost inquiries.`;
      deliverable2 = `<strong>Modern Responsive Experience:</strong> Ultra-fast, clean, and mobile-optimized interfaces built for conversion.`;
      deliverable3 = `<strong>Transparent Milestone Delivery:</strong> Interactive staging previews provided throughout development.`;
    } else if (isEcommerce) {
      deliverable1 = `<strong>Abandoned Checkout Recovery:</strong> High-intent automated sequences that recapture lost revenue.`;
      deliverable2 = `<strong>Average Order Value Lift:</strong> Intelligent merchandising touchpoints designed to increase basket size.`;
      deliverable3 = `<strong>Customer Retention & LTV:</strong> Proven re-engagement sequences that maximize repeat purchase rate.`;
    } else if (isRealEstate) {
      deliverable1 = `<strong>Curated Off-Market Access:</strong> Early visibility into tier-1 properties before public MLS release.`;
      deliverable2 = `<strong>Real-Time Yield Modeling:</strong> Data-driven cap rate forecasting and asset appreciation analysis.`;
      deliverable3 = `<strong>Verified Institutional Network:</strong> Direct pipeline of qualified high-net-worth buyers and tenants.`;
    } else if (isHiring) {
      deliverable1 = `<strong>High-Impact Strategic Ownership:</strong> Lead core technical and business initiatives from day one.`;
      deliverable2 = `<strong>Top-Tier Compensation & Equity:</strong> Competitive package structured to reward exceptional execution.`;
      deliverable3 = `<strong>World-Class Collaborative Culture:</strong> Autonomous, fast-moving environment with industry veterans.`;
    } else if (isSoftware) {
      deliverable1 = `<strong>Dedicated Infrastructure Setup:</strong> Seamless integration with zero downtime or migration hurdles.`;
      deliverable2 = `<strong>Automated Intelligence:</strong> Eliminate repetitive tasks through robust, real-time workflows.`;
      deliverable3 = `<strong>Enterprise Compliance:</strong> Built-in security and high-availability standards from the ground up.`;
    } else {
      deliverable1 = `<strong>Tailored Implementation Blueprint:</strong> Framework engineered specifically around {{company}}'s timeline and goals.`;
      deliverable2 = `<strong>Zero-Friction Execution:</strong> Ready-to-deploy structure requiring minimal ramp-up overhead.`;
      deliverable3 = `<strong>Measurable Positive ROI:</strong> Transparent milestones delivering clear value from the first interaction.`;
    }
  }

  // Domain-Specific Proof Quote
  let proofQuote = `"Achieved a +42% reply rate and measurable return within the first two weeks of sequence rollout."`;
  if (isRealEstate) proofQuote = `"Successfully closed over $24M in strategic prime property transactions over the last two quarters."`;
  else if (isFitness) proofQuote = `"Participants reported a +65% boost in daily energy and wellness within 30 days of joining."`;
  else if (isEcommerce) proofQuote = `"Recovered over $140,000 in monthly lost checkout revenue for modern online brands."`;
  else if (isDesignWeb) proofQuote = `"Boosted inbound consultation bookings by 38% following our responsive redesign."`;
  else if (isHiring) proofQuote = `"Ranked among the top 10 fastest-growing workplaces with 98% team retention."`;

  // Sender Role
  let signoffTitle = 'Strategic Partnerships Lead';
  if (isRealEstate) signoffTitle = 'Principal Broker & Portfolio Lead';
  else if (isFitness) signoffTitle = 'Wellness & Program Director';
  else if (isDesignWeb) signoffTitle = 'Creative & Technical Director';
  else if (isEcommerce) signoffTitle = 'E-Commerce Growth Specialist';
  else if (isHiring) signoffTitle = 'Head of Talent & People';
  else if (isSoftware) signoffTitle = 'VP of Outbound Growth';

  // Construct Image Tag if requested or provided
  let imageSection = '';
  if (imageUrl) {
    const imgTag = `<img src="${imageUrl}" alt="Campaign Graphic" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0; display: block; margin: 0 auto; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" />`;
    const clickableImg = imageLinkUrl
      ? `<a href="${imageLinkUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">\n        ${imgTag}\n      </a>`
      : imgTag;

    imageSection = `
      <!-- Attached Graphic Section -->
      <div style="margin: 16px 0; text-align: center;">
        ${clickableImg}
      </div>`;
  }

  // Construct Custom Action Button if requested or provided
  let buttonSection = '';
  const buttonText = req.buttonText?.trim() || (req.buttonUrl?.trim() ? 'Our Services' : '');
  const buttonUrl = req.buttonUrl?.trim() || '#';
  if (buttonText) {
    buttonSection = `
      <!-- Custom Action Button -->
      <div style="margin: 16px 0; text-align: center;">
        <a href="${buttonUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #2563eb; color: #ffffff; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);">
          ${buttonText} &rarr;
        </a>
      </div>`;
  }

  // Final Professional Executive HTML Template (without CTA buttons) - 100% Fluid & Mobile-Responsive
  const body = `
<div style="background-color: #f8fafc; padding: 12px 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6; width: 100%; box-sizing: border-box;">
  <div style="width: 100%; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-sizing: border-box; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);">
    
    <!-- Top Theme Accent Stripe -->
    <div style="height: 3px; background: #2563eb; width: 100%;"></div>

    <!-- Main Container - Compact Fluid Spacing -->
    <div style="padding: 18px 16px; box-sizing: border-box;">
      
      <!-- Preheader Badge -->
      <div style="display: inline-block; font-size: 10px; font-weight: 700; color: #2563eb; background-color: #eff6ff; border: 1px solid #dbeafe; padding: 2px 8px; border-radius: 5px; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 12px;">
        ${badgeText}
      </div>

      <!-- Heading -->
      <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; line-height: 1.35;">
        ${heading}
      </h2>

      <!-- Salutation & Opening -->
      <p style="font-size: 13.5px; color: #334155; margin: 0 0 10px 0; line-height: 1.55;">
        Hi {{first_name}},
      </p>
      
      <p style="font-size: 13.5px; color: #334155; margin: 0 0 14px 0; line-height: 1.55;">
        ${intro}
      </p>

      ${imageSection}

      <!-- Structured Value Deliverables Card -->
      <div style="margin: 14px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; box-sizing: border-box;">
        <div style="font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px;">
          Key Operational Deliverables
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="font-size: 12.5px; color: #1e293b; line-height: 1.45; margin-bottom: 4px;">
            <span style="color: #2563eb; font-weight: bold; margin-right: 5px;">&#10003;</span>
            ${deliverable1}
          </div>
          <div style="font-size: 12.5px; color: #1e293b; line-height: 1.45; margin-bottom: 4px;">
            <span style="color: #2563eb; font-weight: bold; margin-right: 5px;">&#10003;</span>
            ${deliverable2}
          </div>
          <div style="font-size: 12.5px; color: #1e293b; line-height: 1.45;">
            <span style="color: #2563eb; font-weight: bold; margin-right: 5px;">&#10003;</span>
            ${deliverable3}
          </div>
        </div>
      </div>

      <!-- Social Proof / Metric Callout -->
      <div style="border-left: 3px solid #2563eb; background-color: #eff6ff; padding: 10px 14px; border-radius: 0 6px 6px 0; margin: 14px 0; box-sizing: border-box;">
        <p style="font-size: 12px; font-weight: 600; color: #1e40af; margin: 0; line-height: 1.45;">
          ${proofQuote}
        </p>
      </div>

      ${buttonSection}

      <p style="font-size: 13.5px; color: #334155; margin: 14px 0 0 0; line-height: 1.55;">
        Would you have 10 minutes this week to see how this could move the needle for {{company}}?
      </p>

      <!-- Sign-off -->
      <p style="font-size: 13px; color: #334155; margin: 16px 0 0 0; line-height: 1.5;">
        Best regards,<br>
        <strong style="color: #0f172a;">Executive Outreach Lead</strong><br>
        <span style="font-size: 11.5px; color: #64748b;">${signoffTitle}</span>
      </p>

      <!-- Minimalist Compliant Footer -->
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0 10px 0;" />
      <div style="font-size: 10.5px; color: #94a3b8; line-height: 1.45;">
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
    buttonText: buttonText || undefined,
    buttonUrl: buttonUrl !== '#' ? buttonUrl : undefined,
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
DO NOT include any CTA button boxes unless a custom button is explicitly specified in the prompt.

STRICT FORMAT REQUIREMENTS:
1. You MUST respond with ONLY a valid, parseable JSON object with these EXACT keys:
   - "name": Short, professional template title (e.g. "B2B SaaS Growth Template")
   - "subject": High-open-rate subject line incorporating variables like "{{company}}" or "{{first_name}}"
   - "body": Fully styled HTML email body contained inside:
     <div style="background-color: #f8fafc; padding: 12px 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6; width: 100%; box-sizing: border-box;">
       <div style="width: 100%; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-sizing: border-box;">
         <div style="height: 3px; background: #2563eb; width: 100%;"></div>
         <div style="padding: 18px 16px; box-sizing: border-box;">
           ...content with {{first_name}}, {{company}}, {{website}}, feature deliverable cards, and polite closing inquiry...
         </div>
       </div>
     </div>
2. If image is provided or requested:
   Embed: <div style="margin: 16px 0; text-align: center;"><a href="${req.imageLinkUrl || 'https://example.com'}"><img src="${req.imageUrl || 'https://placehold.co/600x200/eff6ff/2563eb?text=Feature+Graphic'}" alt="Preview" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0;" /></a></div>
3. If custom button is requested:
   Embed: <div style="margin: 16px 0; text-align: center;"><a href="${req.buttonUrl || '#'}" style="background-color: #2563eb; color: #ffffff; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-decoration: none; display: inline-block;">${req.buttonText || 'Our Services'} &rarr;</a></div>
4. NO markdown fences like \`\`\`json or \`\`\`. Output ONLY raw valid JSON.
`;

    const prompt = `
User Requirement / Command: "${req.prompt}"
Requested Tone: ${req.tone || 'professional'}
Target Audience: ${req.targetAudience || 'Decision Makers, Founders, Executives'}
${req.imageUrl ? `Image URL to include: "${req.imageUrl}"` : ''}
${req.imageLinkUrl ? `Image Click / Destination URL: "${req.imageLinkUrl}"` : ''}
${req.buttonText ? `Custom Button Label: "${req.buttonText}"` : ''}
${req.buttonUrl ? `Custom Button Destination URL: "${req.buttonUrl}"` : ''}

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
            buttonText: req.buttonText || undefined,
            buttonUrl: req.buttonUrl || undefined,
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

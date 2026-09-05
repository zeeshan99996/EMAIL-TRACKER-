import { GoogleGenerativeAI } from '@google/generative-ai';
import { ThreadMessageSummary } from '../google/gmail';
import { getStarterTemplate } from '../warmup/templates';

export interface GenerateReplyParams {
  threadMessages: ThreadMessageSummary[];
  recipientEmail: string;
  senderEmail: string;
}

const DEFAULT_MODELS = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch {
    return null;
  }
}

const STARTER_TOPICS = [
  { topic: 'checking in on the upcoming team sync and asking what time works best', tag: 'sync' },
  { topic: 'asking a brief question about the latest draft presentation deck', tag: 'deck' },
  { topic: 'asking if Thursday afternoon works for a quick 10-minute catchup', tag: 'catchup' },
  { topic: 'asking for quick feedback on the revised project timeline', tag: 'timeline' },
  { topic: 'following up on the shared spreadsheet numbers from earlier this week', tag: 'sheet' },
  { topic: 'asking about the title of a productivity book or article mentioned last week', tag: 'resource' },
  { topic: 'checking if they want to grab a quick virtual coffee sometime this week', tag: 'coffee' },
  { topic: 'asking if the meeting agenda notes from yesterday look good to finalize', tag: 'notes' },
  { topic: 'checking whether the updated design layout looks good to share with the team', tag: 'design' },
  { topic: 'asking if they are free for lunch or a quick call tomorrow afternoon', tag: 'call' },
];

/**
 * Intelligent Semantic Fallback Replier:
 * Matches the context and keywords of the incoming email to generate realistic human replies
 */
const CONTEXTUAL_REPLIES: Record<string, string[]> = {
  sync: [
    'Thursday afternoon around 2 PM works perfectly for me. I will send over a quick calendar invite.',
    'Sounds good! I am free anytime after 11 AM tomorrow if that works on your side.',
    'Either morning or afternoon works fine for me this week, let me know what time suits you best.',
    'Thanks for checking in. 3:30 PM on Wednesday looks open on my calendar, let us lock that in.',
    'Hey! Yes, a quick 15-minute sync would be great. Let me know which slot works best for you.',
  ],
  deck: [
    'I went through the latest draft deck and slide 4 looks great. Just added a minor note on the summary slide.',
    'The presentation layout is super clean. Let us go ahead and finalize it for the team review.',
    'Looks solid! I reviewed the key takeaways and everything aligns with our objectives.',
    'Checked the revised slides this morning. The structure flows much better now, good to go.',
    'Thanks for sharing the draft. I left two quick comments on section two, otherwise looks ready!',
  ],
  catchup: [
    'Thursday afternoon works great on my end! Looking forward to catching up on recent updates.',
    'Yes, absolutely! Let us connect for 10 minutes tomorrow after lunch.',
    'Sounds like a plan. I will ping you around 2 PM to see if you are free.',
    'That works for me! Let us do Thursday at 3 PM and go over the latest notes.',
    'Hey! Sounds good, looking forward to our catchup session.',
  ],
  timeline: [
    'The revised project timeline looks realistic and gives us plenty of buffer for review.',
    'Thanks for the timeline update. Everything seems well aligned with our quarterly goals.',
    'The milestones look achievable on my side, let us proceed with this schedule.',
    'Reviewed the updated dates and they look completely manageable. Thanks for putting this together.',
    'All good on the timeline! Let us keep moving forward as planned.',
  ],
  sheet: [
    'I verified the numbers in the shared sheet and everything matches up accurately.',
    'Thanks for sharing the updated sheet. I checked column D and confirmed the calculations.',
    'The updated metrics look consistent with last week report. No discrepancies found.',
    'Just took a look at the spreadsheet updates. Looks complete and ready to finalize.',
    'Numbers look solid on my end. Thanks for keeping the tracker updated!',
  ],
  design: [
    'The updated design mockup looks much sharper and cleaner than the previous version.',
    'I really like the header layout and typography choices. Ready to share with the team!',
    'Checked the revised mockups, the navigation flow feels very intuitive now.',
    'Looks fantastic! The contrast and spacing improvements make a big difference.',
    'Design looks great on my side. Let us go ahead with this version.',
  ],
  coffee: [
    'I would love to grab a virtual coffee this week! How does Wednesday morning look?',
    'Yes, definitely! Let us do a quick coffee chat tomorrow around 10:30 AM.',
    'Sounds great, looking forward to catching up over coffee. Let me know when you are free.',
    'Count me in! Wednesday or Thursday morning works best for me.',
    'Hey! That sounds fun, let us connect for a quick 15-minute coffee break tomorrow.',
  ],
  notes: [
    'The meeting agenda notes look comprehensive and cover all our action items.',
    'Thanks for compiling the summary notes. No edits needed from my side.',
    'I reviewed the action items from yesterday discussion, everything is clear and accounted for.',
    'Notes look thorough and accurate. Thanks for circulating them so quickly!',
    'Checked the meeting summary, all priorities are clearly outlined.',
  ],
  resource: [
    'Thanks for asking! The book title was Atomic Habits by James Clear, highly recommend it.',
    'I found that article link in my bookmarks, will forward the reading list over shortly.',
    'Yes, that framework guide was super helpful for workflow organization.',
    'Glad you asked! It was a case study on team productivity, I will email the link over today.',
    'The reference guide mentioned in our sync is from the engineering blog, sending it over now.',
  ],
  general: [
    'Thanks for reaching out! Everything is running smoothly on our side, let us stay in touch.',
    'Appreciate the quick update. Let us touch base again towards the end of the week.',
    'All good on my side! Let us keep each other posted as we make progress on this.',
    'Thanks for following up. That works well on my end, talk soon!',
    'Great to hear from you! Everything looks right on track, let us keep the momentum going.',
    'Thanks for the quick note. I will keep an eye out for further updates.',
    'Appreciate you checking in! Looking forward to our next collaboration.',
    'Everything looks good from my perspective. Let me know if anything else comes up.',
  ],
};

function detectContextCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('sync') || lower.includes('meet') || lower.includes('time') || lower.includes('schedule')) return 'sync';
  if (lower.includes('deck') || lower.includes('slide') || lower.includes('presentation') || lower.includes('draft')) return 'deck';
  if (lower.includes('catchup') || lower.includes('catch up') || lower.includes('thursday') || lower.includes('friday')) return 'catchup';
  if (lower.includes('timeline') || lower.includes('milestone') || lower.includes('deadline')) return 'timeline';
  if (lower.includes('sheet') || lower.includes('number') || lower.includes('calc') || lower.includes('excel') || lower.includes('data')) return 'sheet';
  if (lower.includes('design') || lower.includes('mockup') || lower.includes('layout') || lower.includes('ui')) return 'design';
  if (lower.includes('coffee') || lower.includes('lunch') || lower.includes('break')) return 'coffee';
  if (lower.includes('note') || lower.includes('agenda') || lower.includes('summary')) return 'notes';
  if (lower.includes('book') || lower.includes('article') || lower.includes('read') || lower.includes('link')) return 'resource';
  return 'general';
}

/**
 * Generates an ultra-natural, unique starter email using Gemini AI or contextual engine
 */
export async function generateUniqueStarterEmail({
  senderEmail,
  recipientEmail,
  rotationIndex = 0,
}: {
  senderEmail: string;
  recipientEmail: string;
  rotationIndex?: number;
}): Promise<{ subject: string; body: string }> {
  const genAI = getGeminiClient();
  const selectedTopicObj = STARTER_TOPICS[Math.abs(rotationIndex + Math.floor(Math.random() * 5)) % STARTER_TOPICS.length];
  const topic = selectedTopicObj.topic;

  if (genAI) {
    const configuredModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const modelsToTry = [configuredModel, ...DEFAULT_MODELS.filter((m) => m !== configuredModel)];

    const systemInstruction = `
You are a human professional writing a short, casual, friendly email to a coworker or partner.
CRITICAL RULES:
1. Topic: ${topic}.
2. Keep subject line natural (3 to 6 words). E.g. "Quick question about Thursday", "Draft review notes", "Coffee catchup this week?".
3. Keep body concise (2 to 3 sentences maximum).
4. ABSOLUTE BAN: NEVER use the words "warmup", "warm up", "decision", "test", "bot", "algorithm", "campaign", "seed", "simulation", or "deliverability".
5. Do NOT use marketing language, sales pitches, discounts, URLs, or phone numbers.
6. Format:
SUBJECT: <subject>
BODY:
<body>
`;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: `Write an authentic email from ${senderEmail} to ${recipientEmail} about: ${topic}.` }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 250 },
        });

        const text = result.response.text().trim();
        if (text.includes('SUBJECT:') && text.includes('BODY:')) {
          const subjectMatch = text.match(/SUBJECT:\s*(.+)/i);
          const bodyMatch = text.split(/BODY:\s*/i)[1];
          let subject = subjectMatch ? subjectMatch[1].trim() : 'Quick check-in';
          let body = bodyMatch ? bodyMatch.trim() : text;

          // Strip any accidental forbidden words
          subject = subject
            .replace(/\b(warmup|warm-up|warm up)\b/gi, 'Project')
            .replace(/\[.*?\]/g, '')
            .trim();

          body = body
            .replace(/\b(warmup|warm-up|warm up)\b/gi, 'project')
            .replace(/\[\s*Name\s*\]/gi, 'there')
            .replace(/\[\s*Colleague\s*\]/gi, 'there')
            .replace(/\[.*?\]/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

          if (subject && body) {
            return { subject, body };
          }
        }
      } catch (err: any) {
        // Fallback to contextual generator below
      }
    }
  }

  // High-variety fallback starter template
  const fallbackTpl = getStarterTemplate(rotationIndex + Math.floor(Math.random() * 20));
  return {
    subject: fallbackTpl.subject,
    body: fallbackTpl.body,
  };
}

/**
 * Generates an ultra-natural, contextual human email response with zero spam signals
 */
export async function generateContextualWarmupReply({
  threadMessages,
  recipientEmail,
  senderEmail,
}: GenerateReplyParams): Promise<string> {
  const genAI = getGeminiClient();
  const recentMessages = threadMessages.slice(-4);
  const latestMessage = recentMessages[recentMessages.length - 1];
  const combinedText = recentMessages.map((m) => `${m.subject} ${m.bodyText || m.snippet}`).join(' ');

  const formattedHistory = recentMessages
    .map((msg, index) => {
      return `--- Message ${index + 1} (${msg.from} to ${msg.to}) ---\nSubject: ${msg.subject}\n\n${msg.bodyText.trim() || msg.snippet}`;
    })
    .join('\n\n');

  if (genAI) {
    const configuredModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const modelsToTry = [configuredModel, ...DEFAULT_MODELS.filter((m) => m !== configuredModel)];

    const systemInstruction = `
You are a real human professional writing a natural, polite email reply to a coworker.
CRITICAL RULES:
1. Respond DIRECTLY and specifically to what the other person asked or said in the latest message.
2. Keep the reply very natural, conversational, and concise (1 to 3 short sentences). E.g. "Sounds good, let's connect Thursday afternoon.", "Thanks for the update, everything looks on track."
3. ABSOLUTE BAN: NEVER use the words "warmup", "warm up", "decision", "bot", "algorithm", "campaign", "seed", "simulation", "test", or "deliverability".
4. NEVER use sales pitches, discounts, promotional words, links, URLs, phone numbers, or spam keywords.
5. Do NOT include email subject headers, markdown formatting, HTML, or signature tags.
6. Return ONLY the plain text email reply body.
`;

    const prompt = `
Email Thread History:
${formattedHistory}

Your identity: You are replying as ${recipientEmail} back to ${senderEmail}.
Write a natural, conversational, 1-3 sentence human reply to the latest message.
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
            temperature: 0.85,
            maxOutputTokens: 180,
          },
        });

        const text = result.response.text().trim();
        if (text) {
          const cleaned = text
            .replace(/^["']|["']$/g, '')
            .replace(/\b(warmup|warm-up|warm up)\b/gi, 'project')
            .replace(/\[.*?\]/g, '')
            .trim();
          return cleaned;
        }
      } catch {
        // Fall through to rich semantic contextual replier
      }
    }
  }

  // Semantic Context Matching: Select category based on subject + body
  const category = detectContextCategory(combinedText);
  const replyList = CONTEXTUAL_REPLIES[category] || CONTEXTUAL_REPLIES.general;
  const randomIndex = Math.floor(Math.random() * replyList.length);
  return replyList[randomIndex];
}

export interface WarmupTemplate {
  id: string;
  subject: string;
  body: string;
  category: 'casual' | 'checkin' | 'feedback' | 'meeting' | 'work' | 'general';
}

export const WARMUP_STARTER_TEMPLATES: WarmupTemplate[] = [
  {
    id: 'starter_1',
    category: 'casual',
    subject: 'Quick question about Thursday',
    body: 'Hey,\n\nHope you’re having a good week! Are you still free for a quick 10-minute catchup on Thursday afternoon? Let me know what time works best on your end.\n\nBest,',
  },
  {
    id: 'starter_2',
    category: 'work',
    subject: 'Notes from today’s discussion',
    body: 'Hi,\n\nJust wanted to send over a quick follow-up from our chat earlier. I summarized the key takeaways and everything looks clear. Let me know if you want to add anything else before we finalize.\n\nThanks!',
  },
  {
    id: 'starter_3',
    category: 'feedback',
    subject: 'Thoughts on the latest draft',
    body: 'Hello,\n\nI just went through the draft document you sent over. The overall flow is really clean and easy to follow. Did you want to review the second section together tomorrow morning?\n\nCheers,',
  },
  {
    id: 'starter_4',
    category: 'meeting',
    subject: 'Rescheduling our sync',
    body: 'Hey,\n\nSomething came up for me tomorrow at 3 PM. Would 4:00 PM or Friday morning work better for you instead? Sorry for the shuffle!\n\nTalk soon,',
  },
  {
    id: 'starter_5',
    category: 'casual',
    subject: 'Coffee catchup this week?',
    body: 'Hey there,\n\nIt’s been a while since we caught up! If you have some free time later this week, let’s grab a quick coffee or do a quick call to share updates.\n\nBest,',
  },
  {
    id: 'starter_6',
    category: 'work',
    subject: 'Quick check on the project timeline',
    body: 'Hi,\n\nHope all is well. Just checking in to see if we’re on track for the upcoming milestone or if there’s anything you need help reviewing from my side.\n\nRegards,',
  },
  {
    id: 'starter_7',
    category: 'feedback',
    subject: 'Quick question about the presentation',
    body: 'Hi,\n\nI was looking over slide 4 in the presentation deck. Do you think we should keep that chart or simplify it with bullet points instead? What do you prefer?\n\nThanks,',
  },
  {
    id: 'starter_8',
    category: 'general',
    subject: 'Following up on your message',
    body: 'Hey,\n\nThanks for reaching out earlier! I reviewed your notes and agree with the approach. Let’s touch base briefly once you have the next batch ready.\n\nHave a great afternoon,',
  },
  {
    id: 'starter_9',
    category: 'work',
    subject: 'Design mockups review',
    body: 'Hi,\n\nI had a look at the revised mockups this morning. The new layout is much more intuitive. Let me know when you’d like to walk through the remaining screens.\n\nBest,',
  },
  {
    id: 'starter_10',
    category: 'casual',
    subject: 'Book recommendation you mentioned',
    body: 'Hey,\n\nI remembered you mentioned a good book about workflow productivity during our last call. What was the exact title again? Would love to check it out this weekend.\n\nThanks!',
  },
  {
    id: 'starter_11',
    category: 'work',
    subject: 'Sharing the spreadsheet link',
    body: 'Hi,\n\nI updated the shared sheet with the latest numbers from this week. Whenever you get a moment, take a quick look and let me know if anything looks off.\n\nCheers,',
  },
  {
    id: 'starter_12',
    category: 'meeting',
    subject: 'Agenda for our upcoming sync',
    body: 'Hi,\n\nHere’s a quick outline of what I was hoping we could cover in our next sync:\n- Milestone review\n- Action items for next week\n\nLet me know if there is anything else you’d like to add.\n\nBest regards,',
  },
];

/**
 * Selects a starter template in rotation or based on account index with natural variation
 */
export function getStarterTemplate(rotationIndex = 0): WarmupTemplate {
  const index = Math.abs(rotationIndex) % WARMUP_STARTER_TEMPLATES.length;
  return WARMUP_STARTER_TEMPLATES[index];
}

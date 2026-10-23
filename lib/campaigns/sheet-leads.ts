export interface LeadItem {
  row: number;
  name: string;
  email: string;
  company: string;
  status: string;
  sentAt?: string;
}

// In-memory demo lead pool with realistic deliverable mailboxes and test trap domains
export let DEMO_LEADS_STORE: LeadItem[] = [
  { row: 2, name: 'Alex Rivera', email: 'alex.rivera.leads@gmail.com', company: 'FinTech Pulse', status: 'PENDING' },
  { row: 3, name: 'Samantha Chen', email: 'samantha.chen.ai@outlook.com', company: 'CloudScale AI', status: 'PENDING' },
  { row: 4, name: 'Marcus Brody', email: 'marcus.brody.biz@yahoo.com', company: 'Nexus Growth', status: 'PENDING' },
  { row: 5, name: 'Elena Rostova', email: 'elena.rostova@icloud.com', company: 'Vanguard Ventures', status: 'SENT ✅', sentAt: 'Oct 23, 10:15 AM' },
  { row: 6, name: 'Tariq Mahmood', email: 'tariq.erha@erhatechnologies.com', company: 'Apex Solutions', status: 'PENDING' },
  { row: 7, name: 'Jessica Vance', email: 'jessica.v@spamburner-fake.mailinator.com', company: 'Ghost Lab (Test Trap)', status: 'PENDING' }, // Disposable to demonstrate verifier
  { row: 8, name: 'David Kim', email: 'david.kim.hyperion@gmail.com', company: 'Hyperion Labs', status: 'PENDING' },
  { row: 9, name: 'Rachel Adams', email: 'rachel.adams.partners@outlook.com', company: 'Summit Capital', status: 'PENDING' },
  { row: 10, name: 'Omar Farooq', email: 'omar.farooq.dev@gmail.com', company: 'TurboTech Global', status: 'PENDING' },
  { row: 11, name: 'Sophia Sterling', email: 'sophia.sterling.media@yahoo.com', company: 'Sterling Media', status: 'PENDING' },
  { row: 12, name: 'Liam O’Connor', email: 'liam.oconnor.ventures@gmail.com', company: 'Celtic Ventures', status: 'PENDING' },
  { row: 13, name: 'Temp Mail Trap', email: 'throwaway_lead@10minutemail.com', company: 'Scraper Test (Fake)', status: 'PENDING' }, // Disposable to demonstrate verifier
  { row: 14, name: 'Daniel Wright', email: 'daniel.wright.flow@outlook.com', company: 'Catalyst Flow', status: 'PENDING' },
  { row: 15, name: 'Zoya Khan', email: 'zoya.khan.horizon@gmail.com', company: 'Prime Horizon', status: 'PENDING' },
  { row: 16, name: 'Ethan Hunt', email: 'ethan.hunt.marketing@gmail.com', company: 'Mirage Marketing', status: 'SENT ✅', sentAt: 'Oct 23, 11:30 AM' },
];

export function resetDemoLeadsStore() {
  DEMO_LEADS_STORE = DEMO_LEADS_STORE.map(l => ({
    ...l,
    status: l.status.includes('SENT') ? 'SENT ✅' : 'PENDING',
    sentAt: l.status.includes('SENT') ? l.sentAt : ''
  }));
  return DEMO_LEADS_STORE;
}

export function setDemoLeadsStore(leads: LeadItem[]) {
  DEMO_LEADS_STORE = leads;
}

export function updateInMemoryLeadStatuses(updates: { row?: number; email?: string; status?: string; sentAt?: string }[]) {
  for (const update of updates) {
    const found = DEMO_LEADS_STORE.find(
      (l) => (update.row && l.row === update.row) || (update.email && l.email.toLowerCase() === update.email.toLowerCase())
    );
    if (found) {
      if (update.status) found.status = update.status;
      if (update.sentAt) found.sentAt = update.sentAt;
    }
  }
}

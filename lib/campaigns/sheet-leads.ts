export interface LeadItem {
  row: number;
  name: string;
  email: string;
  company: string;
  status: string;
  sentAt?: string;
}

// Clean in-memory lead store ready for Google Sheet or manual import
export let DEMO_LEADS_STORE: LeadItem[] = [];

export function resetDemoLeadsStore() {
  DEMO_LEADS_STORE = DEMO_LEADS_STORE.map(l => ({
    ...l,
    status: l.status.includes('SENT') ? 'SENT' : 'PENDING',
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

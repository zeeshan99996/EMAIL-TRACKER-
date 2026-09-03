import { Email, EmailEvent, EmailLink, ApiKey, Project } from './types';

// Default Demo Project & API Key (for zero-config local testing and Google Apps Script connectivity)
export const DEMO_PROJECT: Project = {
  id: 'prj_demo_01',
  account_id: 'acc_demo_01',
  name: 'ERHA Technologies Outreach',
  description: 'Primary outbound sales and marketing emails',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_API_KEYS: ApiKey[] = [
  {
    id: 'key_demo_01',
    project_id: DEMO_PROJECT.id,
    name: 'Apps Script Outbound Key',
    key_hash: '5af62ee581a710f47f714347ef0cc6ca1c6700008feba75991506fbdea07a123', // SHA256 of ek_live_demo123456789
    key_prefix: 'ek_live_demo1...',
    last_used_at: null,
    created_at: new Date().toISOString(),
    revoked_at: null,
  },
];

// Clean Real-Time State (Starts at 0 - No dummy emails, links, or events)
export let DEMO_EMAILS: Email[] = [];
export let DEMO_EMAIL_LINKS: EmailLink[] = [];
export let DEMO_EMAIL_EVENTS: EmailEvent[] = [];

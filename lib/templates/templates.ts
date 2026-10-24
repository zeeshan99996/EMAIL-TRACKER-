export interface CustomTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isCustom?: boolean;
  imageUrl?: string;
  imagePosition?: 'top' | 'middle' | 'bottom';
  updatedAt?: string;
}

export const TEMPLATES_STORAGE_KEY = 'erha_custom_campaign_templates';

export const PRESET_TEMPLATES: CustomTemplate[] = [
  {
    id: 'b2b-web',
    name: 'B2B Web & Tech Modernization',
    subject: 'Quick idea for {{company}} website & growth',
    body: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
  <p>Hi {{first_name}},</p>
  <p>I was taking a look at {{company}}'s recent initiatives and really admired the work your team is doing.</p>
  <p>We recently helped a similar company scale their outbound reach and optimize their web conversion by over 38%.</p>
  <p style="margin: 20px 0;">
    <a href="https://erhatechnologies.com/services" style="background-color: #2563eb; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
      View Our Case Studies & Scope
    </a>
  </p>
  <p>Would you be open to a quick 10-minute chat this Thursday to see if this could be relevant for {{company}}?</p>
  <p>Best regards,<br><strong>Outreach Team</strong></p>
</div>`,
  },
  {
    id: 'partnership',
    name: 'Strategic Partnership Intro',
    subject: 'Partnership scope with {{company}}',
    body: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
  <p>Hey {{first_name}},</p>
  <p>Hope you are having a productive week.</p>
  <p>We are expanding our network with technology leaders like {{company}} to collaborate on enterprise email deliverability and analytics.</p>
  <p>Here is our scope overview: <a href="https://erhatechnologies.com/portfolio" style="color: #2563eb; font-weight: bold;">Explore Platform Overview</a></p>
  <p>Are you free for a brief call next week to explore potential synergy?</p>
  <p>Warmly,<br><strong>Partnership Director</strong></p>
</div>`,
  },
  {
    id: 'follow-up',
    name: 'Gentle Friendly Follow-Up',
    subject: 'Following up on our note for {{company}}',
    body: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
  <p>Hi {{first_name}},</p>
  <p>I know schedules can get very busy, so I wanted to float this to the top of your inbox.</p>
  <p>Did you get a chance to review the proposal we shared for {{company}}?</p>
  <p>Happy to answer any questions or share a quick 2-minute walkthrough video.</p>
  <p>Best regards,<br><strong>Outreach Team</strong></p>
</div>`,
  },
];

export function getStoredCustomTemplates(): CustomTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse custom templates:', e);
    return [];
  }
}

export function getAllTemplates(): CustomTemplate[] {
  const customs = getStoredCustomTemplates();
  return [...PRESET_TEMPLATES, ...customs];
}

export function saveCustomTemplate(template: Omit<CustomTemplate, 'id'> & { id?: string }): CustomTemplate {
  const customs = getStoredCustomTemplates();
  const id = template.id || `custom_${Date.now()}`;
  const now = new Date().toISOString();
  
  const newOrUpdated: CustomTemplate = {
    ...template,
    id,
    isCustom: true,
    updatedAt: now,
  };

  const existingIdx = customs.findIndex((t) => t.id === id);
  let updatedList: CustomTemplate[];
  if (existingIdx >= 0) {
    updatedList = [...customs];
    updatedList[existingIdx] = newOrUpdated;
  } else {
    updatedList = [newOrUpdated, ...customs];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedList));
  }
  return newOrUpdated;
}

export function deleteCustomTemplate(id: string): CustomTemplate[] {
  const customs = getStoredCustomTemplates();
  const filtered = customs.filter((t) => t.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));
  }
  return filtered;
}

import { LeadItem } from './sheet-leads';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const DOMAIN_REGEX = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+(?:com|ae|org|io|net|co|ai|in|me|store|shop|online|tech|dev|app|cc|info)[^\s]*/i;
const PHONE_REGEX = /^[\d\s+\-().]{7,20}$/;

/**
 * Checks if the given URL points directly to a Google Sheets document.
 */
export function isGoogleSheetUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.includes('docs.google.com/spreadsheets') ||
    trimmed.includes('sheets.google.com')
  );
}

/**
 * Converts a Google Sheets URL into its public CSV export URL.
 * Handles standard edit URLs, sharing URLs, and published pubhtml URLs.
 */
export function getGoogleSheetCsvUrl(url: string): string | null {
  if (!isGoogleSheetUrl(url)) return null;
  const trimmed = url.trim();

  // Published web sheet (e.g., /spreadsheets/d/e/2PACX-.../pubhtml)
  if (trimmed.includes('/pubhtml') || trimmed.includes('/pub?')) {
    return trimmed.replace(/\/pubhtml(?:\?.*)?$/, '/pub?output=csv');
  }

  // Standard sheet URL with ID: /spreadsheets/d/<SHEET_ID>
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch || !idMatch[1]) return null;

  const sheetId = idMatch[1];
  const gidMatch = trimmed.match(/[#?&]gid=([0-9]+)/);
  const gid = gidMatch && gidMatch[1] ? gidMatch[1] : '0';

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

/**
 * Robust CSV parser that handles quotes, escaped quotes, and commas within fields.
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuote) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        insideQuote = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // Skip CR
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Converts raw Google Sheets CSV content into normalized LeadItem objects.
 * Automatically identifies columns regardless of naming conventions.
 */
export function convertCsvToLeads(csvText: string): {
  success: boolean;
  sheetTitle?: string;
  leads: LeadItem[];
  error?: string;
  isPrivate?: boolean;
} {
  const trimmed = (csvText || '').trim();

  // Detect if Google returned an HTML login page (private/restricted sheet)
  if (
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<html') ||
    trimmed.includes('accounts.google.com') ||
    trimmed.includes('ServiceLogin')
  ) {
    return {
      success: false,
      leads: [],
      isPrivate: true,
      error:
        'This Google Sheet is private. In Google Sheets, click "Share" (top right), change General Access to "Anyone with the link can view", then click Connect again.',
    };
  }

  const rows = parseCSV(trimmed);
  if (!rows || rows.length < 2) {
    return {
      success: false,
      leads: [],
      error: 'The Google Sheet appears empty or does not have at least one header row and one lead row.',
    };
  }

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const dataRows = rows.slice(1);

  // Column Index Resolvers
  let emailColIdx = -1;
  let nameColIdx = -1;
  let companyColIdx = -1;
  let websiteColIdx = -1;
  let phoneColIdx = -1;
  let statusColIdx = -1;

  headers.forEach((h, idx) => {
    if (emailColIdx === -1 && (h.includes('email') || h.includes('e-mail') || h === 'mail')) {
      emailColIdx = idx;
    }
    if (nameColIdx === -1 && (h.includes('name') || h === 'contact' || h === 'person' || h === 'lead')) {
      nameColIdx = idx;
    }
    if (companyColIdx === -1 && (h.includes('company') || h.includes('organization') || h.includes('business') || h.includes('store') || h.includes('brand'))) {
      companyColIdx = idx;
    }
    if (websiteColIdx === -1 && (h.includes('website') || h.includes('url') || h.includes('domain') || h.includes('site') || h.includes('link'))) {
      websiteColIdx = idx;
    }
    if (phoneColIdx === -1 && (h.includes('phone') || h.includes('mobile') || h.includes('cell') || h.includes('tel') || h.includes('contact no'))) {
      phoneColIdx = idx;
    }
    if (statusColIdx === -1 && (h.includes('status') || h.includes('stage') || h.includes('outreach'))) {
      statusColIdx = idx;
    }
  });

  // Heuristic Column Fallback: If header did not explicitly specify "email", inspect first 5 rows for an email address
  if (emailColIdx === -1) {
    const sampleRows = dataRows.slice(0, 5);
    for (let c = 0; c < headers.length; c++) {
      const colEmails = sampleRows.filter((r) => r[c] && EMAIL_REGEX.test(r[c]));
      if (colEmails.length > 0) {
        emailColIdx = c;
        break;
      }
    }
  }

  // If still no email column found, we cannot reliably dispatch emails
  if (emailColIdx === -1) {
    return {
      success: false,
      leads: [],
      error: 'Could not find an Email column in your Google Sheet. Please ensure one column contains email addresses.',
    };
  }

  const leads: LeadItem[] = [];

  dataRows.forEach((row, idx) => {
    const rawEmail = row[emailColIdx] ? row[emailColIdx].trim() : '';
    let detectedEmail = '';
    if (EMAIL_REGEX.test(rawEmail)) {
      detectedEmail = rawEmail.match(EMAIL_REGEX)![0];
    } else {
      // Check other fields in this row
      for (const field of row) {
        if (field && EMAIL_REGEX.test(field)) {
          detectedEmail = field.match(EMAIL_REGEX)![0];
          break;
        }
      }
    }

    // Skip empty rows without emails
    if (!detectedEmail) return;

    let detectedName = nameColIdx !== -1 && row[nameColIdx] ? row[nameColIdx].trim() : '';
    let detectedCompany = companyColIdx !== -1 && row[companyColIdx] ? row[companyColIdx].trim() : '';
    let detectedWebsite = websiteColIdx !== -1 && row[websiteColIdx] ? row[websiteColIdx].trim() : '';
    let detectedPhone = phoneColIdx !== -1 && row[phoneColIdx] ? row[phoneColIdx].trim() : '';
    let detectedStatus = statusColIdx !== -1 && row[statusColIdx] ? row[statusColIdx].trim() : 'PENDING';

    // Heuristics: extract website domain if available
    if (detectedWebsite && DOMAIN_REGEX.test(detectedWebsite)) {
      detectedWebsite = detectedWebsite.match(DOMAIN_REGEX)![0];
    }

    // Fallback: derive company from name or email domain if empty
    if (!detectedCompany) {
      if (detectedWebsite) {
        const cleanDomain = detectedWebsite.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('.')[0];
        detectedCompany = cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
      } else {
        const domainPart = detectedEmail.split('@')[1]?.split('.')[0] || 'Organization';
        detectedCompany = domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
      }
    }

    if (!detectedName) {
      const emailPrefix = detectedEmail.split('@')[0].replace(/[._-]/g, ' ');
      detectedName = emailPrefix
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Valued Contact';
    }

    leads.push({
      id: idx + 1,
      row: idx + 2, // 1-indexed, row 1 is header
      name: detectedName,
      email: detectedEmail,
      company: detectedCompany,
      website: detectedWebsite,
      phone: detectedPhone,
      status: detectedStatus.toUpperCase().includes('SENT') ? 'SENT' : 'PENDING',
      sentAt: detectedStatus.toUpperCase().includes('SENT') ? new Date().toISOString() : undefined,
    });
  });

  if (leads.length === 0) {
    return {
      success: false,
      leads: [],
      error: 'No valid leads with email addresses found in the Google Sheet.',
    };
  }

  return {
    success: true,
    sheetTitle: 'Google Sheet (Direct Link)',
    leads,
  };
}

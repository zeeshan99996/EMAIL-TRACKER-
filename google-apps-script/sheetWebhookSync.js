/**
 * =========================================================================
 * Email Tracker & Outreach Platform — Google Sheet Webhook Sync Script
 * =========================================================================
 * 
 * Instructions to Deploy in your Google Sheet:
 * 1. Open your Google Sheet containing leads (with headers: Name, Email, Company, Status, Sent At).
 * 2. Click on "Extensions" -> "Apps Script".
 * 3. Delete any default code in Code.gs and PASTE THIS ENTIRE SCRIPT.
 * 4. Click "Deploy" (top right) -> "New deployment".
 * 5. Select type: "Web app".
 * 6. Configuration:
 *    - Description: "Email Tracker Outreach Sync"
 *    - Execute as: "Me (<your email>)"
 *    - Who has access: "Anyone" (crucial so your dashboard can connect).
 * 7. Click "Deploy", authorize permissions when prompted, and COPY the "Web App URL".
 * 8. Paste that Web App URL in your Email Tracker Dashboard under "Campaigns" -> "Connect Google Sheet".
 * =========================================================================
 */

// Handles GET requests from the Dashboard (Fetch Leads or Test Connection)
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getLeads';

    if (action === 'ping') {
      return jsonResponse({
        success: true,
        message: 'Google Sheet Webhook is active and responding!',
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'getLeads') {
      const leads = readAllLeadsFromSheet();
      return jsonResponse({
        success: true,
        sheetTitle: SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName(),
        totalLeads: leads.length,
        pendingCount: leads.filter(l => !l.status || l.status.trim() === '' || l.status.toLowerCase().includes('pending')).length,
        sentCount: leads.filter(l => l.status && l.status.toLowerCase().includes('sent')).length,
        invalidCount: leads.filter(l => l.status && (l.status.toLowerCase().includes('invalid') || l.status.toLowerCase().includes('fake'))).length,
        leads: leads
      });
    }

    if (action === 'getReplies') {
      const replies = [];
      try {
        if (typeof GmailApp !== 'undefined') {
          const userEmail = (Session.getActiveUser().getEmail() || '').toLowerCase();
          const threads = GmailApp.search('to:me -from:me', 0, 15);
          for (let i = 0; i < threads.length; i++) {
            const thread = threads[i];
            const msgs = thread.getMessages();
            for (let j = 0; j < msgs.length; j++) {
              const msg = msgs[j];
              const from = msg.getFrom() || '';
              if (from && (!userEmail || !from.toLowerCase().includes(userEmail))) {
                replies.push({
                  id: msg.getId(),
                  senderName: from.replace(/<.*>/, '').trim() || from,
                  senderEmail: (from.match(/<([^>]+)>/) || [null, from])[1].trim(),
                  subject: msg.getSubject() || '(No Subject)',
                  preview: (msg.getPlainBody() || '').substring(0, 140).replace(/\s+/g, ' '),
                  body: msg.getPlainBody() || '',
                  receivedAt: msg.getDate().toISOString(),
                  unread: msg.isUnread()
                });
              }
            }
          }
        }
      } catch (err) {
        return jsonResponse({ success: false, error: err.toString(), replies: [] });
      }
      return jsonResponse({
        success: true,
        count: replies.length,
        replies: replies
      });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// Handles POST requests from the Dashboard (Update Row Statuses e.g. "SENT ✅" or "INVALID ❌")
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action || 'updateStatus';

    if (action === 'updateStatus') {
      const updates = payload.updates || []; // Array of { row: 2, status: 'SENT ✅', sentAt: '...' }
      const updatedCount = updateLeadStatusesInSheet(updates);
      
      return jsonResponse({
        success: true,
        updatedCount: updatedCount,
        message: 'Successfully updated ' + updatedCount + ' rows in Google Sheet.'
      });
    }

    // Optional direct send via GmailApp from the sheet itself
    if (action === 'sendViaSheetGmail') {
      const emailTask = payload.emailTask; // { recipientEmail, subject, htmlBody, row }
      if (emailTask && emailTask.recipientEmail) {
        GmailApp.sendEmail(emailTask.recipientEmail, emailTask.subject, '', {
          htmlBody: emailTask.htmlBody,
          name: payload.senderName || 'Outreach'
        });
        
        // Mark as sent in sheet
        if (emailTask.row) {
          updateSingleRowStatus(emailTask.row, 'SENT ✅', new Date().toLocaleString());
        }
        
        return jsonResponse({
          success: true,
          message: 'Email sent directly through Sheet Gmail for: ' + emailTask.recipientEmail
        });
      }
    }

    return jsonResponse({ success: false, error: 'Invalid POST action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Reads all lead rows from the active sheet and returns structured array
 */
function readAllLeadsFromSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return []; // Only header or empty
  }

  const headers = data[0].map(h => String(h).trim().toLowerCase());
  
  // 1. Detect Email Column
  let colEmail = headers.findIndex(h => h === 'email' || h === 'e-mail' || h === 'email address' || h.includes('email') || (h.includes('mail') && !h.includes('name')));
  if (colEmail === -1) {
    for (let c = 0; c < headers.length; c++) {
      const sampleHasAt = data.slice(1, 20).some(r => r[c] && String(r[c]).includes('@'));
      if (sampleHasAt) {
        colEmail = c;
        break;
      }
    }
  }

  // 2. Detect Website Column
  let colWebsite = headers.findIndex(h => h === 'website' || h === 'web' || h === 'url' || h === 'domain' || h === 'site' || h.includes('website') || h.includes('url'));
  if (colWebsite === -1) {
    const domainRegex = /\.(com|ae|org|io|net|co|ai|in|me|store|shop|online)/i;
    for (let c = 0; c < headers.length; c++) {
      if (c === colEmail) continue;
      const sampleHasDomain = data.slice(1, 20).some(r => r[c] && domainRegex.test(String(r[c])) && !String(r[c]).includes('@'));
      if (sampleHasDomain) {
        colWebsite = c;
        break;
      }
    }
  }

  // 3. Detect Phone Column
  let colPhone = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('tel') || h.includes('cell') || h.includes('whatsapp') || h.includes('contact no'));
  if (colPhone === -1) {
    const phoneRegex = /^[\d\s+\-().]{7,20}$/;
    for (let c = 0; c < headers.length; c++) {
      if (c === colEmail || c === colWebsite) continue;
      const sampleHasPhone = data.slice(1, 20).some(r => r[c] && phoneRegex.test(String(r[c]).trim()) && String(r[c]).replace(/\D/g, '').length >= 7);
      if (sampleHasPhone) {
        colPhone = c;
        break;
      }
    }
  }

  // 4. Detect Name / Store Column
  let colName = headers.findIndex(h => (h.includes('name') || h.includes('lead') || h.includes('contact') || h.includes('store') || h.includes('title')) && !h.includes('company') && !h.includes('website'));
  if (colName === -1) {
    for (let c = 0; c < headers.length; c++) {
      if (c !== colEmail && c !== colWebsite && c !== colPhone) {
        colName = c;
        break;
      }
    }
  }
  if (colName === -1) colName = 0;

  // 5. Detect Status & Sent At Column
  let colStatus = headers.findIndex(h => h.includes('status') || h.includes('state'));
  let colSentAt = headers.findIndex(h => h.includes('sent at') || h.includes('date') || h.includes('time'));

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const domainRegex = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+(?:com|ae|org|io|net|co|ai|in|me|store|shop|online|tech|dev)[^\s]*/i;
  const leads = [];

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    let leadName = colName !== -1 ? String(row[colName] || '').trim() : '';
    let rawEmail = colEmail !== -1 ? String(row[colEmail] || '').trim() : '';
    let leadWebsite = colWebsite !== -1 ? String(row[colWebsite] || '').trim() : '';
    let leadPhone = colPhone !== -1 ? String(row[colPhone] || '').trim() : '';
    let leadStatus = colStatus !== -1 ? String(row[colStatus] || '').trim() : '';
    let leadSentAt = colSentAt !== -1 ? String(row[colSentAt] || '').trim() : '';

    // Extract valid email or scan row
    let leadEmail = '';
    if (emailRegex.test(rawEmail)) {
      leadEmail = rawEmail.match(emailRegex)[0];
    } else {
      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || '').trim();
        if (emailRegex.test(cell)) {
          leadEmail = cell.match(emailRegex)[0];
          break;
        }
      }
    }

    // Extract valid website if missing
    if (!leadWebsite) {
      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || '').trim();
        if (c !== colEmail && domainRegex.test(cell) && !cell.includes('@')) {
          leadWebsite = cell.match(domainRegex)[0];
          break;
        }
      }
    }

    // Ensure leadName is clean and not a raw domain if business name is available
    if ((!leadName || domainRegex.test(leadName)) && rawEmail && !emailRegex.test(rawEmail)) {
      leadName = rawEmail;
    }
    if (!leadName && leadWebsite) {
      const clean = leadWebsite.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('.')[0];
      leadName = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    if (!leadName) leadName = 'Valued Contact';

    // Ignore completely empty rows
    if (!leadEmail && !leadWebsite && (!leadName || leadName === 'Valued Contact')) continue;

    leads.push({
      id: r,
      row: r + 1, // 1-based sheet row number (row 2 is first data row)
      name: leadName,
      email: leadEmail,
      website: leadWebsite,
      phone: leadPhone,
      company: leadName,
      status: leadStatus,
      sentAt: leadSentAt
    });
  }

  return leads;
}

/**
 * Updates status and sentAt columns for specified rows in the sheet
 */
function updateLeadStatusesInSheet(updates) {
  if (!updates || !updates.length) return 0;
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim().toLowerCase());

  let colStatus = headers.findIndex(h => h.includes('status') || h.includes('state'));
  let colSentAt = headers.findIndex(h => h.includes('sent at') || h.includes('date') || h.includes('time'));

  // If Status column doesn't exist, create it in column 4 (D)
  if (colStatus === -1) {
    colStatus = 3; // Column D (0-based: 3)
    sheet.getRange(1, colStatus + 1).setValue('Status').setFontWeight('bold');
  }

  // If Sent At column doesn't exist, create it in column 5 (E)
  if (colSentAt === -1) {
    colSentAt = 4; // Column E (0-based: 4)
    sheet.getRange(1, colSentAt + 1).setValue('Sent At').setFontWeight('bold');
  }

  let count = 0;
  for (let i = 0; i < updates.length; i++) {
    const item = updates[i];
    if (item.row && item.row >= 2) {
      if (item.status !== undefined) {
        sheet.getRange(item.row, colStatus + 1).setValue(item.status);
      }
      if (item.sentAt !== undefined) {
        sheet.getRange(item.row, colSentAt + 1).setValue(item.sentAt || new Date().toLocaleString());
      }
      count++;
    }
  }

  return count;
}

function updateSingleRowStatus(rowNum, status, sentAt) {
  updateLeadStatusesInSheet([{ row: rowNum, status: status, sentAt: sentAt }]);
}

/**
 * Utility to return JSON output with CORS headers
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

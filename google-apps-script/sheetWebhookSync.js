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
  
  // 1. Header-based matching
  let colEmail = headers.findIndex(h => h === 'email' || h === 'e-mail' || h.includes('email') || (h.includes('mail') && !h.includes('name')));
  let colName = headers.findIndex(h => (h.includes('name') || h.includes('lead') || h.includes('contact')) && !h.includes('company'));
  let colCompany = headers.findIndex(h => h.includes('company') || h.includes('website') || h.includes('domain') || h.includes('org') || h.includes('business'));
  let colStatus = headers.findIndex(h => h.includes('status') || h.includes('state'));
  let colSentAt = headers.findIndex(h => h.includes('sent at') || h.includes('date') || h.includes('time'));

  // 2. Value-based auto-detection (find the column that actually contains '@')
  if (colEmail === -1) {
    for (let c = 0; c < headers.length; c++) {
      const sampleHasAt = data.slice(1, 10).some(r => r[c] && String(r[c]).includes('@'));
      if (sampleHasAt) {
        colEmail = c;
        break;
      }
    }
  }

  // 3. Value-based domain/website detection (find column with .com, .ae, etc.)
  if (colCompany === -1) {
    for (let c = 0; c < headers.length; c++) {
      if (c === colEmail) continue;
      const sampleHasDomain = data.slice(1, 10).some(r => r[c] && /\.(com|ae|org|io|net|co|ai)/i.test(String(r[c])));
      if (sampleHasDomain) {
        colCompany = c;
        break;
      }
    }
  }

  // Fallbacks
  if (colName === -1) colName = 0;
  if (colEmail === -1) colEmail = (headers.length > 1 ? 1 : 0);
  if (colCompany === -1) colCompany = (headers.length > 2 ? 2 : 1);
  if (colStatus === -1) colStatus = 3;
  if (colSentAt === -1) colSentAt = 4;

  const leads = [];

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const emailVal = row[colEmail] ? String(row[colEmail]).trim() : '';
    
    // Ignore completely empty rows
    if (!emailVal && !row[colName]) continue;

    leads.push({
      row: r + 1, // 1-based sheet row number (row 2 is first data row)
      name: row[colName] ? String(row[colName]).trim() : (row[colCompany] ? String(row[colCompany]).trim() : 'Valued Contact'),
      email: emailVal,
      company: row[colCompany] ? String(row[colCompany]).trim() : '',
      status: row[colStatus] ? String(row[colStatus]).trim() : '',
      sentAt: row[colSentAt] ? String(row[colSentAt]).trim() : ''
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

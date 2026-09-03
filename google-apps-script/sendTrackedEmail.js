/**
 * Email Tracking Platform — Complete Google Apps Script + Gmail Integration
 * 
 * Instructions:
 * 1. Open Google Sheets or visit https://script.google.com
 * 2. Create a new Apps Script project.
 * 3. Paste this entire code into `Code.gs`.
 * 4. Replace API_KEY with your API key from http://localhost:3000/dashboard/api-keys
 * 5. Run `sendTrackedEmailViaGmail()` and authorize permissions when prompted.
 */

// 1. Configuration
const API_KEY = "ek_live_demo123456789"; // Replace with your generated key
const API_URL = "http://localhost:3000/api/v1/emails"; // For production, use your deployed Vercel domain (https://your-domain.com/api/v1/emails)

/**
 * Sends an email from your Gmail account with tracking pixel & tracked links.
 */
function sendTrackedEmailViaGmail() {
  const recipientEmail = "client@example.com"; // Replace with recipient email
  const subject = "Website Development Proposal & Scope";
  
  const originalHtml = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
      <h2 style="color: #2563eb;">Hello,</h2>
      <p>Thank you for reaching out. Here is our proposal for your web development project.</p>
      
      <p style="margin: 20px 0;">
        <a href="https://erhatechnologies.com/services" 
           style="background-color: #2563eb; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
          View Our Services & Scope
        </a>
      </p>

      <p>
        Check our portfolio here: 
        <a href="https://erhatechnologies.com/portfolio" style="color: #2563eb; font-weight: bold;">
          Portfolio & Case Studies
        </a>
      </p>

      <br>
      <p>Best regards,<br><strong>ERHA Technologies</strong></p>
    </div>
  `;

  // Step A: Register email with Email Tracker Platform to inject pixel & rewrite links
  const payload = {
    to: recipientEmail,
    recipientName: "Valued Client",
    subject: subject,
    html: originalHtml
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + API_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    Logger.log("Registering tracked email with platform...");
    const response = UrlFetchApp.fetch(API_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 201 && responseCode !== 200) {
      Logger.log("ERROR (" + responseCode + "): " + responseText);
      return;
    }

    const data = JSON.parse(responseText);
    Logger.log("✅ Email registered in tracking platform!");
    Logger.log("Tracking ID: " + data.trackingId);

    // Step B: Send actual email through your Gmail account using the tracked HTML
    Logger.log("Sending email from your Gmail account...");
    GmailApp.sendEmail(recipientEmail, subject, "", {
      htmlBody: data.trackedHtml,
      name: "ERHA Technologies"
    });

    Logger.log("🎉 Email successfully sent via Gmail with Live Tracking!");
    return data;
  } catch (err) {
    Logger.log("FAILED TO SEND: " + err.toString());
  }
}

/**
 * Optional: Send bulk tracked emails from a Google Sheet
 * Expects columns: [Recipient Email, Name, Subject] in Sheet1
 */
function sendBulkTrackedEmailsFromSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Assuming row 1 has headers: Email | Name | Subject
  for (let i = 1; i < data.length; i++) {
    const email = data[i][0];
    const name = data[i][1];
    const subject = data[i][2];

    if (!email) continue;

    const htmlBody = `
      <p>Hi ${name},</p>
      <p>Here is our latest update. <a href="https://erhatechnologies.com/services">Click here to view services</a>.</p>
    `;

    // 1. Register with tracker
    const response = UrlFetchApp.fetch(API_URL, {
      method: "post",
      contentType: "application/json",
      headers: { "Authorization": "Bearer " + API_KEY },
      payload: JSON.stringify({ to: email, recipientName: name, subject: subject, html: htmlBody }),
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 201 || response.getResponseCode() === 200) {
      const resData = JSON.parse(response.getContentText());
      // 2. Send via GmailApp
      GmailApp.sendEmail(email, subject, "", {
        htmlBody: resData.trackedHtml,
        name: "ERHA Technologies"
      });
      Logger.log("Sent tracked email to " + email);
    }
    
    // Pause briefly to respect Gmail rate limits
    Utilities.sleep(1000);
  }
}

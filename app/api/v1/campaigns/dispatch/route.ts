import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailAddress } from '@/lib/verification/email-verifier';
import { createTrackedEmail } from '@/lib/supabase/admin';
import { DEFAULT_PROJECT } from '@/lib/store';
import { unifiedSendEmail } from '@/lib/mail/unified';
import { updateInMemoryLeadStatuses } from '@/lib/campaigns/sheet-leads';
import { isSafeWebhookUrl } from '@/lib/security/url-validator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leads = [],
      senderAccountId,
      senderName,
      senderEmail,
      template,
      sheetWebhookUrl,
      skipVerification = false,
      projectId = DEFAULT_PROJECT.id,
    } = body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'No leads selected to dispatch' }, { status: 400 });
    }

    if (!template || !template.subject || !template.bodyHtml) {
      return NextResponse.json({ error: 'Template subject and body are required' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;

    // Process leads concurrently with fast DNS timeout
    const processedResults = await Promise.all(
      leads.map(async (lead: any) => {
        const cleanEmail = (lead.email || '').trim().toLowerCase();

        // 1. Verification Step (1.5s max DNS timeout)
        let isEmailValid = true;
        let rejectReason = '';

        if (!skipVerification) {
          try {
            const verifyResult = await verifyEmailAddress(cleanEmail);
            if (!verifyResult.isValid || verifyResult.isDisposable) {
              isEmailValid = false;
              rejectReason = verifyResult.reason || 'Disposable or non-deliverable domain';
            }
          } catch {
            if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
              isEmailValid = false;
              rejectReason = 'Invalid email syntax';
            }
          }
        }

        if (!isEmailValid) {
          return {
            lead,
            verified: false,
            sent: false,
            status: 'INVALID ❌',
            reason: rejectReason,
            sheetUpdate: {
              row: lead.row,
              email: cleanEmail,
              status: 'INVALID ❌',
              sentAt: '',
              reason: rejectReason,
            },
          };
        }

        // 2. Personalize Variables
        const firstName = (lead.name || 'Friend').trim().split(' ')[0];
        const companyName = lead.company ? lead.company.trim() : 'your company';

        const personalizedSubject = template.subject
          .replace(/\{\{\s*name\s*\}\}/gi, lead.name || 'Friend')
          .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
          .replace(/\{\{\s*company\s*\}\}/gi, companyName)
          .replace(/\{\{\s*email\s*\}\}/gi, cleanEmail);

        const personalizedHtml = template.bodyHtml
          .replace(/\{\{\s*name\s*\}\}/gi, lead.name || 'Friend')
          .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
          .replace(/\{\{\s*company\s*\}\}/gi, companyName)
          .replace(/\{\{\s*email\s*\}\}/gi, cleanEmail);

        // 3. Register Tracking in DB
        let trackingId = '';
        let trackedHtml = personalizedHtml;

        try {
          const trackRes = await createTrackedEmail(
            projectId,
            {
              to: cleanEmail,
              recipientName: lead.name || undefined,
              subject: personalizedSubject,
              html: personalizedHtml,
            },
            baseUrl
          );

          if (trackRes && trackRes.trackingId) {
            trackingId = trackRes.trackingId;
            trackedHtml = trackRes.trackedHtml;
          }
        } catch (err: any) {
          console.warn('Tracking registration notice:', err.message);
        }

        // 4. Dispatch via chosen Mailbox or Sheet Apps Script
        let dispatchSuccess = true;
        let dispatchError = null;

        try {
          if (
            senderAccountId &&
            senderAccountId !== 'apps_script' &&
            senderAccountId !== 'demo_sender' &&
            !senderAccountId.startsWith('mb_')
          ) {
            const textFallback = trackedHtml.replace(/<[^>]*>?/gm, '').trim();
            await unifiedSendEmail({
              fromAccountId: senderAccountId,
              toEmail: cleanEmail,
              subject: personalizedSubject,
              body: textFallback,
              html: trackedHtml,
            });
          } else if (
            (senderAccountId === 'apps_script' || senderAccountId?.startsWith('mb_')) &&
            sheetWebhookUrl &&
            sheetWebhookUrl.trim().startsWith('http')
          ) {
            try {
              await fetch(sheetWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'sendViaSheetGmail',
                  senderName: senderName || 'Outreach',
                  senderEmail: senderEmail || undefined,
                  emailTask: {
                    recipientEmail: cleanEmail,
                    subject: personalizedSubject,
                    htmlBody: trackedHtml,
                    row: lead.row,
                  },
                }),
                signal: AbortSignal.timeout(6000),
              });
            } catch (err: any) {
              console.warn('Sheet send notice:', err.message);
            }
          }
        } catch (sendErr: any) {
          dispatchSuccess = false;
          dispatchError = sendErr.message;
        }

        const nowFormatted = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        if (dispatchSuccess) {
          return {
            lead,
            verified: true,
            sent: true,
            trackingId: trackingId || 'trk_simulated',
            status: 'SENT ✅',
            sentAt: nowFormatted,
            sheetUpdate: {
              row: lead.row,
              email: cleanEmail,
              status: 'SENT ✅',
              sentAt: nowFormatted,
            },
          };
        } else {
          return {
            lead,
            verified: true,
            sent: false,
            status: 'FAILED ⚠️',
            reason: dispatchError || 'Failed to dispatch via mailbox',
            sheetUpdate: {
              row: lead.row,
              email: cleanEmail,
              status: 'FAILED ⚠️',
              sentAt: '',
              reason: dispatchError,
            },
          };
        }
      })
    );

    // Aggregate statistics
    const results = [];
    const sheetUpdates = [];
    let verifiedCount = 0;
    let invalidCount = 0;
    let sentCount = 0;

    for (const item of processedResults) {
      results.push({
        row: item.lead.row,
        name: item.lead.name,
        email: item.lead.email,
        company: item.lead.company,
        verified: item.verified,
        sent: item.sent,
        status: item.status,
        trackingId: (item as any).trackingId,
        sentAt: (item as any).sentAt,
        reason: (item as any).reason,
      });

      if (item.sheetUpdate) {
        sheetUpdates.push(item.sheetUpdate);
      }

      if (item.sent) {
        sentCount++;
        verifiedCount++;
      } else if (item.status.includes('INVALID')) {
        invalidCount++;
      } else if (item.verified) {
        verifiedCount++;
      }
    }

    // 5. Update local store directly (Zero HTTP deadlock)
    if (sheetUpdates.length > 0) {
      updateInMemoryLeadStatuses(sheetUpdates);

      // If user provided a real Google Apps Script Web App URL, notify sheet directly with 6s timeout
      if (sheetWebhookUrl && isSafeWebhookUrl(sheetWebhookUrl)) {
        try {
          await fetch(sheetWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateStatus', updates: sheetUpdates }),
            cache: 'no-store',
            signal: AbortSignal.timeout(6000),
          });
        } catch (err: any) {
          console.warn('Google Sheet background sync notice:', err.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRequested: leads.length,
        verifiedCount,
        invalidCount,
        sentCount,
        failedCount: leads.length - (sentCount + invalidCount),
      },
      results,
    });
  } catch (error: any) {
    console.error('Campaign dispatch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch campaign' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  LeadItem,
  DEMO_LEADS_STORE,
  resetDemoLeadsStore,
  setDemoLeadsStore,
  updateInMemoryLeadStatuses,
} from '@/lib/campaigns/sheet-leads';
import { isSafeWebhookUrl } from '@/lib/security/url-validator';
import {
  isGoogleSheetUrl,
  getGoogleSheetCsvUrl,
  convertCsvToLeads,
} from '@/lib/campaigns/google-sheet-parser';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const webhookUrl = searchParams.get('webhookUrl');
    const reset = searchParams.get('reset');

    if (reset === 'true') {
      resetDemoLeadsStore();
    }

    if (webhookUrl && isSafeWebhookUrl(webhookUrl)) {
      // Direct Google Sheet Link Detection (No Apps Script required!)
      if (isGoogleSheetUrl(webhookUrl)) {
        const csvExportUrl = getGoogleSheetCsvUrl(webhookUrl);
        if (csvExportUrl) {
          try {
            const csvResponse = await fetch(csvExportUrl, {
              method: 'GET',
              headers: { Accept: 'text/csv, text/plain, */*' },
              redirect: 'follow',
              cache: 'no-store',
              signal: AbortSignal.timeout(10000),
            });

            const csvText = await csvResponse.text();
            const parsedResult = convertCsvToLeads(csvText);

            if (!parsedResult.success) {
              return NextResponse.json(
                {
                  success: false,
                  error: parsedResult.error || 'Failed to read Google Sheet.',
                  isPrivate: parsedResult.isPrivate || false,
                  leads: [],
                },
                { status: 400 }
              );
            }

            setDemoLeadsStore(parsedResult.leads);

            return NextResponse.json({
              success: true,
              source: 'google_sheet_direct',
              sheetTitle: parsedResult.sheetTitle || 'Google Sheet (Direct Link)',
              totalLeads: parsedResult.leads.length,
              pendingCount: parsedResult.leads.filter((l) => l.status === 'PENDING').length,
              sentCount: parsedResult.leads.filter((l) => l.status === 'SENT').length,
              invalidCount: 0,
              leads: parsedResult.leads,
            });
          } catch (err: any) {
            return NextResponse.json(
              {
                success: false,
                error: `Unable to connect to Google Sheet: ${err.message || 'Network timeout'}`,
                leads: [],
              },
              { status: 502 }
            );
          }
        }
      }

      // Google Apps Script Web App URL fallback
      try {
        const fetchUrl = webhookUrl.includes('?') 
          ? `${webhookUrl}&action=getLeads` 
          : `${webhookUrl}?action=getLeads`;

        const response = await fetch(fetchUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        });

        if (response.ok) {
          const sheetData = await response.json();
          if (sheetData && sheetData.success) {
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
            const domainRegex = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+(?:com|ae|org|io|net|co|ai|in|me|store|shop|online|tech|dev|app|cc|info)[^\s]*/i;
            const phoneRegex = /^[\d\s+\-().]{7,20}$/;
            const rawLeads = sheetData.leads || [];

            const normalizedLeads: LeadItem[] = rawLeads.map((lead: any, idx: number) => {
              let rawName = String(lead.name || '').trim();
              let rawEmail = String(lead.email || '').trim();
              let rawWebsite = String(lead.website || lead.company || '').trim();
              let rawPhone = String(lead.phone || '').trim();
              let status = String(lead.status || 'PENDING').trim();
              let sentAt = String(lead.sentAt || '').trim();

              // 1. Detect Real Website
              let detectedWebsite = '';
              if (rawWebsite && domainRegex.test(rawWebsite) && !emailRegex.test(rawWebsite)) {
                detectedWebsite = rawWebsite.match(domainRegex)![0];
              } else if (rawName && domainRegex.test(rawName) && !emailRegex.test(rawName)) {
                detectedWebsite = rawName.match(domainRegex)![0];
              } else if (rawEmail && domainRegex.test(rawEmail) && !emailRegex.test(rawEmail)) {
                detectedWebsite = rawEmail.match(domainRegex)![0];
              }

              // 2. Detect Real Email Address
              let detectedEmail = '';
              if (emailRegex.test(rawEmail)) {
                detectedEmail = rawEmail.match(emailRegex)![0];
              } else if (emailRegex.test(rawName)) {
                detectedEmail = rawName.match(emailRegex)![0];
              } else if (emailRegex.test(rawWebsite)) {
                detectedEmail = rawWebsite.match(emailRegex)![0];
              } else {
                for (const [, val] of Object.entries(lead)) {
                  if (typeof val === 'string' && emailRegex.test(val)) {
                    detectedEmail = val.match(emailRegex)![0];
                    break;
                  }
                }
              }

              // 3. Detect Real Phone Number
              let detectedPhone = '';
              if (phoneRegex.test(rawPhone) && rawPhone.replace(/\D/g, '').length >= 7) {
                detectedPhone = rawPhone;
              } else {
                for (const [, val] of Object.entries(lead)) {
                  if (typeof val === 'string' && phoneRegex.test(val.trim()) && val.trim().replace(/\D/g, '').length >= 7) {
                    detectedPhone = val.trim();
                    break;
                  }
                }
              }

              // 4. Detect Real Name / Store Name
              let detectedName = rawName;
              if (!detectedName || domainRegex.test(detectedName) || detectedName === detectedEmail) {
                // If rawName was domain/url, but rawEmail contained business name (e.g. "Ecity Electronics")
                if (rawEmail && !emailRegex.test(rawEmail) && !domainRegex.test(rawEmail)) {
                  detectedName = rawEmail;
                } else if (rawWebsite && !domainRegex.test(rawWebsite) && !emailRegex.test(rawWebsite)) {
                  detectedName = rawWebsite;
                } else if (detectedWebsite) {
                  // Fallback: derive readable name from website domain
                  const cleanDomain = detectedWebsite.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('.')[0];
                  detectedName = cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
                } else {
                  detectedName = 'Valued Contact';
                }
              }

              return {
                id: lead.id || idx + 1,
                row: lead.row || idx + 2,
                name: detectedName,
                email: detectedEmail,
                website: detectedWebsite,
                phone: detectedPhone,
                company: detectedName,
                status: status || 'PENDING',
                sentAt,
              };
            });

            return NextResponse.json({
              success: true,
              source: 'google_sheet',
              sheetTitle: sheetData.sheetTitle || 'Connected Google Sheet',
              totalLeads: sheetData.totalLeads || normalizedLeads.length,
              pendingCount: normalizedLeads.filter((l: any) => !l.status || l.status.toLowerCase().includes('pending')).length,
              sentCount: normalizedLeads.filter((l: any) => l.status && l.status.toLowerCase().includes('sent')).length,
              invalidCount: normalizedLeads.filter((l: any) => l.status && (l.status.toLowerCase().includes('invalid') || l.status.toLowerCase().includes('fake'))).length,
              leads: normalizedLeads,
            });
          }
        }
      } catch (err: any) {
        console.warn('Google Sheet fetch error:', err.message);
        // Fall back gracefully to demo store with warning
      }
    }

    // 2. Default: Return fast responsive lead store
    const totalLeads = DEMO_LEADS_STORE.length;
    const pendingCount = DEMO_LEADS_STORE.filter(l => !l.status || l.status.toLowerCase().includes('pending')).length;
    const sentCount = DEMO_LEADS_STORE.filter(l => l.status && l.status.toLowerCase().includes('sent')).length;
    const invalidCount = DEMO_LEADS_STORE.filter(l => l.status && (l.status.toLowerCase().includes('invalid') || l.status.toLowerCase().includes('fake'))).length;

    return NextResponse.json({
      success: true,
      source: 'demo_sheet',
      sheetTitle: 'Sample Outbound Leads (Sheet Mode)',
      totalLeads,
      pendingCount,
      sentCount,
      invalidCount,
      leads: DEMO_LEADS_STORE,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, webhookUrl, updates, leads } = body;

    // A. Direct Lead Import (CSV or manual paste)
    if (action === 'import' && Array.isArray(leads)) {
      const formatted: LeadItem[] = leads.map((item: any, idx: number) => ({
        row: idx + 2,
        name: item.name || 'Valued Contact',
        email: item.email || '',
        company: item.company || '',
        status: item.status || 'PENDING',
        sentAt: item.sentAt || '',
      })).filter(l => l.email.trim() !== '');

      setDemoLeadsStore(formatted);
      return NextResponse.json({
        success: true,
        message: `Imported ${formatted.length} leads successfully!`,
        totalLeads: formatted.length,
        leads: formatted,
      });
    }

    // B. Update Row Statuses (e.g. "SENT ✅" or "INVALID ❌")
    if (action === 'update' && Array.isArray(updates)) {
      // 1. If real webhook is connected, notify Google Sheet!
      if (webhookUrl && webhookUrl.trim().startsWith('http')) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateStatus', updates }),
            cache: 'no-store',
          });
        } catch (err: any) {
          console.warn('Failed to post updates to Google Sheet webhook:', err.message);
        }
      }

      // 2. Also update local store
      updateInMemoryLeadStatuses(updates);

      return NextResponse.json({
        success: true,
        updatedCount: updates.length,
        message: `Marked ${updates.length} rows successfully`,
      });
    }

    return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sheet API error' }, { status: 500 });
  }
}

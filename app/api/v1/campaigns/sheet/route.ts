import { NextRequest, NextResponse } from 'next/server';
import {
  LeadItem,
  DEMO_LEADS_STORE,
  resetDemoLeadsStore,
  setDemoLeadsStore,
  updateInMemoryLeadStatuses,
} from '@/lib/campaigns/sheet-leads';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const webhookUrl = searchParams.get('webhookUrl');
    const reset = searchParams.get('reset');

    if (reset === 'true') {
      resetDemoLeadsStore();
    }

    // 1. If user provided a real Google Apps Script Web App URL, fetch live data from the sheet!
    if (webhookUrl && webhookUrl.trim().startsWith('http')) {
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
            const rawLeads = sheetData.leads || [];

            const normalizedLeads: LeadItem[] = rawLeads.map((lead: any, idx: number) => {
              let email = String(lead.email || '').trim();
              let name = String(lead.name || '').trim();
              let company = String(lead.company || '').trim();
              let status = String(lead.status || '').trim();
              let sentAt = String(lead.sentAt || '').trim();

              // If email doesn't have an @, search across other properties to find the real email
              if (!emailRegex.test(email)) {
                if (emailRegex.test(company)) {
                  const detected = company.match(emailRegex)![0];
                  company = email; // previous email was company name
                  email = detected;
                } else if (emailRegex.test(name)) {
                  const detected = name.match(emailRegex)![0];
                  name = email;
                  email = detected;
                } else if (emailRegex.test(status)) {
                  email = status.match(emailRegex)![0];
                  status = 'PENDING';
                } else if (emailRegex.test(sentAt)) {
                  email = sentAt.match(emailRegex)![0];
                  sentAt = '';
                } else {
                  for (const [, val] of Object.entries(lead)) {
                    if (typeof val === 'string' && emailRegex.test(val)) {
                      email = val.match(emailRegex)![0];
                      break;
                    }
                  }
                }
              }

              // Ensure name is clean
              if (!name || name === email) {
                name = company || 'Valued Contact';
              }

              return {
                row: lead.row || idx + 2,
                name,
                email,
                company,
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

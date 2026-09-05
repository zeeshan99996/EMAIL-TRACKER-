import { localDb, loadDbFromSupabase, saveDbAsync } from '@/lib/db/store';
import { targetedLocalDb } from '@/lib/db/targeted_store';
import { logSecurityEvent } from '@/lib/security/audit';
import { sanitizeAccountForClient } from '@/lib/security/redactor';
import { calculateLevelFromStats, calculateWarmupProgressPercent, WARMUP_LEVELS } from '@/lib/warmup/levels';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      logSecurityEvent({
        event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        path: '/api/warmup/targeted',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 0. Ensure latest data from Supabase Cloud Store
    await loadDbFromSupabase();

    const { targetAccountId, peerAccountIds, settings, autoPauseStandard } = await request.json();

    if (!targetAccountId || !peerAccountIds || peerAccountIds.length === 0) {
      return NextResponse.json({ error: 'Target account and at least one peer required' }, { status: 400 });
    }

    // Verify ownership of target and peer accounts
    const userAccounts = localDb.getAccounts(session.user.id);
    const userAccountIds = new Set(userAccounts.map(a => a.id));

    if (!userAccountIds.has(targetAccountId)) {
      logSecurityEvent({
        event: 'FORBIDDEN_RESOURCE_ACCESS',
        userId: session.user.id,
        path: '/api/warmup/targeted',
        details: { action: 'set_target_account', targetAccountId },
      });
      return NextResponse.json({ error: 'Forbidden: Target account does not belong to you.' }, { status: 403 });
    }

    for (const peerId of peerAccountIds) {
      if (!userAccountIds.has(peerId)) {
        logSecurityEvent({
          event: 'FORBIDDEN_RESOURCE_ACCESS',
          userId: session.user.id,
          path: '/api/warmup/targeted',
          details: { action: 'set_peer_account', peerId },
        });
        return NextResponse.json({ error: 'Forbidden: One or more peer accounts do not belong to you.' }, { status: 403 });
      }
    }

    if (autoPauseStandard) {
      localDb.upsertConfig(session.user.id, { status: 'paused', enabled: false });
      const stdAccounts = localDb.getWarmupAccounts(session.user.id);
      for (const a of stdAccounts) {
        localDb.updateWarmupAccount(a.id, { status: 'paused', paused_at: new Date().toISOString() });
      }
      const jobs = localDb.getJobs(session.user.id);
      for (const j of jobs) {
        if (j.status === 'queued') {
          localDb.updateJob(j.id, { status: 'cancelled', error_message: 'Paused to run Targeted Warmup' });
        }
      }
    } else {
      if (targetedLocalDb.isAccountActiveInStandardMode(targetAccountId)) {
        return NextResponse.json({ 
          error: 'This account is currently active in Standard Warmup. Please pause Standard Warmup first or click "Pause Standard Warmup & Start".',
          isConflict: true 
        }, { status: 400 });
      }

      for (const peerId of peerAccountIds) {
        if (targetedLocalDb.isAccountActiveInStandardMode(peerId)) {
          return NextResponse.json({ 
            error: 'One or more selected accounts are currently active in Standard Warmup. Please pause Standard Warmup first or click "Pause Standard Warmup & Start".',
            isConflict: true 
          }, { status: 400 });
        }
      }
    }

    let campaign = targetedLocalDb.getCampaignByTargetAccountId(targetAccountId);
    
    campaign = targetedLocalDb.upsertCampaign({
      id: campaign?.id,
      user_id: session.user.id,
      target_email_account_id: targetAccountId,
      status: 'draft',
      daily_limit: settings.dailyLimit || 50,
      min_delay_minutes: settings.minDelay || 5,
      max_delay_minutes: settings.maxDelay || 15,
      cooldown_minutes: settings.cooldown || 60,
      ai_enabled: settings.aiEnabled !== undefined ? settings.aiEnabled : true,
    });

    // Reset existing peers to disabled, then enable selected ones
    const existingPeers = targetedLocalDb.getPeers(campaign.id);
    for (const peer of existingPeers) {
      targetedLocalDb.upsertPeer({ campaign_id: campaign.id, email_account_id: peer.email_account_id, enabled: false });
    }

    for (const peerId of peerAccountIds) {
      targetedLocalDb.upsertPeer({
        campaign_id: campaign.id,
        email_account_id: peerId,
        enabled: true,
        status: 'queued'
      });
    }

    // Synchronously commit to Supabase Cloud Database
    await saveDbAsync(localDb.ensureDbFile());

    return NextResponse.json({ success: true, campaignId: campaign.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      logSecurityEvent({
        event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        path: '/api/warmup/targeted',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Guarantee latest persistent data from Supabase Cloud Database!
    await loadDbFromSupabase();

    const campaigns = targetedLocalDb.getCampaigns(session.user.id);
    const allAccounts = localDb.getAccounts(session.user.id);
    
    // Attach peers, jobs, stats, and percentage for the dashboard (with all credentials safely redacted)
    const expanded = campaigns.map(c => {
      const peers = targetedLocalDb.getPeers(c.id).map(p => {
        const rawAcc = allAccounts.find(a => a.id === p.email_account_id);
        return {
          ...p,
          email_account: sanitizeAccountForClient(rawAcc),
        };
      });
      const jobs = targetedLocalDb.getAllJobs(c.id);
      const events = targetedLocalDb.getEvents(c.id);
      
      const rawTargetAccount = allAccounts.find(a => a.id === c.target_email_account_id);
      const targetAccount = sanitizeAccountForClient(rawTargetAccount);
      const targetWarmupAcc = localDb.getWarmupAccountByEmailAccountId(c.target_email_account_id);

      const totalSent = events.filter(e => e.source_account_id === c.target_email_account_id && e.event_type === 'message_sent').length;
      const totalReceived = events.filter(e => e.target_account_id === c.target_email_account_id && e.event_type === 'response_sent').length;
      const progressPercent = calculateWarmupProgressPercent(totalSent + (targetWarmupAcc?.total_sent || 0));
      const levelNum = calculateLevelFromStats(totalSent + (targetWarmupAcc?.total_sent || 0), targetWarmupAcc?.warmup_level || 1);
      const levelInfo = WARMUP_LEVELS[levelNum] || WARMUP_LEVELS[1];

      return {
        ...c,
        target_account: targetAccount,
        peers,
        jobs,
        events: events.slice(0, 20),
        stats: {
          totalSent,
          totalReceived,
          progressPercent,
          levelNum,
          levelName: levelInfo.name,
          levelDescription: levelInfo.description,
          healthScore: Math.min(100, Math.max(85, 95 + (totalReceived > 0 ? 3 : 0))),
        },
      };
    });

    return NextResponse.json({ campaigns: expanded });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

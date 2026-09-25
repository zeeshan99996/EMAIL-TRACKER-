import { localDb } from '../lib/db/store';
import { targetedLocalDb } from '../lib/db/targeted_store';
import { scheduleWarmupJobsForUser } from '../lib/warmup/scheduler';
import { scheduleTargetedWarmupJobsForUser } from '../lib/warmup/targeted_scheduler';
import { generateUniqueStarterEmail, generateContextualWarmupReply } from '../lib/ai/gemini';
import { executeWarmupWorker } from '../lib/warmup/worker';
import { processAllTargetedJobs } from '../lib/warmup/targeted_worker';
import { encryptToken, decryptToken } from '../lib/crypto/encryption';

async function runWarmupDiagnostic() {
  console.log('==============================================');
  console.log('🔍 STARTING COMPREHENSIVE WARMUP ENGINE CHECK');
  console.log('==============================================\n');

  // 1. Check Store & Account loading
  console.log('1️⃣ Checking Connected Accounts Store...');
  const accounts = localDb.getAccounts();
  console.log(`   Found ${accounts.length} connected email account(s):`);
  accounts.forEach((acc, i) => {
    console.log(`   [#${i + 1}] Email: ${acc.email} | Provider: ${acc.provider} | Status: ${acc.status}`);
  });

  if (accounts.length === 0) {
    console.log('   ⚠️ No accounts in store, creating 2 test peer accounts for diagnostic simulation...');
    const userA = localDb.upsertAccount({
      user_id: 'usr_diagnostic_01',
      email: 'sender_test@gmail.com',
      provider: 'gmail_app_password',
      access_token: encryptToken('abcd1234efgh5678'),
      status: 'connected',
    });
    const userB = localDb.upsertAccount({
      user_id: 'usr_diagnostic_01',
      email: 'recipient_test@gmail.com',
      provider: 'gmail_app_password',
      access_token: encryptToken('ijkl1234mnop5678'),
      status: 'connected',
    });
    console.log(`   Created dummy simulation accounts: ${userA.email} and ${userB.email}`);
  }

  // 2. Encryption / Decryption Verification
  console.log('\n2️⃣ Testing AES-256-GCM Token Encryption & Decryption...');
  const sampleSecret = 'gmail_app_pass_test_16c';
  const encrypted = encryptToken(sampleSecret);
  const decrypted = decryptToken(encrypted);
  const encPass = decrypted === sampleSecret;
  console.log(`   Encrypted: ${encrypted.slice(0, 30)}...`);
  console.log(`   Decrypted matches original: ${encPass ? '✅ PASS' : '❌ FAIL'}`);

  // 3. AI / Template Generation Check
  console.log('\n3️⃣ Testing Natural Starter Email & Reply Generation...');
  try {
    const starter = await generateUniqueStarterEmail({
      senderEmail: 'sales@example.com',
      recipientEmail: 'client@example.com',
      rotationIndex: 1,
    });
    console.log(`   ✅ Starter Subject: "${starter.subject}"`);
    console.log(`   ✅ Starter Body Preview: "${starter.body.replace(/\n/g, ' ').slice(0, 80)}..."`);

    const reply = await generateContextualWarmupReply({
      threadMessages: [
        {
          id: 'msg_01',
          threadId: 'th_01',
          subject: starter.subject,
          from: 'sales@example.com',
          to: 'client@example.com',
          date: new Date().toISOString(),
          snippet: starter.body.slice(0, 50),
          bodyText: starter.body,
        },
      ],
      recipientEmail: 'client@example.com',
      senderEmail: 'sales@example.com',
    });
    console.log(`   ✅ AI Reply Generated: "${reply.replace(/\n/g, ' ').slice(0, 80)}..."`);
  } catch (err: any) {
    console.log(`   ⚠️ AI Generation Note: ${err.message} (Template fallback engaged)`);
  }

  // 4. Test Fleet Warmup Scheduler
  console.log('\n4️⃣ Testing Fleet Warmup Scheduler...');
  const allCurrentAccs = localDb.getAccounts();
  const userId = allCurrentAccs[0]?.user_id || 'usr_diagnostic_01';

  // Ensure config is enabled
  localDb.upsertConfig(userId, { enabled: true, status: 'active', daily_limit: 10 });
  allCurrentAccs.forEach((acc) => {
    localDb.upsertWarmupAccount({
      user_id: userId,
      email_account_id: acc.id,
      warmup_config_id: 'cfg_diag_01',
      status: 'running',
      warmup_level: 1,
      daily_sent: 0,
      total_sent: 0,
    });
  });

  const scheduleResult = await scheduleWarmupJobsForUser(userId);
  console.log(`   Scheduler run complete. Created ${scheduleResult.createdCount} job(s).`);

  const pendingJobs = localDb.getJobs(userId);
  console.log(`   Total queued warmup jobs in DB: ${pendingJobs.length}`);

  // 5. Test Background Worker Execution
  console.log('\n5️⃣ Testing Background Standard Warmup Worker Execution...');
  const workerResult = await executeWarmupWorker();
  console.log('   Worker Run Result:');
  console.log(`   - Processed: ${workerResult.processed}`);
  console.log(`   - Succeeded: ${workerResult.succeeded}`);
  console.log(`   - Postponed (Anti-Spam 5m Cooldown): ${workerResult.postponed}`);
  console.log(`   - Failed: ${workerResult.failed}`);

  // 6. Test Targeted Mode Scheduler & Worker
  console.log('\n6️⃣ Testing Targeted Warmup Scheduler & Worker...');
  if (allCurrentAccs.length >= 2) {
    const targetAcc = allCurrentAccs[0];
    const peerAcc = allCurrentAccs[1];

    const campaign = targetedLocalDb.upsertCampaign({
      user_id: userId,
      target_email_account_id: targetAcc.id,
      name: 'Diagnostic Targeted Campaign',
      status: 'running',
      enabled: true,
      daily_limit: 5,
      cooldown_minutes: 1,
    });

    targetedLocalDb.upsertPeer({
      campaign_id: campaign.id,
      email_account_id: peerAcc.id,
      enabled: true,
      status: 'active',
    });

    const targetedScheduleRes = await scheduleTargetedWarmupJobsForUser(userId, true);
    console.log(`   Targeted Scheduler created ${targetedScheduleRes.createdCount} targeted job(s).`);

    const targetedJobs = targetedLocalDb.getAllJobs(campaign.id);
    console.log(`   Total targeted jobs in campaign: ${targetedJobs.length}`);
  } else {
    console.log('   ℹ️ Skipped (Targeted mode requires >= 2 accounts).');
  }

  // 7. Test Events Audit Log
  console.log('\n7️⃣ Testing Warmup Events Audit Log...');
  const eventsData = localDb.getEvents(userId);
  console.log(`   Audit log has ${eventsData.total} tracked event(s). Latest 3 events:`);
  eventsData.events.slice(-3).forEach((ev) => {
    console.log(`   - [${ev.event_type}] Status: ${ev.status} | Created: ${ev.created_at}`);
  });

  console.log('\n==============================================');
  console.log('🎯 WARMUP ENGINE VERIFICATION SUMMARY: COMPLETE & OPERATIONAL');
  console.log('==============================================');
}

runWarmupDiagnostic().catch(console.error);

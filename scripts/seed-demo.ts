import { createClient } from '@supabase/supabase-js';
import { hashApiKey } from '../lib/security/api-key';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function seedDatabase() {
  console.log('🌱 Starting Database Seed Script...');

  if (!supabaseUrl || supabaseUrl.includes('mock') || !serviceRoleKey || serviceRoleKey.includes('mock')) {
    console.log('ℹ️ Running in Local Demo Mode. Seed data is loaded in-memory via lib/demo-store.ts.');
    process.exit(0);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Create Account
  const { data: account, error: accErr } = await supabase
    .from('accounts')
    .insert({ name: 'ERHA Technologies' })
    .select()
    .single();

  if (accErr) {
    console.error('Failed to create seed account:', accErr);
    process.exit(1);
  }

  console.log('✅ Account created:', account.id);

  // 2. Create Project
  const { data: project, error: prjErr } = await supabase
    .from('projects')
    .insert({
      account_id: account.id,
      name: 'ERHA Technologies Outreach',
      description: 'Primary outbound sales and marketing emails',
    })
    .select()
    .single();

  if (prjErr) {
    console.error('Failed to create seed project:', prjErr);
    process.exit(1);
  }

  console.log('✅ Project created:', project.id);

  // 3. Create API Key
  const rawKey = 'ek_live_demo123456789';
  const keyHash = hashApiKey(rawKey);

  const { data: apiKey, error: keyErr } = await supabase
    .from('api_keys')
    .insert({
      project_id: project.id,
      name: 'Apps Script Outbound Key',
      key_hash: keyHash,
      key_prefix: 'ek_live_demo1...',
    })
    .select()
    .single();

  if (keyErr) {
    console.error('Failed to create seed API key:', keyErr);
    process.exit(1);
  }

  console.log('✅ API Key created:', apiKey.id);
  console.log('🎉 Seed completed successfully!');
}

seedDatabase().catch(console.error);

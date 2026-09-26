import { DatabaseSchema } from './store';

export const initialSeedData: DatabaseSchema = {
  email_accounts: [
    {
      id: "25893659-5253-478c-845e-3e818b12265f",
      user_id: "usr_demo_01",
      email: "boomboom33204@gmail.com",
      provider: "gmail_app_password",
      access_token: "5792ed7b3176077bafd77c9e:d6dc2aecbbad583148cf31c24f9f9e1e:db6c2d30173413032a085dc93ae615f0",
      status: "connected",
      last_sync_at: "2026-09-25T07:41:26.007Z",
      error_message: null,
      created_at: "2026-09-25T07:41:26.007Z",
      updated_at: "2026-09-25T07:41:26.007Z"
    },
    {
      id: "64491695-a905-4f92-b2a7-682d4c7602bd",
      user_id: "usr_demo_01",
      email: "erhatechnologiesai@gmail.com",
      provider: "gmail_app_password",
      access_token: "7604ad8053a6364d6a90fea5:e01f35f8b998a7b942faf11980048a66:0fb7c936e840c021b50e0e5c7b3ba940",
      status: "connected",
      last_sync_at: "2026-09-25T07:41:26.010Z",
      error_message: null,
      created_at: "2026-09-25T07:41:26.010Z",
      updated_at: "2026-09-25T07:41:26.010Z"
    },
    {
      id: "b133cd71-812a-43fe-95de-93fc98722961",
      user_id: "usr_demo_01",
      email: "muhammadzeeshan0477@gmail.com",
      provider: "gmail_app_password",
      access_token: "8375b5adfd53edf6eb8a30d5:4acaafcbb4cc0baef4d995a64b80a0ae:613f5714ee05b848025f9949b1f3f14e",
      status: "connected",
      last_sync_at: "2026-09-25T07:41:26.014Z",
      error_message: null,
      created_at: "2026-09-25T07:41:26.014Z",
      updated_at: "2026-09-25T07:41:26.014Z"
    },
    {
      id: "f2f789d3-68f4-4859-a673-62171404a5f7",
      user_id: "usr_demo_01",
      email: "workwithyasir13@gmail.com",
      provider: "gmail_app_password",
      access_token: "",
      status: "connected",
      last_sync_at: "2026-09-25T12:03:23.261Z",
      error_message: null,
      created_at: "2026-09-25T12:03:23.261Z",
      updated_at: "2026-09-25T12:03:23.261Z"
    }
  ],
  email_warmup_configs: [
    {
      id: "9af567d0-d0ea-40f3-b617-461e0b7d6370",
      user_id: "usr_demo_01",
      enabled: true,
      status: "active",
      daily_limit: 10,
      min_delay_minutes: 3,
      max_delay_minutes: 5,
      max_messages_per_thread: 4,
      ai_enabled: true,
      warmup_level_max: 4,
      created_at: "2026-09-25T11:23:07.903Z",
      updated_at: "2026-09-25T11:34:53.764Z"
    }
  ],
  email_warmup_accounts: [
    {
      id: "c63924be-2df2-495c-bb7e-626f4c741c1e",
      user_id: "usr_demo_01",
      warmup_config_id: "9af567d0-d0ea-40f3-b617-461e0b7d6370",
      email_account_id: "25893659-5253-478c-845e-3e818b12265f",
      status: "running",
      warmup_level: 1,
      daily_sent: 0,
      daily_received: 0,
      daily_replies: 0,
      total_sent: 0,
      total_received: 0,
      total_replies: 0,
      created_at: "2026-09-25T11:23:07.905Z",
      updated_at: "2026-09-25T11:35:16.387Z"
    },
    {
      id: "e903bd59-2e32-4cb4-9798-44c86404defe",
      user_id: "usr_demo_01",
      warmup_config_id: "9af567d0-d0ea-40f3-b617-461e0b7d6370",
      email_account_id: "64491695-a905-4f92-b2a7-682d4c7602bd",
      status: "running",
      warmup_level: 1,
      daily_sent: 0,
      daily_received: 0,
      daily_replies: 0,
      total_sent: 0,
      total_received: 0,
      total_replies: 0,
      created_at: "2026-09-25T11:23:07.908Z",
      updated_at: "2026-09-25T11:35:24.614Z"
    },
    {
      id: "4ae839cb-764d-4d18-bfc0-92f77f603faf",
      user_id: "usr_demo_01",
      warmup_config_id: "9af567d0-d0ea-40f3-b617-461e0b7d6370",
      email_account_id: "b133cd71-812a-43fe-95de-93fc98722961",
      status: "running",
      warmup_level: 1,
      daily_sent: 0,
      daily_received: 0,
      daily_replies: 0,
      total_sent: 0,
      total_received: 0,
      total_replies: 0,
      created_at: "2026-09-25T11:23:07.910Z",
      updated_at: "2026-09-25T11:34:53.769Z"
    },
    {
      id: "92da1001-c889-4fa2-bf5a-94ef1f07f212",
      user_id: "usr_demo_01",
      warmup_config_id: "9af567d0-d0ea-40f3-b617-461e0b7d6370",
      email_account_id: "f2f789d3-68f4-4859-a673-62171404a5f7",
      status: "running",
      warmup_level: 1,
      daily_sent: 0,
      daily_received: 0,
      daily_replies: 0,
      total_sent: 0,
      total_received: 0,
      total_replies: 0,
      created_at: "2026-09-25T12:03:23.261Z",
      updated_at: "2026-09-25T12:03:23.261Z"
    }
  ],
  email_warmup_jobs: [],
  email_warmup_events: [],
  email_warmup_stats: [],
  targeted_warmup_campaigns: [
    {
      id: "4404548d-4a7d-4b5b-a69b-21afdc597426",
      user_id: "usr_demo_01",
      target_email_account_id: "f2f789d3-68f4-4859-a673-62171404a5f7",
      status: "running",
      enabled: true,
      daily_limit: 50,
      min_delay_minutes: 2,
      max_delay_minutes: 5,
      cooldown_minutes: 10,
      max_messages_per_cycle: 10,
      max_messages_per_thread: 4,
      ai_enabled: true,
      created_at: "2026-09-25T12:00:00.000Z",
      updated_at: "2026-09-25T12:00:00.000Z",
      started_at: "2026-09-25T12:00:00.000Z"
    },
    {
      id: "69237f6d-ef12-4372-b513-1406d679b89b",
      user_id: "usr_demo_01",
      target_email_account_id: "25893659-5253-478c-845e-3e818b12265f",
      status: "running",
      enabled: true,
      daily_limit: 50,
      min_delay_minutes: 2,
      max_delay_minutes: 5,
      cooldown_minutes: 10,
      max_messages_per_cycle: 10,
      max_messages_per_thread: 4,
      ai_enabled: true,
      created_at: "2026-09-25T12:00:00.000Z",
      updated_at: "2026-09-25T12:00:00.000Z",
      started_at: "2026-09-25T12:00:00.000Z"
    }
  ],
  targeted_warmup_peers: [
    {
      id: "peer-seed-01",
      campaign_id: "4404548d-4a7d-4b5b-a69b-21afdc597426",
      email_account_id: "64491695-a905-4f92-b2a7-682d4c7602bd",
      enabled: true,
      status: "running",
      daily_sent: 0,
      daily_received: 0,
      daily_replies: 0,
      created_at: "2026-09-25T12:00:00.000Z",
      updated_at: "2026-09-25T12:00:00.000Z"
    },
    {
      id: "peer-seed-02",
      campaign_id: "4404548d-4a7d-4b5b-a69b-21afdc597426",
      email_account_id: "25893659-5253-478c-845e-3e818b12265f",
      enabled: true,
      status: "running",
      daily_sent: 0,
      daily_received: 0,
      daily_replies: 0,
      created_at: "2026-09-25T12:00:00.000Z",
      updated_at: "2026-09-25T12:00:00.000Z"
    },
    {
      id: "peer-seed-03",
      campaign_id: "4404548d-4a7d-4b5b-a69b-21afdc597426",
      email_account_id: "b133cd71-812a-43fe-95de-93fc98722961",
      enabled: true,
      status: "running",
      daily_sent: 0,
      daily_received: 0,
      daily_replies: 0,
      created_at: "2026-09-25T12:00:00.000Z",
      updated_at: "2026-09-25T12:00:00.000Z"
    },
    {
      id: "peer-seed-04",
      campaign_id: "69237f6d-ef12-4372-b513-1406d679b89b",
      email_account_id: "64491695-a905-4f92-b2a7-682d4c7602bd",
      enabled: true,
      status: "running",
      daily_sent: 0,
      daily_received: 0,
      daily_replies: 0,
      created_at: "2026-09-25T12:00:00.000Z",
      updated_at: "2026-09-25T12:00:00.000Z"
    }
  ],
  targeted_warmup_jobs: [],
  targeted_warmup_events: [],
  targeted_warmup_stats: []
};


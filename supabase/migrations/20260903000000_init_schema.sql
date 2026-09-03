-- Initial Schema Migration for Email Tracking & Analytics Platform
-- Created at: 2026-09-03

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ACCOUNTS
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. API KEYS
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    revoked_at TIMESTAMPTZ
);

-- 5. EMAILS
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    tracking_id TEXT NOT NULL UNIQUE,
    message_id TEXT,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    original_html TEXT NOT NULL,
    tracked_html TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    first_opened_at TIMESTAMPTZ,
    last_opened_at TIMESTAMPTZ,
    open_count INTEGER DEFAULT 0 NOT NULL,
    click_count INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'SENT' CHECK (status IN ('SENT', 'OPENED', 'CLICKED', 'FAILED')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. EMAIL LINKS
CREATE TABLE IF NOT EXISTS email_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE NOT NULL,
    original_url TEXT NOT NULL,
    link_label TEXT,
    link_index INTEGER NOT NULL,
    click_count INTEGER DEFAULT 0 NOT NULL,
    first_clicked_at TIMESTAMPTZ,
    last_clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. EMAIL EVENTS
CREATE TABLE IF NOT EXISTS email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE NOT NULL,
    link_id UUID REFERENCES email_links(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('SENT', 'OPEN', 'CLICK')),
    occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referer TEXT,
    metadata JSONB
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_emails_tracking_id ON emails(tracking_id);
CREATE INDEX IF NOT EXISTS idx_emails_project_created ON emails(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_links_email_id ON email_links(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON email_events(email_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_link_id ON email_events(link_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_projects_account ON projects(account_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTION FOR CURRENT ACCOUNT
CREATE OR REPLACE FUNCTION get_user_account_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT account_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES: ACCOUNTS
CREATE POLICY "Users can view their account"
  ON accounts FOR SELECT
  USING (id = get_user_account_id());

CREATE POLICY "Users can update their account"
  ON accounts FOR UPDATE
  USING (id = get_user_account_id());

-- POLICIES: PROFILES
CREATE POLICY "Users can view their profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- POLICIES: PROJECTS
CREATE POLICY "Users can view their account projects"
  ON projects FOR SELECT
  USING (account_id = get_user_account_id());

CREATE POLICY "Users can insert projects into their account"
  ON projects FOR INSERT
  WITH CHECK (account_id = get_user_account_id());

CREATE POLICY "Users can update their projects"
  ON projects FOR UPDATE
  USING (account_id = get_user_account_id());

CREATE POLICY "Users can delete their projects"
  ON projects FOR DELETE
  USING (account_id = get_user_account_id());

-- POLICIES: API KEYS
CREATE POLICY "Users can view API keys for their projects"
  ON api_keys FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE account_id = get_user_account_id()));

CREATE POLICY "Users can create API keys for their projects"
  ON api_keys FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE account_id = get_user_account_id()));

CREATE POLICY "Users can revoke API keys for their projects"
  ON api_keys FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE account_id = get_user_account_id()));

-- POLICIES: EMAILS
CREATE POLICY "Users can view emails for their projects"
  ON emails FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE account_id = get_user_account_id()));

-- POLICIES: EMAIL LINKS
CREATE POLICY "Users can view email links for their projects"
  ON email_links FOR SELECT
  USING (email_id IN (SELECT id FROM emails WHERE project_id IN (SELECT id FROM projects WHERE account_id = get_user_account_id())));

-- POLICIES: EMAIL EVENTS
CREATE POLICY "Users can view email events for their projects"
  ON email_events FOR SELECT
  USING (email_id IN (SELECT id FROM emails WHERE project_id IN (SELECT id FROM projects WHERE account_id = get_user_account_id())));

-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

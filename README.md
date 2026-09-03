# Email Tracking & Analytics Platform

A production-ready, multi-tenant SaaS Email Tracking & Analytics Platform built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase PostgreSQL with Row Level Security (RLS).

Allows users to connect Google Apps Script (or any REST client), send tracked emails, monitor opens and link clicks in real time, inspect detailed activity timelines, and analyze engagement metrics.

---

## Features

- **Google Apps Script Integration**: Instant copy-pasteable script for sending tracked emails via HTTP REST API (`POST /api/v1/emails`).
- **Secure API Key Management**: SHA-256 hashed API keys with project-level isolation, copy-once secret display, prefix viewing, and revocation controls.
- **Lightweight Tracking Pixel**: `/t/open/[trackingId]` returns a 1x1 transparent GIF with strict `no-cache` headers, updating open counts and logging `OPEN` events.
- **Safe Click Redirect Engine**: `/t/click/[trackingId]/[linkId]` rewrites email links, logs `CLICK` events, updates counters, and performs safe 302 redirects with open-redirect protection.
- **HTML Rewriter Engine**: Cheerio-powered DOM parser that extracts links, excludes non-trackable schemes (`mailto:`, `tel:`, `javascript:`, `#`), preserves URL params, and appends pixels.
- **Modern Dashboard UI**: Real-time overview metrics, Recharts volume and trend graphs, searchable/filterable/paginated email list, email detail activity timelines, multi-tenant project switcher, settings, and documentation.
- **Multi-Tenant Database Architecture**: Complete PostgreSQL schema with Supabase Row Level Security (RLS) policies linking accounts, profiles, projects, API keys, emails, links, and events.

---

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Next.js Server-side Route Handlers (`app/api/v1/emails`, `app/t/open/`, `app/t/click/`)
- **Database & Auth**: Supabase PostgreSQL, Supabase RLS, Supabase Auth
- **HTML Parsing**: Cheerio
- **Validation**: Zod
- **Testing**: Vitest

---

## High-Level Architecture

```
Google Apps Script / REST Client
              │
              │ HTTPS POST /api/v1/emails (Bearer API Key)
              ▼
    ┌─────────────────┐
    │  Next.js API    │ ── 1. Validate & Hash API Key
    │  Route Handler  │ ── 2. Rewrite Links & Inject Pixel
    └────────┬────────┘ ── 3. Store Email & Links in DB
             │
             ▼
┌───────────────────────────┐
│   Recipient Inbox (Email) │
└──────┬─────────────┬──────┘
       │             │
 Opens │             │ Clicks Link
       ▼             ▼
┌──────────────┐   ┌──────────────┐
│  /t/open/    │   │  /t/click/   │
│ [trackingId] │   │ [trackingId] │
└──────┬───────┘   └──────┬───────┘
       │ 1x1 Pixel        │ 302 Redirect
       ▼                  ▼
┌─────────────────────────────────┐
│     Supabase PostgreSQL DB      │
│   (Emails, Links, Events, RLS)  │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      Next.js Dashboard UI       │
│  (Overview, Analytics, Timeline)│
└─────────────────────────────────┘
```

---

## Database Schema & Migrations

The database migration SQL file is located at `supabase/migrations/20260903000000_init_schema.sql`.

### Relational Schema:
1. `accounts` — Tenant organization records.
2. `profiles` — User profiles linked to `auth.users` and `accounts`.
3. `projects` — Isolated campaigns/projects under an account.
4. `api_keys` — Hashed API secret keys (`key_hash`, `key_prefix`, `revoked_at`).
5. `emails` — Tracked emails (`tracking_id`, `recipient_email`, `open_count`, `click_count`, `status`).
6. `email_links` — Original destination URLs extracted per email (`original_url`, `link_label`, `click_count`).
7. `email_events` — Audit log of all individual `SENT`, `OPEN`, and `CLICK` events with timestamps, IP, User-Agent.

### Running Migrations in Supabase:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Paste the contents of `supabase/migrations/20260903000000_init_schema.sql` and run.

---

## Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Set environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DEMO_MODE=true
   ```

*Note: When `DEMO_MODE=true` or Supabase credentials are left default, the platform runs in instant local demo mode with in-memory store support.*

---

## Local Development & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```

### 3. Start Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Google Apps Script Integration

1. Go to [API Keys Page](http://localhost:3000/dashboard/api-keys) and generate an API key (e.g. `ek_live_...`).
2. Open Google Apps Script at [script.google.com](https://script.google.com).
3. Paste the code from `google-apps-script/sendTrackedEmail.js` or copy from the in-app Documentation page.
4. Set `API_KEY` to your generated secret key and `API_URL` to your app endpoint (`http://localhost:3000/api/v1/emails`).
5. Execute `sendTrackedEmail()`.

---

## REST API Specification

### `POST /api/v1/emails`

#### Headers:
- `Authorization`: `Bearer ek_live_...`
- `Content-Type`: `application/json`

#### Request Body:
```json
{
  "to": "client@example.com",
  "recipientName": "Client Name",
  "subject": "Website Proposal",
  "html": "<p>Hello! Check our <a href=\"https://erhatechnologies.com/services\">Services</a></p>"
}
```

#### Response (201 Created):
```json
{
  "success": true,
  "emailId": "em_1741085000_abc12",
  "trackingId": "trk_01jxyz9876543210",
  "status": "SENT"
}
```

---

## Open Tracking Limitations & Privacy

> [!IMPORTANT]
> **Open Tracking Technical Disclaimer**
> Email open tracking relies on an invisible 1x1 GIF tracking image embedded in the email HTML. Email client privacy features (e.g., Apple Mail Privacy Protection, automated security proxy scanners, image blocking, and Gmail proxy caching) can either suppress image requests or trigger automated pre-fetches.
> For full transparency, the dashboard explicitly labels opens as **Tracked Opens** rather than guaranteeing 100% human readership.

---

## Deployment Checklist (Vercel + Supabase)

- [ ] Execute `supabase/migrations/20260903000000_init_schema.sql` in Supabase SQL Editor.
- [ ] Connect GitHub repository to Vercel.
- [ ] Configure Vercel Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL` (Set to your Vercel custom domain, e.g. `https://your-app.vercel.app`)
  - `DEMO_MODE` = `false`
- [ ] Deploy to production.

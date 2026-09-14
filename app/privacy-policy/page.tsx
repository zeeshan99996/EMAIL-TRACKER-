'use client';

import React from 'react';
import Link from 'next/link';
import { WebsiteHeader } from '@/components/website-header';
import { WebsiteFooter } from '@/components/website-footer';
import { ShieldCheck, Lock, EyeOff, Server, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 14, 2026';

  return (
    <div className="min-h-screen bg-[#020512] text-white selection:bg-[#53E2FE]/20 selection:text-[#53E2FE] flex flex-col justify-between">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at center, #53E2FE 0%, rgba(14,165,233,0.5) 45%, transparent 75%)',
          }}
        />
      </div>

      <WebsiteHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* Header Title */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#53E2FE]/10 border border-[#53E2FE]/30 text-[#53E2FE] text-xs sm:text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Protection & Privacy Standards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm">
            Last Updated: <span className="text-white font-medium">{lastUpdated}</span> • Maintained by <span className="text-white font-semibold">ERHA Technologies</span>
          </p>
        </section>

        {/* Core Principles Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-[#071126]/90 border border-slate-800 p-5 space-y-2">
            <EyeOff className="w-5 h-5 text-[#53E2FE]" />
            <h3 className="font-bold text-white text-sm">Zero Data Selling</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We never sell, rent, monetize, or disclose your recipient email lists or private data to data brokers or third parties.
            </p>
          </div>

          <div className="rounded-2xl bg-[#071126]/90 border border-slate-800 p-5 space-y-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Military-Grade Encryption</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All credentials, API tokens, and tracking payloads are secured using TLS 1.3 in transit and AES-256 encryption at rest.
            </p>
          </div>

          <div className="rounded-2xl bg-[#071126]/90 border border-slate-800 p-5 space-y-2">
            <Server className="w-5 h-5 text-[#53E2FE]" />
            <h3 className="font-bold text-white text-sm">Google API Compliance</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Strict adherence to Google API Services User Data Policy, ensuring Limited Use requirements are fully honored.
            </p>
          </div>
        </section>

        {/* Detailed Clauses */}
        <section className="rounded-3xl bg-[#060c1f]/90 border border-slate-800 p-6 sm:p-10 space-y-10 text-slate-300 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#53E2FE]">1.</span> Introduction & Scope
            </h2>
            <p>
              This Privacy Policy applies to the <strong className="text-white">Mailify</strong> software platform, website, application programming interfaces (APIs), and warmup engines operated by <strong className="text-white">ERHA Technologies</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). This policy outlines our policies regarding the collection, use, protection, and disclosure of personal data when you interact with our platform.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#53E2FE]">2.</span> Information We Collect
            </h2>
            <p>
              To provide email telemetry and warmup infrastructure, Mailify collects only the minimum necessary information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong className="text-white">Account Information:</strong> Full name, business email address, and encrypted credential tokens required to access the dashboard.
              </li>
              <li>
                <strong className="text-white">Email Tracking Telemetry:</strong> Anonymized open timestamps, link click events, approximate geolocation (city/country level derived from IP), and user-agent client headers.
              </li>
              <li>
                <strong className="text-white">Mailbox Configuration:</strong> IMAP/SMTP credentials or Google OAuth tokens necessary for executing warmup sequences. These are stored strictly in encrypted vaults.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#53E2FE]">3.</span> What We Do NOT Collect or Read
            </h2>
            <p>
              Your communications remain private:
            </p>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm space-y-2">
              <p className="flex items-center gap-2 text-white font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Zero Email Content Stored
              </p>
              <p className="text-slate-300">
                Mailify does not read, parse, or retain the personal message content or attachments of emails you send to clients. Our tracking mechanism relies strictly on standard web beacon pixels and redirect links.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#53E2FE]">4.</span> How We Use Collected Data
            </h2>
            <p>
              The data collected is used solely for the following business purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Providing real-time notifications when your tracked emails are opened or clicked.</li>
              <li>Running automated peer-to-peer warmup email exchanges to build sender reputation.</li>
              <li>Calculating domain deliverability metrics, spam complaint rates, and inbox placement scores.</li>
              <li>Securing your account and preventing malicious or unauthorized platform use.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#53E2FE]">5.</span> Google API Services User Data Policy Disclosure
            </h2>
            <p>
              Mailify&apos;s use and transfer to any other app of information received from Google APIs will adhere to{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-[#53E2FE] underline hover:text-white"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#53E2FE]">6.</span> Cookies and Browser Storage
            </h2>
            <p>
              We utilize essential first-party session cookies (<code className="text-[#53E2FE] bg-slate-900 px-1.5 py-0.5 rounded text-xs">warmup_user_session</code>, <code className="text-[#53E2FE] bg-slate-900 px-1.5 py-0.5 rounded text-xs">mailify_has_submitted</code>) and browser <code className="text-[#53E2FE] bg-slate-900 px-1.5 py-0.5 rounded text-xs">localStorage</code> strictly to keep you signed in and remember your session state. We do not use intrusive third-party cross-site advertising trackers.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#53E2FE]">7.</span> User Rights & Data Deletion (GDPR / CCPA)
            </h2>
            <p>
              You maintain full rights to your data. At any time, you can request an export of your tracked metrics or demand the complete, irrevocable purge of your account, API keys, and connected mailboxes from our servers by contacting our privacy officer.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#53E2FE]">8.</span> Privacy & Security Contact
            </h2>
            <p>
              For any questions regarding this Privacy Policy or your personal data, please contact the ERHA Technologies privacy team:
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm space-y-1">
              <p><strong className="text-white">Organization:</strong> ERHA Technologies Privacy & Security Office</p>
              <p><strong className="text-white">Email:</strong> <a href="mailto:privacy@erhatechnologies.com" className="text-[#53E2FE] hover:underline">privacy@erhatechnologies.com</a></p>
              <p><strong className="text-white">General Support:</strong> <a href="mailto:support@erhatechnologies.com" className="text-[#53E2FE] hover:underline">support@erhatechnologies.com</a></p>
            </div>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
}

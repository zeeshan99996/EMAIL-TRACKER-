'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { BookOpen, Copy, Check, Code, ShieldCheck, Zap, Info, Terminal } from 'lucide-react';

const APPS_SCRIPT_CODE = `/**
 * Email Tracking Platform — Google Apps Script Integration
 * Paste this script into your Google Apps Script editor (script.google.com).
 */
function sendTrackedEmail() {
  // 1. Configure API Key & Platform Endpoint
  const API_KEY = "YOUR_API_KEY_HERE"; // Replace with your generated key from API Keys page
  const API_URL = "http://localhost:3000/api/v1/emails"; // Replace with your production domain in Vercel

  // 2. Build Tracked Email Payload
  const payload = {
    to: "client@example.com",
    recipientName: "Client Name",
    subject: "Website Development & Services Proposal",
    html: \`
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Hello Client,</h2>
        <p>Thank you for speaking with us today. Here is our detailed project proposal.</p>
        <p>
          <a href="https://erhatechnologies.com/services" style="color: #2563eb; font-weight: bold;">
            Explore Our Services
          </a>
        </p>
        <p>
          <a href="https://erhatechnologies.com/contact" style="color: #2563eb; font-weight: bold;">
            Contact Us & Schedule Call
          </a>
        </p>
      </div>
    \`
  };

  // 3. Execute HTTP POST with Retry Logic & Error Handling
  try {
    const response = UrlFetchApp.fetch(API_URL, {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + API_KEY
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode === 201 || responseCode === 200) {
      const data = JSON.parse(responseText);
      Logger.log("Email registered in tracking platform! Tracking ID: " + data.trackingId);
      
      // Send actual email from your Gmail account containing tracking pixel & links:
      GmailApp.sendEmail(payload.to, payload.subject, "", {
        htmlBody: data.trackedHtml,
        name: "Your Name / Organization"
      });

      Logger.log("SUCCESS: Tracked email sent via Gmail!");
      return data;
    } else {
      Logger.log("ERROR (" + responseCode + "): " + responseText);
    }
  } catch (err) {
    Logger.log("FETCH EXCEPTION: " + err.toString());
  }
}`;

export default function DocsPage() {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const curlExample = `curl -X POST http://localhost:3000/api/v1/emails \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "client@example.com",
    "recipientName": "Client",
    "subject": "Website Proposal",
    "html": "<p>Hello! Check our <a href=\\"https://erhatechnologies.com/services\\">Services</a></p>"
  }'`;

  return (
    <div className="space-y-6 max-w-5xl">
      <Header title="Integration Documentation" />

      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-md space-y-2">
        <h2 className="text-lg font-bold flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Quickstart Integration Guide</span>
        </h2>
        <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
          Connect your Google Apps Script, Google Sheets workflows, or custom backend to send tracked emails in seconds. The platform automatically rewrites destination links and injects invisible open tracking pixels.
        </p>
      </div>

      {/* Google Apps Script Integration Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Code className="w-5 h-5 text-blue-600" />
            <span>Google Apps Script Copy & Paste Snippet</span>
          </h3>
          <button
            onClick={handleCopyScript}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
          >
            {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedScript ? 'Copied Code!' : 'Copy Script'}</span>
          </button>
        </div>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto relative">
          <pre>{APPS_SCRIPT_CODE}</pre>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs text-slate-700">
          <h4 className="font-bold text-slate-900">Setup Instructions:</h4>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Go to <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">script.google.com</a> and open or create your script project.</li>
            <li>Copy the code snippet above and paste it into your script editor.</li>
            <li>Generate an API Key on the <strong>API Keys</strong> page in this dashboard.</li>
            <li>Replace <code>YOUR_API_KEY_HERE</code> with your generated secret key.</li>
            <li>Click <strong>Run</strong> inside Google Apps Script to send your first tracked email.</li>
          </ol>
        </div>
      </div>

      {/* REST API Reference Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-indigo-600" />
          <span>REST API Endpoint Specification</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">POST</span>
            <code className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs font-semibold">
              /api/v1/emails
            </code>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5">Header</th>
                  <th className="p-2.5">Value</th>
                  <th className="p-2.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Authorization</td>
                  <td className="p-2.5 text-blue-600">Bearer YOUR_API_KEY</td>
                  <td className="p-2.5 text-slate-600 font-sans">SHA-256 hashed API Key authentication</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Content-Type</td>
                  <td className="p-2.5 text-slate-700">application/json</td>
                  <td className="p-2.5 text-slate-600 font-sans">JSON body format</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* cURL Example */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-2">cURL Example</h4>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
            <pre>{curlExample}</pre>
          </div>
        </div>

        {/* Response Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Success Response (201 Created)</h4>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px]">
              <pre>{`{
  "success": true,
  "emailId": "em_1741085000_abc12",
  "trackingId": "trk_01jxyz9876543210",
  "status": "SENT"
}`}</pre>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Error Response (401 / 429 / 400)</h4>
            <div className="bg-slate-900 text-rose-400 p-3 rounded-lg font-mono text-[11px]">
              <pre>{`{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The API key is invalid or revoked."
  }
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Limitations Disclaimer */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold mb-1">Open Tracking Technical Limitation Disclosure</h4>
          <p className="leading-relaxed">
            Email open tracking works by embedding an invisible 1x1 GIF tracking image into the email HTML. Email client privacy features (such as Apple Mail Privacy Protection, automated security link scanners, image blocking, and Gmail proxy caching) can either suppress image loads or trigger automatic pre-fetches. Therefore, the dashboard explicitly labels opens as <strong>Tracked Opens</strong> rather than guaranteeing 100% human readership.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WebsiteHeader } from '@/components/website-header';
import { WebsiteFooter } from '@/components/website-footer';
import {
  Mail,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  Sparkles,
  Building2,
  Clock,
  Globe2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email,
          subject: subject,
          message: message,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to send message. Please try again.');
      }

      setSuccessMsg(data.message || 'Thank you! Your message has been received.');
      setFullName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020512] text-white selection:bg-[#53E2FE]/20 selection:text-[#53E2FE] flex flex-col justify-between">
      {/* Background glow auras matching website front page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at center, #53E2FE 0%, rgba(14,165,233,0.5) 45%, transparent 75%)',
          }}
        />
        <div
          className="absolute bottom-[10%] -left-[10%] w-[650px] h-[650px] rounded-full blur-[160px] opacity-25"
          style={{
            background:
              'radial-gradient(ellipse at center, #0284c7 0%, rgba(83,226,254,0.4) 50%, transparent 80%)',
          }}
        />
      </div>

      <WebsiteHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        {/* Page Headline */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#53E2FE]/10 border border-[#53E2FE]/30 text-[#53E2FE] text-xs sm:text-sm font-semibold shadow-[0_0_15px_rgba(83,226,254,0.2)]">
            <Sparkles className="w-4 h-4" />
            <span>24/7 Engineering & Enterprise Support</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Get in Touch with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#53E2FE] via-sky-300 to-white">
              ERHA Technologies
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Have questions regarding Mailify deliverability, high-volume tracking, or custom enterprise deployments? Our dedicated engineering team is here to assist you.
          </p>
        </section>

        {/* Contact Container: Left Form + Right Info */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Contact Form Styled with Front Page Color Scheme */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#071126]/90 backdrop-blur-2xl border-2 border-[#53E2FE]/40 p-6 sm:p-10 shadow-[0_20px_80px_rgba(83,226,254,0.2)] relative overflow-hidden">
              {/* Form Ambient Light Accent */}
              <div
                className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-[80px] pointer-events-none opacity-30"
                style={{ background: '#53E2FE' }}
              />

              <div className="relative z-10 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                    <span>Send us a Message</span>
                    <span className="w-2 h-2 rounded-full bg-[#53E2FE] animate-ping" />
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Fill out the form below and an ERHA Technologies representative will reply within 2 hours.
                  </p>
                </div>

                {/* Feedback Alerts */}
                {successMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Message Sent Successfully!</p>
                      <p className="mt-0.5 text-slate-200">{successMsg}</p>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Submission Error</p>
                      <p className="mt-0.5 text-slate-200">{errorMsg}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#53E2FE] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#030614]/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#53E2FE] focus:ring-2 focus:ring-[#53E2FE]/30 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                      Business Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#53E2FE] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="john@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#030614]/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#53E2FE] focus:ring-2 focus:ring-[#53E2FE]/30 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                      Topic / Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-[#030614]/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-[#53E2FE] focus:ring-2 focus:ring-[#53E2FE]/30 transition-all cursor-pointer"
                    >
                      <option value="General Inquiry" className="bg-[#071126] text-white">General Inquiry</option>
                      <option value="Deliverability & Warmup Consultation" className="bg-[#071126] text-white">Deliverability & Warmup Consultation</option>
                      <option value="Technical Support & API Help" className="bg-[#071126] text-white">Technical Support & API Help</option>
                      <option value="Custom Enterprise & Agency Plan" className="bg-[#071126] text-white">Custom Enterprise & Agency Plan</option>
                      <option value="Partnership Opportunities" className="bg-[#071126] text-white">Partnership Opportunities</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                      Your Message *
                    </label>
                    <div className="relative">
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us how we can help you with your email tracking or deliverability goals..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-3.5 bg-[#030614]/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#53E2FE] focus:ring-2 focus:ring-[#53E2FE]/30 transition-all shadow-inner resize-y"
                      />
                    </div>
                  </div>

                  {/* Submit Button with Front Page Glow */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#53E2FE] hover:brightness-110 text-slate-950 font-bold text-sm shadow-[0_10px_30px_rgba(83,226,254,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-99 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT: Company & Support Information */}
          <div className="lg:col-span-5 space-y-6">
            {/* Company Details Card */}
            <div className="rounded-3xl bg-[#071126]/90 border border-slate-800 p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/30">
                  ET
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">ERHA Technologies</h3>
                  <p className="text-xs text-[#53E2FE] font-medium">Software Engineering & Product Studio</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#53E2FE] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold">Official Email Support</p>
                    <a
                      href="mailto:support@erhatechnologies.com"
                      className="text-slate-400 hover:text-[#53E2FE] transition-colors"
                    >
                      support@erhatechnologies.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#c6f432] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold">Response Time SLA</p>
                    <p className="text-slate-400">Within 2 hours during active business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold">Global Infrastructure</p>
                    <p className="text-slate-400">Distributed worldwide across Google Cloud edge locations</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold">Security & Privacy Inquiries</p>
                    <a
                      href="mailto:privacy@erhatechnologies.com"
                      className="text-slate-400 hover:text-[#53E2FE] transition-colors"
                    >
                      privacy@erhatechnologies.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#061536] to-[#030919] border border-blue-900/40 p-6 space-y-4">
              <h4 className="text-sm font-bold text-white">Already have an account?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log in to open your live dashboard, monitor ongoing warmup sequences, or review real-time email telemetry.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#53E2FE] hover:text-white transition-colors"
              >
                <span>Go to Client Dashboard</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
}

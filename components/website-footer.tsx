'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Heart } from 'lucide-react';

export function WebsiteFooter() {
  return (
    <footer className="w-full bg-[#020512] border-t border-[#53E2FE]/20 text-white relative z-20 overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] rounded-full pointer-events-none -z-10 blur-[120px] opacity-25"
        style={{
          background: 'radial-gradient(ellipse at center, #53E2FE 0%, rgba(14,165,233,0.4) 50%, transparent 80%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & ERHA Technologies info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/?view=landing" className="inline-block">
              <img
                src="/images/mailify-logo-white.png"
                alt="Mailify"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Enterprise email tracking, real-time Gmail telemetry, intelligent AI warmup fleet, and inbox deliverability engine. Crafted and maintained with precision by <span className="text-white font-semibold">ERHA Technologies</span>.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-500 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#53E2FE]/10 text-[#53E2FE] border border-[#53E2FE]/20 font-semibold">
                <Sparkles className="w-3 h-3" />
                Next-Gen Mail Tech
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                <Shield className="w-3 h-3" />
                Enterprise Security
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#53E2FE] mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/about" className="hover:text-[#53E2FE] transition-colors">
                  About Mailify & ERHA
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-[#53E2FE] transition-colors">
                  Features & Capabilities
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#53E2FE] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#53E2FE] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform & Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#53E2FE] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <span className="text-white font-medium">ERHA Technologies</span>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#53E2FE] transition-colors">
                  Technical Support
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#53E2FE] transition-colors">
                  Client Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@erhatechnologies.com"
                  className="hover:text-[#53E2FE] transition-colors"
                >
                  support@erhatechnologies.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Mailify. An ERHA Technologies Innovation. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy-policy" className="hover:text-[#53E2FE] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-[#53E2FE] transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

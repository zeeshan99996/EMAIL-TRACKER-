'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { MailTrackerLogo } from './website-header';

export function WebsiteFooter() {
  const pathname = usePathname();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const isHomePage = pathname === '/' || pathname === '' || pathname.includes('view=landing');
      if (isHomePage) {
        e.preventDefault();
        const id = href.replace('/#', '');
        const elem = document.getElementById(id);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', href);
        }
      }
    }
  };

  return (
    <footer className="w-full bg-[#f1f5f9]/70 border-t border-slate-200/90 text-slate-600 relative z-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Overview */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/?view=landing" className="inline-block">
              <MailTrackerLogo />
            </Link>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Real-time Gmail email tracking, double checkmark telemetry, intelligent inbox deliverability warmup, and address verification engine. Crafted with privacy and security for Gmail and Chrome users worldwide.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7EE4FA]/15 text-[#0369a1] border border-[#7EE4FA]/40 font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                Next-Gen Email Tracking
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                GDPR & SOC2 Certified
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#18506D] mb-4">
              Product & Features
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link
                  href="/#workflow"
                  onClick={(e) => handleLinkClick(e, '/#workflow')}
                  className="hover:text-[#18506D] transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE4FA]" />
                  <span>How It Works</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  onClick={(e) => handleLinkClick(e, '/#features')}
                  className="hover:text-[#18506D] transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE4FA]" />
                  <span>Double Checkmarks</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  onClick={(e) => handleLinkClick(e, '/#features')}
                  className="hover:text-[#18506D] transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE4FA]" />
                  <span>Link & Click Telemetry</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  onClick={(e) => handleLinkClick(e, '/#features')}
                  className="hover:text-[#18506D] transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE4FA]" />
                  <span>AI Inbox Warmup</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#testimonials"
                  onClick={(e) => handleLinkClick(e, '/#testimonials')}
                  className="hover:text-[#18506D] transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE4FA]" />
                  <span>Customer Reviews</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  onClick={(e) => handleLinkClick(e, '/#pricing')}
                  className="hover:text-[#18506D] transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE4FA]" />
                  <span>Pricing Plans</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#18506D] mb-4">
              Resources & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/dashboard" className="hover:text-[#18506D] transition-colors">
                  Web Dashboard
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#18506D] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#18506D] transition-colors">
                  Technical Support
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#18506D] transition-colors">
                  About Platform
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MailTracker. All rights reserved. Zero email content stored.</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy-policy" className="hover:text-[#18506D] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-[#18506D] transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';

export function ChromeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#ffffff" />
      <path
        d="M12 2C16.18 2 19.78 4.58 21.24 8.27H12C9.94 8.27 8.27 9.94 8.27 12C8.27 12.38 8.33 12.75 8.44 13.09L4.81 6.8C6.46 3.9 9.5 2 12 2Z"
        fill="#EA4335"
      />
      <path
        d="M21.24 8.27C21.73 9.43 22 10.68 22 12C22 17.52 17.52 22 12 22C10.5 22 9.08 21.67 7.82 21.08L11.45 14.79C11.63 14.82 11.81 14.84 12 14.84C13.57 14.84 14.84 13.57 14.84 12C14.84 11.39 14.65 10.82 14.32 10.35L21.24 8.27Z"
        fill="#34A853"
      />
      <path
        d="M12 22C8.75 22 5.92 20.44 4.18 18.06L7.81 11.77C7.38 12.65 7.15 13.64 7.15 14.68C7.15 17.47 9.41 19.73 12.2 19.73C12.44 19.73 12.68 19.71 12.91 19.67L10.74 21.77C11.15 21.92 11.57 22 12 22Z"
        fill="#FBBC05"
      />
      <circle cx="12" cy="12" r="4.3" fill="#ffffff" />
      <circle cx="12" cy="12" r="3.2" fill="#1A73E8" />
    </svg>
  );
}

export function MailTrackerLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Circle Icon */}
      <div className="w-8 h-8 rounded-full bg-[#18506D] flex items-center justify-center shadow-sm shadow-[#18506D]/25 transition-transform group-hover:scale-105">
        <div className="flex items-center justify-center gap-0.5 text-white font-bold leading-none">
          <span className="text-[#8AEDFF] font-bold text-sm tracking-tighter">c</span>
          <span className="flex flex-col gap-[3px] ml-[1px]">
            <span className="w-[3.5px] h-[3.5px] rounded-full bg-white"></span>
            <span className="w-[3.5px] h-[3.5px] rounded-full bg-[#8AEDFF]"></span>
          </span>
        </div>
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#18506D] transition-colors">
        mailtracker
      </span>
    </div>
  );
}

interface WebsiteHeaderProps {
  onGetStartedClick?: () => void;
}

export function WebsiteHeader({ onGetStartedClick }: WebsiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mailify_submitted_user');
      const hasCookie =
        document.cookie.includes('warmup_user_session') ||
        document.cookie.includes('mailify_has_submitted');
      if (savedUser || hasCookie) {
        setHasUser(true);
      }
    } catch {}
  }, []);

  const handleActionClick = () => {
    if (hasUser) {
      router.push('/dashboard');
      return;
    }
    if (onGetStartedClick) {
      onGetStartedClick();
    } else {
      router.push('/?action=get-started');
    }
  };

  const navLinks = [
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Blog', href: '/#blog' },
  ];

  return (
    <>
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-40 bg-white">
        {/* Brand Logo: mailtracker */}
        <Link
          href="/?view=landing"
          className="flex items-center group py-1"
          title="mailtracker Home"
        >
          <MailTrackerLogo />
        </Link>

        {/* Desktop Navigation Links & CTA */}
        <div className="hidden md:flex items-center space-x-9">
          <nav className="flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-all duration-150 text-[15px] font-medium ${
                    isActive
                      ? 'text-[#18506D] font-semibold'
                      : 'text-slate-700 hover:text-[#18506D]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Button: Install for Chrome */}
          <div className="flex items-center space-x-3">
            {hasUser ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#18506D] hover:bg-[#133e54] rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-2"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleActionClick}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#18506D] hover:bg-[#133e54] rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center gap-2"
              >
                <ChromeIcon className="w-4 h-4 shrink-0" />
                <span>Install for Chrome</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center space-x-3">
          {hasUser ? (
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#18506D] rounded-lg"
            >
              Dashboard
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleActionClick}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#18506D] rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <ChromeIcon className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-[#18506D] rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-3 pb-6 space-y-4 bg-white border-b border-slate-200 shadow-xl relative z-50 text-slate-900 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 transition-colors text-base font-medium text-slate-700 hover:text-[#18506D]"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {hasUser ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#18506D] hover:bg-[#133e54] rounded-lg shadow-sm"
              >
                Open Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleActionClick();
                }}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#18506D] hover:bg-[#133e54] rounded-lg cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <ChromeIcon className="w-4 h-4" />
                <span>Install for Chrome</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

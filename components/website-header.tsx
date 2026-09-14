'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

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
    { name: 'About', href: '/about' },
    { name: 'Features', href: '/features' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <>
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-40">
        {/* Brand Logo: Mailify */}
        <Link
          href="/?view=landing"
          className="flex items-center group py-1"
          title="Mailify Home"
        >
          <img
            src="/images/mailify-logo-white.png"
            alt="Mailify"
            className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 lg:space-x-9 text-sm font-medium text-white/90">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-all duration-200 relative py-1 hover:text-[#53E2FE] ${
                  isActive
                    ? 'text-[#53E2FE] font-bold drop-shadow-[0_0_10px_rgba(83,226,254,0.6)]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#53E2FE] rounded-full shadow-[0_0_8px_#53E2FE]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button: Get Started / Dashboard */}
        <div className="hidden sm:flex items-center space-x-3">
          {hasUser ? (
            <Link
              href="/dashboard"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-[#c6f432] hover:bg-[#b8e82a] rounded-full shadow-md shadow-[#c6f432]/20 transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-1.5"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleActionClick}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-full shadow-sm hover:shadow transition-all hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center space-x-2">
          {hasUser && (
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-[#c6f432] rounded-full sm:hidden"
            >
              Dashboard
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-[#53E2FE] rounded-xl hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-3 pb-6 space-y-4 bg-[#050c1e]/98 backdrop-blur-2xl border-b border-[#53E2FE]/20 shadow-2xl relative z-50 text-white animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3.5 text-base font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-1 transition-colors flex items-center justify-between ${
                    isActive
                      ? 'text-[#53E2FE] font-bold drop-shadow-[0_0_8px_rgba(83,226,254,0.5)]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#53E2FE]" />}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            {hasUser ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-slate-950 bg-[#c6f432] hover:bg-[#b8e82a] rounded-full shadow-md"
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
                className="w-full text-center py-2.5 text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-full cursor-pointer shadow-md"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ArrowRight, Workflow, Sparkles, Star, CreditCard, ChevronRight } from 'lucide-react';

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
      {/* Circle Icon with #7EE4FA */}
      <div className="w-8 h-8 rounded-full bg-[#18506D] flex items-center justify-center shadow-sm shadow-[#18506D]/25 transition-transform group-hover:scale-105">
        <div className="flex items-center justify-center gap-0.5 text-white font-bold leading-none">
          <span className="text-[#7EE4FA] font-bold text-sm tracking-tighter">c</span>
          <span className="flex flex-col gap-[3px] ml-[1px]">
            <span className="w-[3.5px] h-[3.5px] rounded-full bg-white"></span>
            <span className="w-[3.5px] h-[3.5px] rounded-full bg-[#7EE4FA]"></span>
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
  const [activeSection, setActiveSection] = useState<string>('');

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

  // Track active section on scroll for smooth indication
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['workflow', 'features', 'testimonials', 'pricing'];
      const scrollPosition = window.scrollY + 160;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const elem = document.getElementById(id);
        if (elem) {
          const top = elem.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            return;
          }
        }
      }
      if (window.scrollY < 200) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

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
    { name: 'Workflow', href: '/#workflow', id: 'workflow', icon: Workflow },
    { name: 'Features', href: '/#features', id: 'features', icon: Sparkles },
    { name: 'Testimonials', href: '/#testimonials', id: 'testimonials', icon: Star },
    { name: 'Pricing', href: '/#pricing', id: 'pricing', icon: CreditCard },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    const isHomePage = pathname === '/' || pathname === '' || pathname.includes('view=landing');
    if (isHomePage) {
      e.preventDefault();
      const targetElement = document.getElementById(id);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
        setActiveSection(id);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#f8fafc]/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between">
          {/* Brand Logo: mailtracker */}
          <Link
            href="/?view=landing"
            className="flex items-center group py-1"
            title="mailtracker Home"
          >
            <MailTrackerLogo />
          </Link>

          {/* Desktop Navigation Links (Responsive spacing & active indicators) */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
            <nav className="flex items-center space-x-5 lg:space-x-8">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href, link.id)}
                    className={`relative py-1 transition-all duration-150 text-[14px] lg:text-[15px] font-medium group ${
                      isActive
                        ? 'text-[#18506D] font-bold'
                        : 'text-slate-600 hover:text-[#18506D]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive ? (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#18506D] to-[#7EE4FA] rounded-full animate-in fade-in duration-200" />
                    ) : (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#7EE4FA] rounded-full transition-all duration-200 group-hover:w-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action Button: Install for Chrome */}
            <div className="flex items-center space-x-3">
              {hasUser ? (
                <Link
                  href="/dashboard"
                  className="px-4.5 lg:px-5 py-2 lg:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#18506D] hover:bg-[#133e54] rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-2"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="px-4.5 lg:px-5 py-2 lg:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#18506D] hover:bg-[#133e54] rounded-xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-[#7EE4FA]/40 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center gap-2"
                >
                  <ChromeIcon className="w-4 h-4 shrink-0" />
                  <span>Install for Chrome</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button & Action */}
          <div className="flex md:hidden items-center space-x-2">
            {hasUser ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#18506D] rounded-lg shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleActionClick}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#18506D] rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ChromeIcon className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#18506D] rounded-lg hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7EE4FA]/50"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#18506D]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[57px] inset-x-0 bottom-0 z-40 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#f8fafc] border-b border-slate-200 shadow-2xl p-5 space-y-4 animate-in slide-in-from-top-3 duration-200 max-h-[calc(100vh-65px)] overflow-y-auto">
            <nav className="grid grid-cols-1 gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeSection === link.id;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleLinkClick(e, link.href, link.id);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                      isActive
                        ? 'bg-[#7EE4FA]/15 text-[#18506D] font-bold border border-[#7EE4FA]/40 shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#18506D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive
                            ? 'bg-[#18506D] text-[#7EE4FA]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-200/80 flex flex-col gap-2">
              {hasUser ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-sm font-semibold text-white bg-[#18506D] hover:bg-[#133e54] rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleActionClick();
                  }}
                  className="w-full text-center py-3 text-sm font-semibold text-white bg-[#18506D] hover:bg-[#133e54] rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <ChromeIcon className="w-4 h-4" />
                  <span>Install MailTracker for Chrome</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

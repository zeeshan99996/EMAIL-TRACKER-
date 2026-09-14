'use client';

import React from 'react';

export function HeroIntegrationsBeam() {
  // Left converging lines: 13 bezier curves fanning in from x=0 to center x=460
  const leftLines = Array.from({ length: 13 }, (_, i) => {
    const yStart = 20 + i * 21.6;
    const yEnd = 132 + i * 3;
    return {
      id: `left-${i}`,
      d: `M 0 ${yStart} C 180 ${yStart}, 330 ${yEnd}, 460 ${yEnd}`,
      yStart,
      yEnd,
      index: i,
    };
  });

  // Right diverging lines: 13 bezier curves fanning out from center x=540 to x=1000
  const rightLines = Array.from({ length: 13 }, (_, i) => {
    const yStart = 132 + i * 3;
    const yEnd = 20 + i * 21.6;
    return {
      id: `right-${i}`,
      d: `M 540 ${yStart} C 670 ${yStart}, 820 ${yEnd}, 1000 ${yEnd}`,
      yStart,
      yEnd,
      index: i,
    };
  });

  // Highlight pulse lines
  const pulseLeftIndices = [1, 3, 6, 9, 11];
  const pulseRightIndices = [1, 3, 6, 9, 11];

  return (
    <div className="w-full max-w-4xl mx-auto relative mt-8 sm:mt-16 md:mt-22 mb-4 sm:mb-6 h-[240px] sm:h-[290px] md:h-[330px] select-none flex items-center justify-center">
      {/* Ambient Central Cyan Glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-32 sm:h-48 bg-[#53E2FE]/15 blur-3xl rounded-full pointer-events-none" />

      {/* SVG Canvas with Curved Connecting Lines (White) */}
      <svg
        viewBox="0 0 1000 300"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full pointer-events-none absolute inset-0"
      >
        <defs>
          {/* Gradient for Left White Converging Lines */}
          <linearGradient id="whiteGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.10" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
          </linearGradient>

          {/* Gradient for Right White Diverging Lines */}
          <linearGradient id="whiteGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.10" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="whiteBeamGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ---------------- Left Static Base Curves (White) ---------------- */}
        {leftLines.map((line) => (
          <path
            key={line.id}
            d={line.d}
            stroke="url(#whiteGradLeft)"
            strokeWidth={line.index === 6 ? 1.8 : 1.2}
            strokeLinecap="round"
          />
        ))}

        {/* ---------------- Right Static Base Curves (White) ---------------- */}
        {rightLines.map((line) => (
          <path
            key={line.id}
            d={line.d}
            stroke="url(#whiteGradRight)"
            strokeWidth={line.index === 6 ? 1.8 : 1.2}
            strokeLinecap="round"
          />
        ))}

        {/* ---------------- Animated Light Pulses (Inflow to Mizu) ---------------- */}
        {pulseLeftIndices.map((idx, i) => {
          const line = leftLines[idx];
          const dur = 2.2 + i * 0.4;
          const delay = i * 0.5;
          return (
            <g key={`pulse-left-${idx}`}>
              {/* Subtle trailing dashed line */}
              <path
                d={line.d}
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeDasharray="14 90"
                opacity="0.8"
                style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.9))' }}
              />
              {/* Traveling Photon Bead */}
              <circle r="3.5" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 6px #FFFFFF)' }}>
                <animateMotion
                  path={line.d}
                  dur={`${dur}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="2" fill="#53E2FE" style={{ filter: 'drop-shadow(0 0 4px #53E2FE)' }}>
                <animateMotion
                  path={line.d}
                  dur={`${dur}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {/* ---------------- Animated Light Pulses (Outflow from Mizu) ---------------- */}
        {pulseRightIndices.map((idx, i) => {
          const line = rightLines[idx];
          const dur = 2.2 + i * 0.4;
          const delay = 0.3 + i * 0.5;
          return (
            <g key={`pulse-right-${idx}`}>
              {/* Subtle trailing dashed line */}
              <path
                d={line.d}
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeDasharray="14 90"
                opacity="0.8"
                style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.9))' }}
              />
              {/* Traveling Photon Bead */}
              <circle r="3.5" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 6px #FFFFFF)' }}>
                <animateMotion
                  path={line.d}
                  dur={`${dur}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="2" fill="#53E2FE" style={{ filter: 'drop-shadow(0 0 4px #53E2FE)' }}>
                <animateMotion
                  path={line.d}
                  dur={`${dur}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* ========================================================================= */}
      {/* INTEGRATION NODES / CARDS (POSITIONED PRECISELY OVER BEAMS) */}
      {/* ========================================================================= */}

      {/* 1. TOP-LEFT NODE: GMAIL */}
      <div className="absolute left-[14%] sm:left-[18%] md:left-[19%] top-[16%] sm:top-[18%] -translate-x-1/2 -translate-y-1/2 z-20 group flex flex-col items-center">
        <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl sm:rounded-[20px] bg-white/95 backdrop-blur-md p-2 sm:p-3 shadow-[0_12px_28px_rgba(0,0,0,0.4),0_0_1px_rgba(255,255,255,0.9)] border border-white/80 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_16px_36px_rgba(83,226,254,0.35)] cursor-pointer">
          {/* Gmail Official Color Icon */}
          <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none">
            <path d="M45 16.2L40 18.95L35 23.7V40H42C43.657 40 45 38.657 45 37V16.2Z" fill="#34A853" />
            <path d="M3 16.2L6.614 17.91L13 23.7V40H6C4.343 40 3 38.657 3 37V16.2Z" fill="#4285F4" />
            <polygon points="35 11.2 24 19.45 13 11.2 12 17 13 23.7 24 31.95 35 23.7 36 17" fill="#EA4335" />
            <path d="M3 12.3V16.2L13 23.7V11.2L9.876 8.86C8.132 7.55 5.633 8.04 4.475 9.91L3 12.3Z" fill="#FBBC05" />
            <path d="M45 12.3V16.2L35 23.7V11.2L38.124 8.86C39.868 7.55 42.367 8.04 43.525 9.91L45 12.3Z" fill="#C5221F" />
          </svg>
        </div>
        <span className="mt-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700/60 text-[10px] sm:text-[11px] font-medium text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
          Gmail
        </span>
      </div>

      {/* 2. BOTTOM-LEFT NODE: GOOGLE APPS SCRIPT */}
      <div className="absolute left-[18%] sm:left-[22%] md:left-[23%] bottom-[16%] sm:bottom-[18%] -translate-x-1/2 translate-y-1/2 z-20 group flex flex-col items-center">
        <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl sm:rounded-[20px] bg-white/95 backdrop-blur-md p-2 sm:p-3 shadow-[0_12px_28px_rgba(0,0,0,0.4),0_0_1px_rgba(255,255,255,0.9)] border border-white/80 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_16px_36px_rgba(83,226,254,0.35)] cursor-pointer">
          {/* Google Apps Script Icon */}
          <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none">
            <rect width="48" height="48" rx="10" fill="#0B57D0" />
            <path d="M18 16L10 24L18 32" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30 16L38 24L30 32" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26 14L22 34" stroke="#7CACF8" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="mt-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700/60 text-[10px] sm:text-[11px] font-medium text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
          Apps Script
        </span>
      </div>

      {/* 3. CENTER MAIN HUB: MAILIFY LOGO */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 group flex flex-col items-center">
        {/* Soft Radial Backlight */}
        <div className="absolute -inset-2.5 sm:-inset-3 bg-gradient-to-r from-[#53E2FE] via-cyan-300 to-[#53E2FE] rounded-[24px] sm:rounded-[28px] blur-md sm:blur-lg opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse pointer-events-none" />

        {/* Central Mailify Hub Card */}
        <div className="relative px-3.5 sm:px-5 py-2.5 sm:py-3.5 min-w-[95px] sm:min-w-[125px] md:min-w-[145px] bg-slate-950/95 rounded-2xl sm:rounded-[24px] border-2 border-[#53E2FE] flex items-center justify-center shadow-[0_0_35px_rgba(83,226,254,0.55),0_20px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl group-hover:scale-105 transition-transform duration-300 cursor-pointer">
          <img
            src="/images/mailify-logo-white.png"
            alt="Mailify"
            className="h-7 sm:h-8 md:h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(83,226,254,0.7)]"
          />
        </div>
      </div>

      {/* 4. TOP-RIGHT NODE: GOOGLE SHEETS */}
      <div className="absolute right-[18%] sm:right-[22%] md:right-[23%] top-[16%] sm:top-[18%] translate-x-1/2 -translate-y-1/2 z-20 group flex flex-col items-center">
        <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl sm:rounded-[20px] bg-white/95 backdrop-blur-md p-2 sm:p-3 shadow-[0_12px_28px_rgba(0,0,0,0.4),0_0_1px_rgba(255,255,255,0.9)] border border-white/80 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_16px_36px_rgba(83,226,254,0.35)] cursor-pointer">
          {/* Google Sheets Icon */}
          <svg viewBox="0 0 48 48" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none">
            <path d="M29 4H10C7.79 4 6 5.79 6 8V40C6 42.21 7.79 44 10 44H38C40.21 44 42 42.21 42 40V17L29 4Z" fill="#0F9D58" />
            <path d="M29 4V17H42L29 4Z" fill="#87CEAB" />
            <rect x="13" y="22" width="22" height="16" rx="1.5" fill="#FFFFFF" />
            <rect x="15" y="24" width="8" height="4" fill="#0F9D58" />
            <rect x="25" y="24" width="8" height="4" fill="#0F9D58" />
            <rect x="15" y="30" width="8" height="6" fill="#0F9D58" opacity="0.85" />
            <rect x="25" y="30" width="8" height="6" fill="#0F9D58" opacity="0.85" />
          </svg>
        </div>
        <span className="mt-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700/60 text-[10px] sm:text-[11px] font-medium text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
          Google Sheets
        </span>
      </div>

      {/* 5. BOTTOM-RIGHT NODE: MICROSOFT OUTLOOK */}
      <div className="absolute right-[14%] sm:right-[18%] md:right-[19%] bottom-[16%] sm:bottom-[18%] translate-x-1/2 translate-y-1/2 z-20 group flex flex-col items-center">
        <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl sm:rounded-[20px] bg-white/95 backdrop-blur-md p-2 sm:p-3 shadow-[0_12px_28px_rgba(0,0,0,0.4),0_0_1px_rgba(255,255,255,0.9)] border border-white/80 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_16px_36px_rgba(83,226,254,0.35)] cursor-pointer">
          {/* Microsoft Outlook Icon */}
          <svg viewBox="0 0 32 32" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none">
            <path fill="#0078d4" d="M18 5h10a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H18z"/>
            <path fill="#28a8ea" d="M18 10l12 6.5L18 23z"/>
            <path fill="#0364b8" d="M18 5l12 7.5v8.5L18 27z"/>
            <rect x="2" y="7" width="18" height="18" rx="3" fill="#0078d4"/>
            <circle cx="11" cy="16" r="4.5" fill="none" stroke="#fff" strokeWidth="2.2"/>
          </svg>
        </div>
        <span className="mt-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700/60 text-[10px] sm:text-[11px] font-medium text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
          Outlook
        </span>
      </div>
    </div>
  );
}

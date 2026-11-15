'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play, X } from 'lucide-react';

export function EliteHeroSection() {
  const [duration, setDuration] = useState('0:30');
  const [cinemaOpen, setCinemaOpen] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const openCinemaModal = () => {
    setCinemaOpen(true);
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.play().catch(() => {});
    }
  };

  const closeCinemaModal = () => {
    setCinemaOpen(false);
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cinemaOpen) {
        closeCinemaModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cinemaOpen]);

  return (
    <section className="relative overflow-hidden bg-[#faf8f5] text-slate-900 w-full min-h-[620px] lg:h-[calc(100svh-72px)] xl:h-[calc(100svh-104px)] lg:max-h-[960px] flex flex-col justify-between">
      {/* Full-bleed Photo of Serene Lake Villa */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Image
          src="/images/landing/hero-lake-villa-v2.jpg"
          alt="Luxury serene lakeside retreat with floor to ceiling windows"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Subtle natural gradient to ensure 100% WCAG contrast on copy */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/35 sm:via-white/60 sm:to-transparent lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/90" />
      </div>

      {/* Hero Top Content Area */}
      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 z-10 flex-1 flex flex-col justify-center py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] items-center gap-10 xl:gap-14">
          {/* Main Editorial Copy */}
          <div className="relative max-w-2xl">
            {/* Subtle luminous ambient glow for crisp legibility and luxury depth */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-10 -top-10 h-72 w-72 rounded-full bg-white/60 blur-3xl"
            />

            {/* Architectural Eyebrow Badge */}
            <div className="relative inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-md mb-4 sm:mb-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono futuristic-font font-semibold uppercase tracking-[0.24em] text-slate-700">
                European Regenerative Network
              </span>
            </div>

            {/* Authoritative Primary H1 Headline */}
            <h1
              id="hero-title"
              className="relative font-editorial text-4xl sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] leading-[1.05] tracking-[-0.015em] text-slate-950 break-words font-normal"
            >
               Guided access to wellness technologies, with the specifications and the evidence limits published alongside them.
            </h1>

            {/* Subhead Context Copy */}
            <p
              id="hero-copy"
              className="relative mt-4 sm:mt-5 text-base sm:text-lg lg:text-[1.125rem] leading-[1.65] text-slate-700 max-w-xl font-normal break-words"
            >
               Hylono arranges guided access to non-invasive wellness equipment across Europe — the chamber, the hydrogen unit, the light panel and the mat. Published operating ranges and the reviewed evidence are on each product page; we do not promise an outcome.
            </p>

            {/* Primary Action Buttons matching Reference */}
            <div className="relative mt-6 sm:mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <a
                href="#technologies"
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-medium text-white shadow-[0_4px_16px_rgba(0,0,0,0.14)] transition-all duration-300 hover:bg-slate-800 hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                <span className="tracking-tight">Explore technologies</span>
                <ArrowRight className="h-4 w-4 text-cyan-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={openCinemaModal}
                aria-label="watch video reel"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-slate-300/80 bg-white/80 backdrop-blur-xl px-6 py-3.5 text-sm font-medium text-slate-900 shadow-sm transition-all duration-300 hover:bg-white hover:border-slate-400 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-white shadow-xs transition-transform duration-300 group-hover:scale-110">
                  <Play className="h-2 w-2 fill-current ml-0.5" aria-hidden="true" />
                </span>
                <span className="tracking-tight">Watch video reel</span>
                <span className="text-[11px] text-slate-500 font-mono tracking-normal">({duration})</span>
              </button>
            </div>
          </div>

          {/* Right Column: Executive Architectural Glass HUD Console */}
          <div className="hidden lg:flex flex-col items-end justify-center pr-2 xl:pr-6">
            <div className="w-full max-w-[340px] rounded-[2rem] border border-white/80 bg-white/60 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/[0.04]">
              {/* Telemetry Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-900/[0.07]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                  </span>
                  <span className="text-[10px] font-mono futuristic-font font-semibold tracking-[0.22em] text-slate-800 uppercase">
                    ● LIVE TELEMETRY
                  </span>
                </div>
                <span className="text-[9px] font-mono futuristic-font tracking-widest text-slate-500 uppercase px-2 py-0.5 rounded-md bg-slate-100/90 border border-slate-200/60 font-semibold">
                  SYS.ON
                </span>
              </div>

              {/* Modality Status Items / Quick-Inspect Indicators */}
              <div className="space-y-2.5">
                {/* Science */}
                <div className="group flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/70 bg-white/50 hover:bg-white/90 hover:border-cyan-200/80 transition-all duration-200">
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                    <span className="text-[11px] font-mono futuristic-font tracking-[0.22em] font-medium text-slate-800 uppercase group-hover:text-cyan-700 transition-colors">
                      Science
                    </span>
                  </div>
                   <span className="text-[10px] font-mono text-slate-500 tracking-wide font-medium">
                     Published Specs
                   </span>
                 </div>

                 {/* Technology */}
                <div className="group flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/70 bg-white/50 hover:bg-white/90 hover:border-indigo-200/80 transition-all duration-200">
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                    <span className="text-[11px] font-mono futuristic-font tracking-[0.22em] font-medium text-slate-800 uppercase group-hover:text-indigo-700 transition-colors">
                      Technology
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tracking-wide font-medium">
                    Gen-III Med
                  </span>
                </div>

                {/* Wellness */}
                <div className="group flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/70 bg-white/50 hover:bg-white/90 hover:border-emerald-200/80 transition-all duration-200">
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    <span className="text-[11px] font-mono futuristic-font tracking-[0.22em] font-medium text-slate-800 uppercase group-hover:text-emerald-700 transition-colors">
                      Wellness
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tracking-wide font-medium">
                    Non-Invasive
                  </span>
                </div>

                {/* Pressure */}
                <div className="group flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/70 bg-white/50 hover:bg-white/90 hover:border-amber-200/80 transition-all duration-200">
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0 0_6px_rgba(245,158,11,0.8)]" />
                    <span className="text-[11px] font-mono futuristic-font tracking-[0.22em] font-medium text-slate-800 uppercase group-hover:text-amber-700 transition-colors">
                      Pressure
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tracking-wide font-medium">
                    1.3 – 1.5 ATA
                  </span>
                </div>
              </div>

              {/* Chamber Telemetry Readout */}
              <div className="mt-4 pt-3.5 border-t border-slate-900/[0.07] flex items-center justify-between text-[10px] font-mono text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="futuristic-font">CHAMBER READY</span>
                </span>
                <span className="font-semibold text-slate-800 futuristic-font">1.3 – 1.5 ATA PUBLISHED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Trust & Telemetry Bar docked at bottom of Hero Viewport */}
      <div className="relative z-20 shrink-0 w-full px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 pt-2">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/80 bg-white/80 backdrop-blur-xl p-4 sm:p-5 lg:py-5 lg:px-8 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] ring-1 ring-slate-900/[0.04]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {/* Metric 1: HBOT Pressure */}
            <div className="flex items-center gap-3 sm:gap-3.5 border-r border-slate-200/60 pr-2 sm:pr-4">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-cyan-200/70 bg-gradient-to-br from-cyan-50/90 to-white/95 shadow-[0_2px_8px_rgba(6,182,212,0.1)] text-cyan-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 12l3.5 -3.5" />
                  <path d="M12 7v1" />
                  <path d="M7 12h1" />
                  <path d="M16 12h1" />
                  <path d="M8.5 8.5l.7.7" />
                  <path d="M15.5 8.5l-.7.7" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse" aria-hidden="true" />
                  <span className="text-sm sm:text-base lg:text-[1.05rem] font-bold text-slate-950 tracking-tight font-sans">
                    1.3 – 1.5 ATA
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 font-medium tracking-normal break-words leading-tight">
                  HBOT Chamber Pressure
                </div>
              </div>
            </div>

            {/* Metric 2: Hydrogen Purity */}
            <div className="flex items-center gap-3 sm:gap-3.5 md:border-r md:border-slate-200/60 md:px-4 pr-2">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 to-white/95 shadow-[0_2px_8px_rgba(14,165,233,0.1)] text-sky-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="6" cy="6" r="2.5" />
                  <circle cx="18" cy="18" r="2.5" />
                  <circle cx="18" cy="6" r="2.5" />
                  <circle cx="6" cy="18" r="2.5" />
                  <line x1="8.5" y1="6" x2="15.5" y2="6" />
                  <line x1="18" y1="8.5" x2="18" y2="15.5" />
                  <line x1="7.8" y1="7.8" x2="16.2" y2="16.2" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.8)] animate-pulse" aria-hidden="true" />
                  <span className="text-sm sm:text-base lg:text-[1.05rem] font-bold text-slate-950 tracking-tight font-sans">
                    99.99%
                  </span>
                  <span className="text-[10px] font-mono futuristic-font font-semibold text-sky-700/90 uppercase">H₂</span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 font-medium tracking-normal break-words leading-tight">
                  Molecular Hydrogen Purity
                </div>
              </div>
            </div>

            {/* Metric 3: White-Glove Logistics */}
            <div className="flex items-center gap-3 sm:gap-3.5 border-r border-slate-200/60 md:px-4 pr-2">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-white/95 shadow-[0_2px_8px_rgba(16,185,129,0.1)] text-emerald-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" aria-hidden="true" />
                  <span className="text-sm sm:text-base lg:text-[1.05rem] font-bold text-slate-950 tracking-tight font-sans">
                    100%
                  </span>
                  <span className="text-[10px] font-mono futuristic-font font-semibold text-emerald-700/90 uppercase">Logistics</span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 font-medium tracking-normal break-words leading-tight">
                  Driven by White-Glove Logistics
                </div>
              </div>
            </div>

            {/* Metric 4: MDR Aligned */}
            <div className="flex items-center gap-3 sm:gap-3.5 md:pl-4">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/90 to-white/95 shadow-[0_2px_8px_rgba(99,102,241,0.1)] text-indigo-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)] animate-pulse" aria-hidden="true" />
                  <span className="text-sm sm:text-base lg:text-[1.05rem] font-bold text-slate-950 tracking-tight font-sans">
                    MDR Aligned
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 font-medium tracking-normal break-words leading-tight">
                  Safety & Ethics Standards
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Cinema Showcase Modal Dialog */}
      {cinemaOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="hylono cinematic hardware showcase"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 sm:p-6 backdrop-blur-2xl animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/15 border border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                </span>
                <span className="text-xs font-mono tracking-wider text-slate-300 uppercase">
                  Hylono Hardware Video Showcase // Hyperbaric Oxygen Therapy
                </span>
              </div>
              <button
                type="button"
                onClick={closeCinemaModal}
                aria-label="close cinema modal"
                className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={modalVideoRef}
                src="/videos/hero/hylono-main-hero-v3.mp4"
                poster="/videos/hero/hylono-main-hero-v3-poster.jpg"
                className="h-full w-full object-contain"
                controls
                autoPlay
                playsInline
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-slate-950/80 px-6 py-4 text-xs text-slate-400">
              <p className="max-w-xl text-slate-300 font-sans leading-relaxed">
                Precision 1.3 - 1.5 ATA pressure chambers. The published operating range is a device specification, not a physiological result.
              </p>
              <Link
                href="/product/hbot"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-50 shadow-sm transition-all duration-150 hover:scale-[1.02]"
              >
                <span>Explore HBOT</span>
                <ArrowRight className="h-3.5 w-3.5 text-cyan-600" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

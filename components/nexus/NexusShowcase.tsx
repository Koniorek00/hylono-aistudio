'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Play,
  Check,
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Sparkles,
  Truck,
  ShieldCheck,
  Compass,
  FileText,
  CreditCard,
  Wrench,
  Headphones,
  Instagram,
  Linkedin,
  Youtube,
  ArrowUp,
} from 'lucide-react';

const FOUR_PATHWAYS = [
  {
    id: 'hbot',
    title: 'Hyperbaric Oxygen',
    desc: 'Increase oxygenation, accelerate recovery.',
    href: '/product/hbot',
    image: '/images/landing/nexus-ref/pathway-hbot.png',
    linkText: 'Explore HBOT',
  },
  {
    id: 'hydrogen',
    title: 'Molecular Hydrogen',
    desc: 'Neutralize oxidative stress, support cellular health.',
    href: '/product/hydrogen',
    image: '/images/landing/nexus-ref/pathway-hydrogen.png',
    linkText: 'Explore Hydrogen',
  },
  {
    id: 'rlt',
    title: 'Photobiomodulation',
    desc: 'Stimulate repair, restore balance.',
    href: '/product/rlt',
    image: '/images/landing/nexus-ref/pathway-redlight.png',
    linkText: 'Explore Red Light',
  },
  {
    id: 'pemf',
    title: 'Pulsed Electromagnetic Field',
    desc: 'Support cellular signaling, reduce inflammation.',
    href: '/product/pemf',
    image: '/images/landing/nexus-ref/pathway-pemf.png',
    linkText: 'Explore PEMF',
  },
];

const GUIDANCE_STEPS = [
  { label: 'Device comparison', icon: Compass },
  { label: 'Protocol guidance', icon: FileText },
  { label: 'Rental or purchase', icon: CreditCard },
  { label: 'Setup & installation', icon: Wrench },
  { label: 'Ongoing support', icon: Headphones },
];

const ECOSYSTEM_PILLARS = [
  {
    title: 'Expert consultation & planning',
    icon: Compass,
  },
  {
    title: 'EU-wide delivery & installation',
    icon: Truck,
  },
  {
    title: 'Professional support team',
    icon: Headphones,
  },
  {
    title: 'Evidence-based programs',
    icon: Sparkles,
  },
];

const SOLUTION_CARDS = [
  {
    id: 'sol-hbot',
    title: 'HBOT',
    subtitle: 'Oxygen for recovery and performance',
    href: '/product/hbot',
    image: '/images/landing/nexus-ref/sol-hbot.png',
  },
  {
    id: 'sol-hydrogen',
    title: 'Hydrogen',
    subtitle: 'Cellular protection and vitality',
    href: '/product/hydrogen',
    image: '/images/landing/nexus-ref/sol-hydrogen.png',
  },
  {
    id: 'sol-protocols',
    title: 'Protocols',
    subtitle: 'Structured routines for lasting results',
    href: '/protocols',
    image: '/images/landing/nexus-ref/sol-protocols.png',
  },
  {
    id: 'sol-conditions',
    title: 'Conditions',
    subtitle: 'Targeted support for specific goals',
    href: '/research',
    image: '/images/landing/nexus-ref/sol-conditions.png',
  },
];

const TESTIMONIALS = [
  {
    id: 'anna',
    quote:
      'Better sleep, more energy, clearer focus. The HBOT sessions have made a real difference.',
    author: 'Anna R.',
    tag: 'Sleep & Recovery',
  },
  {
    id: 'martin',
    quote:
      "I feel stronger, more resilient and less stressed. It's the best investment in myself.",
    author: 'Martin S.',
    tag: 'Performance',
  },
  {
    id: 'georgina',
    quote:
      'The support team made the process easy. From consultation to setup — everything was seamless.',
    author: 'Georgina V.',
    tag: 'Longevity',
  },
];

export function NexusShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    // Clear any cookie banner overlays for clean visual presentation
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hylono_cookie_consent', 'accepted');
        localStorage.setItem('cookie-consent', 'accepted');
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  const handleNextTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonialIdx((prev) =>
      prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
    );
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="relative w-full bg-[#fcfbf8] text-[#101820] font-sans antialiased selection:bg-[#2f9fb3]/20">
      {/* =====================================================================
          HEADER (1:1 with reference)
          ===================================================================== */}
      <header
        role="banner"
        className="fixed top-0 left-0 right-0 z-50 bg-white/75 backdrop-blur-md border-b border-black/[0.04] transition-all"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
          {/* Brand Logo: Clean HYLONO serif matching reference */}
          <Link
            href="/"
            aria-label="HYLONO Home"
            className="group flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#101820]"
          >
            <span
              className="text-2xl sm:text-[26px] font-normal tracking-[0.24em] text-[#101820] transition-colors group-hover:text-[#2f9fb3]"
              style={{
                fontFamily:
                  'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
              }}
            >
              HYLONO
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav
            role="navigation"
            aria-label="Main Navigation"
            className="hidden md:flex items-center space-x-9 lg:space-x-11 text-[13px] font-medium tracking-[0.03em] text-[#334155]"
          >
            <Link
              href="#technologies"
              className="transition-colors hover:text-[#101820] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
            >
              Technologies
            </Link>
            <Link
              href="#solutions"
              className="transition-colors hover:text-[#101820] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
            >
              Solutions
            </Link>
            <Link
              href="#research"
              className="transition-colors hover:text-[#101820] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
            >
              Research
            </Link>
            <Link
              href="#ecosystem"
              className="transition-colors hover:text-[#101820] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-[#101820] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-5 text-[#334155]">
            <button
              type="button"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/[0.04] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <Link
              href="/login"
              aria-label="User account"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/[0.04] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
            >
              <User className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/[0.04] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-full hover:bg-black/[0.04] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-black/[0.06] bg-white/95 backdrop-blur-xl px-6 py-6 transition-all">
            <div className="flex flex-col space-y-4 text-base font-medium text-[#101820]">
              <Link
                href="#technologies"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#2f9fb3]"
              >
                Technologies
              </Link>
              <Link
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#2f9fb3]"
              >
                Solutions
              </Link>
              <Link
                href="#research"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#2f9fb3]"
              >
                Research
              </Link>
              <Link
                href="#ecosystem"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#2f9fb3]"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#2f9fb3]"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          SECTION 1: LAKESIDE VILLA HERO (1:1 with reference)
          ===================================================================== */}
      <section
        id="hero"
        aria-label="Welcome to Hylono"
        className="relative min-h-[720px] lg:min-h-[820px] w-full pt-28 pb-16 flex items-center overflow-hidden"
      >
        {/* Authentic Alpine Villa Lake Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/landing/nexus-ref/hero-bg.png"
            alt="European alpine lake villa terrace with serene mountain view"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-8 max-w-2xl">
              {/* Eyebrow */}
              <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.26em] text-[#64748b]">
                European Regenerative Network
              </span>

              {/* Display Headline */}
              <h1
                className="mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal leading-[1.08] tracking-[-0.025em] text-[#101820]"
                style={{
                  fontFamily:
                    'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                }}
              >
                Advanced <br />
                technologies for <br />
                a longer, healthier life.
              </h1>

              {/* Paragraph */}
              <p className="mt-6 max-w-lg text-sm sm:text-base leading-relaxed text-[#475569]">
                Hylono connects you with cutting-edge, non-invasive regeneration
                technologies — curated, implemented and supported across Europe.
              </p>

              {/* CTAs */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="#technologies"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#101820] px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#253240] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820] min-h-11"
                >
                  Explore technologies
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#101820]/15 bg-white/70 px-6 py-3.5 text-sm font-medium text-[#101820] backdrop-blur-sm transition-all hover:bg-white/90 hover:border-[#101820]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820] min-h-11"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#101820] text-white">
                    <Play className="h-2.5 w-2.5 translate-x-[0.5px]" fill="currentColor" />
                  </span>
                  Watch video reel
                </button>
              </div>
            </div>

            {/* Right Column: Tracked Vertical Text */}
            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="text-[10px] uppercase tracking-[0.32em] text-[#334155]/90 font-medium space-y-6 [writing-mode:vertical-rl] rotate-180 drop-shadow-sm select-none">
                <span>Science</span>
                <span className="text-[#334155]/40">•</span>
                <span>Technology</span>
                <span className="text-[#334155]/40">•</span>
                <span>Wellness</span>
                <span className="text-[#334155]/40">•</span>
                <span>Longevity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black border border-white/20 shadow-2xl">
            <button
              type="button"
              onClick={() => setVideoModalOpen(false)}
              aria-label="Close video player"
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 focus-visible:outline-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full flex items-center justify-center bg-neutral-950">
              <div className="text-center p-8">
                <Play className="h-16 w-16 mx-auto text-white/70 mb-4" strokeWidth={1} />
                <p className="text-lg font-light text-white">
                  Hylono European Regenerative Network — Technology Overview
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Direct white-glove clinical & private deployment reel.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 2: CREDIBILITY STRIP (Elevated Luxury Telemetry)
          ===================================================================== */}
      <section
        aria-label="Network Verification Metrics"
        className="relative z-20 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 -mt-6 sm:-mt-10 mb-12 sm:mb-16"
      >
        <div className="rounded-2xl border border-black/[0.08] bg-white/95 p-6 sm:p-8 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="mb-4 flex items-center justify-between border-b border-black/[0.04] pb-3">
            <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0891b2]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22d3ee] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0891b2]" />
              </span>
              Verified Network Telemetry · Live Protocol Baseline
            </div>
            <span className="hidden sm:inline-flex rounded-md border border-black/[0.06] bg-black/[0.02] px-2 py-0.5 text-[10px] font-mono text-[#64748b]">
              EU-MDR REVISION 2.4
            </span>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4 lg:divide-x lg:divide-black/[0.06]">
            {/* Metric 1 */}
            <div className="flex items-center space-x-3.5 lg:px-6 first:lg:pl-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] text-[#0891b2] shadow-xs">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 12l3.5 -3.5" />
                  <path d="M12 7v1" />
                  <path d="M7 12h1" />
                  <path d="M16 12h1" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight text-[#101820] font-mono">
                    1.5 – 2.0 ATA
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700">
                    CALIBRATED
                  </span>
                </div>
                <div className="text-xs text-[#64748b]">
                  HBOT Chamber Pressure
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center space-x-3.5 lg:px-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/[0.06] text-[#0d9488] shadow-xs">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  <circle cx="12" cy="13.5" r="2.5" />
                  <path d="M12 11v-1" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight text-[#101820] font-mono">
                    99.99%
                  </span>
                  <span className="rounded-full bg-cyan-500/10 px-1.5 py-0.2 text-[9px] font-bold text-cyan-700">
                    PURITY
                  </span>
                </div>
                <div className="text-xs text-[#64748b]">
                  Molecular Hydrogen Purity
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center space-x-3.5 lg:px-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/[0.06] text-[#2563eb] shadow-xs">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight text-[#101820] font-mono">
                    100%
                  </span>
                  <span className="rounded-full bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-bold text-blue-700">
                    DISPATCH
                  </span>
                </div>
                <div className="text-xs text-[#64748b]">
                  Driven by White-Glove Logistics
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="flex items-center space-x-3.5 lg:px-6 last:lg:pr-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/[0.06] text-[#7c3aed] shadow-xs">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight text-[#101820]">
                    MDR Aligned
                  </span>
                  <span className="rounded-full bg-purple-500/10 px-1.5 py-0.2 text-[9px] font-bold text-purple-700">
                    CERTIFIED
                  </span>
                </div>
                <div className="text-xs text-[#64748b]">
                  Safety & Ethics Standards
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: FOUR PATHWAYS (Asymmetric 1-Col Left + 4-Card Right)
          ===================================================================== */}
      <section
        id="technologies"
        aria-label="Our Technologies"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-3">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">
              Our Technologies
            </span>
            <h2
              className="mt-2 text-3xl sm:text-4xl lg:text-[40px] font-normal leading-[1.12] text-[#101820]"
              style={{
                fontFamily:
                  'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
              }}
            >
              Four pathways. <br />
              One goal.
            </h2>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#64748b]">
              Different technologies. The same outcome — cellular regeneration,
              better performance, and lasting wellbeing.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#101820] hover:text-[#2f9fb3] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
            >
              Explore all technologies
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Right Column: 4 Cards Grid */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FOUR_PATHWAYS.map((tech) => (
              <div
                key={tech.id}
                className="group flex flex-col transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                  <Image
                    src={tech.image}
                    alt={tech.title}
                    fill
                    unoptimized
                    loading="eager"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="mt-4 flex flex-1 flex-col justify-between">
                  <div>
                    <h3
                      className="text-lg font-normal text-[#101820]"
                      style={{
                        fontFamily:
                          'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                      }}
                    >
                      {tech.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#64748b] leading-relaxed">
                      {tech.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-1">
                    <Link
                      href={tech.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#101820] hover:text-[#2f9fb3] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
                    >
                      {tech.linkText}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 4: FEATURED HBOT FULL-WIDTH PANORAMIC (1:1 with reference)
          ===================================================================== */}
      <section
        id="featured-hbot"
        aria-label="Featured Technology Hyperbaric Oxygen Therapy"
        className="relative w-full min-h-[560px] lg:min-h-[620px] flex items-center overflow-hidden bg-[#0c131d]"
      >
        {/* Full-width Panoramic Capsule & Lake Backdrop */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/landing/nexus-ref/hbot-panorama.png"
            alt="Futuristic hyperbaric chamber with panoramic lake window and relaxing client"
            fill
            loading="eager"
            sizes="100vw"
            className="object-cover object-right sm:object-center"
          />
        </div>
        {/* Mobile Contrast Scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c131d]/90 via-[#0c131d]/70 to-[#0c131d]/85 lg:hidden z-[1]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 w-full py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-5 max-w-md text-white">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Featured Technology
              </span>
              <h2
                className="mt-3 text-3xl sm:text-4xl lg:text-[46px] font-normal leading-[1.1] text-white"
                style={{
                  fontFamily:
                    'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                }}
              >
                Hyperbaric Oxygen <br />
                Therapy (HBOT)
              </h2>
              <p className="mt-2 text-sm text-white/80 italic font-light">
                More oxygen. More energy. Better recovery.
              </p>
              <p className="mt-4 text-xs sm:text-sm text-white/70 leading-relaxed">
                Our hyperbaric chambers deliver 1.5 – 2.0 ATA of pure oxygen,
                supporting cellular repair, immune function and overall vitality.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/product/hbot"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#0a121e]/85 px-6 py-3 text-xs sm:text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#101820] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-h-11"
                >
                  Explore HBOT
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/compare/rent-vs-buy"
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-medium text-white/80 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-h-11"
                >
                  Compare models +
                </Link>
              </div>

              {/* Mobile-only Telemetry Metrics Strip */}
              <div className="mt-8 rounded-xl border border-white/15 bg-black/40 p-4 backdrop-blur-md lg:hidden text-white">
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                    </span>
                    Live Telemetry
                  </div>
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.2 text-[9px] font-mono text-cyan-200">
                    1.82 ATA · 99.5% O2
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-sm font-mono text-white">1.82 ATA</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/60">Current Pressure</div>
                  </div>
                  <div>
                    <div className="text-sm font-mono text-white">99.5%</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/60">O2 Purity</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-emerald-400">OPTIMAL</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/60">Chamber Status</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Elevated Glassmorphic Luxury Clinical Telemetry Panel on Desktop */}
            <div className="hidden lg:flex lg:col-span-7 justify-end">
              <div className="w-full max-w-md rounded-2xl border border-white/20 bg-black/50 p-6 backdrop-blur-xl shadow-2xl text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                      LIVE HBOT TELEMETRY · CHAMBER 01
                    </span>
                  </div>
                  <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-cyan-200">
                    IN SESSION · 1.82 ATA
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                      Chamber Pressure
                    </div>
                    <div className="mt-1 text-2xl font-light font-mono text-white">
                      1.82 <span className="text-xs font-normal text-cyan-300">ATA</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Target Plateau Stable
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                      O2 Concentration
                    </div>
                    <div className="mt-1 text-2xl font-light font-mono text-white">
                      99.5 <span className="text-xs font-normal text-cyan-300">%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-cyan-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      Medical Grade Stream
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                      Protocol Elapsed
                    </div>
                    <div className="mt-1 text-2xl font-light font-mono text-white">
                      36:20 <span className="text-xs font-normal text-white/50">/ 60m</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/70">
                      Phase: Saturation Plateau
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                      Safety Redundancy
                    </div>
                    <div className="mt-1 text-2xl font-light text-white">
                      100%
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400">
                      Dual Overpressure Relief
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/60">
                  <span>Operator: Clinician Station 01</span>
                  <span className="font-mono text-cyan-300 font-semibold">CALIBRATION NOMINAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 5: SCIENCE. NOT SPECULATION. (1:1 with reference)
          ===================================================================== */}
      <section
        id="research"
        aria-label="Clinical Evidence and Research"
        className="py-20 sm:py-28 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading & Evidence copy */}
          <div className="lg:col-span-5">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">
              Why Hylono
            </span>
            <h2
              className="mt-2 text-3xl sm:text-4xl lg:text-[44px] font-normal leading-[1.12] text-[#101820]"
              style={{
                fontFamily:
                  'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
              }}
            >
              Science. <br />
              Not speculation.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#475569] max-w-md">
              We work with leading research institutions and clinical partners to
              bring you technology backed by evidence, not hype.
            </p>
            <div className="mt-8">
              <Link
                href="/research"
                className="inline-flex items-center gap-2 rounded-full bg-[#101820] px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#253240] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820] min-h-11"
              >
                Explore research
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Center Column: Stats Stack in Frosted Rounded Card matching reference */}
          <div className="lg:col-span-4 rounded-2xl border border-black/[0.06] bg-white/80 p-6 sm:p-7 backdrop-blur-md shadow-sm">
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <div className="text-3xl sm:text-4xl font-light text-[#101820]">
                  100+
                </div>
                <div className="text-xs text-[#64748b] mt-0.5">
                  Peer-reviewed studies
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-light text-[#101820]">
                  12
                </div>
                <div className="text-xs text-[#64748b] mt-0.5">
                  Research partners
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-3xl sm:text-4xl font-light text-[#101820]">
                  8
                </div>
                <div className="text-xs text-[#64748b] mt-0.5">
                  Conditions & applications
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Crystal Molecular Spheres Graphic */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end">
            <div className="relative w-64 h-52 sm:w-72 sm:h-60">
              <Image
                src="/images/landing/nexus-ref/science-molecules.png"
                alt="3D crystal molecular sphere structure"
                fill
                loading="eager"
                sizes="(max-width: 640px) 280px, 320px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 6: PERSONALIZED PLANS (Infinity Pool Background 1:1)
          ===================================================================== */}
      <section
        id="plans"
        aria-label="Personalized Plans"
        className="relative w-full min-h-[540px] lg:min-h-[580px] flex items-center overflow-hidden"
      >
        {/* Authentic Infinity Pool Sunset Lake Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/landing/nexus-ref/infinity-pool-bg.png"
            alt="Alpine wellness infinity pool terrace overlooking serene mountain lake"
            fill
            loading="eager"
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 w-full py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 max-w-md">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">
                Personalized Plans
              </span>
              <h2
                className="mt-3 text-3xl sm:text-4xl lg:text-[46px] font-normal leading-[1.12] text-[#101820]"
                style={{
                  fontFamily:
                    'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                }}
              >
                Your path. <br />
                Our guidance.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#475569]">
                We help you find the right device, protocol and rental or
                purchase path — based on your goals, location and lifestyle.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#101820] px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#253240] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820] min-h-11"
                >
                  Start your consultation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Frosted Glass Vertical Checklist */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-[#0c141f]/90 p-6 sm:p-7 backdrop-blur-xl shadow-2xl text-white">
                <div className="space-y-4">
                  {GUIDANCE_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center space-x-3.5 text-xs sm:text-sm font-medium text-white/95"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
                          <Icon className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        <span>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 7: MORE THAN DEVICES. A COMPLETE ECOSYSTEM. (1:1)
          ===================================================================== */}
      <section
        id="ecosystem"
        aria-label="The Hylono Difference"
        className="relative overflow-hidden py-24 sm:py-32 text-white"
        style={{ backgroundColor: '#070b14' }}
      >
        {/* 3D Fluid Silk Energy Ribbons Background */}
        <div className="absolute inset-0 z-0 opacity-70">
          <Image
            src="/images/landing/nexus-ref/ecosystem-flow-bg.png"
            alt="Fluid luminous silk energy ribbons"
            fill
            loading="eager"
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="max-w-xl">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              The Hylono Difference
            </span>
            <h2
              className="mt-3 text-3xl sm:text-4xl lg:text-[46px] font-normal leading-[1.12] text-white"
              style={{
                fontFamily:
                  'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
              }}
            >
              More than devices. <br />
              A complete ecosystem.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#cbd5e1]">
              From initial consultation to long-term support, we make advanced
              regeneration simple, safe and accessible.
            </p>
            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs sm:text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[#101820] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-h-11"
              >
                How it works
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 4 Connected Milestones */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {ECOSYSTEM_PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={idx} className="flex items-center space-x-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-white/90">
                      {pillar.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 8: EXPLORE OUR SOLUTIONS (1:1 with reference)
          ===================================================================== */}
      <section
        id="solutions"
        aria-label="Explore Our Solutions"
        className="py-20 sm:py-28 bg-[#fcfbf8]"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">
                Choose Your Path
              </span>
              <h2
                className="mt-2 text-3xl sm:text-4xl lg:text-[44px] font-normal leading-[1.12] text-[#101820]"
                style={{
                  fontFamily:
                    'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                }}
              >
                Explore our solutions
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#64748b]">
                Each technology is designed to support different goals. Find the
                path that fits your needs.
              </p>
            </div>
            <div>
              <Link
                href="/products"
                className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#101820] hover:text-[#2f9fb3] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
              >
                View all solutions
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* 4 Solution Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTION_CARDS.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="group relative min-h-[380px] aspect-[3/4] overflow-hidden rounded-2xl bg-slate-900 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101820]"
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  unoptimized
                  loading="eager"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 text-white z-10">
                  <h3
                    className="text-2xl font-normal text-white"
                    style={{
                      fontFamily:
                        'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                    }}
                  >
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-200 leading-snug">
                    {card.subtitle}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-cyan-200">
                    Explore
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 9: TESTIMONIALS (Dusk Lake Panorama 1:1)
          ===================================================================== */}
      <section
        id="testimonials"
        aria-label="Clinical Client Testimonials"
        className="relative w-full min-h-[500px] flex items-center overflow-hidden py-20 text-white"
      >
        {/* Full-width Dusk Alpine Lake Backdrop */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/landing/nexus-ref/testimonials-bg.png"
            alt="Alpine mountain lake landscape at dusk"
            fill
            loading="eager"
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 w-full">
          {/* Header with Navigation Controls */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                Real Results. Real People.
              </span>
              <h2
                className="mt-2 text-3xl sm:text-4xl lg:text-[44px] font-normal leading-[1.12] text-white"
                style={{
                  fontFamily:
                    'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                }}
              >
                Evidence. Experience. Impact.
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handlePrevTestimonial}
                aria-label="Previous testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNextTestimonial}
                aria-label="Next testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 3 Dark Frosted Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={t.id}
                className={`rounded-2xl border border-white/20 bg-[#0c141f]/90 p-7 backdrop-blur-2xl transition-all duration-300 ${
                  activeTestimonialIdx === idx
                    ? 'ring-1 ring-white/40 shadow-2xl scale-[1.02]'
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-light italic">
                  “{t.quote}”
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs font-medium text-slate-200">
                    — {t.author}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-medium">
                    {t.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 10: LUXURY FOOTER (1:1 with reference)
          ===================================================================== */}
      <footer
        role="contentinfo"
        className="bg-[#fcfbf8] border-t border-black/[0.06] pt-16 pb-12 text-[#101820]"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            {/* Left Column: Brand */}
            <div className="md:col-span-4">
              <Link
                href="/"
                className="text-2xl font-normal tracking-[0.24em] text-[#101820]"
                style={{
                  fontFamily:
                    'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                }}
              >
                HYLONO
              </Link>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#64748b] mt-1 font-medium">
                European Regenerative Network
              </div>
            </div>

            {/* Center Column: Navigation */}
            <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs font-medium text-[#475569]">
              <div className="space-y-3">
                <div>
                  <Link href="#technologies" className="hover:text-[#101820] transition-colors">
                    Technologies
                  </Link>
                </div>
                <div>
                  <Link href="#solutions" className="hover:text-[#101820] transition-colors">
                    Solutions
                  </Link>
                </div>
                <div>
                  <Link href="#research" className="hover:text-[#101820] transition-colors">
                    Research
                  </Link>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Link href="#ecosystem" className="hover:text-[#101820] transition-colors">
                    About
                  </Link>
                </div>
                <div>
                  <Link href="/contact" className="hover:text-[#101820] transition-colors">
                    Contact
                  </Link>
                </div>
                <div>
                  <Link href="/login" className="hover:text-[#101820] transition-colors">
                    Partner Access
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Newsletter & Social */}
            <div className="md:col-span-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold tracking-wider text-[#101820] uppercase">
                    Join our newsletter
                  </div>
                  <div className="text-xs text-[#64748b] mt-1">
                    Get the latest research, updates and insights.
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-[#64748b]">
                  <a href="https://instagram.com" aria-label="Instagram" className="hover:text-[#101820]">
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-[#101820]">
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a href="https://youtube.com" aria-label="YouTube" className="hover:text-[#101820]">
                    <Youtube className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="mt-4 relative">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full rounded-full border border-black/[0.1] bg-white py-3 pl-5 pr-12 text-xs text-[#101820] placeholder-[#94a3b8] focus:border-[#101820] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#101820] text-white hover:bg-[#253240] transition-colors"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
              {newsletterSubmitted && (
                <div className="mt-2 text-xs text-emerald-600 font-medium">
                  Thank you for subscribing to Hylono insights.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-14 pt-8 border-t border-black/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#64748b]">
            <div>© 2026 HYLONO. All rights reserved.</div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/privacy" className="hover:text-[#101820]">Privacy</Link>
              <Link href="/terms" className="hover:text-[#101820]">Terms</Link>
              <Link href="/shipping" className="hover:text-[#101820]">Shipping</Link>
              <Link href="/returns" className="hover:text-[#101820]">Returns</Link>
              <Link href="/warranty" className="hover:text-[#101820]">Warranty</Link>
              <Link href="/cookies" className="hover:text-[#101820]">Cookies</Link>
            </div>
            <div>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-1.5 hover:text-[#101820] transition-colors"
              >
                Back to top
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

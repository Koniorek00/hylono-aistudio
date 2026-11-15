'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Calendar,
  HelpCircle,
  ArrowRight,
  Search,
  ChevronDown,
  Instagram,
  Youtube,
  Linkedin,
  Menu,
  X,
} from 'lucide-react';
import {
  CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_ID,
  CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_LABEL,
  focusRingClass,
} from './CheckoutPageData';

interface CheckoutEmptyStateProps {
  emptyRouteActionStatus: string;
  onAnnounceEmptyCartRouteAction: (destination: '/store' | '/rental' | '/help') => void;
  onHandleEmptyCartRouteAction: (destination: '/store' | '/rental' | '/help') => void;
}

const CATEGORY_CARDS = [
  {
    id: 'hbot',
    title: 'HBOT',
    description: 'Hyperbaric oxygen for everyday wellbeing.',
    image: '/images/checkout/cat-hbot.jpg',
    href: '/store?category=hbot',
    alt: 'Hylono HBOT hyperbaric oxygen chamber in warm wellness sanctuary',
  },
  {
    id: 'h2',
    title: 'H2',
    description: 'Hydrogen solutions for cellular support.',
    image: '/images/checkout/cat-h2.jpg',
    href: '/store?category=hydrogen',
    alt: 'Hylono H2 molecular hydrogen generator in architectural setting',
  },
  {
    id: 'rlt',
    title: 'RLT',
    description: 'Red light therapy for recovery and balance.',
    image: '/images/checkout/cat-rlt.jpg',
    href: '/store?category=rlt',
    alt: 'Hylono RLT red light therapy panel in sunlit sanctuary',
  },
  {
    id: 'pemf',
    title: 'PEMF',
    description: 'Pulsed electromagnetic fields for daily support.',
    image: '/images/checkout/cat-pemf.jpg',
    href: '/store?category=pemf',
    alt: 'Hylono PEMF pulsed electromagnetic field therapy mat on travertine stone',
  },
] as const;

export function CheckoutEmptyState({
  emptyRouteActionStatus,
  onAnnounceEmptyCartRouteAction,
  onHandleEmptyCartRouteAction,
}: CheckoutEmptyStateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#1E1A17] flex flex-col font-sans selection:bg-[#EBE2D5] selection:text-[#1E1A17]">
      {/* ─── BESPOKE SANCTUARY HEADER (Exact Match to Reference) ───────────────── */}
      <header className="relative z-30 w-full bg-transparent transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group inline-flex items-center min-h-[44px] gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#94673D]"
            aria-label="Hylono Home"
          >
            <span
              className="text-base sm:text-lg font-medium tracking-[0.32em] text-[#1E1A17] uppercase transition-opacity group-hover:opacity-80"
              style={{
                letterSpacing: '0.3em',
              }}
            >
              HYLONO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main"
            className="hidden md:flex items-center text-[13px] font-medium tracking-wide text-[#2C2621]"
            style={{ gap: '2.25rem' }}
          >
            <Link
              href="/store"
              className="inline-flex items-center min-h-[44px] py-1 transition-colors hover:text-[#94673D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
            >
              Products
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center min-h-[44px] py-1 transition-colors hover:text-[#94673D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
            >
              Research
            </Link>
            <Link
              href="/protocols"
              className="inline-flex items-center min-h-[44px] py-1 transition-colors hover:text-[#94673D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
            >
              Protocols
            </Link>
            <Link
              href="/rental"
              className="inline-flex items-center min-h-[44px] py-1 transition-colors hover:text-[#94673D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
            >
              Rental
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center min-h-[44px] py-1 transition-colors hover:text-[#94673D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
            >
              Support
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <Link
              href="/search"
              aria-label="Search"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-[#2C2621] hover:text-[#94673D] transition-colors rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
            >
              <Search size={18} strokeWidth={1.8} />
            </Link>

            {/* Cart with Badge (0) */}
            <Link
              href="/checkout"
              aria-label="Shopping Cart, 0 items"
              className="relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-[#2C2621] hover:text-[#94673D] transition-colors rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
            >
              <ShoppingBag size={18} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#A2734C] text-white text-[10px] font-bold flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Region */}
            <span className="hidden sm:inline-block text-xs font-semibold tracking-wider text-[#2C2621] px-1">
              EU
            </span>

            {/* Contact Hylono Pill Button */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#94673D] hover:bg-[#80552D] text-white text-xs sm:text-[13px] font-medium px-5 py-2.5 min-h-[44px] shadow-sm shadow-[#94673D]/15 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
            >
              <span>Contact Hylono</span>
              <ArrowRight size={13} strokeWidth={2} />
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-[#2C2621] rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAF7F2] border-b border-[#ECE3D6] px-6 py-6 flex flex-col gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              href="/store"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 min-h-[44px] flex items-center border-b border-[#ECE3D6]/60 text-[#2C2621]"
            >
              Products
            </Link>
            <Link
              href="/research"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 min-h-[44px] flex items-center border-b border-[#ECE3D6]/60 text-[#2C2621]"
            >
              Research
            </Link>
            <Link
              href="/protocols"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 min-h-[44px] flex items-center border-b border-[#ECE3D6]/60 text-[#2C2621]"
            >
              Protocols
            </Link>
            <Link
              href="/rental"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 min-h-[44px] flex items-center border-b border-[#ECE3D6]/60 text-[#2C2621]"
            >
              Rental
            </Link>
            <Link
              href="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 min-h-[44px] flex items-center border-b border-[#ECE3D6]/60 text-[#2C2621]"
            >
              Support
            </Link>
            <div className="pt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6E645A]">Region: EU</span>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#94673D] text-white text-xs font-medium px-4 py-2.5 min-h-[44px]"
              >
                <span>Contact Hylono</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO SANCTUARY SECTION ────────────────────────────────────────── */}
      <section
        aria-label="Empty cart status"
        className="relative w-full overflow-hidden flex flex-col justify-center items-center -mt-20 sm:-mt-24 pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-44 lg:pb-36 px-4 sm:px-6"
      >
        {/* Background Sanctuary Photography */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="/images/checkout/checkout-hero-bg.jpg"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Luminous Architectural Mask */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 65% 58% at 50% 50%, rgba(253, 250, 245, 0.94) 0%, rgba(253, 250, 245, 0.85) 38%, rgba(253, 250, 245, 0.35) 72%, rgba(253, 250, 245, 0.05) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/80 to-transparent pointer-events-none" />
        </div>

        {/* Delicate Architectural Arch Outline (exact match to reference) */}
        <div
          aria-hidden="true"
          className="absolute z-0 pointer-events-none left-1/2 -translate-x-1/2 top-14 sm:top-20 md:top-24 w-[360px] sm:w-[480px] md:w-[620px] lg:w-[680px] h-[380px] sm:h-[460px] md:h-[500px] rounded-t-[180px] sm:rounded-t-[240px] md:rounded-t-[310px] lg:rounded-t-[340px] border-t border-x border-[#D8CCBD]/65 bg-white/20 backdrop-blur-[1px]"
        />

        {/* Content Container */}
        <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
          {/* Floating Circle with Shopping Bag Outline */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#D5C7B5] bg-white/80 backdrop-blur-md flex items-center justify-center shadow-xs mb-6 sm:mb-8 text-[#94673D] transition-transform duration-300 hover:scale-105">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-[#94673D]" strokeWidth={1.35} />
          </div>

          {/* Stately Editorial Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-[62px] font-normal tracking-tight text-[#1E1A17] mb-3 sm:mb-4 leading-[1.12]"
            style={{
              fontFamily:
                "var(--font-editorial, 'Cormorant Garamond', 'Playfair Display', Georgia, serif)",
            }}
          >
            Your cart is{' '}
            <span
              className="italic font-normal text-[#A2734C]"
              style={{
                fontFamily:
                  "var(--font-editorial, 'Cormorant Garamond', 'Playfair Display', Georgia, serif)",
              }}
            >
              empty
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-[17px] text-[#5C534B] max-w-lg sm:max-w-xl mx-auto font-normal leading-relaxed mb-8 sm:mb-10 px-2">
            Add a product before checkout, or use support if you need help choosing a product or
            rental option.
          </p>

          {/* 3 Action Pills */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto px-4"
            aria-label="Need help choosing?"
          >
            {/* Primary Action: Continue Shopping */}
            <a
              href="/store"
              aria-describedby={CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_ID}
              onFocus={() => onAnnounceEmptyCartRouteAction('/store')}
              onClick={() => onHandleEmptyCartRouteAction('/store')}
              className={`group inline-flex min-h-[48px] sm:min-h-[50px] items-center justify-center gap-2.5 rounded-full bg-[#94673D] hover:bg-[#80552D] px-6 sm:px-7 py-3 text-sm font-medium text-white shadow-md shadow-[#94673D]/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${focusRingClass}`}
            >
              <ShoppingBag size={17} strokeWidth={1.75} className="shrink-0" />
              <span>Continue shopping</span>
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>

            {/* Secondary Action: Review Rental Options */}
            <a
              href="/rental"
              aria-describedby={CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_ID}
              onFocus={() => onAnnounceEmptyCartRouteAction('/rental')}
              onClick={() => onHandleEmptyCartRouteAction('/rental')}
              className={`group inline-flex min-h-[48px] sm:min-h-[50px] items-center justify-center gap-2.5 rounded-full border border-[#D5C7B5] bg-[#FAF7F2]/90 hover:bg-[#FAF7F2] hover:border-[#B5A18C] backdrop-blur-sm px-5 sm:px-6 py-3 text-sm font-medium text-[#2C2621] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${focusRingClass}`}
            >
              <Calendar size={17} strokeWidth={1.75} className="shrink-0 text-[#7A6B5B]" />
              <span>Review rental options</span>
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="shrink-0 text-[#7A6B5B] transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>

            {/* Tertiary Action: Open Help */}
            <a
              href="/help"
              aria-describedby={CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_ID}
              onFocus={() => onAnnounceEmptyCartRouteAction('/help')}
              onClick={() => onHandleEmptyCartRouteAction('/help')}
              className={`group inline-flex min-h-[48px] sm:min-h-[50px] items-center justify-center gap-2.5 rounded-full border border-[#D5C7B5] bg-[#FAF7F2]/90 hover:bg-[#FAF7F2] hover:border-[#B5A18C] backdrop-blur-sm px-5 sm:px-6 py-3 text-sm font-medium text-[#2C2621] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${focusRingClass}`}
            >
              <HelpCircle size={17} strokeWidth={1.75} className="shrink-0 text-[#7A6B5B]" />
              <span>Open help</span>
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="shrink-0 text-[#7A6B5B] transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>
          </div>

          {/* Accessible Live Region */}
          <p
            id={CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_ID}
            role="status"
            aria-label={CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_LABEL}
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {emptyRouteActionStatus}
          </p>
        </div>
      </section>

      {/* ─── EXPLORE HYLONO CATEGORIES SECTION ────────────────────────────── */}
      <section
        aria-label="Explore Hylono categories"
        className="relative w-full border-t border-[#ECE3D6] bg-[#FAF7F2] pt-12 sm:pt-16 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
      >
        {/* Subtle Waveform Line Flourish on Left Margin */}
        <div
          aria-hidden="true"
          className="absolute -left-6 top-8 w-48 h-48 text-[#D8CCBD]/45 pointer-events-none select-none"
        >
          <svg viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="0.85">
            <path d="M0 90 Q 40 40, 80 85 T 160 90" />
            <path d="M0 80 Q 45 35, 90 80 T 160 90" />
            <path d="M0 100 Q 35 50, 70 95 T 160 90" />
            <path d="M0 70 Q 50 25, 100 75 T 160 90" />
            <path d="M0 110 Q 30 65, 60 105 T 160 90" />
            <path d="M0 60 Q 55 15, 110 70 T 160 90" />
          </svg>
        </div>

        {/* Section Header Row */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-[#8A7968] mb-1.5">
              EXPLORE HYLONO —
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-[34px] font-normal tracking-tight text-[#1E1A17] leading-tight"
              style={{
                fontFamily:
                  "var(--font-editorial, 'Cormorant Garamond', 'Playfair Display', Georgia, serif)",
              }}
            >
              Find the right starting point
            </h2>
            <p className="text-xs sm:text-sm text-[#6E645A] font-normal mt-1.5 max-w-2xl">
              Explore popular product categories or rental options to continue building your plan.
            </p>
          </div>

          <Link
            href="/store"
            className="group hidden sm:inline-flex items-center min-h-[44px] gap-1.5 text-xs sm:text-sm font-semibold text-[#1E1A17] hover:text-[#94673D] transition-colors border-b border-[#1E1A17]/30 hover:border-[#94673D] pb-0.5 shrink-0"
          >
            <span>View all products</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* 4 Category Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group flex flex-col bg-white border border-[#EBE2D5] rounded-2xl overflow-hidden p-3.5 hover:border-[#D5C7B5] hover:shadow-xl hover:shadow-[#94673D]/8 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
            >
              {/* Product Photography in Sanctuary Setting */}
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#F4EFEA] mb-3.5">
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

              {/* Card Meta & Circular Arrow Button */}
              <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-0.5">
                <div className="min-w-0 pr-1">
                  <h3 className="font-bold text-base text-[#1E1A17] mb-0.5 tracking-tight group-hover:text-[#94673D] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#6E645A] leading-snug line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="shrink-0 w-10 h-10 rounded-full bg-[#F3ECE0] group-hover:bg-[#94673D] text-[#2C2621] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs"
                >
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/store"
            className="group inline-flex items-center justify-center min-h-[44px] px-3 gap-1.5 text-xs font-semibold text-[#1E1A17] hover:text-[#94673D] transition-colors border-b border-[#1E1A17]/30 hover:border-[#94673D]"
          >
            <span>View all products</span>
            <ArrowRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {/* ─── BESPOKE LUXURY EDITORIAL FOOTER (Exact Match to Reference) ───────── */}
      <footer className="mt-auto w-full border-t border-[#ECE3D6] bg-[#FAF7F2] pt-14 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10 pb-12">
            {/* Column 1: Brand & Tagline */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link
                href="/"
                className="inline-flex items-center min-h-[44px] mb-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#94673D]"
              >
                <span
                  className="text-base sm:text-lg font-medium tracking-[0.32em] text-[#1E1A17] uppercase"
                  style={{
                    letterSpacing: '0.3em',
                  }}
                >
                  HYLONO
                </span>
              </Link>
              <p className="text-xs sm:text-[13px] text-[#6E645A] leading-relaxed max-w-xs mb-5 font-normal">
                Thoughtful technology for everyday wellbeing.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-2 text-[#5C534B]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Hylono on Instagram"
                  className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md hover:text-[#94673D] transition-colors focus-visible:outline-2 focus-visible:outline-[#94673D]"
                >
                  <Instagram size={18} strokeWidth={1.8} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Hylono on YouTube"
                  className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md hover:text-[#94673D] transition-colors focus-visible:outline-2 focus-visible:outline-[#94673D]"
                >
                  <Youtube size={18} strokeWidth={1.8} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Hylono on LinkedIn"
                  className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md hover:text-[#94673D] transition-colors focus-visible:outline-2 focus-visible:outline-[#94673D]"
                >
                  <Linkedin size={18} strokeWidth={1.8} />
                </a>
              </div>
            </div>

            {/* Column 2: Products */}
            <div>
              <h4 className="text-xs font-semibold text-[#1E1A17] mb-3.5 tracking-tight">Products</h4>
              <ul className="space-y-1 text-xs text-[#6E645A]">
                <li>
                  <Link href="/store" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    All products
                  </Link>
                </li>
                <li>
                  <Link href="/store?category=hbot" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    HBOT
                  </Link>
                </li>
                <li>
                  <Link href="/store?category=rlt" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    RLT
                  </Link>
                </li>
                <li>
                  <Link href="/store?category=pemf" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    PEMF
                  </Link>
                </li>
                <li>
                  <Link href="/store?category=hydrogen" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    H2
                  </Link>
                </li>
                <li>
                  <Link href="/compare/rent-vs-buy" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    Compare
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Research */}
            <div>
              <h4 className="text-xs font-semibold text-[#1E1A17] mb-3.5 tracking-tight">Research</h4>
              <ul className="space-y-1 text-xs text-[#6E645A]">
                <li>
                  <Link href="/research" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    The science
                  </Link>
                </li>
                <li>
                  <Link href="/conditions/vitality" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    Wellbeing
                  </Link>
                </li>
                <li>
                  <Link href="/research" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    Studies
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    Articles
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Support */}
            <div>
              <h4 className="text-xs font-semibold text-[#1E1A17] mb-3.5 tracking-tight">Support</h4>
              <ul className="space-y-1 text-xs text-[#6E645A]">
                <li>
                  <Link href="/help" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    Help center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/rental" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    Rental
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/warranty" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                    Warranty
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Company & Region / Language */}
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#1E1A17] mb-3.5 tracking-tight">Company</h4>
                <ul className="space-y-1 text-xs text-[#6E645A]">
                  <li>
                    <Link href="/about" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                      Our approach
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="inline-flex items-center min-h-[40px] min-w-[40px] py-0.5 hover:text-[#94673D] transition-colors">
                      Journal
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Region and Language Selector (matching reference) */}
              <div className="pt-6 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1E1A17]">
                  {/* EU Flag Icon */}
                  <svg className="w-5 h-5 rounded-full shadow-xs" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#003399" />
                    {[...Array(12)].map((_, i) => {
                      const angle = (i * 30 * Math.PI) / 180;
                      const cx = 12 + 7.5 * Math.sin(angle);
                      const cy = 12 - 7.5 * Math.cos(angle);
                      return <circle key={i} cx={cx} cy={cy} r="0.85" fill="#FFCC00" />;
                    })}
                  </svg>
                  <span>EU</span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="inline-flex items-center min-h-[44px] gap-1.5 text-xs text-[#2C2621] hover:text-[#94673D] transition-colors focus-visible:outline-2 focus-visible:outline-[#94673D]"
                  >
                    <span>English</span>
                    <ChevronDown size={13} className="text-[#6E645A]" />
                  </button>
                  {langMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-1.5 w-28 bg-white border border-[#ECE3D6] rounded-lg shadow-md p-1 text-xs">
                      <span className="block px-2.5 py-1.5 rounded text-[#1E1A17] font-semibold bg-[#FAF7F2]">
                        English
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Legal Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A7065]">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Link href="/privacy" className="inline-flex items-center min-h-[44px] px-2 hover:text-[#1E1A17] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="inline-flex items-center min-h-[44px] px-2 hover:text-[#1E1A17] transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="inline-flex items-center min-h-[44px] px-2 hover:text-[#1E1A17] transition-colors">
                Cookies
              </Link>
              <Link href="/sitemap.xml" className="inline-flex items-center min-h-[44px] px-2 hover:text-[#1E1A17] transition-colors">
                Sitemap
              </Link>
            </div>
            <div>
              <span>© 2026 Hylono. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

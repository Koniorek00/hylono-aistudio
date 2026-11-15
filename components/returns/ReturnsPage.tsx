'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  Coins,
  FileText,
  Globe,
  Headphones,
  Mail,
  Package,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import { LegalPolicyCookieSettingsButton } from '@/components/legal/LegalPolicyCookieSettingsButton';
import {
  LegalPolicyRouteActionStatus,
  LegalPolicyTrackedLink,
} from '@/components/legal/LegalPolicyTrackedLink';

const headingFontStyle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  textTransform: 'none',
  letterSpacing: '-0.025em',
};

const tableOfContents = [
  { id: 'returns-warranty-answer', label: 'Return Policy And Warranty Answer' },
  { id: 'returns-window', label: 'Return Window And Consumer Rights' },
  { id: 'returns-scope', label: 'What This Page Covers' },
  { id: 'returns-start', label: 'How To Start A Return' },
  { id: 'returns-refund', label: 'Refund Handling' },
  { id: 'returns-no-inference', label: 'What Not To Infer' },
];

const policyCenterLinks = [
  {
    label: 'Privacy Policy',
    href: '/privacy',
    description: 'Personal data, forms, analytics consent, and privacy choices.',
  },
  {
    label: 'Terms of Service',
    href: '/terms',
    description: 'Website use, checkout scope, linked policies, and wellness positioning.',
  },
  {
    label: 'Cookie Policy',
    href: '/cookie-policy',
    description: 'Essential storage, optional analytics, and cookie settings.',
  },
  {
    label: 'Shipping Policy',
    href: '/shipping',
    description: 'EU delivery coverage, timing, checkout details, and dispatch support.',
  },
  {
    label: 'Returns Policy',
    href: '/returns',
    description: 'Return window, eligible free returns, refunds, and EU withdrawal context.',
  },
  {
    label: 'Warranty',
    href: '/warranty',
    description: 'Warranty term, coverage scope, support path, and buyer rights.',
  },
];

export function ReturnsPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('returns-warranty-answer');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 180;
      for (let i = tableOfContents.length - 1; i >= 0; i--) {
        const item = tableOfContents[i];
        if (!item) continue;
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans antialiased selection:bg-slate-200">
      <LegalPolicyRouteActionStatus />

      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full overflow-hidden border-b border-slate-200/70 bg-[#fafbfc]">
        {/* Background Architectural Panorama with Hylono Console */}
        <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] w-full">
          <Image
            src="/images/returns/returns-hero-bg.jpg"
            alt="Hylono architectural wellness pavilion overlooking the sea"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[75%_center] md:object-center"
          />

          {/* Light gradient veil for crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/15 lg:from-white/95 lg:via-white/70 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-70" />

          {/* Hero Content */}
          <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-between px-6 py-12 sm:px-8 lg:py-16">
            <div className="max-w-2xl pt-4 sm:pt-6">
              {/* Category Eyebrow */}
              <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>POLICY CENTER</span>
                <span className="inline-block h-px w-6 bg-slate-400/80" aria-hidden="true" />
              </div>

              {/* Main Headline */}
              <h1
                id="returns-hero-headline"
                style={headingFontStyle}
                className="mt-4 text-4xl sm:text-5xl lg:text-[62px] font-normal tracking-[-0.03em] text-slate-950 leading-[1.08]"
              >
                Returns Policy
              </h1>

              {/* Freshness Timestamp */}
              <p className="mt-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                UPDATED 11 APRIL 2026
              </p>

              {/* Policy Scope Intro */}
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                This page covers Hylono&apos;s public return terms for eligible direct purchases: the
                30-day window, return-by-mail path, refund handling, and the EU withdrawal right.
              </p>

              {/* Trust Tagline */}
              <div className="mt-6 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  TRUSTED POLICIES. CLEARER DECISIONS.
                </span>
              </div>
            </div>

            {/* Bottom Right Architectural Watermark */}
            <div className="hidden lg:block absolute bottom-6 right-8 text-right select-none pointer-events-none">
              <span className="text-[10px] font-semibold tracking-[0.28em] text-slate-700/60 uppercase">
                SCIENCE &middot; WELLNESS &middot; LONGEVITY
              </span>
            </div>
          </div>
        </div>

        {/* Floating Key Facts Ribbon */}
        <div className="mx-auto -mt-6 max-w-[1440px] px-6 sm:px-8 pb-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_6px_28px_rgba(0,0,0,0.04)] backdrop-blur-md divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70">
            {/* Fact 1 */}
            <div className="flex flex-col p-6 hover:bg-slate-50/50 transition first:rounded-t-2xl sm:first:rounded-l-2xl sm:first:rounded-tr-none">
              <Calendar className="h-5 w-5 text-slate-700 stroke-[1.5]" aria-hidden="true" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                PUBLISHED RETURN WINDOW
              </p>
              <p className="mt-1 text-xl font-normal text-slate-900 tracking-tight">30 days</p>
            </div>

            {/* Fact 2 */}
            <div className="flex flex-col p-6 hover:bg-slate-50/50 transition">
              <Coins className="h-5 w-5 text-slate-700 stroke-[1.5]" aria-hidden="true" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                RETURN FEES
              </p>
              <p className="mt-1 text-xl font-normal text-slate-900 tracking-tight">
                Free for eligible returns
              </p>
            </div>

            {/* Fact 3 */}
            <div className="flex flex-col p-6 hover:bg-slate-50/50 transition">
              <RotateCcw className="h-5 w-5 text-slate-700 stroke-[1.5]" aria-hidden="true" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                REFUND TYPE
              </p>
              <p className="mt-1 text-xl font-normal text-slate-900 tracking-tight">Full refund</p>
            </div>

            {/* Fact 4 */}
            <div className="flex flex-col p-6 hover:bg-slate-50/50 transition last:rounded-b-2xl sm:last:rounded-r-2xl sm:last:rounded-bl-none">
              <Truck className="h-5 w-5 text-slate-700 stroke-[1.5]" aria-hidden="true" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                RETURN METHOD
              </p>
              <p className="mt-1 text-xl font-normal text-slate-900 tracking-tight">Return by mail</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)_300px] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          {/* ================= LEFT SIDEBAR ================= */}
          <aside className="space-y-8 lg:sticky lg:top-28 self-start">
            {/* Table of Contents */}
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                ON THIS PAGE
              </h2>
              <nav className="mt-4 space-y-1" aria-label="Returns Policy sections">
                {tableOfContents.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <LegalPolicyTrackedLink
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block py-2 text-xs transition border-l-2 ${
                        isActive
                          ? 'border-slate-900 pl-3 font-semibold text-slate-950'
                          : 'border-transparent pl-3 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                      }`}
                      ctaRole="supporting"
                      eventName="legal_policy_route_transition_clicked"
                      policyPath="/returns"
                      source="section_navigation"
                      statusMessage={`Opening ${item.label} section on Returns Policy.`}
                    >
                      {item.label}
                    </LegalPolicyTrackedLink>
                  );
                })}
              </nav>
            </div>

            {/* Region & Hours Widget */}
            <div className="border-t border-slate-200/80 pt-6">
              <div className="flex items-start gap-3 text-slate-600">
                <Globe className="h-4 w-4 mt-0.5 shrink-0 text-slate-400 stroke-[1.5]" aria-hidden="true" />
                <div className="text-xs leading-snug">
                  <p className="font-semibold text-slate-800">European Union</p>
                  <p className="mt-0.5 text-slate-500 text-[11px]">Monday to Friday; 09:00 to 18:00 CET</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-slate-200/80 pt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                QUICK ACTIONS
              </h2>
              <div className="mt-3 space-y-2.5">
                <LegalPolicyTrackedLink
                  href={`mailto:${siteEntity.contactEmail}`}
                  className="flex w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                  ctaRole="primary"
                  eventName="legal_policy_cta_clicked"
                  policyPath="/returns"
                  source="quick_actions"
                >
                  <span className="flex items-center gap-2.5">
                    <Mail className="h-3.5 w-3.5 text-slate-500 stroke-[1.5]" aria-hidden="true" />
                    Contact Hylono
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                </LegalPolicyTrackedLink>

                <LegalPolicyCookieSettingsButton
                  className="flex w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 cursor-pointer"
                  source="quick_actions"
                  label="Cookie Settings"
                />

                <LegalPolicyTrackedLink
                  href="/sitemap.xml"
                  className="flex w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                  ctaRole="supporting"
                  eventName="legal_policy_route_transition_clicked"
                  policyPath="/returns"
                  source="quick_actions"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500 stroke-[1.5]" aria-hidden="true" />
                    Sitemap XML
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                </LegalPolicyTrackedLink>
              </div>
            </div>

            {/* Architecture Card linking to Policy Center */}
            <div className="border-t border-slate-200/80 pt-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/returns/returns-sidebar-arch.jpg"
                    alt="Hylono modern architecture pavilion cliffside overlooking ocean"
                    fill
                    sizes="(max-width: 1024px) 100vw, 280px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs leading-relaxed text-slate-600">
                    Use these public pages to verify shipping, returns, warranty, privacy, and
                    cookie controls before you buy or submit a request.
                  </p>
                  <LegalPolicyTrackedLink
                    href="/policies"
                    className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900 transition hover:text-cyan-700"
                    ctaRole="supporting"
                    eventName="legal_policy_route_transition_clicked"
                    policyPath="/returns"
                    source="policy_center"
                  >
                    POLICY CENTER
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </LegalPolicyTrackedLink>
                </div>
              </div>
            </div>
          </aside>

          {/* ================= CENTER CONTENT ================= */}
          <div className="space-y-16 lg:space-y-20">
            {/* Section 01 */}
            <section
              id="returns-warranty-answer"
              className="scroll-mt-28 border-b border-slate-200/80 pb-16"
              aria-labelledby="heading-returns-warranty-answer"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-[0.16em] text-slate-400">01</span>
                <span className="h-px w-8 bg-slate-300" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  RETURN POLICY AND WARRANTY ANSWER
                </span>
              </div>

              {/* Title */}
              <h2
                id="heading-returns-warranty-answer"
                style={headingFontStyle}
                className="mt-4 text-2xl sm:text-3xl lg:text-[32px] font-normal tracking-[-0.025em] text-slate-950 leading-tight"
              >
                Returns and warranty are separate public policy routes.
              </h2>

              {/* Body */}
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                Hylono keeps return policy and warranty coverage on separate public policy routes so a
                buyer does not have to infer one promise from the other. This returns page is the
                source for eligible direct-purchase returns, while the warranty page is the source
                for covered device issues after purchase.
              </p>

              {/* 2 Route Cards */}
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Returns Route Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <div>
                    <Package className="h-6 w-6 text-slate-800 stroke-[1.5]" aria-hidden="true" />
                    <h3
                      style={headingFontStyle}
                      className="mt-4 text-base font-semibold text-slate-900"
                    >
                      Returns route
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                      Use this page for the 30-day eligible direct-purchase return window, return by
                      mail, support-confirmed instructions, and refund handling.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <LegalPolicyTrackedLink
                      href="#returns-window"
                      className="inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-medium text-slate-800 transition hover:bg-slate-100 hover:border-slate-300"
                      ctaRole="supporting"
                      eventName="legal_policy_route_transition_clicked"
                      policyPath="/returns"
                      source="return_warranty_answer"
                    >
                      View return policy
                      <ArrowRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    </LegalPolicyTrackedLink>
                  </div>
                </div>

                {/* Warranty Route Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <div>
                    <ShieldCheck className="h-6 w-6 text-slate-800 stroke-[1.5]" aria-hidden="true" />
                    <h3
                      style={headingFontStyle}
                      className="mt-4 text-base font-semibold text-slate-900"
                    >
                      Warranty route
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                      Use warranty for the separate 2-year parts-and-labor scope covering
                      manufacturing defects, component failures, electronic malfunctions, and
                      structural issues.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <LegalPolicyTrackedLink
                      href="/warranty"
                      className="inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-medium text-slate-800 transition hover:bg-slate-100 hover:border-slate-300"
                      ctaRole="supporting"
                      eventName="legal_policy_route_transition_clicked"
                      policyPath="/returns"
                      source="return_warranty_answer"
                    >
                      View warranty
                      <ArrowRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    </LegalPolicyTrackedLink>
                  </div>
                </div>
              </div>

              {/* Callout Notice: Do not merge */}
              <div className="mt-6 flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 text-slate-700">
                <ShieldAlert className="h-5 w-5 shrink-0 text-slate-500 mt-0.5 stroke-[1.5]" aria-hidden="true" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <span className="font-semibold text-slate-900 block mb-0.5">Do not merge</span>
                  Do not infer instant refunds, third-party seller terms, broader warranty coverage,
                  emergency support, or unlisted service promises from this route.
                </div>
              </div>

              {/* Inline Action Links */}
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-medium text-slate-700">
                <LegalPolicyTrackedLink
                  href="/warranty"
                  className="inline-flex items-center gap-1.5 transition hover:text-cyan-700"
                  ctaRole="supporting"
                  eventName="legal_policy_route_transition_clicked"
                  policyPath="/returns"
                  source="return_warranty_answer"
                >
                  Review warranty coverage
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </LegalPolicyTrackedLink>
                <LegalPolicyTrackedLink
                  href="/shipping"
                  className="inline-flex items-center gap-1.5 transition hover:text-cyan-700"
                  ctaRole="supporting"
                  eventName="legal_policy_route_transition_clicked"
                  policyPath="/returns"
                  source="return_warranty_answer"
                >
                  Review shipping context
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </LegalPolicyTrackedLink>
                <LegalPolicyTrackedLink
                  href={`mailto:${siteEntity.supportEmail}`}
                  className="inline-flex items-center gap-1.5 transition hover:text-cyan-700"
                  ctaRole="primary"
                  eventName="legal_policy_cta_clicked"
                  policyPath="/returns"
                  source="return_warranty_answer"
                >
                  Ask support about returns or warranty
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </LegalPolicyTrackedLink>
              </div>
            </section>

            {/* Section 02 */}
            <section
              id="returns-window"
              className="scroll-mt-28 border-b border-slate-200/80 pb-16"
              aria-labelledby="heading-returns-window"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-[0.16em] text-slate-400">02</span>
                <span className="h-px w-8 bg-slate-300" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  RETURN WINDOW AND CONSUMER RIGHTS
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
                <div>
                  <h2
                    id="heading-returns-window"
                    style={headingFontStyle}
                    className="text-2xl sm:text-3xl font-normal tracking-[-0.025em] text-slate-950 leading-snug"
                  >
                    Hylono publishes a 30-day return window, and EU buyers still keep their
                    statutory withdrawal rights.
                  </h2>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                    <p>
                      The structured data published on this page states a 30-day merchant return
                      window for eligible Hylono returns.
                    </p>
                    <p>
                      EU consumers also keep the legal 14-day withdrawal right for distance
                      purchases. Both timelines should stay easy to find.
                    </p>
                  </div>
                </div>

                {/* Timeline Milestone Component */}
                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-6 shadow-sm">
                  <div className="relative pl-6 space-y-7 before:absolute before:left-[7px] before:top-2 before:bottom-3 before:w-px before:bg-slate-300">
                    {/* Milestone 1 */}
                    <div className="relative">
                      <span className="absolute -left-6 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-slate-400 bg-white" />
                      <p className="text-base font-semibold text-slate-900">30 days</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Merchant return window (for eligible Hylono returns)
                      </p>
                    </div>
                    {/* Milestone 2 */}
                    <div className="relative pt-1">
                      <span className="absolute -left-6 top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-slate-400 bg-white" />
                      <p className="text-base font-semibold text-slate-900">14 days</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        EU withdrawal right (for distance purchases)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 03 */}
            <section
              id="returns-scope"
              className="scroll-mt-28 border-b border-slate-200/80 pb-16"
              aria-labelledby="heading-returns-scope"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-[0.16em] text-slate-400">03</span>
                <span className="h-px w-8 bg-slate-300" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  WHAT THIS PAGE COVERS
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
                <div>
                  <h2
                    id="heading-returns-scope"
                    style={headingFontStyle}
                    className="text-2xl sm:text-3xl font-normal tracking-[-0.025em] text-slate-950 leading-snug"
                  >
                    The current Hylono copy positions this page around direct purchases, not every
                    possible third-party resale scenario.
                  </h2>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                    <p>
                      This page is written for direct Hylono purchases. If you bought from another
                      seller or marketplace, that seller&apos;s return terms may apply.
                    </p>
                    <p>Use the support channel before returning hardware back.</p>
                  </div>
                </div>

                {/* 3D Isometric Wireframe + Direct Purchases Card */}
                <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                  {/* Isometric Geometric Graphic */}
                  <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
                    <svg
                      width="88"
                      height="88"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <polygon points="50,15 85,35 50,55 15,35" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
                      <polygon points="15,35 50,55 50,85 15,65" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.2" />
                      <polygon points="50,55 85,35 85,65 50,85" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
                      <polygon points="50,30 70,42 50,54 30,42" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="30" y1="42" x2="30" y2="60" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1="70" y1="42" x2="70" y2="60" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                    </svg>
                  </div>

                  {/* Criteria list */}
                  <div className="w-full">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900">
                      Direct purchases only
                    </p>
                    <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-slate-700" strokeWidth={2.5} />
                        <span>Hylono store</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-slate-700" strokeWidth={2.5} />
                        <span>Official partners</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-slate-700" strokeWidth={2.5} />
                        <span>Authorized channels</span>
                      </li>
                    </ul>
                    <p className="mt-3 text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                      Other sellers or marketplaces may have different terms.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 04 */}
            <section
              id="returns-start"
              className="scroll-mt-28 border-b border-slate-200/80 pb-16"
              aria-labelledby="heading-returns-start"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-[0.16em] text-slate-400">04</span>
                <span className="h-px w-8 bg-slate-300" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  HOW TO START A RETURN
                </span>
              </div>

              {/* Title */}
              <h2
                id="heading-returns-start"
                style={headingFontStyle}
                className="mt-4 text-2xl sm:text-3xl font-normal tracking-[-0.025em] text-slate-950 leading-snug"
              >
                Start with{' '}
                <LegalPolicyTrackedLink
                  href={`mailto:${siteEntity.supportEmail}`}
                  className="font-medium text-slate-950 underline underline-offset-4 transition hover:text-cyan-700"
                  ctaRole="supporting"
                  eventName="legal_policy_cta_clicked"
                  policyPath="/returns"
                  source="inline_policy_content"
                >
                  {siteEntity.supportEmail}
                </LegalPolicyTrackedLink>{' '}
                and include the order details you already have from checkout.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Wait for Hylono&apos;s return instructions before you send a device back.
              </p>

              {/* Steps + Showroom Photo Layout */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-8 items-center">
                {/* 3 Steps */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800">
                      1
                    </div>
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-slate-900">Contact support</p>
                      <p className="text-slate-500 mt-0.5">
                        <LegalPolicyTrackedLink
                          href={`mailto:${siteEntity.supportEmail}`}
                          className="text-slate-600 hover:text-slate-900"
                          ctaRole="supporting"
                          eventName="legal_policy_cta_clicked"
                          policyPath="/returns"
                          source="inline_policy_content"
                        >
                          {siteEntity.supportEmail}
                        </LegalPolicyTrackedLink>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800">
                      2
                    </div>
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-slate-900">Provide order details</p>
                      <p className="text-slate-500 mt-0.5">From your checkout</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800">
                      3
                    </div>
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-slate-900">Wait for instructions</p>
                      <p className="text-slate-500 mt-0.5">Then send your device</p>
                    </div>
                  </div>
                </div>

                {/* Showroom Device Photo */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm aspect-[4/3] w-full">
                  <Image
                    src="/images/returns/returns-device-showroom.jpg"
                    alt="Hylono wellness console in architectural daylight studio"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                </div>
              </div>
            </section>

            {/* Section 05 */}
            <section
              id="returns-refund"
              className="scroll-mt-28 border-b border-slate-200/80 pb-16"
              aria-labelledby="heading-returns-refund"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-[0.16em] text-slate-400">05</span>
                <span className="h-px w-8 bg-slate-300" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  REFUND HANDLING
                </span>
              </div>

              {/* Title */}
              <h2
                id="heading-returns-refund"
                style={headingFontStyle}
                className="mt-4 text-2xl sm:text-3xl font-normal tracking-[-0.025em] text-slate-950 leading-snug"
              >
                Full refunds for eligible items, processed back to your original payment method.
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <p>This page states free returns and a full refund for eligible items.</p>
                <p>
                  Approved returns go back to the original payment method used at checkout once the
                  returned hardware is inspected and processed according to support instructions.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Eligible scope
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Free returns &amp; full refund
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Applicable to qualifying direct purchases within the 30-day window.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Payment route
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Original payment method
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Direct wire transfer or transaction account used during checkout.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 06 */}
            <section
              id="returns-no-inference"
              className="scroll-mt-28 border-b border-slate-200/80 pb-16"
              aria-labelledby="heading-returns-no-inference"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-[0.16em] text-slate-400">06</span>
                <span className="h-px w-8 bg-slate-300" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  WHAT NOT TO INFER
                </span>
              </div>

              {/* Title */}
              <h2
                id="heading-returns-no-inference"
                style={headingFontStyle}
                className="mt-4 text-2xl sm:text-3xl font-normal tracking-[-0.025em] text-slate-950 leading-snug"
              >
                Clear policy boundaries protect buyers and support operations.
              </h2>

              <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  This route should be summarized as Hylono&apos;s public policy for eligible direct
                  purchases. It does not create return terms for third-party sellers, marketplaces,
                  rentals, used equipment, custom orders, or product-specific exceptions that are not
                  visible on this page.
                </p>
                <p>
                  Do not infer instant refunds, return approval without support confirmation,
                  in-person returns, a 24/7 return hotline, or warranty coverage from this returns
                  page. Use warranty, shipping, and support routes when those details matter.
                </p>
              </div>
            </section>

            {/* Connected Policy Center Navigation */}
            <section
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
              aria-labelledby="policy-center-heading"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    POLICY CENTER
                  </p>
                  <h2
                    id="policy-center-heading"
                    style={headingFontStyle}
                    className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-slate-950"
                  >
                    Move between all Hylono policy pages
                  </h2>
                </div>
                <LegalPolicyTrackedLink
                  href="/policies"
                  className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
                  ctaRole="supporting"
                  eventName="legal_policy_route_transition_clicked"
                  policyPath="/returns"
                  source="policy_center"
                >
                  Policy Center Overview
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </LegalPolicyTrackedLink>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Legal, privacy, cookie, shipping, returns, and warranty pages stay connected here so
                you can compare policy details without going back to the footer or search.
              </p>

              <nav className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5" aria-label="Policy pages">
                {policyCenterLinks.map((link) => {
                  const isCurrent = link.href === '/returns';
                  return (
                    <LegalPolicyTrackedLink
                      key={link.href}
                      href={link.href}
                      ariaCurrent={isCurrent ? 'page' : undefined}
                      className={`flex flex-col justify-between rounded-2xl p-4 text-left transition border ${
                        isCurrent
                          ? 'border-slate-900 bg-slate-50/80 ring-1 ring-slate-900/10'
                          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-sm'
                      }`}
                      ctaRole="supporting"
                      eventName="legal_policy_route_transition_clicked"
                      policyPath="/returns"
                      source="policy_center"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">{link.label}</span>
                        <ArrowUpRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        {link.description}
                      </p>
                      {isCurrent ? (
                        <span className="mt-3 inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md w-fit">
                          Current page
                        </span>
                      ) : null}
                    </LegalPolicyTrackedLink>
                  );
                })}
              </nav>
            </section>
          </div>

          {/* ================= RIGHT SIDEBAR ================= */}
          <aside className="space-y-6 lg:sticky lg:top-28 self-start">
            {/* Need Help Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                  <Headphones className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
                </div>
                <h3
                  style={headingFontStyle}
                  className="text-base font-semibold text-slate-900"
                >
                  Need Help?
                </h3>
              </div>

              <div className="mt-5 space-y-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0 stroke-[1.5]" aria-hidden="true" />
                  <LegalPolicyTrackedLink
                    href={`mailto:${siteEntity.supportEmail}`}
                    className="font-medium text-slate-800 hover:text-cyan-700 underline underline-offset-2"
                    ctaRole="primary"
                    eventName="legal_policy_cta_clicked"
                    policyPath="/returns"
                    source="inline_policy_content"
                  >
                    {siteEntity.supportEmail}
                  </LegalPolicyTrackedLink>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5 stroke-[1.5]" aria-hidden="true" />
                  <span className="leading-snug">
                    Monday to Friday,<br />
                    09:00 to 18:00 CET
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-[11px] leading-relaxed text-slate-400">
                  If a policy detail appears out of sync with the actual service, contact{' '}
                  <LegalPolicyTrackedLink
                    href={`mailto:${siteEntity.supportEmail}`}
                    className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
                    ctaRole="supporting"
                    eventName="legal_policy_cta_clicked"
                    policyPath="/returns"
                    source="inline_policy_content"
                  >
                    support
                  </LegalPolicyTrackedLink>{' '}
                  before relying on it.
                </p>
              </div>
            </div>

            {/* Wellness Portrait Card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm aspect-[3/4] w-full">
              <Image
                src="/images/returns/returns-sidebar-wellness.jpg"
                alt="Luxury wellness terrace overlooking mountains and sea"
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/95 leading-relaxed drop-shadow-sm">
                  YOUR WELLNESS JOURNEY IS SUPPORTED
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

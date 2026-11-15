import React from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Cookie,
  Mail,
  Scale,
  Settings2,
  Shield,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import { LegalPolicyCookieSettingsButton } from '@/components/legal/LegalPolicyCookieSettingsButton';
import {
  LegalPolicyRouteActionStatus,
  LegalPolicyTrackedLink,
  LEGAL_POLICY_ROUTE_ACTION_STATUS_ID,
} from '@/components/legal/LegalPolicyTrackedLink';
import styles from '@/app/cookie-policy/cookie-policy.module.css';

const policyLinks = [
  {
    label: 'Privacy Policy',
    href: '/privacy',
    group: 'Legal and data',
    description: 'Personal data, forms, analytics consent, and privacy choices.',
  },
  {
    label: 'Terms of Service',
    href: '/terms',
    group: 'Legal and data',
    description: 'Website use, checkout scope, linked policies, and wellness positioning.',
  },
  {
    label: 'Cookie Policy',
    href: '/cookie-policy',
    group: 'Legal and data',
    description: 'Essential storage, optional analytics, and cookie settings.',
  },
  {
    label: 'Shipping Policy',
    href: '/shipping',
    group: 'Purchase support',
    description: 'EU delivery coverage, timing, checkout details, and dispatch support.',
  },
  {
    label: 'Returns Policy',
    href: '/returns',
    group: 'Purchase support',
    description: 'Return window, eligible free returns, refunds, and EU withdrawal context.',
  },
  {
    label: 'Warranty',
    href: '/warranty',
    group: 'Purchase support',
    description: 'Warranty term, coverage scope, support path, and buyer rights.',
  },
] as const;

const policyGroups = ['Legal and data', 'Purchase support'] as const;

export function CookiePolicyRedesign() {
  const currentPath = '/cookie-policy';

  return (
    <div className={`${styles.cookiePolicyRoot} rounded-[2rem] text-slate-900 selection:bg-cyan-500/20`}>
      <LegalPolicyRouteActionStatus />

      {/* Main Canvas Container */}
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

        {/* 01. HERO SECTION */}
        <section
          aria-labelledby="cookie-hero-headline"
          className={`${styles.heroSurface} relative rounded-[2rem] border border-slate-200/90 shadow-sm`}
        >
          {/* Panoramic Lake & Glass Pavilion Photo Backdrop */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/locator/hero-terrace.jpg"
              alt="Hylono modern glass pavilion overlooking serene alpine lake"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center"
            />
            {/* Directional Scrim for WCAG AA readability */}
            <div className={styles.heroScrim} />
          </div>

          {/* Hero Content Layer */}
          <div className="relative z-10 grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center lg:p-14">
            {/* Left Narrative Column */}
            <div className="space-y-6">
              {/* Category Pill & Freshness */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-2xs backdrop-blur-xs">
                  <Cookie className="h-3.5 w-3.5 text-cyan-600" aria-hidden="true" />
                  Cookie Policy
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Category: Cookies · Updated 11 April 2026
                </span>
              </div>

              {/* Title & Intro */}
              <div className="space-y-4">
                <h1
                  id="cookie-hero-headline"
                  className="font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
                >
                  Cookie Policy
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  This page explains the storage Hylono currently verifies in the repo: the consent
                  record, announcement dismissal state, and optional PostHog analytics storage that
                  only loads after consent.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Quick actions
                </p>
                <div className="flex flex-wrap gap-3">
                  <LegalPolicyTrackedLink
                    href={`mailto:${siteEntity.contactEmail}`}
                    className={`${styles.springInteractive} inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white/90 px-5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs hover:border-slate-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600`}
                    ctaRole="primary"
                    eventName="legal_policy_cta_clicked"
                    policyPath={currentPath}
                    source="quick_actions"
                  >
                    <Mail className="h-4 w-4 text-cyan-600" aria-hidden="true" />
                    <span>Contact Hylono</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  </LegalPolicyTrackedLink>

                  <LegalPolicyTrackedLink
                    href="/sitemap.xml"
                    className={`${styles.springInteractive} inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white/90 px-5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs hover:border-slate-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600`}
                    ctaRole="supporting"
                    eventName="legal_policy_route_transition_clicked"
                    policyPath={currentPath}
                    source="quick_actions"
                  >
                    <span>Sitemap XML</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  </LegalPolicyTrackedLink>
                </div>
              </div>
            </div>

            {/* Right Architectural Glass & Sphere Composition */}
            <div className="relative flex flex-col gap-4 lg:items-end">
              {/* Glass Hero Plate */}
              <div className={`${styles.glassCard} w-full max-w-sm rounded-2xl p-6 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    YOUR DATA
                  </p>
                  <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                </div>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                  YOUR CHOICE
                </h3>
                <div className="my-3 h-px w-10 bg-cyan-500/60" />
                <p className="text-xs leading-relaxed text-slate-600">
                  Transparent. Minimal. Under your control.
                </p>

                {/* 3D Terrazzo Mineral Orb Visual generated via Nano Banana */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="relative h-32 w-32 sm:h-36 sm:w-36 transition-transform duration-500 hover:scale-105">
                    <Image
                      src="/cookie-policy/hero-terrazzo-orb.webp"
                      alt="Art-directed 3D polished terrazzo orb sphere with cyan orbit ring"
                      width={288}
                      height={288}
                      priority
                      unoptimized
                      className="h-full w-full object-contain drop-shadow-md"
                    />
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200/60 pt-3 text-right">
                  <LegalPolicyTrackedLink
                    href="/privacy"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 hover:text-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                    ctaRole="supporting"
                    eventName="legal_policy_route_transition_clicked"
                    policyPath={currentPath}
                    source="quick_actions"
                  >
                    Privacy builds better experiences
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </LegalPolicyTrackedLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02. KEY FACTS PILL BAR */}
        <section
          aria-label="Cookie Key Facts"
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-7"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Key facts
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-slate-200/70">
            {/* Fact 1 */}
            <div className="flex items-start gap-3.5 lg:pr-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100/90 text-slate-700">
                <Shield className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900">Essential storage</h4>
                <p className="text-xs leading-relaxed text-slate-500">
                  Consent record and site-state storage.
                </p>
              </div>
            </div>

            {/* Fact 2 */}
            <div className="flex items-start gap-3.5 lg:px-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100/90 text-slate-700">
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900">Optional analytics</h4>
                <p className="text-xs leading-relaxed text-slate-500">
                  PostHog after explicit consent.
                </p>
              </div>
            </div>

            {/* Fact 3 */}
            <div className="flex items-start gap-3.5 lg:px-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100/90 text-slate-700">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900">Consent duration</h4>
                <p className="text-xs leading-relaxed text-slate-500">
                  180 days for the consent cookie.
                </p>
              </div>
            </div>

            {/* Fact 4 */}
            <div className="flex items-start gap-3.5 lg:pl-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100/90 text-slate-700">
                <Settings2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900">Manage anytime</h4>
                <p className="text-xs leading-relaxed text-slate-500">
                  Use Cookie Settings from any page.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 03. TWO-COLUMN MAIN CONTENT GRID */}
        <div className="grid gap-8 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:items-start">

          {/* LEFT COLUMN: ART CARD (section navigation lives only in the breadcrumb "On This Page" panel) */}
          <aside className="space-y-6 lg:sticky lg:top-20">
            {/* Tactile Silk Texture Card */}
            <div className="relative h-64 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xs">
              <Image
                src="/cookie-policy/silk-wave.webp"
                alt="Flowing iridescent crystalline champagne silk fabric waves"
                fill
                sizes="320px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white drop-shadow-sm">
                  Simple Choices.
                  <br />
                  Real Control.
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: 4 NUMBERED SECTION CARDS */}
          <div className="space-y-6">

            {/* Section 01: Essential Storage */}
            <section
              id="cookie-essential"
              className={`${styles.tactileCard} rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-8`}
              aria-labelledby="heading-cookie-essential"
            >
              <div className="grid gap-6 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
                {/* Artwork Column */}
                <div className="flex flex-col items-start gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">01</span>
                  <div className="flex items-center justify-center w-full">
                    <div className="relative h-28 w-28 sm:h-32 sm:w-32 transition-transform duration-300 hover:scale-105">
                      <Image
                        src="/cookie-policy/section-01-storage.webp"
                        alt="3D isometric render of architectural layered glass storage trays with titanium rim"
                        width={256}
                        height={256}
                        unoptimized
                        loading="eager"
                        className="h-full w-full object-contain drop-shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Column */}
                <div className="space-y-4">
                  <div>
                    <h2
                      id="heading-cookie-essential"
                      className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
                    >
                      Essential Storage
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      A consent record and some site-state storage are required for basic preferences
                      to work.
                    </p>
                  </div>

                  <div className="space-y-3 text-sm leading-relaxed text-slate-600">
                    <p>Hylono currently verifies these core browser-side storage items:</p>
                    <ul className="list-disc space-y-2.5 pl-5 text-slate-600">
                      <li>
                        <strong className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          cookieConsent
                        </strong>
                        : stored in both local storage and a cookie so the site can remember your
                        analytics and marketing preferences.
                      </li>
                      <li>
                        <strong className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          hylono_announcement_dismissed
                        </strong>
                        : stored in local storage so the site remembers whether the announcement
                        banner was dismissed.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 02: Optional Analytics */}
            <section
              id="cookie-analytics"
              className={`${styles.tactileCard} rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-8`}
              aria-labelledby="heading-cookie-analytics"
            >
              <div className="grid gap-6 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
                {/* Artwork Column */}
                <div className="flex flex-col items-start gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">02</span>
                  <div className="flex items-center justify-center w-full">
                    <div className="relative h-28 w-28 sm:h-32 sm:w-32 transition-transform duration-300 hover:scale-105">
                      <Image
                        src="/cookie-policy/section-02-analytics.webp"
                        alt="3D isometric precision sensory scanner disc with brushed metal and cyan indicator"
                        width={256}
                        height={256}
                        unoptimized
                        loading="eager"
                        className="h-full w-full object-contain drop-shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Column */}
                <div className="space-y-4">
                  <div>
                    <h2
                      id="heading-cookie-analytics"
                      className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
                    >
                      Optional Analytics
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      Analytics are lazy-loaded and stay off by default until you opt in.
                    </p>
                  </div>

                  <div className="space-y-3 text-sm leading-relaxed text-slate-600">
                    <p>PostHog only loads after you&apos;ve given analytics consent.</p>
                    <p>
                      The current implementation uses browser local storage for PostHog persistence
                      and listens for consent changes so optional analytics can be turned on or off
                      later.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 03: Marketing Preference */}
            <section
              id="cookie-marketing"
              className={`${styles.tactileCard} rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-8`}
              aria-labelledby="heading-cookie-marketing"
            >
              <div className="grid gap-6 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
                {/* Artwork Column */}
                <div className="flex flex-col items-start gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">03</span>
                  <div className="flex items-center justify-center w-full">
                    <div className="relative h-28 w-28 sm:h-32 sm:w-32 transition-transform duration-300 hover:scale-105">
                      <Image
                        src="/cookie-policy/section-03-marketing.webp"
                        alt="3D isometric tactile toggle slider switch on ceramic plate"
                        width={256}
                        height={256}
                        unoptimized
                        loading="eager"
                        className="h-full w-full object-contain drop-shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Column */}
                <div className="space-y-4">
                  <div>
                    <h2
                      id="heading-cookie-marketing"
                      className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
                    >
                      Marketing Preference
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      The consent record stores both analytics and marketing choices so future
                      optional tags can honour the same preference model.
                    </p>
                  </div>

                  <div className="space-y-3 text-sm leading-relaxed text-slate-600">
                    <p>
                      The settings panel still records a marketing preference, even though the only
                      optional analytics we actually run today is PostHog.
                    </p>
                    <p>
                      So the cookie settings dialog is the right place to change either optional
                      preference.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 04: How To Manage Cookies */}
            <section
              id="cookie-manage"
              className={`${styles.tactileCard} rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-8`}
              aria-labelledby="heading-cookie-manage"
            >
              <div className="grid gap-6 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
                {/* Artwork Column */}
                <div className="flex flex-col items-start gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">04</span>
                  <div className="flex items-center justify-center w-full">
                    <div className="relative h-28 w-28 sm:h-32 sm:w-32 transition-transform duration-300 hover:scale-105">
                      <Image
                        src="/cookie-policy/section-04-manage.webp"
                        alt="3D isometric frosted glass browser console with speckled cookie token"
                        width={256}
                        height={256}
                        unoptimized
                        loading="eager"
                        className="h-full w-full object-contain drop-shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Column */}
                <div className="space-y-4">
                  <div>
                    <h2
                      id="heading-cookie-manage"
                      className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
                    >
                      How To Manage Cookies
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      Consent should be easy to revisit, so this page points back to the same
                      control used across the site.
                    </p>
                  </div>

                  <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                    <div>
                      Use{' '}
                      <LegalPolicyCookieSettingsButton
                        className={`${styles.springInteractive} inline-flex min-h-11 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-900 transition hover:bg-cyan-100 hover:border-cyan-500/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600`}
                        label="Cookie Settings"
                        source="cookie_manage"
                      />{' '}
                      to accept, reject, or change individual choices.
                    </div>
                    <p>
                      You can also clear stored data through your browser, but that will reset basic
                      site preferences too.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* 04. POLICY CENTER BANNER (Panoramic Mountain Lake) */}
        <section
          aria-labelledby="policy-center-heading"
          className="relative overflow-hidden rounded-[2rem] border border-slate-700/60 bg-[#070b14] p-6 text-white shadow-md sm:p-10 lg:p-12"
        >
          {/* Panoramic Lake Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/landing/testimonials-dusk-lake-v2.jpg"
              alt="Panoramic alpine lake at twilight"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center opacity-40"
            />
            <div className={styles.policyCenterScrim} />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Policy Center
                </p>
                <h2
                  id="policy-center-heading"
                  className="font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl"
                >
                  Move between all Hylono policy pages
                </h2>
                <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
                  Legal, privacy, cookie, shipping, returns, and warranty pages stay connected here
                  so you can compare policy details without going back to the footer or search.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <LegalPolicyTrackedLink
                  href="/policies"
                  className={`${styles.springInteractive} inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-100 backdrop-blur-xs hover:border-cyan-400/70 hover:bg-cyan-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300`}
                  ctaRole="supporting"
                  eventName="legal_policy_route_transition_clicked"
                  policyPath={currentPath}
                  source="policy_center"
                >
                  <span>Policy Center</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </LegalPolicyTrackedLink>

                <LegalPolicyTrackedLink
                  href={`mailto:${siteEntity.supportEmail}`}
                  className={`${styles.springInteractive} inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-xs hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300`}
                  ctaRole="supporting"
                  eventName="legal_policy_cta_clicked"
                  policyPath={currentPath}
                  source="policy_center"
                >
                  <span>Ask about a policy</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </LegalPolicyTrackedLink>
              </div>
            </div>

            {/* Multi-Group Policy Directory */}
            <nav className="grid gap-6 lg:grid-cols-2" aria-label="Policy pages">
              {policyGroups.map((group) => (
                <div
                  key={group}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xs"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {group}
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {policyLinks
                      .filter((link) => link.group === group)
                      .map((link) => {
                        const isCurrentPage = link.href === currentPath;

                        return (
                          <LegalPolicyTrackedLink
                            key={link.href}
                            href={link.href}
                            ariaCurrent={isCurrentPage ? 'page' : undefined}
                            className={`${styles.springInteractive} flex min-h-24 flex-col justify-between rounded-xl border p-4 text-left transition ${
                              isCurrentPage
                                ? 'border-cyan-400/60 bg-cyan-500/15 ring-1 ring-cyan-400/30'
                                : 'border-white/10 bg-white/[0.03] hover:border-cyan-300/40 hover:bg-white/[0.07]'
                            } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300`}
                            ctaRole="supporting"
                            eventName="legal_policy_route_transition_clicked"
                            policyPath={currentPath}
                            source="policy_center"
                          >
                            <span className="flex items-start justify-between gap-3">
                              <span className="text-sm font-semibold text-white">
                                {link.label}
                              </span>
                              <ArrowUpRight
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                                aria-hidden="true"
                              />
                            </span>
                            <span className="mt-2 text-xs leading-relaxed text-slate-300">
                              {link.description}
                            </span>
                            {isCurrentPage ? (
                              <span className="mt-3 text-2xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                                Current page
                              </span>
                            ) : null}
                          </LegalPolicyTrackedLink>
                        );
                      })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </section>

        {/* 05. NEED HELP & TRUST FOOTER BAR */}
        <section
          aria-label="Need Help"
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-8"
        >
          <div className="grid gap-6 md:grid-cols-3 md:divide-x md:divide-slate-200/70">
            {/* Column 1: Contact Details */}
            <div className="space-y-3 md:pr-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                Need help?
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-cyan-600" aria-hidden="true" />
                  <LegalPolicyTrackedLink
                    href={`mailto:${siteEntity.supportEmail}`}
                    className="font-medium text-slate-900 underline underline-offset-4 hover:text-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                    ctaRole="supporting"
                    eventName="legal_policy_cta_clicked"
                    policyPath={currentPath}
                    source="inline_policy_content"
                  >
                    {siteEntity.supportEmail}
                  </LegalPolicyTrackedLink>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-cyan-600" aria-hidden="true" />
                  <span>{siteEntity.supportHours}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-600" aria-hidden="true" />
                  <span>Service area: {siteEntity.serviceArea}</span>
                </p>
              </div>
            </div>

            {/* Column 2: Synchronous Trust Note */}
            <div className="flex items-start gap-3.5 md:px-6">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-slate-500">
                If a policy detail appears out of sync with the actual service, contact{' '}
                <LegalPolicyTrackedLink
                  href={`mailto:${siteEntity.supportEmail}`}
                  className="font-medium text-slate-800 underline underline-offset-4 hover:text-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                  ctaRole="supporting"
                  eventName="legal_policy_cta_clicked"
                  policyPath={currentPath}
                  source="inline_policy_content"
                >
                  support
                </LegalPolicyTrackedLink>{' '}
                before relying on that detail.
              </p>
            </div>

            {/* Column 3: Policy Verification Guidance */}
            <div className="flex items-start justify-between gap-4 md:pl-6">
              <p className="text-xs leading-relaxed text-slate-500">
                Use these public pages to verify shipping, returns, warranty, privacy, and cookie
                controls before you buy or submit a request.
              </p>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

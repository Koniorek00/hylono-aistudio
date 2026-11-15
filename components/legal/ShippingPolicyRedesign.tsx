import React from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Globe2,
  HelpCircle,
  Mail,
  MapPin,
  Package,
  RotateCcw,
  Scale,
  Settings2,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import { LegalPolicyCookieSettingsButton } from '@/components/legal/LegalPolicyCookieSettingsButton';
import {
  LegalPolicyRouteActionStatus,
  LegalPolicyTrackedLink,
  LEGAL_POLICY_ROUTE_ACTION_STATUS_ID,
} from '@/components/legal/LegalPolicyTrackedLink';
import { priceBookText } from '@/lib/money';
import {
  EuropeMapHeroArt,
  EuropeMapSectionArt,
  ChecklistClipboardCard,
} from '@/components/legal/ShippingArtworks';
import styles from '@/app/shipping/shipping.module.css';

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

function InlinePolicyMailLink({
  email,
  policyPath,
}: {
  email: string;
  policyPath: string;
}) {
  return (
    <LegalPolicyTrackedLink
      href={`mailto:${email}`}
      className="font-medium text-slate-900 underline underline-offset-4 decoration-slate-400 hover:text-cyan-700 hover:decoration-cyan-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
      ctaRole="supporting"
      eventName="legal_policy_cta_clicked"
      policyPath={policyPath}
      source="inline_policy_content"
    >
      {email}
    </LegalPolicyTrackedLink>
  );
}

export function ShippingPolicyRedesign() {
  const currentPath = '/shipping';
  const relatedLinks = policyLinks.filter((link) => link.href !== currentPath);

  return (
    <div className={`${styles.shippingRoot} rounded-[2rem] text-slate-900 selection:bg-cyan-500/20`}>
      <LegalPolicyRouteActionStatus />

      {/* Main Canvas Container */}
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

        {/* 01. HERO SECTION: Light Dawn Logistics & Coastal European Road */}
        <section
          aria-labelledby="shipping-hero-headline"
          className={`${styles.heroSurface} relative rounded-[2rem] border border-slate-200/90 shadow-sm`}
        >
          {/* Panoramic Coastal Van Photo Backdrop */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/shipping/shipping-hero-coastal-van.webp"
              alt="Hylono modern logistics van traveling along sunlit European coastal highway"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-right lg:object-center"
            />
            {/* Directional Scrim for WCAG AA readability (desktop horizontal, mobile vertical) */}
            <div className={`hidden lg:block ${styles.heroScrimDesktop}`} />
            <div className={`block lg:hidden ${styles.heroScrimMobile}`} />
          </div>

          {/* European Union Route Map Line-Art Overlay in Top-Right Quadrant */}
          <div className="pointer-events-none absolute right-4 top-4 hidden h-[340px] w-[460px] opacity-75 lg:block xl:right-16">
            <EuropeMapHeroArt />
          </div>

          {/* Hero Content Layer */}
          <div className="relative z-10 grid grid-cols-1 gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-center lg:p-14">
            {/* Left Narrative Column */}
            <div className="min-w-0 space-y-6">
              {/* Category Pill & Freshness */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-2xs backdrop-blur-xs">
                  <Truck className="h-3.5 w-3.5 text-cyan-600" aria-hidden="true" />
                  Shipping
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Updated 11 April 2026
                </span>
              </div>

              {/* Title & Intro */}
              <div className="space-y-4">
                <h1
                  id="shipping-hero-headline"
                  className="font-serif text-4xl font-normal tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
                >
                  Shipping Policy
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
                  This page summarizes the public delivery facts Hylono currently publishes:
                  European Union coverage, the shipping timeline exposed in structured data,
                  and the support channels buyers should use if a shipment needs attention.
                </p>
              </div>

              {/* Quick Actions (Hero CTA Pill Bar) */}
              <div className="space-y-3 pt-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Quick Actions
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <LegalPolicyTrackedLink
                    href={`mailto:${siteEntity.contactEmail}`}
                    className={`${styles.springInteractive} inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900`}
                    ctaRole="primary"
                    eventName="legal_policy_cta_clicked"
                    policyPath={currentPath}
                    source="quick_actions"
                  >
                    Contact Hylono
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </LegalPolicyTrackedLink>

                  <LegalPolicyCookieSettingsButton
                    className={`${styles.springInteractive} inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white/90 px-5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs backdrop-blur-xs hover:border-slate-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600`}
                    source="quick_actions"
                    label="Cookie Settings"
                  />

                  <LegalPolicyTrackedLink
                    href="/sitemap.xml"
                    className={`${styles.springInteractive} inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white/90 px-5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs backdrop-blur-xs hover:border-slate-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600`}
                    ctaRole="supporting"
                    eventName="legal_policy_route_transition_clicked"
                    policyPath={currentPath}
                    source="quick_actions"
                    statusMessage="Opening XML sitemap."
                  >
                    Sitemap XML
                  </LegalPolicyTrackedLink>
                </div>
              </div>
            </div>

            {/* Right Column: Verified Service Area Card */}
            <div className="hidden flex-col justify-center lg:flex">
              <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-5 shadow-xs backdrop-blur-xs">
                <p className="text-sm font-semibold text-slate-900">{siteEntity.serviceArea}</p>
                <p className="mt-1 text-xs text-slate-600">{siteEntity.supportHours}</p>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  Use these public pages to verify shipping, returns, warranty, privacy, and
                  cookie controls before you buy or submit a request.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 02. KEY FACTS DOCK: 4 Verified Logistics Metrics */}
        <section
          aria-labelledby="shipping-key-facts-heading"
          className="rounded-[2rem] border border-slate-200/90 bg-[#F4F7FA] p-6 shadow-xs sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 pb-4">
            <h2
              id="shipping-key-facts-heading"
              className="font-serif text-2xl font-normal tracking-tight text-slate-900 sm:text-3xl"
            >
              Key facts
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Fact 1: Area served */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-cyan-700 shadow-2xs">
                <Globe2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Area served
                </p>
                <p className="text-base font-medium text-slate-900">
                  European Union
                </p>
              </div>
            </div>

            {/* Fact 2: Handling time */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-cyan-700 shadow-2xs">
                <Package className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Handling time
                </p>
                <p className="text-base font-medium text-slate-900">
                  0 to 1 business day
                </p>
              </div>
            </div>

            {/* Fact 3: Transit time */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-cyan-700 shadow-2xs">
                <Truck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Transit time
                </p>
                <p className="text-base font-medium text-slate-900">
                  5 to 10 business days
                </p>
              </div>
            </div>

            {/* Fact 4: Cutoff */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-cyan-700 shadow-2xs">
                <Clock className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Cutoff
                </p>
                <p className="text-base font-medium text-slate-900">
                  16:00, Monday to Friday
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 03. TWO-COLUMN MAIN CONTENT GRID: 4 Numbered Sections & Sticky Sidebar */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] lg:items-start">

          {/* MAIN COLUMN: The 4 Distinct Numbered Sections (01-04) */}
          <div className="min-w-0 space-y-8">

            {/* ── SECTION 01: Where Hylono Ships ─────────────────────────────────── */}
            <section
              id="shipping-coverage"
              aria-labelledby="heading-shipping-coverage"
              className={`${styles.tactileCard} rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10`}
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_minmax(0,1.1fr)_minmax(240px,0.9fr)] lg:items-start">
                {/* Number Accent */}
                <span className={`${styles.num01} font-serif text-5xl font-light text-slate-300 sm:text-6xl select-none`} aria-hidden="true" />

                {/* Text Content */}
                <div className="min-w-0 space-y-4">
                  <h2
                    id="heading-shipping-coverage"
                    className="font-serif text-2xl font-normal tracking-tight text-slate-950 sm:text-3xl"
                  >
                    Where Hylono Ships
                  </h2>
                  <p className="text-sm font-medium leading-relaxed text-slate-900">
                    This page and the canonical site entity both point to a European Union service footprint.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Hylono&apos;s public site entity and shipping structured data both publish European Union coverage as the active service area for this page.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    If your request sits outside that area, the safest public next step is to contact{' '}
                    <InlinePolicyMailLink email={siteEntity.supportEmail} policyPath={currentPath} />{' '}
                    before placing an order.
                  </p>
                </div>

                {/* Visual: European Union Line-Art Map Artwork */}
                <div className="flex items-center justify-center">
                  <EuropeMapSectionArt className="w-full max-w-sm" />
                </div>
              </div>
            </section>

            {/* ── SECTION 02: Published Delivery Timing ──────────────────────────── */}
            <section
              id="shipping-timing"
              aria-labelledby="heading-shipping-timing"
              className={`${styles.tactileCard} rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10`}
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_minmax(0,1.1fr)_minmax(240px,0.9fr)] lg:items-start">
                {/* Number Accent */}
                <span className={`${styles.num02} font-serif text-5xl font-light text-slate-300 sm:text-6xl select-none`} aria-hidden="true" />

                {/* Text Content */}
                <div className="min-w-0 space-y-4">
                  <h2
                    id="heading-shipping-timing"
                    className="font-serif text-2xl font-normal tracking-tight text-slate-950 sm:text-3xl"
                  >
                    Published Delivery Timing
                  </h2>
                  <p className="text-sm font-medium leading-relaxed text-slate-900">
                    The current delivery terms list handling, transit, and order cutoff values.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    The shipping details published on this page currently describe a European Union configuration with a {priceBookText(0)} shipping rate, 0 to 1 business day handling, 5 to 10 business day transit, and a 16:00 cutoff on Monday to Friday.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    That makes this page the public source buyers should check before a purchase if delivery timing is part of the decision.
                  </p>
                </div>

                {/* Visual: Warehouse Packaging Boxes Photo */}
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xs">
                  <Image
                    src="/images/shipping/shipping-warehouse-boxes.webp"
                    alt="Pristine cardboard packages organized in clean warehouse studio"
                    fill
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
                </div>
              </div>

              {/* Itinerary Timeline Strip */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Step 1: Cutoff */}
                  <div className="relative flex flex-col items-center rounded-xl bg-slate-50/80 p-4 text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100/80 text-cyan-800">
                      <Clock className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Cutoff</span>
                    <span className="mt-1 text-xs font-medium text-slate-900">16:00, Monday to Friday</span>
                  </div>

                  {/* Step 2: Handling time */}
                  <div className="relative flex flex-col items-center rounded-xl bg-slate-50/80 p-4 text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100/80 text-cyan-800">
                      <Package className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Handling time</span>
                    <span className="mt-1 text-xs font-medium text-slate-900">0 to 1 business day</span>
                  </div>

                  {/* Step 3: Transit time */}
                  <div className="relative flex flex-col items-center rounded-xl bg-slate-50/80 p-4 text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100/80 text-cyan-800">
                      <Truck className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Transit time</span>
                    <span className="mt-1 text-xs font-medium text-slate-900">5 to 10 business days</span>
                  </div>

                  {/* Step 4: Area served */}
                  <div className="relative flex flex-col items-center rounded-xl bg-slate-50/80 p-4 text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100/80 text-cyan-800">
                      <Globe2 className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Area served</span>
                    <span className="mt-1 text-xs font-medium text-slate-900">European Union</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION 03: What Buyers Should Confirm ─────────────────────────── */}
            <section
              id="shipping-checkout"
              aria-labelledby="heading-shipping-checkout"
              className={`${styles.tactileCard} rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10`}
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_minmax(0,1.1fr)_minmax(240px,0.9fr)] lg:items-start">
                {/* Number Accent */}
                <span className={`${styles.num03} font-serif text-5xl font-light text-slate-300 sm:text-6xl select-none`} aria-hidden="true" />

                {/* Text Content */}
                <div className="min-w-0 space-y-4">
                  <h2
                    id="heading-shipping-checkout"
                    className="font-serif text-2xl font-normal tracking-tight text-slate-950 sm:text-3xl"
                  >
                    What Buyers Should Confirm
                  </h2>
                  <p className="text-sm font-medium leading-relaxed text-slate-900">
                    Checkout already asks for the fields shipping depends on, so the page should point buyers back to those essentials rather than invent logistics promises.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Before checkout, confirm that your order includes:
                  </p>
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                    <li>a complete delivery name and street address;</li>
                    <li>a working email address for order updates; and</li>
                    <li>the correct city, postal code, and country.</li>
                  </ul>
                </div>

                {/* Visual: Pre-checkout Verification Clipboard Card */}
                <div className="flex items-center justify-center">
                  <ChecklistClipboardCard className="w-full max-w-sm" />
                </div>
              </div>
            </section>

            {/* ── SECTION 04: Support After Dispatch ─────────────────────────────── */}
            <section
              id="shipping-support"
              aria-labelledby="heading-shipping-support"
              className={`${styles.tactileCard} rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10`}
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_minmax(0,1.1fr)_minmax(240px,0.9fr)] lg:items-start">
                {/* Number Accent */}
                <span className={`${styles.num04} font-serif text-5xl font-light text-slate-300 sm:text-6xl select-none`} aria-hidden="true" />

                {/* Text Content */}
                <div className="min-w-0 space-y-4">
                  <h2
                    id="heading-shipping-support"
                    className="font-serif text-2xl font-normal tracking-tight text-slate-950 sm:text-3xl"
                  >
                    Support After Dispatch
                  </h2>
                  <p className="text-sm font-medium leading-relaxed text-slate-900">
                    Post-purchase support should stay explicit: shipping issues go to support, returns go to the returns page, and warranty questions go to the warranty page.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Contact <InlinePolicyMailLink email={siteEntity.supportEmail} policyPath={currentPath} /> if you need delivery help.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    For a change in buying decision, use the public returns page. For a coverage question after delivery, use the warranty page.
                  </p>
                </div>

                {/* Visual: Delivery Van on Open Road Photo */}
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xs">
                  <Image
                    src="/images/shipping/shipping-dispatch-van.webp"
                    alt="Hylono modern delivery vehicle on open European transit corridor"
                    fill
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
                </div>
              </div>
            </section>
          </div>

          {/* SIDEBAR COLUMN: On This Page & Policy Center Hub */}
          <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">

            {/* Card 1: On This Page (Pinned Navigation) */}
            <div className="rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-serif text-lg font-normal italic tracking-tight text-slate-900">
                  On This Page
                </h2>
                {/* Paperclip Glyph */}
                <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </div>

              <nav className="mt-4 space-y-2" aria-label="Shipping Policy sections">
                {[
                  { id: 'shipping-coverage', numClass: styles.num01, title: 'Where Hylono Ships' },
                  { id: 'shipping-timing', numClass: styles.num02, title: 'Published Delivery Timing' },
                  { id: 'shipping-checkout', numClass: styles.num03, title: 'What Buyers Should Confirm' },
                  { id: 'shipping-support', numClass: styles.num04, title: 'Support After Dispatch' },
                ].map((item) => (
                  <LegalPolicyTrackedLink
                    key={item.id}
                    href={`#${item.id}`}
                    className={`${styles.springInteractive} flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600`}
                    ctaRole="supporting"
                    eventName="legal_policy_route_transition_clicked"
                    policyPath={currentPath}
                    source="section_navigation"
                    statusMessage={`Opening ${item.title} section.`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`${item.numClass} font-mono text-xs text-slate-400`} aria-hidden="true" />
                      <span>{item.title}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  </LegalPolicyTrackedLink>
                ))}
              </nav>
            </div>

            {/* Card 2: Policy Center Hub (Grouped Policy Directory) */}
            <div className="rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="h-5 w-5 text-cyan-600" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Policy Center
                  </span>
                </div>
                <h2
                  id="policy-center-heading"
                  className="font-serif text-xl font-normal tracking-tight text-slate-950"
                >
                  Move between all Hylono policy pages
                </h2>
                <p className="text-xs leading-relaxed text-slate-600">
                  Legal, privacy, cookie, shipping, returns, and warranty pages stay connected here so you can compare policy details without going back to the footer or search.
                </p>
              </div>

              {/* Hub Quick CTAs */}
              <div className="mt-4 flex flex-col gap-2">
                <LegalPolicyTrackedLink
                  href="/policies"
                  className={`${styles.springInteractive} inline-flex min-h-11 items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900`}
                  ctaRole="supporting"
                  eventName="legal_policy_route_transition_clicked"
                  policyPath={currentPath}
                  source="policy_center"
                >
                  Policy Center
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </LegalPolicyTrackedLink>

                <LegalPolicyTrackedLink
                  href={`mailto:${siteEntity.supportEmail}`}
                  className={`${styles.springInteractive} inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600`}
                  ctaRole="supporting"
                  eventName="legal_policy_cta_clicked"
                  policyPath={currentPath}
                  source="policy_center"
                >
                  Ask about a policy
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                </LegalPolicyTrackedLink>
              </div>

              {/* Grouped Policy Directory */}
              <nav className="mt-6 space-y-4 border-t border-slate-100 pt-4" aria-label="Policy pages">
                {policyGroups.map((group) => {
                  const linksInGroup = policyLinks.filter((l) => l.group === group);
                  return (
                    <div key={group} className="space-y-2">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {group}
                      </h3>
                      <div className="space-y-1.5">
                        {linksInGroup.map((link) => {
                          const isCurrent = link.href === currentPath;
                          return (
                            <LegalPolicyTrackedLink
                              key={link.href}
                              href={link.href}
                              ariaCurrent={isCurrent ? 'page' : undefined}
                              className={`${styles.springInteractive} flex min-h-11 flex-col justify-center rounded-xl p-2.5 text-left transition ${
                                isCurrent
                                  ? 'border border-cyan-300/80 bg-cyan-50/60 text-slate-900 ring-1 ring-cyan-200'
                                  : 'border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600`}
                              ctaRole="supporting"
                              eventName="legal_policy_route_transition_clicked"
                              policyPath={currentPath}
                              source="policy_center"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-900">
                                  {link.label}
                                </span>
                                {isCurrent && (
                                  <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-medium text-cyan-800">
                                    Current page
                                  </span>
                                )}
                              </div>
                              <span className="mt-0.5 text-[11px] text-slate-500 break-words">
                                {link.description}
                              </span>
                            </LegalPolicyTrackedLink>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>

        {/* 04. BOTTOM ROW: Related Policies & Need Help? Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Left Card: Related Policies (Section required by vitest suite) */}
          <section
            aria-labelledby="heading-related-policies"
            className="relative min-w-0 overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8"
          >
            {/* Background Decorative Image */}
            <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 opacity-25">
              <Image
                src="/images/shipping/shipping-related-packages.webp"
                alt="Delivery packages in calm natural light"
                fill
                sizes="192px"
                className="object-cover object-center"
              />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-600" aria-hidden="true" />
                <h2
                  id="heading-related-policies"
                  className="font-serif text-2xl font-normal tracking-tight text-slate-950 sm:text-3xl"
                >
                  Related Policies
                </h2>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {relatedLinks.map((link) => (
                  <LegalPolicyTrackedLink
                    key={link.href}
                    href={link.href}
                    className={`${styles.springInteractive} flex min-h-11 items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600`}
                    ctaRole="supporting"
                    eventName="legal_policy_route_transition_clicked"
                    policyPath={currentPath}
                    source="related_policies"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  </LegalPolicyTrackedLink>
                ))}
              </div>
            </div>
          </section>

          {/* Right Card: Need Help? Card */}
          <section
            aria-labelledby="heading-need-help"
            className="min-w-0 rounded-[2rem] border border-slate-200/90 bg-[#F4F7FA] p-6 shadow-sm sm:p-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-600" aria-hidden="true" />
                <h2
                  id="heading-need-help"
                  className="font-serif text-2xl font-normal tracking-tight text-slate-950 sm:text-3xl"
                >
                  Need Help?
                </h2>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed text-slate-700">
                <p className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" aria-hidden="true" />
                  <span>
                    <InlinePolicyMailLink
                      email={siteEntity.supportEmail}
                      policyPath={currentPath}
                    />
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" aria-hidden="true" />
                  <span>{siteEntity.supportHours}</span>
                </p>
                <p className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" aria-hidden="true" />
                  <span>
                    If a policy detail appears out of sync with the actual service, contact support before relying on that detail.
                  </span>
                </p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}

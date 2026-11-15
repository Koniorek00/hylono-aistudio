import React from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Cog,
  Cookie,
  FileText,
  Headphones,
  HelpCircle,
  Landmark,
  Mail,
  MapPin,
  RotateCcw,
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
import styles from '@/app/warranty/warranty.module.css';

const policyLinks = [
  {
    label: 'Privacy Policy',
    href: '/privacy',
    group: 'Legal and data',
    description: 'Personal data, forms, analytics consent, and privacy choices.',
    icon: FileText,
  },
  {
    label: 'Terms of Service',
    href: '/terms',
    group: 'Legal and data',
    description: 'Website use, checkout scope, linked policies, and wellness positioning.',
    icon: Scale,
  },
  {
    label: 'Cookie Policy',
    href: '/cookie-policy',
    group: 'Legal and data',
    description: 'Essential storage, optional analytics, and cookie settings.',
    icon: Cookie,
  },
  {
    label: 'Shipping Policy',
    href: '/shipping',
    group: 'Purchase support',
    description: 'EU delivery coverage, timing, checkout details, and dispatch support.',
    icon: Truck,
  },
  {
    label: 'Returns Policy',
    href: '/returns',
    group: 'Purchase support',
    description: 'Return window, eligible free returns, refunds, and EU withdrawal context.',
    icon: RotateCcw,
  },
  {
    label: 'Warranty',
    href: '/warranty',
    group: 'Purchase support',
    description: 'Warranty term, coverage scope, support path, and buyer rights.',
    icon: ShieldCheck,
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
      className="font-medium text-[#8C6D3B] underline underline-offset-4 decoration-[#8C6D3B]/40 hover:text-[#6E532B] hover:decoration-[#6E532B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]"
      ctaRole="supporting"
      eventName="legal_policy_cta_clicked"
      policyPath={policyPath}
      source="inline_policy_content"
    >
      {email}
    </LegalPolicyTrackedLink>
  );
}

export function WarrantyPolicyRedesign() {
  const currentPath = '/warranty';
  const relatedLinks = policyLinks.filter((link) => link.href !== currentPath);

  return (
    <div className={`${styles.warrantyRoot} rounded-[2rem] selection:bg-[#8C6D3B]/20`}>
      <LegalPolicyRouteActionStatus />

      {/* Main Container */}
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

        {/* ── 01. HERO ROW: Left Narrative + Right Utility Stack ───────────────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] lg:items-start">

          {/* Left Column: Hero Card with Key Facts */}
          <section
            aria-labelledby="warranty-hero-headline"
            className={`${styles.heroSurface} relative rounded-[2rem] border border-[#E8E3D9] bg-[#FAF7F2] p-6 shadow-sm sm:p-10 lg:p-12`}
          >
            <div className="space-y-6">

              {/* Category Pill & Freshness */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={styles.heroTag}>
                  <ShieldCheck className="h-3.5 w-3.5 text-[#8C6D3B]" aria-hidden="true" />
                  Warranty
                </span>
                <span className="text-xs font-medium text-[#7A746C]">
                  Updated 11 April 2026
                </span>
              </div>

              {/* Title & Intro Row with 2-Year Seal */}
              <div className="space-y-4">
                <h1
                  id="warranty-hero-headline"
                  className={`${styles.editorialHeading} text-4xl font-normal tracking-tight text-[#1A1A1A] sm:text-5xl lg:text-6xl`}
                >
                  Warranty
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-1">
                  <p
                    id="warranty-hero-description"
                    className="max-w-xl text-base leading-relaxed text-[#5A554E] sm:text-lg"
                  >
                    This page only publishes the warranty facts the repo verifies today: a 2-year term, parts-and-labor scope, the covered issue types, and the public support channel.
                  </p>
                  <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32 lg:h-36 lg:w-36 mx-auto sm:mx-0">
                    <Image
                      src="/images/warranty/warranty-hero-seal.webp"
                      alt="Hylono 2 Year Warranty embossed medallion seal"
                      fill
                      sizes="(max-width: 640px) 112px, 144px"
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Key facts Dock */}
              <div className="rounded-2xl border border-[#E8E3D9] bg-white p-5 sm:p-6 shadow-xs">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A746C] mb-4">
                  Key facts
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
                  {/* Fact 1: Standard term */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E3D9] bg-[#FAF7F2] text-[#8C6D3B]">
                      <Calendar className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A746C]">
                        Standard term
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-[#1A1A1A]">
                        2 years
                      </p>
                    </div>
                  </div>

                  {/* Fact 2: Scope */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E3D9] bg-[#FAF7F2] text-[#8C6D3B]">
                      <Cog className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A746C]">
                        Scope
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-[#1A1A1A]">
                        Parts and labor
                      </p>
                    </div>
                  </div>

                  {/* Fact 3: Published coverage */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E3D9] bg-[#FAF7F2] text-[#8C6D3B]">
                      <Shield className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A746C]">
                        Published coverage
                      </p>
                      <p className="mt-0.5 text-xs font-medium leading-relaxed text-[#1A1A1A]">
                        Manufacturing defects, component failures, electronic malfunctions, and structural issues.
                      </p>
                    </div>
                  </div>

                  {/* Fact 4: Support channel */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E3D9] bg-[#FAF7F2] text-[#8C6D3B]">
                      <Headphones className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A746C]">
                        Support channel
                      </p>
                      <p className="mt-0.5 text-xs font-medium leading-relaxed text-[#1A1A1A]">
                        {siteEntity.supportEmail} · {siteEntity.supportHours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Right Column: Quick Actions + TOC + Service Area */}
          <div className="flex flex-col gap-5">

            {/* Card 1: Quick Actions */}
            <div className="rounded-[1.75rem] border border-[#E8E3D9] bg-white p-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A746C]">
                Quick Actions
              </h2>
              <div className="mt-4 flex flex-col gap-2.5">
                <LegalPolicyTrackedLink
                  href={`mailto:${siteEntity.contactEmail}`}
                  className={`${styles.primaryActionBtn} w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]`}
                  ctaRole="primary"
                  eventName="legal_policy_cta_clicked"
                  policyPath={currentPath}
                  source="quick_actions"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-white" aria-hidden="true" />
                    <span>Contact Hylono</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-white" aria-hidden="true" />
                </LegalPolicyTrackedLink>

                <LegalPolicyCookieSettingsButton
                  className={`${styles.secondaryActionBtn} w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]`}
                  source="quick_actions"
                  label="Cookie Settings"
                />

                <LegalPolicyTrackedLink
                  href="/sitemap.xml"
                  className={`${styles.secondaryActionBtn} w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]`}
                  ctaRole="supporting"
                  eventName="legal_policy_route_transition_clicked"
                  policyPath={currentPath}
                  source="quick_actions"
                  statusMessage="Opening XML sitemap."
                >
                  <span>Sitemap XML</span>
                  <ArrowRight className="h-4 w-4 text-[#7A746C]" aria-hidden="true" />
                </LegalPolicyTrackedLink>
              </div>
            </div>

            {/* Card 2: On this page (Table of Contents) */}
            <div className="rounded-[1.75rem] border border-[#E8E3D9] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A746C]">
                On this page
              </p>
              <nav className="mt-4 flex flex-col gap-2" aria-label="Warranty sections">
                {[
                  { id: 'warranty-standard', title: 'Standard Warranty Promise', num: '01' },
                  { id: 'warranty-support', title: 'How To Ask For Warranty Help', num: '02' },
                  { id: 'warranty-consumer-rights', title: 'Consumer Rights Still Apply', num: '03' },
                ].map((item) => (
                  <LegalPolicyTrackedLink
                    key={item.id}
                    href={`#${item.id}`}
                    className={`${styles.springInteractive} flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[#5A554E] hover:bg-[#FAF7F2] hover:text-[#1A1A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]`}
                    ctaRole="supporting"
                    eventName="legal_policy_route_transition_clicked"
                    policyPath={currentPath}
                    source="section_navigation"
                    statusMessage={`Opening ${item.title} section.`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`${styles.editorialHeading} text-xs font-medium text-[#8C6D3B]`}>{item.num}</span>
                      <span>{item.title}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#7A746C]" aria-hidden="true" />
                  </LegalPolicyTrackedLink>
                ))}
              </nav>
            </div>

            {/* Card 3: Service Area & Support Hours */}
            <div className="rounded-[1.75rem] border border-[#E8E3D9] bg-[#F7F4ED] p-6 shadow-sm">
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1A1A1A]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8C6D3B]/10 text-[#8C6D3B]">
                    ★
                  </span>
                  <span>{siteEntity.serviceArea}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#5A554E]">
                  <Clock className="h-4 w-4 text-[#8C6D3B]" aria-hidden="true" />
                  <span>{siteEntity.supportHours}</span>
                </div>
                <p className="text-xs leading-relaxed text-[#5A554E] pt-1">
                  Use these public pages to verify shipping, returns, warranty, privacy, and cookie controls before you buy or submit a request.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* ── 02. POLICY CENTER CROSS-NAVIGATION ─────────────────────────────────── */}
        <section
          aria-labelledby="policy-center-heading"
          className="rounded-[2rem] border border-[#E8E3D9] bg-[#F7F4ED] p-6 shadow-sm sm:p-10"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-[#8C6D3B]" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C6D3B]">
                  Policy Center
                </p>
              </div>
              <h2
                id="policy-center-heading"
                className={`${styles.editorialHeading} text-2xl sm:text-3xl font-normal tracking-tight text-[#1A1A1A]`}
              >
                Move between all Hylono policy pages
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-[#5A554E]">
                Legal, privacy, cookie, shipping, returns, and warranty pages stay connected here so
                you can compare policy details without going back to the footer or search.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <LegalPolicyTrackedLink
                href="/policies"
                className={`${styles.hubPrimaryBtn} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]`}
                ctaRole="supporting"
                eventName="legal_policy_route_transition_clicked"
                policyPath={currentPath}
                source="policy_center"
              >
                Policy Center
                <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
              </LegalPolicyTrackedLink>

              <LegalPolicyTrackedLink
                href={`mailto:${siteEntity.supportEmail}`}
                className={`${styles.hubSecondaryBtn} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]`}
                ctaRole="supporting"
                eventName="legal_policy_cta_clicked"
                policyPath={currentPath}
                source="policy_center"
              >
                Ask about a policy
                <ArrowUpRight className="ml-2 h-3.5 w-3.5 text-[#7A746C]" aria-hidden="true" />
              </LegalPolicyTrackedLink>
            </div>
          </div>

          <nav className="mt-8 grid gap-6 lg:grid-cols-2" aria-label="Policy pages">
            {policyGroups.map((group) => (
              <div key={group} className="rounded-2xl border border-[#E8E3D9] bg-white p-5 shadow-2xs">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A746C]">
                  {group}
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {policyLinks
                    .filter((link) => link.group === group)
                    .map((link) => {
                      const isCurrentPage = link.href === currentPath;
                      const IconComponent = link.icon;

                      return (
                        <LegalPolicyTrackedLink
                          key={link.href}
                          href={link.href}
                          ariaCurrent={isCurrentPage ? 'page' : undefined}
                          className={`${styles.springInteractive} flex min-h-24 flex-col justify-between rounded-xl p-3.5 text-left border transition ${
                            isCurrentPage
                              ? styles.policyCardActive
                              : 'border-[#E8E3D9] bg-white hover:border-[#8C6D3B]/40 hover:bg-[#FAF7F2]'
                          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]`}
                          ctaRole="supporting"
                          eventName="legal_policy_route_transition_clicked"
                          policyPath={currentPath}
                          source="policy_center"
                        >
                          <span className="flex items-start justify-between gap-2">
                            <span className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-[#8C6D3B]" aria-hidden="true" />
                              <span className="text-xs font-semibold text-[#1A1A1A]">{link.label}</span>
                            </span>
                            <ArrowUpRight
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7A746C]"
                              aria-hidden="true"
                            />
                          </span>
                          <span className="mt-1.5 text-[11px] leading-relaxed text-[#5A554E] break-words">
                            {link.description}
                          </span>
                          {isCurrentPage ? (
                            <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C6D3B]">
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
        </section>

        {/* ── 03. NUMBERED PROMISE SECTIONS & SIDEBAR ──────────────────────────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] lg:items-start">

          {/* Main Column: 3 Numbered Sections */}
          <div className="min-w-0 space-y-8">

            {/* ── SECTION 01: Standard Warranty Promise ── */}
            <section
              id="warranty-standard"
              aria-labelledby="heading-warranty-standard"
              className={`${styles.tactileCard} rounded-[2rem] border border-[#E8E3D9] bg-white p-6 sm:p-10 shadow-sm`}
            >
              <div className={styles.promiseGrid}>
                {/* Narrative Text */}
                <div className="min-w-0 space-y-4">
                  <div className="flex items-baseline gap-4">
                    <span
                      className={`${styles.num01} ${styles.editorialHeading} text-4xl sm:text-5xl font-light text-[#B8935A] select-none`}
                      aria-hidden="true"
                    />
                    <h2
                      id="heading-warranty-standard"
                      className={`${styles.editorialHeading} text-2xl sm:text-3xl font-normal tracking-tight text-[#1A1A1A]`}
                    >
                      Standard Warranty Promise
                    </h2>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-[#1A1A1A]">
                    This page defines the public warranty promise, so support copy should stay aligned with that exact scope.
                  </p>
                  <p className="text-sm leading-relaxed text-[#5A554E]">
                    Hylono currently publishes a 2-year standard warranty promise tied to the public warranty page.
                  </p>
                  <p className="text-sm leading-relaxed text-[#5A554E]">
                    It covers parts and labor for manufacturing defects, component failures, electronic malfunctions, and structural issues.
                  </p>
                </div>

                {/* Visual Artwork */}
                <div className="relative aspect-square w-full max-w-[260px] sm:max-w-[280px] overflow-hidden rounded-2xl border border-[#E8E3D9] shadow-2xs mx-auto">
                  <Image
                    src="/images/warranty/warranty-product-device.webp"
                    alt="Precision champagne metallic wellness hardware device"
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </section>

            {/* ── SECTION 02: How To Ask For Warranty Help ── */}
            <section
              id="warranty-support"
              aria-labelledby="heading-warranty-support"
              className={`${styles.tactileCard} rounded-[2rem] border border-[#E8E3D9] bg-white p-6 sm:p-10 shadow-sm`}
            >
              <div className={styles.promiseGrid}>
                {/* Narrative Text */}
                <div className="min-w-0 space-y-4">
                  <div className="flex items-baseline gap-4">
                    <span
                      className={`${styles.num02} ${styles.editorialHeading} text-4xl sm:text-5xl font-light text-[#B8935A] select-none`}
                      aria-hidden="true"
                    />
                    <h2
                      id="heading-warranty-support"
                      className={`${styles.editorialHeading} text-2xl sm:text-3xl font-normal tracking-tight text-[#1A1A1A]`}
                    >
                      How To Ask For Warranty Help
                    </h2>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-[#1A1A1A]">
                    The safest next step is a direct support contact, not a marketing CTA or form we can&apos;t back up.
                  </p>
                  <p className="text-sm leading-relaxed text-[#5A554E]">
                    For warranty questions, contact{' '}
                    <InlinePolicyMailLink email={siteEntity.supportEmail} policyPath={currentPath} /> during{' '}
                    {siteEntity.supportHours}.
                  </p>
                  <p className="text-sm leading-relaxed text-[#5A554E]">
                    We won&apos;t promise a 24/7 hotline or extended plan here unless it&apos;s separately published and verified.
                  </p>
                </div>

                {/* Visual Artwork */}
                <div className="relative aspect-square w-full max-w-[260px] sm:max-w-[280px] overflow-hidden rounded-2xl border border-[#E8E3D9] shadow-2xs mx-auto">
                  <Image
                    src="/images/warranty/warranty-support-headset.webp"
                    alt="Premium modern headphones on travertine plinth"
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </section>

            {/* ── SECTION 03: Consumer Rights Still Apply ── */}
            <section
              id="warranty-consumer-rights"
              aria-labelledby="heading-warranty-consumer-rights"
              className={`${styles.tactileCard} rounded-[2rem] border border-[#E8E3D9] bg-white p-6 sm:p-10 shadow-sm`}
            >
              <div className={styles.promiseGrid}>
                {/* Narrative Text */}
                <div className="min-w-0 space-y-4">
                  <div className="flex items-baseline gap-4">
                    <span
                      className={`${styles.num03} ${styles.editorialHeading} text-4xl sm:text-5xl font-light text-[#B8935A] select-none`}
                      aria-hidden="true"
                    />
                    <h2
                      id="heading-warranty-consumer-rights"
                      className={`${styles.editorialHeading} text-2xl sm:text-3xl font-normal tracking-tight text-[#1A1A1A]`}
                    >
                      Consumer Rights Still Apply
                    </h2>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-[#1A1A1A]">
                    Our warranty copy shouldn&apos;t crowd out the legal rights you already have as a buyer.
                  </p>
                  <p className="text-sm leading-relaxed text-[#5A554E]">
                    Our warranty sits alongside the consumer rights that apply in your country of purchase or residence.
                  </p>
                  <p className="text-sm leading-relaxed text-[#5A554E]">
                    If a product page needs more detail, it links back here rather than publishing a conflicting version.
                  </p>
                </div>

                {/* Visual Artwork */}
                <div className="relative aspect-square w-full max-w-[260px] sm:max-w-[280px] overflow-hidden rounded-2xl border border-[#E8E3D9] shadow-2xs mx-auto">
                  <Image
                    src="/images/warranty/warranty-consumer-rights.webp"
                    alt="Linen and leather bound legal law volumes"
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </section>

          </div>

          {/* Sidebar Column: Related Policies & Need Help */}
          <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">

            {/* Card 1: Related Policies */}
            <section
              aria-labelledby="heading-related-policies"
              className="rounded-[1.75rem] border border-[#E8E3D9] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#8C6D3B]" aria-hidden="true" />
                  <h2
                    id="heading-related-policies"
                    className={`${styles.editorialHeading} text-xl sm:text-2xl font-normal tracking-tight text-[#1A1A1A]`}
                  >
                    Related Policies
                  </h2>
                </div>

                <div className="space-y-2">
                  {relatedLinks.map((link) => (
                    <LegalPolicyTrackedLink
                      key={link.href}
                      href={link.href}
                      className={`${styles.springInteractive} flex min-h-11 items-center justify-between rounded-xl border border-[#E8E3D9] bg-[#FAF7F2] px-4 py-3 text-xs font-semibold text-[#1A1A1A] transition hover:border-[#8C6D3B]/40 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]`}
                      ctaRole="supporting"
                      eventName="legal_policy_route_transition_clicked"
                      policyPath={currentPath}
                      source="related_policies"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#7A746C]" aria-hidden="true" />
                    </LegalPolicyTrackedLink>
                  ))}
                </div>
              </div>
            </section>

            {/* Card 2: Need Help? */}
            <section
              aria-labelledby="heading-need-help"
              className="rounded-[1.75rem] border border-[#E8E3D9] bg-[#F7F4ED] p-6 shadow-sm sm:p-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#8C6D3B]" aria-hidden="true" />
                  <h2
                    id="heading-need-help"
                    className={`${styles.editorialHeading} text-xl sm:text-2xl font-normal tracking-tight text-[#1A1A1A]`}
                  >
                    Need Help?
                  </h2>
                </div>

                <div className="space-y-3.5 text-xs leading-relaxed text-[#5A554E]">
                  <p className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#8C6D3B]" aria-hidden="true" />
                    <span>
                      <InlinePolicyMailLink
                        email={siteEntity.supportEmail}
                        policyPath={currentPath}
                      />
                    </span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#8C6D3B]" aria-hidden="true" />
                    <span>{siteEntity.supportHours}</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8C6D3B]" aria-hidden="true" />
                    <span>
                      If a policy detail appears out of sync with the actual service, contact support before relying on that detail.
                    </span>
                  </p>
                  <p className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8C6D3B]" aria-hidden="true" />
                    <span>
                      Service area: European Union. Use these public pages to verify shipping, returns, warranty, privacy, and cookie controls before you buy or submit a request.
                    </span>
                  </p>
                </div>
              </div>
            </section>

          </aside>

        </div>

      </div>
    </div>
  );
}

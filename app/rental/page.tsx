import type { Metadata } from 'next';
import { Suspense } from 'react';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { priceBookMonthlyText, priceBookText } from '@/lib/money';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  createBreadcrumbSchema,
  createCollectionPageSchema,
  createFaqSchema,
  createRentalProductSchema,
  createRentalServiceSchema,
  SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { rentalLandingContent, rentalProducts } from '@/content/rental';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
import Image from 'next/image';
import {
  ArrowRight,
  Calendar,
  RotateCw,
  ShieldCheck,
  Globe,
  CreditCard,
  Headphones,
  Check,
  HelpCircle,
  Target,
  AlertCircle,
} from 'lucide-react';
import { RentalClient } from './RentalClient';
import { RentalRouteActionStatus, RentalTrackedLink, RENTAL_ROUTE_ACTION_STATUS_ID } from './RentalTrackedLink';

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Rentals | Monthly Wellness Technology Plans, Pricing, and Support',
  description:
    'Explore monthly Hylono rental request paths for wellness technologies with manual availability review, delivery-fit checks, and purchase-path context.',
  path: '/rental',
});

const policyLinks = [
  { href: '/shipping', label: 'Shipping' },
  { href: '/returns', label: 'Returns' },
  { href: '/warranty', label: 'Warranty' },
  { href: '/terms', label: 'Terms' },
] as const;

const rentalDecisionPaths = [
  {
    title: 'HBOT access',
    body: 'Use rental when chamber size, delivery path, setup space, and weekly cadence need validation before ownership.',
    href: '/rental?device=hbot',
    label: 'Check HBOT rental fit',
  },
  {
    title: 'Hydrogen access',
    body: 'Use rental when the decision is water access, compact inhalation, or a stronger session platform and availability still needs confirmation.',
    href: '/rental?device=hydrogen',
    label: 'Check hydrogen rental fit',
  },
  {
    title: 'Light or signal devices',
    body: 'Use rental when RLT or PEMF should be tested inside a routine before a longer purchase decision.',
    href: '/rental?device=rlt',
    label: 'Check RLT rental fit',
  },
] as const;

const rentalStartSuitability = [
  {
    label: 'Start with rental',
    detail:
      'Best when setup space, delivery access, device tolerance, or routine adherence still needs a short manual review.',
  },
  {
    label: 'Start with ownership review',
    detail:
      'Better when the device, space, timing, and support requirements are already stable enough to compare longer-term cost.',
  },
  {
    label: 'Ask before deciding',
    detail:
      'Use contact when medical guidance, delivery constraints, deposit timing, or handover responsibility is unclear.',
  },
] as const;

const hydrogenRentalLinks = [
  {
    href: '/rental?device=hydrogen',
    label: 'Filter hydrogen rentals',
    role: 'primary',
  },
  {
    href: '/product/hydrogen',
    label: 'Review hydrogen systems',
    role: 'supporting',
  },
  {
    href: '/protocols/stress-balance-h2-foundation',
    label: 'Review hydrogen protocol context',
    role: 'supporting',
  },
  {
    href: '/contact?intent=hydrogen-rental',
    label: 'Ask about hydrogen availability',
    role: 'supporting',
  },
] as const;

const rentalLogisticsReadiness = [
  {
    label: 'Delivery region',
    value: 'EU delivery context reviewed manually',
    note: 'Hylono checks the delivery path before dispatch; this is not a live region or wait-time promise.',
  },
  {
    label: 'Deposit timing',
    value: 'Deposit confirmed before rental start',
    note: 'Payment method, deposit amount, and start timing are confirmed during manual review.',
  },
  {
    label: 'Handover requirements',
    value: 'Setup and support path checked first',
    note: 'Product size, access path, documentation, and first-use questions are reviewed before handover.',
  },
] as const;

const rentalOnboardingTimeline = [
  {
    step: 'Request review',
    timing: 'Before rental approval',
    detail: 'Hylono reviews device fit, intended use, and whether rental or ownership should be discussed first.',
  },
  {
    step: 'Logistics confirmation',
    timing: 'Before dispatch planning',
    detail: 'Delivery region, deposit timing, access path, and support expectations are confirmed manually.',
  },
  {
    step: 'Handover preparation',
    timing: 'Before first use',
    detail: 'Setup notes, documentation, and support contacts are prepared before the rental starts.',
  },
] as const;

const rentalOnboardingSteps = [
  {
    step: '01',
    title: 'Request review',
    timing: 'Before rental approval',
    detail: 'You share your needs and device preferences.',
  },
  {
    step: '02',
    title: 'Device & fit check',
    timing: 'Intake confirmation',
    detail: 'We confirm device, region and support path.',
  },
  {
    step: '03',
    title: 'Logistics confirmation',
    timing: 'Before dispatch planning',
    detail: 'Delivery, deposit, and handover details.',
  },
  {
    step: '04',
    title: 'Confirmation',
    timing: 'Agreement review',
    detail: 'You receive next steps and timeline.',
  },
  {
    step: '05',
    title: 'Handover preparation',
    timing: 'Before first use',
    detail: 'Device is prepared and shipped (if approved).',
  },
] as const;

const rentalLeadTimeBands = [
  {
    label: 'Request-ready',
    detail: 'Device preference, region, delivery constraints, and target timing are ready for manual review.',
  },
  {
    label: 'Logistics review',
    detail: 'Hylono still needs to check delivery path, deposit timing, handover details, or support scope.',
  },
  {
    label: 'Not ready yet',
    detail: 'Space, medical guidance, device fit, or setup ownership is unclear and should be reviewed before rental.',
  },
] as const;

const rentalChangeBoundaries = [
  {
    moment: 'Before agreement',
    guidance: 'Change device, term, or support questions before a rental request is approved.',
    boundary: 'No rental is treated as approved until manual review is complete.',
  },
  {
    moment: 'During rental',
    guidance: 'Use support to review extension, return, repair, or replacement questions.',
    boundary: 'Support review does not create an automatic refund, cancellation, or swap promise.',
  },
  {
    moment: 'End of term',
    guidance: 'Review return, extension, or eligible purchase-credit options before the term ends.',
    boundary: 'Final terms depend on the selected device, condition check, and agreement context.',
  },
] as const;

const rentalPaymentReview = [
  {
    label: 'Payment method',
    detail: 'Confirmed during manual review before any rental payment handoff.',
  },
  {
    label: 'Deposit amount',
    detail: 'Checked against the selected device, condition expectations, and agreement context.',
  },
  {
    label: 'First rental period',
    detail: 'Reviewed with start timing, support scope, return path, and purchase-credit questions.',
  },
] as const;

// Was a local Intl formatter hardcoded to EUR, rendering price-book figures
// denominated in PLN as euro on the main rental landing page. Delegates to the
// single money source, together with the rental schema this page emits.
const formatPrice = (amount: number): string => priceBookText(amount);

const formatUpdatedLabel = (): string =>
  new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00.000Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

function RentalIntroShell({
  hydrogenRentalCount,
  hydrogenRentalMonthly,
  lowestRentalPrice,
}: {
  hydrogenRentalCount: number;
  hydrogenRentalMonthly: number;
  lowestRentalPrice: number;
}) {
  const updatedLabel = formatUpdatedLabel();

  return (
    <div className="bg-[var(--surface-page)] text-slate-950">
      {/* SECTION 1: HERO */}
      <section
        className="relative overflow-hidden pt-24 pb-12 text-slate-950"
        aria-labelledby="rental-hero-headline"
      >
        {/* Full-width Panoramic Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/rental/rental-hero-bg.jpg"
            alt="Hylono wellness chamber on panoramic terrace"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-right md:object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent md:w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/30" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RentalRouteActionStatus />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] items-center pt-6 pb-10">
            {/* Left Column: Typography & CTAs */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                RENTAL
              </p>
              <h1
                id="rental-hero-headline"
                className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-slate-950 leading-[1.1]"
              >
                {rentalLandingContent.hero.title}
              </h1>
              <p
                id="rental-hero-description"
                className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 font-normal"
              >
                {rentalLandingContent.hero.subtitle}{' '}
                <RentalTrackedLink
                  href="#available-rental-devices"
                  ctaRole="supporting"
                  source="hero"
                  className="text-slate-900 font-medium underline underline-offset-4 hover:text-cyan-700 transition-colors"
                >
                  From {priceBookMonthlyText(lowestRentalPrice)}.
                </RentalTrackedLink>
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <RentalTrackedLink
                  href="#available-rental-devices"
                  ctaRole="primary"
                  source="hero"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-8 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-950 group"
                >
                  <span>{rentalLandingContent.hero.cta}</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </RentalTrackedLink>
                <RentalTrackedLink
                  href="/contact?intent=rental"
                  ctaRole="supporting"
                  source="hero"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white/80 backdrop-blur-xs px-8 py-3.5 text-sm font-medium text-slate-900 transition-all hover:bg-white hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-600 group"
                >
                  <span>{rentalLandingContent.hero.secondaryCta}</span>
                  <ArrowRight className="ml-2 h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900" />
                </RentalTrackedLink>
              </div>
            </div>

            {/* Right Column: Elevated Dark Glass Decision Card */}
            <div className="flex justify-end">
              <aside className="w-full max-w-sm rounded-[1.75rem] border border-white/20 bg-slate-950/85 backdrop-blur-md p-6 text-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.5)]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    RENTAL
                  </p>
                  <RentalTrackedLink
                    href="#rental-suitability"
                    ctaRole="supporting"
                    source="hero"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="View rent vs buy decision frame"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </RentalTrackedLink>
                </div>
                <h2 className="mt-2 text-xl font-medium tracking-tight text-white">
                  Rent vs buy decision frame
                </h2>
                <div className="relative mt-4 h-36 w-full overflow-hidden rounded-[1rem] border border-white/10">
                  <Image
                    src="/images/rental/decision-frame-texture.jpg"
                    alt="Rent vs buy decision frame texture"
                    fill
                    unoptimized
                    loading="eager"
                    className="object-cover"
                  />
                </div>
                <div className="mt-5 space-y-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <p>FLEXIBLE ACCESS</p>
                  <p>REAL PROGRESS</p>
                </div>
              </aside>
            </div>
          </div>

          {/* Bottom 3-item Feature Bar */}
          <div className="mt-6 rounded-[1.25rem] border border-slate-200/80 bg-white/92 p-4 backdrop-blur-md shadow-xs md:p-6">
            <div className="grid gap-6 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div className="flex items-center gap-4 pt-4 md:pt-0 md:pr-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem] bg-slate-100 text-slate-800">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Monthly request paths</p>
                  <p className="text-xs text-slate-500">with onboarding scope confirmed before start</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 md:pt-0 md:px-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem] bg-slate-100 text-slate-800">
                  <RotateCw className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Return, extend, or buy later</p>
                  <p className="text-xs text-slate-500">where offered</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem] bg-slate-100 text-slate-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Review shipping, returns, and warranty</p>
                  <p className="text-xs text-slate-500">before checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: USE RENTAL WHEN... */}
      <section
        className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100"
        aria-labelledby="use-rental-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[320px_minmax(0,1fr)] items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                USE RENTAL WHEN
              </p>
              <h2
                id="use-rental-heading"
                className="mt-3 text-3xl font-medium tracking-tight text-slate-950 leading-snug"
              >
                Use rental when fit, logistics, or routine adherence need proof first
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                This hub answers alternatives-to-buying questions without promising availability or
                clinical suitability. Hylono confirms the device, delivery context, deposit timing,
                and support path manually before a rental starts.
              </p>
              <div className="mt-6">
                <RentalTrackedLink
                  href="#rental-suitability"
                  ctaRole="supporting"
                  source="decision_frame"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-950 underline underline-offset-4 transition-colors hover:text-cyan-700"
                >
                  <span>Start with rental guide</span>
                  <ArrowRight className="h-4 w-4" />
                </RentalTrackedLink>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {rentalDecisionPaths.map((path, idx) => {
                const images = [
                  '/images/rental/card-hbot.jpg',
                  '/images/rental/card-hydrogen.jpg',
                  '/images/rental/card-rlt.jpg',
                ];
                const tags = ['HBOT', 'HYDROGEN', 'LIGHT / SIGNAL'];
                return (
                  <article
                    key={path.title}
                    className="group flex flex-col justify-between rounded-[1.5rem] border border-slate-200/80 bg-slate-50/50 p-5 shadow-xs transition-all duration-300 hover:bg-white hover:shadow-lg"
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden rounded-[1rem] bg-slate-200">
                        <Image
                          src={images[idx] ?? '/images/rental/card-hbot.jpg'}
                          alt={path.title}
                          fill
                          unoptimized
                          loading="eager"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                        {tags[idx]}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-slate-950">{path.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{path.body}</p>
                    </div>
                    <RentalTrackedLink
                      href={path.href}
                      ctaRole="supporting"
                      source="decision_frame"
                      className="mt-6 inline-flex min-h-11 items-center justify-between rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-medium text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50"
                    >
                      <span>{path.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900" />
                    </RentalTrackedLink>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RENTAL SUITABILITY */}
      <section
        id="rental-suitability"
        className="relative overflow-hidden bg-slate-950 py-20 px-4 sm:px-6 lg:px-8 text-white"
        aria-labelledby="suitability-heading"
      >
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/rental/suitability-night-bg.jpg"
            alt="Dusk luxury interior"
            fill
            unoptimized
            loading="eager"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/50" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[340px_minmax(0,1fr)] items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                START HERE
              </p>
              <span className="sr-only">start here rental suitability</span>
              <h2
                id="suitability-heading"
                className="mt-3 text-3xl sm:text-4xl font-medium tracking-tight text-white leading-snug"
              >
                Rental suitability
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Read this before asking about availability — it will make your request quicker to
                answer. It is a fixed guide, so it cannot tell you whether you qualify, recommend a
                device, quote a date, or approve a rental. A person does all of that with you.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {rentalStartSuitability.map((item, idx) => {
                const isDark = idx === 0;
                return (
                  <article
                    key={item.label}
                    className={`flex flex-col justify-between rounded-[1.5rem] p-6 backdrop-blur-md transition-all ${
                      isDark
                        ? 'border border-white/20 bg-slate-900/80 text-white shadow-lg'
                        : 'border border-white/30 bg-white/92 text-slate-950 shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-current/20">
                        {idx === 0 ? (
                          <ShieldCheck className="h-5 w-5 text-cyan-400" />
                        ) : idx === 1 ? (
                          <ShieldCheck className="h-5 w-5 text-slate-700" />
                        ) : (
                          <HelpCircle className="h-5 w-5 text-slate-700" />
                        )}
                      </div>
                      <h3 className="mt-4 text-base font-semibold">{item.label}</h3>
                      <p
                        className={`mt-2 text-xs leading-relaxed ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {item.detail}
                      </p>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <ArrowRight
                        className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HYDROGEN RENTAL FIT */}
      <section
        className="bg-gradient-to-b from-slate-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100"
        aria-labelledby="hydrogen-rental-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)_340px] items-center">
            {/* Left: Vertical molecular image */}
            <div className="relative h-72 w-full overflow-hidden rounded-[1.5rem] border border-slate-200/80 shadow-md">
              <Image
                src="/images/rental/hydrogen-bubbles-vertical.jpg"
                alt="Hydrogen molecular water bubbles"
                fill
                unoptimized
                loading="eager"
                className="object-cover"
              />
            </div>

            {/* Center: Headline & context copy */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
                HYDROGEN RENTAL FIT
              </p>
              <h2
                id="hydrogen-rental-heading"
                className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight text-slate-950 leading-snug"
              >
                Rent hydrogen water equipment in Europe only after access and support fit are confirmed
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                For hydrogen rental queries, use this page to separate water access, compact
                inhalation, and stronger session platforms before requesting availability. Current
                rental data shows {hydrogenRentalCount} hydrogen rental option
                {hydrogenRentalCount === 1 ? '' : 's'}
                {hydrogenRentalMonthly > 0 ? ` from ${priceBookMonthlyText(hydrogenRentalMonthly)}` : ''},
                but Hylono still confirms device fit, EU delivery context, support path, and timing
                manually before a rental starts.
              </p>
            </div>

            {/* Right: 3 checkmark badges */}
            <div className="space-y-4 border-l border-slate-200 pl-6">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  Match the hydrogen format first: water access, inhalation context, or a higher session-capacity platform.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  Review research and protocol context before treating rental as a personal outcome shortcut.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  Ask support to confirm availability, deposit timing, delivery path, and handover requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom: 4 pill buttons */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {hydrogenRentalLinks.map((link) => (
              <RentalTrackedLink
                key={link.href}
                href={link.href}
                ctaRole={link.role}
                source="hydrogen_rental_frame"
                className="inline-flex min-h-11 items-center justify-between rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs transition-all hover:border-teal-500 hover:bg-teal-50/50 group"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" />
              </RentalTrackedLink>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: RENTAL LOGISTICS READINESS MAP */}
      <section
        className="relative overflow-hidden bg-slate-950 py-20 px-4 sm:px-6 lg:px-8 text-white"
        aria-labelledby="logistics-heading"
      >
        <div className="absolute inset-0 z-0 opacity-35">
          <Image
            src="/images/rental/logistics-earth-network.jpg"
            alt="Global and European logistics network"
            fill
            unoptimized
            loading="eager"
            className="object-cover object-left"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/90" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_560px] items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                RENTAL LOGISTICS READINESS MAP
              </p>
              <h2
                id="logistics-heading"
                className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight text-white leading-snug"
              >
                Check delivery, deposit, and handover before a rental starts
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                This map makes the manual checkpoints visible without publishing live availability,
                fixed wait times, or automatic rental eligibility.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {rentalLogisticsReadiness.map((item, idx) => (
                <div
                  key={item.label}
                  className="flex flex-col justify-between border-l border-white/20 pl-5 h-36"
                >
                  <div>
                    <div className="flex h-8 w-8 items-center justify-center text-cyan-400 mb-2">
                      {idx === 0 ? (
                        <Globe className="h-6 w-6" />
                      ) : idx === 1 ? (
                        <CreditCard className="h-6 w-6" />
                      ) : (
                        <Headphones className="h-6 w-6" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-300 leading-snug">{item.value}</p>
                    <p className="sr-only">{item.note}</p>
                  </div>
                  <div className="text-slate-500">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: LEAD-TIME READINESS BANDS */}
      <section
        className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-slate-200/60"
        aria-labelledby="lead-time-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[380px_minmax(0,1fr)] items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                LEAD-TIME READINESS BANDS
              </p>
              <h2
                id="lead-time-heading"
                className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight text-slate-950 leading-snug"
              >
                What to expect on timing when you ask about availability
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                These bands help you plan your request. They are planning ranges, not a live queue:
                availability, your delivery region and whether a device suits you are all confirmed
                with you for your specific request.
              </p>
              <div className="mt-6">
                <RentalTrackedLink
                  href="/contact?intent=rental"
                  ctaRole="supporting"
                  source="lead_time_bands"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-slate-800"
                >
                  <span>Ask about rental timing</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </RentalTrackedLink>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {rentalLeadTimeBands.map((item, idx) => {
                const styles = [
                  'border-teal-200/90 bg-teal-50/40 text-teal-950',
                  'border-amber-200/90 bg-amber-50/40 text-amber-950',
                  'border-slate-200 bg-white text-slate-950',
                ];
                const iconColors = ['text-teal-600', 'text-amber-600', 'text-slate-600'];
                return (
                  <div
                    key={item.label}
                    className={`flex flex-col justify-between rounded-[1.25rem] border p-5 shadow-xs ${styles[idx]}`}
                  >
                    <div>
                      <div className={`flex h-8 w-8 items-center justify-center ${iconColors[idx]}`}>
                        {idx === 0 ? (
                          <Target className="h-5 w-5" />
                        ) : idx === 1 ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <HelpCircle className="h-5 w-5" />
                        )}
                      </div>
                      <h3 className="mt-3 text-sm font-semibold">{item.label}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: RENTAL ONBOARDING TIMELINE */}
      <section
        className="relative overflow-hidden bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 text-white"
        aria-labelledby="timeline-heading"
      >
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/rental/timeline-panorama-bg.jpg"
            alt="Alpine dusk panorama"
            fill
            unoptimized
            loading="eager"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/80" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[360px_minmax(0,1fr)] items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                RENTAL ONBOARDING TIMELINE
              </p>
              <h2
                id="timeline-heading"
                className="mt-2 text-3xl sm:text-4xl font-medium tracking-tight text-white leading-snug"
              >
                The steps before your first rental session
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Every rental is reviewed by a person, and this is the order that review follows. It
                does not confirm that your request is approved, when a device would ship, or what is in stock today.
              </p>
            </div>

            {/* 5 connected horizontal steps */}
            <div className="relative">
              <div className="hidden lg:block absolute top-6 left-6 right-6 h-px bg-white/20 z-0" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 relative z-10">
                {rentalOnboardingSteps.map((stepItem) => (
                  <div key={stepItem.step} className="flex flex-col items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-slate-900/80 backdrop-blur-xs text-sm font-semibold text-white mb-4 shadow-xs">
                      {stepItem.step}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{stepItem.title}</h3>
                    {stepItem.timing && (
                      <p className="mt-1 text-[11px] font-medium text-cyan-400">{stepItem.timing}</p>
                    )}
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">{stepItem.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: RENTAL CHANGE BOUNDARIES, PAYMENT REVIEW & OWNERSHIP */}
      <section
        className="bg-[var(--surface-page)] py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 text-slate-950"
        aria-labelledby="boundaries-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Column 1: Changing or ending a rental */}
            <div className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Rental change and cancellation boundaries
                </p>
                <h2 id="boundaries-heading" className="mt-2 text-xl font-semibold text-slate-950">
                  Changing or ending a rental
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  Some changes are handled by a person rather than automatically, so this shows when to
                  get in touch. Any amount or date that follows is agreed with you — nothing is
                  calculated or refunded on this page.
                </p>
                <div className="mt-5 space-y-4">
                  {rentalChangeBoundaries.map((item) => (
                    <div key={item.moment} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        {item.moment}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-950">{item.guidance}</p>
                      <p className="mt-1 text-xs text-slate-600">{item.boundary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Deposit and payment review */}
            <div className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Deposit and payment review
                </p>
                <h2 id="payment-heading" className="mt-2 text-xl font-semibold text-slate-950">
                  What is confirmed with you before you pay
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  Each of these is settled with you before any payment is taken. Nothing on this page
                  sets your deposit, approves instalments, or completes a checkout on its own.
                </p>
                <dl className="mt-5 space-y-4">
                  {rentalPaymentReview.map((item) => (
                    <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        {item.label}
                      </dt>
                      <dd className="mt-1 text-xs leading-relaxed text-slate-600">{item.detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Column 3: Ownership and support */}
            <aside className="rounded-[1.25rem] border border-slate-200 bg-white p-6 text-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Ownership and support
                </h2>
                <div className="mt-4 space-y-2 text-xs text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-950">{siteOwnership.commerce.label}:</span>{' '}
                    {siteOwnership.commerce.team}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-950">{siteOwnership.editorial.label}:</span>{' '}
                    {siteOwnership.editorial.team}
                  </p>
                  <p>Updated {updatedLabel}</p>
                  <p>{siteEntity.serviceArea} delivery and support coverage</p>
                </div>

                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                  <p className="font-semibold text-slate-950">{siteEntity.supportHours}</p>
                  <p className="mt-1">{siteEntity.supportEmail}</p>
                  <p className="mt-3 text-slate-600 leading-relaxed">
                    Use the rental hub when you want to compare terms first, then move into a manual
                    review and delivery-confirmation flow.
                  </p>
                </div>
              </div>

              {/* Policy Links */}
              <div className="mt-6 border-t border-slate-100 pt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                {policyLinks.map((link) => (
                  <RentalTrackedLink
                    key={link.href}
                    href={link.href}
                    ctaRole="policy"
                    source="hero"
                    className="underline decoration-slate-300 underline-offset-4 transition-colors hover:text-cyan-700"
                  >
                    {link.label}
                  </RentalTrackedLink>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

// [DECISION: ISR because rental catalog and pricing context is semi-dynamic.]
// Rendering strategy: server-rendered rental hub with route-local schema and catalog/pricing context in the route shell while filtering stays in client leaves.
export default function RentalPageRoute() {
  const faqItems = rentalLandingContent.faq.map((item) => ({
    question: item.q,
    answer: item.a,
  }));
  const rentalProductMentions = [
    ...new Set(rentalProducts.map((product) => product.productPath)),
  ].map((path) => ({
    '@type': 'Product',
    '@id': `${SITE_URL}${path}#product`,
    url: `${SITE_URL}${path}`,
  }));
  const lowestRentalPrice = rentalProducts.length
    ? Math.min(...rentalProducts.map((product) => product.rentalMonthly))
    : 0;
  const hydrogenRentalProducts = rentalProducts.filter((product) => product.modality === 'H2');
  const hydrogenRentalMonthly = hydrogenRentalProducts.length
    ? Math.min(...hydrogenRentalProducts.map((product) => product.rentalMonthly))
    : 0;
  const rentalHowToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITE_URL}/rental#howto`,
    name: 'How to start a Hylono device rental',
    description: 'Start a monthly wellness device rental request with delivery-fit review, support-scope confirmation, and policy-linked return or purchase-credit questions.',
    url: `${SITE_URL}/rental`,
    inLanguage: 'en',
    totalTime: 'PT10M',
    isPartOf: { '@type': 'CollectionPage', '@id': `${SITE_URL}/rental` },
    publisher: { '@id': ORGANIZATION_ID() },
    about: { '@id': `${SITE_URL}/rental#service` },
    yield: { '@type': 'DefinedTerm', name: 'Reviewed wellness device rental request' },
    step: rentalLandingContent.howItWorks.map((step) => ({
      '@type': 'HowToStep',
      position: step.number,
      name: step.title,
      text: step.text,
    })),
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-rental-page"
          data={{
            ...createCollectionPageSchema({
              name: 'Hylono Rentals',
              description:
                'Explore monthly Hylono rental request paths for wellness technologies with manual availability review, delivery-fit checks, and purchase-path context.',
              path: '/rental',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: rentalProducts.map((product) => ({
              '@type': 'Product',
              '@id': `${SITE_URL}${product.productPath}#product`,
              name: product.title,
              url: `${SITE_URL}${product.productPath}`,
            })),
            ...(rentalProductMentions.length > 0 ? { mentions: rentalProductMentions } : {}),
            mainEntity: lowestRentalPrice > 0
              ? { '@id': `${SITE_URL}/rental#service` }
              : { '@id': `${SITE_URL}/rental#faq` },
            relatedLink: [
              `${SITE_URL}/conditions`,
              `${SITE_URL}/research`,
              `${SITE_URL}/store`,
              `${SITE_URL}/protocols`,
              `${SITE_URL}/contact`,
              `${SITE_URL}/shipping`,
              `${SITE_URL}/returns`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#rental-hero-headline', '#rental-hero-description'],
            },
          }}
        />
        <StructuredData
          id="jsonld-rental-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Rental', path: '/rental' },
          ])}
        />
        <StructuredData id="jsonld-rental-faq" data={createFaqSchema(faqItems, '/rental', 'Hylono Rental FAQ')} />
        <StructuredData id="jsonld-rental-howto" data={rentalHowToSchema} />
        {lowestRentalPrice > 0 ? (
          <>
            <StructuredData
              id="jsonld-rental-offer"
              data={createRentalProductSchema({
                name: 'Hylono wellness technology rentals',
                description:
                  'Monthly rental request paths for Hylono wellness technologies with onboarding scope, support coverage, and purchase-credit options confirmed before start.',
                path: '/rental',
                monthlyPrice: lowestRentalPrice,
              })}
            />
            <StructuredData
              id="jsonld-rental-service"
              data={createRentalServiceSchema({
                name: 'Hylono Wellness Technology Rental Service',
                description:
                  'Monthly rental request support for wellness technology devices with delivery-fit review, onboarding scope, and return or purchase-credit questions confirmed before start.',
                path: '/rental',
                monthlyPrice: lowestRentalPrice,
              })}
            />
          </>
        ) : null}
      </Suspense>
      <RentalIntroShell
        hydrogenRentalCount={hydrogenRentalProducts.length}
        hydrogenRentalMonthly={hydrogenRentalMonthly}
        lowestRentalPrice={lowestRentalPrice}
      />
      <RentalClient />
    </>
  );
}

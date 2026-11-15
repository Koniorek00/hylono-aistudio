import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  partnerDirectoryMeta,
  partnerRequestChecklist,
  partnerTypeDescriptions,
  partnerTypeLabels,
  type PartnerType,
} from '@/content/partners';
import { siteEntity } from '@/content/site-entity';
import { buildLocatorContactHref } from '@/lib/contact-prefill';
import { createPageMetadata } from '@/lib/seo-metadata';
import { createBreadcrumbSchema, createCollectionPageSchema } from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { LocatorTrackedLink } from './LocatorTrackedLink';

export const metadata: Metadata = createPageMetadata({
  title: 'Request a Hylono Partner Introduction | Manual Support Handoff',
  description:
    'Tell Hylono your city, technology interest, and access goals to request a manual support handoff while public partner records are under review.',
  path: '/locator',
  forceNoIndex: true,
});

const introductionTypes = (Object.keys(partnerTypeLabels) as PartnerType[]).map((type) => {
  const imageMap: Record<PartnerType, string> = {
    clinic: '/images/locator/card-clinic-access.jpg',
    distributor: '/images/locator/card-distributor-inquiry.jpg',
    showroom: '/images/locator/card-demo-visit.jpg',
  };

  return {
    type,
    label: partnerTypeLabels[type],
    description: partnerTypeDescriptions[type],
    image: imageMap[type],
  };
});

const formattedPartnerReviewDate = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
}).format(new Date(`${partnerDirectoryMeta.lastReviewed}T00:00:00.000Z`));

const supportRoutes = [
  { href: '/about', label: 'About Hylono' },
  { href: '/help', label: 'Help' },
  { href: '/contact', label: 'Contact' },
  { href: '/rental', label: 'Rental' },
] as const;

const LOCATOR_ROUTE_ACTION_STATUS_ID = 'locator-route-action-status';
const LOCATOR_ROUTE_ACTION_STATUS_LABEL = 'Locator route action status';
const LOCATOR_ROUTE_ACTION_READY_STATUS =
  'Ready to request a guided locator introduction or choose a manual partner request type.';

// [DECISION: SSG because the locator is a noindex utility page that routes visitors into a manual Hylono contact flow while partner records are under review.]
// Rendering strategy: server-rendered static HTML with full visual fidelity matching the executive partner introduction design language.
export default function LocatorPageRoute() {
  const locatorCollectionSchema = createCollectionPageSchema({
    name: 'Hylono partner introduction page',
    description:
      'A Hylono support page that directs visitors into the contact flow for a manual partner-introduction request.',
    path: '/locator',
    dateModified: partnerDirectoryMeta.lastReviewed,
  });

  return (
    <>
      <StructuredData id="jsonld-locator-page" data={locatorCollectionSchema} />
      <StructuredData
        id="jsonld-locator-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Partner Locator', path: '/locator' },
        ])}
      />

      <div className="min-h-screen bg-[#fdfcfb] text-[#101820]">
        {/* Screen reader live region */}
        <p
          id={LOCATOR_ROUTE_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={LOCATOR_ROUTE_ACTION_STATUS_LABEL}
          className="sr-only"
        >
          {LOCATOR_ROUTE_ACTION_READY_STATUS}
        </p>

        {/* ========================================================================= */}
        {/* 01. HERO SECTION — Split Penthouse Terrace & Executive Partner Request   */}
        {/* ========================================================================= */}
        <section
          aria-labelledby="locator-hero-headline"
          className="relative overflow-hidden border-b border-slate-200/80 bg-white"
        >
          <div className="mx-auto max-w-[1536px] px-4 py-12 sm:px-6 md:py-16 lg:px-10 lg:py-20">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Left Column: Heading, Context, CTAs & Telemetry */}
              <div className="lg:col-span-6 xl:col-span-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  PARTNER INTRODUCTION
                </p>
                <h1
                  id="locator-hero-headline"
                  className="mt-4 text-3xl font-light tracking-tight text-[#101820] sm:text-4xl md:text-5xl lg:text-[54px] lg:leading-[1.12]"
                >
                  Request a Hylono partner introduction
                </h1>
                <p
                  id="locator-hero-description"
                  className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base"
                >
                  Tell Hylono where you are, which technology you want to explore, and whether you
                  need a demo, guided access, rental, or purchase support. The public locator stays
                  focused on manual introduction requests while partner records are reviewed.
                </p>

                {/* Primary CTA Row */}
                <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                  <LocatorTrackedLink
                    href={buildLocatorContactHref({ intent: 'curious' })}
                    actionStatusId={LOCATOR_ROUTE_ACTION_STATUS_ID}
                    actionStatusMessage="Opening contact with guided locator introduction context."
                    eventName="locator_route_cta_clicked"
                    ctaRole="primary"
                    source="hero"
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#101820] px-7 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 active:scale-[0.99]"
                  >
                    <span>Request guided introduction</span>
                    <span aria-hidden="true" className="text-base font-normal">→</span>
                  </LocatorTrackedLink>
                  <Link
                    href="/help"
                    aria-describedby={LOCATOR_ROUTE_ACTION_STATUS_ID}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 active:scale-[0.99]"
                  >
                    <span>Review support options</span>
                    <span aria-hidden="true" className="text-base font-normal">→</span>
                  </Link>
                </div>

                {/* Metadata Horizontal Bar */}
                <div className="mt-12 grid grid-cols-1 gap-5 border-t border-slate-200/70 pt-8 sm:grid-cols-3 sm:gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Coverage</p>
                      <p className="text-[11px] text-slate-500">{siteEntity.supportCoverageLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Support hours</p>
                      <p className="text-[11px] text-slate-500">Monday to Friday, 09:00 to 18:00 CET</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Support email</p>
                      <a
                        href={`mailto:${siteEntity.supportEmail}`}
                        aria-describedby={LOCATOR_ROUTE_ACTION_STATUS_ID}
                        className="break-all text-[11px] text-slate-600 underline underline-offset-2 hover:text-slate-900"
                      >
                        {siteEntity.supportEmail}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Architectural Terrace Imagery & Translucent Glass Page Status Card */}
              <div className="relative flex min-h-[480px] items-center justify-end overflow-hidden rounded-[2rem] border border-slate-200/60 bg-slate-900 lg:col-span-6 lg:min-h-[580px] xl:col-span-7">
                <Image
                  src="/images/locator/hero-terrace.jpg"
                  alt="Hylono European Sanctuary Architecture overlooking morning mist and peaks"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-center"
                />

                {/* Ambient vignette */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                {/* Subtle sky slogan */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-8 top-1/2 hidden -translate-y-1/2 text-left tracking-[0.28em] text-slate-800/80 drop-shadow-sm xl:block"
                >
                  <p className="text-[11px] font-bold uppercase">GLOBAL TECHNOLOGY.</p>
                  <p className="text-[11px] font-bold uppercase">LOCAL INTRODUCTIONS.</p>
                </div>

                {/* Dark Translucent Glass Card: PAGE STATUS */}
                <div className="relative z-10 m-4 w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-slate-950/80 p-6 text-white shadow-2xl backdrop-blur-md sm:m-8">
                  {/* Subtle glowing globe background texture */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 opacity-40 mix-blend-screen"
                  >
                    <Image
                      src="/images/locator/network-globe.jpg"
                      alt=""
                      aria-hidden="true"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>

                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      PAGE STATUS
                    </p>

                    <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-2 text-xs font-medium text-emerald-300">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span>Public locator while partner records are reviewed</span>
                    </div>

                    <div className="mt-5 space-y-4 border-t border-white/10 pt-4 text-xs text-slate-300">
                      <div className="flex items-start gap-3">
                        <span aria-hidden="true" className="mt-0.5 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-[11px] text-slate-400">Service area</p>
                          <p className="font-semibold text-white">{siteEntity.serviceArea}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span aria-hidden="true" className="mt-0.5 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-[11px] text-slate-400">Support hours</p>
                          <p className="font-semibold text-white">{siteEntity.supportHours}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span aria-hidden="true" className="mt-0.5 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-[11px] text-slate-400">Support email</p>
                          <a
                            href={`mailto:${siteEntity.supportEmail}`}
                            aria-describedby={LOCATOR_ROUTE_ACTION_STATUS_ID}
                            className="font-semibold text-white underline-offset-2 transition hover:text-cyan-300 hover:underline"
                          >
                            {siteEntity.supportEmail}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 02. MIDDLE SECTION — 3-Column Structured Layout (Requests, Options, Info) */}
        {/* ========================================================================= */}
        <section
          aria-label="Partner introduction guidance and options"
          className="border-b border-slate-200/80 bg-[#fdfcfb] py-16 lg:py-20"
        >
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-10">
              {/* ------------------------------------------------------------- */}
              {/* Column A: HOW INTRODUCTION REQUESTS WORK (approx 3 cols / 25%) */}
              {/* ------------------------------------------------------------- */}
              <div className="lg:col-span-3 xl:col-span-3">
                <div className="border-b border-slate-200/80 pb-5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900">
                    How introduction requests work
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Last reviewed:{' '}
                    <span className="font-medium text-slate-700">{formattedPartnerReviewDate}</span>
                  </p>
                </div>

                <div className="mt-6 space-y-7">
                  {/* Item 1: Directory posture */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.6}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">Directory posture</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        {partnerDirectoryMeta.verificationLabel}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {partnerDirectoryMeta.supportScopeLabel}
                      </p>
                    </div>
                  </div>

                  {/* Item 2: What changed */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.6}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">What changed</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        {partnerDirectoryMeta.coverageLabel}
                      </p>
                      <Link
                        href="/contact"
                        className="mt-2 inline-block text-xs font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                      >
                        {partnerDirectoryMeta.nextStepLabel}
                      </Link>
                    </div>
                  </div>

                  {/* Item 3: Support context */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.6}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">Support context</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        {siteEntity.description}
                      </p>
                      <Link
                        href="/contact"
                        className="mt-2 inline-block text-xs font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                      >
                        Use contact for introductions, then keep help and policy pages visible.
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* Column B: CHOOSE THE OPTION YOU NEED (approx 6 cols / 50%)    */}
              {/* ------------------------------------------------------------- */}
              <div className="lg:col-span-6 xl:col-span-6">
                <div className="border-b border-slate-200/80 pb-5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900">
                    CHOOSE THE OPTION YOU NEED
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Each option uses the same contact path, but it preserves the request type in
                    the request context so the team can direct you faster.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                  {introductionTypes.map(({ type, label, description, image }) => (
                    <article
                      key={type}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                    >
                      {/* Card Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={image}
                          alt={label}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 22vw"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          {label}
                        </p>
                        <h3 className="mt-1 text-sm font-semibold tracking-tight text-[#101820] break-words">
                          {label} introduction
                        </h3>
                        <p className="mt-2.5 flex-1 text-xs leading-relaxed text-slate-500">
                          {description}
                        </p>

                        <LocatorTrackedLink
                          href={buildLocatorContactHref({
                            intent: 'curious',
                            partnerType: label,
                          })}
                          actionStatusId={LOCATOR_ROUTE_ACTION_STATUS_ID}
                          actionStatusMessage={`Opening contact with ${label} introduction context.`}
                          eventName="locator_route_cta_clicked"
                          ctaRole="contextual"
                          source="partner_type"
                          className="mt-5 inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-center text-xs font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 active:scale-[0.99]"
                        >
                          <span>Start {label}</span>
                          <span aria-hidden="true">→</span>
                        </LocatorTrackedLink>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* Column C: WHAT TO INCLUDE IN YOUR REQUEST (approx 3 cols / 25%)*/}
              {/* ------------------------------------------------------------- */}
              <div className="lg:col-span-3 xl:col-span-3">
                <div className="border-b border-slate-200/80 pb-5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900">
                    WHAT TO INCLUDE IN YOUR REQUEST
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    The more precise the request, the easier it is to move you toward the right manual
                    next step without publishing unreviewed partner listings.
                  </p>
                </div>

                {/* Checklist items with round check icons */}
                <ul className="mt-6 space-y-4">
                  {partnerRequestChecklist.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 mt-0.5">
                        <svg
                          aria-hidden="true"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.4}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-xs leading-relaxed text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Checklist Action Buttons */}
                <div className="mt-8 space-y-3">
                  <LocatorTrackedLink
                    href={buildLocatorContactHref({ intent: 'curious' })}
                    actionStatusId={LOCATOR_ROUTE_ACTION_STATUS_ID}
                    actionStatusMessage="Opening contact with locator introduction request context."
                    eventName="locator_route_cta_clicked"
                    ctaRole="primary"
                    source="request_checklist"
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#101820] px-5 py-2.5 text-center text-xs font-medium text-white shadow-sm transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 active:scale-[0.99]"
                  >
                    <span>Start introduction request</span>
                    <span aria-hidden="true">→</span>
                  </LocatorTrackedLink>

                  <LocatorTrackedLink
                    href={buildLocatorContactHref({ intent: 'rental' })}
                    actionStatusId={LOCATOR_ROUTE_ACTION_STATUS_ID}
                    actionStatusMessage="Opening contact with rental alternatives context."
                    eventName="locator_route_cta_clicked"
                    ctaRole="supporting"
                    source="request_checklist"
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-center text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 active:scale-[0.99]"
                  >
                    <span>Ask about rental alternatives</span>
                    <span aria-hidden="true">→</span>
                  </LocatorTrackedLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 03. BOTTOM SECTION — Dark Luxury Support Context Strip                    */}
        {/* ========================================================================= */}
        <section aria-labelledby="locator-support-context-headline" className="bg-[#fdfcfb] py-10">
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c1218] p-8 text-white shadow-2xl md:p-10 lg:p-12">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
                {/* Left block: Description & Learn More CTA */}
                <div className="lg:col-span-4">
                  <h2
                    id="locator-support-context-headline"
                    className="text-lg font-medium tracking-tight text-white md:text-xl"
                  >
                    Hylono support context
                  </h2>
                  <p className="mt-2.5 max-w-sm text-xs leading-relaxed text-slate-400">
                    {siteEntity.description}
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/about"
                      aria-describedby={LOCATOR_ROUTE_ACTION_STATUS_ID}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-medium text-white transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.99]"
                    >
                      <span>Learn more about Hylono</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>

                {/* Center block: 3 Info Badges */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:col-span-5 lg:flex-nowrap">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-300">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Support email</p>
                      <a
                        href={`mailto:${siteEntity.supportEmail}`}
                        aria-describedby={LOCATOR_ROUTE_ACTION_STATUS_ID}
                        className="break-all text-xs font-medium text-white hover:text-cyan-300"
                      >
                        {siteEntity.supportEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-300">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Support hours</p>
                      <p className="text-xs font-medium text-white">Monday to Friday, 09:00 to 18:00 CET</p>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-300">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Service area</p>
                      <p className="text-xs font-medium text-white">{siteEntity.serviceArea}</p>
                    </div>
                  </div>
                </div>

                {/* Right block: Related support routes & Preview thumbnail */}
                <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-6 lg:col-span-3 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Related support pages
                    </p>
                    <ul className="space-y-1.5">
                      {supportRoutes.map((route) => (
                        <li key={route.href}>
                          <LocatorTrackedLink
                            href={route.href}
                            actionStatusId={LOCATOR_ROUTE_ACTION_STATUS_ID}
                            actionStatusMessage={`Opening ${route.label} support page.`}
                            eventName="locator_route_transition_clicked"
                            ctaRole="supporting"
                            source="support_context"
                            className="inline-flex min-h-[32px] items-center gap-1 text-xs font-medium text-slate-300 transition hover:text-white"
                          >
                            <span>{route.label}</span>
                            <span aria-hidden="true">→</span>
                          </LocatorTrackedLink>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative aspect-[3/4] w-28 sm:w-32 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
                    <Image
                      src="/images/locator/support-context-interior.jpg"
                      alt="Hylono Wellness Sanctuary Interior"
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

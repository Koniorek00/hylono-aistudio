import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  Package,
  Search,
  ShieldCheck,
  User,
  Wrench,
  AlertTriangle,
  MessageSquare,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { PageOwnership } from '@/components/content/PageOwnership';
import { HELP_FAQ_DATA } from '@/content/help-faq';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { createPageMetadata } from '@/lib/seo-metadata';
import { env } from '@/lib/env';
import {
  ORGANIZATION_ID,
  createBreadcrumbSchema,
  createFaqSchema,
  createWebPageSchema,
  SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { HelpClient } from './HelpClient';
import {
  HelpRouteActionStatus,
  HelpTrackedEmailLink,
  HelpTrackedLink,
} from './HelpTrackedLink';
import { HelpFaqLibrary } from './HelpFaqLibrary';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const helpRouteCards = [
  {
    title: 'FAQ answers',
    description:
      'Use the FAQ for common questions and quick answers.',
    href: '/faq',
    label: 'Search FAQ',
    image: '/images/help/hub-card-faq.jpg',
    icon: HelpCircle,
  },
  {
    title: 'Contact Hylono',
    description:
      'For product, rental, clinic or protocol-planning context.',
    href: '/contact',
    label: 'Contact Hylono',
    image: '/images/help/hub-card-contact.jpg',
    icon: User,
  },
  {
    title: 'Device support',
    description:
      'For setup, maintenance or support triage.',
    href: '/help?tab=support#help-center-tabs',
    label: 'Open device support',
    image: '/images/help/hub-card-device.png',
    icon: Wrench,
  },
] as const;

const helpPolicyLinks = [
  { href: '/shipping', label: 'Shipping guidance', icon: Package },
  { href: '/returns', label: 'Returns guidance', icon: ShieldCheck },
  { href: '/warranty', label: 'Warranty guidance', icon: FileText },
] as const;

const supportIssueMatrix = [
  {
    device: 'HBOT chamber',
    symptom: 'Pressure, seal, or session comfort question',
    prepare: 'Model, pressure setting, seal context, photos if available, and when the issue started.',
  },
  {
    device: 'Hydrogen system',
    symptom: 'Water, inhalation, output, or setup question',
    prepare: 'Model, water source, filter or accessory context, usage mode, and visible messages.',
  },
  {
    device: 'RLT, PEMF, or compact device',
    symptom: 'Routine, placement, accessory, or power question',
    prepare: 'Device name, setup location, cable or accessory context, and the routine being attempted.',
  },
] as const;

const issueResolutionStarterRows = [
  {
    issue: 'Setup friction',
    startWith: 'Room, power, ventilation, delivery path, device model, and who will be present.',
    handoff:
      'Use setup support when first-use constraints, accessories, or installation context need manual review.',
  },
  {
    issue: 'Device message or output question',
    startWith:
      'Device model, visible message, accessory context, water or source context if relevant, and when it appeared.',
    handoff: 'Use device support before treating the page as a diagnostic result.',
  },
  {
    issue: 'Policy or service path',
    startWith:
      'Order or rental reference, warranty or return page reviewed, service timing, and current device status.',
    handoff: 'Use service support for manual review; no ticket status is shown here.',
  },
] as const;

const supportStatusExpectations = [
  {
    step: '1',
    label: 'Request received',
    detail: 'Keep the contact channel, device context, and reference ready so support can identify the manual request.',
  },
  {
    step: '2',
    label: 'Manual review needed',
    detail: 'Expect support to check device, policy, rental, or setup context before promising a next action.',
  },
  {
    step: '3',
    label: 'Next step confirmed manually',
    displayLabel: 'Next step confirmed',
    detail: 'Use the reply to confirm service, warranty, return, or setup direction rather than reading status from this page.',
  },
] as const;

const setupPrepSteps = [
  {
    title: 'Check the space before setup',
    displayTitle: 'Check the space',
    detail:
      'Confirm room, power, ventilation, delivery path, and who will be present before requesting a device handoff.',
    summary: 'Room, power, ventilation, delivery path, people present.',
    href: '/delivery-installation-onboarding',
    label: 'Review onboarding',
    icon: Sliders,
  },
  {
    title: 'Confirm documents before first use',
    displayTitle: 'Confirm documents',
    detail:
      'Review warranty, return, and support boundaries before treating the device as ready for an ongoing routine.',
    summary: 'Warranty, return and support boundaries before first use.',
    href: '/warranty',
    label: 'Review warranty',
    icon: FileText,
  },
  {
    title: 'Ask before troubleshooting',
    displayTitle: 'Ask before troubleshooting',
    detail:
      'Use contact when setup friction, messages, accessories, or clinic handoff context needs manual review.',
    summary: 'Use contact for setup, accessories, messages or clinic context.',
    href: '/contact?intent=setup-support',
    label: 'Ask setup support',
    icon: MessageSquare,
  },
] as const;

const setupMediaRequestRows = [
  {
    title: 'Media needed',
    detail:
      'Ask whether photos, a checklist, device manual, or support reply would answer the setup question.',
  },
  {
    title: 'Setup state',
    detail:
      'Name the device, room, power, accessories, delivery state, and whether first use has already started.',
  },
  {
    title: 'Safety boundary',
    detail:
      'Flag any pressure, output, message, comfort, supervision, or policy question that needs manual review.',
  },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Help Center | FAQs, Contact Support, and Device Assistance',
  description:
    'Access Hylono FAQs, contact support, and device assistance in one help center for product, logistics, and protocol questions.',
  path: '/help',
});

type HelpTab = 'faq' | 'contact' | 'support';

const isHelpTab = (value: string): value is HelpTab => {
  return value === 'faq' || value === 'contact' || value === 'support';
};

const helpFaqItems = HELP_FAQ_DATA.flatMap((category) =>
  category.items.map((item) => ({
    question: item.q,
    answer: item.a,
  }))
);

// [DECISION: SSG because help center structure is static support content.]
// Rendering strategy: server-rendered help route with query-param tab selection resolved on the server and tab interaction isolated in a client leaf.
export default async function HelpPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams.tab;
  const initialTab: HelpTab = tab && isHelpTab(tab) ? tab : 'faq';

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-help-page"
          data={{
            ...createWebPageSchema({
              name: 'Hylono Help Center',
              description:
                'Access Hylono FAQs, contact support, and device assistance in one help center for product, logistics, and protocol questions.',
              path: '/help',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: { '@id': ORGANIZATION_ID() },
            mainEntity: { '@id': `${SITE_URL}/help#faq` },
            relatedLink: [
              `${SITE_URL}/faq`,
              `${SITE_URL}/contact`,
              `${SITE_URL}/shipping`,
              `${SITE_URL}/returns`,
              `${SITE_URL}/warranty`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#help-hero-headline', '#help-hero-description'],
            },
          }}
        />
        <StructuredData
          id="jsonld-help-faq"
          data={createFaqSchema(helpFaqItems, '/help', 'Hylono Help Center FAQ')}
        />
        <StructuredData
          id="jsonld-help-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Help', path: '/help' },
          ])}
        />
      </Suspense>

      <div
        data-testid="help-route-surface"
        className="bg-white text-slate-900 selection:bg-slate-900 selection:text-white"
      >
        <HelpRouteActionStatus />
        <HelpRouteShell />
        <div id="faq-library">
          <HelpFaqLibrary />
        </div>
        <HelpOperationalMatrices />
        <Suspense fallback={null}>
          <HelpClient initialTab={initialTab} hideIntro tablistId="help-center-tabs" />
        </Suspense>
      </div>
    </>
  );
}

function HelpRouteShell() {
  return (
    <>
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden bg-[#F8F9FA] border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 items-center min-h-[580px] py-12 lg:py-16">
            {/* Left Content (approx 7 cols) */}
            <div className="z-10 lg:col-span-7 pt-4 pb-8 lg:py-6">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-400">
                <a href="/" className="hover:text-slate-700 transition">Home</a>
                <span>/</span>
                <span className="text-slate-600 font-medium">Help & Support</span>
              </nav>

              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Help &amp; support
              </p>

              <h1
                id="help-hero-headline"
                className="font-editorial mt-3 text-4xl sm:text-5xl lg:text-[3.25rem] font-normal tracking-tight text-slate-900 leading-[1.12]"
                style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
              >
                Find the right Hylono support path without guessing.
              </h1>

              <p
                id="help-hero-description"
                className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600"
              >
                Use this help center to choose between public answers, contact, device support, and
                policy pages before sending a manual request.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <HelpTrackedLink
                  href="#help-center-tabs"
                  eventName="help_route_cta_clicked"
                  ctaRole="primary"
                  source="hero"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  <span>Open support options</span>
                  <ArrowRight size={14} />
                </HelpTrackedLink>

                <HelpTrackedLink
                  href="/faq"
                  eventName="help_support_route_clicked"
                  ctaRole="supporting"
                  source="hero"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 shadow-xs transition hover:bg-white hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  <Search size={15} className="text-slate-500" />
                  <span>Search FAQ</span>
                </HelpTrackedLink>
              </div>

              {/* Support Metadata Strip */}
              <div className="mt-10 border-t border-slate-200/80 pt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium text-slate-900">
                  <span>Need a reply?</span>
                  <HelpTrackedLink
                    href="/contact"
                    eventName="help_support_route_clicked"
                    ctaRole="supporting"
                    source="hero"
                    className="inline-flex items-center gap-1 underline underline-offset-4 decoration-slate-400 hover:text-slate-950 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    Contact Hylono <ArrowRight size={12} />
                  </HelpTrackedLink>
                </span>

                <span className="flex items-center gap-1.5 text-slate-600">
                  <Clock size={14} className="text-slate-400" />
                  <span>{siteEntity.supportHours}</span>
                </span>

                <span className="flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck size={14} className="text-slate-400" />
                  <span>{siteEntity.supportCoverageLabel}</span>
                </span>

                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  <HelpTrackedEmailLink
                    href={`mailto:${siteEntity.supportEmail}`}
                    focusStatusMessage="Support email is ready from the help route."
                    clickStatusMessage="Opening support email from the help route."
                    className="hover:text-slate-950 underline underline-offset-4 decoration-slate-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    {siteEntity.supportEmail}
                  </HelpTrackedEmailLink>
                </span>
              </div>
            </div>

            {/* Right Sanctuary Imagery (approx 5 cols) */}
            <div className="relative lg:col-span-5 h-[340px] sm:h-[420px] lg:h-[520px] w-full rounded-2xl overflow-hidden shadow-xs border border-slate-200/60">
              <Image
                src="/images/help/hero-sanctuary.jpg"
                alt="Floor to ceiling glass sanctuary overlooking mountain lake"
                fill
                priority
                className="object-cover object-center"
              />

              {/* Gentle luminous gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />

              {/* Top-Right HUD Compass Diagram */}
              <div className="absolute top-4 right-4 z-10 pointer-events-none select-none">
                <svg
                  width="130"
                  height="130"
                  viewBox="0 0 130 130"
                  fill="none"
                  className="text-slate-800/80 drop-shadow-xs"
                >
                  <circle cx="65" cy="65" r="46" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
                  <circle cx="65" cy="65" r="34" stroke="currentColor" strokeWidth="0.75" opacity="0.7" />
                  <circle cx="65" cy="65" r="3" fill="currentColor" opacity="0.8" />
                  <line x1="65" y1="12" x2="65" y2="118" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                  <line x1="12" y1="65" x2="118" y2="65" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                  <path id="curve" d="M 28 65 A 37 37 0 0 1 102 65" fill="none" />
                  <text fontSize="5" letterSpacing="0.22em" fill="currentColor" opacity="0.85" className="font-sans font-medium uppercase">
                    <textPath href="#curve" startOffset="50%" textAnchor="middle">
                      GUIDED WELLNESS TECHNOLOGY
                    </textPath>
                  </text>
                  <line x1="88" y1="72" x2="112" y2="82" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
                  <text x="114" y="84" fontSize="4.5" letterSpacing="0.18em" fill="currentColor" opacity="0.8" className="font-sans uppercase">
                    SCIENCE
                  </text>
                  <text x="114" y="91" fontSize="4.5" letterSpacing="0.18em" fill="currentColor" opacity="0.8" className="font-sans uppercase">
                    SUPPORT
                  </text>
                  <text x="114" y="98" fontSize="4.5" letterSpacing="0.18em" fill="currentColor" opacity="0.8" className="font-sans uppercase">
                    ACCESS
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SUPPORT SCOPE */}
      <section className="bg-white py-14 sm:py-20 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Support scope
          </p>
          <h2
            className="font-editorial mt-2 text-3xl sm:text-4xl font-normal tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
          >
            What help can cover
          </h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scope Card 1 */}
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 shadow-xs transition hover:border-slate-300 hover:bg-slate-50">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200/80 text-slate-700 shadow-xs">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Public answers about Hylono support, delivery, rental, warranty, and returns.
              </p>
            </div>

            {/* Scope Card 2 */}
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 shadow-xs transition hover:border-slate-300 hover:bg-slate-50">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200/80 text-slate-700 shadow-xs">
                <MessageSquare size={20} />
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Manual help for product, order, setup, clinic, and protocol-planning context.
              </p>
            </div>

            {/* Scope Card 3 */}
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 shadow-xs transition hover:border-slate-300 hover:bg-slate-50">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200/80 text-slate-700 shadow-xs">
                <AlertTriangle size={20} />
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Urgent or emergency situations should go to local emergency services instead of this public support page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: START WITH THE RIGHT PATH (3 Hub Cards + Quick Links Sidebar) */}
      <section className="bg-[#FBFBFC] py-16 sm:py-24 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Start with the right path
            </p>
            <h2
              className="font-editorial mt-2 text-3xl sm:text-4xl font-normal tracking-tight text-slate-900"
              style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
              aria-label="Start with the support option that matches the task: Use the hub that answers the real question first"
            >
              <span className="sr-only">Start with the support option that matches the task. </span>
              Use the hub that answers the real question first
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Find the right support area based on your goal. Self-serve first, then contact or device support when you need a person.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
            {/* 3 Hub Cards (approx 8.5 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:col-span-8">
              {helpRouteCards.map((card) => (
                <article
                  key={card.title}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
                >
                  <div>
                    {/* Header Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Icon & Title */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-800">
                        <card.icon size={18} />
                      </div>
                      <h3
                        className="font-editorial text-lg font-normal tracking-tight text-slate-900"
                        style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
                      >
                        {card.title}
                      </h3>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-slate-600">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <HelpTrackedLink
                      href={card.href}
                      eventName="help_support_route_clicked"
                      ctaRole="supporting"
                      source="route_map"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 transition hover:text-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                      <span>{card.label}</span>
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </HelpTrackedLink>
                  </div>
                </article>
              ))}
            </div>

            {/* Quick Links & Direct Answer Sidebar (approx 3.5 cols) */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Quick links
                </p>
                <div className="mt-4 divide-y divide-slate-100">
                  {helpPolicyLinks.map((link) => (
                    <HelpTrackedLink
                      key={link.href}
                      href={link.href}
                      eventName="help_support_route_clicked"
                      ctaRole="supporting"
                      source="trust_context"
                      className="group flex items-center justify-between py-3.5 text-xs font-medium text-slate-700 transition hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                      <span className="flex items-center gap-2.5">
                        <link.icon size={15} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
                        <span>{link.label}</span>
                      </span>
                      <ArrowRight size={13} className="text-slate-400 transition-transform group-hover:translate-x-0.5" />
                    </HelpTrackedLink>
                  ))}
                </div>
              </div>

              {/* Alpine Vista Direct Answer Promo Card */}
              <div className="relative mt-6 overflow-hidden rounded-xl bg-slate-900 p-6 text-white shadow-xs">
                <Image
                  src="/images/help/quick-links-banner.jpg"
                  alt="Alpine lake surrounded by mountains"
                  fill
                  className="object-cover opacity-50"
                />
                <div className="relative z-10">
                  <h4
                    className="font-editorial text-lg font-normal tracking-tight text-white"
                    style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
                  >
                    Need a direct answer?
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                    Use contact for product fit, rental planning, or device support.
                  </p>
                  <div className="mt-4">
                    <HelpTrackedLink
                      href="/contact"
                      eventName="help_support_route_clicked"
                      ctaRole="supporting"
                      source="hero"
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 border border-slate-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span>Contact Hylono</span>
                      <ArrowRight size={12} />
                    </HelpTrackedLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Handoffs Context Summary Strip */}
          <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-[11px] text-slate-500">
              <ShieldCheck size={14} className="text-slate-400" />
              <span>Policy handoffs</span>
            </div>
            <p className="text-xs text-slate-600">
              For delivery, return, or warranty questions, review the relevant policy page before
              sending a manual support request.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: AFTER-PURCHASE SUPPORT HANDOFF */}
      <section className="bg-white py-16 sm:py-20 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column (5 cols) */}
            <div className="lg:col-span-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                After-purchase support handoff
              </p>
              <h3
                className="font-editorial mt-2 text-2xl sm:text-3xl font-normal tracking-tight text-slate-900"
                style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
              >
                Bring the right context before opening a manual support request
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Hylono does not publish a live ticket-status lookup here. For support after a
                purchase or rental, prepare the reference, device, issue, and policy context so the
                support team can handle the request manually.
              </p>
            </div>

            {/* Right Column Container Card (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-900">
                    <FileText size={15} className="text-slate-600" />
                    <span>Have this ready</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold">✓</span> Order, rental, or invoice reference
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold">✓</span> Device model and setup location
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold">✓</span> What changed, when it started, and any error lights or messages
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold">✓</span> Shipping, return, warranty, or service path already reviewed
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5 shrink-0">
                  <HelpTrackedLink
                    href="/contact?intent=device-support"
                    eventName="help_support_route_clicked"
                    ctaRole="supporting"
                    source="route_map"
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    <span>Contact device support</span>
                    <ArrowRight size={13} />
                  </HelpTrackedLink>

                  <HelpTrackedLink
                    href="/warranty"
                    eventName="help_support_route_clicked"
                    ctaRole="supporting"
                    source="trust_context"
                    className="inline-flex items-center justify-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-950 py-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    <span>Review warranty terms</span>
                    <ArrowRight size={12} />
                  </HelpTrackedLink>

                  <HelpTrackedLink
                    href="/service-and-support"
                    eventName="help_support_route_clicked"
                    ctaRole="supporting"
                    source="route_map"
                    className="inline-flex items-center justify-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-950 py-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    <span>Open service support</span>
                    <ArrowRight size={12} />
                  </HelpTrackedLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SUPPORT STATUS EXPECTATIONS */}
      <section className="bg-[#FBFBFC] py-16 sm:py-20 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Support status expectations
          </p>
          <h3
            className="font-editorial mt-2 text-2xl sm:text-3xl font-normal tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
          >
            Know what happens after a manual support request
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            These steps help you keep context ready after contact. This is not a live ticket tracker or repair approval flow.
            <span className="sr-only">
              This is not a live ticket-status lookup, account-tracking flow, response-time commitment, repair approval, or service appointment.
            </span>
          </p>

          {/* 3-Step Process Flow with Connected Line matching reference */}
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative items-start">
              {/* Step 1 */}
              <div className="flex flex-col relative">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white shadow-xs">
                    1
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                    Request received
                  </h4>
                  <div className="hidden md:block flex-1 h-px bg-slate-200 ml-2" aria-hidden="true" />
                </div>
                <p className="text-xs leading-relaxed text-slate-600 md:pr-4">
                  Keep your contact channel, device context and reference ready.
                  <span className="sr-only"> Keep the contact channel, device context, and reference ready so support can identify the manual request.</span>
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col relative">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white shadow-xs">
                    2
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                    Manual review needed
                  </h4>
                  <div className="hidden md:block flex-1 h-px bg-slate-200 ml-2" aria-hidden="true" />
                </div>
                <p className="text-xs leading-relaxed text-slate-600 md:pr-4">
                  Support checks device, policy, rental or setup context.
                  <span className="sr-only"> Expect support to check device, policy, rental, or setup context before promising a next action.</span>
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col relative">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white shadow-xs">
                    3
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                    <span className="sr-only">Next step confirmed manually</span>
                    Next step confirmed
                  </h4>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 md:pr-4">
                  Use the reply to confirm service, warranty, return or setup direction.
                  <span className="sr-only"> rather than reading status from this page.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: SETUP PREPARATION LAYER */}
      <section className="bg-white py-16 sm:py-20 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Setup preparation layer
          </p>
          <h3
            className="font-editorial mt-2 text-2xl sm:text-3xl font-normal tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
          >
            Prepare setup context before a manual handoff
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            This is a static setup-prep checklist, not a setup video, guided player,
            searchable troubleshooting database, live ticket-status lookup, or repair approval.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {setupPrepSteps.map((step) => (
              <article
                key={step.title}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200/80 text-slate-700 shadow-xs">
                      <step.icon size={18} />
                    </div>
                    <h4
                      className="text-base font-semibold text-slate-900 tracking-tight"
                      style={{ fontFamily: 'var(--font-sans), sans-serif' }}
                    >
                      <span className="sr-only">{step.title}</span>
                      {step.displayTitle}
                    </h4>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {step.summary}
                  </p>
                  <p className="sr-only">{step.detail}</p>
                </div>

                <div className="mt-6 border-t border-slate-200/60 pt-4">
                  <HelpTrackedLink
                    href={step.href}
                    eventName="help_support_route_clicked"
                    ctaRole="supporting"
                    source="setup_prep"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-cyan-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    <span>{step.label}</span>
                    <ArrowRight size={13} />
                  </HelpTrackedLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function HelpOperationalMatrices() {
  return (
    <section className="bg-[#FBFBFC] py-16 sm:py-20 border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
        {/* Setup Media Request Checklist */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Setup media request checklist
          </p>
          <h3
            className="font-editorial mt-2 text-xl sm:text-2xl font-normal tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
          >
            Ask for the right setup material before first use
          </h3>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
            Use this static checklist to request the right support material. It is not a setup
            video, guided player, searchable troubleshooting database, live ticket-status
            lookup, repair approval, account-tracking flow, service appointment, or generated
            diagnostic result.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {setupMediaRequestRows.map((row) => (
              <article key={row.title} className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {row.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{row.detail}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Device & Symptom Support Matrix */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Device and symptom support matrix
          </p>
          <h3
            className="font-editorial mt-2 text-xl sm:text-2xl font-normal tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
          >
            Match the device context before support replies manually
          </h3>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
            This matrix is a static preparation guide, not a searchable diagnostic database,
            setup video, live ticket-status lookup, or repair approval.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportIssueMatrix.map((item) => (
              <article key={item.device} className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-5">
                <h4 className="text-sm font-semibold text-slate-900">
                  {item.device}
                </h4>
                <p className="mt-1.5 text-xs font-medium text-slate-700">{item.symptom}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.prepare}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Issue-Resolution Starter Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Issue-resolution starter table
          </p>
          <h3
            className="font-editorial mt-2 text-xl sm:text-2xl font-normal tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
          >
            Start a support request with the right evidence
          </h3>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
            This static table helps users prepare context before support. It is not a full
            searchable troubleshooting database, guided player, setup video, live ticket-status
            lookup, repair approval, account-tracking flow, or generated diagnostic result.
          </p>

          <div className="mt-6 space-y-4">
            {issueResolutionStarterRows.map((row) => (
              <article key={row.issue} className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-5">
                <h4 className="text-sm font-semibold text-slate-900">
                  {row.issue}
                </h4>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs leading-relaxed">
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-900">Start with: </span>
                    {row.startWith}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-900">Manual handoff: </span>
                    {row.handoff}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <HelpTrackedLink
              href="/service-and-support"
              eventName="help_support_route_clicked"
              ctaRole="supporting"
              source="issue_resolution_table"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <span>Prepare service request</span>
              <ArrowRight size={13} />
            </HelpTrackedLink>
            <HelpTrackedLink
              href="/contact?intent=device-support"
              eventName="help_support_route_clicked"
              ctaRole="supporting"
              source="issue_resolution_table"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 shadow-xs transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <span>Ask device support</span>
              <ArrowRight size={13} />
            </HelpTrackedLink>
          </div>
        </div>

        {/* Ownership & Trust Metadata */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <PageOwnership
            eyebrow="Ownership and trust"
            title="Who maintains this help center"
            description="Use this page for public support guidance and task selection before sending a manual request."
            items={[
              {
                label: siteOwnership.commerce.label,
                value: siteOwnership.commerce.team,
                detail: 'Maintains support triage, commerce support, and policy-page alignment.',
              },
              {
                label: 'Support email',
                value: siteEntity.supportEmail,
                detail: 'Published support channel for questions that need manual follow-up.',
              },
              {
                label: 'Support hours',
                value: siteEntity.supportHours,
                detail: 'Canonical support window from the shared site entity record.',
              },
              {
                label: 'Last reviewed',
                value: displayReviewDate,
                detail: 'Current content review date used for help freshness and support context.',
              },
            ]}
            actions={[
              { href: '/faq', label: 'Open FAQ' },
              { href: '/contact', label: 'Contact Hylono' },
              { href: '/about', label: 'Review about' },
            ]}
            note="Help content is public support guidance, not emergency support or personalized medical advice."
            className="h-full"
            variant="default"
          />
        </div>
      </div>
    </section>
  );
}

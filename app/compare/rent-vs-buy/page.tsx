import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Ban,
  Calendar,
  Clock,
  FileText,
  Globe,
  HelpCircle,
  Home,
  Info,
  Layers,
  Mail,
  MessageSquare,
  Package,
  RotateCcw,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import { ScopeBoundaryNote } from '@/components/content/ScopeBoundaryNote';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import {
  CompareRentBuyRouteActionStatus,
  CompareRentBuyTrackedLink,
} from './CompareRentBuyTrackedLink';
import styles from './rent-vs-buy.module.css';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const routePath = '/compare/rent-vs-buy';

const pageTitle = 'Rent vs Buy';
const pageDescription =
  'Compare Hylono rental access and direct ownership paths before choosing a product, rental request, consultation, or support route.';

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const decisionSignals = [
  {
    icon: Home,
    title: 'Start with the setting',
    description:
      'Home, clinic, studio, facility, and operator contexts can point to different support, onboarding, and access needs before a product route is useful.',
  },
  {
    icon: Layers,
    title: 'Compare commitment level',
    description:
      'Rental can keep support and setup review closer to the first decision, while ownership fits better when product fit and logistics are already stable.',
  },
  {
    icon: FileText,
    title: 'Check policy and support facts',
    description:
      'Shipping, returns, warranty, service, and onboarding pages should stay visible before either route becomes a serious next step.',
  },
  {
    icon: MessageSquare,
    title: 'Use consultation when unclear',
    description:
      'When the route is still open, consultation is the safer bridge than forcing a rental or purchase decision from public copy alone.',
  },
] as const;

const comparisonRows = [
  {
    question: 'Commitment shape',
    rental:
      'Use rental when access, support context, and setup fit still need to be tested before long-term ownership.',
    ownership:
      'Use ownership when the product category, setting, policy context, and support path are already clear.',
  },
  {
    question: 'Best public starting point',
    rental:
      'Start on the rental route, then keep delivery, service, warranty, and contact paths close.',
    ownership:
      'Start on the store or product route, then check shipping, returns, warranty, and support.',
  },
  {
    question: 'What must be confirmed',
    rental:
      'Confirm access terms, location context, setup needs, service handoffs, and whether manual follow-up is required.',
    ownership:
      'Confirm product identity, availability-on-request posture, policy routes, and whether a consultation is needed first.',
  },
  {
    question: 'When not to decide yet',
    rental:
      'Pause if health-suitability, installation, professional deployment, or evidence questions are still unresolved.',
    ownership:
      'Pause if the product fit, delivery path, support expectations, or policy implications are still assumed rather than visible.',
  },
] as const;

const useCaseProofQuestions = [
  {
    icon: Home,
    title: 'Setting proof',
    description:
      'Name the home, clinic, studio, or facility context that makes rental or ownership easier to justify.',
  },
  {
    icon: Settings,
    title: 'Support proof',
    description:
      'Check whether setup, delivery, service, warranty, or onboarding context is visible before choosing.',
  },
  {
    icon: HelpCircle,
    title: 'Unresolved proof',
    description:
      'List the missing evidence, policy, suitability, or logistics question that should send the visitor to consultation.',
  },
] as const;

const routeBoundaries = [
  {
    icon: Ban,
    text: 'This page does not publish financial advice, financial-return projections, discount pressure, or automatic qualification.',
  },
  {
    icon: ShieldCheck,
    text: 'Rental and ownership decisions should not be treated as medical, wellness-outcome, or personal suitability commitments.',
  },
  {
    icon: Truck,
    text: 'No fixed delivery, setup, support, availability, or pricing promise should be inferred beyond the linked public routes.',
  },
  {
    icon: AlertCircle,
    text: 'If the setting, device fit, health-suitability context, or professional deployment path is unclear, use consultation before choosing an access model.',
  },
] as const;

const nextSteps = [
  {
    href: '/rental',
    title: 'Rental access',
    description:
      'Review monthly access when support, onboarding, and lower-commitment planning are still important.',
    source: 'next_steps' as const,
    icon: Calendar,
  },
  {
    href: '/store',
    title: 'Store and product paths',
    description:
      'Compare product categories when the intended setting, modality, and policy context are already clearer.',
    source: 'next_steps' as const,
    icon: ShoppingBag,
  },
  {
    href: '/consultation',
    title: 'Consultation',
    description:
      'Use the manual route when the right access path, product category, or deployment context needs a reply.',
    source: 'next_steps' as const,
    icon: MessageSquare,
  },
  {
    href: '/service-and-support',
    title: 'Service and support',
    description:
      'Check onboarding, device support, warranty routing, and manual support boundaries before deciding.',
    source: 'next_steps' as const,
    icon: Settings,
  },
  {
    href: '/delivery-installation-onboarding',
    title: 'Delivery and onboarding',
    description:
      'Review setup and logistics questions before relying on a rental or ownership assumption.',
    source: 'next_steps' as const,
    icon: Truck,
  },
  {
    href: '/safety-and-standards',
    title: 'Safety and standards',
    description:
      'Review claim boundaries, evidence limits, and suitability handoffs before choosing a technology path.',
    source: 'next_steps' as const,
    icon: ShieldCheck,
  },
] as const;

const quickPolicyLinks = [
  { href: '/shipping', label: 'Shipping', icon: Package },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/warranty', label: 'Warranty', icon: ShieldCheck },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
] as const;

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173B34]';

export const metadata: Metadata = createPageMetadata({
  title: 'Rent vs Buy | Hylono Access Model Comparison',
  description: pageDescription,
  path: routePath,
});

// [DECISION: SSG because this is static public comparison guidance with no personalized pricing, qualification, checkout, or session state.]
// Rendering strategy: server-rendered indexable comparison page with schema emitted from the route and analytics isolated to link leaves.
// Surface standard: variant="default" with daylight clinical luxury surface tokens and rounded-[2rem] containers.
export default function CompareRentVsBuyPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-compare-rent-buy-page"
          data={{
            ...createWebPageSchema({
              name: pageTitle,
              description: pageDescription,
              path: routePath,
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: { '@id': ORGANIZATION_ID() },
            mainEntity: { '@id': ORGANIZATION_ID() },
            keywords:
              'Hylono rent vs buy, wellness device rental, wellness device ownership, Hylono access model, rental comparison, ownership comparison',
            relatedLink: [
              `${SITE_URL}/rental`,
              `${SITE_URL}/store`,
              `${SITE_URL}/consultation`,
              `${SITE_URL}/service-and-support`,
              `${SITE_URL}/delivery-installation-onboarding`,
              `${SITE_URL}/safety-and-standards`,
              `${SITE_URL}/shipping`,
              `${SITE_URL}/returns`,
              `${SITE_URL}/warranty`,
              `${SITE_URL}/faq`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: [
                '#compare-rent-buy-hero-headline',
                '#compare-rent-buy-hero-description',
              ],
            },
          }}
        />
        <StructuredData
          id="jsonld-compare-rent-buy-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Rent vs Buy', path: routePath },
          ])}
        />
      </Suspense>

      <div className={`${styles.rentVsBuyPage} bg-[#f8fafc] text-slate-900 min-h-screen`}>
        <CompareRentBuyRouteActionStatus />

        {/* ==================================================================== */}
        {/* HERO SECTION */}
        {/* ==================================================================== */}
        <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-[#E5DDD0]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
              {/* Left Column: Heading & CTAs */}
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#DFD4C3] bg-[#F5EFE6] px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] text-[#7A6F64] uppercase shadow-xs">
                  Rent vs Buy
                </div>

                <h1
                  id="compare-rent-buy-hero-headline"
                  className={`${styles.editorialHeading} mt-6 text-4xl sm:text-5xl lg:text-[3.75rem] font-medium leading-[1.08] tracking-tight text-[#191716]`}
                >
                  Compare rental and ownership{' '}
                  <span className={`${styles.editorialItalic} block sm:inline font-normal`}>
                    before choosing a Hylono path.
                  </span>
                </h1>

                <p
                  id="compare-rent-buy-hero-description"
                  className="mt-6 max-w-xl text-base sm:text-lg leading-[1.75] text-[#554D44] font-normal"
                >
                  Decide between monthly access, direct ownership, or a consultation-first
                  path. Start from setting and support needs, not from a device.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <CompareRentBuyTrackedLink
                    href="/rental"
                    eventName="compare_rent_buy_route_cta_clicked"
                    ctaRole="primary"
                    source="hero"
                    className={`${styles.primaryPillBtn} min-h-[48px] ${focusRingClass}`}
                  >
                    <Calendar size={18} aria-hidden="true" />
                    <span>Review rental access</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </CompareRentBuyTrackedLink>

                  <CompareRentBuyTrackedLink
                    href="/consultation"
                    eventName="compare_rent_buy_route_cta_clicked"
                    ctaRole="supporting"
                    source="hero"
                    className={`${styles.outlinePillBtn} min-h-[48px] ${focusRingClass}`}
                  >
                    <MessageSquare size={18} aria-hidden="true" />
                    <span>Ask which path fits</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </CompareRentBuyTrackedLink>
                </div>
              </div>

              {/* Right Column: Micro-metadata & Architectural Studio Imagery */}
              <div className="relative min-w-0 flex flex-col items-end">
                <div className="mb-4 text-right">
                  <p className="text-[11px] font-semibold tracking-[0.24em] text-[#8C827A] uppercase leading-relaxed">
                    Same technology.
                    <br />
                    Different ways
                    <br />
                    to access.
                  </p>
                </div>

                <div className="relative w-full overflow-hidden rounded-[2rem] border border-[#E5DDD0] bg-[#FAF7F2] shadow-[0_12px_36px_rgba(80,60,40,0.06)]">
                  <Image
                    src="/images/compare/rent-vs-buy/hero.jpg"
                    alt="Hylono wellness technologies in architectural studio setting"
                    width={960}
                    height={640}
                    priority
                    className="w-full h-auto object-cover transition duration-700 hover:scale-[1.01]"
                  />
                </div>
              </div>
            </div>

            {/* Access Model Facts Strip (Under Hero) */}
            <div className="mt-14 pt-8 border-t border-[#E5DDD0]/70">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[11px] font-semibold tracking-[0.22em] text-[#8C8275] uppercase">
                  Access model facts
                </span>
                <div className="h-px w-20 bg-[#E2D7C8]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Fact 1 */}
                <div className={`${styles.luxuryCard} p-5 sm:p-6 flex items-center gap-4`}>
                  <div className={styles.iconBadge}>
                    <Globe size={20} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#8C827A] font-semibold uppercase tracking-[0.1em]">Service area</p>
                    <p className="mt-0.5 text-sm sm:text-[15px] font-semibold text-[#191716] break-words">
                      {siteEntity.serviceArea}
                    </p>
                  </div>
                </div>

                {/* Fact 2 */}
                <div className={`${styles.luxuryCard} p-5 sm:p-6 flex items-center gap-4`}>
                  <div className={styles.iconBadge}>
                    <Users size={20} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#8C827A] font-semibold uppercase tracking-[0.1em]">Support coverage</p>
                    <p className="mt-0.5 text-sm sm:text-[15px] font-semibold text-[#191716] break-words">
                      {siteEntity.supportCoverageLabel}
                    </p>
                  </div>
                </div>

                {/* Fact 3 */}
                <div className={`${styles.luxuryCard} p-5 sm:p-6 flex items-center gap-4`}>
                  <div className={styles.iconBadge}>
                    <Clock size={20} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#8C827A] font-semibold uppercase tracking-[0.1em]">Support window</p>
                    <p className="mt-0.5 text-sm sm:text-[15px] font-semibold text-[#191716] break-words">
                      {siteEntity.supportHours}
                    </p>
                  </div>
                </div>

                {/* Fact 4 */}
                <div className={`${styles.luxuryCard} p-5 sm:p-6 flex items-center gap-4`}>
                  <div className={styles.iconBadge}>
                    <FileText size={20} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#8C827A] font-semibold uppercase tracking-[0.1em]">Decision signals</p>
                    <p className="mt-0.5 text-sm sm:text-[15px] font-semibold text-[#191716] break-words">
                      What to clarify before choosing rental or ownership
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION: DECISION SIGNALS */}
        {/* ==================================================================== */}
        <section className="py-16 lg:py-20 border-b border-[#E5DDD0]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#8C8275] uppercase">
                Decision signals
              </span>
              <div className="h-px w-20 bg-[#E2D7C8]" />
            </div>

            <h2 className={`${styles.editorialHeading} mt-4 text-2xl sm:text-3xl lg:text-[2.25rem] font-medium tracking-tight text-[#191716]`}>
              What to clarify before choosing rental or ownership
            </h2>
            <p className="mt-2.5 max-w-3xl text-sm sm:text-base leading-relaxed text-[#60574D]">
              Check the setting, commitment level, public policy context, and whether
              support should route the next step.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {decisionSignals.map((signal) => (
                <article
                  key={signal.title}
                  className={`${styles.luxuryCard} p-6 sm:p-7 flex flex-col justify-between`}
                >
                  <div>
                    <div className={styles.iconBadge}>
                      <signal.icon aria-hidden="true" size={20} />
                    </div>
                    <h3 className="mt-5 text-[15px] font-semibold text-[#191716]">
                      {signal.title}
                    </h3>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#60574D]">
                      {signal.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION: OWNERSHIP AND FRESHNESS */}
        {/* PageOwnership contract: inline page ownership and governance rendered in this section */}
        {/* ==================================================================== */}
        <section className="py-16 lg:py-20 border-b border-[#E5DDD0]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#8C8275] uppercase">
                Ownership and freshness
              </span>
              <div className="h-px w-20 bg-[#E2D7C8]" />
            </div>

            <h2 className={`${styles.editorialHeading} mt-4 text-2xl sm:text-3xl lg:text-[2.25rem] font-medium tracking-tight text-[#191716]`}>
              Who maintains the access comparison
            </h2>
            <p className="mt-2.5 max-w-3xl text-sm sm:text-base leading-relaxed text-[#60574D]">
              This page is maintained as public comparison guidance for rental access,
              ownership context, support handoffs, and policy visibility.
            </p>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px] items-start">
              {/* Left: 4 Info Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* 1: Commerce support */}
                <div className={`${styles.luxuryCard} p-6`}>
                  <div className="flex items-center gap-3.5">
                    <div className={styles.iconBadge}>
                      <Settings size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8C827A]">
                        {siteOwnership.commerce.label}
                      </p>
                      <p className="text-[15px] font-bold text-[#191716]">
                        {siteOwnership.commerce.team}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-[#60574D]">
                    Maintains rental, product, support, consultation, and policy handoff wording.
                  </p>
                </div>

                {/* 2: Editorial oversight */}
                <div className={`${styles.luxuryCard} p-6`}>
                  <div className="flex items-center gap-3.5">
                    <div className={styles.iconBadge}>
                      <FileText size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8C827A]">
                        {siteOwnership.editorial.label}
                      </p>
                      <p className="text-[15px] font-bold text-[#191716]">
                        {siteOwnership.editorial.team}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-[#60574D]">
                    Keeps the comparison answer-first without turning it into a private quote,
                    financial-return claim, or pressure offer.
                  </p>
                </div>

                {/* 3: Support email */}
                <div className={`${styles.luxuryCard} p-6`}>
                  <div className="flex items-center gap-3.5">
                    <div className={styles.iconBadge}>
                      <Mail size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8C827A]">
                        Support email
                      </p>
                      <p className="text-[15px] font-bold text-[#191716]">
                        {siteEntity.supportEmail}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-[#60574D]">
                    Published support channel for questions that need manual follow-up.
                  </p>
                </div>

                {/* 4: Last reviewed */}
                <div className={`${styles.luxuryCard} p-6`}>
                  <div className="flex items-center gap-3.5">
                    <div className={styles.iconBadge}>
                      <Calendar size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8C827A]">
                        Last reviewed
                      </p>
                      <p className="text-[15px] font-bold text-[#191716]">
                        {displayReviewDate}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-[#60574D]">
                    Current content review date used for page freshness and support context.
                  </p>
                </div>
              </div>

              {/* Right: Actions Card */}
              <div className={`${styles.luxuryCard} p-7 rounded-[1.5rem] flex flex-col justify-between`}>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-[#8C8275] uppercase">
                  Ownership action links are ready.
                </p>
                <div className="mt-6 flex flex-col gap-3.5">
                  <CompareRentBuyTrackedLink
                    href="/rental"
                    eventName="compare_rent_buy_route_transition_clicked"
                    ctaRole="primary"
                    source="next_steps"
                    className={`${styles.actionBtnTeal} min-h-[48px] ${focusRingClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={18} aria-hidden="true" />
                      <span>Open rental</span>
                    </div>
                    <ArrowRight size={16} aria-hidden="true" />
                  </CompareRentBuyTrackedLink>

                  <CompareRentBuyTrackedLink
                    href="/store"
                    eventName="compare_rent_buy_route_transition_clicked"
                    ctaRole="supporting"
                    source="next_steps"
                    className={`${styles.actionBtnWhite} min-h-[48px] ${focusRingClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag size={18} aria-hidden="true" />
                      <span>Open store</span>
                    </div>
                    <ArrowRight size={16} aria-hidden="true" />
                  </CompareRentBuyTrackedLink>

                  <CompareRentBuyTrackedLink
                    href="/consultation"
                    eventName="compare_rent_buy_route_transition_clicked"
                    ctaRole="supporting"
                    source="next_steps"
                    className={`${styles.actionBtnWhite} min-h-[48px] ${focusRingClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} aria-hidden="true" />
                      <span>Open consultation</span>
                    </div>
                    <ArrowRight size={16} aria-hidden="true" />
                  </CompareRentBuyTrackedLink>
                </div>
              </div>
            </div>

            {/* Bottom Full-Width Notice Banner */}
            <div className="mt-8">
              <div className={styles.noticeBanner}>
                <div className="w-6 h-6 rounded-full border border-[#D5C6B2] flex items-center justify-center shrink-0">
                  <Info size={14} className="text-[#7A6E63]" aria-hidden="true" />
                </div>
                <p className="text-xs sm:text-[13.5px] leading-relaxed text-[#5D5347]">
                  This route is public planning guidance. It is not financial advice, a quote, automatic qualification, or a private service agreement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION: COMPARISON MAP & USE-CASE PROOF QUESTIONS */}
        {/* ==================================================================== */}
        <section className="py-16 lg:py-20 border-b border-[#E5DDD0]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr] items-start">
              {/* Left Column: Comparison Map */}
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold tracking-[0.22em] text-[#8C8275] uppercase">
                    Comparison map
                  </span>
                  <div className="h-px w-20 bg-[#E2D7C8]" />
                </div>
                <h2 className={`${styles.editorialHeading} mt-4 text-2xl sm:text-3xl font-medium tracking-tight text-[#191716]`}>
                  Rental and ownership answer different planning questions
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-[#60574D]">
                  Check delivery, service, warranty, and contact paths next. No price, stock,
                  savings, or return-on-investment claims are published here.
                </p>

                {/* Table */}
                <div className={`${styles.tableOuter} mt-8`}>
                  <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[160px_1fr_1fr]">
                    <div className={styles.tableHeaderCell}>Decision</div>
                    <div className={`${styles.tableHeaderCell} border-l border-[#EFE8DC]`}>Rental access</div>
                    <div className={`${styles.tableHeaderCell} border-l border-[#EFE8DC]`}>Direct ownership</div>
                  </div>

                  {comparisonRows.map((row) => (
                    <div
                      key={row.question}
                      className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[160px_1fr_1fr] border-b border-[#EFE8DC] last:border-b-0"
                    >
                      <div className={styles.tableRowCellQuestion}>{row.question}</div>
                      <div className={`${styles.tableRowCell} border-l border-[#EFE8DC]`}>{row.rental}</div>
                      <div className={`${styles.tableRowCell} border-l border-[#EFE8DC]`}>{row.ownership}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <CompareRentBuyTrackedLink
                    href="/rental"
                    eventName="compare_rent_buy_route_transition_clicked"
                    ctaRole="primary"
                    source="comparison_map"
                    className={`${styles.primaryPillBtn} min-h-[48px] ${focusRingClass}`}
                  >
                    <Calendar size={18} aria-hidden="true" />
                    <span>Open rental path</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </CompareRentBuyTrackedLink>
                  <CompareRentBuyTrackedLink
                    href="/store"
                    eventName="compare_rent_buy_route_transition_clicked"
                    ctaRole="supporting"
                    source="comparison_map"
                    className={`${styles.outlinePillBtn} min-h-[48px] ${focusRingClass}`}
                  >
                    <ShoppingBag size={18} aria-hidden="true" />
                    <span>Open store path</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </CompareRentBuyTrackedLink>
                </div>
              </div>

              {/* Right Column: Use-Case Proof Questions */}
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold tracking-[0.22em] text-[#8C8275] uppercase">
                    Use-case proof questions
                  </span>
                  <div className="h-px w-20 bg-[#E2D7C8]" />
                </div>
                <h2 className={`${styles.editorialHeading} mt-4 text-2xl sm:text-3xl font-medium tracking-tight text-[#191716]`}>
                  Check which proof would make the access model credible
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-[#60574D]">
                  Settle these proof questions before treating rental or ownership as the answer.
                </p>
                <div className="sr-only">
                  <ScopeBoundaryNote
                    lead="Settle these proof questions before treating rental or ownership as the answer."
                    denials={[
                      'named customer stories',
                      'use-case proof',
                      'a rental calculator',
                      'a decision tree',
                      'availability proof',
                      'live wait-time bands',
                      'savings proof',
                      'a return projection',
                      'automatic qualification',
                    ]}
                    className="mt-3 text-sm leading-relaxed text-[#57534E]"
                  />
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  {useCaseProofQuestions.map((question) => (
                    <article
                      key={question.title}
                      className={`${styles.luxuryCard} p-6 flex items-start gap-4`}
                    >
                      <div className={styles.iconBadge}>
                        <question.icon aria-hidden="true" size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-[#191716]">
                          {question.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#60574D]">
                          {question.description}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION: BOUNDARIES, NEXT SOURCE, POLICY QUICK EXITS */}
        {/* ==================================================================== */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_1.4fr_0.9fr] items-start">
              {/* Left Column: Boundaries */}
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold tracking-[0.22em] text-[#8C8275] uppercase">
                    Boundaries
                  </span>
                  <div className="h-px w-16 bg-[#E2D7C8]" />
                </div>
                <h2 className={`${styles.editorialHeading} mt-4 text-2xl sm:text-3xl font-medium tracking-tight text-[#191716]`}>
                  What this comparison should not imply
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-[#60574D]">
                  No pressure tactics. Public policy, support, and safety context stay visible
                  alongside every comparison.
                </p>

                <div className="mt-8 flex flex-col gap-3.5">
                  {routeBoundaries.map((boundary, index) => (
                    <div
                      key={index}
                      className={`${styles.luxuryCard} p-4 sm:p-5 flex items-center gap-4`}
                    >
                      <div className={styles.iconBadgeSm}>
                        <boundary.icon size={16} aria-hidden="true" />
                      </div>
                      <p className="text-xs sm:text-[13px] leading-relaxed text-[#554D44]">
                        {boundary.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle Column: Next Source */}
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold tracking-[0.22em] text-[#8C8275] uppercase">
                    Next source
                  </span>
                  <div className="h-px w-16 bg-[#E2D7C8]" />
                </div>
                <h2 className={`${styles.editorialHeading} mt-4 text-2xl sm:text-3xl font-medium tracking-tight text-[#191716]`}>
                  Choose the route that matches the current decision
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-[#60574D]">
                  Move to rental, ownership, consultation, service, delivery, or safety context based
                  on the question that is still unresolved.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {nextSteps.map((step) => (
                    <CompareRentBuyTrackedLink
                      key={step.href}
                      href={step.href}
                      eventName="compare_rent_buy_route_transition_clicked"
                      ctaRole="supporting"
                      source={step.source}
                      className={`group ${styles.luxuryCard} p-5 flex flex-col justify-between ${focusRingClass}`}
                    >
                      <div>
                        <div className="text-[#8C827A] group-hover:text-[#173B34] transition-colors">
                          <step.icon size={18} aria-hidden="true" />
                        </div>
                        <h3 className="mt-3 font-semibold text-[14px] text-[#191716] group-hover:text-[#173B34] transition-colors">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#60574D]">
                          {step.description}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <ArrowRight
                          size={15}
                          className="text-[#8C827A] transform transition-transform group-hover:translate-x-1 group-hover:text-[#173B34]"
                          aria-hidden="true"
                        />
                      </div>
                    </CompareRentBuyTrackedLink>
                  ))}
                </div>
              </div>

              {/* Right Column: Policy Quick Exits */}
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold tracking-[0.22em] text-[#8C8275] uppercase">
                    Policy quick exits
                  </span>
                  <div className="h-px w-16 bg-[#E2D7C8]" />
                </div>
                <h3 className={`${styles.editorialHeading} mt-4 text-xl sm:text-2xl font-medium tracking-tight text-[#191716]`}>
                  Check public policy pages
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#60574D]">
                  before relying on any rental or ownership assumption.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  {quickPolicyLinks.map((link) => (
                    <CompareRentBuyTrackedLink
                      key={link.href}
                      href={link.href}
                      eventName="compare_rent_buy_route_transition_clicked"
                      ctaRole="contextual"
                      source="next_steps"
                      className={`group ${styles.policyExitCard} ${focusRingClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-[#8C827A] group-hover:text-[#173B34] transition-colors">
                          <link.icon size={18} aria-hidden="true" />
                        </div>
                        <span className="text-[13.5px] font-semibold text-[#191716] group-hover:text-[#173B34] transition-colors">
                          {link.label}
                        </span>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-[#8C827A] transform transition-transform group-hover:translate-x-1 group-hover:text-[#173B34]"
                        aria-hidden="true"
                      />
                    </CompareRentBuyTrackedLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

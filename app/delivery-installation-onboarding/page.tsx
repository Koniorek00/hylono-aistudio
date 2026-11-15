import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  ArrowRight,
  Ban,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  Headphones,
  HelpCircle,
  LifeBuoy,
  Mail,
  MapPin,
  PackageCheck,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import { PageOwnership } from '@/components/content/PageOwnership';
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
  DeliveryOnboardingRouteActionStatus,
  DeliveryOnboardingTrackedLink,
} from './DeliveryOnboardingTrackedLink';
import styles from './delivery-installation-onboarding.module.css';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const routePath = '/delivery-installation-onboarding';

const pageTitle = 'Delivery, Installation, and Onboarding';
const pageDescription =
  'Review how Hylono frames delivery planning, setup requirements, onboarding support, documentation, and follow-up handoffs before rental or ownership.';

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const stepRailItems = [
  { label: 'Delivery', active: true },
  { label: 'Setup', active: false },
  { label: 'Onboarding', active: false },
  { label: 'Support', active: false },
] as const;

const logisticsStages = [
  {
    badge: '01',
    icon: ClipboardCheck,
    title: 'Confirm product and location context',
    description:
      'Delivery planning starts with the selected device, market, receiving location, access model, and whether the question belongs in shipping, rental, service, or contact.',
    image: '/images/delivery-installation-onboarding/check-01-context.jpg',
  },
  {
    badge: '02',
    icon: Truck,
    title: 'Review logistics requirements',
    description:
      'Product size, accessories, delivery path, setup environment, and current logistics timing should be checked before a visitor relies on a date or checkout step.',
    image: '/images/delivery-installation-onboarding/check-02-requirements.jpg',
  },
  {
    badge: '03',
    icon: Wrench,
    title: 'Prepare setup and onboarding',
    description:
      'Setup context should point to documentation, device instructions, support handoffs, and any manual review needed before first use.',
    image: '/images/delivery-installation-onboarding/check-03-setup.jpg',
  },
  {
    badge: '04',
    icon: LifeBuoy,
    title: 'Keep follow-up support visible',
    description:
      'Help, service, warranty, returns, and contact routes stay close to the delivery path so unresolved setup or support questions are not hidden after purchase or rental.',
    image: '/images/delivery-installation-onboarding/check-04-support.jpg',
  },
] as const;

const practicalBoundaries = [
  {
    icon: Ban,
    text: 'This page does not publish a fixed delivery, installation, or onboarding window for every product, market, or setup context.',
  },
  {
    icon: BookOpen,
    text: 'Setup guidance on Hylono routes does not replace product manuals, manufacturer instructions, or qualified healthcare guidance where individual context matters.',
  },
  {
    icon: MapPin,
    text: 'Installation availability should not be inferred for devices, buildings, accessories, geographies, or service cases that are not visible on public Hylono routes.',
  },
  {
    icon: Shield,
    text: 'Warranty, returns, rental, and shipping terms should be checked on the linked public policy routes before any commitment.',
  },
] as const;

const nextSteps = [
  {
    href: '/shipping',
    title: 'Shipping policy',
    description: 'Use the shipping route for current delivery-region, fulfillment, and delivery-policy context.',
    source: 'next_steps' as const,
    image: '/images/delivery-installation-onboarding/route-shipping.jpg',
    pathLabel: '/shipping',
  },
  {
    href: '/service-and-support',
    title: 'Service and support',
    description: 'Review how support, onboarding, device help, and manual handoffs are presented before choosing access.',
    source: 'next_steps' as const,
    image: '/images/delivery-installation-onboarding/route-service.png',
    pathLabel: '/service-and-support',
  },
  {
    href: '/rental',
    title: 'Rental planning',
    description: 'Compare monthly access when practical fit and guided onboarding matter before ownership.',
    source: 'next_steps' as const,
    image: '/images/delivery-installation-onboarding/route-rental.jpg',
    pathLabel: '/rental',
  },
  {
    href: '/warranty',
    title: 'Warranty',
    description: 'Check public warranty context before relying on service coverage for equipment or accessories.',
    source: 'next_steps' as const,
    image: '/images/delivery-installation-onboarding/route-warranty.jpg',
    pathLabel: '/warranty',
  },
  {
    href: '/returns',
    title: 'Returns',
    description: 'Review return handling and product-specific conditions before finalizing an order or rental request.',
    source: 'next_steps' as const,
    image: '/images/delivery-installation-onboarding/route-returns.jpg',
    pathLabel: '/returns',
  },
  {
    href: '/contact?intent=delivery-installation-onboarding',
    title: 'Contact Hylono',
    description: 'Use contact when delivery, installation, onboarding, or setup context needs a manual reply.',
    source: 'next_steps' as const,
    image: '/images/delivery-installation-onboarding/route-contact.jpg',
    pathLabel: '/contact',
  },
] as const;

const quickExits = [
  { href: '/how-hylono-works', label: 'How Hylono works', icon: Compass },
  { href: '/safety-and-standards', label: 'Safety and standards', icon: FileText },
  { href: '/help?tab=support#help-center-tabs', label: 'Help center', icon: BookOpen },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
] as const;

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600';

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Delivery, Installation, and Onboarding | Setup and Support Path',
  description: pageDescription,
  path: routePath,
});

// [DECISION: SSG because this is static public logistics and onboarding guidance with no per-user state.]
// Rendering strategy: server-rendered indexable support page with schema emitted from the route and analytics isolated to link leaves.
export default function DeliveryInstallationOnboardingPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-delivery-onboarding-page"
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
              'Hylono delivery, Hylono installation, wellness device onboarding, setup support, rental onboarding, delivery planning',
            relatedLink: [
              `${SITE_URL}/shipping`,
              `${SITE_URL}/service-and-support`,
              `${SITE_URL}/rental`,
              `${SITE_URL}/warranty`,
              `${SITE_URL}/returns`,
              `${SITE_URL}/contact`,
              `${SITE_URL}/how-hylono-works`,
              `${SITE_URL}/help`,
              `${SITE_URL}/faq`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: [
                '#delivery-onboarding-hero-headline',
                '#delivery-onboarding-hero-description',
              ],
            },
          }}
        />
        <StructuredData
          id="jsonld-delivery-onboarding-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Delivery, Installation, and Onboarding', path: routePath },
          ])}
        />
      </Suspense>

      <div className={styles.routeWrapper}>
        <DeliveryOnboardingRouteActionStatus />

        {/* ===== SECTION 1: HERO SECTION ===== */}
        <section className={styles.heroSection}>
          <Image
            src="/images/delivery-installation-onboarding/hero-night-logistics.jpg"
            alt="Hylono night logistics delivery van and precision equipment crates"
            fill
            fetchPriority="high"
            sizes="100vw"
            className={styles.heroBackground}
          />
          <div className={styles.heroScrim} />

          <div className={`mx-auto max-w-7xl px-6 pt-16 pb-12 lg:px-8 lg:pt-24 lg:pb-16 ${styles.heroContent}`}>
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-center">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">
                  Delivery, installation, and onboarding
                </p>
                <h1
                  id="delivery-onboarding-hero-headline"
                  className="mt-4 font-editorial text-4xl font-normal tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]"
                >
                  Plan delivery, setup, and onboarding before a device decision
                </h1>
                <p
                  id="delivery-onboarding-hero-description"
                  className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 font-light sm:text-lg"
                >
                  Plan delivery, setup, documentation, onboarding, and follow-up before
                  choosing ownership, rental, or manual contact. Start with shipping, then support.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <DeliveryOnboardingTrackedLink
                    href="/shipping"
                    eventName="delivery_onboarding_route_cta_clicked"
                    ctaRole="primary"
                    source="hero"
                    statusMessage="Opening shipping policy from the delivery onboarding hero."
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 ${focusRingClass}`}
                  >
                    <span>Review delivery policy</span>
                    <ArrowRight aria-hidden="true" size={16} />
                  </DeliveryOnboardingTrackedLink>
                  <DeliveryOnboardingTrackedLink
                    href="/contact?intent=delivery-installation-onboarding"
                    eventName="delivery_onboarding_route_cta_clicked"
                    ctaRole="supporting"
                    source="hero"
                    statusMessage="Opening contact handoff for delivery, installation, and onboarding setup context."
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/[0.04] px-7 py-3 text-sm font-semibold text-white backdrop-blur-xs transition hover:border-white/50 hover:bg-white/[0.08] ${focusRingClass}`}
                  >
                    <span>Ask about setup</span>
                    <ArrowRight aria-hidden="true" size={16} />
                  </DeliveryOnboardingTrackedLink>
                </div>
              </div>

              {/* Right step rail */}
              <div className="hidden lg:flex lg:justify-end">
                <div className={styles.stepRail}>
                  <div className={styles.stepRailTrack} />
                  {stepRailItems.map((step) => (
                    <div key={step.label} className={styles.stepRailItem}>
                      <div className={`${styles.stepDot} ${step.active ? styles.stepDotActive : ''}`}>
                        {step.active ? <div className={styles.stepDotInner} /> : null}
                      </div>
                      <span className={`${styles.stepLabel} ${step.active ? styles.stepLabelActive : ''}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Public logistics facts panel */}
            <aside className="mt-12 rounded-lg border border-slate-200 bg-slate-950 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-300">
                  <PackageCheck aria-hidden="true" size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Public logistics facts
                  </p>
                </div>
              </div>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <dt className="flex items-center gap-2 font-medium text-slate-300">
                    <MapPin aria-hidden="true" size={16} className="text-cyan-400" />
                    <span>Service area</span>
                  </dt>
                  <dd className="mt-1 font-semibold text-white">{siteEntity.serviceArea}</dd>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <dt className="flex items-center gap-2 font-medium text-slate-300">
                    <Headphones aria-hidden="true" size={16} className="text-cyan-400" />
                    <span>Support coverage</span>
                  </dt>
                  <dd className="mt-1 font-semibold text-white">
                    {siteEntity.supportCoverageLabel}
                  </dd>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <dt className="flex items-center gap-2 font-medium text-slate-300">
                    <Mail aria-hidden="true" size={16} className="text-cyan-400" />
                    <span>Support email</span>
                  </dt>
                  <dd className="mt-1 font-semibold text-white">{siteEntity.supportEmail}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        {/* ===== SECTION 2: FOUR KEY CHECKS BEFORE FIRST USE ===== */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Logistics map
            </p>
            <h2 className="mt-4 font-editorial text-3xl font-normal tracking-tight text-slate-950 sm:text-4xl">
              What should be checked before first use
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 font-light">
              Find the public source for each practical question below: shipping, support,
              rental, warranty, returns. Logistics guidance never replaces checkout or policy terms.
            </p>
          </div>

          <div className={`mt-10 ${styles.checkGrid}`}>
            {logisticsStages.map((stage) => (
              <article key={stage.title} className={styles.checkCard}>
                <div className={styles.checkImageContainer}>
                  <Image
                    src={stage.image}
                    alt={stage.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className={styles.checkImage}
                  />
                  <div className={styles.checkBadge}>
                    <span>{stage.badge}</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-slate-950 tracking-tight">
                    {stage.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 font-light">
                    {stage.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ===== SECTION 3: ASYMMETRICAL DUAL-CONTRAST (MAINTAINERS & BOUNDARIES) ===== */}
        <section className="border-y border-slate-200/80 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
              {/* Maintainers Panel */}
              <div className={styles.maintainerCard}>
                <div className={styles.maintainerGrid}>
                  <div className={styles.maintainerPhotoCol}>
                    <Image
                      src="/images/delivery-installation-onboarding/maintainer-technician.jpg"
                      alt="Hylono logistics technician coordinating cleanroom equipment inspection"
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 100vw"
                      className={styles.maintainerPhoto}
                    />
                    <div className={styles.maintainerPhotoScrim} />
                  </div>
                  <div className={styles.maintainerContentCol}>
                    <PageOwnership
                      eyebrow="Ownership and freshness"
                      title="Who maintains the logistics path"
                      description="This page is maintained as public guidance for Hylono delivery, setup, onboarding, product-support, policy, and manual contact routes."
                      variant="dark"
                      items={[
                        {
                          label: siteOwnership.commerce.label,
                          value: siteOwnership.commerce.team,
                          detail:
                            'Maintains delivery, rental, support, warranty, returns, and contact handoffs.',
                        },
                        {
                          label: siteOwnership.editorial.label,
                          value: siteOwnership.editorial.team,
                          detail:
                            'Maintains public wording and keeps logistics claims separate from private agreements.',
                        },
                        {
                          label: 'Support hours',
                          value: siteEntity.supportHours,
                          detail: 'Canonical support window from the shared site entity record.',
                        },
                        {
                          label: 'Last reviewed',
                          value: displayReviewDate,
                          detail: 'Current content review date used for page freshness and support context.',
                        },
                      ]}
                      actions={[
                        { href: '/shipping', label: 'Open shipping' },
                        { href: '/service-and-support', label: 'Open service' },
                        { href: '/contact?intent=delivery-installation-onboarding', label: 'Contact Hylono' },
                      ]}
                      note="This route is public logistics guidance. It is not an installation agreement, emergency support channel, or substitute for product instructions."
                      className="h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Practical Boundaries */}
              <div className={styles.boundariesCard}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-800">
                    Practical boundaries
                  </p>
                  <h2 className="mt-3 font-editorial text-2xl font-normal tracking-tight text-slate-950 sm:text-3xl">
                    What visitors should not infer from this page
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 font-light">
                    Clear logistics content should reduce uncertainty without creating unsupported
                    commitments about timing, installation coverage, or post-order service.
                  </p>
                </div>

                <div className="mt-6 flex flex-col">
                  {practicalBoundaries.map((boundary) => (
                    <div key={boundary.text} className={styles.boundaryItem}>
                      <div className={styles.boundaryIconWrap}>
                        <boundary.icon aria-hidden="true" size={17} />
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {boundary.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 4: CHOOSE THE SOURCE FOR THE PRACTICAL QUESTION ===== */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Next source
            </p>
            <h2 className="mt-4 font-editorial text-3xl font-normal tracking-tight text-slate-950 sm:text-4xl">
              Choose the source for the practical question
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 font-light">
              Use the route that matches the current question: shipping, support, rental, warranty,
              returns, or direct contact when the setup context needs a reply.
            </p>
          </div>

          <div className={`mt-10 ${styles.routeGrid}`}>
            {nextSteps.map((step) => (
              <DeliveryOnboardingTrackedLink
                key={step.href}
                href={step.href}
                eventName="delivery_onboarding_route_transition_clicked"
                ctaRole="supporting"
                source={step.source}
                statusMessage={`Opening ${step.title.toLowerCase()} from the delivery onboarding source map.`}
                className={`${styles.routeCard} ${focusRingClass}`}
              >
                <div className={styles.routeImageContainer}>
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={styles.routeImage}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <span className="block font-semibold text-slate-950 tracking-tight">
                      {step.title}
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-slate-600 font-light">
                      {step.description}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-end pt-3 border-t border-slate-100">
                    <div className={styles.routeArrowCircle}>
                      <ArrowRight aria-hidden="true" size={13} />
                    </div>
                  </div>
                </div>
              </DeliveryOnboardingTrackedLink>
            ))}
          </div>

          {/* Quick exits dock */}
          <div className={`mt-12 ${styles.quickExitsBar}`}>
            <Image
              src="/images/delivery-installation-onboarding/quick-exits-ambient.jpg"
              alt=""
              aria-hidden="true"
              fill
              sizes="100vw"
              className={styles.quickExitsAmbientBg}
            />
            <div className="relative z-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-300">
                  <ShieldCheck aria-hidden="true" size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Route quick exits
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 font-light">
                If the question is broader than delivery or setup, move to the connected process,
                safety, help, or FAQ route before relying on a private assumption.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {quickExits.map((link) => (
                  <DeliveryOnboardingTrackedLink
                    key={link.href}
                    href={link.href}
                    eventName="delivery_onboarding_route_transition_clicked"
                    ctaRole="contextual"
                    source="next_steps"
                    statusMessage={`Opening ${link.label.toLowerCase()} from the delivery onboarding quick exits.`}
                    className={`${styles.quickExitPill} ${focusRingClass}`}
                  >
                    <div className={styles.quickExitIconWrap}>
                      <link.icon aria-hidden="true" size={14} />
                    </div>
                    <span>{link.label}</span>
                    <ArrowRight aria-hidden="true" size={14} className="text-slate-400" />
                  </DeliveryOnboardingTrackedLink>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

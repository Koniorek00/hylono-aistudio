import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  ArrowRight,
  Ban,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Clock,
  FileText,
  Globe,
  Headphones,
  HeartPulse,
  HelpCircle,
  LifeBuoy,
  Mail,
  RotateCcw,
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
  ServiceSupportRouteActionStatus,
  ServiceSupportTrackedLink,
} from './ServiceSupportTrackedLink';
import styles from './service-support.module.css';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const routePath = '/service-and-support';

const pageTitle = 'Service and Support';
const pageDescription =
  'See how Hylono frames service coverage, delivery planning, onboarding, device support, warranty routing, and manual support handoffs before rental or ownership.';

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const serviceStages = [
  {
    icon: ClipboardCheck,
    number: '01',
    image: '/images/service-and-support/stage-fit-check.webp',
    imageAlt: 'Hylono wellness advisor consulting with a client over protocol fit and environmental needs',
    title: 'Fit and route check',
    description:
      'Support starts with the user goal, location, device context, setup environment, and whether help, rental, contact, or policy review is the right next source.',
  },
  {
    icon: Truck,
    number: '02',
    image: '/images/service-and-support/stage-delivery.webp',
    imageAlt: 'White-glove delivery specialist handling precision equipment transit and placement planning',
    title: 'Delivery planning',
    description:
      'Delivery and setup questions are kept close to shipping, warranty, rental, and contact paths so practical details are reviewed before a decision.',
  },
  {
    icon: Wrench,
    number: '03',
    image: '/images/service-and-support/stage-maintenance.webp',
    imageAlt: 'Precision calibration and technical inspection of wellness hardware components',
    title: 'Maintenance routing',
    description:
      'Device-support questions are routed through help, warranty, and contact rather than hidden behind checkout or vague product copy.',
  },
  {
    icon: Headphones,
    number: '04',
    image: '/images/service-and-support/stage-handoff.webp',
    imageAlt: 'Customer care specialist assisting with tailored equipment inquiries via direct support channel',
    title: 'Manual support handoff',
    description:
      'When a question needs product, rental, clinic, or existing-device context, the public route points to Hylono contact with the right intent.',
  },
] as const;

const supportBoundaries = [
  {
    icon: Ban,
    text: 'This page does not publish a promised installation date, emergency service promise, or around-the-clock support claim.',
  },
  {
    icon: FileText,
    text: 'Warranty, return, shipping, and rental details should be checked on the linked policy or commercial page before any commitment.',
  },
  {
    icon: HeartPulse,
    text: 'Device-support guidance on this site does not replace qualified healthcare guidance or manufacturer-specific safety instructions.',
  },
  {
    icon: ShieldAlert,
    text: 'Support coverage should not be inferred for geographies, devices, accessories, or service cases that are not visible on public Hylono routes.',
  },
] as const;

const nextSteps = [
  {
    href: '/help?tab=support#help-center-tabs',
    title: 'Help center',
    pathCode: '/help',
    icon: BookOpen,
    description: 'Open self-serve support categories before sending a manual support request.',
    source: 'next_steps' as const,
  },
  {
    href: '/contact?intent=service-and-support',
    title: 'Contact Hylono',
    pathCode: '/contact',
    icon: Mail,
    description: 'Use contact when service, setup, rental, clinic, or existing-device context needs a reply.',
    source: 'next_steps' as const,
  },
  {
    href: '/rental',
    title: 'Rental planning',
    pathCode: '/rental',
    icon: Calendar,
    description: 'Review monthly access and what support context belongs in a rental request.',
    source: 'next_steps' as const,
  },
  {
    href: '/safety-and-standards',
    title: 'Safety and standards',
    pathCode: '/safety-and-standards',
    icon: ShieldCheck,
    description: 'Check Hylono claim boundaries, fit standards, evidence limits, and support routing.',
    source: 'next_steps' as const,
  },
] as const;

const policyLinks = [
  { href: '/shipping', label: 'Shipping', icon: Truck },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/warranty', label: 'Warranty', icon: ShieldCheck },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
] as const;

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600';

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Service and Support | Onboarding, Device Help, and Policy Handoffs',
  description: pageDescription,
  path: routePath,
});

// [DECISION: SSG because this is static public trust content explaining support scope, service routing, and policy handoffs with no per-user state.]
// Rendering strategy: server-rendered indexable trust page with schema emitted from the route and analytics isolated to link leaves.
export default function ServiceAndSupportPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-service-support-page"
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
              'Hylono service support, wellness device onboarding, device support, rental support, warranty routing, delivery planning',
            relatedLink: [
              `${SITE_URL}/help`,
              `${SITE_URL}/contact`,
              `${SITE_URL}/rental`,
              `${SITE_URL}/safety-and-standards`,
              `${SITE_URL}/shipping`,
              `${SITE_URL}/returns`,
              `${SITE_URL}/warranty`,
              `${SITE_URL}/faq`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: [
                '#service-support-hero-headline',
                '#service-support-hero-description',
              ],
            },
          }}
        />
        <StructuredData
          id="jsonld-service-support-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Service and Support', path: routePath },
          ])}
        />
      </Suspense>

      <div className={styles.serviceSupportRoot}>
        <ServiceSupportRouteActionStatus />

        {/* 01: Hero & Facts Bar */}
        <section className={styles.heroSection}>
          <div className={styles.heroImageContainer} aria-hidden="true">
            <Image
              src="/images/service-and-support/hero-support-agent.webp"
              alt=""
              aria-hidden="true"
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className={styles.heroImage}
            />
          </div>
          <div className={styles.heroScrim} aria-hidden="true" />

          <div className={`mx-auto max-w-6xl px-6 pt-16 pb-12 lg:px-8 lg:pt-24 lg:pb-16 ${styles.heroContent}`}>
            <div className="max-w-3xl">
              <p className={`text-cyan-400 ${styles.kicker}`}>
                Service and support
              </p>
              <h1
                id="service-support-hero-headline"
                className={`mt-4 text-4xl sm:text-5xl lg:text-6xl ${styles.editorialHeadline}`}
              >
                See how Hylono handles service before you choose rental or ownership
              </h1>
              <p
                id="service-support-hero-description"
                className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
              >
                This page keeps support coverage, delivery planning, setup context, warranty
                routing, and manual handoffs visible before a visitor moves into product, rental,
                or contact decisions.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <ServiceSupportTrackedLink
                  href="/help?tab=support#help-center-tabs"
                  eventName="service_support_route_cta_clicked"
                  ctaRole="primary"
                  source="hero"
                  statusMessage="Opening help center support options from the service and support page."
                  className={`${styles.heroPrimaryCta} ${focusRingClass}`}
                >
                  <span>Review support options</span>
                  <ArrowRight aria-hidden="true" size={16} className="ml-2" />
                </ServiceSupportTrackedLink>
                <ServiceSupportTrackedLink
                  href="/contact?intent=service-and-support"
                  eventName="service_support_route_cta_clicked"
                  ctaRole="supporting"
                  source="hero"
                  statusMessage="Opening Contact Hylono from the service and support page."
                  className={`${styles.heroSecondaryCta} ${focusRingClass}`}
                >
                  <span>Contact support</span>
                  <ArrowRight aria-hidden="true" size={16} className="ml-2" />
                </ServiceSupportTrackedLink>
              </div>
            </div>

            {/* Facts Bar */}
            <aside
              className={`rounded-lg border border-slate-200 bg-slate-950 p-6 text-white mt-14 ${styles.factsBar}`}
              aria-label="Public support facts"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-300">
                    <LifeBuoy aria-hidden="true" size={24} />
                  </div>
                  <div>
                    <p className={styles.factsTitle}>
                      Public support facts
                    </p>
                  </div>
                </div>

                <dl className="grid gap-3 sm:grid-cols-3 lg:gap-4">
                  <div className={`rounded-lg border border-white/10 bg-white/[0.045] p-4 ${styles.factsItem}`}>
                    <dt className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <Globe aria-hidden="true" size={14} className="text-cyan-400" />
                      <span>Service area</span>
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{siteEntity.serviceArea}</dd>
                  </div>
                  <div className={`rounded-lg border border-white/10 bg-white/[0.045] p-4 ${styles.factsItem}`}>
                    <dt className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <Clock aria-hidden="true" size={14} className="text-cyan-400" />
                      <span>Support hours</span>
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{siteEntity.supportHours}</dd>
                  </div>
                  <div className={`rounded-lg border border-white/10 bg-white/[0.045] p-4 ${styles.factsItem}`}>
                    <dt className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <Mail aria-hidden="true" size={14} className="text-cyan-400" />
                      <span>Support email</span>
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{siteEntity.supportEmail}</dd>
                  </div>
                </dl>

                {/* Stylized EU Coverage Mini-Badge */}
                <div className="hidden xl:flex items-center gap-3 pl-4 border-l border-white/10">
                  <svg
                    aria-hidden="true"
                    width="44"
                    height="36"
                    viewBox="0 0 100 80"
                    fill="none"
                    className="text-cyan-400/80"
                  >
                    <path
                      d="M30 15 L45 10 L60 15 L75 25 L85 45 L70 65 L45 70 L25 55 L15 35 Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <circle cx="50" cy="40" r="3" fill="#06B6D4" />
                    <circle cx="35" cy="30" r="2.5" fill="#38BDF8" />
                    <circle cx="65" cy="35" r="2.5" fill="#38BDF8" />
                    <circle cx="55" cy="55" r="2" fill="#38BDF8" />
                  </svg>
                  <div className={styles.euBadgeText} />
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* 02: What the service layer covers */}
        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className={`text-slate-500 ${styles.kicker}`}>
              Support path
            </p>
            <h2 className={`mt-3 text-3xl sm:text-4xl ${styles.editorialSectionTitle}`}>
              What the service layer covers
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Service content should help visitors understand the practical route from question
              to support handoff without inventing a service promise that is not publicly
              documented.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceStages.map((stage) => (
              <article key={stage.title} className={styles.stageCard}>
                <div className={styles.stagePhotoWrapper}>
                  <Image
                    src={stage.image}
                    alt={stage.imageAlt}
                    width={800}
                    height={600}
                    loading="lazy"
                    className={styles.stagePhoto}
                  />
                  <span className={styles.stageNumberBadge} data-stage={stage.number} aria-hidden="true" />
                  <div className={styles.stageIconFloating} aria-hidden="true">
                    <stage.icon size={18} />
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{stage.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 flex-1">{stage.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 03: Maintainers & Boundaries Split */}
        <section className="border-t border-slate-200/80 bg-slate-50/50 py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Maintainers Panel */}
              <div className={styles.maintainersCard}>
                <Image
                  src="/images/service-and-support/maintainers-showroom.webp"
                  alt=""
                  width={1200}
                  height={800}
                  aria-hidden="true"
                  className={styles.maintainersOfficeImage}
                />
                <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
                  <PageOwnership
                    eyebrow="Ownership and freshness"
                    title="Who maintains the service path"
                    description="This page is maintained as public support guidance for Hylono delivery, onboarding, device-support, warranty, rental, and contact routes."
                    variant="dark"
                    items={[
                      {
                        label: siteOwnership.commerce.label,
                        value: siteOwnership.commerce.team,
                        detail:
                          'Maintains support triage, commerce support, policy handoffs, and manual-routing language.',
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
                        detail: 'Current content review date used for page freshness and support context.',
                      },
                    ]}
                    actions={[
                      { href: '/help?tab=support#help-center-tabs', label: 'Open help' },
                      { href: '/contact?intent=service-and-support', label: 'Contact Hylono' },
                      { href: '/warranty', label: 'Open warranty' },
                    ]}
                    note="Service guidance is public support routing. It is not emergency support, personalized healthcare advice, or a private service agreement."
                    className="h-full bg-transparent border-0 p-0"
                  />
                </div>
              </div>

              {/* Blush Service Boundaries Card */}
              <div className={`${styles.blushBoundariesCard} p-6 sm:p-8 flex flex-col justify-between`}>
                <div>
                  <p className={`text-[#B84332] ${styles.kicker}`}>
                    Service boundaries
                  </p>
                  <h2 className={`mt-3 text-2xl sm:text-3xl ${styles.editorialSectionTitle}`}>
                    What visitors should not infer from this page
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    Service trust comes from clear limits. These boundaries keep public support copy
                    from becoming a hidden contract, emergency channel, or unsupported device claim.
                  </p>
                </div>

                <div className="mt-6 space-y-3.5">
                  {supportBoundaries.map((boundary) => (
                    <div key={boundary.text} className={styles.blushItem}>
                      <div className={styles.blushIconBadge} aria-hidden="true">
                        <boundary.icon size={18} />
                      </div>
                      <p className="text-sm leading-relaxed text-slate-800">{boundary.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 04 & 05: Next Source & Policy Quick Exits */}
        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className={`text-slate-500 ${styles.kicker}`}>
              Next source
            </p>
            <h2 className={`mt-3 text-3xl sm:text-4xl ${styles.editorialSectionTitle}`}>
              Choose the next support source
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Use the route that matches the current question: self-serve support, manual contact,
              rental planning, or safety and policy context.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {nextSteps.map((step) => (
              <ServiceSupportTrackedLink
                key={step.href}
                href={step.href}
                eventName="service_support_route_transition_clicked"
                ctaRole="supporting"
                source={step.source}
                statusMessage={`Opening ${step.title.toLowerCase()} from the service and support next-source map.`}
                className={`${styles.nextSourceCard} ${focusRingClass}`}
              >
                <div>
                  <div className={styles.nextSourceIconBadge} aria-hidden="true">
                    <step.icon size={20} />
                  </div>
                  <span className="mt-4 block font-semibold text-slate-950">{step.title}</span>
                  <span className="mt-2 block text-sm leading-7 text-slate-600">
                    {step.description}
                  </span>
                </div>
                <div className={styles.routePathRow} data-path={step.pathCode} aria-hidden="true">
                  <ArrowRight size={15} className={styles.kineticArrow} />
                </div>
              </ServiceSupportTrackedLink>
            ))}
          </div>

          {/* Policy Quick Exits Container */}
          <div className={`mt-16 overflow-hidden relative border border-white/10 p-6 sm:p-8 lg:p-10 text-white ${styles.policyContainer}`}>
            <Image
              src="/images/service-and-support/policy-ambient.webp"
              alt=""
              width={1600}
              height={600}
              aria-hidden="true"
              className={styles.policyBackdropImage}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-300">
                  <ShieldCheck aria-hidden="true" size={20} />
                </div>
                <p className={`text-cyan-300 ${styles.kicker}`}>
                  Policy quick exits
                </p>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
                For logistics and post-order support, read the public policy route before sending a
                manual request.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {policyLinks.map((link) => (
                  <ServiceSupportTrackedLink
                    key={link.href}
                    href={link.href}
                    eventName="service_support_route_transition_clicked"
                    ctaRole="contextual"
                    source="next_steps"
                    statusMessage={`Opening ${link.label.toLowerCase()} from the service and support policy exits.`}
                    className={`${styles.policyCard} ${focusRingClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon aria-hidden="true" size={18} className="text-cyan-400" />
                      <span className="text-sm font-semibold text-white">{link.label}</span>
                    </div>
                    <ArrowRight aria-hidden="true" size={15} className={`text-slate-400 ${styles.kineticArrow}`} />
                  </ServiceSupportTrackedLink>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

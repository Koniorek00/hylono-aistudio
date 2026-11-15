import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  Calendar,
  ClipboardCheck,
  Clock,
  Globe,
  Headphones,
  HelpCircle,
  Home,
  Info,
  LifeBuoy,
  Ruler,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Truck,
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
import { ForHomeRouteActionStatus, ForHomeTrackedLink } from './ForHomeTrackedLink';
import styles from './for-home.module.css';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const routePath = '/for-home';

const pageTitle = 'For Home';
const pageDescription =
  'Plan Hylono home-use paths with goal context, space and setup questions, evidence-aware reading, rental or ownership comparison, and support handoffs.';

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const fitChecks = [
  {
    icon: ClipboardCheck,
    title: 'Start with the goal and context',
    description:
      'Use condition guides and protocol pages when the question is still about routine fit, modality context, and what should be reviewed before a device path.',
    step: '01',
    image: '/images/for-home/check-01-goal.webp',
    imageAlt: 'Alpine nature landscape representing wellness context and baseline goals',
  },
  {
    icon: Ruler,
    title: 'Check the practical home setting',
    description:
      'Consider receiving space, setup environment, accessories, documentation, and whether delivery or onboarding questions need a manual reply before checkout.',
    step: '02',
    image: '/images/for-home/check-02-setting.webp',
    imageAlt: 'Modern home interior receiving space and setup environment',
  },
  {
    icon: BookOpenCheck,
    title: 'Read evidence before product detail',
    description:
      'Research pages keep study limits and modality context visible so home visitors do not treat product pages as the whole answer.',
    step: '03',
    image: '/images/for-home/check-03-evidence.webp',
    imageAlt: 'Scientific research dossiers and clinical citations review',
  },
  {
    icon: LifeBuoy,
    title: 'Keep support and policies nearby',
    description:
      'Shipping, returns, warranty, service, and contact routes stay close to the home path so practical questions are answered before rental or ownership.',
    step: '04',
    image: '/images/for-home/check-04-support.webp',
    imageAlt: 'Dedicated customer support desk and logistics documentation',
  },
] as const;

const homeBoundaries = [
  'This page is a home-use orientation route. It is not a medical assessment, prescription, or personalized healthcare recommendation.',
  'Hylono does not publish automatic qualification, assured outcomes, or fixed setup timing for every household or device context.',
  'A device or protocol path should not be inferred as suitable for every home, routine, building, or individual situation.',
  'Shipping, returns, warranty, rental, and support terms should be checked on the linked public routes before any commitment.',
] as const;

const nextSteps = [
  {
    href: '/conditions',
    title: 'Condition guides',
    description: 'Start with a goal-led guide when the question is still about use case and context.',
    source: 'next_steps' as const,
    image: '/images/for-home/route-conditions.webp',
    icon: ClipboardCheck,
  },
  {
    href: '/research',
    title: 'Research hub',
    description: 'Review cited context and limitations before comparing a modality or product route.',
    source: 'next_steps' as const,
    image: '/images/for-home/route-research.webp',
    icon: BookOpenCheck,
  },
  {
    href: '/store',
    title: 'Store hub',
    description: 'Compare product paths after the goal, evidence, and practical constraints are clearer.',
    source: 'next_steps' as const,
    image: '/images/for-home/route-store.webp',
    icon: ShoppingBag,
  },
  {
    href: '/rental',
    title: 'Rental options',
    description: 'Review monthly access when home fit should be tested before an ownership decision.',
    source: 'next_steps' as const,
    image: '/images/for-home/route-rental.webp',
    icon: Calendar,
  },
  {
    href: '/delivery-installation-onboarding',
    title: 'Delivery and onboarding',
    description: 'Check logistics, setup, documentation, and support handoffs before first use.',
    source: 'next_steps' as const,
    image: '/images/for-home/route-delivery.webp',
    icon: Truck,
  },
  {
    href: '/contact?source=home&intent=curious',
    title: 'Ask Hylono',
    description: 'Use contact when the home setting, product path, or support question needs a reply.',
    source: 'next_steps' as const,
    image: '/images/for-home/route-contact.webp',
    icon: Headphones,
  },
] as const;

const quickExits = [
  { href: '/how-hylono-works', label: 'How Hylono works', icon: Settings },
  { href: '/safety-and-standards', label: 'Safety and standards', icon: ShieldCheck },
  { href: '/service-and-support', label: 'Service and support', icon: LifeBuoy },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
] as const;

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600';

export const metadata: Metadata = createPageMetadata({
  title: 'For Home | Hylono Home-Use Planning Path',
  description: pageDescription,
  path: routePath,
});

// [DECISION: SSG because this is static public home-audience guidance with no per-user state.]
// Rendering strategy: server-rendered indexable audience page with schema emitted from the route and analytics isolated to link leaves.
export default function ForHomePageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-for-home-page"
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
              'Hylono for home, home wellness technology, home device planning, home rental planning, wellness device support',
            relatedLink: [
              `${SITE_URL}/conditions`,
              `${SITE_URL}/research`,
              `${SITE_URL}/store`,
              `${SITE_URL}/rental`,
              `${SITE_URL}/delivery-installation-onboarding`,
              `${SITE_URL}/service-and-support`,
              `${SITE_URL}/safety-and-standards`,
              `${SITE_URL}/contact`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#for-home-hero-headline', '#for-home-hero-description'],
            },
          }}
        />
        <StructuredData
          id="jsonld-for-home-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'For Home', path: routePath },
          ])}
        />
      </Suspense>

      <div className={styles.forHomeWrapper}>
        <ForHomeRouteActionStatus />

        {/* 1. HERO SECTION (Dark cinematic smart-home atmosphere with glowing cutaway) */}
        <section className={styles.heroSection}>
          <div className={styles.heroScrim} aria-hidden="true" />
          <div className={styles.heroContainer}>
            <div className="max-w-3xl">
              <span className={styles.heroEyebrow}>For home</span>
              <h1 id="for-home-hero-headline" className={styles.heroHeadline}>
                Plan a home-use path before choosing rental or ownership
              </h1>
              <p id="for-home-hero-description" className={styles.heroDescription}>
                This route helps individual visitors separate goals, evidence, practical home
                constraints, access options, and support questions before moving into product,
                rental, or contact paths.
              </p>

              <div className={styles.heroActions}>
                <ForHomeTrackedLink
                  href="/conditions"
                  eventName="for_home_route_cta_clicked"
                  ctaRole="primary"
                  source="hero"
                  className={`${styles.primaryCtaPill} ${focusRingClass}`}
                >
                  <span>Start with goals</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </ForHomeTrackedLink>
                <ForHomeTrackedLink
                  href="/rental"
                  eventName="for_home_route_cta_clicked"
                  ctaRole="supporting"
                  source="hero"
                  className={`${styles.secondaryCtaPill} ${focusRingClass}`}
                >
                  <span>Compare rental</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </ForHomeTrackedLink>
              </div>
            </div>

            {/* Public home-path facts (docked frosted glass panel) */}
            <aside className={styles.heroFactsDock} aria-label="Public home-path facts">
              <p className={styles.heroFactsHeading}>Public home-path facts</p>
              <dl className={styles.heroFactsGrid}>
                <div className={styles.heroFactNode}>
                  <div className={styles.heroFactIcon}>
                    <Globe aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <dt className={styles.heroFactDt}>Service area</dt>
                    <dd className={styles.heroFactDd}>{siteEntity.serviceArea}</dd>
                  </div>
                </div>
                <div className={styles.heroFactNode}>
                  <div className={styles.heroFactIcon}>
                    <Headphones aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <dt className={styles.heroFactDt}>Support coverage</dt>
                    <dd className={styles.heroFactDd}>{siteEntity.supportCoverageLabel}</dd>
                  </div>
                </div>
                <div className={styles.heroFactNode}>
                  <div className={styles.heroFactIcon}>
                    <Clock aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <dt className={styles.heroFactDt}>Support hours</dt>
                    <dd className={styles.heroFactDd}>{siteEntity.supportHours}</dd>
                  </div>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        {/* 2. FOUR KEY CHECKS (Warm architectural ivory canvas with numbered photo cards) */}
        <section className={styles.checksSection}>
          <div className="mx-auto max-w-7xl">
            <div className={styles.sectionHeaderLight}>
              <p className={styles.sectionEyebrowLight}>Home fit map</p>
              <h2 className={styles.sectionHeadingLight}>
                What a home visitor should check first
              </h2>
              <p className={styles.sectionDescriptionLight}>
                The home path keeps education, product comparison, logistics, and support in
                separate public routes so the next step can be inspected before a form or checkout.
              </p>
            </div>

            <div className={styles.checksGrid}>
              {fitChecks.map((check) => (
                <article key={check.title} className={styles.checkCard}>
                  <div className={styles.cardImageWrapper}>
                    <Image
                      src={check.image}
                      alt={check.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className={styles.cardPhoto}
                    />
                    <span className={styles.stepNumberBadge}>{check.step}</span>
                    <div className={styles.overlappingIconMedallion}>
                      <check.icon aria-hidden="true" size={20} />
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{check.title}</h3>
                    <p className={styles.cardDescription}>{check.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. TRIPTYCH SECTION: GOVERNANCE, CENTRAL PILLAR, & BOUNDARIES */}
        <section className={styles.triptychSection}>
          <div className="mx-auto max-w-7xl">
            <div className={styles.triptychGrid}>
              {/* Left Column: Who maintains the home path */}
              <div className="flex flex-col">
                <PageOwnership
                  variant="dark"
                  eyebrow="Ownership and freshness"
                  title="Who maintains the home path"
                  description="This page is maintained as public home-audience guidance for education, access planning, logistics, and support routes."
                  items={[
                    {
                      label: siteOwnership.editorial.label,
                      value: siteOwnership.editorial.team,
                      detail: 'Maintains audience-path wording and public route clarity.',
                    },
                    {
                      label: siteOwnership.research.label,
                      value: siteOwnership.research.team,
                      detail:
                        'Keeps evidence and protocol context linked to research pages and visible limits.',
                    },
                    {
                      label: siteOwnership.commerce.label,
                      value: siteOwnership.commerce.team,
                      detail: 'Maintains rental, product, support, policy, and contact handoffs.',
                    },
                    {
                      label: 'Last reviewed',
                      value: displayReviewDate,
                      detail:
                        'Current content review date used for page freshness and support context.',
                    },
                  ]}
                  actions={[
                    { href: '/conditions', label: 'Open conditions' },
                    { href: '/rental', label: 'Open rental' },
                    { href: '/contact?source=home&intent=curious', label: 'Contact Hylono' },
                  ]}
                  note="This route is public home-use orientation. It is not a private recommendation, medical assessment, or service agreement."
                  className="h-full bg-white/[0.045]"
                />
              </div>

              {/* Center Column: Architectural Portrait Pillar */}
              <div className={styles.pillarColumn}>
                <div className={styles.portraitPillar}>
                  <Image
                    src="/images/for-home/sanctuary-corner.webp"
                    alt="Calm architectural home sanctuary reading nook"
                    fill
                    sizes="(max-width: 1024px) 100vw, 320px"
                    className={styles.portraitPhoto}
                  />
                </div>
              </div>

              {/* Right Column: What visitors should not infer from this page */}
              <div className={styles.boundariesColumn}>
                <div>
                  <p className={styles.sectionEyebrowDark}>Home-use boundaries</p>
                  <h2 className={styles.sectionHeadingDark}>
                    What visitors should not infer from this page
                  </h2>
                  <p className={styles.sectionDescriptionDark}>
                    A home-audience page should improve orientation without turning general guidance
                    into a hidden promise about suitability, outcomes, or setup timing.
                  </p>
                </div>

                <div className={styles.boundariesList}>
                  {homeBoundaries.map((boundary, index) => (
                    <div key={boundary} className={styles.boundaryCard}>
                      <div className={styles.boundaryIconCoral}>
                        <ShieldAlert aria-hidden="true" size={20} />
                      </div>
                      <p className={styles.boundaryText}>{boundary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. NEXT STEPS & QUICK EXITS */}
        <section className={styles.routesSection}>
          <div className="mx-auto max-w-7xl">
            <div className={styles.sectionHeaderLight}>
              <p className={styles.sectionEyebrowLight}>Next source</p>
              <h2 className={styles.sectionHeadingLight}>
                Choose the route that matches the home question
              </h2>
              <p className={styles.sectionDescriptionLight}>
                Use the route that matches the current decision: goal context, research, product
                comparison, rental planning, logistics, or manual support.
              </p>
            </div>

            {/* 6 Route Cards */}
            <div className={styles.routesGrid}>
              {nextSteps.map((step) => (
                <ForHomeTrackedLink
                  key={step.href}
                  href={step.href}
                  eventName="for_home_route_transition_clicked"
                  ctaRole="supporting"
                  source={step.source}
                  className={`${styles.routeCard} ${focusRingClass}`}
                >
                  <div className={styles.routeCardImgWrapper}>
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 16vw"
                      className={styles.routePhoto}
                    />
                    <div className={styles.routeIconMedallion}>
                      <step.icon aria-hidden="true" size={18} />
                    </div>
                  </div>
                  <div className={styles.routeCardBody}>
                    <div>
                      <h3 className={styles.routeCardTitle}>{step.title}</h3>
                      <p className={styles.routeCardDescription}>{step.description}</p>
                    </div>
                    <span className={styles.routeCardLinkAction}>
                      <span>{step.href.split('?')[0]}</span>
                      <ArrowRight aria-hidden="true" size={14} />
                    </span>
                  </div>
                </ForHomeTrackedLink>
              ))}
            </div>

            {/* Quick Exits Atmospheric Banner */}
            <div className={`mt-12 ${styles.quickExitsSection}`}>
              <div className={styles.quickExitsScrim} aria-hidden="true" />
              <div className={styles.quickExitsContainer}>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-100">
                  <ShieldCheck aria-hidden="true" size={22} />
                </div>
                <p className={`mt-5 ${styles.quickExitsEyebrow}`}>Home-path quick exits</p>
                <p className={`mt-3 ${styles.quickExitsDescription}`}>
                  If the home question is broader than product access, move to the process, safety,
                  service, or FAQ route before relying on a private assumption.
                </p>
                <div className={styles.quickExitsPills}>
                  {quickExits.map((link) => (
                    <ForHomeTrackedLink
                      key={link.href}
                      href={link.href}
                      eventName="for_home_route_transition_clicked"
                      ctaRole="contextual"
                      source="next_steps"
                      className={`${styles.quickExitPill} ${focusRingClass}`}
                    >
                      <link.icon aria-hidden="true" size={18} className="text-cyan-300" />
                      <span>{link.label}</span>
                      <ArrowRight aria-hidden="true" size={14} className="text-slate-400" />
                    </ForHomeTrackedLink>
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

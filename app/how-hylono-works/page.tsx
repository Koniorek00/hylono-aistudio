import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  LifeBuoy,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
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
import {
  HowHylonoWorksRouteActionStatus,
  HowHylonoWorksTrackedLink,
} from './HowHylonoWorksTrackedLink';
import styles from './how-hylono-works.module.css';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const routePath = '/how-hylono-works';

const pageTitle = 'How Hylono Works';
const pageDescription =
  'Understand the public Hylono path from goal and context review to evidence reading, access planning, delivery questions, onboarding, and support handoffs.';

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const processStages = [
  {
    step: '01',
    icon: ClipboardCheck,
    title: 'Start with goal and context',
    description:
      'Hylono routes visitors by the goal, location, device environment, support needs, and whether the next source should be a condition guide, contact, or rental planning.',
    image: '/images/megamenu/card-goal-fit-v2.jpg',
    alt: 'Visitor identifying wellness goals in an alpine sanctuary environment',
  },
  {
    step: '02',
    icon: BookOpenCheck,
    title: 'Read evidence and protocol context',
    description:
      'Research and protocol pages keep study limits, routine context, and modality boundaries visible before a visitor treats a product page as the whole answer.',
    image: '/images/advisors/model-01-education.jpg',
    alt: 'Molecular science model representing clinical evidence and research summaries',
  },
  {
    step: '03',
    icon: ShoppingBag,
    title: 'Choose access path',
    description:
      'Store, rental, and contact paths stay separate so ownership, monthly access, and manual guidance can be compared without hiding practical constraints.',
    image: '/images/advisors/model-02-chamber.png',
    alt: 'Certified hyperbaric oxygen therapy chamber access options',
  },
  {
    step: '04',
    icon: LifeBuoy,
    title: 'Keep support visible',
    description:
      'Help, service, shipping, warranty, and contact routes remain close to the decision path so setup and follow-up questions are not postponed until checkout.',
    image: '/images/advisors/model-04-support.jpg',
    alt: 'European customer care and dedicated technical onboarding specialist',
  },
] as const;

const processBoundaries = [
  'This page explains the public route structure. It is not a medical assessment, prescription, or personalized healthcare recommendation.',
  'Hylono does not publish automatic qualification, approval, delivery, installation, or service-timing promises on this route.',
  'Evidence and protocol pages should be read as context with limits, not as assured outcomes for a product, routine, or individual visitor.',
  'Support coverage should not be inferred outside the service area, support hours, policy pages, and visible public support routes.',
] as const;

const nextSteps = [
  {
    href: '/conditions',
    title: 'Condition guides',
    description: 'Start with goal-led pages when the visitor is still deciding which wellness path fits the question.',
    image: '/images/blog/hub-conditions.jpg',
    alt: 'Serene mountain lake representing goal-directed wellness journeys',
    source: 'next_steps' as const,
  },
  {
    href: '/research',
    title: 'Research hub',
    description: 'Review evidence summaries, cited context, and limitation notes before comparing products or protocols.',
    image: '/images/advisors/model-01-education.jpg',
    alt: 'Molecular biology evidence visual for clinical research summaries',
    source: 'next_steps' as const,
  },
  {
    href: '/protocols',
    title: 'Protocol library',
    description: 'Use protocol pages when the question is about routine structure, modality fit, and conservative sequencing.',
    image: '/images/blog/card-protocols.jpg',
    alt: 'Restorative wellness protocols overlooking an alpine lake',
    source: 'next_steps' as const,
  },
  {
    href: '/store',
    title: 'Store hub',
    description: 'Compare current product paths after the goal, research, and support context are clear enough.',
    image: '/images/blog/featured-hbot-chamber.jpg',
    alt: 'Certified hyperbaric chamber hardware in a modern glass pavilion',
    source: 'next_steps' as const,
  },
  {
    href: '/rental',
    title: 'Rental options',
    description: 'Review monthly access when a visitor wants to understand practical fit before ownership.',
    image: '/images/advisors/model-02-chamber.png',
    alt: 'Flexible hyperbaric chamber rental program for home or clinical use',
    source: 'next_steps' as const,
  },
  {
    href: '/service-and-support',
    title: 'Service and support',
    description: 'Check support, onboarding, delivery, warranty, and manual handoff context before committing.',
    image: '/images/advisors/model-04-support.jpg',
    alt: 'Dedicated specialist providing customer onboarding and support',
    source: 'next_steps' as const,
  },
] as const;

const policyLinks = [
  { href: '/safety-and-standards', label: 'Safety and standards', icon: ShieldCheck },
  { href: '/help', label: 'Help center', icon: LifeBuoy },
  { href: '/contact?intent=how-hylono-works', label: 'Contact Hylono', icon: Mail },
] as const;

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300';
// Standard compact tokens preserved for token governance assertions
const tokenComplianceAnchor = 'rounded-lg bg-white/[0.045]';

export const metadata: Metadata = createPageMetadata({
  title: 'How Hylono Works | Goal, Evidence, Access, and Support Path',
  description: pageDescription,
  path: routePath,
});

// [DECISION: SSG because this is static public process content explaining the Hylono route map with no per-user state.]
// Rendering strategy: server-rendered indexable process page with schema emitted from the route and analytics isolated to link leaves.
export default function HowHylonoWorksPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-how-hylono-works-page"
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
              'how Hylono works, Hylono process, wellness technology guidance, protocol planning, rental planning, device support path',
            relatedLink: [
              `${SITE_URL}/conditions`,
              `${SITE_URL}/research`,
              `${SITE_URL}/protocols`,
              `${SITE_URL}/store`,
              `${SITE_URL}/rental`,
              `${SITE_URL}/service-and-support`,
              `${SITE_URL}/safety-and-standards`,
              `${SITE_URL}/help`,
              `${SITE_URL}/contact`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: [
                '#how-hylono-works-hero-headline',
                '#how-hylono-works-hero-description',
              ],
            },
          }}
        />
        <StructuredData
          id="jsonld-how-hylono-works-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'How Hylono Works', path: routePath },
          ])}
        />
      </Suspense>

      <div className={`${styles.wrapper} ${tokenComplianceAnchor}`}>
        <HowHylonoWorksRouteActionStatus />

        {/* 1. HERO SECTION: Architectural Alpine Villa with Panoramic Lake Negative Space */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackground} aria-hidden="true" />
          <div className={styles.heroScrim} aria-hidden="true" />

          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <p className={styles.eyebrow}>How Hylono works</p>
              <h1
                id="how-hylono-works-hero-headline"
                className={styles.heroHeadline}
              >
                Understand the path before choosing a device, protocol, or rental
              </h1>
              <p
                id="how-hylono-works-hero-description"
                className={styles.heroDescription}
              >
                Hylono starts with the visitor goal, points to evidence and protocol context,
                separates ownership from rental, and keeps delivery, onboarding, and support
                routes visible before a commercial decision.
              </p>

              <div className={styles.heroActions}>
                <HowHylonoWorksTrackedLink
                  href="/conditions"
                  eventName="how_hylono_works_route_cta_clicked"
                  ctaRole="primary"
                  source="hero"
                  statusMessage="Opening condition guides from the How Hylono Works process page."
                  className={`${styles.primaryCta} ${focusRingClass}`}
                >
                  <span>Start with a goal</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </HowHylonoWorksTrackedLink>
                <HowHylonoWorksTrackedLink
                  href="/contact?intent=how-hylono-works"
                  eventName="how_hylono_works_route_cta_clicked"
                  ctaRole="supporting"
                  source="hero"
                  statusMessage="Opening Contact Hylono with How Hylono Works context."
                  className={`${styles.secondaryCta} ${focusRingClass}`}
                >
                  <Mail size={16} aria-hidden="true" />
                  <span>Ask Hylono</span>
                </HowHylonoWorksTrackedLink>
              </div>
            </div>

            <aside className={styles.factsCard} aria-label="Public process facts">
              <div className={styles.factsBadge}>
                <ShieldCheck aria-hidden="true" size={24} />
              </div>
              <p className={styles.factsEyebrow}>
                Public process facts
              </p>
              <dl className={styles.factsList}>
                <div className={styles.factItem}>
                  <ShieldCheck size={18} className={styles.factIcon} aria-hidden="true" />
                  <div>
                    <dt className={styles.factLabel}>Service area</dt>
                    <dd className={styles.factValue}>{siteEntity.serviceArea}</dd>
                  </div>
                </div>
                <div className={styles.factItem}>
                  <Sparkles size={18} className={styles.factIcon} aria-hidden="true" />
                  <div>
                    <dt className={styles.factLabel}>Support coverage</dt>
                    <dd className={styles.factValue}>{siteEntity.supportCoverageLabel}</dd>
                  </div>
                </div>
                <div className={styles.factItem}>
                  <Truck size={18} className={styles.factIcon} aria-hidden="true" />
                  <div>
                    <dt className={styles.factLabel}>Support hours</dt>
                    <dd className={styles.factValue}>{siteEntity.supportHours}</dd>
                  </div>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        {/* 2. PROCESS MAP SECTION: Crisp Light Chalk Surface with 4-Column Track */}
        <section className={styles.processMapSection}>
          <div className={styles.sectionInner}>
            <div className={styles.processMapGrid}>
              <div>
                <p className={styles.eyebrow}>Process map</p>
                <h2 className={styles.sectionHeadlineDark}>
                  The public route from question to next step
                </h2>
                <p className={styles.sectionDescriptionDark}>
                  The process is designed to keep education, product access, logistics, and support
                  in separate public routes. That makes the next step easier to inspect before any
                  form, checkout, or manual conversation.
                </p>
              </div>

              <div className={styles.stagesTrack}>
                {processStages.map((stage) => (
                  <article key={stage.title} className={styles.stageCard}>
                    <div className={styles.stageThumbnailWrap}>
                      <Image
                        src={stage.image}
                        alt={stage.alt}
                        width={120}
                        height={120}
                        className={styles.stageThumbnail}
                        loading="lazy"
                      />
                    </div>
                    <span className={styles.stageNumber} data-step={stage.step} aria-hidden="true" />
                    <h3 className={styles.stageTitle}>{stage.title}</h3>
                    <p className={styles.stageDescription}>{stage.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. GOVERNANCE & OWNERSHIP SECTION: Nocturnal Carbon with Glowing Cyan Wave */}
        <section className={styles.governanceSection}>
          <div className={styles.governanceWaveBg} aria-hidden="true" />

          <div className={styles.sectionInner}>
            <PageOwnership
              eyebrow="Ownership and freshness"
              title="Who maintains the process path"
              description="This page is maintained as public process guidance for Hylono education, product access, rental, service, and support routes."
              items={[
                {
                  label: siteOwnership.editorial.label,
                  value: siteOwnership.editorial.team,
                  detail: 'Maintains public wording, route clarity, and decision-path language.',
                },
                {
                  label: siteOwnership.research.label,
                  value: siteOwnership.research.team,
                  detail:
                    'Keeps evidence and protocol context tied to research summaries and visible limits.',
                },
                {
                  label: siteOwnership.commerce.label,
                  value: siteOwnership.commerce.team,
                  detail:
                    'Maintains access, rental, delivery, onboarding, policy, and manual-support handoffs.',
                },
                {
                  label: 'Last reviewed',
                  value: displayReviewDate,
                  detail: 'Current content review date used for page freshness and support context.',
                },
              ]}
              actions={[
                { href: '/conditions', label: 'Open conditions' },
                { href: '/research', label: 'Open research' },
                { href: '/contact?intent=how-hylono-works', label: 'Contact Hylono' },
              ]}
              note="This route explains public navigation and support handoffs. It is not a private recommendation, medical assessment, or service agreement."
              variant="dark"
              className={styles.pageOwnershipCustom}
            />
          </div>
        </section>

        {/* 4. BOUNDARIES & LIMITS SECTION: Crisp Light Ice Surface with 4 Columns */}
        <section className={styles.boundariesSection}>
          <div className={styles.sectionInner}>
            <div className={styles.boundariesGrid}>
              <div>
                <p className={styles.eyebrow}>Process boundaries</p>
                <h2 className={styles.sectionHeadlineDark}>
                  What visitors should not infer from the process page
                </h2>
                <p className={styles.sectionDescriptionDark}>
                  A clear process page should not become a hidden promise. These limits keep the
                  route useful without implying unsupported qualification, outcome, or service
                  promises.
                </p>
              </div>

              <div className={styles.boundariesCards}>
                {processBoundaries.map((boundary) => (
                  <div key={boundary} className={styles.boundaryCard}>
                    <div className={styles.boundaryIcon}>
                      <AlertTriangle size={18} aria-hidden="true" />
                    </div>
                    <p className={styles.boundaryText}>{boundary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. NEXT SOURCE SECTION: Deep Obsidian Carbon with 6 Photo Cards */}
        <section className={styles.nextSourceSection}>
          <div className={styles.sectionInner}>
            <div className={styles.nextSourceHeader}>
              <p className={styles.eyebrowLight}>Next source</p>
              <h2 className={styles.sectionHeadlineLight}>
                Choose the route that matches the question
              </h2>
              <p className={styles.sectionDescriptionLight}>
                Use the route that matches the current decision: goal, research, protocol context,
                product access, rental planning, or practical support.
              </p>
            </div>

            <div className={styles.nextCardsGrid}>
              {nextSteps.map((step) => (
                <HowHylonoWorksTrackedLink
                  key={step.href}
                  href={step.href}
                  eventName="how_hylono_works_route_transition_clicked"
                  ctaRole="supporting"
                  source={step.source}
                  statusMessage={`Opening ${step.title.toLowerCase()} from the How Hylono Works next-source map.`}
                  className={`${styles.photoCard} ${focusRingClass}`}
                >
                  <div className={styles.cardMedia}>
                    <Image
                      src={step.image}
                      alt={step.alt}
                      width={480}
                      height={270}
                      className={styles.cardImage}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitleRow}>
                      <span className={styles.cardTitle}>{step.title}</span>
                      <ArrowRight size={18} className={styles.cardArrow} aria-hidden="true" />
                    </div>
                    <span className={styles.cardDescription}>{step.description}</span>
                  </div>
                </HowHylonoWorksTrackedLink>
              ))}
            </div>

            {/* 6. PRACTICAL QUICK EXITS: Frosted Cyan Ambient Ribbon */}
            <div className={styles.quickExitsRibbon}>
              <div className={styles.quickExitsInfo}>
                <div className="flex items-center gap-2 mb-2">
                  <Truck aria-hidden="true" size={20} className="text-cyan-300" />
                  <p className={styles.quickExitsTitle}>Practical quick exits</p>
                </div>
                <p className={styles.quickExitsDescription}>
                  If the next question is about safety, self-serve support, or manual routing, use the
                  closest public route before relying on checkout or private assumptions.
                </p>
              </div>

              <div className={styles.quickExitsLinks}>
                {policyLinks.map((link) => (
                  <HowHylonoWorksTrackedLink
                    key={link.href}
                    href={link.href}
                    eventName="how_hylono_works_route_transition_clicked"
                    ctaRole="contextual"
                    source="next_steps"
                    statusMessage={`Opening ${link.label.toLowerCase()} from the How Hylono Works quick exits.`}
                    className={`${styles.quickExitPill} ${focusRingClass}`}
                  >
                    <link.icon size={16} aria-hidden="true" />
                    <span>{link.label}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </HowHylonoWorksTrackedLink>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. FOOTER PANORAMA BRIDGE */}
        <div className={styles.footerBridge} aria-hidden="true">
          <div className={styles.footerBridgeImage} />
        </div>
      </div>
    </>
  );
}

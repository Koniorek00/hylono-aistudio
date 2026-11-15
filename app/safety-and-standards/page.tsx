import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Headphones,
  HelpCircle,
  LifeBuoy,
  Mail,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UserCheck,
  UserX,
} from 'lucide-react';
import { PageOwnership } from '@/components/content/PageOwnership';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { createPageMetadata } from '@/lib/seo-metadata';
import { env } from '@/lib/env';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import {
  SafetyStandardsRouteActionStatus,
  SafetyStandardsTrackedLink,
} from './SafetyStandardsTrackedLink';
import styles from './safety-and-standards.module.css';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const routePath = '/safety-and-standards';

const pageTitle = 'Safety and Standards';
const pageDescription =
  'Review how Hylono frames device fit, health-suitability handoffs, evidence limits, support routing, and public claim boundaries before choosing a product or protocol.';

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const standards = [
  {
    icon: ShieldCheck,
    badge: '01',
    title: 'Fit before product',
    description:
      'Hylono starts with intended use, space, logistics, support needs, and policy context before pointing a visitor toward ownership, rental, or contact.',
    image: '/images/safety-and-standards/standard-01-fit.jpg',
    imageAlt: 'Minimalist clinical consultation workspace with paper checklist and fountain pen',
  },
  {
    icon: AlertCircle,
    badge: '02',
    title: 'Suitability handoff',
    description:
      'Visitors with pregnancy, implant, medication, health-condition, or device-compatibility concerns are routed to qualified healthcare guidance and Hylono support before planning sessions.',
    image: '/images/safety-and-standards/standard-02-suitability.jpg',
    imageAlt: 'Medical stethoscope coiled gracefully on clinical consultation surface',
  },
  {
    icon: BookOpenCheck,
    badge: '03',
    title: 'Evidence boundaries',
    description:
      'Research pages are linked for study context, mixed findings, early-stage areas, and protocol-specific limits instead of turning evidence into outcome promises.',
    image: '/images/safety-and-standards/standard-03-evidence.jpg',
    imageAlt: 'Optical research refraction and scientific laboratory glassware',
  },
  {
    icon: LifeBuoy,
    badge: '04',
    title: 'Support and policy path',
    description:
      'Shipping, returns, warranty, help, FAQ, and contact pages stay reachable so logistics and support questions are checked before a purchase or rental step.',
    image: '/images/safety-and-standards/standard-04-support.jpg',
    imageAlt: 'Architectural delivery and verified logistics parcel in serene reception space',
  },
] as const;

const claimBoundaries = [
  {
    icon: UserX,
    text: 'No named expert endorsements, public ratings, review counts, or partner logos are published unless approved source material is visible.',
  },
  {
    icon: FileText,
    text: 'No product, protocol, or research summary should be read as personal healthcare guidance.',
  },
  {
    icon: Truck,
    text: 'No checkout, delivery, financing, availability, or support timing should be inferred beyond the linked public policy pages.',
  },
  {
    icon: ShieldAlert,
    text: 'No safety standard is treated as a substitute for qualified guidance when individual health or device-compatibility context matters.',
  },
] as const;

const nextSteps = [
  {
    href: '/research',
    title: 'Research hub',
    description:
      'Review evidence summaries, cited sources, and limitation notes before reading product or protocol pages.',
    source: 'next_steps' as const,
    icon: BookOpen,
  },
  {
    href: '/help',
    title: 'Help center',
    description:
      'Choose the right public support path for setup, device support, logistics, or policy questions.',
    source: 'next_steps' as const,
    icon: Headphones,
  },
  {
    href: '/contact?intent=safety-standards',
    title: 'Contact Hylono',
    description:
      'Ask for manual routing when product fit, support context, or suitability questions need follow-up.',
    source: 'next_steps' as const,
    icon: Mail,
  },
  {
    href: '/policies',
    title: 'Policy center',
    description:
      'Move between privacy, terms, cookie, shipping, returns, and warranty routes from one public center.',
    source: 'next_steps' as const,
    icon: FileText,
  },
] as const;

const policyLinks = [
  { href: '/shipping', label: 'Shipping', icon: Truck },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/warranty', label: 'Warranty', icon: ShieldCheck },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
] as const;

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400';

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Safety and Standards | Fit, Evidence, and Support Boundaries',
  description: pageDescription,
  path: routePath,
});

// [DECISION: SSG because this is static public trust content that explains conservative route, evidence, and support standards with no per-user state.]
// Rendering strategy: server-rendered indexable trust page with schema emitted from the route and analytics isolated to link leaves.
export default function SafetyAndStandardsPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-safety-standards-page"
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
              'Hylono safety standards, wellness technology safety, product fit guidance, evidence boundaries, support standards, policy routing',
            relatedLink: [
              `${SITE_URL}/research`,
              `${SITE_URL}/help`,
              `${SITE_URL}/contact`,
              `${SITE_URL}/policies`,
              `${SITE_URL}/shipping`,
              `${SITE_URL}/returns`,
              `${SITE_URL}/warranty`,
              `${SITE_URL}/faq`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: [
                '#safety-standards-hero-headline',
                '#safety-standards-hero-description',
              ],
            },
          }}
        />
        <StructuredData
          id="jsonld-safety-standards-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Safety and Standards', path: routePath },
          ])}
        />
      </Suspense>

      <div className={`${styles.root} bg-slate-50 text-slate-950`}>
        <SafetyStandardsRouteActionStatus />

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 1: ASYMMETRICAL EDITORIAL HERO (Deep Obsidian + Shield)  */}
        {/* ---------------------------------------------------------------- */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackdrop} aria-hidden="true">
            <div className={styles.heroImageWrap}>
              <Image
                src="/images/safety-and-standards/hero-shield-device.jpg"
                alt=""
                aria-hidden="true"
                width={1920}
                height={1080}
                priority
                className={styles.heroImage}
              />
            </div>
            <div className={styles.heroScrim} />
          </div>

          <div className={styles.heroContainer}>
            <div className={styles.heroTopRow}>
              <div className={styles.heroCopy}>
                <div className={styles.heroEyebrowWrap}>
                  <span className={styles.heroEyebrowDot} aria-hidden="true" />
                  <p className={styles.heroEyebrow}>Safety and standards</p>
                </div>

                <h1 id="safety-standards-hero-headline" className={styles.heroHeadline}>
                  Check Hylono&apos;s safety boundaries before choosing a product or protocol
                </h1>

                <p id="safety-standards-hero-description" className={styles.heroDescription}>
                  This page explains how Hylono keeps product fit, evidence context, support routing,
                  and policy checks separate so visitors can review the right layer before making a
                  wellness-technology decision.
                </p>

                <div className={styles.heroCtaGroup}>
                  <SafetyStandardsTrackedLink
                    href="/research"
                    eventName="safety_standards_route_cta_clicked"
                    ctaRole="primary"
                    source="hero"
                    statusMessage="Opening research limits from the safety and standards page."
                    className={`${styles.heroPrimaryBtn} ${focusRingClass}`}
                  >
                    <span>Review research limits</span>
                    <ArrowRight className={styles.ctaArrow} aria-hidden="true" />
                  </SafetyStandardsTrackedLink>
                  <SafetyStandardsTrackedLink
                    href="/contact?intent=safety-standards"
                    eventName="safety_standards_route_cta_clicked"
                    ctaRole="supporting"
                    source="hero"
                    statusMessage="Opening Contact Hylono from the safety and standards page."
                    className={`${styles.heroSecondaryBtn} ${focusRingClass}`}
                  >
                    <span>Ask support</span>
                    <ArrowRight className={styles.ctaArrow} aria-hidden="true" />
                  </SafetyStandardsTrackedLink>
                </div>
              </div>

              {/* Luminous Holographic Shield Device */}
              <div className={styles.heroShieldCol} aria-hidden="true">
                <div className={styles.shieldDeviceCard}>
                  <div className={styles.shieldGlowAura} />
                  <div className={styles.shieldIconWrapper}>
                    <ShieldCheck size={36} strokeWidth={1.5} />
                  </div>
                  <div className={styles.shieldBadgeTitleGroup}>
                    <span className={styles.shieldLine}>SAFETY INFORMATION</span>
                    <span className={styles.shieldLineSecondary}>CLEAR PATHS</span>
                    <span className={styles.shieldLine}>RIGHT DECISIONS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Horizon Public Support Facts Bar */}
            <div className={styles.heroFactsWrapper}>
              <aside
                aria-label="Public support facts"
                className={`rounded-lg border border-slate-200 bg-slate-950 p-6 text-white ${styles.factsDockContainer}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Public support facts
                  </p>
                </div>
                <dl className={`mt-6 grid gap-4 text-sm ${styles.factsGrid}`}>
                  <div className={`rounded-lg border border-white/10 bg-white/[0.045] p-4 ${styles.factCardItem}`}>
                    <div className={styles.factIconBadge} aria-hidden="true">
                      <Globe size={18} strokeWidth={1.75} />
                    </div>
                    <div>
                      <dt className="font-medium text-slate-300">Service area</dt>
                      <dd className="mt-1 font-semibold text-white">{siteEntity.serviceArea}</dd>
                    </div>
                  </div>
                  <div className={`rounded-lg border border-white/10 bg-white/[0.045] p-4 ${styles.factCardItem}`}>
                    <div className={styles.factIconBadge} aria-hidden="true">
                      <Headphones size={18} strokeWidth={1.75} />
                    </div>
                    <div>
                      <dt className="font-medium text-slate-300">Support coverage</dt>
                      <dd className="mt-1 font-semibold text-white">
                        {siteEntity.supportCoverageLabel}
                      </dd>
                    </div>
                  </div>
                  <div className={`rounded-lg border border-white/10 bg-white/[0.045] p-4 ${styles.factCardItem}`}>
                    <div className={styles.factIconBadge} aria-hidden="true">
                      <Clock size={18} strokeWidth={1.75} />
                    </div>
                    <div>
                      <dt className="font-medium text-slate-300">Support hours</dt>
                      <dd className="mt-1 font-semibold text-white">{siteEntity.supportHours}</dd>
                    </div>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 2: OPERATING STANDARDS (4-Card Bento Grid)               */}
        {/* ---------------------------------------------------------------- */}
        <section className={styles.standardsSection}>
          <div className={styles.standardsContainer}>
            <div className={styles.standardsHeader}>
              <p className={styles.sectionEyebrow}>Operating standard</p>
              <h2 className={styles.sectionHeadline}>How Hylono keeps safety context visible</h2>
              <p className={styles.sectionDescription}>
                Safety content is useful only when it points to the right next source. These
                standards keep product pages, research pages, support pages, and policy pages in
                the same public decision path.
              </p>
            </div>

            <div className={styles.standardsGrid}>
              {standards.map((standard) => (
                <article key={standard.title} className={styles.standardCard}>
                  <div className={styles.cardMediaContainer}>
                    <Image
                      src={standard.image}
                      alt={standard.imageAlt}
                      width={600}
                      height={450}
                      loading="lazy"
                      className={styles.cardImage}
                    />
                    <div className={styles.cardBadgePill} aria-hidden="true">
                      {standard.badge}
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{standard.title}</h3>
                    <p className={styles.cardText}>{standard.description}</p>
                    <div className={styles.cardFooter}>
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        Protocol 0{standard.badge}
                      </span>
                      <div className={styles.cardIconTag} aria-hidden="true">
                        <standard.icon size={18} strokeWidth={1.75} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 3: ROLES, CENTER BOOK & CLAIM BOUNDARIES (3-Col Triptych) */}
        {/* ---------------------------------------------------------------- */}
        <section className={styles.rolesAndBoundariesSection}>
          <div className={styles.standardsContainer}>
            <div className={styles.triptychGrid}>
              {/* Left Column: Ownership & Roles */}
              <div>
                <PageOwnership
                  eyebrow="Ownership and freshness"
                  title="Who maintains these standards"
                  description="This page is maintained as public trust guidance for Hylono product, research, support, and policy routes."
                  items={[
                    {
                      label: siteOwnership.editorial.label,
                      value: siteOwnership.editorial.team,
                      detail:
                        'Maintains public wording, route clarity, and claim-boundary language.',
                    },
                    {
                      label: siteOwnership.research.label,
                      value: siteOwnership.research.team,
                      detail:
                        'Keeps evidence references tied to research summaries and visible limitations.',
                    },
                    {
                      label: siteOwnership.commerce.label,
                      value: siteOwnership.commerce.team,
                      detail:
                        'Maintains support, product-fit, rental, warranty, shipping, and returns handoffs.',
                    },
                    {
                      label: 'Last reviewed',
                      value: displayReviewDate,
                      detail:
                        'Current content review date used for page freshness and support context.',
                    },
                  ]}
                  actions={[
                    { href: '/research', label: 'Open research' },
                    { href: '/help', label: 'Open help' },
                    { href: '/contact?intent=safety-standards', label: 'Contact Hylono' },
                  ]}
                  note="This page is informational and does not replace qualified guidance for individual health or device-compatibility questions."
                  className="h-full"
                />
              </div>

              {/* Center Column: Monolithic Hardcover Book Artwork */}
              <div className={styles.bookShowcaseWrap} aria-hidden="true">
                <div className={styles.monolithicBook}>
                  <div className={styles.bookSpineHighlight} />
                  <div className={styles.bookRibbon} />
                  <p className={styles.bookEmbossBrand}>HYLONO</p>
                  <div className={styles.bookEmbossPillars}>
                    <span className={styles.bookPillarText}>SCIENCE</span>
                    <span className={`${styles.bookPillarText} ${styles.bookPillarAccent}`}>
                      SAFETY
                    </span>
                    <span className={styles.bookPillarText}>SUPPORT</span>
                  </div>
                  <p className={styles.bookFooterBadge}>EST. 2026</p>
                </div>
              </div>

              {/* Right Column: Claim Boundaries Card */}
              <div className={styles.claimBoundariesCard}>
                <div>
                  <p className={styles.sectionEyebrow}>Claim boundaries</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    What visitors should not infer from Hylono content
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Hylono pages should explain what is visible and sourced today. They should not
                    turn product, research, or support context into proof that is not present on the
                    public page.
                  </p>
                </div>

                <div className={styles.boundariesList}>
                  {claimBoundaries.map((boundary) => (
                    <div key={boundary.text} className={styles.boundaryItem}>
                      <div className={styles.boundaryIconBadge} aria-hidden="true">
                        <boundary.icon size={18} strokeWidth={1.75} />
                      </div>
                      <p className={styles.boundaryText}>{boundary.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 4: NEXT SOURCE & POLICY EXITS (Deep Obsidian Atmosphere) */}
        {/* ---------------------------------------------------------------- */}
        <section className={styles.nextSourceSection}>
          <div className={styles.standardsContainer}>
            {/* Ambient Molecular Banner */}
            <div className={styles.nextBannerStrip} aria-hidden="true">
              <Image
                src="/images/safety-and-standards/next-steps-banner.png"
                alt=""
                aria-hidden="true"
                width={1600}
                height={200}
                className={styles.nextBannerImage}
              />
              <div className={styles.nextBannerScrim} />
              <div className={styles.nextBannerContent}>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
                  ASSURED TRANSITIONS
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
                  SYSTEM CLEARANCE 2026
                </span>
              </div>
            </div>

            <div className="max-w-3xl">
              <p className={styles.heroEyebrow}>Next source</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Where to continue after this safety check
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                Use the stronger route that matches the next decision: evidence, support, direct
                contact, or public policy context.
              </p>
            </div>

            <div className={styles.nextStepsGrid}>
              {nextSteps.map((step) => (
                <SafetyStandardsTrackedLink
                  key={step.href}
                  href={step.href}
                  eventName="safety_standards_route_transition_clicked"
                  ctaRole="supporting"
                  source={step.source}
                  statusMessage={`Opening ${step.title.toLowerCase()} from the safety and standards next-source map.`}
                  className={`group ${styles.nextStepCard} ${focusRingClass}`}
                >
                  <div className={styles.nextStepTopRow}>
                    <div className={styles.nextStepIconBadge} aria-hidden="true">
                      <step.icon size={20} strokeWidth={1.75} />
                    </div>
                    <div className={styles.nextStepArrowCircle} aria-hidden="true">
                      <ArrowRight size={14} strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <span className={styles.nextStepTitle}>{step.title}</span>
                    <span className={styles.nextStepDesc}>{step.description}</span>
                  </div>
                </SafetyStandardsTrackedLink>
              ))}
            </div>

            {/* Policy Quick Exits Dock */}
            <div className={styles.policyExitsBox}>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                <p className={styles.policyExitsEyebrow}>Policy quick exits</p>
              </div>
              <p className={styles.policyExitsDesc}>
                For logistics and post-order questions, check the public policy route before sending
                a manual support request.
              </p>
              <div className={styles.policyPillsGrid}>
                {policyLinks.map((link) => (
                  <SafetyStandardsTrackedLink
                    key={link.href}
                    href={link.href}
                    eventName="safety_standards_route_transition_clicked"
                    ctaRole="contextual"
                    source="next_steps"
                    statusMessage={`Opening ${link.label.toLowerCase()} from the safety and standards policy exits.`}
                    className={`${styles.policyPillBtn} ${focusRingClass}`}
                  >
                    <div className={styles.policyPillLeft}>
                      <span className={styles.policyPillIcon} aria-hidden="true">
                        <link.icon size={16} strokeWidth={1.75} />
                      </span>
                      <span>{link.label}</span>
                    </div>
                    <ArrowRight className={styles.policyPillArrow} aria-hidden="true" />
                  </SafetyStandardsTrackedLink>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

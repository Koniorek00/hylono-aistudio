import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Calendar,
  ClipboardCheck,
  Cog,
  Globe,
  HelpCircle,
  Home as HomeIcon,
  LifeBuoy,
  Mail,
  MessageSquare,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
  XCircle,
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
  ForProfessionalsRouteActionStatus,
  ForProfessionalsTrackedLink,
} from './ForProfessionalsTrackedLink';
import styles from './for-professionals.module.css';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const routePath = '/for-professionals';
const professionalContactHref = '/contact?source=home&intent=clinic';

const pageTitle = 'For Professionals';
const pageDescription =
  'Plan Hylono professional paths for clinics, studios, and performance facilities with evidence context, deployment questions, onboarding handoffs, and support routes.';

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const operatorChecks = [
  {
    num: '01',
    icon: ClipboardCheck,
    title: 'Define the operating context',
    description:
      'Start with the facility type, intended audience, modality interest, support expectations, and whether a manual contact path is needed before product comparison.',
    image: '/images/for-professionals/card-01-context.jpg',
    imageAlt: 'Modern clinic consultation lounge with armchairs and plants',
  },
  {
    num: '02',
    icon: BookOpenCheck,
    title: 'Review evidence and route limits',
    description:
      'Use research, safety, and protocol pages to keep evidence context and public boundaries visible before a professional route becomes a product request.',
    image: '/images/for-professionals/card-02-evidence.jpg',
    imageAlt: 'Research workstation with laboratory reference materials',
  },
  {
    num: '03',
    icon: Users,
    title: 'Separate staff and visitor needs',
    description:
      'Professional planning should distinguish user education, operator handoff, documentation, and support questions without implying a complete training program.',
    image: '/images/for-professionals/card-03-facility.jpg',
    imageAlt: 'Pristine professional recovery suite with reclining wellness lounger',
  },
  {
    num: '04',
    icon: Wrench,
    title: 'Check deployment and support routes',
    description:
      'Delivery, onboarding, service, warranty, and contact routes should be reviewed before assuming installation availability or operational coverage.',
    image: '/images/for-professionals/card-04-chamber.png',
    imageAlt: 'Precision engineered mild hyperbaric chamber',
  },
] as const;

const professionalBoundaries = [
  'This page is a professional-audience orientation route. It is not a procurement agreement, regulatory approval, clinical protocol, or service contract.',
  'Hylono does not publish automatic approval, training entitlement, operational capacity, installation availability, or service-timing promises on this route.',
  'A product, protocol, or support path should not be inferred as suitable for every clinic, studio, team, building, or local requirement.',
  'Professional visitors should use the linked contact, safety, support, delivery, warranty, and policy routes before relying on private assumptions.',
] as const;

const nextSteps = [
  {
    href: professionalContactHref,
    title: 'Professional contact path',
    description: 'Use contact when clinic, studio, facility, or team context needs manual review.',
    icon: MessageSquare,
    source: 'next_steps' as const,
  },
  {
    href: '/research',
    title: 'Research hub',
    description: 'Review cited evidence context and limitations before positioning a modality.',
    icon: BookOpen,
    source: 'next_steps' as const,
  },
  {
    href: '/safety-and-standards',
    title: 'Safety and standards',
    description: 'Check public selection criteria, claim boundaries, and safety framing.',
    icon: ShieldCheck,
    source: 'next_steps' as const,
  },
  {
    href: '/service-and-support',
    title: 'Service and support',
    description: 'Review support, onboarding, device help, and manual handoff context.',
    icon: Wrench,
    source: 'next_steps' as const,
  },
  {
    href: '/delivery-installation-onboarding',
    title: 'Delivery and onboarding',
    description: 'Use the logistics route for delivery, setup, documentation, and support questions.',
    icon: Truck,
    source: 'next_steps' as const,
  },
  {
    href: '/store',
    title: 'Technology paths',
    description: 'Compare current product routes after the operating context is clearer.',
    icon: Calendar,
    source: 'next_steps' as const,
  },
] as const;

const quickExits = [
  { href: '/how-hylono-works', label: 'How Hylono works', icon: Cog },
  { href: '/for-home', label: 'For home', icon: HomeIcon },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/help', label: 'Help center', icon: LifeBuoy },
] as const;

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300';

export const metadata: Metadata = createPageMetadata({
  title: 'For Professionals | Hylono Clinic, Studio, and Facility Planning Path',
  description: pageDescription,
  path: routePath,
});

// [DECISION: SSG because this is static public professional-audience guidance with no per-user state.]
// Rendering strategy: server-rendered indexable audience page with schema emitted from the route and analytics isolated to link leaves.
export default function ForProfessionalsPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-for-professionals-page"
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
              'Hylono for professionals, clinic wellness technology, studio deployment planning, facility wellness device support, professional onboarding',
            relatedLink: [
              `${SITE_URL}/contact`,
              `${SITE_URL}/research`,
              `${SITE_URL}/safety-and-standards`,
              `${SITE_URL}/service-and-support`,
              `${SITE_URL}/delivery-installation-onboarding`,
              `${SITE_URL}/store`,
              `${SITE_URL}/how-hylono-works`,
              `${SITE_URL}/for-home`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: [
                '#for-professionals-hero-headline',
                '#for-professionals-hero-description',
              ],
            },
          }}
        />
        <StructuredData
          id="jsonld-for-professionals-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'For Professionals', path: routePath },
          ])}
        />
      </Suspense>

      <div className={`${styles.professionalsRoot} bg-slate-950 text-white`} data-variant="dark">
        <ForProfessionalsRouteActionStatus />

        {/* ==========================================================================
            01. HERO SECTION (Asymmetrical Editorial Hero + Directional Scrim)
            ========================================================================== */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroGrid}>
              <div className={styles.heroContent}>
                <p className={styles.eyebrow}>
                  For professionals
                </p>
                <h1
                  id="for-professionals-hero-headline"
                  className={styles.heroHeadline}
                >
                  Plan a professional path before a facility or team decision
                </h1>
                <p
                  id="for-professionals-hero-description"
                  className={styles.heroDescription}
                >
                  This route helps clinics, studios, performance facilities, and team operators
                  separate evidence, deployment questions, onboarding handoffs, and support routes
                  before a product or rental discussion.
                </p>

                <div className={styles.heroCtas}>
                  <ForProfessionalsTrackedLink
                    href={professionalContactHref}
                    eventName="for_professionals_route_cta_clicked"
                    ctaRole="primary"
                    source="hero"
                    className={`${styles.btnPrimary} ${focusRingClass}`}
                  >
                    <span>Start professional review</span>
                    <ArrowRight aria-hidden="true" size={16} />
                  </ForProfessionalsTrackedLink>
                  <ForProfessionalsTrackedLink
                    href="/research"
                    eventName="for_professionals_route_cta_clicked"
                    ctaRole="supporting"
                    source="hero"
                    className={`${styles.btnSecondary} ${focusRingClass}`}
                  >
                    <span>Review research</span>
                    <ArrowRight aria-hidden="true" size={16} />
                  </ForProfessionalsTrackedLink>
                </div>
              </div>

              <aside className={styles.heroTrackMeta} aria-label="Professional practice guidance">
                <div className={styles.heroTrackMetaText}>
                  Professional practice.<br />
                  Clarity before commitment.
                </div>
                <div className={styles.heroTrackMetaLine} />
              </aside>
            </div>

            {/* Floating Fact Pill Bar */}
            <div className={styles.factPillBarWrapper}>
              <aside className={styles.factPillBar} aria-label="Public route facts">
                <div className="sr-only">Public route facts</div>
                <dl className={styles.factPillGrid}>
                  <div className={styles.factPillItem}>
                    <div className={styles.factPillIcon}>
                      <Globe aria-hidden="true" size={16} />
                    </div>
                    <div>
                      <dt className={styles.factPillLabel}>Service area</dt>
                      <dd className={styles.factPillValue}>
                        {siteEntity.serviceArea}
                      </dd>
                    </div>
                  </div>

                  <div className={styles.factPillItem}>
                    <div className={styles.factPillIcon}>
                      <ShieldCheck aria-hidden="true" size={16} />
                    </div>
                    <div>
                      <dt className={styles.factPillLabel}>Support coverage</dt>
                      <dd className={styles.factPillValue}>
                        {siteEntity.supportCoverageLabel}
                      </dd>
                    </div>
                  </div>

                  <div className={styles.factPillItem}>
                    <div className={styles.factPillIcon}>
                      <Mail aria-hidden="true" size={16} />
                    </div>
                    <div>
                      <dt className={styles.factPillLabel}>Support email</dt>
                      <dd className={styles.factPillValue}>
                        {siteEntity.supportEmail}
                      </dd>
                    </div>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            02. OPERATOR CHECKLIST SECTION (4 Numbered Photo Cards 01-04)
            ========================================================================== */}
        <section className={styles.checklistSection}>
          <div className={styles.heroContainer}>
            <div className={styles.splitHeader}>
              <div>
                <p className={styles.eyebrow}>
                  Operator map
                </p>
                <h2 className={styles.sectionH2}>
                  What a professional visitor should check first
                </h2>
              </div>
              <div className={styles.sectionLeadBox}>
                <p className={styles.sectionLead}>
                  The professional path keeps operating context, evidence review, support planning,
                  and logistics separate so the next step is visible before a private conversation.
                </p>
              </div>
            </div>

            <div className={styles.photoCardsGrid}>
              {operatorChecks.map((stage) => (
                <article key={stage.title} className={styles.photoCard}>
                  <div className={styles.photoThumbnailWrapper}>
                    <Image
                      src={stage.image}
                      alt={stage.imageAlt}
                      width={400}
                      height={250}
                      className={styles.photoThumbnail}
                      loading="lazy"
                    />
                    <div className={styles.photoBadge}>{stage.num}</div>
                  </div>
                  <div className={styles.photoCardBody}>
                    <div className={styles.photoCardIconBox}>
                      <stage.icon aria-hidden="true" size={18} />
                    </div>
                    <h3 className={styles.photoCardH3}>{stage.title}</h3>
                    <p className={styles.photoCardDesc}>{stage.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================================
            03. TRUST BAND SECTION (Deep Obsidian Surface + Page Ownership)
            ========================================================================== */}
        <section className={styles.trustBandSection}>
          <div className={styles.heroContainer}>
            <PageOwnership
              eyebrow="Ownership and freshness"
              title="Who maintains the professional path"
              description="This page is maintained as public professional-audience guidance for evidence context, manual contact, deployment questions, logistics, and support routes."
              items={[
                {
                  label: siteOwnership.commerce.label,
                  value: siteOwnership.commerce.team,
                  detail: 'Maintains professional contact, support, delivery, and access handoffs.',
                },
                {
                  label: siteOwnership.research.label,
                  value: siteOwnership.research.team,
                  detail:
                    'Keeps evidence context connected to research pages and visible limitations.',
                },
                {
                  label: siteOwnership.editorial.label,
                  value: siteOwnership.editorial.team,
                  detail:
                    'Maintains public wording and separates route guidance from private agreements.',
                },
                {
                  label: 'Last reviewed',
                  value: displayReviewDate,
                  detail: 'Current content review date used for page freshness and support context.',
                },
              ]}
              actions={[
                { href: professionalContactHref, label: 'Contact Hylono' },
                { href: '/research', label: 'Open research' },
                { href: '/service-and-support', label: 'Open service' },
              ]}
              note="This route is public professional orientation. It is not a procurement agreement, clinical protocol, or service agreement."
              variant="dark"
              className="h-full bg-white/[0.045]"
            />
          </div>
        </section>

        {/* ==========================================================================
            04. PROFESSIONAL BOUNDARIES (Blush Warning Panel)
            ========================================================================== */}
        <section className={styles.boundariesSection}>
          <div className={styles.heroContainer}>
            <div className={styles.blushWarningCard}>
              <div className={styles.warningIntroCol}>
                <div className={styles.warningIcon}>
                  <AlertTriangle aria-hidden="true" size={24} />
                </div>
                <div>
                  <p className={styles.eyebrow}>
                    Professional boundaries
                  </p>
                  <h2 className={styles.warningH2}>
                    What visitors should not infer from this page
                  </h2>
                  <p className={styles.warningLead}>
                    A professional-audience page should improve qualification without becoming a hidden
                    agreement about installation, training, support, or local operational fit.
                  </p>
                </div>
              </div>

              <div className={styles.warningBulletList}>
                {professionalBoundaries.map((boundary) => (
                  <div key={boundary} className={styles.warningBulletItem}>
                    <div className={styles.bulletXIcon}>
                      <XCircle aria-hidden="true" size={16} />
                    </div>
                    <span>{boundary}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            05. NEXT SOURCE SECTION (6 Route Cards Grid + Quick Exits Dock)
            ========================================================================== */}
        <section className={styles.routesSection}>
          <div className={styles.heroContainer}>
            <div className={styles.splitHeader}>
              <div>
                <p className={styles.eyebrow}>
                  Next source
                </p>
                <h2 className={styles.sectionH2}>
                  Choose the route that matches the professional question
                </h2>
              </div>
              <div className={styles.sectionLeadBox}>
                <p className={styles.sectionLead}>
                  Use the route that matches the current decision: manual review, evidence, safety,
                  support, logistics, or product comparison.
                </p>
              </div>
            </div>

            <div className={styles.routeCardsGrid}>
              {nextSteps.map((step) => (
                <ForProfessionalsTrackedLink
                  key={step.href}
                  href={step.href}
                  eventName="for_professionals_route_transition_clicked"
                  ctaRole="supporting"
                  source={step.source}
                  className={`${styles.routeCard} ${focusRingClass}`}
                >
                  <div className={styles.routeIconBox}>
                    <step.icon aria-hidden="true" size={20} />
                  </div>
                  <span className={styles.routeCardContent}>
                    <span className={styles.routeTitle}>
                      {step.title}
                    </span>
                    <span className={styles.routeDesc}>
                      {step.description}
                    </span>
                  </span>
                </ForProfessionalsTrackedLink>
              ))}
            </div>

            {/* Quick Exits Dock */}
            <div className={styles.quickExitsWrapper}>
              <div className={styles.quickExitsCard}>
                <div className={styles.quickExitsIntro}>
                  <div className={styles.quickExitsIconBox}>
                    <ShieldCheck aria-hidden="true" size={20} />
                  </div>
                  <p className={styles.eyebrow}>
                    Professional quick exits
                  </p>
                  <p className={styles.quickExitsLead}>
                    If the professional question is broader than deployment planning, use the process,
                    home, FAQ, or help route before relying on private assumptions.
                  </p>
                </div>
                <div className={styles.quickExitsPills}>
                  {quickExits.map((link) => (
                    <ForProfessionalsTrackedLink
                      key={link.href}
                      href={link.href}
                      eventName="for_professionals_route_transition_clicked"
                      ctaRole="contextual"
                      source="next_steps"
                      className={`${styles.quickExitPill} ${focusRingClass}`}
                    >
                      <link.icon aria-hidden="true" size={15} />
                      <span>{link.label}</span>
                    </ForProfessionalsTrackedLink>
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

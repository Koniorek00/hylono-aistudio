import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  FileText,
  Globe,
  Headphones,
  Laptop,
  Mail,
  Route,
  ShieldAlert,
  ShieldCheck,
  Users,
  Building2,
  Home as HomeIcon,
  Info,
} from 'lucide-react';
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
import { ConsultationContactFormClient } from './ConsultationContactFormClient';
import {
  ConsultationRouteActionStatus,
  ConsultationTrackedEmailLink,
  ConsultationTrackedLink,
} from './ConsultationTrackedLink';
import styles from './consultation-reference.module.css';

// PageOwnership contract: inline page ownership and governance rendered in Section 3
const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const routePath = '/consultation';

const pageTitle = 'Consultation';
const pageDescription =
  'Start a Hylono consultation path with goal context, route fit, rental or ownership questions, professional handoff, and support boundaries before a manual reply.';

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const consultationChecks = [
  {
    icon: Compass,
    num: '01',
    title: 'Name the decision path',
    description:
      'Start with home use, professional planning, rental access, ownership comparison, or support follow-up so the reply can match the real question.',
  },
  {
    icon: FileText,
    num: '02',
    title: 'Bring the useful context',
    description:
      'Share goal context, modality interest, space constraints, deployment setting, and any support question that should be checked before product detail.',
  },
  {
    icon: ShieldCheck,
    num: '03',
    title: 'Keep evidence and limits visible',
    description:
      'Use the research, safety, and process routes before treating a product or protocol page as the complete answer.',
  },
  {
    icon: Users,
    num: '04',
    title: 'Route the next handoff',
    description:
      'The consultation form is a manual intake path. It does not replace policy pages, emergency help, or private service terms.',
  },
] as const;

const consultationBoundaries = [
  'This page starts a manual Hylono planning request. It is not a medical assessment, diagnosis, prescription, procurement agreement, or service contract.',
  'Hylono does not publish automatic qualification, fixed timing, outcome promises, installation availability, or professional approval on this route.',
  'Visitors should review research, safety, delivery, warranty, return, and support pages before relying on any private assumption.',
  'Urgent or emergency situations should use local emergency services instead of this consultation form.',
] as const;

const nextSteps = [
  {
    href: '/for-home',
    title: 'Home planning path',
    description: 'Use this first when the setting is a household, personal routine, or home setup.',
    icon: HomeIcon,
    slug: '/for-home',
  },
  {
    href: '/for-professionals',
    title: 'Professional planning path',
    description: 'Use this first for clinic, studio, team, facility, or operator context.',
    icon: Building2,
    slug: '/for-professionals',
  },
  {
    href: '/rental',
    title: 'Rental options',
    description: 'Review access before ownership when commitment level or setup fit is still open.',
    icon: Calendar,
    slug: '/rental',
  },
  {
    href: '/store',
    title: 'Technology paths',
    description: 'Compare product routes after the goal, setting, and evidence context are clearer.',
    icon: Laptop,
    slug: '/store',
  },
  {
    href: '/research',
    title: 'Research hub',
    description: 'Read cited evidence and limitations before choosing a modality path.',
    icon: BookOpen,
    slug: '/research',
  },
  {
    href: '/service-and-support',
    title: 'Service and support',
    description: 'Check support, onboarding, and manual handoff context before a request.',
    icon: Headphones,
    slug: '/service-and-support',
  },
] as const;

const quickExits = [
  { href: '/how-hylono-works', label: 'How Hylono works' },
  { href: '/delivery-installation-onboarding', label: 'Delivery and onboarding' },
  { href: '/safety-and-standards', label: 'Safety and standards' },
  { href: '/contact', label: 'Contact page' },
] as const;

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300';

function ConsultationFormFallback() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
      <div className="rounded-lg border border-white/10 bg-white/[0.045] p-8">
        <p className="text-xs font-semibold uppercase tracking-normal text-cyan-200">
          Consultation form
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white">
          Start the manual request
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          The interactive consultation form is loading. If it does not appear, email{' '}
          <ConsultationTrackedEmailLink
            className={`font-semibold text-white underline decoration-cyan-300/50 underline-offset-4 transition hover:decoration-cyan-200 ${focusRingClass}`}
            href={`mailto:${siteEntity.contactEmail}`}
            focusStatusMessage="Consultation fallback email is ready from the consultation route."
            clickStatusMessage="Opening consultation fallback email from the consultation route."
          >
            {siteEntity.contactEmail}
          </ConsultationTrackedEmailLink>{' '}
          with your goal, setting, and preferred access path.
        </p>
      </div>
    </div>
  );
}

export const metadata: Metadata = createPageMetadata({
  title: 'Consultation | Hylono Planning and Access Path',
  description: pageDescription,
  path: routePath,
});

// [DECISION: SSG because this indexable consultation bridge is static public guidance and delegates submission state to the existing contact form client leaf.]
// Rendering strategy: server-rendered conversion bridge with crawlable route context, schema from the route, and the interactive intake isolated below the answer block.
export default function ConsultationPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-consultation-page"
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
              'Hylono consultation, wellness device planning, rental consultation, professional deployment inquiry, product guidance',
            relatedLink: [
              `${SITE_URL}/for-home`,
              `${SITE_URL}/for-professionals`,
              `${SITE_URL}/rental`,
              `${SITE_URL}/store`,
              `${SITE_URL}/research`,
              `${SITE_URL}/service-and-support`,
              `${SITE_URL}/contact`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#consultation-hero-headline', '#consultation-hero-description'],
            },
          }}
        />
        <StructuredData
          id="jsonld-consultation-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Consultation', path: routePath },
          ])}
        />
      </Suspense>

      {/* Page ownership contract marker: data-variant="dark" variant="dark" */}
      <div
        className={`${styles.consultationRoot} bg-slate-950 text-white`}
        data-variant="dark"
      >
        <ConsultationRouteActionStatus />

        {/* ==========================================================================
            01. HERO SECTION (Asymmetrical Editorial Hero + Window Depth)
            ========================================================================== */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroGrid}>
              <div className={styles.heroContent}>
                <p className={styles.eyebrow}>
                  Hylono consultation
                </p>
                <h1
                  id="consultation-hero-headline"
                  className={styles.heroHeadline}
                >
                  Start with the decision before the product conversation.
                </h1>
                <p
                  id="consultation-hero-description"
                  className={styles.heroDescription}
                >
                  When the next step needs a human reply, start here: home planning,
                  professional context, rental access, ownership comparison, delivery questions, or
                  support handoff.
                </p>

                <div className={styles.heroCtas}>
                  <ConsultationTrackedLink
                    href="#consultation-form"
                    eventName="consultation_route_cta_clicked"
                    ctaRole="primary"
                    source="hero"
                    className={`${styles.btnPrimary} ${focusRingClass}`}
                  >
                    <span>Start consultation form</span>
                    <ArrowRight aria-hidden="true" size={16} />
                  </ConsultationTrackedLink>
                  <ConsultationTrackedLink
                    href="/how-hylono-works"
                    eventName="consultation_route_cta_clicked"
                    ctaRole="supporting"
                    source="hero"
                    className={`${styles.btnSecondary} ${focusRingClass}`}
                  >
                    <span>Review the process</span>
                    <ArrowRight aria-hidden="true" size={16} />
                  </ConsultationTrackedLink>
                </div>
              </div>

              <aside className={styles.heroTrackMeta} aria-label="Consultation guidance anchors">
                <div className={styles.heroTrackMetaText}>
                  Guidance<br />
                  Planning<br />
                  Access<br />
                  Support
                </div>
                <div className={styles.heroTrackMetaLine} />
              </aside>
            </div>

            {/* Floating Glassmorphic Facts Dock */}
            <div className={styles.factsDockWrapper}>
              <aside className={styles.factsDock} aria-label="Public intake facts">
                <p className={styles.factsEyebrow}>
                  Public intake facts
                </p>
                <div className={styles.factsGrid}>
                  <div className={styles.factCol}>
                    <div className={styles.factIconBox}>
                      <Mail aria-hidden="true" size={16} />
                    </div>
                    <div>
                      <div className={styles.factLabel}>Primary contact</div>
                      <div className={styles.factValue}>
                        <ConsultationTrackedEmailLink
                          className={`${styles.factValueLink} ${focusRingClass}`}
                          href={`mailto:${siteEntity.contactEmail}`}
                          focusStatusMessage="Consultation fallback email is ready from the consultation route."
                          clickStatusMessage="Opening consultation fallback email from the consultation route."
                        >
                          {siteEntity.contactEmail}
                        </ConsultationTrackedEmailLink>
                      </div>
                    </div>
                  </div>

                  <div className={styles.factCol}>
                    <div className={styles.factIconBox}>
                      <Clock aria-hidden="true" size={16} />
                    </div>
                    <div>
                      <div className={styles.factLabel}>Support window</div>
                      <div className={styles.factValue}>
                        {siteEntity.supportHours}
                      </div>
                    </div>
                  </div>

                  <div className={styles.factCol}>
                    <div className={styles.factIconBox}>
                      <Globe aria-hidden="true" size={16} />
                    </div>
                    <div>
                      <div className={styles.factLabel}>Coverage</div>
                      <div className={styles.factValue}>
                        {siteEntity.serviceArea}
                      </div>
                    </div>
                  </div>

                  <div className={styles.factBadgeCol}>
                    <div className={styles.euBadge}>
                      <span>European Union Support Coverage</span>
                      <ArrowRight aria-hidden="true" size={14} />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            02. WHAT THE CONSULTATION PATH SHOULD CLARIFY (Refined 4-Step Row)
            ========================================================================== */}
        <section className={styles.clarificationSection}>
          <div className={styles.heroContainer}>
            <div className={styles.clarificationLayout}>
              <div className={styles.sectionHeaderCol}>
                <p className={styles.eyebrow}>
                  The consultation process
                </p>
                <h2 className={styles.sectionH2}>
                  What the consultation path should clarify
                </h2>
                <p className={styles.sectionLead}>
                  A useful consultation request narrows the decision without turning public guidance
                  into a private agreement. <strong>Start with context</strong>, then use the form only when a manual
                  handoff adds value.
                </p>
                <ConsultationTrackedLink
                  href="/how-hylono-works"
                  eventName="consultation_route_cta_clicked"
                  ctaRole="supporting"
                  source="hero"
                  className={`${styles.inlineActionLink} ${focusRingClass}`}
                >
                  <span>How it works</span>
                  <ArrowRight aria-hidden="true" size={15} />
                </ConsultationTrackedLink>
              </div>

              <div className={styles.stepCardsGrid}>
                {consultationChecks.map((check) => (
                  <article key={check.title} className={styles.stepCard}>
                    <div className={styles.stepIcon}>
                      <check.icon aria-hidden="true" size={18} />
                    </div>
                    <div className={styles.stepNumber}>{check.num}</div>
                    <h3 className={styles.stepTitle}>{check.title}</h3>
                    <p className={styles.stepDesc}>{check.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            03. WHO MAINTAINS THE CONSULTATION PATH (Floating Glass Card over Terrace)
            ========================================================================== */}
        <section className={styles.maintenanceSection}>
          <div className={styles.heroContainer}>
            <div className={styles.maintenanceCard}>
              <div className={styles.maintenanceSplit}>
                <div className={styles.maintenanceColIntro}>
                  <p className={styles.eyebrow}>Hylono</p>
                  <h2 className={styles.sectionH2}>
                    Who maintains the consultation path
                  </h2>
                  <p className={styles.sectionLead}>
                    This page is maintained as public consultation guidance for route fit, access planning, support handoffs, and the manual contact form.
                  </p>
                </div>

                <div className={styles.maintenanceFactsCol}>
                  <div className={styles.maintenanceFactItem}>
                    <div className={styles.maintenanceFactIcon}>
                      <Building2 aria-hidden="true" size={18} />
                    </div>
                    <div>
                      <div className={styles.maintenanceFactLabel}>
                        {siteOwnership.commerce.label}
                      </div>
                      <div className={styles.maintenanceFactDesc}>
                        {siteOwnership.commerce.team} — maintains consultation, rental, product, professional, and support handoffs.
                      </div>
                    </div>
                  </div>

                  <div className={styles.maintenanceFactItem}>
                    <div className={styles.maintenanceFactIcon}>
                      <ShieldCheck aria-hidden="true" size={18} />
                    </div>
                    <div>
                      <div className={styles.maintenanceFactLabel}>
                        {siteOwnership.editorial.label}
                      </div>
                      <div className={styles.maintenanceFactDesc}>
                        {siteOwnership.editorial.team} — keeps public consultation wording separate from private agreements or unsupported promises.
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.maintenanceFactsCol}>
                  <div className={styles.maintenanceFactItem}>
                    <div className={styles.maintenanceFactIcon}>
                      <Mail aria-hidden="true" size={18} />
                    </div>
                    <div>
                      <div className={styles.maintenanceFactLabel}>Primary contact</div>
                      <div className={styles.maintenanceFactDesc}>
                        <ConsultationTrackedEmailLink
                          className={`${styles.factValueLink} ${focusRingClass}`}
                          href={`mailto:${siteEntity.contactEmail}`}
                          focusStatusMessage="Consultation fallback email is ready from the consultation route."
                          clickStatusMessage="Opening consultation fallback email from the consultation route."
                        >
                          {siteEntity.contactEmail}
                        </ConsultationTrackedEmailLink>
                      </div>
                    </div>
                  </div>

                  <div className={styles.maintenanceFactItem}>
                    <div className={styles.maintenanceFactIcon}>
                      <ShieldAlert aria-hidden="true" size={18} />
                    </div>
                    <div>
                      <div className={styles.maintenanceFactLabel}>Note</div>
                      <div className={styles.maintenanceFactDesc}>
                        This route starts a public manual intake path. It does not publish automatic qualification, timing, pricing, or service commitments.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.maintenanceFooterBar}>
                <div>
                  <strong>Freshness:</strong> Last reviewed {displayReviewDate} for public guidance integrity.
                </div>
                <div>
                  Hylono Public Consultation Governance
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            04. WHAT VISITORS SHOULD NOT INFER (Refined Single Card + Alpine Vista)
            ========================================================================== */}
        <section className={styles.boundariesSection}>
          <div className={styles.heroContainer}>
            <div className={styles.boundariesGrid}>
              <div className={styles.boundariesIntroCol}>
                <p className={styles.eyebrow}>
                  Important to know
                </p>
                <h2 className={styles.sectionH2}>
                  What visitors should not infer from this page
                </h2>
                <p className={styles.sectionLead}>
                  A consultation request does not approve a product,
                  protocol, delivery path, professional plan, or support outcome by itself.
                </p>
                <ConsultationTrackedLink
                  href="/safety-and-standards"
                  eventName="consultation_route_cta_clicked"
                  ctaRole="supporting"
                  source="hero"
                  className={`${styles.inlineActionLink} ${focusRingClass}`}
                >
                  <span>Read the full details</span>
                  <ArrowRight aria-hidden="true" size={15} />
                </ConsultationTrackedLink>
              </div>

              <div className={styles.boundariesCardSingle}>
                <div className={styles.boundaryAlertIconCol}>
                  <AlertTriangle aria-hidden="true" size={18} />
                </div>
                <ul className={styles.boundariesBulletList}>
                  {consultationBoundaries.map((boundary) => (
                    <li key={boundary} className={styles.boundaryBulletItem}>
                      {boundary}
                    </li>
                  ))}
                </ul>
              </div>

              <aside className={styles.alpinePhotoCard} aria-label="Alpine landscape guidance">
                <div className={styles.alpineCardMantra}>
                  Public guidance.<br />
                  Real support.
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            05. USE THE STRONGEST PUBLIC ROUTE (Obsidian Canvas + 6 Dividers + Quick Exits)
            ========================================================================== */}
        <section className={styles.darkSection}>
          <div className={styles.heroContainer}>
            <div>
              <p className={styles.darkEyebrow}>
                Explore other paths
              </p>
              <h2 className={styles.darkH2}>
                Use the strongest public route before sending the form
              </h2>
              <p className={styles.darkLead}>
                Consultation is useful when a public route cannot answer the next question. If the
                decision is still early, start with the matching route below.
              </p>
            </div>

            <div className={styles.darkRouteGrid}>
              {nextSteps.map((step) => (
                <ConsultationTrackedLink
                  key={step.href}
                  href={step.href}
                  eventName="consultation_route_transition_clicked"
                  ctaRole="supporting"
                  source="next_steps"
                  className={`${styles.darkRouteCard} ${focusRingClass}`}
                >
                  <div className={styles.darkRouteIconBox}>
                    <step.icon aria-hidden="true" size={20} />
                  </div>
                  <h3 className={styles.darkRouteTitle}>
                    {step.title}
                  </h3>
                  <p className={styles.darkRouteDesc}>
                    {step.description}
                  </p>
                  <div className={styles.darkRouteSlug}>
                    {step.slug}
                  </div>
                </ConsultationTrackedLink>
              ))}
            </div>

            {/* Quick Exits Dock */}
            <div className={styles.quickExitsDock}>
              <div className={styles.quickExitsInfo}>
                <div className={styles.quickExitsTitle}>Quick exits</div>
                <div className={styles.quickExitsDesc}>
                  Use these routes when the question is process, delivery, safety, or a general contact
                  request rather than consultation planning.
                </div>
              </div>
              <div className={styles.quickExitsLinks}>
                {quickExits.map((link) => (
                  <ConsultationTrackedLink
                    key={link.href}
                    href={link.href}
                    eventName="consultation_route_transition_clicked"
                    ctaRole="contextual"
                    source="next_steps"
                    className={`${styles.quickExitPill} ${focusRingClass}`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight aria-hidden="true" size={14} style={{ marginLeft: '0.375rem' }} />
                  </ConsultationTrackedLink>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            06. CONSULTATION FORM SECTION (Unified Header + Embedded Luxury Form Card)
            ========================================================================== */}
        <section
          id="consultation-form"
          className={styles.formSection}
          aria-labelledby="consultation-form-heading"
        >
          <div className={styles.heroContainer}>
            <div className={styles.formHeaderBlock}>
              <div className={styles.formIntroCol}>
                <p className={styles.eyebrow}>
                  Send the consultation request
                </p>
                <h2
                  id="consultation-form-heading"
                  className={styles.sectionH2}
                >
                  Start your consultation
                </h2>
                <p className={styles.sectionLead}>
                  The form below uses the same Hylono contact intake so the request stays in the
                  existing support and commercial handoff path.
                </p>
              </div>

              <div className={styles.formFallbackNotice}>
                <Info aria-hidden="true" size={18} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div>
                  The interactive consultation form is loading. If it does not appear, email{' '}
                  <ConsultationTrackedEmailLink
                    className={`${styles.factValueLink} ${focusRingClass}`}
                    href={`mailto:${siteEntity.contactEmail}`}
                    focusStatusMessage="Consultation fallback email is ready from the consultation route."
                    clickStatusMessage="Opening consultation fallback email from the consultation route."
                  >
                    {siteEntity.contactEmail}
                  </ConsultationTrackedEmailLink>{' '}
                  with your goal, setting, and preferred access path.
                </div>
              </div>
            </div>

            <div className={styles.formContainerCard}>
              <Suspense fallback={<ConsultationFormFallback />}>
                <ConsultationContactFormClient />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

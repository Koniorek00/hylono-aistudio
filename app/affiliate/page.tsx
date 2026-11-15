import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  FileCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Link2,
  Lock,
  Mail,
  PenTool,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { ScopeBoundaryNote } from '@/components/content/ScopeBoundaryNote';
import { buildAffiliateContactHref } from '@/lib/contact-prefill';
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
  AFFILIATE_ROUTE_ACTION_STATUS_ID,
  AffiliateTrackedLink,
} from './AffiliateTrackedLink';
import styles from './affiliate.module.css';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

const displayLastUpdated = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const inquiryChecklist = [
  'Your website, channel, or publication link',
  'Audience geography and primary language',
  'The formats you publish, such as articles, newsletters, video, or practitioner education',
  'Which Hylono topics or product families you want to cover',
  'How you handle advertising disclosures and compliance review',
];

const fitProfiles = [
  {
    title: 'Specialist publishers',
    description:
      'Writers, editors, or newsletter operators covering wellness technology, recovery, or performance topics in a compliance-aware way.',
    image: '/images/affiliate/fit-publishers.webp',
    alt: 'Specialist publishing workspace with editorial notes and modern computer display',
    badgeIcon: PenTool,
  },
  {
    title: 'Educators and practitioners',
    description:
      'Clinics, coaches, and educators who already guide clients through responsible product comparison and next-step support.',
    image: '/images/affiliate/fit-educators.webp',
    alt: 'Clinical wellness practitioner advising a client in a modern consultation studio',
    badgeIcon: GraduationCap,
  },
  {
    title: 'Selective brand collaborators',
    description:
      'Teams with a defined audience, clear disclosure standards, and a practical reason to reference Hylono product or protocol pages.',
    image: '/images/affiliate/fit-collaborators.webp',
    alt: 'Strategic wellness partners collaborating in an architectural mountain terrace lounge',
    badgeIcon: Share2,
  },
];

const manualReviewExpectations = [
  {
    step: '01',
    title: 'Profile fit review',
    detail:
      'Hylono first checks audience fit, disclosure standards, product-family relevance, and whether the public route you reference can support the content.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Response expectation',
    detail:
      'Manual replies use the normal support window and depend on the context provided; this page does not publish a promised response time or SLA.',
    icon: Clock,
  },
  {
    step: '03',
    title: 'Terms discussion',
    detail:
      'Commercial terms are reviewed case by case after fit is clear; no public commission table, cookie window, payout promise, or automatic approval is shown here.',
    icon: FileText,
  },
] as const;

const affiliateProofQuestions = [
  {
    title: 'Relevant public route',
    detail:
      'Name the research, store, protocol, help, or policy page that should support the affiliate conversation.',
    icon: Link2,
  },
  {
    title: 'Disclosure proof boundary',
    detail:
      'Explain audience fit, disclosure standards, and which claims need manual review before any commercial terms are discussed.',
    icon: ShieldCheck,
  },
  {
    title: 'Terms still private',
    detail:
      'Keep commission, cookie window, payout, tiers, case studies, and approved-partner status out of the public route.',
    icon: Lock,
  },
] as const;

const affiliateContactHref = buildAffiliateContactHref();
const affiliateEmailHref = `mailto:${siteEntity.contactEmail}?subject=Affiliate%20inquiry`;

const routeLinks = [
  {
    href: '/research',
    title: 'Research hub',
    description:
      'Review the evidence summaries and visible limitations before discussing any commercial collaboration.',
    icon: BookOpen,
  },
  {
    href: '/store',
    title: 'Product hub',
    description:
      'See the current device categories so your inquiry points to the right product family.',
    icon: ShoppingBag,
  },
  {
    href: '/protocols',
    title: 'Protocol library',
    description:
      'Use the protocol pages to understand how Hylono connects education, products, and support flows.',
    icon: FileCheck,
  },
  {
    href: '/help',
    title: 'Help Center',
    description:
      'Use the support route for general Hylono process questions before requesting manual review.',
    icon: HelpCircle,
  },
  {
    href: '/terms',
    title: 'Terms of service',
    description:
      'Review the public policy route; custom affiliate terms are not published on this page.',
    icon: FileText,
  },
  {
    href: '/privacy',
    title: 'Privacy policy',
    description:
      'Review how Hylono describes contact-form and communication data before sending affiliate context.',
    icon: ShieldCheck,
  },
  {
    href: affiliateContactHref,
    title: 'Affiliate inquiry form',
    description:
      'Open the existing contact form with affiliate context attached when you need a manual reply.',
    icon: Mail,
  },
];

export const metadata: Metadata = createPageMetadata({
  title: 'Affiliate Inquiries | Hylono',
  description:
    'Use Hylono contact for a manual affiliate or referral review. This secondary public page does not publish public commission tables or payout terms.',
  path: '/affiliate',
  forceNoIndex: true,
});

// [DECISION: SSG because this route is static affiliate-intake guidance with manual follow-up and no verified public program terms.]
// Rendering strategy: server-rendered noindex landing page with truthful eligibility guidance, contact CTAs, and no client-side gate or fake application workflow.
export default function AffiliatePageRoute() {
  const affiliatePageSchema = {
    ...createWebPageSchema({
      name: 'Hylono Affiliate Inquiries',
      description:
        'Use Hylono contact for a manual affiliate or referral review. This secondary public page does not publish public commission tables or payout terms.',
      path: '/affiliate',
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    about: { '@id': ORGANIZATION_ID() },
    mainEntity: { '@id': ORGANIZATION_ID() },
    relatedLink: [
      `${SITE_URL}/research`,
      `${SITE_URL}/store`,
      `${SITE_URL}/protocols`,
      `${SITE_URL}/contact`,
      `${SITE_URL}/privacy`,
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#affiliate-hero-headline', '#affiliate-hero-description'],
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-affiliate-page" data={affiliatePageSchema} />
        <StructuredData
          id="jsonld-affiliate-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Affiliate inquiries', path: '/affiliate' },
          ])}
        />
      </Suspense>

      <div className={styles.affiliateRoot}>
        {/* SECTION 1: HERO */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackground}>
            <Image
              src="/images/affiliate/hero-alpine-sanctuary.webp"
              alt="Panoramic alpine sanctuary view through expansive architectural glass"
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className={styles.heroImage}
            />
            <div className={styles.heroScrim} />
          </div>

          <div className={styles.heroContainer}>
            <div className={styles.heroGrid}>
              <div className="max-w-3xl">
                <div
                  id={AFFILIATE_ROUTE_ACTION_STATUS_ID}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label="Affiliate route action status"
                  className="sr-only"
                >
                  Affiliate route transitions are ready.
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <p className={styles.eyebrow}>
                    Affiliate inquiries
                  </p>
                  <div className={`${styles.reviewBadge} rounded-lg`}>
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Secondary public page for manual review</span>
                  </div>
                </div>

                <h1
                  id="affiliate-hero-headline"
                  className={`${styles.editorialSerif} ${styles.heroHeadline} mt-6 text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl`}
                >
                  Request a manual affiliate or referral review
                </h1>

                <p
                  id="affiliate-hero-description"
                  className={`${styles.heroDescription} mt-6 max-w-2xl text-base leading-relaxed sm:text-lg sm:leading-8`}
                >
                  Use the primary inquiry button to open the existing Hylono contact form with affiliate context already attached. Designed for publishers, educators, and wellness businesses that need a manual review, not a public program page. We do not publish fixed commission tables, cookie windows, or payout promises here.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <AffiliateTrackedLink
                    href={affiliateContactHref}
                    className={`${styles.heroPrimaryLink} rounded-lg`}
                    ctaRole="primary"
                    eventName="affiliate_route_cta_clicked"
                    focusStatusMessage="Affiliate inquiry form is ready with affiliate context attached."
                    source="hero"
                    statusMessage="Opening the affiliate inquiry form with affiliate context attached."
                  >
                    <span>Open affiliate inquiry form</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </AffiliateTrackedLink>
                  <AffiliateTrackedLink
                    href={affiliateEmailHref}
                    className={`${styles.heroSupportingLink} rounded-lg`}
                    ctaRole="supporting"
                    eventName="affiliate_route_cta_clicked"
                    focusStatusMessage="Affiliate inquiry email handoff is ready."
                    source="hero"
                    statusMessage="Opening email handoff for an affiliate inquiry."
                  >
                    <Mail className="h-4 w-4 text-sky-600" />
                    <span>Prefer email? {siteEntity.contactEmail}</span>
                  </AffiliateTrackedLink>
                </div>
              </div>

              {/* Aside: Floating frosted glass metadata dossier */}
              <aside aria-label="Manual review" className={`${styles.glassAside} rounded-lg`}>
                <div className={styles.asideHeader}>
                  <p className={styles.eyebrow}>
                    Manual review
                  </p>
                  <span className={styles.asideDossierBadge}>Dossier</span>
                </div>

                <dl className="mt-4 space-y-3">
                  <div className={styles.asideItem}>
                    <dt className={styles.asideDt}>
                      <span className={styles.asideIconCircle}>
                        <Users className="h-4 w-4" />
                      </span>
                      <span>Handled by</span>
                    </dt>
                    <dd className={styles.asideDd}>{siteOwnership.commerce.team}</dd>
                  </div>

                  <div className={styles.asideItem}>
                    <dt className={styles.asideDt}>
                      <span className={styles.asideIconCircle}>
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                      <span>Service area</span>
                    </dt>
                    <dd className={styles.asideDd}>{siteEntity.serviceArea}</dd>
                  </div>

                  <div className={styles.asideItem}>
                    <dt className={styles.asideDt}>
                      <span className={styles.asideIconCircle}>
                        <Clock className="h-4 w-4" />
                      </span>
                      <span>Support hours</span>
                    </dt>
                    <dd className={styles.asideDd}>{siteEntity.supportHours}</dd>
                  </div>

                  <div className={styles.asideItem}>
                    <dt className={styles.asideDt}>
                      <span className={styles.asideIconCircle}>
                        <Mail className="h-4 w-4" />
                      </span>
                      <span>Fallback email</span>
                    </dt>
                    <dd className={styles.asideDd}>
                      <AffiliateTrackedLink
                        className="text-cyan-300 underline-offset-4 hover:underline"
                        href={affiliateEmailHref}
                        ctaRole="supporting"
                        eventName="affiliate_route_transition_clicked"
                        focusStatusMessage="Fallback email handoff is ready for an affiliate inquiry."
                        source="manual_review"
                        statusMessage="Opening fallback email handoff for an affiliate inquiry."
                      >
                        {siteEntity.contactEmail}
                      </AffiliateTrackedLink>
                    </dd>
                  </div>

                  <div className={styles.asideItem}>
                    <dt className={styles.asideDt}>
                      <span className={styles.asideIconCircle}>
                        <Calendar className="h-4 w-4" />
                      </span>
                      <span>Last content review</span>
                    </dt>
                    <dd className={styles.asideDd}>{displayLastUpdated}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </section>

        {/* SECTION 2: FIT PROFILES */}
        <section className={styles.fitSection}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <p className={styles.eyebrow}>
                Fit profiles
              </p>
              <h2 className={`${styles.editorialSerif} ${styles.heroHeadline} mt-3 text-3xl font-normal tracking-tight sm:text-4xl`}>
                Fit profiles
              </h2>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                The right fit for a responsible collaboration.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {fitProfiles.map((profile) => {
                const BadgeIcon = profile.badgeIcon;
                return (
                  <article
                    key={profile.title}
                    className={`${styles.fitCard} rounded-lg`}
                  >
                    <div className={styles.fitImageWrapper}>
                      <Image
                        src={profile.image}
                        alt={profile.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className={styles.fitImage}
                        loading="lazy"
                      />
                      <div className={styles.fitBadgeCircle}>
                        <BadgeIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className={styles.fitCardBody}>
                      <h3 className={`${styles.editorialSerif} ${styles.fitCardTitle} text-xl font-normal`}>
                        {profile.title}
                      </h3>
                      <p className={`${styles.fitCardDescription} mt-3 text-sm leading-relaxed`}>
                        {profile.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 3: THE PROCESS */}
        <section className={styles.processSection}>
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className={styles.eyebrowBotanical}>
                  The process
                </p>
                <p className="mt-2 text-xs uppercase tracking-widest text-emerald-400/80 font-mono">
                  Manual review expectations
                </p>
                <h2 className={`${styles.editorialSerif} mt-4 text-3xl font-normal tracking-tight text-white sm:text-4xl`}>
                  Understand what happens before any affiliate terms are discussed
                </h2>
                <ScopeBoundaryNote
                  lead="Prepare a better inquiry before any affiliate terms are discussed."
                  denials={[
                    'a published program tier',
                    'a case study',
                    'a public economics table',
                    'a promised response time',
                    'an approved-partner account state',
                    'a commission table',
                    'a cookie window',
                    'a payout promise',
                    'automatic approval',
                  ]}
                  className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7"
                />
                <div className="mt-8">
                  <AffiliateTrackedLink
                    href={affiliateContactHref}
                    className={`${styles.botanicalWhiteButton} rounded-lg`}
                    ctaRole="supporting"
                    eventName="affiliate_route_transition_clicked"
                    focusStatusMessage="Affiliate inquiry form is ready from manual review expectations."
                    source="review_expectations"
                    statusMessage="Opening the affiliate inquiry form from manual review expectations."
                  >
                    <span>Prepare inquiry</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </AffiliateTrackedLink>
                </div>
              </div>

              <div className={styles.stepsContainer}>
                {manualReviewExpectations.map((item) => {
                  const StepIcon = item.icon;
                  return (
                    <article key={item.title} className={`${styles.stepTile} rounded-lg`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={styles.stepNumberCircle}>{item.step}</div>
                        <StepIcon className="h-5 w-5 text-cyan-300" />
                      </div>
                      <h3 className={`${styles.editorialSerif} text-lg font-normal text-white`}>
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {item.detail}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CHECKLIST */}
        <section className={styles.proofSection}>
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className={styles.eyebrow}>
                  Checklist
                </p>
                <p className="mt-2 text-xs uppercase tracking-widest text-sky-600 font-mono">
                  Affiliate proof request context
                </p>
                <h2 className={`${styles.editorialSerif} ${styles.proofHeadline} mt-4 text-3xl font-normal tracking-tight sm:text-4xl`}>
                  Ask which proof can support the affiliate conversation
                </h2>
                <ScopeBoundaryNote
                  lead="Bring proof context to outreach."
                  denials={[
                    'a published program tier',
                    'a case study',
                    'a public economics table',
                    'a sample partner outcome',
                    'a promised response time',
                    'a commission table',
                    'a cookie window',
                    'a payout promise',
                    'approved-partner status',
                  ]}
                  className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base sm:leading-7"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {affiliateProofQuestions.map((item) => {
                  const ProofIcon = item.icon;
                  return (
                    <article key={item.title} className={`${styles.proofCard} rounded-lg`}>
                      <div className={styles.proofIconCircle}>
                        <ProofIcon className="h-5 w-5" />
                      </div>
                      <h3 className={`${styles.editorialSerif} ${styles.proofCardTitle} text-base font-medium`}>
                        {item.title}
                      </h3>
                      <p className={`${styles.proofCardDesc} mt-2 text-xs leading-relaxed`}>
                        {item.detail}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: INQUIRY CONTEXT CHECKLIST */}
        <section className={styles.inquirySection}>
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
              <div>
                <p className={styles.eyebrow}>
                  Before you reach out
                </p>
                <h2 className={`${styles.editorialSerif} mt-4 text-3xl font-normal tracking-tight text-white sm:text-4xl border-b border-white/10 pb-4`}>
                  Bring the context we need to review the conversation properly
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  Inquiry checklist:
                </p>
              </div>

              <ul className="space-y-3">
                {inquiryChecklist.map((item) => (
                  <li key={item} className={`${styles.checklistItem} rounded-lg`}>
                    <div className={styles.checkCircle}>
                      <Check className="h-3.5 w-3.5 text-cyan-300" />
                    </div>
                    <span className="text-sm leading-relaxed text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 6: PUBLIC RESOURCES DIRECTORY */}
        <section className={styles.resourceSection}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <p className={styles.eyebrow}>
                Review the public Hylono path first
              </p>
              <h2 className={`${styles.editorialSerif} ${styles.resourceHeadline} mt-3 text-3xl font-normal tracking-tight sm:text-4xl`}>
                Explore the public resources
              </h2>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Use these routes to review the core information before requesting a manual review.
              </p>
            </div>

            <div className={styles.resourceGrid}>
              {routeLinks.map((link) => {
                const RouteIcon = link.icon;
                return (
                  <AffiliateTrackedLink
                    key={link.title}
                    href={link.href}
                    className={`${styles.resourceCard} rounded-lg`}
                    ctaRole="supporting"
                    eventName="affiliate_route_transition_clicked"
                    focusStatusMessage={`Ready to open ${link.title} from the affiliate route map.`}
                    source="route_map"
                    statusMessage={`Opening ${link.title} from the affiliate route map.`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={styles.resourceIconCircle}>
                          <RouteIcon className="h-4 w-4 text-cyan-600" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className={styles.resourceTitle}>{link.title}</p>
                      <p className={styles.resourceDesc}>{link.description}</p>
                    </div>
                  </AffiliateTrackedLink>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 7: WHAT HYLONO CHECKS */}
        <section className={styles.standardsSection}>
          <div className="mx-auto max-w-7xl">
            <div className={`${styles.standardsCallout} rounded-lg`}>
              <div className="flex-1">
                <p className={styles.eyebrow}>
                  Review standards
                </p>
                <h2 className={`${styles.editorialSerif} mt-3 text-2xl font-normal tracking-tight text-white sm:text-3xl`}>
                  What Hylono checks before sharing terms
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">
                  Hylono reviews affiliate relationships case by case. Availability can vary by
                  geography, product line, operational readiness, and disclosure standards. Any live
                  arrangement must match the visible public pages you reference and must avoid
                  unsupported medical or outcome claims.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">
                  Use the affiliate inquiry form above if you need a manual reply from{' '}
                  {siteOwnership.commerce.team}.
                </p>
              </div>

              <div className="shrink-0 p-6 rounded-lg border border-cyan-400/20 bg-cyan-950/40 text-center max-w-xs backdrop-blur-md">
                <ShieldCheck className="h-8 w-8 text-cyan-300 mx-auto mb-3" />
                <p className="text-xs leading-relaxed text-cyan-100 font-medium">
                  Use the affiliate inquiry form above if you need a manual reply from Hylono Commerce &amp; Support.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

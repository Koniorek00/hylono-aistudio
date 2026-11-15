import type { Metadata } from 'next';
import { Suspense } from 'react';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { buildLearningContactHref } from '@/lib/contact-prefill';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createCollectionPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { LearningRouteActionStatus, LearningTrackedLink } from './LearningTrackedLink';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const learningPaths = [
  {
    href: '/protocols',
    kicker: 'Start here',
    title: 'Protocol guides',
    description:
      'Use a structured routine when you want step-by-step guidance instead of a generic overview.',
  },
  {
    href: '/research',
    kicker: 'Review evidence',
    title: 'Research summaries',
    description:
      'Read cited studies, limitations, and modality-specific summaries before choosing a path.',
  },
  {
    href: '/store',
    kicker: 'Match the tool',
    title: 'Product hubs',
    description:
      'Compare the main technology paths when you are deciding which category fits your goal.',
  },
  {
    href: '/rental',
    kicker: 'Need a plan',
    title: 'Rental and support',
    description:
      'Talk through rental fit, logistics, and next steps when you want direct help from Hylono.',
  },
] as const;

const learningContactHref = buildLearningContactHref();

export const metadata: Metadata = createPageMetadata({
  title: 'Learning Hub | Protocols, Research, and Support',
  description:
    'Use this secondary Hylono hub to open protocol guides, research summaries, product hubs, or a prefilled support follow-up.',
  path: '/learning',
  forceNoIndex: true,
});

// [DECISION: SSG because /learning is a noindex routing hub that should route users into real protocol, research, store, rental, and support pages without client-only gating.]
// Rendering strategy: server-rendered noindex routing page with schema emitted from the route and direct HTML links into canonical protocol, research, store, rental, and support destinations.
export default function LearningPageRoute() {
  const learningPageSchema = {
    ...createCollectionPageSchema({
      name: 'Hylono Learning Hub',
      description:
        'A Hylono learning hub that sends visitors to protocols, research, product hubs, rental planning, and a prefilled support follow-up.',
      path: '/learning',
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    about: { '@id': ORGANIZATION_ID() },
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: learningPaths.length,
      itemListElement: learningPaths.map((path, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: path.title,
        url: `${SITE_URL}${path.href}`,
      })),
    },
    hasPart: learningPaths.map((path) => ({
      '@type': 'WebPage',
      name: path.title,
      url: `${SITE_URL}${path.href}`,
    })),
    relatedLink: [`${SITE_URL}/help`, `${SITE_URL}/contact`, `${SITE_URL}/research`],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#learning-hero-headline', '#learning-hero-description'],
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-learning-page" data={learningPageSchema} />
        <StructuredData
          id="jsonld-learning-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Learning hub', path: '/learning' },
          ])}
        />
      </Suspense>

      <div className="bg-slate-950 text-white">
        <LearningRouteActionStatus />

        <section className="border-b border-white/10">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Learning hub
              </p>
              <h1
                id="learning-hero-headline"
                className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
              >
                Open the right Hylono resource first
              </h1>
              <p
                id="learning-hero-description"
                className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg"
              >
                Use this page when you need a fast path into protocol guides, cited research,
                product hubs, or direct support. It stays intentionally lightweight so the deeper
                protocol and research hubs remain the main public destinations.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <LearningTrackedLink
                href="/protocols"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                ctaRole="primary"
                eventName="learning_route_cta_clicked"
                source="hero"
                statusMessage="Opening protocol guides from the Learning hero."
              >
                Open protocol guides
              </LearningTrackedLink>
              <p className="text-sm leading-6 text-slate-300">
                Need a human recommendation instead? Open the contact form with learning context
                attached via{' '}
                <LearningTrackedLink
                  className="inline-flex min-h-11 items-center font-semibold text-white underline decoration-cyan-300/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                  ctaRole="supporting"
                  eventName="learning_route_cta_clicked"
                  href={learningContactHref}
                  source="hero"
                  statusMessage="Opening Contact Hylono with learning context attached."
                >
                  Contact Hylono
                </LearningTrackedLink>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Fast paths
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              Go straight to the page that answers your question
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              This page is here to shorten the path to the right destination, not to duplicate
              the deeper protocol, research, or support pages.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {learningPaths.map((path) => (
              <article
                key={path.href}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.7)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                  {path.kicker}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{path.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{path.description}</p>
                <LearningTrackedLink
                  href={path.href}
                  className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-cyan-300/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                  ctaRole="supporting"
                  eventName="learning_route_transition_clicked"
                  source="route_map"
                  statusMessage={`Opening ${path.title.toLowerCase()} from the Learning route map.`}
                >
                  Open {path.title.toLowerCase()}
                </LearningTrackedLink>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-900/60">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                How to use this page
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                Start here, then move to the stronger page
              </h2>
              <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
                <li>
                  Start with protocols if you want structured usage ideas and a clearer first
                  routine.
                </li>
                <li>
                  Open research if you want citations, study limitations, and context before you
                  commit to a modality.
                </li>
                <li>
                  Use store, rental, or contact when you are choosing equipment or need direct
                  planning help.
                </li>
              </ul>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-slate-950/70 p-6 lg:mt-0">
              <h2 className="text-xl font-semibold text-white">Ownership and support</h2>
              <dl className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
                <div>
                  <dt className="font-semibold text-white">{siteOwnership.editorial.label}</dt>
                  <dd>{siteOwnership.editorial.team}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">{siteOwnership.research.label}</dt>
                  <dd>{siteOwnership.research.team}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Last reviewed</dt>
                  <dd>{displayReviewDate}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Support coverage</dt>
                  <dd>
                    {siteEntity.serviceArea} | {siteEntity.supportHours}
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-sm leading-6 text-slate-400">
                Educational content on Hylono is intended for review and planning. It does not
                replace personalized professional advice.
              </p>
              <LearningTrackedLink
                href="/help"
                className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-cyan-300/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                ctaRole="supporting"
                eventName="learning_route_transition_clicked"
                source="support_panel"
                statusMessage="Opening the support hub from the Learning ownership panel."
              >
                Open the support hub
              </LearningTrackedLink>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { WellnessPlannerClient } from './WellnessPlannerClient';
import {
  WellnessPlannerRouteActionStatus,
  WellnessPlannerTrackedLink,
} from './WellnessPlannerTrackedLink';

const planningDestinations = [
  {
    href: '/store',
    kicker: 'Browse categories',
    title: 'Store hub',
    linkLabel: 'Open the store',
    description:
      'Go straight to the catalog when you already want product pages, visible pricing, and buying context.',
  },
  {
    href: '/rental',
    kicker: 'Access support',
    title: 'Rental planning',
    linkLabel: 'Review rental options',
    description:
      'Use rental planning when the next step is practical planning, not another shortlist pass.',
  },
  {
    href: '/help',
    kicker: 'Support options',
    title: 'Help center',
    linkLabel: 'Open the help center',
    description:
      'Check policy, support, and service guidance before you rely on a lightweight planning tool.',
  },
  {
    href: '/contact',
    kicker: 'Human handoff',
    title: 'Contact Hylono',
    linkLabel: 'Contact Hylono',
    description:
      'Talk to Hylono when room setup, suitability, or commercial details need a direct review.',
  },
] as const;

const resultHandoffArtifact = [
  'Primary goal and secondary goal',
  'Shortlist confidence level',
  'Budget, space, and delivery constraints',
  'Next page chosen: store, rental, help, or contact',
] as const;

const resumePreparationChecklist = [
  {
    label: 'Copy the result summary',
    detail:
      'Keep the visible planner summary with the goal, category, confidence, and selected next page.',
  },
  {
    label: 'Save context outside the tool',
    detail:
      'Use your own notes before returning later; this public page does not create an account-backed resume state.',
  },
  {
    label: 'Send context manually',
    detail:
      'Paste the result into contact if you want Hylono to review it; the planner does not email a result.',
  },
] as const;

const planningPreviewBoundaries = [
  {
    label: 'Budget tier preview',
    detail: 'Use catalog and rental ranges as low, mid, or higher-commitment planning context.',
  },
  {
    label: 'Timeline preview',
    detail: 'Separate immediate research, rental-first exploration, and ownership discussion paths before contact.',
  },
  {
    label: 'Outcome boundary',
    detail: 'Do not treat the planner as a projected stack outcome or a clinical timeline.',
  },
] as const;

// [DECISION: /wellness-planner stays public as a noindex secondary planning route because the tool can still help visitors organise a first-pass shortlist, but it should not compete with stronger store, rental, help, or contact routes in the public growth graph.]
// Rendering strategy: server-rendered noindex route shell with support context and stronger destination links above a client-side planner island for optional shortlist interactions.
export const metadata: Metadata = createPageMetadata({
  title: 'Wellness Planner | Hylono guidance, store, and support',
  description:
    'Use this secondary Hylono planner to organise a first-pass shortlist, then move into store, rental, help, or direct support for the real next step.',
  path: '/wellness-planner',
  forceNoIndex: true,
});

export default function WellnessPlannerPage() {
  return (
    <>
      <StructuredData
        id="jsonld-wellness-planner-page"
        data={createWebPageSchema({
          name: 'Hylono Wellness Planner',
          description:
            'A Hylono planning page for organising a first-pass shortlist before moving to store, rental, help, or direct support pages.',
          path: '/wellness-planner',
          dateModified: SCHEMA_DATE_MODIFIED,
        })}
      />
      <StructuredData
        id="jsonld-wellness-planner-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Wellness Planner', path: '/wellness-planner' },
        ])}
      />
      <div className="bg-slate-950 text-white">
        <WellnessPlannerRouteActionStatus />
        <section className="border-b border-white/10 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
              Secondary planner
            </p>

            <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-3xl space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Use the wellness planner as a lightweight first pass.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300">
                  This public planner stays intentionally secondary. Use it when you want a
                  shortlist built from visible catalog pricing, Hylono&apos;s current goal mapping,
                  and optional space inputs before you move into the stronger store, rental, help,
                  or contact pages.
                </p>
                <p className="max-w-2xl text-sm leading-6 text-slate-400">
                  If you already know the next step, skip the tool and go straight to the public
                  page that matches the task.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <WellnessPlannerTrackedLink
                  href="#planner-builder"
                  ctaRole="primary"
                  eventName="wellness_planner_main_cta_clicked"
                  source="hero"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#020617] transition hover:bg-cyan-200"
                >
                  Jump to the planner
                </WellnessPlannerTrackedLink>
                <WellnessPlannerTrackedLink
                  href="/store"
                  ctaRole="supporting"
                  source="hero"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/[0.08]"
                >
                  Open the store
                </WellnessPlannerTrackedLink>
                <div className="text-xs text-slate-400">
                  <span>Need a direct handoff?</span>
                  <WellnessPlannerTrackedLink
                    className="mt-1 inline-flex min-h-11 items-center rounded-lg px-2 font-semibold text-cyan-200 underline"
                    ctaRole="supporting"
                    href="/contact"
                    source="hero"
                  >
                    Contact Hylono
                  </WellnessPlannerTrackedLink>
                </div>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Page role
                </dt>
                <dd className="mt-2 text-sm text-slate-300">Secondary public planning tool.</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Support team
                </dt>
                <dd className="mt-2 text-sm text-slate-300">{siteOwnership.commerce.team}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Support coverage
                </dt>
                <dd className="mt-2 text-sm text-slate-300">
                  {siteEntity.serviceArea} | {siteEntity.supportHours}
                </dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Best follow-up
                </dt>
                <dd className="mt-2 text-sm text-slate-300">
                  Store, rental, help, or direct contact.
                </dd>
              </div>
            </dl>
          </div>
        </section>

      <section className="border-b border-white/10 bg-white/[0.035]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
              Stronger destinations
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Go straight to the page that matches the real task
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The planner is optional. Use these pages when you need the canonical store,
              support, rental, or contact path immediately.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {planningDestinations.map((destination) => (
              <article
                key={destination.href}
                className="rounded-lg border border-white/10 bg-white/[0.045] p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  {destination.kicker}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-white">{destination.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{destination.description}</p>
                <WellnessPlannerTrackedLink
                  href={destination.href}
                  ctaRole="supporting"
                  source="route_map"
                  className="mt-4 inline-flex text-sm font-semibold text-cyan-200 underline decoration-cyan-300 underline-offset-4"
                >
                  {destination.linkLabel}
                </WellnessPlannerTrackedLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
              Method and confidence
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Treat the shortlist as directional, not final
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The planner ranks public Hylono categories against the goals, space, modality,
              and budget signals you provide. It does not inspect live inventory, medical fit,
              installation constraints, or account history.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
              <h3 className="text-sm font-semibold text-white">Higher confidence</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Goal, modality, budget, and space all point toward the same category.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
              <h3 className="text-sm font-semibold text-white">Lower confidence</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Inputs conflict, budget is missing, or the plan depends on delivery, setup, or
                support details.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
              <h3 className="text-sm font-semibold text-white">Human review</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use contact or rental planning when the shortlist affects scheduling,
                contraindication screening, logistics, or payment timing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.035]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
              Result handoff artifact
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Keep these planner outputs before the next step
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This is a static handoff checklist for the planner result. It is not an account save,
              resume flow, email result, PDF export, or final recommendation.
            </p>
          </div>

          <ul className="grid gap-4 md:grid-cols-2">
            {resultHandoffArtifact.map((item) => (
              <li key={item} className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-sm leading-6 text-slate-300">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
              Resume and share preparation
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Keep the result usable without pretending it is saved
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This is manual preparation for a planner result. It is not a saved account state,
              resume link, emailed result, downloadable artifact, or support ticket.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {resumePreparationChecklist.map((item) => (
              <article key={item.label} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                <h3 className="text-sm font-semibold text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
              Budget and timeline preview
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Frame the shortlist before you ask for a plan
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              These preview boundaries help decide whether to browse, rent, or contact Hylono
              without promising a projected outcome, fixed timeline, or clinical result.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {planningPreviewBoundaries.map((item) => (
              <article key={item.label} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                <h3 className="text-sm font-semibold text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="planner-builder">
        <WellnessPlannerClient />
      </section>
      </div>
    </>
  );
}

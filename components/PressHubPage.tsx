import { ArrowRight, Building2, FileCheck2, Mail, Microscope, ShieldCheck } from 'lucide-react';
import {
  PressActionAnchor,
  PressRouteActionStatus,
  PressTrackedLink,
} from '@/app/press/PressTrackedLink';
import { PageOwnership } from '@/components/content/PageOwnership';
import { siteEntity, siteOwnership } from '@/content/site-entity';

const VERIFIED_FACTS = [
  {
    label: 'Organisation',
    value: siteEntity.legalName,
    detail: siteEntity.description,
    icon: Building2,
  },
  {
    label: 'Service area',
    value: siteEntity.serviceArea,
    detail: siteEntity.supportCoverageLabel,
    icon: ShieldCheck,
  },
  {
    label: 'Primary contact',
    value: siteEntity.contactEmail,
    detail: 'Use the main contact channel for media requests, background questions, or interview handling.',
    icon: Mail,
  },
  {
    label: 'Support window',
    value: siteEntity.supportHours,
    detail: 'Public business-hours support window published in the canonical site entity record.',
    icon: FileCheck2,
  },
] as const;

const PRESS_ROUTE_LINKS = [
  {
    href: '/about',
    title: 'About Hylono',
    description: 'Review the public company background and trust context.',
  },
  {
    href: '/research',
    title: 'Research hub',
    description: 'Open the evidence library when the request needs study context or limitations.',
  },
  {
    href: '/help',
    title: 'Help centre',
    description: 'Use support when the request is operational rather than editorial.',
  },
] as const;

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300';
const eyebrowClasses = 'text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200';
const panelClasses = 'rounded-lg border border-white/10 bg-white/[0.045]';
const mutedPanelClasses = 'rounded-lg border border-cyan-300/25 bg-cyan-400/10';
const primaryCtaClasses =
  'inline-flex items-center justify-center rounded-lg bg-cyan-300 px-6 py-3 text-base font-semibold text-black transition hover:bg-cyan-200 focus-visible:ring-offset-slate-950 motion-reduce:transition-none';
const secondaryCtaClasses =
  'inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.035] px-6 py-3 text-base font-semibold text-slate-100 transition hover:bg-white/[0.07] hover:text-white focus-visible:ring-offset-slate-950 motion-reduce:transition-none';
const compactRouteCardClasses =
  'block rounded-lg border border-white/10 bg-white/[0.045] p-5 transition hover:bg-white/[0.07] focus-visible:ring-offset-slate-950 motion-reduce:transition-none';

export function PressHubPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PressRouteActionStatus />
      <section className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className={eyebrowClasses}>Press information</p>
          <h1
            id="press-hero-headline"
            className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl"
          >
            Press and media requests
          </h1>
          <p
            id="press-hero-description"
            className="mt-5 max-w-3xl text-lg leading-8 text-slate-300"
          >
            This page currently shares verified company background and sends media requests
            through the main contact channel instead of publishing unsupported coverage, funding
            claims, or downloadable assets.
          </p>

          <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <PressTrackedLink
                href="/contact"
                eventName="press_route_cta_clicked"
                ctaRole="primary"
                source="hero"
                statusMessage="Opening Contact Hylono with press request context."
                className={`w-full sm:w-auto sm:shrink-0 sm:whitespace-nowrap ${primaryCtaClasses} ${focusRingClass}`}
              >
                Contact Hylono
              </PressTrackedLink>
              <PressActionAnchor
                href={`mailto:${siteEntity.contactEmail}`}
                statusMessage="Opening email for the Hylono press request contact channel."
                className={`w-full sm:w-auto sm:shrink-0 sm:whitespace-nowrap ${secondaryCtaClasses} ${focusRingClass}`}
              >
                Email {siteEntity.contactEmail}
              </PressActionAnchor>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Public press materials remain intentionally limited to verified company facts until
              approved assets or verified coverage are ready for publication.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {VERIFIED_FACTS.map((fact) => (
              <article
                key={fact.label}
                className={`${panelClasses} p-6`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-cyan-400/10 p-3 text-cyan-200">
                    <fact.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">{fact.label}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{fact.value}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{fact.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)]">
          <div className={`${panelClasses} p-8`}>
            <p className={eyebrowClasses}>Current page scope</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              What this page includes today
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-slate-300">
              <p>
                The press page is currently a verification-first utility page. It keeps one clear
                job: share public company background that already exists in the repo and direct
                requests into the main support and contact paths.
              </p>
              <p>
                That means no synthetic press-release timeline, no invented publication logos, no
                fundraising statements, and no download buttons for assets that are not approved for
                public release.
              </p>
              <p>
                When a request needs background, research context, or operational support, the page
                should move people into stronger canonical pages rather than pretending a full media
                kit exists.
              </p>
            </div>

            <div className={`mt-8 ${mutedPanelClasses} p-6`}>
              <h3 className="text-xl font-semibold text-white">Best next step</h3>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Use contact when the request is time-sensitive, needs manual handling, or
                depends on background materials that are not published as public assets.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <PressTrackedLink
                  href="/contact"
                  eventName="press_route_cta_clicked"
                  ctaRole="primary"
                  source="best_next_step"
                  statusMessage="Opening Contact Hylono from the press best next step."
                  className={`inline-flex items-center justify-center rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-200 sm:whitespace-nowrap focus-visible:ring-offset-slate-950 motion-reduce:transition-none ${focusRingClass}`}
                >
                  Contact Hylono
                </PressTrackedLink>
                <PressTrackedLink
                  href="/about"
                  eventName="press_route_transition_clicked"
                  ctaRole="supporting"
                  source="best_next_step"
                  statusMessage="Opening About Hylono from the press best next step."
                  className={`inline-flex items-center justify-center rounded-lg border border-cyan-200/35 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 hover:text-white sm:whitespace-nowrap focus-visible:ring-offset-slate-950 motion-reduce:transition-none ${focusRingClass}`}
                >
                  Review company background
                </PressTrackedLink>
              </div>
            </div>
          </div>

          <aside className={`${panelClasses} p-8`}>
            <p className={eyebrowClasses}>Canonical references</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Stronger public pages
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Use these public pages when the request needs verified background, research context,
              or operational help.
            </p>

            <div className="mt-6 space-y-4">
              {PRESS_ROUTE_LINKS.map((link) => (
                <PressTrackedLink
                  key={link.href}
                  href={link.href}
                  eventName="press_route_transition_clicked"
                  ctaRole="supporting"
                  source="route_map"
                  statusMessage={`Opening ${link.title.toLowerCase()} from the Press route map.`}
                  className={`${compactRouteCardClasses} ${focusRingClass}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{link.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{link.description}</p>
                    </div>
                    <ArrowRight className="mt-1 shrink-0 text-cyan-200" size={18} />
                  </div>
                </PressTrackedLink>
              ))}
            </div>

            <div className={`mt-8 ${mutedPanelClasses} p-5`}>
              <div className="flex items-center gap-3 text-white">
                <Microscope className="text-cyan-200" size={18} />
                <h3 className="text-base font-semibold">Evidence-first handoff</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Research requests should move to the evidence hub before any editorial summary is
                shared as a standalone asset.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <PageOwnership
            eyebrow="Ownership and contact"
            title="Verified page context"
            description="This page is intentionally limited to facts that already exist in the repo-wide trust model."
            items={[
              {
                label: siteOwnership.editorial.label,
                value: siteOwnership.editorial.team,
                detail: 'Owns editorial clarity and public-page accuracy for trust and support pages.',
              },
              {
                label: siteOwnership.commerce.label,
                value: siteOwnership.commerce.team,
                detail: 'Handles the manual review path when a request needs human follow-up.',
              },
              {
                label: 'Primary contact',
                value: siteEntity.contactEmail,
                detail: 'Use the main company contact channel instead of an unverified press-only mailbox.',
              },
              {
                label: 'Support hours',
                value: siteEntity.supportHours,
                detail: 'Published in the canonical site entity record for public trust pages.',
              },
            ]}
            actions={[
              { href: '/contact', label: 'Open contact' },
              { href: '/about', label: 'Review about' },
              { href: '/research', label: 'Open research' },
              { href: '/help', label: 'Open help' },
            ]}
            note="If Hylono later publishes approved media assets or verified coverage, this page can graduate back to a fuller press utility page."
            variant="dark"
          />
        </div>
      </section>
    </div>
  );
}

export default PressHubPage;

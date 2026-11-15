import {
  FiresafeRouteActionStatus,
  FiresafeTrackedLink,
} from '@/app/firesafe/FiresafeTrackedLink';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const firesafeDestinations = [
  {
    href: '/store',
    kicker: 'Compare categories',
    title: 'Store and product pages',
    description:
      'Use the store and product pages when you need current category context instead of a thin niche page.',
  },
  {
    href: '/rental',
    kicker: 'Plan access',
    title: 'Rental planning',
    description:
      'Open rental planning when you need practical help with logistics, access, or the next step.',
  },
  {
    href: '/help',
    kicker: 'Support context',
    title: 'Help and policy pages',
    description:
      'Review support, shipping, returns, and warranty context before moving into a commercial discussion.',
  },
  {
    href: '/contact',
    kicker: 'Direct follow-up',
    title: 'Contact Hylono',
    description:
      'Use contact when you need documentation, availability, or a manual follow-up.',
  },
  {
    href: '/about',
    kicker: 'Company context',
    title: 'About Hylono',
    description:
      'Read the verified company background and trust context before relying on a secondary brand page.',
  },
] as const;

export function FiresafePage() {
  return (
    <div className="bg-slate-950 text-white">
      <FiresafeRouteActionStatus />
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              Secondary guide
            </p>
            <h1
              id="firesafe-hero-headline"
              className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
            >
              Use Firesafe as a secondary guide for Firesafe-related questions
            </h1>
            <p
              id="firesafe-hero-description"
              className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg"
            >
              This page stays intentionally lightweight. It helps visitors move into stronger Hylono
              support, store, rental, and contact pages without presenting an unsupported catalog,
              deployment record, or proof page.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <FiresafeTrackedLink
              href="/help"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200 motion-reduce:transition-none"
              ctaRole="primary"
              eventName="firesafe_route_cta_clicked"
              source="hero"
              statusMessage="Opening Help and policy pages from the Firesafe guide."
            >
              Open support options
            </FiresafeTrackedLink>
            <p className="text-sm leading-6 text-slate-300">
              Need a direct follow-up instead?{' '}
              <FiresafeTrackedLink
                className="inline-flex min-h-11 items-center font-semibold text-white underline decoration-amber-300/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
                href="/contact"
                ctaRole="supporting"
                eventName="firesafe_route_cta_clicked"
                source="hero"
                statusMessage="Opening Contact Hylono from the Firesafe guide."
              >
                Contact Hylono
              </FiresafeTrackedLink>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Stronger destinations
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Choose the page that matches the actual task
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Firesafe is most useful when it shortens the path into store context, support options,
            rental planning, or a direct conversation with Hylono.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {firesafeDestinations.map((destination) => (
            <article
              key={destination.href}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.7)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
                {destination.kicker}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{destination.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{destination.description}</p>
              <FiresafeTrackedLink
                href={destination.href}
                className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-amber-300/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
                ctaRole="supporting"
                eventName="firesafe_route_transition_clicked"
                source="route_map"
                statusMessage={`Opening ${destination.title.toLowerCase()} from the Firesafe route map.`}
              >
                Open {destination.title.toLowerCase()}
              </FiresafeTrackedLink>
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
              Start here, then move to the page with the real detail
            </h2>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
              <li>
                Use Firesafe when you want a quick orientation before a support or commercial
                discussion.
              </li>
              <li>
                Move to store, rental, or contact when you need current availability,
                documentation, or practical next steps.
              </li>
              <li>
                Keep the trust and help pages close because this page is not meant to carry the
                full product, evidence, or deployment story on its own.
              </li>
            </ul>
            <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-400">
              {siteEntity.description}
            </p>
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
                <dt className="font-semibold text-white">{siteOwnership.commerce.label}</dt>
                <dd>{siteOwnership.commerce.team}</dd>
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
              <div>
                <dt className="font-semibold text-white">Contact</dt>
                <dd>{siteEntity.contactEmail}</dd>
              </div>
            </dl>
            <p className="mt-6 text-sm leading-6 text-slate-400">
              Firesafe remains a secondary orientation page. The stronger public destinations are the
              store, support, rental, and contact pages.
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <FiresafeTrackedLink
                href="/help"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-amber-300/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
                ctaRole="supporting"
                eventName="firesafe_route_transition_clicked"
                source="support_panel"
                statusMessage="Opening Help and policy pages from the Firesafe support panel."
              >
                Open the support hub
              </FiresafeTrackedLink>
              <FiresafeTrackedLink
                href="/about"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-amber-300/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
                ctaRole="supporting"
                eventName="firesafe_route_transition_clicked"
                source="support_panel"
                statusMessage="Opening About Hylono from the Firesafe support panel."
              >
                Read company context
              </FiresafeTrackedLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

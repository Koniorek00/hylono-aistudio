import {
  HhoCarKitRouteActionStatus,
  HhoCarKitTrackedLink,
} from '@/app/hho-car-kit/HhoCarKitTrackedLink';
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

const hhoCarKitDestinations = [
  {
    href: '/help',
    kicker: 'Support context',
    title: 'Help and policy pages',
    description:
      'Open the support hub when you need current policy, support, shipping, returns, or warranty context.',
  },
  {
    href: '/contact',
    kicker: 'Manual follow-up',
    title: 'Contact Hylono',
    description:
      'Use contact when you need a manual answer instead of a thin niche page.',
  },
  {
    href: '/store',
    kicker: 'Current public catalog',
    title: 'Store and product pages',
    description:
      'Use the store and product pages when you need current public category context rather than unsupported automotive claims.',
  },
  {
    href: '/faq',
    kicker: 'Common questions',
    title: 'FAQ',
    description:
      'Review the FAQ when you need quick answers about how Hylono handles support, ordering, and next steps.',
  },
  {
    href: '/about',
    kicker: 'Company background',
    title: 'About Hylono',
    description:
      'Read the verified company overview before relying on a secondary page that is not part of the main public growth graph.',
  },
] as const;

export function HhoCarKitPage() {
  return (
    <div className="bg-slate-950 text-white">
      <HhoCarKitRouteActionStatus />
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Secondary guide
            </p>
            <h1
              id="hho-car-kit-hero-headline"
              className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
            >
              Use HHO car kit as a secondary guide for orientation and support
            </h1>
            <p
              id="hho-car-kit-hero-description"
              className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg"
            >
              This page stays intentionally lightweight. It helps visitors move into stronger
              Hylono support, store, FAQ, about, and contact pages without presenting unsupported
              savings, performance, insurance, warranty, or testimonial claims.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <HhoCarKitTrackedLink
              href="/help"
              eventName="hho_car_kit_route_cta_clicked"
              ctaRole="primary"
              source="hero"
              statusMessage="Opening Help and policy pages from the HHO car kit guide."
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Open support options
            </HhoCarKitTrackedLink>
            <p className="text-sm leading-6 text-slate-300">
              Need a direct follow-up instead?{' '}
              <HhoCarKitTrackedLink
                href="/contact"
                eventName="hho_car_kit_route_cta_clicked"
                ctaRole="supporting"
                source="hero"
                statusMessage="Opening Contact Hylono from the HHO car kit guide."
                className="inline-flex min-h-11 items-center font-semibold text-white underline decoration-cyan-300/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
              >
                Contact Hylono
              </HhoCarKitTrackedLink>
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
            Choose the option that matches the real task
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            HHO car kit is most useful when it shortens the path into support, contact, store,
            FAQ, or company background pages that carry the stronger public context.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {hhoCarKitDestinations.map((destination) => (
            <article
              key={destination.href}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.7)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                {destination.kicker}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{destination.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{destination.description}</p>
              <HhoCarKitTrackedLink
                href={destination.href}
                eventName="hho_car_kit_route_transition_clicked"
                ctaRole="supporting"
                source="route_map"
                statusMessage={`Opening ${destination.title.toLowerCase()} from the HHO car kit route map.`}
                className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-cyan-300/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
              >
                Open {destination.title.toLowerCase()}
              </HhoCarKitTrackedLink>
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
                Use HHO car kit when you want quick orientation before opening the stronger support
                and contact pages.
              </li>
              <li>
                Move to help, FAQ, or contact when you need current policy context, practical next
                steps, or a manual follow-up.
              </li>
              <li>
                Treat this page as an orientation surface, not as a proof page, savings calculator, or
                installation guide.
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
              HHO car kit remains a secondary orientation page. The stronger public destinations are
              the support, contact, store, FAQ, and about pages.
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <HhoCarKitTrackedLink
                href="/help"
                eventName="hho_car_kit_route_transition_clicked"
                ctaRole="supporting"
                source="support_panel"
                statusMessage="Opening Help and policy pages from the HHO car kit support panel."
                className="inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-cyan-300/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
              >
                Open the support hub
              </HhoCarKitTrackedLink>
              <HhoCarKitTrackedLink
                href="/about"
                eventName="hho_car_kit_route_transition_clicked"
                ctaRole="supporting"
                source="support_panel"
                statusMessage="Opening About Hylono from the HHO car kit support panel."
                className="inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-cyan-300/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
              >
                Read company context
              </HhoCarKitTrackedLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

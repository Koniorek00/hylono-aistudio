import { buildMeridianContactHref } from '@/lib/contact-prefill';
import { MeridianRouteActionStatus, MeridianTrackedLink } from './MeridianTrackedLink';

const meridianDestinations = [
  {
    href: '/about',
    kicker: 'Company context',
    title: 'About Hylono',
    description:
      'Read Hylono company context, trust pages, and support options before going deeper.',
  },
  {
    href: '/research',
    kicker: 'Review evidence',
    title: 'Research summaries',
    description:
      'Review research summaries before choosing a modality or deciding where to go next.',
  },
  {
    href: '/protocols',
    kicker: 'Plan the routine',
    title: 'Protocol guides',
    description:
      'Move into the protocol library when you need a structured next step instead of this overview.',
  },
  {
    href: '/store',
    kicker: 'Compare categories',
    title: 'Product hubs',
    description:
      'Use the store and product pages when you want to compare categories and next-step options.',
  },
  {
    href: '/rental',
    kicker: 'Access support',
    title: 'Rental planning',
    description:
      'Start a rental or planning discussion when you need practical help with fit, logistics, or next steps.',
  },
] as const;

const meridianContactHref = buildMeridianContactHref();

export function MeridianClient() {
  return (
    <div className="bg-slate-950 text-white">
      <MeridianRouteActionStatus />
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Secondary guide
            </p>
            <h1
              id="meridian-hero-headline"
              className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
            >
              Use Meridian to choose the right Hylono page
            </h1>
            <p
              id="meridian-hero-description"
              className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg"
            >
              Meridian is a short orientation page for company context, research, protocol guides,
              product comparison, and direct support. It stays intentionally secondary so the
              deeper public pages remain the main destinations for decisions and follow-up.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <MeridianTrackedLink
              href="/protocols"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
              ctaRole="primary"
              eventName="meridian_route_cta_clicked"
              source="hero"
              statusMessage="Opening protocol guides from the Meridian guide."
            >
              Open protocol guides
            </MeridianTrackedLink>
            <p className="text-sm leading-6 text-slate-300">
              Need help choosing the next page instead? Open the contact form with Meridian
              context attached via{' '}
              <MeridianTrackedLink
                className="inline-flex min-h-11 items-center font-semibold text-white underline decoration-cyan-300/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
                href={meridianContactHref}
                ctaRole="supporting"
                eventName="meridian_route_cta_clicked"
                source="hero"
                statusMessage="Opening Contact Hylono with Meridian context attached."
              >
                Contact Hylono
              </MeridianTrackedLink>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Next pages
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Choose the page that matches what you need
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Meridian is most useful when it shortens the path to a stronger about, research,
            protocol, store, or rental page.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {meridianDestinations.map((destination) => (
            <article
              key={destination.href}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.7)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                {destination.kicker}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{destination.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{destination.description}</p>
              <MeridianTrackedLink
                href={destination.href}
                className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-cyan-300/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
                ctaRole="supporting"
                eventName="meridian_route_transition_clicked"
                source="route_map"
                statusMessage={`Opening ${destination.title.toLowerCase()} from the Meridian route map.`}
              >
                Open {destination.title.toLowerCase()}
              </MeridianTrackedLink>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

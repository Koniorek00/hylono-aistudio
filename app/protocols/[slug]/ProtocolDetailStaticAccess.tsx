import { protocols, type Protocol } from '@/content/protocols';
import { TECH_DETAILS } from '@/constants';
import { LEGACY_PRODUCT_ROUTE_REDIRECTS, getTechTypeFromRouteSlug } from '@/lib/product-routes';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import { ProtocolsRouteActionStatus, ProtocolsTrackedLink } from '../ProtocolsTrackedLink';

const formatDeviceBurden = (deviceCount: number): string =>
  deviceCount === 1 ? '1 required device' : `${deviceCount} required devices`;

const getRouteSlugForProductId = (productId: string): string =>
  LEGACY_PRODUCT_ROUTE_REDIRECTS[
    productId as keyof typeof LEGACY_PRODUCT_ROUTE_REDIRECTS
  ] ?? productId;

const getProtocolProductName = (productId: string): string => {
  const routeSlug = getRouteSlugForProductId(productId);
  const techType = getTechTypeFromRouteSlug(routeSlug);

  return techType ? `Hylono ${TECH_DETAILS[techType].name}` : productId;
};

const getProtocolProductLinks = (protocol: Protocol) =>
  protocol.requiredDevices.map((device) => {
    const routeSlug = getRouteSlugForProductId(device.productId);
    return {
      href: `/product/${routeSlug}`,
      label: getProtocolProductName(device.productId),
    };
  });

const getProtocolModalities = (protocol: Protocol): string[] =>
  Array.from(
    new Set(
      protocol.weeks.flatMap((week) =>
        week.days.flatMap((day) => day.sessions.map((session) => session.modality))
      )
    )
  );

const goalToConditionRoute = (goalTag: string): string => {
  const value = goalTag.toLowerCase();
  if (value.includes('recovery')) return '/conditions/recovery';
  if (value.includes('sleep')) return '/conditions/sleep';
  if (value.includes('stress')) return '/conditions/stress';
  if (value.includes('comfort')) return '/conditions/comfort';
  return '/conditions/vitality';
};

interface ProtocolDetailStaticAccessProps {
  selectedSlug?: string;
}

export function ProtocolDetailStaticAccess({ selectedSlug }: ProtocolDetailStaticAccessProps) {
  const visibleProtocols = selectedSlug
    ? protocols.filter((protocol) => protocol.slug === selectedSlug)
    : protocols;
  const isDetailFallback = visibleProtocols.length === 1;

  if (visibleProtocols.length === 0) {
    return null;
  }

  return (
    <section
      aria-busy="true"
      aria-describedby="protocol-static-access-description"
      aria-labelledby="protocol-static-access-heading"
      className="bg-slate-950 px-4 py-16 text-slate-200 md:px-6"
    >
      <ProtocolsRouteActionStatus />
      <div className="mx-auto max-w-6xl rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0_36px_110px_-66px_rgba(8,145,178,0.55)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Protocol detail access
        </p>
        <h2
          id="protocol-static-access-heading"
          className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl"
        >
          {isDetailFallback
            ? 'Static protocol detail access'
            : 'Continue with the static protocol summaries.'}
        </h2>
        <p
          id="protocol-static-access-description"
          className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base"
        >
          The interactive protocol view is still loading. The static summaries below keep fit,
          timing, hardware burden, evidence context, and contact/rental exits available without
          client-side JavaScript.
        </p>

        <div className="mt-8 grid gap-5">
          {visibleProtocols.map((protocol) => {
            const modalities = getProtocolModalities(protocol).join(', ');
            const productLinks = getProtocolProductLinks(protocol);
            const guidanceHref = `/contact?bundle=${protocol.slug}&intent=protocol`;
            const rentalHref = `/rental?bundle=${protocol.slug}`;
            const conditionHref = goalToConditionRoute(protocol.goalTag);
            const escalation =
              protocol.contraindications.length > 0
                ? 'Review contraindications and professional guidance before starting.'
                : 'Use professional guidance if tolerance, symptoms, or device setup are uncertain.';

            return (
              <article
                key={protocol.slug}
                className="rounded-lg border border-white/10 bg-slate-950 p-5 md:p-6"
              >
                <h2 className="text-2xl font-bold text-white">{protocol.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  {protocol.shortDescription}
                </p>
                <dl className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Fit check
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-white">
                      {protocol.targetAudience}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Time and length
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-white">
                      {protocol.timePerDay} per day for {protocol.durationWeeks} weeks
                    </dd>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Difficulty
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-white">
                      {protocol.difficulty}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Hardware burden
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-white">
                      {formatDeviceBurden(protocol.requiredDevices.length)}: {modalities}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Escalate first
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-white">{escalation}</dd>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Evidence context
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-white">
                      {protocol.evidenceIds.length} related research records listed on the full
                      page
                    </dd>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Last reviewed
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-white">
                      {protocol.reviewer?.name ?? 'Hylono Research Review'} on{' '}
                      {SCHEMA_DATE_MODIFIED}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Supporting product hubs
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {productLinks.map((link) => (
                      <ProtocolsTrackedLink
                        key={link.href}
                        href={link.href}
                        ctaRole="supporting"
                        source="protocol_detail_product_hubs"
                        className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.08] px-4 text-sm font-semibold text-white hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                      >
                        Open {link.label} hub
                      </ProtocolsTrackedLink>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ProtocolsTrackedLink
                    href={`/protocols/${protocol.slug}`}
                    ctaRole="supporting"
                    source="protocol_detail_static_access"
                    className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.08] px-5 text-sm font-semibold text-white hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    Open {protocol.title}
                  </ProtocolsTrackedLink>
                  <ProtocolsTrackedLink
                    href={guidanceHref}
                    ctaRole="primary"
                    source="protocol_detail_static_access"
                    className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 text-sm font-semibold text-slate-950 hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    Ask for protocol guidance
                  </ProtocolsTrackedLink>
                  <ProtocolsTrackedLink
                    href={rentalHref}
                    ctaRole="supporting"
                    source="protocol_detail_static_access"
                    className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.08] px-5 text-sm font-semibold text-white hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    Explore rental fit
                  </ProtocolsTrackedLink>
                  <ProtocolsTrackedLink
                    href="/research"
                    ctaRole="supporting"
                    source="protocol_detail_static_access"
                    className="inline-flex min-h-11 items-center rounded-lg border border-transparent px-2 text-sm font-semibold text-slate-200 underline decoration-white/[0.28] underline-offset-4 hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    Review evidence
                  </ProtocolsTrackedLink>
                  <ProtocolsTrackedLink
                    href={conditionHref}
                    ctaRole="supporting"
                    source="protocol_detail_static_access"
                    className="inline-flex min-h-11 items-center rounded-lg border border-transparent px-2 text-sm font-semibold text-slate-200 underline decoration-white/[0.28] underline-offset-4 hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    View related condition
                  </ProtocolsTrackedLink>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

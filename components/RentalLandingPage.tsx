import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import analytics from '@/src/lib/analytics';
import { resolveRentalProductId } from '@/lib/commerce/rental-catalog';
import {
  buildPlannerSearchParams,
  parsePlannerSearchParams,
  summarizePlannerSelection,
} from '@/lib/planner-state';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { storePlanningLinks } from '@/content/topical-graph';
import { disclaimers } from '@/content/disclaimers';
import { MedicalDisclaimer } from '@/components/shared/MedicalDisclaimer';
import { OptimizedImage } from '@/components/shared/OptimizedImage';
import { NavigateFunction } from '../types';
import {
  rentalLandingContent,
  rentalProducts,
  RentalBudgetFilter,
  RentalTechnologyFilter,
} from '../content/rental';
import { priceBookMonthlyText, priceBookText } from '@/lib/money';

interface RentalLandingPageProps {
  onNavigate: NavigateFunction;
  hideIntroShell?: boolean;
}

const technologyOrder: Array<Exclude<RentalTechnologyFilter, 'all'>> = ['HBOT', 'H2', 'RLT', 'PEMF'];
const RENTAL_FILTER_STATUS_ID = 'rental-filter-status';
export const RENTAL_LANDING_ACTION_STATUS_ID = 'rental-landing-action-status';
const RENTAL_LANDING_ACTION_READY_STATUS = 'Rental landing handoffs are ready.';

const rentalBudgetFilterLabels: Record<RentalBudgetFilter, string> = {
  all: 'all budgets',
  'upto-500': `up to ${priceBookText(500)} per month`,
  '500-1000': `${priceBookText(500)} to ${priceBookText(1000)} per month`,
  '1000-2000': `${priceBookText(1000)} to ${priceBookText(2000)} per month`,
  '2000-plus': `${priceBookText(2000)} plus per month`,
};

const planningLinkCopy: Record<string, string> = {
  '/conditions': 'Start with the goal you want to improve before choosing a system.',
  '/protocols': 'See how rental-eligible devices fit into structured routines and next steps.',
  '/research': 'Review the evidence layer and limitations before committing to a device.',
  '/contact': 'Use advisor support for delivery, fit, logistics, or commercial questions.',
  '/store': 'Compare the wider catalog if you are still choosing between rent and ownership.',
};

const policyLinks = [
  { href: '/shipping', label: 'Shipping' },
  { href: '/returns', label: 'Returns' },
  { href: '/warranty', label: 'Warranty' },
  { href: '/terms', label: 'Terms' },
] as const;

type RentalRouteTransitionSource = 'hero' | 'program_fact' | 'related_paths' | 'final_cta';
type RentalRouteTransitionRole = 'primary' | 'supporting' | 'policy' | 'resource';

const matchesBudget = (price: number, budget: RentalBudgetFilter): boolean => {
  if (budget === 'all') return true;
  if (budget === 'upto-500') return price <= 500;
  if (budget === '500-1000') return price > 500 && price <= 1000;
  if (budget === '1000-2000') return price > 1000 && price <= 2000;
  return price > 2000;
};

const formatRentalFilterStatus = (
  technology: RentalTechnologyFilter,
  budget: RentalBudgetFilter,
  count: number
): string => {
  const technologyLabel = technology === 'all' ? 'all technologies' : technology;
  const deviceCopy = count === 1 ? 'rental device matches' : 'rental devices match';

  return `${count} ${deviceCopy} ${technologyLabel} and ${rentalBudgetFilterLabels[budget]}.`;
};

// Was a local Intl formatter hardcoded to EUR against a PLN price book.
const formatPrice = (amount: number): string => priceBookText(amount);

const formatUpdatedLabel = (): string =>
  new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00.000Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

const formatRentalActionStatus = (destination: string): string => {
  if (destination === '#available-rental-devices') {
    return 'Opening available rental devices from the rental hub.';
  }

  if (destination.startsWith('/rental/checkout')) {
    return 'Opening rental checkout request from the rental hub.';
  }

  if (destination.startsWith('/contact')) {
    return 'Opening rental advisor support from the rental hub.';
  }

  if (destination.startsWith('/product')) {
    return 'Opening product details from the rental hub.';
  }

  if (destination.startsWith('/wellness-planner')) {
    return 'Opening wellness planner from the rental hub.';
  }

  if (policyLinks.some((link) => link.href === destination)) {
    return `Opening ${destination.replace('/', '')} policy from the rental hub.`;
  }

  return `Opening ${destination} from the rental hub.`;
};

export const RentalLandingPage: React.FC<RentalLandingPageProps> = ({
  hideIntroShell = false,
  onNavigate: _onNavigate,
}) => {
  const searchParams = useSearchParams();
  const [technology, setTechnology] = useState<RentalTechnologyFilter>('all');
  const [budget, setBudget] = useState<RentalBudgetFilter>('all');
  const [actionStatus, setActionStatus] = useState(RENTAL_LANDING_ACTION_READY_STATUS);
  const plannerState = useMemo(() => parsePlannerSearchParams(searchParams), [searchParams]);

  const requestedProductId = useMemo(() => {
    const requestedItems = (searchParams.get('items') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const requestedToken = searchParams.get('device') ?? requestedItems[0] ?? '';
    return requestedToken ? resolveRentalProductId(requestedToken) ?? null : null;
  }, [searchParams]);

  const requestedProduct = useMemo(
    () => rentalProducts.find((product) => product.id === requestedProductId) ?? null,
    [requestedProductId]
  );

  useEffect(() => {
    if (!requestedProduct) {
      return;
    }

    setTechnology(requestedProduct.modality);
    setBudget('all');
  }, [requestedProduct]);

  const availableTechnologies = useMemo(
    () =>
      technologyOrder.filter((candidate) =>
        rentalProducts.some((product) => product.modality === candidate)
      ),
    []
  );

  const lowestRentalPrice = useMemo(() => {
    if (rentalProducts.length === 0) return 0;
    return Math.min(...rentalProducts.map((product) => product.rentalMonthly));
  }, []);

  const filteredProducts = useMemo(
    () =>
      rentalProducts.filter((product) => {
        const technologyMatch = technology === 'all' || product.modality === technology;
        const budgetMatch = matchesBudget(product.rentalMonthly, budget);
        return technologyMatch && budgetMatch;
      }),
    [budget, technology]
  );
  const filterStatus = formatRentalFilterStatus(technology, budget, filteredProducts.length);

  const plannerSummaryLines = useMemo(
    () => (plannerState ? summarizePlannerSelection(plannerState).slice(0, 3) : []),
    [plannerState]
  );

  const withPlannerState = (pathname: string, extraParams?: Record<string, string>) => {
    if (!plannerState) {
      if (!extraParams || Object.keys(extraParams).length === 0) {
        return pathname;
      }

      const fallbackQuery = new URLSearchParams(extraParams).toString();
      return fallbackQuery ? `${pathname}?${fallbackQuery}` : pathname;
    }

    const params = buildPlannerSearchParams(plannerState);
    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) => params.set(key, value));
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const featuredProduct = requestedProduct ?? filteredProducts[0] ?? rentalProducts[0] ?? null;
  const heroPrimaryHref = requestedProduct
    ? withPlannerState('/rental/checkout', { device: requestedProduct.slug })
    : '#available-rental-devices';
  const heroPrimaryLabel = requestedProduct
    ? `Start request for ${requestedProduct.title}`
    : rentalLandingContent.hero.cta;
  const updatedLabel = formatUpdatedLabel();
  const planningLinks = storePlanningLinks.filter((link) => link.href !== '/rental');
  const announceRentalRouteAction = React.useCallback((destination: string) => {
    setActionStatus(formatRentalActionStatus(destination));
  }, []);
  const trackRentalRouteTransition = React.useCallback(
    (
      destination: string,
      source: RentalRouteTransitionSource,
      ctaRole: RentalRouteTransitionRole,
      extra?: Record<string, unknown>
    ) => {
      announceRentalRouteAction(destination);
      analytics.capture('rental_route_transition_clicked', {
        cta_role: ctaRole,
        destination,
        source,
        ...extra,
      });
    },
    [announceRentalRouteAction]
  );

  return (
    <div
      className={`min-h-screen bg-[var(--surface-ink)] pb-16 ${hideIntroShell ? 'pt-6' : 'pt-24'}`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p
          id={RENTAL_LANDING_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Rental landing action status"
          className="sr-only"
        >
          {actionStatus}
        </p>

        {!hideIntroShell && (
          <section className="rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Rental hub
                </p>
                <h1 id="rental-hero-headline" className="mt-3 max-w-3xl text-3xl font-bold text-white md:text-4xl">
                  {rentalLandingContent.hero.title}
                </h1>
                <p
                  id="rental-hero-description"
                  className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-base"
                >
                  {rentalLandingContent.hero.subtitle} From {priceBookMonthlyText(lowestRentalPrice)}.
                </p>

                {plannerSummaryLines.length > 0 && (
                  <div className="mt-5 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
                    <p className="font-semibold">Planner context carried into rental:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {plannerSummaryLines.map((line) => (
                        <span
                          key={line}
                          className="rounded-full bg-white/[0.045] px-3 py-1 text-xs font-medium text-cyan-100"
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {requestedProduct && (
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
                    <Sparkles size={16} className="text-cyan-200" />
                    Preselected from product page: {requestedProduct.title}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={heroPrimaryHref}
                    aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
                    className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 text-sm font-semibold text-[rgb(15,23,42)] transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                    onFocus={() => announceRentalRouteAction(heroPrimaryHref)}
                    onClick={() => {
                      analytics.capture('rental_hub_primary_cta_clicked', {
                        destination: heroPrimaryHref,
                        selected_product: requestedProduct?.id ?? null,
                      });
                      trackRentalRouteTransition(heroPrimaryHref, 'hero', 'primary', {
                        selected_product: requestedProduct?.id ?? null,
                      });
                    }}
                  >
                    {heroPrimaryLabel}
                  </Link>
                  <Link
                    href={withPlannerState('/contact', { intent: 'rental' })}
                    aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
                    className="inline-flex min-h-11 items-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                    onFocus={() =>
                      announceRentalRouteAction(withPlannerState('/contact', { intent: 'rental' }))
                    }
                    onClick={() => {
                      analytics.capture('rental_hub_contact_clicked', {
                        source: 'hero',
                        selected_product: requestedProduct?.id ?? null,
                      });
                      trackRentalRouteTransition(
                        withPlannerState('/contact', { intent: 'rental' }),
                        'hero',
                        'supporting',
                        { selected_product: requestedProduct?.id ?? null }
                      );
                    }}
                  >
                    {rentalLandingContent.hero.secondaryCta}
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {rentalLandingContent.hero.supportingPoints.map((point) => (
                    <div
                      key={point}
                      className="rounded-lg border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-400"
                    >
                      {point}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium text-slate-400">
                  {policyLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
                      className="inline-flex min-h-11 items-center rounded-lg px-1 underline decoration-slate-500 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                      onFocus={() => announceRentalRouteAction(link.href)}
                      onClick={() =>
                        trackRentalRouteTransition(link.href, 'hero', 'policy')
                      }
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <aside className="rounded-lg border border-white/10 bg-slate-950 p-5 sm:p-6 text-white min-w-0 lg:sticky lg:top-24 h-fit">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Ownership and support
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={16} className="mt-0.5 text-cyan-300 shrink-0" />
                    <span>
                      {siteOwnership.commerce.label}: {siteOwnership.commerce.team}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileCheck2 size={16} className="mt-0.5 text-cyan-300 shrink-0" />
                    <span>
                      {siteOwnership.editorial.label}: {siteOwnership.editorial.team}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock3 size={16} className="mt-0.5 text-cyan-300 shrink-0" />
                    <span>Updated {updatedLabel}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Truck size={16} className="mt-0.5 text-cyan-300 shrink-0" />
                    <span>{siteEntity.serviceArea} delivery and support coverage</span>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.045] p-4 text-sm text-slate-200 min-w-0">
                  <p className="font-semibold text-white">{siteEntity.supportHours}</p>
                  <p className="mt-1 break-all">{siteEntity.supportEmail}</p>
                  <p className="mt-3 text-slate-300">
                    Use the rental hub when you want to compare terms first, then move into a manual
                    review and delivery-confirmation flow.
                  </p>
                </div>
              </aside>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Program facts
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">What the published rental flow already confirms</h2>
            </div>
            <p className="max-w-2xl text-sm text-slate-400">
              These facts stay intentionally conservative and point back to the supporting policy or
              contact pages when the final agreement depends on device, term, or operator review.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {rentalLandingContent.programFacts.map((fact) => (
              <article key={fact.title} className="rounded-lg border border-white/10 p-5">
                <h3 className="text-base font-semibold text-white">{fact.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{fact.text}</p>
                <Link
                  href={fact.href}
                  aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-cyan-200 transition-colors hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                  onFocus={() => announceRentalRouteAction(fact.href)}
                  onClick={() => {
                    analytics.capture('rental_hub_program_fact_clicked', {
                      title: fact.title,
                      destination: fact.href,
                    });
                    trackRentalRouteTransition(fact.href, 'program_fact', 'resource', {
                      title: fact.title,
                    });
                  }}
                >
                  {fact.cta}
                  <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
          <h2 className="text-xl font-bold text-white">How it works</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {rentalLandingContent.howItWorks.map((step) => (
              <article key={step.number} className="rounded-lg border border-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                  Step {step.number}
                </p>
                <h3 className="mt-2 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="available-rental-devices"
          className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Available devices</h2>
              <p className="mt-2 text-sm text-slate-400">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'device matches' : 'devices match'} your current filters.
              </p>
            </div>
            {featuredProduct && (
              <p className="text-sm text-slate-400">
                Fastest next step: start a request for <span className="font-semibold text-white">{featuredProduct.title}</span>.
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Technology
              </span>
              <select
                aria-describedby={RENTAL_FILTER_STATUS_ID}
                value={technology}
                onChange={(event) => {
                  const nextValue = event.target.value as RentalTechnologyFilter;
                  setTechnology(nextValue);
                  analytics.capture('rental_hub_filter_changed', {
                    filter: 'technology',
                    value: nextValue,
                  });
                }}
                className="mt-1 min-h-11 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-slate-100"
              >
                <option value="all">All</option>
                {availableTechnologies.map((candidate) => (
                  <option key={candidate} value={candidate}>
                    {candidate}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Budget/mo
              </span>
              <select
                aria-describedby={RENTAL_FILTER_STATUS_ID}
                value={budget}
                onChange={(event) => {
                  const nextValue = event.target.value as RentalBudgetFilter;
                  setBudget(nextValue);
                  analytics.capture('rental_hub_filter_changed', {
                    filter: 'budget',
                    value: nextValue,
                  });
                }}
                className="mt-1 min-h-11 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-slate-100"
              >
                <option value="all">All</option>
                <option value="upto-500">Up to {priceBookText(500)}</option>
                <option value="500-1000">{priceBookText(500)}-{priceBookText(1000)}</option>
                <option value="1000-2000">{priceBookText(1000)}-{priceBookText(2000)}</option>
                <option value="2000-plus">{priceBookText(2000)}+</option>
              </select>
            </label>
          </div>

          <p
            id={RENTAL_FILTER_STATUS_ID}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label="Rental filter status"
            className="mt-3 rounded-lg border border-white/10 bg-slate-950/55 px-4 py-3 text-sm leading-6 text-slate-300"
          >
            {filterStatus}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const isRequestedProduct = requestedProduct?.id === product.id;
              const checkoutHref = withPlannerState('/rental/checkout', {
                device: product.slug,
              });

              return (
                <article
                  key={product.id}
                  className={`overflow-hidden rounded-lg border ${
                    isRequestedProduct ? 'border-cyan-400 shadow-[0_18px_40px_rgba(6,182,212,0.14)]' : 'border-white/10'
                  }`}
                >
                  <div className="relative aspect-[16/10] bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),transparent_58%),linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.96)_100%)]">
                    {product.image ? (
                      <OptimizedImage
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 to-slate-900/80" />
                    )}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                        {product.modality}
                      </span>
                      {isRequestedProduct && (
                        <span className="rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgb(15,23,42)]">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white">{product.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {product.shortDescription}
                    </p>
                    <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                        Availability
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">{product.availabilityLabel}</p>
                      <p className="mt-1 text-xs leading-5 text-cyan-100/80">{product.availabilityNote}</p>
                    </div>

                    <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-slate-950/55 p-3 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Rental from
                        </p>
                        <p className="mt-1 text-lg font-bold text-white break-words">
                          {priceBookMonthlyText(product.rentalMonthly)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-slate-950/55 p-3 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Purchase price
                        </p>
                        <p className="mt-1 text-lg font-bold text-white break-words">
                          {formatPrice(product.purchasePrice)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-400">
                      <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 break-words">
                        Minimum term {product.minimumTermMonths} month{product.minimumTermMonths === 1 ? '' : 's'}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 break-words">
                        Deposit from {formatPrice(product.deposit)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 break-words">
                        Terms {product.availableTerms.join(', ')} months
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-400 break-words">{product.selectionRationale}</p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={checkoutHref}
                        aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
                        className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-[rgb(15,23,42)] transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                        onFocus={() => announceRentalRouteAction(checkoutHref)}
                        onClick={() => {
                          announceRentalRouteAction(checkoutHref);
                          analytics.capture('rental_hub_request_started', {
                            product_id: product.id,
                            source: 'card',
                          });
                        }}
                      >
                        Start rental request
                      </Link>
                      <Link
                        href={withPlannerState(product.productPath, { mode: 'rental' })}
                        aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
                        className="inline-flex min-h-11 items-center rounded-lg border border-white/15 px-4 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                        onFocus={() =>
                          announceRentalRouteAction(
                            withPlannerState(product.productPath, { mode: 'rental' })
                          )
                        }
                        onClick={() => {
                          analytics.capture('rental_hub_product_link_clicked', {
                            product_id: product.id,
                            destination: product.productPath,
                          });
                          trackRentalRouteTransition(
                            withPlannerState(product.productPath, { mode: 'rental' }),
                            'related_paths',
                            'resource',
                            { product_id: product.id }
                          );
                        }}
                      >
                        View product details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/55 p-5">
              <p className="text-sm text-slate-400">
                No devices match the current combination. Broaden the filters or talk to an advisor
                if you want help finding the closest fit.
              </p>
              <Link
                href={withPlannerState('/contact', { intent: 'rental' })}
                aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
                className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-white/15 px-4 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                onFocus={() =>
                  announceRentalRouteAction(withPlannerState('/contact', { intent: 'rental' }))
                }
                onClick={() => {
                  analytics.capture('rental_hub_contact_clicked', {
                    source: 'empty_state',
                    technology,
                    budget,
                  });
                  trackRentalRouteTransition(
                    withPlannerState('/contact', { intent: 'rental' }),
                    'related_paths',
                    'supporting',
                    { budget, technology }
                  );
                }}
              >
                Talk to an advisor
              </Link>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
          <h2 className="text-xl font-bold text-white">
            Buy vs rent - which is right for you?
          </h2>
          <div className="mt-4 grid gap-3 md:hidden">
            {rentalLandingContent.comparisonRows.map((row) => (
              <article
                key={`mobile-comparison-${row.label}`}
                className="rounded-lg border border-white/10 bg-slate-950/55 p-4"
              >
                <h3 className="text-sm font-semibold text-white">{row.label}</h3>
                <dl className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-slate-400">Purchase</dt>
                    <dd className="text-right font-medium text-slate-200">{row.purchase}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-slate-400">Rental</dt>
                    <dd className="text-right font-medium text-slate-200">{row.rental}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="mt-4 hidden w-full overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-slate-300">
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Purchase</th>
                  <th className="py-2 pr-3">Rental</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                {rentalLandingContent.comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-white/10 last:border-0">
                    <td className="py-2 pr-3 font-medium text-slate-300">{row.label}</td>
                    <td className="py-2 pr-3">{row.purchase}</td>
                    <td className="py-2 pr-3">{row.rental}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Related paths
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Plan with research, protocols, and goal guides</h2>
            </div>
            <p className="max-w-2xl text-sm text-slate-400">
              The rental hub is one step in the wider Hylono journey. Use the surrounding guides
              when you need evidence review, protocol structure, or a different starting point.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {planningLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
                className="block min-h-11 rounded-lg border border-white/10 p-5 transition-colors hover:border-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                onFocus={() => announceRentalRouteAction(link.href)}
                onClick={() => {
                  analytics.capture('rental_hub_resource_clicked', {
                    destination: link.href,
                  });
                  trackRentalRouteTransition(link.href, 'related_paths', 'resource');
                }}
              >
                <h3 className="text-base font-semibold text-white">{link.label}</h3>
                <p className="mt-2 text-sm text-slate-400">{planningLinkCopy[link.href] ?? 'Open the supporting page.'}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                  Open path
                  <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
          <h2 className="text-xl font-bold text-white">Rental FAQ</h2>
          <div className="mt-4 space-y-3">
            {rentalLandingContent.faq.map((item) => (
              <details key={item.q} className="rounded-lg border border-white/10 p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-200">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm text-slate-400">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {rentalLandingContent.planningNotes.length > 0 && (
          <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
            <h2 className="text-xl font-bold text-white">Rental planning notes</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {rentalLandingContent.planningNotes.map((planningNote) => (
                <article key={planningNote.id} className="rounded-lg border border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-1 text-cyan-200" />
                    <div>
                      <p className="text-sm text-slate-300">{planningNote.quote}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {planningNote.author}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
          <h2 className="text-xl font-bold text-white">{rentalLandingContent.finalCta.title}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {featuredProduct ? (
              <Link
                href={withPlannerState('/rental/checkout', {
                  device: featuredProduct.slug,
                })}
                aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
                className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 text-sm font-semibold text-[rgb(15,23,42)] transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                onFocus={() =>
                  announceRentalRouteAction(
                    withPlannerState('/rental/checkout', {
                      device: featuredProduct.slug,
                    })
                  )
                }
                onClick={() => {
                  analytics.capture('rental_hub_request_started', {
                    product_id: featuredProduct.id,
                    source: 'final_cta',
                  });
                  trackRentalRouteTransition(
                    withPlannerState('/rental/checkout', {
                      device: featuredProduct.slug,
                    }),
                    'final_cta',
                    'primary',
                    { product_id: featuredProduct.id }
                  );
                }}
              >
                Start request for {featuredProduct.title}
              </Link>
            ) : null}
            <Link
              href={withPlannerState('/wellness-planner', { mode: 'rental' })}
              aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
              className="inline-flex min-h-11 items-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
              onFocus={() =>
                announceRentalRouteAction(withPlannerState('/wellness-planner', { mode: 'rental' }))
              }
              onClick={() => {
                analytics.capture('rental_hub_planner_clicked', {
                  destination: withPlannerState('/wellness-planner', { mode: 'rental' }),
                });
                trackRentalRouteTransition(
                  withPlannerState('/wellness-planner', { mode: 'rental' }),
                  'final_cta',
                  'supporting'
                );
              }}
            >
              {rentalLandingContent.finalCta.primary}
            </Link>
            <Link
              href={withPlannerState('/contact', { intent: 'rental' })}
              aria-describedby={RENTAL_LANDING_ACTION_STATUS_ID}
              className="inline-flex min-h-11 items-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
              onFocus={() =>
                announceRentalRouteAction(withPlannerState('/contact', { intent: 'rental' }))
              }
              onClick={() => {
                analytics.capture('rental_hub_contact_clicked', {
                  source: 'final_cta',
                });
                trackRentalRouteTransition(
                  withPlannerState('/contact', { intent: 'rental' }),
                  'final_cta',
                  'supporting'
                );
              }}
            >
              {rentalLandingContent.finalCta.secondary}
            </Link>
          </div>
        </section>

        <MedicalDisclaimer
          className="mt-6"
          customText={`${disclaimers.financing} ${disclaimers.general}`}
          variant="info"
        />
      </div>
    </div>
  );
};

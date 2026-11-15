'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { priceBookMonthlyText, priceBookText } from '@/lib/money';
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileCheck2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Truck,
} from 'lucide-react';
import { MedicalDisclaimer } from '@/components/shared/MedicalDisclaimer';
import { OptimizedImage } from '@/components/shared/OptimizedImage';
import { disclaimers } from '@/content/disclaimers';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { storePlanningLinks } from '@/content/topical-graph';
import { resolveRentalProductId } from '@/lib/commerce/rental-catalog';
import {
  buildPlannerSearchParams,
  parsePlannerSearchParams,
  summarizePlannerSelection,
} from '@/lib/planner-state';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import analytics from '@/src/lib/analytics';
import { NavigateFunction } from '@/types';
import {
  RentalBudgetFilter,
  RentalTechnologyFilter,
  rentalLandingContent,
  rentalProducts,
} from './rental-content';

interface Rental2LandingPageProps {
  onNavigate: NavigateFunction;
}

const technologyOrder: Array<Exclude<RentalTechnologyFilter, 'all'>> = [
  'HBOT',
  'H2',
  'RLT',
  'PEMF',
];
const RENTAL_FILTER_STATUS_ID = 'rental-filter-status';
export const RENTAL2_ROUTE_ACTION_STATUS_ID = 'rental2-route-action-status';
const RENTAL2_ROUTE_ACTION_STATUS_LABEL = 'Rental2 route action status';
const RENTAL2_ROUTE_ACTION_READY_STATUS =
  'Upgraded rental page handoffs are ready. Use rental requests, advisor support, product details, policy links, planning paths, or the wellness planner for next steps.';

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

const surfaceClass =
  'rounded-lg border border-white/10 bg-white/[0.045] shadow-none backdrop-blur';
const subSurfaceClass =
  'rounded-lg border border-white/10 bg-slate-950/55 shadow-none';
const overlineClass =
  'text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200';
const focusRingClass =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 focus-visible:ring-offset-2';
const primaryButtonClass = `inline-flex min-h-12 items-center justify-center rounded-lg bg-cyan-300 px-6 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-cyan-200 active:translate-y-0 ${focusRingClass} focus-visible:ring-offset-slate-950`;
const secondaryButtonClass = `inline-flex min-h-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-slate-200 transition-all hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-white/[0.07] hover:text-cyan-100 active:translate-y-0 ${focusRingClass} focus-visible:ring-offset-slate-950`;
const quietLinkClass = `inline-flex min-h-12 items-center justify-center rounded-lg px-2 text-sm font-semibold text-slate-300 transition-colors hover:text-cyan-100 ${focusRingClass} focus-visible:ring-offset-slate-950`;
const selectClass = `mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 text-sm text-white shadow-none transition-colors hover:border-cyan-300/45 ${focusRingClass} focus-visible:ring-offset-slate-950`;

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

const formatRental2RouteActionStatus = (destination: string, source: string): string => {
  if (destination === '#available-rental-devices') {
    return 'Opening available rental devices from the upgraded rental page.';
  }

  if (destination.startsWith('/rental/checkout')) {
    return 'Opening rental checkout request from the upgraded rental page.';
  }

  if (destination.startsWith('/contact')) {
    return 'Opening rental advisor support from the upgraded rental page.';
  }

  if (destination.startsWith('/wellness-planner')) {
    return 'Opening the wellness planner from the upgraded rental page.';
  }

  if (destination.startsWith('/product/')) {
    return 'Opening product details from the upgraded rental page.';
  }

  if (destination === '/shipping') {
    return 'Opening shipping policy from the upgraded rental page.';
  }

  if (destination === '/returns') {
    return 'Opening returns policy from the upgraded rental page.';
  }

  if (destination === '/warranty') {
    return 'Opening warranty policy from the upgraded rental page.';
  }

  if (destination === '/terms') {
    return 'Opening terms from the upgraded rental page.';
  }

  return `Opening ${source} from the upgraded rental page.`;
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

export const Rental2LandingPage: React.FC<Rental2LandingPageProps> = ({
  onNavigate: _onNavigate,
}) => {
  const searchParams = useSearchParams();
  const [technology, setTechnology] = useState<RentalTechnologyFilter>('all');
  const [budget, setBudget] = useState<RentalBudgetFilter>('all');
  const [routeActionStatus, setRouteActionStatus] = useState(
    RENTAL2_ROUTE_ACTION_READY_STATUS
  );
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

  const announceRental2RouteAction = (destination: string, source: string) => {
    setRouteActionStatus(formatRental2RouteActionStatus(destination, source));
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

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-20 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <section className={`${surfaceClass} overflow-hidden`}>
          <div className="grid gap-8 p-6 sm:p-8 lg:p-10 xl:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="relative">
              <p className={overlineClass}>Rental hub</p>
              <h1
                id="rental-hero-headline"
                className="mt-4 max-w-4xl font-[var(--font-syncopate)] text-4xl leading-[1.05] text-white sm:text-5xl lg:text-[3.55rem]"
              >
                {rentalLandingContent.hero.title}
              </h1>
              <p
                id="rental-hero-description"
                className="mt-5 max-w-[70ch] text-base leading-7 text-slate-300 sm:text-lg"
              >
                {rentalLandingContent.hero.subtitle} From {priceBookMonthlyText(lowestRentalPrice)}.
              </p>

              {plannerSummaryLines.length > 0 && (
                <div className="mt-6 max-w-3xl rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm text-cyan-100">
                  <p className="font-semibold">Planner context carried into rental</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {plannerSummaryLines.map((line) => (
                      <span
                        key={line}
                        className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {requestedProduct && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 shadow-none">
                  <Sparkles size={16} className="text-cyan-200" />
                  Preselected from product page: {requestedProduct.title}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={heroPrimaryHref}
                  className={primaryButtonClass}
                  aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceRental2RouteAction(heroPrimaryHref, 'hero primary CTA')}
                  onClick={() => {
                    announceRental2RouteAction(heroPrimaryHref, 'hero primary CTA');
                    analytics.capture('rental_hub_primary_cta_clicked', {
                      destination: heroPrimaryHref,
                      selected_product: requestedProduct?.id ?? null,
                    });
                  }}
                >
                  {heroPrimaryLabel}
                </Link>
                <Link
                  href={withPlannerState('/contact', { intent: 'rental' })}
                  className={secondaryButtonClass}
                  aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                  onFocus={() =>
                    announceRental2RouteAction(
                      withPlannerState('/contact', { intent: 'rental' }),
                      'hero advisor CTA'
                    )
                  }
                  onClick={() => {
                    announceRental2RouteAction(
                      withPlannerState('/contact', { intent: 'rental' }),
                      'hero advisor CTA'
                    );
                    analytics.capture('rental_hub_contact_clicked', {
                      source: 'hero',
                      selected_product: requestedProduct?.id ?? null,
                    });
                  }}
                >
                  {rentalLandingContent.hero.secondaryCta}
                </Link>
              </div>

              <p
                id={RENTAL2_ROUTE_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={RENTAL2_ROUTE_ACTION_STATUS_LABEL}
                className="sr-only"
              >
                {routeActionStatus}
              </p>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {rentalLandingContent.hero.supportingPoints.map((point) => (
                  <div key={point} className={`${subSurfaceClass} px-4 py-4 text-sm leading-6 text-slate-300`}>
                    {point}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-300">
                <Link
                  href="/shipping"
                  className={`${quietLinkClass} rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2`}
                  aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceRental2RouteAction('/shipping', 'shipping policy')}
                  onClick={() => announceRental2RouteAction('/shipping', 'shipping policy')}
                >
                  Shipping
                </Link>
                <Link
                  href="/returns"
                  className={`${quietLinkClass} rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2`}
                  aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceRental2RouteAction('/returns', 'returns policy')}
                  onClick={() => announceRental2RouteAction('/returns', 'returns policy')}
                >
                  Returns
                </Link>
                <Link
                  href="/warranty"
                  className={`${quietLinkClass} rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2`}
                  aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceRental2RouteAction('/warranty', 'warranty policy')}
                  onClick={() => announceRental2RouteAction('/warranty', 'warranty policy')}
                >
                  Warranty
                </Link>
                <Link
                  href="/terms"
                  className={`${quietLinkClass} rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2`}
                  aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceRental2RouteAction('/terms', 'terms policy')}
                  onClick={() => announceRental2RouteAction('/terms', 'terms policy')}
                >
                  Terms
                </Link>
              </div>
            </div>

            <aside className="flex flex-col gap-4 rounded-lg bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)] xl:sticky xl:top-28">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Ownership and support
                </p>
                <div className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={16} className="mt-1 text-cyan-300" />
                    <span>
                      {siteOwnership.commerce.label}: {siteOwnership.commerce.team}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileCheck2 size={16} className="mt-1 text-cyan-300" />
                    <span>
                      {siteOwnership.editorial.label}: {siteOwnership.editorial.team}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock3 size={16} className="mt-1 text-cyan-300" />
                    <span>Updated {updatedLabel}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Truck size={16} className="mt-1 text-cyan-300" />
                    <span>{siteEntity.serviceArea} delivery and support coverage</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Current lead option
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight text-white">
                  {featuredProduct ? featuredProduct.title : 'Rental planning'}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {featuredProduct
                    ? featuredProduct.selectionRationale
                    : 'Use the main CTA to review current devices and available terms.'}
                </p>

                {featuredProduct ? (
                  <>
                    <div className="mt-5 grid gap-3">
                      <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Rental from
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-white">
                          {priceBookMonthlyText(featuredProduct.rentalMonthly)}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Deposit
                          </p>
                          <p className="mt-1 text-base font-semibold text-white">
                            {formatPrice(featuredProduct.deposit)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Terms
                          </p>
                          <p className="mt-1 text-base font-semibold text-white">
                            {featuredProduct.availableTerms.join(', ')} months
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={withPlannerState(featuredProduct.productPath, { mode: 'rental' })}
                        className={`inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.045] px-5 text-sm font-semibold text-white transition-all hover:border-cyan-300/50 hover:bg-white/[0.07] ${focusRingClass} focus-visible:ring-offset-slate-950`}
                        aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                        onFocus={() =>
                          announceRental2RouteAction(
                            withPlannerState(featuredProduct.productPath, { mode: 'rental' }),
                            'featured product details'
                          )
                        }
                        onClick={() => {
                          announceRental2RouteAction(
                            withPlannerState(featuredProduct.productPath, { mode: 'rental' }),
                            'featured product details'
                          );
                          analytics.capture('rental_hub_product_link_clicked', {
                            product_id: featuredProduct.id,
                            destination: featuredProduct.productPath,
                          });
                        }}
                      >
                        View product details
                      </Link>
                      <Link
                        href={withPlannerState('/contact', { intent: 'rental' })}
                        className={`inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-sm font-semibold text-cyan-200 transition-colors hover:text-white ${focusRingClass} focus-visible:ring-offset-slate-950`}
                        aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                        onFocus={() =>
                          announceRental2RouteAction(
                            withPlannerState('/contact', { intent: 'rental' }),
                            'featured advisor support'
                          )
                        }
                        onClick={() => {
                          announceRental2RouteAction(
                            withPlannerState('/contact', { intent: 'rental' }),
                            'featured advisor support'
                          );
                          analytics.capture('rental_hub_contact_clicked', {
                            source: 'featured_panel',
                          });
                        }}
                      >
                        Talk to an advisor
                      </Link>
                    </div>
                  </>
                ) : null}
              </div>
            </aside>
          </div>
        </section>

        <section className={`${surfaceClass} p-6 sm:p-8`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={overlineClass}>Program facts</p>
              <h2 className="mt-3 max-w-3xl text-2xl font-semibold text-white sm:text-3xl">
                What the published rental flow already confirms
              </h2>
            </div>
            <p className="max-w-[68ch] text-sm leading-7 text-slate-300 sm:text-base">
              These facts stay intentionally conservative and point back to the supporting policy or
              contact pages when the final agreement depends on device, term, or operator review.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rentalLandingContent.programFacts.map((fact) => (
              <article key={fact.title} className={`${subSurfaceClass} flex h-full flex-col p-5`}>
                <p className={overlineClass}>Verified page note</p>
                <h3 className="mt-3 text-lg font-semibold text-white">{fact.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">{fact.text}</p>
                <Link
                  href={fact.href}
                  className={`mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-cyan-200 transition-colors hover:text-white ${focusRingClass} focus-visible:ring-offset-slate-950`}
                  aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceRental2RouteAction(fact.href, fact.title)}
                  onClick={() => {
                    announceRental2RouteAction(fact.href, fact.title);
                    analytics.capture('rental_hub_program_fact_clicked', {
                      title: fact.title,
                      destination: fact.href,
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

        <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className={`${surfaceClass} p-5 sm:p-6 xl:sticky xl:top-28 xl:self-start`}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
                <SlidersHorizontal size={18} />
              </div>
              <div>
                <p className={overlineClass}>Available devices</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Filter the live shortlist</h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'device matches' : 'devices match'} your current
              filters.
            </p>

            {featuredProduct ? (
              <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/55 p-4">
                <p className={overlineClass}>Current lead option</p>
                <p className="mt-3 text-lg font-semibold text-white">{featuredProduct.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Fastest next step: start a request for {featuredProduct.title}.
                </p>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4">
              <label className="text-sm font-medium text-slate-300">
                Technology
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
                  className={selectClass}
                >
                  <option value="all">All</option>
                  {availableTechnologies.map((candidate) => (
                    <option key={candidate} value={candidate}>
                      {candidate}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-300">
                Budget/mo
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
                  className={selectClass}
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
              className="mt-4 rounded-lg border border-white/10 bg-slate-950/55 px-4 py-3 text-sm leading-6 text-slate-300"
            >
              {filterStatus}
            </p>
          </div>

          <section id="available-rental-devices" className={`${surfaceClass} p-5 sm:p-6`}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const isRequestedProduct = requestedProduct?.id === product.id;
                const checkoutHref = withPlannerState('/rental/checkout', {
                  device: product.slug,
                });

                return (
                  <article
                    key={product.id}
                    className={`flex h-full flex-col overflow-hidden rounded-lg border bg-white/[0.045] ${
                      isRequestedProduct
                        ? 'border-cyan-400 shadow-[0_20px_48px_rgba(6,182,212,0.16)]'
                        : 'border-white/10 shadow-[0_18px_42px_rgba(2,6,23,0.22)]'
                    }`}
                  >
                    <div className="relative aspect-[16/10] border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),transparent_58%),linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.96)_100%)]">
                      {product.image ? (
                        <OptimizedImage
                          src={product.image}
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-contain p-5"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
                      )}
                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <span className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                          {product.modality}
                        </span>
                        {isRequestedProduct && (
                          <span className="rounded-lg bg-cyan-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-950">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-semibold text-white">{product.title}</h3>
                      <p className="mt-3 max-w-[60ch] text-sm leading-7 text-slate-300">
                        {product.shortDescription}
                      </p>
                      <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                          Availability
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">{product.availabilityLabel}</p>
                        <p className="mt-1 text-xs leading-5 text-cyan-100/80">{product.availabilityNote}</p>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                          <p className={overlineClass}>Rental from</p>
                          <p className="mt-2 text-2xl font-semibold text-white">
                            {priceBookMonthlyText(product.rentalMonthly)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                          <p className={overlineClass}>Purchase price</p>
                          <p className="mt-2 text-2xl font-semibold text-white">
                            {formatPrice(product.purchasePrice)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        <span className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 normal-case tracking-normal text-slate-300">
                          Minimum term {product.minimumTermMonths} month
                          {product.minimumTermMonths === 1 ? '' : 's'}
                        </span>
                        <span className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 normal-case tracking-normal text-slate-300">
                          Deposit from {formatPrice(product.deposit)}
                        </span>
                        <span className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 normal-case tracking-normal text-slate-300">
                          Terms {product.availableTerms.join(', ')} months
                        </span>
                      </div>

                      <p className="mt-5 flex-1 text-sm leading-7 text-slate-300">
                        {product.selectionRationale}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={checkoutHref}
                          className={secondaryButtonClass}
                          aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                          onFocus={() =>
                            announceRental2RouteAction(checkoutHref, 'product card rental request')
                          }
                          onClick={() => {
                            announceRental2RouteAction(checkoutHref, 'product card rental request');
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
                          className={quietLinkClass}
                          aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                          onFocus={() =>
                            announceRental2RouteAction(
                              withPlannerState(product.productPath, { mode: 'rental' }),
                              'product card details'
                            )
                          }
                          onClick={() => {
                            announceRental2RouteAction(
                              withPlannerState(product.productPath, { mode: 'rental' }),
                              'product card details'
                            );
                            analytics.capture('rental_hub_product_link_clicked', {
                              product_id: product.id,
                              destination: product.productPath,
                            });
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
              <div className="mt-2 flex min-h-[320px] items-center justify-center">
                <div className="max-w-xl rounded-lg border border-white/10 bg-slate-950/55 p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-none">
                    <CircleAlert size={20} />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-white">
                    No devices match the current combination
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Broaden the filters or talk to an advisor if you want help finding the closest
                    fit.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      href={withPlannerState('/contact', { intent: 'rental' })}
                      className={secondaryButtonClass}
                      aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                      onFocus={() =>
                        announceRental2RouteAction(
                          withPlannerState('/contact', { intent: 'rental' }),
                          'empty state advisor support'
                        )
                      }
                      onClick={() => {
                        announceRental2RouteAction(
                          withPlannerState('/contact', { intent: 'rental' }),
                          'empty state advisor support'
                        );
                        analytics.capture('rental_hub_contact_clicked', {
                          source: 'empty_state',
                          technology,
                          budget,
                        });
                      }}
                    >
                      Talk to an advisor
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </section>
        </section>

        <section className={`${surfaceClass} p-6 sm:p-8`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={overlineClass}>Buy vs rent</p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                Which path is right for you?
              </h2>
            </div>
            <p className="max-w-[66ch] text-sm leading-7 text-slate-300 sm:text-base">
              Compare the same published terms without the mobile overflow from the original matrix.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {rentalLandingContent.comparisonRows.map((row) => (
              <article key={row.label} className={`${subSurfaceClass} p-5`}>
                <p className={overlineClass}>{row.label}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="text-sm font-semibold text-white">Purchase</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{row.purchase}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Rental</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{row.rental}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <section className={`${surfaceClass} p-6 sm:p-8`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={overlineClass}>Related paths</p>
                <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                  Plan with research, protocols, and goal guides
                </h2>
              </div>
              <p className="max-w-[66ch] text-sm leading-7 text-slate-300 sm:text-base">
                The rental hub is one step in the wider Hylono journey. Use the surrounding guides
                when you need evidence review, protocol structure, or a different starting point.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {planningLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${subSurfaceClass} p-5 transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_18px_40px_rgba(6,182,212,0.12)] ${focusRingClass} focus-visible:ring-offset-slate-950`}
                  aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceRental2RouteAction(link.href, link.label)}
                  onClick={() => {
                    announceRental2RouteAction(link.href, link.label);
                    analytics.capture('rental_hub_resource_clicked', {
                      destination: link.href,
                    });
                  }}
                >
                  <p className={overlineClass}>Supporting page</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{link.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {planningLinkCopy[link.href] ?? 'Open the supporting page.'}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                    Open path
                    <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className={`${surfaceClass} p-6 sm:p-8`}>
            <p className={overlineClass}>Rental FAQ</p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Common planning questions
            </h2>
            <div className="mt-6 space-y-3">
              {rentalLandingContent.faq.map((item) => (
                <details
                  key={item.q}
                  className={`${subSurfaceClass} group p-5 open:border-cyan-300 open:bg-white/[0.07]`}
                >
                  <summary
                    className={`cursor-pointer list-none rounded-lg text-sm font-semibold leading-6 text-white ${focusRingClass} focus-visible:ring-offset-slate-950`}
                  >
                    {item.q}
                  </summary>
                  <p className="mt-3 max-w-[65ch] text-sm leading-7 text-slate-300">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </section>

        {rentalLandingContent.planningNotes.length > 0 && (
          <section className={`${surfaceClass} p-6 sm:p-8`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={overlineClass}>Rental planning notes</p>
                <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                  Keep support, policy, and fit in the same conversation
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {rentalLandingContent.planningNotes.map((planningNote) => (
                <article key={planningNote.id} className={`${subSurfaceClass} p-5`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-1 text-cyan-200" />
                    <div>
                      <p className="text-sm leading-7 text-slate-300">{planningNote.quote}</p>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {planningNote.author}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-lg border border-slate-950/10 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_45%,#164e63_100%)] px-6 py-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.22)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[70ch]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Final CTA
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {rentalLandingContent.finalCta.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-200 sm:text-base">
                Keep the next step clear: start a request for the current lead device, then use the
                planner or advisor path only if you still need fit guidance.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {featuredProduct ? (
                <Link
                  href={withPlannerState('/rental/checkout', {
                    device: featuredProduct.slug,
                  })}
                  className={`inline-flex min-h-12 items-center justify-center rounded-lg bg-cyan-300 px-6 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-cyan-200 active:translate-y-0 ${focusRingClass} focus-visible:ring-offset-slate-950`}
                  aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                  onFocus={() =>
                    announceRental2RouteAction(
                      withPlannerState('/rental/checkout', {
                        device: featuredProduct.slug,
                      }),
                      'final rental request'
                    )
                  }
                  onClick={() => {
                    announceRental2RouteAction(
                      withPlannerState('/rental/checkout', {
                        device: featuredProduct.slug,
                      }),
                      'final rental request'
                    );
                    analytics.capture('rental_hub_request_started', {
                      product_id: featuredProduct.id,
                      source: 'final_cta',
                    });
                  }}
                >
                  Start request for {featuredProduct.title}
                </Link>
              ) : null}
              <Link
                href={withPlannerState('/wellness-planner', { mode: 'rental' })}
                className={`inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/[0.045] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.07] active:translate-y-0 ${focusRingClass} focus-visible:ring-offset-slate-950`}
                aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                onFocus={() =>
                  announceRental2RouteAction(
                    withPlannerState('/wellness-planner', { mode: 'rental' }),
                    'final wellness planner'
                  )
                }
                onClick={() => {
                  announceRental2RouteAction(
                    withPlannerState('/wellness-planner', { mode: 'rental' }),
                    'final wellness planner'
                  );
                  analytics.capture('rental_hub_planner_clicked', {
                    destination: withPlannerState('/wellness-planner', { mode: 'rental' }),
                  });
                }}
              >
                {rentalLandingContent.finalCta.primary}
              </Link>
              <Link
                href={withPlannerState('/contact', { intent: 'rental' })}
                className={`inline-flex min-h-12 items-center justify-center rounded-lg px-2 text-sm font-semibold text-cyan-200 transition-colors hover:text-white ${focusRingClass} focus-visible:ring-offset-slate-950`}
                aria-describedby={RENTAL2_ROUTE_ACTION_STATUS_ID}
                onFocus={() =>
                  announceRental2RouteAction(
                    withPlannerState('/contact', { intent: 'rental' }),
                    'final advisor support'
                  )
                }
                onClick={() => {
                  announceRental2RouteAction(
                    withPlannerState('/contact', { intent: 'rental' }),
                    'final advisor support'
                  );
                  analytics.capture('rental_hub_contact_clicked', {
                    source: 'final_cta',
                  });
                }}
              >
                {rentalLandingContent.finalCta.secondary}
              </Link>
            </div>
          </div>
        </section>

        <MedicalDisclaimer
          className="!border-cyan-300/25 !bg-white/[0.045] shadow-[0_10px_32px_rgba(6,182,212,0.08)]"
          customText={`${disclaimers.financing} ${disclaimers.general}`}
          variant="dark"
        />
      </div>
    </div>
  );
};

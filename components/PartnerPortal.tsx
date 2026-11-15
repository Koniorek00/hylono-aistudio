'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building,
  Globe,
  Handshake,
  Headphones,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { buildPartnerContactHref } from '@/lib/contact-prefill';
import analytics from '@/src/lib/analytics';

interface PartnerPortalProps {
  isAuthenticated?: boolean;
  onRequestAccess?: () => void;
}

const PARTNER_ROUTE_ACTION_STATUS_ID = 'partners-route-action-status';
const PARTNER_ROUTE_ACTION_STATUS_LABEL = 'Partner next-step status';

const partnerRoutes = [
  {
    title: 'Clinic operators',
    description:
      'Use this option when your facility needs commercial-use guidance, operator onboarding context, or a manual review of the next step.',
    cta: 'Start clinic operator review',
    href: buildPartnerContactHref({ partnerType: 'Clinic operator' }),
    icon: Building,
  },
  {
    title: 'Distributors',
    description:
      'Use this option when you need a manual conversation about regional rollout context, product-family scope, or operational fit.',
    cta: 'Start distributor review',
    href: buildPartnerContactHref({ partnerType: 'Distributor' }),
    icon: Globe,
  },
  {
    title: 'Integrators',
    description:
      'Use this option when installation, service coordination, or implementation planning needs to be reviewed with the Hylono team.',
    cta: 'Start integrator review',
    href: buildPartnerContactHref({ partnerType: 'Integrator' }),
    icon: Headphones,
  },
] as const;

const preparationChecklist = [
  'Your facility, channel, or service model',
  'The technology families you need to evaluate',
  'Your geography and operating coverage',
  'Any installation, training, or support constraints',
] as const;

const partnerProofRequests = [
  {
    label: 'Relevant page proof',
    value:
      'Ask which product, rental, protocol, help, or policy page should support the review.',
  },
  {
    label: 'Operating proof boundary',
    value:
      'Describe facility/channel fit and what public proof is missing before any commercial promise is discussed.',
  },
  {
    label: 'Terms still private',
    value:
      'Keep economics, territory, badges, discounts, payout, and partner outcomes inside manual review until approved.',
  },
] as const;

const stringifyPartnerHref = (href: string | ReturnType<typeof buildPartnerContactHref>) => {
  if (typeof href === 'string') return href;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(href.query)) {
    if (typeof value !== 'undefined') {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return `${href.pathname}${queryString ? `?${queryString}` : ''}`;
};

type PartnerRouteEvent = 'partners_route_cta_clicked' | 'partners_route_transition_clicked';
type PartnerRouteSource = 'hero' | 'review_options' | 'route_map';

const trackPartnerRouteEvent = ({
  authenticated,
  ctaRole,
  destination,
  eventName,
  source,
}: {
  authenticated: boolean;
  ctaRole: 'primary' | 'supporting';
  destination: string;
  eventName: PartnerRouteEvent;
  source: PartnerRouteSource;
}) => {
  analytics.capture(eventName, {
    authenticated,
    cta_role: ctaRole,
    destination,
    source,
  });
};

export const PartnerPortal: React.FC<PartnerPortalProps> = ({
  isAuthenticated = false,
  onRequestAccess,
}) => {
  const [routeActionStatus, setRouteActionStatus] = React.useState(
    'Ready to choose partner sign-in, manual review, or support path.'
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-32">
      <div className="mx-auto max-w-6xl px-6">
        <section className="rounded-lg border border-slate-200 bg-white px-8 py-10 md:px-10 md:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-700">
                Partner access
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                <Handshake className="h-4 w-4 text-cyan-700" />
                Partner access and manual review
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                Sign in or request a manual partner review
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
                This page is the public handoff for clinic operators, distributors, and
                integrators who need a Hylono follow-up. Existing approved organizations sign in
                to the private partner workspace. New commercial conversations are reviewed
                manually through the contact form.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                This page does not publish public program terms, territory promises, pricing, or
                partner badges.
              </p>
              <p
                id={PARTNER_ROUTE_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={PARTNER_ROUTE_ACTION_STATUS_LABEL}
                className="sr-only"
              >
                {routeActionStatus}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <Link
                    href="/nexus"
                    aria-describedby={PARTNER_ROUTE_ACTION_STATUS_ID}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    onClick={() => {
                      setRouteActionStatus('Opening approved partner workspace.');
                      trackPartnerRouteEvent({
                        authenticated: true,
                        ctaRole: 'primary',
                        destination: '/nexus',
                        eventName: 'partners_route_cta_clicked',
                        source: 'hero',
                      });
                    }}
                  >
                    Open Nexus workspace
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-describedby={PARTNER_ROUTE_ACTION_STATUS_ID}
                    onClick={() => {
                      setRouteActionStatus(
                        'Opening account sign-in for partner workspace access.'
                      );
                      trackPartnerRouteEvent({
                        authenticated: false,
                        ctaRole: 'primary',
                        destination: '/login?callbackUrl=%2Fnexus',
                        eventName: 'partners_route_cta_clicked',
                        source: 'hero',
                      });
                      onRequestAccess?.();
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Sign in to partner tools
                  </button>
                )}
                <Link
                  href={buildPartnerContactHref()}
                  aria-describedby={PARTNER_ROUTE_ACTION_STATUS_ID}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => {
                    setRouteActionStatus('Opening manual partner review request.');
                    trackPartnerRouteEvent({
                      authenticated: isAuthenticated,
                      ctaRole: 'supporting',
                      destination: stringifyPartnerHref(buildPartnerContactHref()),
                      eventName: 'partners_route_cta_clicked',
                      source: 'hero',
                    });
                  }}
                >
                  Start partner review
                </Link>
              </div>
            </div>

            <aside className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
                Manual review
              </p>
              <dl className="mt-5 space-y-4 text-sm text-slate-200">
                <div>
                  <dt className="font-semibold text-white">Handled by</dt>
                  <dd className="mt-1">{siteOwnership.commerce.team}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Service area</dt>
                  <dd className="mt-1">{siteEntity.serviceArea}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Support hours</dt>
                  <dd className="mt-1">{siteEntity.supportHours}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Support email</dt>
                  <dd className="mt-1">
                    <a
                      className="inline-flex min-h-11 items-center break-all underline-offset-4 hover:underline"
                      href={`mailto:${siteEntity.supportEmail}`}
                    >
                      {siteEntity.supportEmail}
                    </a>
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {partnerRoutes.map((route) => {
            const Icon = route.icon;

            return (
              <article
                key={route.title}
                className="rounded-lg border border-slate-200 bg-white p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-950">{route.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{route.description}</p>
                <Link
                  href={route.href}
                  aria-describedby={PARTNER_ROUTE_ACTION_STATUS_ID}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-slate-900"
                  onClick={() => {
                    setRouteActionStatus(`Opening ${route.title.toLowerCase()} review request.`);
                    trackPartnerRouteEvent({
                      authenticated: isAuthenticated,
                      ctaRole: 'supporting',
                      destination: stringifyPartnerHref(route.href),
                      eventName: 'partners_route_transition_clicked',
                      source: 'review_options',
                    });
                  }}
                >
                  {route.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-lg border border-slate-200 bg-white p-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
            Partner review value
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                What Hylono can review before access
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                The public partner path is useful when a team needs a fit conversation before
                approved workspace access, not published program terms or a self-serve badge.
                Hylono can review whether the request is commercial, operational, education-led,
                or support-led.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Clinic setup and operator onboarding context',
                'Distributor region, product-family scope, and support boundaries',
                'Integrator installation, service, and implementation needs',
                'Whether approved tools, contact, help, or a product page is the right next step',
              ].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-lg border border-cyan-100 bg-cyan-50/60 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-700">
            Partner proof request context
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Ask what public proof can support the partner review
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                Use this static checklist to prepare proof and context questions before contact. It
                is not public program economics, named partner examples, sample partner outcomes,
                territory promise, partner badge, wholesale discount, payout, or approved partner
                status.
              </p>
            </div>
            <dl className="grid gap-3">
              {partnerProofRequests.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-cyan-100 bg-white px-4 py-4"
                >
                  <dt className="text-sm font-semibold text-slate-950">{item.label}</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-700">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-8">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
              Before you reach out
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              Bring enough context to direct the review properly
            </h2>
            <ul className="mt-6 space-y-3">
              {preparationChecklist.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border border-slate-200 bg-slate-50 p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-cyan-700" />
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                Related pages
              </p>
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              Keep partner access secondary and task-focused
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Use approved workspace access for existing teams, contact for new commercial review,
              and help pages when you need broader support context.
            </p>
            <div className="mt-6 grid gap-3">
              {isAuthenticated ? (
                <Link
                  href="/nexus"
                  aria-describedby={PARTNER_ROUTE_ACTION_STATUS_ID}
                  className="inline-flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
                  onClick={() => {
                    setRouteActionStatus('Opening approved partner workspace.');
                    trackPartnerRouteEvent({
                      authenticated: true,
                      ctaRole: 'supporting',
                      destination: '/nexus',
                      eventName: 'partners_route_transition_clicked',
                      source: 'route_map',
                    });
                  }}
                >
                  Nexus overview
                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                </Link>
              ) : (
                <button
                  type="button"
                  aria-describedby={PARTNER_ROUTE_ACTION_STATUS_ID}
                  className="inline-flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
                  onClick={() => {
                    setRouteActionStatus(
                      'Opening account sign-in for partner workspace access.'
                    );
                    trackPartnerRouteEvent({
                      authenticated: false,
                      ctaRole: 'supporting',
                      destination: '/login?callbackUrl=%2Fnexus',
                      eventName: 'partners_route_transition_clicked',
                      source: 'route_map',
                    });
                    onRequestAccess?.();
                  }}
                >
                  Sign in for workspace access
                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                </button>
              )}
              <Link
                href={buildPartnerContactHref()}
                aria-describedby={PARTNER_ROUTE_ACTION_STATUS_ID}
                className="inline-flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
                onClick={() => {
                  setRouteActionStatus('Opening contact route for new partner reviews.');
                  trackPartnerRouteEvent({
                    authenticated: isAuthenticated,
                    ctaRole: 'supporting',
                    destination: stringifyPartnerHref(buildPartnerContactHref()),
                    eventName: 'partners_route_transition_clicked',
                    source: 'route_map',
                  });
                }}
              >
                Contact for new reviews
                <Users className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/help"
                aria-describedby={PARTNER_ROUTE_ACTION_STATUS_ID}
                className="inline-flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
                onClick={() => {
                  setRouteActionStatus('Opening Help and support options for partner access.');
                  trackPartnerRouteEvent({
                    authenticated: isAuthenticated,
                    ctaRole: 'supporting',
                    destination: '/help',
                    eventName: 'partners_route_transition_clicked',
                    source: 'route_map',
                  });
                }}
              >
                Help and support options
                <Headphones className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

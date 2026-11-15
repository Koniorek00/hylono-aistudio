'use client';

import Link from 'next/link';
import React from 'react';
import {
  ArrowRight,
  Home,
  type LucideIcon,
  Stethoscope,
} from 'lucide-react';
import analytics from '@/src/lib/analytics';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from './HomeRouteActionStatus';

interface AudienceCard {
  title: string;
  description: string;
  primaryHref: string;
  primaryQuery?: Record<string, string>;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  audience: 'home' | 'professional';
  Icon: LucideIcon;
}

const AUDIENCE_CARDS: AudienceCard[] = [
  {
    title: 'For Home',
    description:
      'Start with the goal, compare rental versus ownership, and keep product, policy, and support options visible before you commit.',
    primaryHref: '/for-home',
    primaryLabel: 'Open the home path',
    secondaryHref: '/rental',
    secondaryLabel: 'Compare rental paths',
    audience: 'home',
    Icon: Home,
  },
  {
    title: 'For Professionals',
    description:
      'Use the contact path when you need manual review for clinic or team deployment, onboarding planning, or a documented support handoff.',
    primaryHref: '/for-professionals',
    primaryLabel: 'Open professional path',
    secondaryHref: '/research',
    secondaryLabel: 'Review the research hub',
    audience: 'professional',
    Icon: Stethoscope,
  },
];

export function HomeAudienceSection(): React.JSX.Element {
  return (
    <section
      id="home-audience-paths"
      className="relative overflow-hidden border-y border-cyan-200/10 bg-slate-950 py-24 text-white"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(theme(colors.emerald.300/7%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.cyan.300/7%)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <span className="text-xs font-semibold uppercase text-cyan-200">
              Audience paths
            </span>
            <h2 className="mt-5 max-w-2xl text-3xl font-semibold text-white md:text-4xl">
              Separate home planning from professional operator needs
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              The homepage clarifies who each path is for before visitors have to compare devices,
              protocols, policies, or support handoffs.
            </p>
          </div>

          <p className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-sm leading-7 text-slate-300 shadow-none shadow-slate-950/30">
            Home buyers can compare rental and ownership first. Professional operators keep manual
            review, onboarding planning, and documented support visible before selection is final.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {AUDIENCE_CARDS.map(
            ({
              title,
              description,
              primaryHref,
              primaryQuery,
              primaryLabel,
              secondaryHref,
              secondaryLabel,
              audience,
              Icon,
            }) => (
              <article
                key={title}
                className="group rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-none shadow-slate-950/30 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.07] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
                  <Icon size={22} aria-hidden />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-white">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={
                      primaryQuery ? { pathname: primaryHref, query: primaryQuery } : primaryHref
                    }
                    aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                    onFocus={() => announceHomeRouteAction(primaryHref, 'homepage audience paths')}
                    onClick={() => {
                      announceHomeRouteAction(primaryHref, 'homepage audience paths');
                      analytics.capture('home_audience_path_clicked', {
                        audience,
                        destination: primaryHref,
                      });
                      analytics.capture('audience_path_select', {
                        audience,
                        cta_role: 'primary',
                        destination: primaryHref,
                        route: '/',
                        source: 'homepage_audience_paths',
                      });
                    }}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-slate-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    {primaryLabel}
                    <ArrowRight size={16} aria-hidden />
                  </Link>
                  <Link
                    href={secondaryHref}
                    aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                    onFocus={() => announceHomeRouteAction(secondaryHref, 'homepage audience paths')}
                    onClick={() => {
                      announceHomeRouteAction(secondaryHref, 'homepage audience paths');
                      analytics.capture('home_support_route_clicked', {
                        destination: secondaryHref,
                        source: 'audience_secondary',
                      });
                    }}
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-500/10 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    {secondaryLabel}
                  </Link>
                </div>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}

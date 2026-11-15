'use client';

import React from 'react';
import {
  Building2,
  type LucideIcon,
  KeyRound,
  Truck,
} from 'lucide-react';
import { VisualLinkCard } from '@/src/components/marketing/VisualLinkCard';
import analytics from '@/src/lib/analytics';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from './HomeRouteActionStatus';

interface AccessPathCard {
  title: string;
  description: string;
  href: string;
  cta: string;
  routeType: 'rental' | 'ownership' | 'professional';
  Icon: LucideIcon;
}

const ACCESS_PATHS: AccessPathCard[] = [
  {
    title: 'Rental access',
    description:
      'Start with rental when you want lower-commitment access, onboarding context, and a clearer support path before deciding on ownership.',
    href: '/rental',
    cta: 'Compare rental paths',
    routeType: 'rental',
    Icon: Truck,
  },
  {
    title: 'Ownership planning',
    description:
      'Use the store and product hubs after you have reviewed the right path, the research context, and the policy pages that support a purchase decision.',
    href: '/store',
    cta: 'Review ownership options',
    routeType: 'ownership',
    Icon: KeyRound,
  },
  {
    title: 'Professional deployment',
    description:
      'Use consultation for clinic, studio, or team requests that need manual review, planning, onboarding, and a documented next-step path.',
    href: '/consultation',
    cta: 'Plan professional access',
    routeType: 'professional',
    Icon: Building2,
  },
];

export function HomeAccessPathsSection(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(theme(colors.sky.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.sky.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-end">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Access paths
            </span>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold text-white md:text-4xl">
              Choose the access model before product detail overwhelms the decision
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              Start from the path that matches the buying context: rental for lower commitment,
              ownership for product comparison, or consultation when a deployment needs manual
              review.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20">
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              {ACCESS_PATHS.map(({ title, routeType }, index) => (
                <div
                  key={title}
                  className="rounded-lg border border-white/10 bg-slate-950/50 p-4"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    0{index + 1}
                  </span>
                  <span className="mt-2 block font-semibold text-white">{title}</span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-slate-500">
                    {routeType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {ACCESS_PATHS.map(({ title, description, href, cta, routeType, Icon }) => (
            <div key={title}>
              <VisualLinkCard
                href={href}
                eyebrow={routeType}
                title={title}
                description={description}
                actionLabel={cta}
                tone="dark"
                icon={<Icon size={19} />}
                className="h-full bg-slate-900/80"
                ariaDescribedBy={HOME_ROUTE_ACTION_STATUS_ID}
                onFocus={() => announceHomeRouteAction(href, 'homepage access paths')}
                onClick={() => {
                  announceHomeRouteAction(href, 'homepage access paths');
                  analytics.capture('home_access_path_clicked', {
                    destination: href,
                    route_type: routeType,
                  });
                  analytics.capture('program_card_click', {
                    destination: href,
                    program: routeType,
                    route: '/',
                    source: 'homepage_access_paths',
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

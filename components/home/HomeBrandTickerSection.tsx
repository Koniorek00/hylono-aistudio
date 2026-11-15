'use client';

import Link from 'next/link';
import React from 'react';
import {
  Headphones,
  Route,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import { homepagePrimaryLinks } from '@/content/topical-graph';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from './HomeRouteActionStatus';

const TRUST_STRIP_ITEMS = [
  {
    title: 'Curated technologies',
    description:
      'The public path starts with guided oxygen, hydrogen, light, and signal-based pages instead of disconnected gadgets.',
    Icon: Route,
  },
  {
    title: 'Evidence-aware positioning',
    description:
      'Research, limitations, and protocol framing stay visible before a visitor moves toward purchase.',
    Icon: ShieldCheck,
  },
  {
    title: siteEntity.supportCoverageLabel,
    description: `${siteEntity.supportHours}. Support and next-step guidance stay visible across the public site.`,
    Icon: Headphones,
  },
  {
    title: 'Onboarding and service',
    description:
      'Consultation, delivery planning, onboarding, and support are part of the plan, not hidden after checkout.',
    Icon: Workflow,
  },
] as const;

export function HomeBrandTickerSection(): React.JSX.Element {
  return (
    <section
      id="home-trust-strip"
      className="relative overflow-hidden border-y border-cyan-200/10 bg-slate-950 py-16 text-white sm:py-20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.cyan.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Why Hylono
            </p>
            <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl">
              Core pages stay visible before the choice
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              Support, research context, onboarding, and access paths stay in the same decision layer
              so visitors can compare the path before choosing a device.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {TRUST_STRIP_ITEMS.map(({ title, description, Icon }) => (
              <article
                key={title}
                className="group rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 shadow-[0_0_15px] shadow-cyan-500/15 transition-all duration-300 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/20 group-hover:shadow-[0_0_25px] group-hover:shadow-cyan-500/30">
                    <Icon size={20} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-base font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30 sm:mt-14 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Browse the main Hylono hubs
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5 sm:gap-3">
            {homepagePrimaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                onFocus={() => announceHomeRouteAction(link.href, 'homepage trust strip')}
                onClick={() => announceHomeRouteAction(link.href, 'homepage trust strip')}
                className="inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-medium text-white/90 transition-all duration-200 hover:-translate-y-px hover:border-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

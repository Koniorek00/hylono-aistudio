'use client';

import Link from 'next/link';
import React from 'react';
import { Activity, ArrowRight, Droplets, Sun, Wind } from 'lucide-react';
import analytics from '@/src/lib/analytics';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from './HomeRouteActionStatus';

const MODALITY_ROUTES = [
  {
    title: 'HBOT / oxygen',
    description:
      'Pressure-based oxygen options are introduced as guided access paths with product, protocol, and rental follow-through.',
    href: '/product/hbot',
    Icon: Wind,
  },
  {
    title: 'Hydrogen',
    description:
      'Hydrogen options stay connected to conservative educational framing and consultation when a visitor needs help deciding fit.',
    href: '/product/hydrogen',
    Icon: Droplets,
  },
  {
    title: 'Red light',
    description:
      'Photobiomodulation pages link deeper product information with protocol and research pathways rather than cosmetic hype.',
    href: '/product/rlt',
    Icon: Sun,
  },
  {
    title: 'Signal-based',
    description:
      'PEMF and related signal-based pages stay positioned as support-oriented options inside the broader Hylono graph.',
    href: '/product/pemf',
    Icon: Activity,
  },
] as const;

export function HomeScienceSection(): React.JSX.Element {
  return (
    <section
      id="home-science-overview"
      className="relative scroll-mt-28 overflow-hidden border-y border-cyan-200/10 bg-slate-950 py-24 text-white md:scroll-mt-32"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.emerald.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Technology overview
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Review the core modality pages{' '}
              <span className="text-cyan-300">before committing</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              Browse the core modality pages and move into product, protocol, research, rental, or
              consultation pages without losing the context of the next step.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-none shadow-slate-950/30">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Path logic
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Each modality card opens a crawlable product hub while the footer keeps research and
              protocol pages visible for visitors who need evidence or usage context first.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {MODALITY_ROUTES.map(({ title, description, href, Icon }) => (
            <article
              key={title}
              className="group h-full rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-slate-950/20 transition-colors duration-200 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07] motion-reduce:transition-none"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                <Icon size={20} aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
              <Link
                href={href}
                aria-label={`Open ${title} page`}
                aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                onFocus={() => announceHomeRouteAction(href, 'homepage technology overview')}
                onClick={() => {
                  announceHomeRouteAction(href, 'homepage technology overview');
                  analytics.capture('home_modality_card_clicked', {
                    destination: href,
                    modality: title,
                  });
                  analytics.capture('technology_card_click', {
                    destination: href,
                    route: '/',
                    source: 'homepage_technology_overview',
                    technology: title,
                  });
                }}
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.045] px-4 py-2 text-sm font-semibold text-cyan-100 transition-colors duration-200 hover:border-cyan-300 hover:bg-cyan-300/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
              >
                Open page
                <ArrowRight size={14} aria-hidden />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Need context first?
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              Open research or protocol pages before a product page
            </h3>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
            <Link
              href="/research"
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/research', 'homepage science footer')}
              onClick={() => {
                announceHomeRouteAction('/research', 'homepage science footer');
                analytics.capture('home_support_route_clicked', {
                  destination: '/research',
                  source: 'science_footer',
                });
              }}
              className="inline-flex min-h-12 items-center rounded-lg border border-white/15 bg-white/[0.045] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:border-cyan-300 hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
            >
              Review the research hub
            </Link>
            <Link
              href="/protocols"
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/protocols', 'homepage science footer')}
              onClick={() => {
                announceHomeRouteAction('/protocols', 'homepage science footer');
                analytics.capture('home_support_route_clicked', {
                  destination: '/protocols',
                  source: 'science_footer',
                });
              }}
              className="inline-flex min-h-12 items-center rounded-lg border border-white/15 bg-white/[0.045] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:border-cyan-300 hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
            >
              Open protocol library
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

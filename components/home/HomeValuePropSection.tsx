'use client';

import Link from 'next/link';
import React from 'react';
import {
  ClipboardCheck,
  Compass,
  Headphones,
  LibraryBig,
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from './HomeRouteActionStatus';

const VALUE_CARDS = [
  {
    title: 'Guided device access',
    description:
      'The experience begins with access planning and support expectations instead of sending visitors into a generic product comparison flow.',
    Icon: Compass,
  },
  {
    title: 'Protocol planning',
    description:
      'Product hubs, protocol pages, and next-step options stay connected so home and professional users can follow the same logic.',
    Icon: ClipboardCheck,
  },
  {
    title: 'Evidence-informed education',
    description:
      'Research and limitations stay visible before a visitor moves toward a rental or ownership decision.',
    Icon: LibraryBig,
  },
  {
    title: siteEntity.supportCoverageLabel,
    description: `${siteEntity.supportEmail} stays visible as a direct support path.`,
    Icon: Headphones,
  },
] as const;

const DECISION_ROWS = [
  {
    label: 'Understand',
    text: 'Start with the technology and the support boundary.',
  },
  {
    label: 'Review',
    text: 'Keep research and limitations visible before the next step.',
  },
  {
    label: 'Choose',
    text: 'Move toward rental, ownership, or consultation with context intact.',
  },
] as const;

export function HomeValuePropSection(): React.JSX.Element {
  return (
    <section
      className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(theme(colors.sky.300/7%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.sky.300/7%)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.30em] text-cyan-300">
              Why Hylono
            </p>
            <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-5xl">
              Built around decision clarity,{' '}
              <span className="text-cyan-300">not gadget overload</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              Hylono helps visitors choose the next useful step: understand the technology, review
              the research, compare rental access, or move into consultation when the next step is still
              unclear.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-slate-950/30 sm:p-5">
            <div className="grid gap-3">
              {DECISION_ROWS.map((row, index) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-2.5 rounded-lg border border-white/10 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="inline-flex h-9 w-fit shrink-0 items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    {String(index + 1).padStart(2, '0')} {row.label}
                  </span>
                  <p className="min-w-0 flex-1 text-sm leading-6 text-slate-300">{row.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_CARDS.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="group flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-cyan-500/10 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 shadow-[0_0_15px] shadow-cyan-500/15 transition-all duration-300 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/20 group-hover:shadow-[0_0_25px] group-hover:shadow-cyan-500/30">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 break-words text-lg font-semibold text-white sm:text-xl">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-slate-950/25 sm:p-7 md:flex md:items-center md:justify-between md:gap-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
              Keep the next step visible
            </p>
            <h3 className="mt-2.5 text-xl font-semibold text-white sm:text-2xl">
              Open research, compare rentals, or start consultation
            </h3>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-0 md:shrink-0">
            <Link
              href="/research"
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/research', 'homepage value proposition')}
              onClick={() => announceHomeRouteAction('/research', 'homepage value proposition')}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-center text-sm font-medium text-white transition-all duration-200 hover:-translate-y-px hover:border-cyan-300 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Open research
            </Link>
            <Link
              href="/rental"
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/rental', 'homepage value proposition')}
              onClick={() => announceHomeRouteAction('/rental', 'homepage value proposition')}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-center text-sm font-medium text-white transition-all duration-200 hover:-translate-y-px hover:border-cyan-300 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Compare rentals
            </Link>
            <Link
              href="/consultation"
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/consultation', 'homepage value proposition')}
              onClick={() => announceHomeRouteAction('/consultation', 'homepage value proposition')}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-px hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Start consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

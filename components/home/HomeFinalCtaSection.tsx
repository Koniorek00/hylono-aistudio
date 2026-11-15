'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import { MagneticButton } from '../shared/MagneticButton';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from './HomeRouteActionStatus';

interface HomeFinalCtaSectionProps {
  onNavigate: (path: string) => void;
  onStartConsultation: (source: string) => void;
}

export function HomeFinalCtaSection({
  onNavigate,
  onStartConsultation,
}: HomeFinalCtaSectionProps): React.JSX.Element {
  const handleRentalClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    announceHomeRouteAction('/rental', 'homepage final cta');
    onNavigate('rental');
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(theme(colors.sky.300/7%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.sky.300/7%)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_0.86fr] lg:items-center">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Decision point
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl md:text-4xl">
            Ready to choose the right access path?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            Use consultation when the next step is unclear, compare rental paths when you want lower
            commitment, and keep the research plus policy pages nearby while you decide.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300 sm:mt-8">
            <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-4 py-2">
              <CheckCircle size={14} className="shrink-0 text-emerald-300" /> {siteEntity.supportCoverageLabel}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-slate-950/25 sm:p-6">
          <div className="grid gap-3">
            {['Consultation', 'Rental comparison', 'Research and policy review'].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3.5 rounded-lg border border-white/10 bg-slate-950/55 p-3.5 sm:p-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                    0{index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-white">{step}</span>
                </div>
              )
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MagneticButton
              onClick={() => {
                announceHomeRouteAction('/consultation', 'homepage final cta');
                onStartConsultation('final_cta');
              }}
              onFocus={() => announceHomeRouteAction('/consultation', 'homepage final cta')}
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-6 py-3.5 text-center text-sm font-semibold text-slate-950 shadow-[0_0_15px] shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-[0_0_25px] hover:shadow-cyan-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
              strength={0.2}
            >
              <span className="whitespace-nowrap">Book a consultation</span>
            </MagneticButton>

            <Link
              href="/rental"
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/rental', 'homepage final cta')}
              onClick={handleRentalClick}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-6 py-3.5 text-center text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/[0.1] hover:shadow-[0_0_15px] hover:shadow-cyan-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
            >
              <span className="whitespace-nowrap">Compare rental paths</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

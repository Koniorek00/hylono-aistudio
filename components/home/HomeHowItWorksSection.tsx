'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ClipboardList,
  Headphones,
  PackageCheck,
  Route,
} from 'lucide-react';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from './HomeRouteActionStatus';

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Qualify the need',
    desc: 'Start with the goal, the environment, and the level of support you need before any device choice is made.',
    icon: ClipboardList,
    href: '/consultation',
    cta: 'Open consultation',
  },
  {
    step: '02',
    title: 'Recommend the path',
    desc: 'Hylono guides people into the right product hub, protocol, rental path, or consultation instead of a generic catalog flow.',
    icon: Route,
    href: '/store',
    cta: 'Review options',
  },
  {
    step: '03',
    title: 'Deliver and onboard',
    desc: 'Delivery planning, setup, and onboarding stay connected to the plan so implementation does not become guesswork after checkout.',
    icon: PackageCheck,
    href: '/delivery-installation-onboarding',
    cta: 'Review onboarding',
  },
  {
    step: '04',
    title: 'Support and optimize',
    desc: 'Use ongoing support, policy pages, and the research or protocol guides when the next step changes over time.',
    icon: Headphones,
    href: '/service-and-support',
    cta: 'Open support',
  },
] as const;

interface HomeHowItWorksSectionProps {
  onNavigate: (path: string) => void;
  onStartConsultation: (source: string) => void;
}

export function HomeHowItWorksSection({
  onNavigate,
  onStartConsultation,
}: HomeHowItWorksSectionProps): React.JSX.Element {
  const handleConsultationClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
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
    announceHomeRouteAction('/consultation', 'homepage process section');
    onStartConsultation('process');
  };

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
    announceHomeRouteAction('/rental', 'homepage process section');
    onNavigate('rental');
  };

  return (
    <section
      id="home-how-it-works"
      className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(theme(colors.sky.300/7%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.sky.300/7%)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.30em] text-cyan-300">
              How Hylono works
            </p>
            <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-5xl">
              Consultation first,{' '}
              <span className="text-cyan-300">then the right access model</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              Hylono starts with the request, guides people into the right technology or protocol
              path, supports delivery and onboarding, and keeps support visible as needs change over
              time.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-slate-950/30 sm:p-5">
            <div className="grid gap-3">
              {HOW_IT_WORKS_STEPS.map((item) => {
                const StepIcon = item.icon;
                return (
                  <Link
                    key={item.step}
                    href={item.href}
                    aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                    onFocus={() => announceHomeRouteAction(item.href, 'homepage process steps')}
                    onClick={() => announceHomeRouteAction(item.href, 'homepage process steps')}
                    className="group flex flex-col gap-3.5 rounded-lg border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-cyan-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="flex min-w-0 items-start gap-3.5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 shadow-[0_0_15px] shadow-cyan-500/15 transition-all duration-300 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/20 group-hover:shadow-[0_0_25px] group-hover:shadow-cyan-500/30">
                        <StepIcon size={18} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                            {item.step}
                          </span>
                          <span className="size-1 rounded bg-cyan-300/50" />
                          <h3 className="truncate text-base font-semibold text-white">{item.title}</h3>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{item.desc}</p>
                      </div>
                    </div>
                    <span className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-white/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200 transition-all duration-200 group-hover:border-cyan-300/60 group-hover:bg-cyan-300/10 group-hover:text-cyan-100 motion-reduce:transition-none sm:self-center">
                      <span className="whitespace-nowrap">{item.cta}</span>
                      <ArrowRight size={13} className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-slate-950/25 sm:p-7 md:flex md:items-center md:justify-between md:gap-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
              Keep the process path visible
            </p>
            <h3 className="mt-2.5 text-xl font-semibold text-white sm:text-2xl">
              Start with consultation or compare rental paths
            </h3>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-0 md:shrink-0">
            <Link
              href="/consultation"
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/consultation', 'homepage process section')}
              onClick={handleConsultationClick}
              className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-slate-950 shadow-[0_0_15px] shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-[0_0_25px] hover:shadow-cyan-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Start consultation
            </Link>
            <Link
              href="/rental"
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/rental', 'homepage process section')}
              onClick={handleRentalClick}
              className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-5 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/[0.1] hover:shadow-[0_0_15px] hover:shadow-cyan-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Compare rental paths
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

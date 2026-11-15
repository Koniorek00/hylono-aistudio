import React from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle,
  Gauge,
  Layers3,
  MessageCircle,
  Moon,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { batch3HomeContent } from '../../content/batch3';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from './HomeRouteActionStatus';

interface HomeJumpstartSectionProps {
  homepageEnhancementsEnabled: boolean;
}

const toHomepageHref = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const quickStartIcons: Record<string, LucideIcon> = {
  Stack: Layers3,
  Target,
  Guide: MessageCircle,
};

const goalIcons: Record<string, LucideIcon> = {
  Recovery: Activity,
  Sleep: Moon,
  Stress: Gauge,
  Comfort: Sparkles,
  Vitality: Zap,
};

export function HomeJumpstartSection({
  homepageEnhancementsEnabled,
}: HomeJumpstartSectionProps): React.JSX.Element | null {
  if (!homepageEnhancementsEnabled) {
    return null;
  }

  return (
    <section
      id="home-jumpstart"
      className="relative scroll-mt-28 overflow-hidden border-y border-cyan-200/10 bg-slate-950 py-16 text-white sm:py-20 md:scroll-mt-32 md:py-24"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-slate-400)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-slate-400)_1px,transparent_1px)] bg-[size:44px_44px] opacity-10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
              Quick start
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
              {batch3HomeContent.jumpstart.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Choose a planning path first, then compare technology, rental, and support paths with the same conservative guidance used across the site.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
            {batch3HomeContent.popularGoals.tiles.map((goal, index) => {
              const GoalIcon = goalIcons[goal.icon] ?? Sparkles;
              const href = toHomepageHref(goal.path);
              const isLastOdd = index === batch3HomeContent.popularGoals.tiles.length - 1;

              return (
                <Link
                  key={goal.title}
                  href={href}
                  prefetch={false}
                  aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceHomeRouteAction(href, 'homepage quick-start goals')}
                  onClick={() => announceHomeRouteAction(href, 'homepage quick-start goals')}
                  className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-3 text-center text-xs font-semibold text-slate-200 transition-all duration-200 hover:border-cyan-300/45 hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none ${
                    isLastOdd ? 'col-span-2 sm:col-span-1 lg:col-span-1' : ''
                  }`}
                >
                  <GoalIcon size={15} className="shrink-0 text-cyan-200" aria-hidden="true" />
                  <span className="truncate">{goal.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {batch3HomeContent.jumpstart.cards.map((card) => {
            const CardIcon = quickStartIcons[card.icon] ?? Sparkles;
            const href = toHomepageHref(card.path);

            return (
              <Link
                key={card.title}
                href={href}
                prefetch={false}
                aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                onFocus={() => announceHomeRouteAction(href, 'homepage quick-start cards')}
                onClick={() => announceHomeRouteAction(href, 'homepage quick-start cards')}
                className="group flex min-h-48 flex-col justify-between rounded-lg border border-white/10 bg-white/[0.04] p-6 text-left shadow-xl shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.06] hover:shadow-cyan-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div>
                  <span
                    className="mb-5 flex size-12 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 shadow-[0_0_15px] shadow-cyan-500/15 transition-all duration-300 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/20 group-hover:shadow-[0_0_25px] group-hover:shadow-cyan-500/30"
                    aria-hidden="true"
                  >
                    <CardIcon size={22} />
                  </span>
                  <h3 className="mb-2 text-lg font-semibold text-white">{card.title}</h3>
                  <p className="text-sm leading-6 text-slate-300">{card.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 rounded-lg border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-slate-950/20 md:grid-cols-[1fr_0.75fr] md:items-center md:p-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Rental access</p>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {batch3HomeContent.rentalPromo.title}
            </h2>
            <p className="mb-5 max-w-2xl text-sm leading-7 text-slate-300">
              {batch3HomeContent.rentalPromo.description}
            </p>
            <ul className="space-y-2.5 text-sm text-slate-300">
              {batch3HomeContent.rentalPromo.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="grid gap-3">
              {['Lower commitment', 'Support included', 'Ownership comparison'].map(
                (label, index) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/70 p-3.5"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                      0{index + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">{label}</span>
                  </div>
                )
              )}
            </div>
            <Link
              href={toHomepageHref(batch3HomeContent.rentalPromo.ctaPath)}
              prefetch={false}
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => {
                announceHomeRouteAction(
                  toHomepageHref(batch3HomeContent.rentalPromo.ctaPath),
                  'homepage quick-start rental promo'
                );
              }}
              onClick={() => {
                announceHomeRouteAction(
                  toHomepageHref(batch3HomeContent.rentalPromo.ctaPath),
                  'homepage quick-start rental promo'
                );
              }}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-cyan-300 px-6 py-3.5 text-center text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {batch3HomeContent.rentalPromo.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

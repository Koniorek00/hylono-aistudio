'use client';

import Link from 'next/link';
import React from 'react';
import {
  ArrowRight,
  BookOpen,
  type LucideIcon,
  MessageCircle,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import analytics from '@/src/lib/analytics';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from './HomeRouteActionStatus';

interface DecisionSupportCard {
  title: string;
  description: string;
  cta: string;
  href: string;
  Icon: LucideIcon;
}

const DECISION_SUPPORT_CARDS: DecisionSupportCard[] = [
  {
    title: 'Review the evidence before you commit',
    description:
      'Open the research hub to see study context, limitations, and the product pages connected to each topic.',
    cta: 'Open research',
    href: '/research',
    Icon: BookOpen,
  },
  {
    title: 'Start with rental when you want lower risk',
    description:
      'Compare monthly plans, onboarding expectations, and the return-or-buy-later path before taking on the full purchase price.',
    cta: 'See rental plans',
    href: '/rental',
    Icon: Truck,
  },
  {
    title: 'Verify the policy pages that protect the order',
    description:
      'Check shipping, returns, warranty, and support pages from the same flow you use to compare products.',
    cta: 'Review policies',
    href: '/returns',
    Icon: ShieldCheck,
  },
  {
    title: 'Talk to a real person when the choice is unclear',
    description:
      'Use contact when you need help with fit, delivery planning, financing questions, or a clinic/B2B request.',
    cta: 'Contact Hylono',
    href: '/contact',
    Icon: MessageCircle,
  },
];

export const HomeTestimonialsSection: React.FC = () => {
  return (
    <section
      id="home-decision-support"
      className="relative scroll-mt-28 overflow-hidden border-y border-cyan-200/10 bg-slate-950 py-24 text-white md:scroll-mt-32"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.emerald.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Decision Support
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              What helps people move forward
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              Instead of anonymous testimonials, Hylono keeps the next step visible: evidence when
              claims are discussed, policy pages when money is involved, and direct contact when you
              want a recommendation.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-none shadow-slate-950/30">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Proof boundary
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              This band guides visitors to public evidence, rental, policy, and contact surfaces
              instead of using unsupported ratings, named testimonials, or review-count claims.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {DECISION_SUPPORT_CARDS.map(({ title, description, cta, href, Icon }) => (
            <article
              key={title}
              className="group flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-slate-950/20 transition-colors duration-200 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07] motion-reduce:transition-none"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                <Icon size={20} aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-4 flex-1 text-sm leading-7 text-slate-300">
                {description}
              </p>
              <Link
                href={href}
                aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                onFocus={() => announceHomeRouteAction(href, 'homepage decision support')}
                onClick={() => {
                  announceHomeRouteAction(href, 'homepage decision support');
                  analytics.capture('home_support_route_clicked', {
                    destination: href,
                    source: 'decision_support',
                  });
                }}
                className="mt-6 inline-flex min-h-12 w-fit items-center gap-2 rounded-lg border border-white/15 bg-white/[0.045] px-4 py-2 text-sm font-semibold text-cyan-100 transition-colors duration-200 hover:border-cyan-300 hover:bg-cyan-300/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
              >
                {cta}
                <ArrowRight size={14} aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

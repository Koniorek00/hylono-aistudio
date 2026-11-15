'use client';

import Link from 'next/link';
import React from 'react';
import { BookOpen, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import {
  PreviewReveal,
  PreviewStaggerContainer,
  PreviewStaggerItem,
} from '../PreviewReveal';

interface DecisionSupportCard {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  Icon: typeof BookOpen;
}

export const PREVIEW_TESTIMONIALS_ACTION_STATUS_ID =
  'preview-testimonials-action-status';

const PREVIEW_TESTIMONIALS_ACTION_READY =
  'Preview decision-support links are ready. Use the cards to review evidence, rental, policy, or contact routes before choosing.';

const DECISION_SUPPORT_CARDS: DecisionSupportCard[] = [
  {
    id: 'research-evidence',
    title: 'Review the evidence before you commit',
    description:
      'Open the research hub to see study context, limitations, and the product pages connected to each topic.',
    cta: 'Open research',
    href: '/research',
    Icon: BookOpen,
  },
  {
    id: 'rental-risk',
    title: 'Start with rental when you want lower risk',
    description:
      'Compare monthly plans, onboarding expectations, and the return-or-buy-later path before taking on the full purchase price.',
    cta: 'See rental plans',
    href: '/rental',
    Icon: Truck,
  },
  {
    id: 'policy-protection',
    title: 'Verify the policy pages that protect the order',
    description:
      'Check shipping, returns, warranty, and support pages from the same flow you use to compare products.',
    cta: 'Review policies',
    href: '/returns',
    Icon: ShieldCheck,
  },
  {
    id: 'human-guidance',
    title: 'Talk to a real person when the choice is unclear',
    description:
      'Use contact when you need help with fit, delivery planning, financing questions, or a clinic/B2B request.',
    cta: 'Contact Hylono',
    href: '/contact',
    Icon: MessageCircle,
  },
] as const;

export const HomeTestimonialsSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden border-y border-cyan-200/10 bg-slate-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.emerald.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <PreviewReveal direction="up" className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            Decision Support
          </span>
          <h2 className="futuristic-font mt-4 text-3xl font-bold text-white md:text-5xl">
            What Helps People Move Forward
          </h2>
          <p className="mt-4 text-slate-300">
            Instead of anonymous testimonials, Hylono keeps the next step visible: evidence when
            claims are discussed, policy pages when money is involved, and direct contact when you
            want a recommendation.
          </p>
        </PreviewReveal>

        <p
          aria-atomic="true"
          aria-label="Preview testimonials action status"
          aria-live="polite"
          className="sr-only"
          id={PREVIEW_TESTIMONIALS_ACTION_STATUS_ID}
          role="status"
        >
          {PREVIEW_TESTIMONIALS_ACTION_READY}
        </p>

        <PreviewStaggerContainer
          className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          staggerDelay={0.1}
        >
          {DECISION_SUPPORT_CARDS.map((card) => {
            const titleId = `preview-decision-support-${card.id}-title`;
            const descriptionId = `preview-decision-support-${card.id}-description`;

            return (
              <PreviewStaggerItem key={card.id}>
                <motion.article
                  aria-describedby={descriptionId}
                  aria-labelledby={titleId}
                  whileHover={{ y: -4 }}
                  className="flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.045] p-7 transition-colors duration-200 hover:border-cyan-300/35 hover:bg-white/[0.07]"
                >
                  <div
                    aria-hidden="true"
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200"
                  >
                    <card.Icon aria-hidden="true" size={22} />
                  </div>
                  <h3 id={titleId} className="text-xl font-bold text-white">
                    {card.title}
                  </h3>
                  <p
                    id={descriptionId}
                    className="mt-3 flex-1 text-sm leading-relaxed text-slate-300"
                  >
                    {card.description}
                  </p>
                  <Link
                    aria-describedby={`${descriptionId} ${PREVIEW_TESTIMONIALS_ACTION_STATUS_ID}`}
                    href={card.href}
                    className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-cyan-100 transition-colors hover:text-white"
                  >
                    {card.cta}
                  </Link>
                </motion.article>
              </PreviewStaggerItem>
            );
          })}
        </PreviewStaggerContainer>
      </div>
    </section>
  );
};

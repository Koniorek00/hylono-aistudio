'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  ChevronDown,
  FileCheck,
  Headphones,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import analytics from '@/src/lib/analytics';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from './HomeRouteActionStatus';

const TRUST_PILLARS = [
  {
    title: 'Conservative guidance',
    description:
      'The homepage keeps research, protocol, and support paths visible before it asks anyone to treat a product page like a guaranteed-outcome shortcut.',
    Icon: ShieldCheck,
  },
  {
    title: 'Support before and after inquiry',
    description:
      'Help, FAQ, and contact stay visible before and after a rental or ownership inquiry.',
    Icon: Headphones,
  },
  {
    title: 'Policy-backed commerce',
    description:
      'Shipping, returns, and warranty pages stay connected when visitors compare rental and ownership paths.',
    Icon: FileCheck,
  },
  {
    title: `${siteEntity.supportCoverageLabel} and onboarding`,
    description:
      'Consultation, delivery planning, onboarding, and follow-up support stay part of the plan instead of appearing only after checkout.',
    Icon: Workflow,
  },
] as const;

const HOMEPAGE_FAQS = [
  {
    question: 'How does Hylono decide whether rental or ownership is the better first step?',
    answer:
      'The decision starts with the goal, the environment, and the level of support needed. When the right path is not clear yet, Hylono keeps consultation and rental visible before an ownership decision.',
  },
  {
    question: 'Does the homepage promise outcomes or fixed results?',
    answer:
      'No. The homepage keeps guidance educational and evidence-aware, then sends visitors into research, protocol, and policy pages for the details that support the next step.',
  },
  {
    question: 'What support is visible before I contact Hylono?',
    answer:
      'Support stays reachable through the help center, the FAQ, and contact before an order or inquiry is started.',
  },
  {
    question: 'Where should a clinic or professional operator start?',
    answer:
      'Professional requests should start with the contact path so rollout planning, onboarding, and manual review can happen before product selection is treated as final.',
  },
] as const;

const TRUST_LINKS = [
  { href: '/help', label: 'Help center' },
  { href: '/faq', label: 'FAQ' },
  { href: '/shipping', label: 'Shipping policy' },
  { href: '/returns', label: 'Returns policy' },
  { href: '/warranty', label: 'Warranty' },
] as const;

export function HomeTrustFaqSection(): React.JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="home-trust-faq"
      className="relative scroll-mt-28 overflow-hidden border-y border-cyan-200/10 bg-slate-950 py-24 text-white md:scroll-mt-32"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.emerald.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Trust and FAQ
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Support standards and common questions, visible on the homepage
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            First-time visitors get the trust, support, and qualification context they need before
            deciding what to open next.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TRUST_PILLARS.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="h-full rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-slate-950/20 transition-colors duration-200 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07] motion-reduce:transition-none"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-7 shadow-xl shadow-slate-950/20">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Homepage FAQ
            </p>
            <div className="mt-6 space-y-4">
              {HOMEPAGE_FAQS.map(({ question, answer }, index) => {
                const panelId = `home-faq-panel-${index}`;
                const buttonId = `home-faq-button-${index}`;
                const isOpen = openIndex === index;

                return (
                  <article
                    key={question}
                    className={`rounded-lg border transition-all duration-300 ${isOpen ? 'border-cyan-400/50 bg-slate-900/60 shadow-[0_0_15px] shadow-cyan-400/10' : 'border-white/10 bg-slate-950/70 hover:border-cyan-300/30'}`}
                  >
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => {
                          const nextIndex = isOpen ? null : index;
                          setOpenIndex(nextIndex);
                          if (nextIndex === index) {
                            analytics.capture('home_faq_opened', { question });
                            analytics.capture('faq_expand', {
                              question,
                              route: '/',
                              source: 'homepage_faq',
                            });
                          }
                        }}
                        className="flex min-h-12 w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold text-white transition-colors hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                      >
                        <span>{question}</span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 transition-transform duration-300 ease-in-out motion-reduce:transition-none ${isOpen ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`}
                        />
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-7 text-slate-300">{answer}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-7 shadow-xl shadow-slate-950/20">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Trust signals
            </p>
            <h3 className="mt-4 text-2xl font-semibold text-white">
              Review the support and commerce pages before you decide
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Hylono keeps help, FAQ, shipping, returns, and warranty paths visible so the
              homepage does not have to carry every operational detail on its own.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {TRUST_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceHomeRouteAction(link.href, 'homepage trust routes')}
                  onClick={() => {
                    announceHomeRouteAction(link.href, 'homepage trust routes');
                    analytics.capture('home_support_route_clicked', {
                      destination: link.href,
                      source: 'trust_routes',
                    });
                  }}
                  className="inline-flex min-h-12 items-center rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-cyan-300 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

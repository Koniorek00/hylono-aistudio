'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle, HelpCircle, ShieldCheck, Store } from 'lucide-react';
import { NavigateFunction } from '../types';

interface RewardsPageProps {
  onNavigate?: NavigateFunction;
  isAuthenticated?: boolean;
}

const statusNotes = [
  {
    title: 'Manual review first',
    description:
      'Do not rely on a public page for reward status. Use contact if you need Hylono to review a rewards question.',
    icon: HelpCircle,
  },
  {
    title: 'No public program terms',
    description:
      'Hylono does not list program terms or account-specific values on this public preview page.',
    icon: ShieldCheck,
  },
  {
    title: 'Use stronger routes',
    description:
      'Use store, help, or contact when you need product, policy, or support guidance before account sign-in.',
    icon: Store,
  },
] as const;

const reviewSteps = [
  'Keep product, order, or referral context ready before asking for review.',
  'Review published product and support pages before making a purchase decision.',
  'Contact Hylono if you need a manual review of a rewards question.',
] as const;

const REWARDS_PANEL_STATUS_ID = 'rewards-panel-status';
const REWARDS_ROUTE_ACTION_STATUS_ID = 'rewards-route-action-status';
const REWARDS_PUBLIC_PREVIEW_HELP_ID = 'rewards-public-preview-help';
const REWARDS_SIGNED_IN_HELP_ID = 'rewards-signed-in-help';
const REWARDS_SUPPORT_DECISION_HELP_ID = 'rewards-support-decision-help';
const REWARDS_PUBLIC_BOUNDARY_PANEL_ID = 'rewards-public-boundary-panel';
const REWARDS_NEXT_STEPS_PANEL_ID = 'rewards-next-steps-panel';
type RewardsRoute = 'account' | 'store' | 'help' | 'contact';

const rewardsPanelStatusCopy = {
  status: 'Public rewards boundary panel is active. Public copy stays manual-review only.',
  next: 'Rewards next steps panel is active. Review store, help, or contact before relying on rewards guidance.',
} as const;
const rewardsRouteActionReadyCopy =
  'Rewards route actions are ready. Use contact, store, help, or account when you need the next route.';
const rewardsRouteActionStatusCopy: Record<RewardsRoute, { ready: string; selected: string }> = {
  account: {
    ready: 'Private account route is ready for signed-in rewards support.',
    selected: 'Opening the private account route for signed-in rewards support.',
  },
  store: {
    ready: 'Store route is ready before relying on rewards guidance.',
    selected: 'Opening the store route before relying on rewards guidance.',
  },
  help: {
    ready: 'Help center route is ready for rewards support context.',
    selected: 'Opening the help center route for rewards support context.',
  },
  contact: {
    ready: 'Contact route is ready for manual rewards review.',
    selected: 'Opening the contact route for manual rewards review.',
  },
};

const manualReviewChecklist = [
  {
    title: 'Private account details',
    detail:
      'Use the account area only for personal details; this public preview does not confirm reward status.',
  },
  {
    title: 'Purchase context',
    detail:
      'Keep order, product, or support context ready if you need Hylono to review a reward-related question.',
  },
  {
    title: 'Program boundary',
    detail:
      'Do not treat this page as a points ledger, public tier table, referral payout promise, or eligibility result.',
  },
] as const;

const rewardsRouteHref: Record<RewardsRoute, string> = {
  account: '/account',
  store: '/store',
  help: '/help',
  contact: '/contact',
};
const rewardsRouteDescribedBy = (contextId: string) =>
  `${REWARDS_ROUTE_ACTION_STATUS_ID} ${contextId}`;

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300';
const panelClasses = 'rounded-lg border border-white/10 bg-white/[0.045]';
const mutedPanelClasses = 'rounded-lg border border-cyan-300/25 bg-cyan-400/[0.10]';
const primaryCtaClasses =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-200 focus-visible:ring-offset-slate-950 motion-reduce:transition-none';
const secondaryCtaClasses =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.035] px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.07] hover:text-white focus-visible:ring-offset-slate-950 motion-reduce:transition-none';

export const RewardsPage: React.FC<RewardsPageProps> = ({
  onNavigate,
  isAuthenticated = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activePanel, setActivePanel] = useState<'status' | 'next'>('status');
  const [routeActionStatus, setRouteActionStatus] = useState(rewardsRouteActionReadyCopy);
  const handleRouteClick =
    (page: RewardsRoute) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented) {
        return;
      }

      setRouteActionStatus(rewardsRouteActionStatusCopy[page].selected);

      if (
        !onNavigate ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      onNavigate(page);
    };
  const handleRouteFocus = (page: RewardsRoute) => () => {
    setRouteActionStatus(rewardsRouteActionStatusCopy[page].ready);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Rewards preview
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Prepare a manual rewards question
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
            This public page explains where to route rewards questions. It does not list account
            values, program terms, or eligibility details. Use contact or support when you need a
            manual answer.
          </p>
        </motion.header>

        {!isAuthenticated && (
          <motion.section
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-auto mt-10 max-w-3xl p-6 text-center ${panelClasses}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Public preview
            </p>
            <p id={REWARDS_PUBLIC_PREVIEW_HELP_ID} className="mt-3 text-sm leading-6 text-slate-300">
              Ask for manual review when you have a rewards question. Browse the store or help
              center first if you are still comparing products, policies, or next steps.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={rewardsRouteHref.contact}
                onClick={handleRouteClick('contact')}
                onFocus={handleRouteFocus('contact')}
                aria-describedby={rewardsRouteDescribedBy(REWARDS_PUBLIC_PREVIEW_HELP_ID)}
                className={`${primaryCtaClasses} ${focusRingClass}`}
              >
                Ask for manual review
              </Link>
              <Link
                href={rewardsRouteHref.store}
                onClick={handleRouteClick('store')}
                onFocus={handleRouteFocus('store')}
                aria-describedby={rewardsRouteDescribedBy(REWARDS_PUBLIC_PREVIEW_HELP_ID)}
                className={`${secondaryCtaClasses} ${focusRingClass}`}
              >
                Browse store first
              </Link>
            </div>
          </motion.section>
        )}

        {isAuthenticated && (
          <section className={`mx-auto mt-10 max-w-3xl p-6 text-center ${mutedPanelClasses}`}>
            <p id={REWARDS_SIGNED_IN_HELP_ID} className="text-sm font-semibold text-emerald-200">
              You are signed in. Open your account area for private rewards support and account
              options.
            </p>
            <Link
              href={rewardsRouteHref.account}
              onClick={handleRouteClick('account')}
              onFocus={handleRouteFocus('account')}
              aria-describedby={rewardsRouteDescribedBy(REWARDS_SIGNED_IN_HELP_ID)}
              className={`mt-5 ${primaryCtaClasses} ${focusRingClass}`}
            >
              Open account
            </Link>
          </section>
        )}

        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.045] p-1">
            <button
              type="button"
              aria-controls={REWARDS_PUBLIC_BOUNDARY_PANEL_ID}
              aria-describedby={REWARDS_PANEL_STATUS_ID}
              aria-pressed={activePanel === 'status'}
              onClick={() => setActivePanel('status')}
              className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${
                activePanel === 'status' ? 'bg-cyan-300 text-black' : 'text-slate-300'
              }`}
            >
              Public boundary
            </button>
            <button
              type="button"
              aria-controls={REWARDS_NEXT_STEPS_PANEL_ID}
              aria-describedby={REWARDS_PANEL_STATUS_ID}
              aria-pressed={activePanel === 'next'}
              onClick={() => setActivePanel('next')}
              className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${
                activePanel === 'next' ? 'bg-cyan-300 text-black' : 'text-slate-300'
              }`}
            >
              Next steps
            </button>
          </div>
        </div>
        <p
          id={REWARDS_PANEL_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Rewards panel status"
          className="mx-auto mt-3 max-w-3xl rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-center text-sm leading-6 text-slate-300"
        >
          {rewardsPanelStatusCopy[activePanel]}
        </p>
        <p
          id={REWARDS_ROUTE_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Rewards route action status"
          className="sr-only"
        >
          {routeActionStatus}
        </p>

        {activePanel === 'status' ? (
          <motion.section
            id={REWARDS_PUBLIC_BOUNDARY_PANEL_ID}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 grid gap-5 md:grid-cols-3"
          >
            {statusNotes.map((note) => (
              <article key={note.title} className={`${panelClasses} p-6`}>
                <note.icon className="text-cyan-300" size={26} />
                <h2 className="mt-4 text-lg font-semibold text-white">{note.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{note.description}</p>
              </article>
            ))}
          </motion.section>
        ) : (
          <motion.section
            id={REWARDS_NEXT_STEPS_PANEL_ID}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-auto mt-10 max-w-3xl p-6 ${panelClasses}`}
          >
            <h2 className="text-xl font-semibold text-white">Before you rely on rewards guidance</h2>
            <ul className="mt-5 space-y-3">
              {reviewSteps.map((step) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-slate-300">
                  <CheckCircle className="mt-0.5 shrink-0 text-cyan-300" size={18} />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        <section className={`mt-10 p-8 ${panelClasses}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Manual rewards review checklist
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Prepare a reward question without assuming eligibility
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                This checklist keeps reward questions grounded in account or support review. It
                does not publish public program economics, reward tiers, referral codes, payout
                values, or account-specific eligibility.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {manualReviewChecklist.map((item) => (
                <article
                  key={item.title}
                  className="rounded-lg border border-white/10 bg-slate-950/70 p-5"
                >
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`mt-10 p-8 text-center ${mutedPanelClasses}`}>
          <HelpCircle className="mx-auto text-cyan-300" size={36} />
          <h2 className="mt-4 text-2xl font-semibold text-white">Need a current answer?</h2>
          <p
            id={REWARDS_SUPPORT_DECISION_HELP_ID}
            className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300"
          >
            Use your account for private details. Use the help center or contact route when you need
            policy or rewards support before signing in.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={rewardsRouteHref.help}
              onClick={handleRouteClick('help')}
              onFocus={handleRouteFocus('help')}
              aria-describedby={rewardsRouteDescribedBy(REWARDS_SUPPORT_DECISION_HELP_ID)}
              className={`${secondaryCtaClasses} ${focusRingClass}`}
            >
              Open help center
            </Link>
            <Link
              href={rewardsRouteHref.contact}
              onClick={handleRouteClick('contact')}
              onFocus={handleRouteFocus('contact')}
              aria-describedby={rewardsRouteDescribedBy(REWARDS_SUPPORT_DECISION_HELP_ID)}
              className={`${primaryCtaClasses} gap-2 ${focusRingClass}`}
            >
              Contact Hylono <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RewardsPage;

'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  BadgeCheck,
  LayoutDashboard,
  LogIn,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';

type NexusModuleRouteStateMode = 'loading' | 'error';

export interface NexusModuleRouteStateProps {
  moduleName: string;
  modulePurpose: string;
  mode: NexusModuleRouteStateMode;
  reset?: () => void;
  showOverviewLink?: boolean;
}

const accessHref = buildLoginRedirectPath('/account');
const actionClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:duration-0';

const formatActionList = (actions: string[]) =>
  actions.length === 1 ? actions[0] : `${actions.slice(0, -1).join(', ')} and ${actions.at(-1)}`;

function getNexusRouteActionReadyStatus({
  isError,
  moduleName,
  showOverviewLink,
}: {
  isError: boolean;
  moduleName: string;
  showOverviewLink: boolean;
}) {
  const actions = [
    ...(isError ? ['retry'] : []),
    ...(showOverviewLink ? ['overview'] : []),
    'account sign-in',
    'contact support',
  ];

  return `${moduleName} route actions ready: ${formatActionList(actions)}.`;
}

function getNexusRouteActionStatusMessage(action: 'account' | 'contact' | 'overview' | 'retry', moduleName: string) {
  if (action === 'retry') return `Retrying ${moduleName} preview.`;
  if (action === 'overview') return `Returning to the Nexus overview from ${moduleName}.`;
  if (action === 'account') return `Opening account sign-in for ${moduleName}.`;

  return `Opening Hylono contact support from ${moduleName}.`;
}

export function NexusModuleRouteState({
  moduleName,
  modulePurpose,
  mode,
  reset,
  showOverviewLink = true,
}: NexusModuleRouteStateProps) {
  const isError = mode === 'error';
  const idPrefix = `nexus-${moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const titleId = `${idPrefix}-${mode}-title`;
  const descriptionId = `${idPrefix}-${mode}-description`;
  const actionStatusId = `${idPrefix}-${mode}-action-status`;
  const actionDescribedBy = `${descriptionId} ${actionStatusId}`;
  const title = isError
    ? `${moduleName} preview needs a reload.`
    : `Preparing ${moduleName} preview.`;
  const description = isError
    ? `${modulePurpose} did not finish rendering. Retry the module, return to the Nexus overview, or contact Hylono if the workspace remains unavailable.`
    : `${modulePurpose} is loading with account access, support exits, and sample-workspace safeguards still visible.`;
  const safeExitCount = (isError ? 1 : 0) + (showOverviewLink ? 1 : 0) + 2;
  const routeStateSummary = [
    {
      label: 'Mode',
      value: isError ? 'error recovery' : 'loading preview',
    },
    {
      label: 'Boundary',
      value: 'sample workspace only',
    },
    {
      label: 'Exits',
      value: `${safeExitCount} safe exits`,
    },
  ] as const;
  const [actionStatus, setActionStatus] = useState(() =>
    getNexusRouteActionReadyStatus({ isError, moduleName, showOverviewLink })
  );
  const announceAction = (action: 'account' | 'contact' | 'overview' | 'retry') => {
    setActionStatus(getNexusRouteActionStatusMessage(action, moduleName));
  };

  return (
    <section
      role={isError ? 'alert' : undefined}
      aria-busy={isError ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="min-h-screen bg-slate-950 px-6 py-12 text-white"
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <div
          className={`inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            isError
              ? 'border-amber-300/[0.25] bg-amber-300/[0.08] text-amber-100'
              : 'border-cyan-300/[0.25] bg-cyan-300/[0.08] text-cyan-200'
          }`}
        >
          {isError ? <AlertTriangle className="h-3.5 w-3.5" /> : <BadgeCheck className="h-3.5 w-3.5" />}
          Nexus module state
        </div>
        <h1 id={titleId} className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p id={descriptionId} className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
          {description}
        </p>
        <ul
          aria-label={`${moduleName} route state summary`}
          className="mt-6 grid gap-3 text-xs sm:grid-cols-3"
        >
          {routeStateSummary.map((item) => (
            <li
              key={item.label}
              aria-label={`Nexus route state ${item.label.toLowerCase()}: ${item.value}`}
              className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3"
            >
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {item.label}
              </span>
              <span className="mt-1 block font-semibold text-slate-100">{item.value}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          {isError ? (
            <button
              type="button"
              aria-describedby={actionDescribedBy}
              onClick={() => {
                announceAction('retry');
                reset?.();
              }}
              onFocus={() => announceAction('retry')}
              className={`${actionClass} border-amber-300/[0.25] bg-amber-300/[0.12] text-amber-50 hover:bg-amber-300/[0.18] focus-visible:outline-cyan-300`}
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          ) : null}
          {showOverviewLink ? (
            <Link
              href="/nexus"
              aria-describedby={actionDescribedBy}
              onFocus={() => announceAction('overview')}
              onClick={() => announceAction('overview')}
              className={`${actionClass} border-white/[0.10] bg-white/[0.045] text-white hover:bg-white/[0.08] focus-visible:outline-cyan-300`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Back to Nexus overview
            </Link>
          ) : null}
          <Link
            href={accessHref}
            aria-describedby={actionDescribedBy}
            onFocus={() => announceAction('account')}
            onClick={() => announceAction('account')}
            className={`${actionClass} border-white/[0.10] bg-white/[0.045] text-white hover:bg-white/[0.08] focus-visible:outline-cyan-300`}
          >
            <LogIn className="h-4 w-4" />
            Sign in to account
          </Link>
          <Link
            href="/contact"
            aria-describedby={actionDescribedBy}
            onFocus={() => announceAction('contact')}
            onClick={() => announceAction('contact')}
            className={`${actionClass} border-white/[0.10] bg-white/[0.045] text-white hover:bg-white/[0.08] focus-visible:outline-cyan-300`}
          >
            <MessageSquare className="h-4 w-4" />
            Contact Hylono
          </Link>
        </div>
        <p
          id={actionStatusId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${moduleName} route action status`}
          className="sr-only"
        >
          {actionStatus}
        </p>
      </div>
    </section>
  );
}

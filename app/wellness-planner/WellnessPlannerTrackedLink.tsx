'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type WellnessPlannerLinkEvent =
  | 'wellness_planner_main_cta_clicked'
  | 'wellness_planner_route_transition_clicked';

type WellnessPlannerTrackedLinkProps = {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName?: WellnessPlannerLinkEvent;
  href: string;
  source: 'hero' | 'route_map';
  statusMessage?: string;
};

export const WELLNESS_PLANNER_ROUTE_ACTION_STATUS_ID =
  'wellness-planner-route-action-status';
const WELLNESS_PLANNER_ROUTE_ACTION_STATUS_LABEL = 'Wellness planner route action status';
const WELLNESS_PLANNER_ROUTE_ACTION_STATUS_EVENT = 'wellness-planner-route-action-status-update';
export const WELLNESS_PLANNER_ROUTE_ACTION_READY_STATUS =
  'Wellness planner route handoffs are ready. Use planner jump, store, rental, help, and contact links for next steps.';

const getDefaultEventName = (href: string): WellnessPlannerLinkEvent =>
  href.startsWith('#')
    ? 'wellness_planner_main_cta_clicked'
    : 'wellness_planner_route_transition_clicked';

function getWellnessPlannerRouteActionStatusMessage({
  href,
  source,
}: Pick<WellnessPlannerTrackedLinkProps, 'href' | 'source'>) {
  if (href === '#planner-builder') {
    return 'Opening planner builder from the wellness planner route.';
  }

  if (href === '/store') {
    return 'Opening store from the wellness planner route.';
  }

  if (href === '/rental') {
    return 'Opening rental planning from the wellness planner route.';
  }

  if (href === '/help') {
    return 'Opening help center from the wellness planner route.';
  }

  if (href === '/contact') {
    return 'Opening Contact Hylono from the wellness planner route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the wellness planner route.`;
}

function announceWellnessPlannerRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(WELLNESS_PLANNER_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function WellnessPlannerRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(
    WELLNESS_PLANNER_ROUTE_ACTION_READY_STATUS
  );

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(WELLNESS_PLANNER_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(WELLNESS_PLANNER_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={WELLNESS_PLANNER_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={WELLNESS_PLANNER_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function WellnessPlannerTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: WellnessPlannerTrackedLinkProps) {
  const resolvedEventName = eventName ?? getDefaultEventName(href);
  const routeActionStatusMessage =
    statusMessage ?? getWellnessPlannerRouteActionStatusMessage({ href, source });

  const handleClick = () => {
    announceWellnessPlannerRouteActionStatus(routeActionStatusMessage);
    analytics.capture(resolvedEventName, {
      cta_role: ctaRole,
      destination: href,
      source,
    });
  };

  if (href.startsWith('#')) {
    return (
      <a
        href={href}
        className={className}
        aria-describedby={WELLNESS_PLANNER_ROUTE_ACTION_STATUS_ID}
        onFocus={() => {
          announceWellnessPlannerRouteActionStatus(routeActionStatusMessage);
        }}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={WELLNESS_PLANNER_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceWellnessPlannerRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type SupportHandoffEvent =
  | 'advisors_route_cta_clicked'
  | 'advisors_route_transition_clicked'
  | 'demo_route_cta_clicked'
  | 'demo_route_transition_clicked';

interface SupportHandoffTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: SupportHandoffEvent;
  href: string;
  statusMessage?: string;
  source: 'hero';
}

export const SUPPORT_HANDOFF_ROUTE_ACTION_STATUS_ID =
  'support-handoff-route-action-status';
const SUPPORT_HANDOFF_ROUTE_ACTION_STATUS_LABEL = 'Support handoff route action status';
const SUPPORT_HANDOFF_ROUTE_ACTION_STATUS_EVENT = 'support-handoff-route-action-status-update';
export const SUPPORT_HANDOFF_ROUTE_ACTION_READY_STATUS = '';

function getSupportHandoffRouteActionStatusMessage({
  eventName,
  href,
}: Pick<SupportHandoffTrackedLinkProps, 'eventName' | 'href'>) {
  if (href === '/contact?intent=guidance' || eventName === 'advisors_route_cta_clicked') {
    return 'Opening guidance contact handoff from the support route.';
  }

  if (href === '/contact?intent=demo' || eventName === 'demo_route_cta_clicked') {
    return 'Opening demo contact handoff from the support route.';
  }

  if (href === '/research') {
    return 'Opening research evidence context from the support route.';
  }

  if (href === '/rental') {
    return 'Opening rental planning from the support route.';
  }

  return 'Opening support handoff route destination.';
}

function announceSupportHandoffRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(SUPPORT_HANDOFF_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function SupportHandoffRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(
    SUPPORT_HANDOFF_ROUTE_ACTION_READY_STATUS
  );

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(SUPPORT_HANDOFF_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(SUPPORT_HANDOFF_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={SUPPORT_HANDOFF_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={SUPPORT_HANDOFF_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function SupportHandoffTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  statusMessage,
  source,
}: SupportHandoffTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getSupportHandoffRouteActionStatusMessage({ eventName, href });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={SUPPORT_HANDOFF_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceSupportHandoffRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceSupportHandoffRouteActionStatus(routeActionStatusMessage);
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination: href,
          source,
        });
      }}
    >
      {children}
    </Link>
  );
}

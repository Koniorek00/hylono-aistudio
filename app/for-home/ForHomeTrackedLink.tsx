'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type ForHomeLinkEvent = 'for_home_route_cta_clicked' | 'for_home_route_transition_clicked';

interface ForHomeTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName: ForHomeLinkEvent;
  href: string;
  source: 'hero' | 'fit_map' | 'boundary' | 'next_steps';
  statusMessage?: string;
}

export const FOR_HOME_ROUTE_ACTION_STATUS_ID = 'for-home-route-action-status';
const FOR_HOME_ROUTE_ACTION_STATUS_LABEL = 'For home route action status';
const FOR_HOME_ROUTE_ACTION_STATUS_EVENT = 'for-home-route-action-status-update';
export const FOR_HOME_ROUTE_ACTION_READY_STATUS =
  'For home route handoffs are ready. Use conditions, rental, research, store, delivery, contact, process, safety, service, or FAQ for next steps.';

function getForHomeRouteActionStatusMessage({
  href,
  source,
}: Pick<ForHomeTrackedLinkProps, 'href' | 'source'>) {
  if (href === '/conditions') {
    return 'Opening condition guides from the for home route.';
  }

  if (href === '/rental') {
    return 'Opening rental options from the for home route.';
  }

  if (href === '/research') {
    return 'Opening research hub from the for home route.';
  }

  if (href === '/store') {
    return 'Opening store hub from the for home route.';
  }

  if (href === '/delivery-installation-onboarding') {
    return 'Opening delivery and onboarding from the for home route.';
  }

  if (href.startsWith('/contact')) {
    return 'Opening Hylono contact from the for home route.';
  }

  if (href === '/how-hylono-works') {
    return 'Opening how Hylono works from the for home route.';
  }

  if (href === '/safety-and-standards') {
    return 'Opening safety and standards from the for home route.';
  }

  if (href === '/service-and-support') {
    return 'Opening service and support from the for home route.';
  }

  if (href === '/faq') {
    return 'Opening FAQ from the for home route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the for home route.`;
}

function announceForHomeRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(FOR_HOME_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function ForHomeRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(FOR_HOME_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(FOR_HOME_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(FOR_HOME_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={FOR_HOME_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={FOR_HOME_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function ForHomeTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: ForHomeTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getForHomeRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={FOR_HOME_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceForHomeRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceForHomeRouteActionStatus(routeActionStatusMessage);
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

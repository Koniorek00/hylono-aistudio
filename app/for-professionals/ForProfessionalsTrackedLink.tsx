'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type ForProfessionalsLinkEvent =
  | 'for_professionals_route_cta_clicked'
  | 'for_professionals_route_transition_clicked';

interface ForProfessionalsTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName: ForProfessionalsLinkEvent;
  href: string;
  source: 'hero' | 'operator_map' | 'boundary' | 'next_steps';
  statusMessage?: string;
}

export const FOR_PROFESSIONALS_ROUTE_ACTION_STATUS_ID =
  'for-professionals-route-action-status';
const FOR_PROFESSIONALS_ROUTE_ACTION_STATUS_LABEL =
  'For professionals route action status';
const FOR_PROFESSIONALS_ROUTE_ACTION_STATUS_EVENT =
  'for-professionals-route-action-status-update';
export const FOR_PROFESSIONALS_ROUTE_ACTION_READY_STATUS =
  'For professionals route handoffs are ready. Use contact, research, safety, service, delivery, store, process, home, FAQ, or help for next steps.';

function getForProfessionalsRouteActionStatusMessage({
  href,
  source,
}: Pick<ForProfessionalsTrackedLinkProps, 'href' | 'source'>) {
  if (href.startsWith('/contact')) {
    return 'Opening professional contact from the for professionals route.';
  }

  if (href === '/research') {
    return 'Opening research hub from the for professionals route.';
  }

  if (href === '/safety-and-standards') {
    return 'Opening safety and standards from the for professionals route.';
  }

  if (href === '/service-and-support') {
    return 'Opening service and support from the for professionals route.';
  }

  if (href === '/delivery-installation-onboarding') {
    return 'Opening delivery and onboarding from the for professionals route.';
  }

  if (href === '/store') {
    return 'Opening technology paths from the for professionals route.';
  }

  if (href === '/how-hylono-works') {
    return 'Opening Hylono process from the for professionals route.';
  }

  if (href === '/for-home') {
    return 'Opening home route from the for professionals route.';
  }

  if (href === '/faq') {
    return 'Opening FAQ from the for professionals route.';
  }

  if (href === '/help') {
    return 'Opening help center from the for professionals route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the for professionals route.`;
}

function announceForProfessionalsRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(FOR_PROFESSIONALS_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function ForProfessionalsRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(
    FOR_PROFESSIONALS_ROUTE_ACTION_READY_STATUS
  );

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(FOR_PROFESSIONALS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(
        FOR_PROFESSIONALS_ROUTE_ACTION_STATUS_EVENT,
        handleStatusUpdate
      );
    };
  }, []);

  return (
    <p
      id={FOR_PROFESSIONALS_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={FOR_PROFESSIONALS_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function ForProfessionalsTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: ForProfessionalsTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getForProfessionalsRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={FOR_PROFESSIONALS_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceForProfessionalsRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceForProfessionalsRouteActionStatus(routeActionStatusMessage);
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

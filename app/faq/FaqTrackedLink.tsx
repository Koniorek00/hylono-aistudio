'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type FaqLinkEvent = 'faq_route_cta_clicked' | 'faq_support_route_clicked';

interface FaqTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: FaqLinkEvent;
  href: string;
  source: 'hero' | 'route_map' | 'trust_context';
  statusMessage?: string;
}

interface FaqTrackedEmailLinkProps {
  children: ReactNode;
  className: string;
  clickStatusMessage: string;
  focusStatusMessage: string;
  href: string;
}

export const FAQ_ROUTE_ACTION_STATUS_ID = 'faq-route-action-status';
const FAQ_ROUTE_ACTION_STATUS_LABEL = 'FAQ next-step status';
const FAQ_ROUTE_ACTION_STATUS_EVENT = 'faq-route-action-status-update';
export const FAQ_ROUTE_ACTION_READY_STATUS =
  'FAQ next-step links are ready. Use FAQ search, help, contact, support email, rental, shipping, or warranty guidance for next steps.';

function getFaqRouteActionStatusMessage({
  href,
  source,
}: Pick<FaqTrackedLinkProps, 'href' | 'source'>) {
  if (href === '#faq-library') {
    return 'Opening FAQ search from the FAQ route.';
  }

  if (href === '/help') {
    return 'Opening help center from the FAQ route.';
  }

  if (href === '/contact') {
    return 'Opening contact handoff from the FAQ route.';
  }

  if (href === '/rental') {
    return 'Opening rental path from the FAQ route.';
  }

  if (href === '/shipping') {
    return 'Opening shipping guidance from the FAQ route.';
  }

  if (href === '/warranty') {
    return 'Opening warranty guidance from the FAQ route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the FAQ route.`;
}

function announceFaqRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(FAQ_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function FaqRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(FAQ_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(FAQ_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(FAQ_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={FAQ_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={FAQ_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function FaqTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: FaqTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getFaqRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={FAQ_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceFaqRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceFaqRouteActionStatus(routeActionStatusMessage);
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

export function FaqTrackedEmailLink({
  children,
  className,
  clickStatusMessage,
  focusStatusMessage,
  href,
}: FaqTrackedEmailLinkProps) {
  return (
    <a
      href={href}
      className={className}
      aria-describedby={FAQ_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceFaqRouteActionStatus(focusStatusMessage);
      }}
      onClick={() => {
        announceFaqRouteActionStatus(clickStatusMessage);
      }}
    >
      {children}
    </a>
  );
}

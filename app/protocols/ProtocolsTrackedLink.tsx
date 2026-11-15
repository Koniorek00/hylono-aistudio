'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type ProtocolsLinkEvent =
  | 'protocols_route_cta_clicked'
  | 'protocols_route_transition_clicked';

interface ProtocolsTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName?: ProtocolsLinkEvent;
  href: string;
  statusMessage?: string;
  source:
    | 'hero'
    | 'trust_context'
    | 'protocol_detail_hero'
    | 'protocol_detail_product_hubs'
    | 'protocol_detail_static_access'
    | 'protocol_detail_answer_frame'
    | 'protocol_detail_follow_up';
}

export const PROTOCOLS_ROUTE_ACTION_STATUS_ID = 'protocols-route-action-status';
const PROTOCOLS_ROUTE_ACTION_STATUS_LABEL = 'Protocols route action status';
const PROTOCOLS_ROUTE_ACTION_STATUS_EVENT = 'protocols-route-action-status-update';
export const PROTOCOLS_ROUTE_ACTION_READY_STATUS =
  'Protocols route handoffs are ready. Use the protocol library, research, rental, contact, product, or condition routes for next steps.';

function getProtocolsRouteActionStatusMessage({
  href,
  source,
}: Pick<ProtocolsTrackedLinkProps, 'href' | 'source'>) {
  if (href === '#protocol-library') {
    return 'Opening protocol library from the protocols route.';
  }

  if (href === '/protocols') {
    return 'Opening protocols overview from the protocols route.';
  }

  if (href.startsWith('/research')) {
    return 'Opening research evidence from the protocols route.';
  }

  if (href.startsWith('/rental')) {
    return 'Opening rental planning from the protocols route.';
  }

  if (href.startsWith('/contact')) {
    return 'Opening Contact Hylono from the protocols route.';
  }

  if (href.startsWith('/product/')) {
    return 'Opening product hub from the protocols route.';
  }

  if (href.startsWith('/conditions/')) {
    return 'Opening condition guide from the protocols route.';
  }

  if (href.startsWith('/protocols/')) {
    return 'Opening protocol detail from the protocols route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the protocols route.`;
}

function announceProtocolsRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(PROTOCOLS_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function ProtocolsRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(PROTOCOLS_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(PROTOCOLS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(PROTOCOLS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={PROTOCOLS_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={PROTOCOLS_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function ProtocolsTrackedLink({
  children,
  className,
  ctaRole,
  eventName = 'protocols_route_transition_clicked',
  href,
  statusMessage,
  source,
}: ProtocolsTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getProtocolsRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={PROTOCOLS_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceProtocolsRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceProtocolsRouteActionStatus(routeActionStatusMessage);
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

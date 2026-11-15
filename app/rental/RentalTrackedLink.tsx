'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

interface RentalTrackedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  ctaRole: 'primary' | 'supporting' | 'policy';
  source: 'decision_frame' | 'hero' | 'hydrogen_rental_frame' | 'lead_time_bands';
  statusMessage?: string;
}

export const RENTAL_ROUTE_ACTION_STATUS_ID = 'rental-route-action-status';
const RENTAL_ROUTE_ACTION_STATUS_LABEL = 'Rental route action status - Rental next-step status';
const RENTAL_ROUTE_ACTION_STATUS_EVENT = 'rental-route-action-status-update';
export const RENTAL_ROUTE_ACTION_READY_STATUS =
  'Rental next-step links are ready. Use device filters, contact, hydrogen systems, protocol context, policies, or timing support for next steps.';

function getRentalRouteActionStatusMessage({
  href,
  source,
}: Pick<RentalTrackedLinkProps, 'href' | 'source'>) {
  if (href === '#available-rental-devices') {
    return 'Opening available rental devices from the rental route.';
  }

  if (href.startsWith('/contact?intent=hydrogen-rental')) {
    return 'Opening hydrogen rental availability support from the rental route.';
  }

  if (href.startsWith('/contact')) {
    return 'Opening rental contact support from the rental route.';
  }

  if (href.startsWith('/rental?device=')) {
    return 'Opening filtered rental device options from the rental route.';
  }

  if (href.startsWith('/product/hydrogen')) {
    return 'Opening hydrogen systems from the rental route.';
  }

  if (href.startsWith('/protocols/')) {
    return 'Opening protocol context from the rental route.';
  }

  if (href === '/shipping') {
    return 'Opening shipping policy from the rental route.';
  }

  if (href === '/returns') {
    return 'Opening returns policy from the rental route.';
  }

  if (href === '/warranty') {
    return 'Opening warranty policy from the rental route.';
  }

  if (href === '/terms') {
    return 'Opening terms from the rental route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the rental route.`;
}

function announceRentalRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(RENTAL_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function RentalRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(RENTAL_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(RENTAL_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(RENTAL_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={RENTAL_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={RENTAL_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function RentalTrackedLink({
  href,
  children,
  className,
  ctaRole,
  source,
  statusMessage,
}: RentalTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getRentalRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={RENTAL_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceRentalRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceRentalRouteActionStatus(routeActionStatusMessage);
        analytics.capture('rental_route_transition_clicked', {
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

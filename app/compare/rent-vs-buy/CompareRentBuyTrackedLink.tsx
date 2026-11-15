'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type CompareRentBuyLinkEvent =
  | 'compare_rent_buy_route_cta_clicked'
  | 'compare_rent_buy_route_transition_clicked';

interface CompareRentBuyTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName: CompareRentBuyLinkEvent;
  href: string;
  source: 'hero' | 'comparison_map' | 'boundary' | 'next_steps';
  statusMessage?: string;
}

export const COMPARE_RENT_BUY_ROUTE_ACTION_STATUS_ID =
  'compare-rent-buy-route-action-status';
const COMPARE_RENT_BUY_ROUTE_ACTION_STATUS_LABEL =
  'Compare rent vs buy route action status';
const COMPARE_RENT_BUY_ROUTE_ACTION_STATUS_EVENT =
  'compare-rent-buy-route-action-status-update';
export const COMPARE_RENT_BUY_ROUTE_ACTION_READY_STATUS =
  'Compare rent-vs-buy route handoffs are ready. Use rental, store, consultation, service, delivery, safety, shipping, returns, warranty, or FAQ for next steps.';

function getCompareRentBuyRouteActionStatusMessage({
  href,
  source,
}: Pick<CompareRentBuyTrackedLinkProps, 'href' | 'source'>) {
  if (href === '/rental') {
    return 'Opening rental access from the rent-vs-buy comparison.';
  }

  if (href === '/store') {
    return 'Opening store and product paths from the rent-vs-buy comparison.';
  }

  if (href === '/consultation') {
    return 'Opening consultation from the rent-vs-buy comparison.';
  }

  if (href === '/service-and-support') {
    return 'Opening service and support from the rent-vs-buy comparison.';
  }

  if (href === '/delivery-installation-onboarding') {
    return 'Opening delivery and onboarding from the rent-vs-buy comparison.';
  }

  if (href === '/safety-and-standards') {
    return 'Opening safety and standards from the rent-vs-buy comparison.';
  }

  if (href === '/shipping') {
    return 'Opening shipping policy from the rent-vs-buy comparison.';
  }

  if (href === '/returns') {
    return 'Opening returns policy from the rent-vs-buy comparison.';
  }

  if (href === '/warranty') {
    return 'Opening warranty policy from the rent-vs-buy comparison.';
  }

  if (href === '/faq') {
    return 'Opening FAQ from the rent-vs-buy comparison.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the rent-vs-buy comparison.`;
}

function announceCompareRentBuyRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(COMPARE_RENT_BUY_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function CompareRentBuyRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(
    COMPARE_RENT_BUY_ROUTE_ACTION_READY_STATUS
  );

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(COMPARE_RENT_BUY_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(COMPARE_RENT_BUY_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={COMPARE_RENT_BUY_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={COMPARE_RENT_BUY_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function CompareRentBuyTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: CompareRentBuyTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getCompareRentBuyRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={COMPARE_RENT_BUY_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceCompareRentBuyRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceCompareRentBuyRouteActionStatus(routeActionStatusMessage);
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

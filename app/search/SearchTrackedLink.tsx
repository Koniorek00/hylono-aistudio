'use client';

import Link from 'next/link';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type SearchLinkEvent =
  | 'search_result_clicked'
  | 'search_route_cta_clicked'
  | 'search_route_transition_clicked';
type SearchLinkHref = ComponentProps<typeof Link>['href'];
type SearchLinkSource =
  | 'result_list'
  | 'stronger_start'
  | 'suggested_search'
  | 'support_handoff';

export const SEARCH_ROUTE_ACTION_STATUS_ID = 'search-route-action-status';
const SEARCH_ROUTE_ACTION_STATUS_LABEL = 'Search route action status';
const SEARCH_ROUTE_ACTION_STATUS_EVENT = 'search-route-action-status-update';
export const SEARCH_ROUTE_ACTION_READY_STATUS =
  'Search route handoffs are ready. Use contact, results, suggested searches, condition guides, research, protocols, store, or help for next steps.';

const stringifyHref = (href: SearchLinkHref): string => {
  if (typeof href === 'string') return href;

  const params = new URLSearchParams();
  const query = href.query ?? {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'undefined') continue;

    const values = Array.isArray(value) ? value : [value];
    for (const entry of values) {
      if (typeof entry !== 'undefined') {
        params.append(key, String(entry));
      }
    }
  }

  const queryString = params.toString();
  return `${href.pathname ?? ''}${queryString ? `?${queryString}` : ''}`;
};

interface SearchTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual' | 'result';
  eventName: SearchLinkEvent;
  href: SearchLinkHref;
  source: SearchLinkSource;
  statusMessage?: string;
}

function getSearchRouteActionStatusMessage({
  destination,
  source,
}: {
  destination: string;
  source: SearchLinkSource;
}) {
  if (destination.startsWith('/contact')) {
    return 'Opening Hylono contact from the search route.';
  }

  if (destination === '/conditions' || destination.startsWith('/conditions/')) {
    return 'Opening condition guidance from the search route.';
  }

  if (destination === '/research') {
    return 'Opening research hub from the search route.';
  }

  if (destination === '/protocols' || destination.startsWith('/protocols/')) {
    return 'Opening protocol library from the search route.';
  }

  if (destination === '/store') {
    return 'Opening store hub from the search route.';
  }

  if (destination === '/help') {
    return 'Opening help center from the search route.';
  }

  if (destination.startsWith('/blog/')) {
    return 'Opening article result from the search route.';
  }

  if (destination.startsWith('/product/')) {
    return 'Opening product result from the search route.';
  }

  if (destination.startsWith('/search?')) {
    return 'Opening suggested search from the search route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the search route.`;
}

function announceSearchRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(SEARCH_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function SearchRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(SEARCH_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(SEARCH_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(SEARCH_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={SEARCH_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={SEARCH_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function SearchTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: SearchTrackedLinkProps) {
  const destination = stringifyHref(href);
  const routeActionStatusMessage =
    statusMessage ?? getSearchRouteActionStatusMessage({ destination, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={SEARCH_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceSearchRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceSearchRouteActionStatus(routeActionStatusMessage);
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination,
          source,
        });
      }}
    >
      {children}
    </Link>
  );
}

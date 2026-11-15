'use client';

import Link from 'next/link';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type FiresafeLinkEvent = 'firesafe_route_cta_clicked' | 'firesafe_route_transition_clicked';
type FiresafeLinkHref = ComponentProps<typeof Link>['href'];
type FiresafeLinkSource = 'hero' | 'route_map' | 'support_panel';

export const FIRESAFE_ROUTE_ACTION_STATUS_ID = 'firesafe-route-action-status';
const FIRESAFE_ROUTE_ACTION_STATUS_LABEL = 'Firesafe route action status';
const FIRESAFE_ROUTE_ACTION_STATUS_EVENT = 'firesafe-route-action-status-update';
export const FIRESAFE_ROUTE_ACTION_READY_STATUS =
  'Firesafe route handoffs are ready. Use support, store, rental, contact, or company context for next steps.';

const stringifyHref = (href: FiresafeLinkHref): string => {
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

interface FiresafeTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: FiresafeLinkEvent;
  href: FiresafeLinkHref;
  source: FiresafeLinkSource;
  statusMessage: string;
}

function announceFiresafeRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(FIRESAFE_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function FiresafeRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(FIRESAFE_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(FIRESAFE_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(FIRESAFE_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={FIRESAFE_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={FIRESAFE_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function FiresafeTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: FiresafeTrackedLinkProps) {
  const destination = stringifyHref(href);

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={FIRESAFE_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceFiresafeRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination,
          source,
        });
        announceFiresafeRouteActionStatus(statusMessage);
      }}
    >
      {children}
    </Link>
  );
}

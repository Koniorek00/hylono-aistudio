'use client';

import Link from 'next/link';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type MeridianLinkEvent = 'meridian_route_cta_clicked' | 'meridian_route_transition_clicked';
type MeridianLinkHref = ComponentProps<typeof Link>['href'];
type MeridianLinkSource = 'hero' | 'route_map';

export const MERIDIAN_ROUTE_ACTION_STATUS_ID = 'meridian-route-action-status';
const MERIDIAN_ROUTE_ACTION_STATUS_LABEL = 'Meridian route action status';
const MERIDIAN_ROUTE_ACTION_STATUS_EVENT = 'meridian-route-action-status-update';
export const MERIDIAN_ROUTE_ACTION_READY_STATUS =
  'Meridian route handoffs are ready. Use protocol, contact, company, research, store, or rental context for next steps.';

const stringifyHref = (href: MeridianLinkHref): string => {
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

interface MeridianTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: MeridianLinkEvent;
  href: MeridianLinkHref;
  source: MeridianLinkSource;
  statusMessage: string;
}

function announceMeridianRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(MERIDIAN_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function MeridianRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(MERIDIAN_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(MERIDIAN_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(MERIDIAN_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={MERIDIAN_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={MERIDIAN_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function MeridianTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: MeridianTrackedLinkProps) {
  const destination = stringifyHref(href);

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={MERIDIAN_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceMeridianRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination,
          source,
        });
        announceMeridianRouteActionStatus(statusMessage);
      }}
    >
      {children}
    </Link>
  );
}

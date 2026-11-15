'use client';

import Link from 'next/link';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type LearningLinkEvent = 'learning_route_cta_clicked' | 'learning_route_transition_clicked';
type LearningLinkHref = ComponentProps<typeof Link>['href'];
type LearningLinkSource = 'hero' | 'route_map' | 'support_panel';

export const LEARNING_ROUTE_ACTION_STATUS_ID = 'learning-route-action-status';
const LEARNING_ROUTE_ACTION_STATUS_LABEL = 'Learning next-step status';
const LEARNING_ROUTE_ACTION_STATUS_EVENT = 'learning-route-action-status-update';
export const LEARNING_ROUTE_ACTION_READY_STATUS_MESSAGE =
  'Learning next-step links ready: protocol guides, research summaries, product hubs, rental planning, contact handoff, and support hub exits.';

const stringifyHref = (href: LearningLinkHref): string => {
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

interface LearningTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: LearningLinkEvent;
  href: LearningLinkHref;
  source: LearningLinkSource;
  statusMessage: string;
}

function announceLearningRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(LEARNING_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function LearningRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(LEARNING_ROUTE_ACTION_READY_STATUS_MESSAGE);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;

      if (detail?.message) {
        setStatusMessage(detail.message);
      }
    };

    window.addEventListener(LEARNING_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(LEARNING_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={LEARNING_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={LEARNING_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function LearningTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: LearningTrackedLinkProps) {
  const destination = stringifyHref(href);

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={LEARNING_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceLearningRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        announceLearningRouteActionStatus(statusMessage);
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

'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type PressLinkEvent = 'press_route_cta_clicked' | 'press_route_transition_clicked';

export const PRESS_ROUTE_ACTION_STATUS_ID = 'press-route-action-status';
const PRESS_ROUTE_ACTION_STATUS_LABEL = 'Press route action status';
const PRESS_ROUTE_ACTION_STATUS_EVENT = 'press-route-action-status-update';
export const PRESS_ROUTE_ACTION_READY_STATUS =
  'Press route handoffs are ready. Use contact, email, or stronger public pages for media requests.';

interface PressTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: PressLinkEvent;
  href: string;
  source: 'hero' | 'best_next_step' | 'route_map';
  statusMessage: string;
}

interface PressActionAnchorProps {
  children: ReactNode;
  className: string;
  href: string;
  statusMessage: string;
}

function announcePressRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(PRESS_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function PressRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(PRESS_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(PRESS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(PRESS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={PRESS_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={PRESS_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function PressActionAnchor({
  children,
  className,
  href,
  statusMessage,
}: PressActionAnchorProps) {
  const handleStatusUpdate = () => {
    announcePressRouteActionStatus(statusMessage);
  };

  return (
    <a
      href={href}
      className={className}
      aria-describedby={PRESS_ROUTE_ACTION_STATUS_ID}
      onFocus={handleStatusUpdate}
      onClick={handleStatusUpdate}
    >
      {children}
    </a>
  );
}

export function PressTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: PressTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      aria-describedby={PRESS_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announcePressRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination: href,
          source,
        });
        announcePressRouteActionStatus(statusMessage);
      }}
    >
      {children}
    </Link>
  );
}

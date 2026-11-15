'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type CareersLinkEvent = 'careers_route_cta_clicked' | 'careers_route_transition_clicked';
type CareersLinkSource = 'hero' | 'candidate_expectations' | 'route_map';

export const CAREERS_ROUTE_ACTION_STATUS_ID = 'careers-route-action-status';
const CAREERS_ROUTE_ACTION_STATUS_LABEL = 'Careers route action status';
const CAREERS_ROUTE_ACTION_STATUS_EVENT = 'careers-route-action-status-update';
export const CAREERS_ROUTE_ACTION_READY_STATUS_MESSAGE =
  'Careers route controls ready: contact handoff, email inquiry, fit-context, and route-map exits.';

interface CareersTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: CareersLinkEvent;
  href: string;
  source: CareersLinkSource;
  statusMessage: string;
  style?: React.CSSProperties;
}

const usesPlainAnchor = (href: string) =>
  href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http');

function announceCareersRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(CAREERS_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function CareersRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(CAREERS_ROUTE_ACTION_READY_STATUS_MESSAGE);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;

      if (detail?.message) {
        setStatusMessage(detail.message);
      }
    };

    window.addEventListener(CAREERS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(CAREERS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={CAREERS_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={CAREERS_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function CareersTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
  style,
}: CareersTrackedLinkProps) {
  const handleClick = () => {
    announceCareersRouteActionStatus(statusMessage);
    analytics.capture(eventName, {
      cta_role: ctaRole,
      destination: href,
      source,
    });
  };

  if (usesPlainAnchor(href)) {
    return (
      <a
        href={href}
        aria-describedby={CAREERS_ROUTE_ACTION_STATUS_ID}
        className={className}
        style={style}
        onFocus={() => {
          announceCareersRouteActionStatus(statusMessage);
        }}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      aria-describedby={CAREERS_ROUTE_ACTION_STATUS_ID}
      className={className}
      style={style}
      onFocus={() => {
        announceCareersRouteActionStatus(statusMessage);
      }}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

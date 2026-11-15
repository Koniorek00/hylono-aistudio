'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type SafetyStandardsLinkEvent =
  | 'safety_standards_route_cta_clicked'
  | 'safety_standards_route_transition_clicked';

export const SAFETY_STANDARDS_ROUTE_ACTION_STATUS_ID =
  'safety-standards-route-action-status';
const SAFETY_STANDARDS_ROUTE_ACTION_STATUS_LABEL =
  'Safety and standards route action status';
const SAFETY_STANDARDS_ROUTE_ACTION_STATUS_EVENT =
  'safety-standards-route-action-status-update';
export const SAFETY_STANDARDS_ROUTE_ACTION_READY_STATUS =
  'Safety and standards route handoffs are ready. Use research, help, contact, policy, shipping, returns, warranty, or FAQ routes for next steps.';

interface SafetyStandardsTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName: SafetyStandardsLinkEvent;
  href: string;
  source: 'hero' | 'standards_map' | 'claims_boundary' | 'next_steps';
  statusMessage: string;
}

function announceSafetyStandardsRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(SAFETY_STANDARDS_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function SafetyStandardsRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(
    SAFETY_STANDARDS_ROUTE_ACTION_READY_STATUS
  );

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(SAFETY_STANDARDS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(SAFETY_STANDARDS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={SAFETY_STANDARDS_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={SAFETY_STANDARDS_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function SafetyStandardsTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: SafetyStandardsTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      aria-describedby={SAFETY_STANDARDS_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceSafetyStandardsRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination: href,
          source,
        });
        announceSafetyStandardsRouteActionStatus(statusMessage);
      }}
    >
      {children}
    </Link>
  );
}

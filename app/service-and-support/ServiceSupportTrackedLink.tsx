'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type ServiceSupportLinkEvent =
  | 'service_support_route_cta_clicked'
  | 'service_support_route_transition_clicked';

export const SERVICE_SUPPORT_ROUTE_ACTION_STATUS_ID = 'service-support-route-action-status';
const SERVICE_SUPPORT_ROUTE_ACTION_STATUS_LABEL = 'Service and support route action status';
const SERVICE_SUPPORT_ROUTE_ACTION_STATUS_EVENT = 'service-support-route-action-status-update';
export const SERVICE_SUPPORT_ROUTE_ACTION_READY_STATUS =
  'Service and support route handoffs are ready. Use help, contact, rental, safety, shipping, returns, warranty, or FAQ routes for next steps.';

interface ServiceSupportTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName: ServiceSupportLinkEvent;
  href: string;
  source: 'hero' | 'service_map' | 'boundary' | 'next_steps';
  statusMessage: string;
}

function announceServiceSupportRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(SERVICE_SUPPORT_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function ServiceSupportRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(SERVICE_SUPPORT_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(SERVICE_SUPPORT_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(SERVICE_SUPPORT_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={SERVICE_SUPPORT_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={SERVICE_SUPPORT_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function ServiceSupportTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: ServiceSupportTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      aria-describedby={SERVICE_SUPPORT_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceServiceSupportRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination: href,
          source,
        });
        if (href.startsWith('/contact')) {
          analytics.capture('support_contact_click', {
            route: '/service-and-support',
            destination: href,
            cta_role: ctaRole,
            source,
          });
        }
        announceServiceSupportRouteActionStatus(statusMessage);
      }}
    >
      {children}
    </Link>
  );
}

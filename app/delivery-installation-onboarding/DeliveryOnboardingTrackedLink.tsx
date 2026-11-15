'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type DeliveryOnboardingLinkEvent =
  | 'delivery_onboarding_route_cta_clicked'
  | 'delivery_onboarding_route_transition_clicked';

export const DELIVERY_ONBOARDING_ROUTE_ACTION_STATUS_ID =
  'delivery-onboarding-route-action-status';
const DELIVERY_ONBOARDING_ROUTE_ACTION_STATUS_LABEL =
  'Delivery onboarding route action status';
const DELIVERY_ONBOARDING_ROUTE_ACTION_STATUS_EVENT =
  'delivery-onboarding-route-action-status-update';
export const DELIVERY_ONBOARDING_ROUTE_ACTION_READY_STATUS =
  'Delivery onboarding route controls ready: shipping, setup contact, service, rental, warranty, returns, and support exits.';

interface DeliveryOnboardingTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName: DeliveryOnboardingLinkEvent;
  href: string;
  source: 'hero' | 'logistics_map' | 'boundary' | 'next_steps';
  statusMessage: string;
}

function announceDeliveryOnboardingRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(DELIVERY_ONBOARDING_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function DeliveryOnboardingRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(
    DELIVERY_ONBOARDING_ROUTE_ACTION_READY_STATUS
  );

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(DELIVERY_ONBOARDING_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(
        DELIVERY_ONBOARDING_ROUTE_ACTION_STATUS_EVENT,
        handleStatusUpdate
      );
    };
  }, []);

  return (
    <p
      id={DELIVERY_ONBOARDING_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={DELIVERY_ONBOARDING_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function DeliveryOnboardingTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: DeliveryOnboardingTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      aria-describedby={DELIVERY_ONBOARDING_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceDeliveryOnboardingRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination: href,
          source,
        });
        announceDeliveryOnboardingRouteActionStatus(statusMessage);
      }}
    >
      {children}
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type HhoCarKitLinkEvent =
  | 'hho_car_kit_route_cta_clicked'
  | 'hho_car_kit_route_transition_clicked';
type HhoCarKitLinkHref = ComponentProps<typeof Link>['href'];
type HhoCarKitLinkSource = 'hero' | 'route_map' | 'support_panel';

export const HHO_CAR_KIT_ROUTE_ACTION_STATUS_ID = 'hho-car-kit-route-action-status';
const HHO_CAR_KIT_ROUTE_ACTION_STATUS_LABEL = 'HHO car kit route action status';
const HHO_CAR_KIT_ROUTE_ACTION_STATUS_EVENT = 'hho-car-kit-route-action-status-update';
export const HHO_CAR_KIT_ROUTE_ACTION_READY_STATUS =
  'HHO car kit route handoffs are ready. Use support, contact, store, FAQ, or company context for next steps.';

interface HhoCarKitTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: HhoCarKitLinkEvent;
  href: HhoCarKitLinkHref;
  source: HhoCarKitLinkSource;
  statusMessage: string;
}

function announceHhoCarKitRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(HHO_CAR_KIT_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function HhoCarKitRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(HHO_CAR_KIT_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(HHO_CAR_KIT_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(HHO_CAR_KIT_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={HHO_CAR_KIT_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={HHO_CAR_KIT_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function HhoCarKitTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: HhoCarKitTrackedLinkProps) {
  const destination = typeof href === 'string' ? href : (href.pathname ?? '');

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={HHO_CAR_KIT_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceHhoCarKitRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination,
          source,
        });
        announceHhoCarKitRouteActionStatus(statusMessage);
      }}
    >
      {children}
    </Link>
  );
}

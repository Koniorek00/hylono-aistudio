'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type HowHylonoWorksLinkEvent =
  | 'how_hylono_works_route_cta_clicked'
  | 'how_hylono_works_route_transition_clicked';

export const HOW_HYLONO_WORKS_ROUTE_ACTION_STATUS_ID = 'how-hylono-works-route-action-status';
const HOW_HYLONO_WORKS_ROUTE_ACTION_STATUS_LABEL = 'How Hylono Works route action status';
const HOW_HYLONO_WORKS_ROUTE_ACTION_STATUS_EVENT =
  'how-hylono-works-route-action-status-update';
export const HOW_HYLONO_WORKS_ROUTE_ACTION_READY_STATUS =
  'How Hylono Works route handoffs are ready. Use goals, contact, evidence, protocols, store, rental, service, safety, help, or support exits for next steps.';

interface HowHylonoWorksTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName: HowHylonoWorksLinkEvent;
  href: string;
  source: 'hero' | 'process_map' | 'boundary' | 'next_steps';
  statusMessage: string;
}

function announceHowHylonoWorksRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(HOW_HYLONO_WORKS_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function HowHylonoWorksRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(HOW_HYLONO_WORKS_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(HOW_HYLONO_WORKS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(HOW_HYLONO_WORKS_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={HOW_HYLONO_WORKS_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={HOW_HYLONO_WORKS_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function HowHylonoWorksTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: HowHylonoWorksTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      aria-describedby={HOW_HYLONO_WORKS_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceHowHylonoWorksRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination: href,
          source,
        });
        announceHowHylonoWorksRouteActionStatus(statusMessage);
      }}
    >
      {children}
    </Link>
  );
}

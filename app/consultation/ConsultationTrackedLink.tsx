'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type ConsultationLinkEvent =
  | 'consultation_route_cta_clicked'
  | 'consultation_route_transition_clicked';

interface ConsultationTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName: ConsultationLinkEvent;
  href: string;
  source: 'hero' | 'decision_map' | 'form_bridge' | 'next_steps';
  statusMessage?: string;
}

interface ConsultationTrackedEmailLinkProps {
  children: ReactNode;
  className: string;
  clickStatusMessage: string;
  focusStatusMessage: string;
  href: string;
}

export const CONSULTATION_ROUTE_ACTION_STATUS_ID = 'consultation-route-action-status';
const CONSULTATION_ROUTE_ACTION_STATUS_LABEL = 'Consultation route action status';
const CONSULTATION_ROUTE_ACTION_STATUS_EVENT = 'consultation-route-action-status-update';
export const CONSULTATION_ROUTE_ACTION_READY_STATUS =
  'Consultation route handoffs are ready. Use the consultation form, process, home, professional, rental, store, research, service, delivery, safety, or contact route for next steps.';

function getConsultationRouteActionStatusMessage({
  href,
  source,
}: Pick<ConsultationTrackedLinkProps, 'href' | 'source'>) {
  if (href === '#consultation-form') {
    return 'Opening consultation form from the consultation route.';
  }

  if (href === '/how-hylono-works') {
    return 'Opening Hylono process from the consultation route.';
  }

  if (href === '/for-home') {
    return 'Opening home planning path from the consultation route.';
  }

  if (href === '/for-professionals') {
    return 'Opening professional planning path from the consultation route.';
  }

  if (href === '/rental') {
    return 'Opening rental options from the consultation route.';
  }

  if (href === '/store') {
    return 'Opening technology paths from the consultation route.';
  }

  if (href === '/research') {
    return 'Opening research hub from the consultation route.';
  }

  if (href === '/service-and-support') {
    return 'Opening service and support from the consultation route.';
  }

  if (href === '/delivery-installation-onboarding') {
    return 'Opening delivery and onboarding from the consultation route.';
  }

  if (href === '/safety-and-standards') {
    return 'Opening safety and standards from the consultation route.';
  }

  if (href === '/contact') {
    return 'Opening contact page from the consultation route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the consultation route.`;
}

function announceConsultationRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(CONSULTATION_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function ConsultationRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(CONSULTATION_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(CONSULTATION_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(CONSULTATION_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={CONSULTATION_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={CONSULTATION_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function ConsultationTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: ConsultationTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getConsultationRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={CONSULTATION_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceConsultationRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceConsultationRouteActionStatus(routeActionStatusMessage);
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination: href,
          source,
        });
      }}
    >
      {children}
    </Link>
  );
}

export function ConsultationTrackedEmailLink({
  children,
  className,
  clickStatusMessage,
  focusStatusMessage,
  href,
}: ConsultationTrackedEmailLinkProps) {
  return (
    <a
      href={href}
      className={className}
      aria-describedby={CONSULTATION_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceConsultationRouteActionStatus(focusStatusMessage);
      }}
      onClick={() => {
        announceConsultationRouteActionStatus(clickStatusMessage);
      }}
    >
      {children}
    </a>
  );
}

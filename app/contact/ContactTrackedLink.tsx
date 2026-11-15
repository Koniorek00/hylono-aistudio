'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type ContactLinkEvent = 'contact_route_cta_clicked' | 'contact_support_route_clicked';

interface ContactTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: ContactLinkEvent;
  href: string;
  source:
    | 'hero'
    | 'hero_self_serve'
    | 'ownership_answer'
    | 'routing_checklist'
    | 'support_proof_request';
  statusMessage?: string;
  'aria-label'?: string;
}

export const CONTACT_ROUTE_ACTION_STATUS_ID = 'contact-route-action-status';
const CONTACT_ROUTE_ACTION_STATUS_LABEL = 'Contact next-step status';
const CONTACT_ROUTE_ACTION_STATUS_EVENT = 'contact-route-action-status-update';
export const CONTACT_ROUTE_ACTION_READY_STATUS =
  'Contact next-step links are ready. Use the contact form, rental, store, help, company, policies, research, or email for next steps.';

function getContactRouteActionStatusMessage({
  href,
  source,
}: Pick<ContactTrackedLinkProps, 'href' | 'source'>) {
  if (href === '#contact-form') {
    return 'Opening contact form from the contact route.';
  }

  if (href.startsWith('mailto:')) {
    return 'Opening email handoff from the contact route.';
  }

  if (href === '/rental') {
    return 'Opening rental support from the contact route.';
  }

  if (href === '/store') {
    return 'Opening store support from the contact route.';
  }

  if (href === '/help') {
    return 'Opening help support from the contact route.';
  }

  if (href === '/about') {
    return 'Opening company context from the contact route.';
  }

  if (href === '/policies') {
    return 'Opening policy center from the contact route.';
  }

  if (href === '/research') {
    return 'Opening public evidence from the contact route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the contact route.`;
}

function announceContactRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(CONTACT_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function ContactRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(CONTACT_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(CONTACT_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(CONTACT_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={CONTACT_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={CONTACT_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function ContactTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
  'aria-label': ariaLabel,
}: ContactTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getContactRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      aria-describedby={CONTACT_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceContactRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceContactRouteActionStatus(routeActionStatusMessage);
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

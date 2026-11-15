'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type HelpLinkEvent = 'help_route_cta_clicked' | 'help_support_route_clicked';

interface HelpTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: HelpLinkEvent;
  href: string;
  source: 'hero' | 'issue_resolution_table' | 'route_map' | 'setup_prep' | 'trust_context';
  statusMessage?: string;
}

interface HelpTrackedEmailLinkProps {
  children: ReactNode;
  className: string;
  clickStatusMessage: string;
  focusStatusMessage: string;
  href: string;
}

export const HELP_ROUTE_ACTION_STATUS_ID = 'help-route-action-status';
const HELP_ROUTE_ACTION_STATUS_LABEL = 'Help next-step status';
const HELP_ROUTE_ACTION_STATUS_EVENT = 'help-route-action-status-update';
export const HELP_ROUTE_ACTION_READY_STATUS =
  'Help next-step links are ready. Use support options, FAQ, contact, support email, device support, policy, onboarding, warranty, service, and setup support links for next steps.';

function getHelpRouteActionStatusMessage({
  href,
  source,
}: Pick<HelpTrackedLinkProps, 'href' | 'source'>) {
  if (href === '#help-center-tabs') {
    return 'Opening support options from the help route.';
  }

  if (href === '/faq') {
    return 'Opening FAQ from the help route.';
  }

  if (href === '/contact') {
    return 'Opening Contact Hylono from the help route.';
  }

  if (href === '/help?tab=support#help-center-tabs') {
    return 'Opening device support options from the help route.';
  }

  if (href === '/shipping') {
    return 'Opening shipping guidance from the help route.';
  }

  if (href === '/returns') {
    return 'Opening returns guidance from the help route.';
  }

  if (href === '/warranty') {
    return 'Opening warranty guidance from the help route.';
  }

  if (href === '/delivery-installation-onboarding') {
    return 'Opening delivery and onboarding from the help route.';
  }

  if (href === '/contact?intent=setup-support') {
    return 'Opening setup support contact from the help route.';
  }

  if (href === '/contact?intent=device-support') {
    return 'Opening device support contact from the help route.';
  }

  if (href === '/service-and-support') {
    return 'Opening service support from the help route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the help route.`;
}

function announceHelpRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(HELP_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function HelpRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(HELP_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(HELP_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(HELP_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={HELP_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={HELP_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function HelpTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
  statusMessage,
}: HelpTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getHelpRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={HELP_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceHelpRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceHelpRouteActionStatus(routeActionStatusMessage);
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination: href,
          source,
        });
        if (href.startsWith('/contact')) {
          analytics.capture('support_contact_click', {
            route: '/help',
            destination: href,
            cta_role: ctaRole,
            source,
          });
        }
      }}
    >
      {children}
    </Link>
  );
}

export function HelpTrackedEmailLink({
  children,
  className,
  clickStatusMessage,
  focusStatusMessage,
  href,
}: HelpTrackedEmailLinkProps) {
  return (
    <a
      href={href}
      className={className}
      aria-describedby={HELP_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceHelpRouteActionStatus(focusStatusMessage);
      }}
      onClick={() => {
        announceHelpRouteActionStatus(clickStatusMessage);
      }}
    >
      {children}
    </a>
  );
}

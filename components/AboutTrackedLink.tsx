'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type AboutLinkEvent = 'about_route_cta_clicked' | 'about_trust_route_clicked';

interface AboutTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: AboutLinkEvent;
  href: string;
  source: 'hero' | 'trust_route_map';
  clickStatusMessage?: string;
  focusStatusMessage?: string;
  style?: React.CSSProperties;
}

export const ABOUT_ROUTE_ACTION_STATUS_ID = 'about-route-action-status';
const ABOUT_ROUTE_ACTION_STATUS_LABEL = 'About next-step status';
const ABOUT_ROUTE_ACTION_STATUS_EVENT = 'about-route-action-status-update';
export const ABOUT_ROUTE_ACTION_READY_STATUS =
  'About next-step links are ready. Use contact, help, FAQ, research, policy, service, trust, and email links for next steps.';

function getAboutRouteLabel(href: string) {
  if (href === '/contact') {
    return 'Contact Hylono';
  }

  if (href === '/help') {
    return 'help';
  }

  if (href === '/faq') {
    return 'FAQ';
  }

  if (href === '/research') {
    return 'research hub';
  }

  if (href === '/privacy') {
    return 'privacy policy';
  }

  if (href === '/press') {
    return 'press and media context';
  }

  if (href === '/policies') {
    return 'policy center';
  }

  if (href === '/returns') {
    return 'returns policy';
  }

  if (href === '/shipping') {
    return 'shipping policy';
  }

  if (href === '/warranty') {
    return 'warranty';
  }

  if (href === '/cookie-policy') {
    return 'cookie policy';
  }

  if (href === '/terms') {
    return 'terms of service';
  }

  return 'trust route';
}

function announceAboutRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(ABOUT_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function AboutRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(ABOUT_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(ABOUT_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(ABOUT_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={ABOUT_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={ABOUT_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function AboutTrackedLink({
  children,
  className,
  clickStatusMessage,
  ctaRole,
  eventName,
  focusStatusMessage,
  href,
  source,
  style,
}: AboutTrackedLinkProps) {
  const routeActionLabel = getAboutRouteLabel(href);
  const routeActionFocusStatusMessage =
    focusStatusMessage ?? `${routeActionLabel} is ready from the about route.`;
  const routeActionClickStatusMessage =
    clickStatusMessage ?? `Opening ${routeActionLabel} from the about route.`;

  return (
    <Link
      href={href}
      className={className}
      style={style}
      aria-describedby={ABOUT_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceAboutRouteActionStatus(routeActionFocusStatusMessage);
      }}
      onClick={() => {
        announceAboutRouteActionStatus(routeActionClickStatusMessage);
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

interface AboutTrackedEmailLinkProps {
  children: ReactNode;
  className: string;
  clickStatusMessage: string;
  focusStatusMessage: string;
  href: string;
  style?: React.CSSProperties;
}

export function AboutTrackedEmailLink({
  children,
  className,
  clickStatusMessage,
  focusStatusMessage,
  href,
  style,
}: AboutTrackedEmailLinkProps) {
  return (
    <a
      href={href}
      className={className}
      style={style}
      aria-describedby={ABOUT_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceAboutRouteActionStatus(focusStatusMessage);
      }}
      onClick={() => {
        announceAboutRouteActionStatus(clickStatusMessage);
      }}
    >
      {children}
    </a>
  );
}

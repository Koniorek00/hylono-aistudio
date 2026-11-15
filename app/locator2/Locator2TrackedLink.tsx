'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type Locator2LinkEvent = 'locator2_route_cta_clicked' | 'locator2_route_transition_clicked';
type Locator2LinkHref = ComponentProps<typeof Link>['href'];
type Locator2LinkSource = 'hero' | 'partner_type' | 'request_checklist' | 'support_context';

export const LOCATOR2_ROUTE_ACTION_STATUS_ID = 'locator2-route-action-status';
export const LOCATOR2_ROUTE_ACTION_READY_STATUS_MESSAGE =
  'Locator2 route controls ready: guided introduction, request-type, rental, and support exits.';

const stringifyHref = (href: Locator2LinkHref): string => {
  if (typeof href === 'string') return href;

  const params = new URLSearchParams();
  const query = href.query ?? {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'undefined') continue;

    const values = Array.isArray(value) ? value : [value];
    for (const entry of values) {
      if (typeof entry !== 'undefined') {
        params.append(key, String(entry));
      }
    }
  }

  const queryString = params.toString();
  return `${href.pathname ?? ''}${queryString ? `?${queryString}` : ''}`;
};

interface Locator2TrackedLinkProps {
  children: ReactNode;
  className?: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName: Locator2LinkEvent;
  href: Locator2LinkHref;
  primaryCta?: boolean;
  source: Locator2LinkSource;
  statusMessage: string;
}

export function Locator2TrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  primaryCta = false,
  source,
  statusMessage,
}: Locator2TrackedLinkProps) {
  const destination = stringifyHref(href);
  const updateActionStatus = () => {
    const status = document.getElementById(LOCATOR2_ROUTE_ACTION_STATUS_ID);
    if (status) {
      status.textContent = statusMessage;
    }
  };

  const handleClick = () => {
    updateActionStatus();
    analytics.capture(eventName, {
      cta_role: ctaRole,
      destination,
      source,
    });
  };

  return (
    <Link
      href={href}
      aria-describedby={LOCATOR2_ROUTE_ACTION_STATUS_ID}
      className={className}
      data-primary-cta={primaryCta ? 'true' : undefined}
      onFocus={updateActionStatus}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

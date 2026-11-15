'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type AffiliateLinkEvent = 'affiliate_route_cta_clicked' | 'affiliate_route_transition_clicked';
type AffiliateLinkHref = ComponentProps<typeof Link>['href'];
type AffiliateLinkSource = 'hero' | 'manual_review' | 'review_expectations' | 'route_map';

export const AFFILIATE_ROUTE_ACTION_STATUS_ID = 'affiliate-route-action-status';

const stringifyHref = (href: AffiliateLinkHref): string => {
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

const usesPlainAnchor = (href: AffiliateLinkHref): href is string =>
  typeof href === 'string' &&
  (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http'));

interface AffiliateTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: AffiliateLinkEvent;
  focusStatusMessage?: string;
  href: AffiliateLinkHref;
  source: AffiliateLinkSource;
  statusMessage: string;
}

export function AffiliateTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  focusStatusMessage,
  href,
  source,
  statusMessage,
}: AffiliateTrackedLinkProps) {
  const destination = stringifyHref(href);
  const focusActionStatusMessage = focusStatusMessage ?? statusMessage;
  const updateActionStatus = (message: string) => {
    const status = document.getElementById(AFFILIATE_ROUTE_ACTION_STATUS_ID);
    if (status) {
      status.textContent = message;
    }
  };
  const handleFocus = () => {
    updateActionStatus(focusActionStatusMessage);
  };
  const handleClick = () => {
    updateActionStatus(statusMessage);
    analytics.capture(eventName, {
      cta_role: ctaRole,
      destination,
      source,
    });
  };

  if (usesPlainAnchor(href)) {
    return (
      <a
        href={href}
        className={className}
        onFocus={handleFocus}
        onClick={handleClick}
        aria-describedby={AFFILIATE_ROUTE_ACTION_STATUS_ID}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      onFocus={handleFocus}
      onClick={handleClick}
      aria-describedby={AFFILIATE_ROUTE_ACTION_STATUS_ID}
    >
      {children}
    </Link>
  );
}

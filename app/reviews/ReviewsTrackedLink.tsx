'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type ReviewsLinkEvent = 'reviews_route_cta_clicked' | 'reviews_route_transition_clicked';
type ReviewsLinkHref = ComponentProps<typeof Link>['href'];

interface ReviewsTrackedLinkProps {
  actionStatusId?: string;
  actionStatusMessage?: string;
  children: ReactNode;
  className?: string;
  ctaRole: 'primary' | 'supporting' | 'external';
  eventName: ReviewsLinkEvent;
  href: ReviewsLinkHref;
  source: string;
}

const stringifyHref = (href: ReviewsLinkHref): string => {
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

const usesPlainAnchor = (href: ReviewsLinkHref): href is string =>
  typeof href === 'string' &&
  (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http') || href.startsWith('https'));

export function ReviewsTrackedLink({
  actionStatusId,
  actionStatusMessage,
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
}: ReviewsTrackedLinkProps) {
  const destination = stringifyHref(href);
  const updateActionStatus = () => {
    if (!actionStatusId || !actionStatusMessage) {
      return;
    }

    document.getElementById(actionStatusId)?.replaceChildren(actionStatusMessage);
  };

  const handleClick = () => {
    updateActionStatus();
    analytics.capture(eventName, {
      cta_role: ctaRole,
      destination,
      source,
    });
  };

  if (usesPlainAnchor(href)) {
    return (
      <a
        href={destination}
        className={className}
        aria-describedby={actionStatusId}
        onFocus={updateActionStatus}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={actionStatusId}
      onFocus={updateActionStatus}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type LocatorLinkEvent = 'locator_route_cta_clicked' | 'locator_route_transition_clicked';
type LocatorLinkHref = ComponentProps<typeof Link>['href'];
type LocatorLinkSource = 'hero' | 'partner_type' | 'request_checklist' | 'support_context';

const stringifyHref = (href: LocatorLinkHref): string => {
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

interface LocatorTrackedLinkProps {
  actionStatusId?: string;
  actionStatusMessage?: string;
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName: LocatorLinkEvent;
  href: LocatorLinkHref;
  source: LocatorLinkSource;
}

export function LocatorTrackedLink({
  actionStatusId,
  actionStatusMessage,
  children,
  className,
  ctaRole,
  eventName,
  href,
  source,
}: LocatorTrackedLinkProps) {
  const destination = stringifyHref(href);
  const updateActionStatus = () => {
    if (!actionStatusId || !actionStatusMessage) return;

    document.getElementById(actionStatusId)?.replaceChildren(actionStatusMessage);
  };

  return (
    <Link
      href={href}
      aria-describedby={actionStatusId}
      className={className}
      onFocus={updateActionStatus}
      onClick={() => {
        updateActionStatus();
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination,
          source,
        });
      }}
    >
      {children}
    </Link>
  );
}

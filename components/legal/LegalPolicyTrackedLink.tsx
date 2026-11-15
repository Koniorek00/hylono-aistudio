'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type LegalPolicyLinkEvent = 'legal_policy_cta_clicked' | 'legal_policy_route_transition_clicked';
type LegalPolicyLinkSource =
  | 'inline_policy_content'
  | 'policy_center'
  | 'quick_actions'
  | 'related_policies'
  | 'return_warranty_answer'
  | 'section_navigation';

interface LegalPolicyTrackedLinkProps {
  ariaCurrent?: 'page';
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting';
  eventName: LegalPolicyLinkEvent;
  href: string;
  policyPath: string;
  source: LegalPolicyLinkSource;
  statusMessage?: string;
}

export const LEGAL_POLICY_ROUTE_ACTION_STATUS_ID = 'legal-policy-route-action-status';
const LEGAL_POLICY_ROUTE_ACTION_STATUS_LABEL = 'Legal policy route action status';
const LEGAL_POLICY_ROUTE_ACTION_STATUS_EVENT = 'legal-policy-route-action-status-update';
export const LEGAL_POLICY_ROUTE_ACTION_READY_STATUS =
  'Legal policy route handoffs are ready. Use privacy, terms, cookie, shipping, returns, warranty, sitemap, and support links for next steps.';

const usesPlainAnchor = (href: string) =>
  href.startsWith('#') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:') ||
  href.startsWith('http');

function getLegalPolicyRouteActionStatusMessage(href: string, source: LegalPolicyLinkSource) {
  if (href === '/policies') {
    return 'Opening policy center from legal policy pages.';
  }

  if (href === '/privacy') {
    return 'Opening privacy policy from legal policy pages.';
  }

  if (href === '/terms') {
    return 'Opening terms of service from legal policy pages.';
  }

  if (href === '/cookie-policy') {
    return 'Opening cookie policy from legal policy pages.';
  }

  if (href === '/shipping') {
    return 'Opening shipping policy from legal policy pages.';
  }

  if (href === '/returns') {
    return 'Opening returns policy from legal policy pages.';
  }

  if (href === '/warranty') {
    return 'Opening warranty policy from legal policy pages.';
  }

  if (href === '/sitemap.xml') {
    return 'Opening sitemap XML from legal policy pages.';
  }

  if (href.startsWith('mailto:')) {
    return 'Opening policy email support from legal policy pages.';
  }

  if (href.startsWith('tel:')) {
    return 'Opening phone support from legal policy pages.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from legal policy pages.`;
}

export function announceLegalPolicyRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(LEGAL_POLICY_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function LegalPolicyRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(LEGAL_POLICY_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(LEGAL_POLICY_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(LEGAL_POLICY_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={LEGAL_POLICY_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={LEGAL_POLICY_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function LegalPolicyTrackedLink({
  ariaCurrent,
  children,
  className,
  ctaRole,
  eventName,
  href,
  policyPath,
  source,
  statusMessage,
}: LegalPolicyTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getLegalPolicyRouteActionStatusMessage(href, source);

  const handleClick = () => {
    announceLegalPolicyRouteActionStatus(routeActionStatusMessage);
    analytics.capture(eventName, {
      cta_role: ctaRole,
      destination: href,
      policy_path: policyPath,
      source,
    });
  };

  if (usesPlainAnchor(href)) {
    return (
      <a
        href={href}
        className={className}
        aria-current={ariaCurrent}
        aria-describedby={LEGAL_POLICY_ROUTE_ACTION_STATUS_ID}
        onFocus={() => {
          announceLegalPolicyRouteActionStatus(routeActionStatusMessage);
        }}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-current={ariaCurrent}
      aria-describedby={LEGAL_POLICY_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceLegalPolicyRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

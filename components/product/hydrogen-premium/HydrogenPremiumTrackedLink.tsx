'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { HydrogenPremiumSlug } from '@/content/hydrogen-premium-2026';
import analytics from '@/src/lib/analytics';

type HydrogenPremiumLinkEvent =
  | 'product_route_cta_clicked'
  | 'product_route_transition_clicked';

type HydrogenPremiumLinkSource =
  | 'application_path'
  | 'breadcrumb'
  | 'bundle_path'
  | 'delivery_path'
  | 'evidence_path'
  | 'hero'
  | 'family_comparison'
  | 'pairing_path'
  | 'route_map'
  | 'final_cta'
  | 'trust_context';

interface HydrogenPremiumTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'policy';
  eventName?: HydrogenPremiumLinkEvent;
  href: string;
  productSlug: HydrogenPremiumSlug;
  rel?: string;
  source: HydrogenPremiumLinkSource;
  style?: CSSProperties;
  target?: string;
}

export const HYDROGEN_PREMIUM_ROUTE_ACTION_STATUS_ID =
  'hydrogen-premium-route-action-status';
const HYDROGEN_PREMIUM_ROUTE_ACTION_STATUS_LABEL =
  'Hydrogen premium route action status';
const HYDROGEN_PREMIUM_ROUTE_ACTION_STATUS_EVENT =
  'hydrogen-premium-route-action-status-update';
export const HYDROGEN_PREMIUM_ROUTE_ACTION_READY_STATUS =
  'Hydrogen premium route handoffs are ready. Use guidance, comparison, rental, hydrogen hub, research, protocol, and policy links for next steps.';

function getHydrogenPremiumRouteActionStatusMessage(
  href: string,
  source: HydrogenPremiumLinkSource
) {
  if (href === '/contact?tech=hydrogen') {
    return 'Opening hydrogen guidance contact from the hydrogen premium route.';
  }

  if (href === '/') {
    return 'Opening home from the hydrogen premium route.';
  }

  if (href === '/store') {
    return 'Opening store from the hydrogen premium route.';
  }

  if (href === '#family-comparison') {
    return 'Opening family comparison from the hydrogen premium route.';
  }

  if (href === '#select-configuration') {
    return 'Opening configuration selector from the hydrogen premium route.';
  }

  if (href === '/rental' || href === '/rental?device=hydrogen') {
    return 'Opening hydrogen rental access from the hydrogen premium route.';
  }

  if (href === '/product/hydrogen') {
    return 'Opening hydrogen hub from the hydrogen premium route.';
  }

  if (href.startsWith('/product/')) {
    return source === 'family_comparison' || source === 'delivery_path'
      ? 'Opening hydrogen model comparison from the hydrogen premium route.'
      : 'Opening related product hub from the hydrogen premium route.';
  }

  if (href === '/research') {
    return 'Opening research hub from the hydrogen premium route.';
  }

  if (source === 'evidence_path' || href.startsWith('http')) {
    return 'Opening cited hydrogen study from the hydrogen premium route.';
  }

  if (href.startsWith('/protocols')) {
    return 'Opening protocol guide from the hydrogen premium route.';
  }

  if (href.startsWith('/conditions')) {
    return 'Opening condition guide from the hydrogen premium route.';
  }

  if (href === '/shipping') {
    return 'Opening shipping policy from the hydrogen premium route.';
  }

  if (href === '/returns') {
    return 'Opening returns policy from the hydrogen premium route.';
  }

  if (href === '/warranty') {
    return 'Opening warranty policy from the hydrogen premium route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the hydrogen premium route.`;
}

function announceHydrogenPremiumRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(HYDROGEN_PREMIUM_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function HydrogenPremiumRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(
    HYDROGEN_PREMIUM_ROUTE_ACTION_READY_STATUS
  );

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(
      HYDROGEN_PREMIUM_ROUTE_ACTION_STATUS_EVENT,
      handleStatusUpdate
    );

    return () => {
      window.removeEventListener(
        HYDROGEN_PREMIUM_ROUTE_ACTION_STATUS_EVENT,
        handleStatusUpdate
      );
    };
  }, []);

  return (
    <p
      id={HYDROGEN_PREMIUM_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={HYDROGEN_PREMIUM_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function HydrogenPremiumTrackedLink({
  children,
  className,
  ctaRole,
  eventName = 'product_route_transition_clicked',
  href,
  productSlug,
  rel,
  source,
  style,
  target,
}: HydrogenPremiumTrackedLinkProps) {
  const routeActionStatusMessage = getHydrogenPremiumRouteActionStatusMessage(href, source);
  const handleStatusUpdate = () => {
    announceHydrogenPremiumRouteActionStatus(routeActionStatusMessage);
  };
  const handleClick = () => {
    handleStatusUpdate();
    analytics.capture(eventName, {
      cta_role: ctaRole,
      destination: href,
      product_slug: productSlug,
      source,
    });
  };

  if (href.startsWith('http')) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        target={target}
        rel={rel}
        aria-describedby={HYDROGEN_PREMIUM_ROUTE_ACTION_STATUS_ID}
        onFocus={handleStatusUpdate}
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
      style={style}
      target={target}
      rel={rel}
      aria-describedby={HYDROGEN_PREMIUM_ROUTE_ACTION_STATUS_ID}
      onFocus={handleStatusUpdate}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

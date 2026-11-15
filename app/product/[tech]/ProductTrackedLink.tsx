'use client';

import Link from 'next/link';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type ProductLinkEvent = 'product_route_cta_clicked' | 'product_route_transition_clicked';
type ProductLinkHref = ComponentProps<typeof Link>['href'];

const stringifyHref = (href: ProductLinkHref): string => {
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

interface ProductTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'policy';
  eventName?: ProductLinkEvent;
  href: ProductLinkHref;
  productSlug: string;
  statusMessage?: string;
  source:
    | 'format_criteria'
    | 'device_comparison_mode'
    | 'persistent_decision_bar'
    | 'risk_reversal_proof_pack'
    | 'secondary_route'
    | 'server_intro'
    | 'setup_media_readiness'
    | 'trust_context';
}

export const PRODUCT_ROUTE_ACTION_STATUS_ID = 'product-route-action-status';
const PRODUCT_ROUTE_ACTION_STATUS_LABEL = 'Product next-step status';
const PRODUCT_ROUTE_ACTION_STATUS_EVENT = 'product-route-action-status-update';
export const PRODUCT_ROUTE_ACTION_READY_STATUS =
  'Product next-step links are ready. Use rental planning, research, support, policy, store, condition, protocol, and related product guides for next steps.';

function getProductRouteActionStatusMessage({
  destination,
  source,
}: {
  destination: string;
  source: ProductTrackedLinkProps['source'];
}) {
  if (destination.startsWith('/rental')) {
    return 'Opening rental planning from this product page.';
  }

  if (destination === '/research') {
    return 'Opening research hub from this product page.';
  }

  if (destination.startsWith('/contact')) {
    return 'Opening Hylono support from this product page.';
  }

  if (destination === '/store') {
    return 'Opening product hubs from this product page.';
  }

  if (destination === '/shipping') {
    return 'Opening shipping policy from this product page.';
  }

  if (destination === '/returns') {
    return 'Opening returns policy from this product page.';
  }

  if (destination === '/warranty') {
    return 'Opening warranty policy from this product page.';
  }

  if (destination === '/help') {
    return 'Opening help center from this product page.';
  }

  if (destination === '/financing') {
    return 'Opening financing options from this product page.';
  }

  if (destination.startsWith('/conditions')) {
    return 'Opening condition guidance from this product page.';
  }

  if (destination.startsWith('/protocols')) {
    return 'Opening protocols from this product page.';
  }

  if (destination.startsWith('/product/')) {
    return 'Opening related product hub from this product page.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from this product page.`;
}

function announceProductRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(PRODUCT_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function ProductRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(PRODUCT_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(PRODUCT_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(PRODUCT_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={PRODUCT_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={PRODUCT_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function ProductTrackedLink({
  children,
  className,
  ctaRole,
  eventName = 'product_route_transition_clicked',
  href,
  productSlug,
  statusMessage,
  source,
}: ProductTrackedLinkProps) {
  const destination = stringifyHref(href);
  const routeActionStatusMessage =
    statusMessage ?? getProductRouteActionStatusMessage({ destination, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={PRODUCT_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceProductRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceProductRouteActionStatus(routeActionStatusMessage);
        analytics.capture(eventName, {
          cta_role: ctaRole,
          destination,
          product_slug: productSlug,
          source,
        });
      }}
    >
      {children}
    </Link>
  );
}

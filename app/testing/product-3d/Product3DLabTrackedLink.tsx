'use client';

import Link from 'next/link';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';

type Product3DLabRouteHref = ComponentProps<typeof Link>['href'];

export const PRODUCT_3D_LAB_ROUTE_ACTION_STATUS_ID = 'product-3d-lab-route-action-status';
const PRODUCT_3D_LAB_ROUTE_ACTION_STATUS_LABEL = 'Product 3D asset lab route action status';
const PRODUCT_3D_LAB_ROUTE_ACTION_STATUS_EVENT = 'product-3d-lab-route-action-status-update';
export const PRODUCT_3D_LAB_ROUTE_ACTION_READY_STATUS =
  'Product 3D asset lab route handoffs are ready: supported product pages, contact handoff, help center, and stronger-route exits.';

const stringifyHref = (href: Product3DLabRouteHref): string => {
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

function getProduct3DLabRouteActionStatusMessage(destination: string, label: string) {
  if (destination === '/store') {
    return 'Opening supported product pages from the Product 3D asset lab.';
  }

  if (destination.startsWith('/contact')) {
    return 'Opening Hylono contact with Product 3D asset lab context.';
  }

  if (destination === '/help') {
    return 'Opening the help center from the Product 3D asset lab.';
  }

  return `Opening ${label} from the Product 3D asset lab.`;
}

function announceProduct3DLabRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(PRODUCT_3D_LAB_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function Product3DLabRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(PRODUCT_3D_LAB_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(PRODUCT_3D_LAB_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(PRODUCT_3D_LAB_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={PRODUCT_3D_LAB_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={PRODUCT_3D_LAB_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function Product3DLabTrackedLink({
  children,
  className,
  href,
  label,
}: {
  children: ReactNode;
  className: string;
  href: Product3DLabRouteHref;
  label: string;
}) {
  const destination = stringifyHref(href);
  const statusMessage = getProduct3DLabRouteActionStatusMessage(destination, label);

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={PRODUCT_3D_LAB_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceProduct3DLabRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        announceProduct3DLabRouteActionStatus(statusMessage);
      }}
    >
      {children}
    </Link>
  );
}

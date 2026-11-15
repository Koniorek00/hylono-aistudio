'use client';

import Link from 'next/link';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';

type PolishRouteHref = ComponentProps<typeof Link>['href'];

export const POLISH_ROUTE_ACTION_STATUS_ID = 'polish-mini-site-route-action-status';
export const POLISH_ROUTE_ACTION_READY_STATUS =
  'Linki polskiej sekcji Hylono sa gotowe: start, HBOT, H2, kontakt i email.';

const POLISH_ROUTE_ACTION_STATUS_EVENT = 'polish-mini-site-route-action-status-update';

const stringifyHref = (href: PolishRouteHref): string => {
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

function getPolishRouteActionStatusMessage(href: string, label: string) {
  if (href === '/pl') return 'Otwieranie polskiej strony startowej Hylono.';
  if (href === '/pl/product/hbot') return 'Otwieranie polskiej strony produktu HBOT.';
  if (href === '/pl/product/hydrogen') return 'Otwieranie polskiej strony produktu H2.';
  if (href === '/pl/contact') return 'Otwieranie polskiego formularza kontaktowego Hylono.';
  if (href.startsWith('/pl/contact?tech=hbot')) {
    return 'Otwieranie polskiego formularza kontaktowego z kontekstem HBOT.';
  }
  if (href.startsWith('/pl/contact?tech=hydrogen')) {
    return 'Otwieranie polskiego formularza kontaktowego z kontekstem H2.';
  }
  if (href.startsWith('mailto:')) {
    return 'Otwieranie klienta poczty dla polskiego kontaktu Hylono.';
  }

  return `Otwieranie ${label} w polskiej sekcji Hylono.`;
}

function announcePolishRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(POLISH_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function PolishRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(POLISH_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(POLISH_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(POLISH_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={POLISH_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Status akcji polskiej sekcji Hylono"
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function PolishTrackedLink({
  ariaLabel,
  children,
  className,
  href,
  label,
}: {
  ariaLabel?: string;
  children: ReactNode;
  className: string;
  href: PolishRouteHref;
  label: string;
}) {
  const destination = stringifyHref(href);
  const statusMessage = getPolishRouteActionStatusMessage(destination, label);

  return destination.startsWith('mailto:') ? (
    <a
      href={destination}
      aria-describedby={POLISH_ROUTE_ACTION_STATUS_ID}
      aria-label={ariaLabel}
      className={className}
      onFocus={() => announcePolishRouteActionStatus(statusMessage)}
      onClick={() => announcePolishRouteActionStatus(statusMessage)}
    >
      {children}
    </a>
  ) : (
    <Link
      href={href}
      aria-describedby={POLISH_ROUTE_ACTION_STATUS_ID}
      aria-label={ariaLabel}
      className={className}
      onFocus={() => announcePolishRouteActionStatus(statusMessage)}
      onClick={() => announcePolishRouteActionStatus(statusMessage)}
    >
      {children}
    </Link>
  );
}

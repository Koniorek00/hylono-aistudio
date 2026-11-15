'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type UnsubscribeLinkEvent = 'unsubscribe_route_transition_clicked';
type UnsubscribeLinkSource = 'support_panel';

interface UnsubscribeTrackedLinkProps {
  children: ReactNode;
  className: string;
  ctaRole: 'supporting';
  eventName: UnsubscribeLinkEvent;
  focusStatusMessage: string;
  href: string;
  source: UnsubscribeLinkSource;
  statusMessage: string;
}

interface UnsubscribeTrackedSubmitButtonProps {
  children: ReactNode;
  className: string;
  focusStatusMessage: string;
  statusMessage: string;
}

export const UNSUBSCRIBE_HANDOFF_STATUS_ID = 'unsubscribe-handoff-status';
const UNSUBSCRIBE_HANDOFF_STATUS_LABEL = 'Email preference handoff status';
export const UNSUBSCRIBE_HANDOFF_READY_STATUS =
  'Ready to open the contact route for manual email preference support. This page does not change provider subscriptions automatically.';

const updateUnsubscribeHandoffStatus = (message: string) => {
  const status = document.getElementById(UNSUBSCRIBE_HANDOFF_STATUS_ID);
  if (status) {
    status.textContent = message;
  }
};

export function UnsubscribeHandoffStatus() {
  return (
    <p
      id={UNSUBSCRIBE_HANDOFF_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={UNSUBSCRIBE_HANDOFF_STATUS_LABEL}
      className="sr-only"
    >
      {UNSUBSCRIBE_HANDOFF_READY_STATUS}
    </p>
  );
}

export function UnsubscribeTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  focusStatusMessage,
  href,
  source,
  statusMessage,
}: UnsubscribeTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      aria-describedby={UNSUBSCRIBE_HANDOFF_STATUS_ID}
      onFocus={() => {
        updateUnsubscribeHandoffStatus(focusStatusMessage);
      }}
      onClick={() => {
        updateUnsubscribeHandoffStatus(statusMessage);
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

export function UnsubscribeTrackedSubmitButton({
  children,
  className,
  focusStatusMessage,
  statusMessage,
}: UnsubscribeTrackedSubmitButtonProps) {
  return (
    <button
      className={className}
      aria-describedby={UNSUBSCRIBE_HANDOFF_STATUS_ID}
      type="submit"
      onFocus={() => {
        updateUnsubscribeHandoffStatus(focusStatusMessage);
      }}
      onClick={() => {
        updateUnsubscribeHandoffStatus(statusMessage);
      }}
    >
      {children}
    </button>
  );
}

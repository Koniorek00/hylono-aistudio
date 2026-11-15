'use client';

import Link from 'next/link';
import type { ConditionGoalPage } from '@/content/conditions';
import analytics from '@/src/lib/analytics';

type ConditionTransitionEvent =
  | 'condition_to_contact'
  | 'condition_to_product'
  | 'condition_to_protocol'
  | 'condition_to_research'
  | 'condition_to_rental';

const conditionTransitionEvents: Array<{
  event: ConditionTransitionEvent;
  prefix: string;
}> = [
  { prefix: '/product/', event: 'condition_to_product' },
  { prefix: '/protocols/', event: 'condition_to_protocol' },
  { prefix: '/research', event: 'condition_to_research' },
  { prefix: '/rental', event: 'condition_to_rental' },
  { prefix: '/contact', event: 'condition_to_contact' },
];

export const CONDITION_ROUTE_ACTION_STATUS_ID = 'condition-route-action-status';
export const CONDITION_ROUTE_ACTION_STATUS_LABEL = 'Condition next-step status';
export const CONDITION_ROUTE_ACTION_READY_STATUS =
  'Condition guide next-step links are ready. Use product, protocol, research, rental, and contact links for next steps.';

function getConditionTransitionEvent(destination: string): ConditionTransitionEvent | null {
  return (
    conditionTransitionEvents.find(({ prefix }) => destination.startsWith(prefix))?.event ?? null
  );
}

export function getConditionTransitionStatusMessage(
  destination: string,
  condition: ConditionGoalPage['slug']
) {
  if (destination.startsWith('/product/')) {
    return `Opening product hub from the ${condition} condition guide.`;
  }

  if (destination.startsWith('/protocols/')) {
    return `Opening protocol guide from the ${condition} condition guide.`;
  }

  if (destination.startsWith('/research')) {
    return `Opening research hub from the ${condition} condition guide.`;
  }

  if (destination.startsWith('/rental')) {
    return `Opening rental route from the ${condition} condition guide.`;
  }

  if (destination.startsWith('/contact')) {
    return `Opening contact route from the ${condition} condition guide.`;
  }

  return `Opening ${destination} from the ${condition} condition guide.`;
}

export function announceConditionRouteActionStatus(message: string) {
  if (typeof document === 'undefined') return;

  document.getElementById(CONDITION_ROUTE_ACTION_STATUS_ID)?.replaceChildren(message);
}

export function ConditionRouteActionStatus() {
  return (
    <p
      id={CONDITION_ROUTE_ACTION_STATUS_ID}
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={CONDITION_ROUTE_ACTION_STATUS_LABEL}
    >
      {CONDITION_ROUTE_ACTION_READY_STATUS}
    </p>
  );
}

export function ConditionReturnLink({
  className,
  condition,
}: {
  className: string;
  condition: ConditionGoalPage['slug'];
}) {
  const href = '/conditions';
  const statusMessage = getConditionTransitionStatusMessage(href, condition);
  const updateActionStatus = () => {
    announceConditionRouteActionStatus(statusMessage);
  };

  return (
    <Link
      href={href}
      aria-describedby={CONDITION_ROUTE_ACTION_STATUS_ID}
      className={className}
      onFocus={updateActionStatus}
      onClick={updateActionStatus}
    >
      {'\u2190'} Back to all goals
    </Link>
  );
}

export function ConditionTransitionLink({
  className,
  condition,
  ctaRole,
  href,
  label,
  source = 'detail_next_step',
}: {
  className: string;
  condition: ConditionGoalPage['slug'];
  ctaRole: 'primary' | 'supporting' | 'fallback';
  href: string;
  label: string;
  source?:
    | 'detail_next_step'
    | 'detail_intro'
    | 'detail_route_map'
    | 'detail_decision_fork'
    | 'detail_quality_checklist';
}) {
  const transitionEvent = getConditionTransitionEvent(href);
  const statusMessage = getConditionTransitionStatusMessage(href, condition);
  const updateActionStatus = () => {
    announceConditionRouteActionStatus(statusMessage);
  };

  return (
    <Link
      href={href}
      aria-describedby={CONDITION_ROUTE_ACTION_STATUS_ID}
      className={className}
      onFocus={updateActionStatus}
      onClick={() => {
        updateActionStatus();

        if (!transitionEvent) {
          return;
        }

        analytics.capture(transitionEvent, {
          condition,
          cta_role: ctaRole,
          destination: href,
          source,
        });
      }}
    >
      {label}
    </Link>
  );
}

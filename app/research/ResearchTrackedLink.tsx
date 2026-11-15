'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

type ResearchLinkEvent =
  | 'research_route_cta_clicked'
  | 'research_to_condition'
  | 'research_to_contact'
  | 'research_to_product'
  | 'research_to_protocol'
  | 'research_to_rental';

type ResearchTrackedLinkProps = {
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'supporting' | 'contextual';
  eventName?: ResearchLinkEvent;
  href: string;
  modality?: string;
  source:
    | 'hero'
    | 'direct_exits'
    | 'evidence_export_prep'
    | 'evidence_comparison_table'
    | 'citation_guardrail'
    | 'condition_prompt'
    | 'intent_next_steps'
    | 'research_synthesis_brief'
    | 'modality_snapshot'
    | 'ownership_freshness'
    | 'study_card'
    | 'final_next_step';
  statusMessage?: string;
  studyId?: string;
};

type ResearchTrackedExternalLinkProps = {
  children: ReactNode;
  className: string;
  href: string;
  rel?: string;
  statusMessage?: string;
  target?: string;
};

export const RESEARCH_ROUTE_ACTION_STATUS_ID = 'research-route-action-status';
const RESEARCH_ROUTE_ACTION_STATUS_LABEL = 'Research route action status';
const RESEARCH_ROUTE_ACTION_STATUS_EVENT = 'research-route-action-status-update';
export const RESEARCH_ROUTE_ACTION_READY_STATUS =
  'Research route handoffs are ready. Use technology hubs, cited study cards, condition guides, protocols, rentals, or contact routes for next steps.';

const researchTransitionEvents: Array<{
  event: ResearchLinkEvent;
  prefix: string;
}> = [
  { prefix: '/product/', event: 'research_to_product' },
  { prefix: '/store', event: 'research_to_product' },
  { prefix: '/protocols', event: 'research_to_protocol' },
  { prefix: '/conditions', event: 'research_to_condition' },
  { prefix: '/rental', event: 'research_to_rental' },
  { prefix: '/contact', event: 'research_to_contact' },
];

function getResearchTransitionEvent(destination: string): ResearchLinkEvent | null {
  return (
    researchTransitionEvents.find(({ prefix }) => destination.startsWith(prefix))?.event ?? null
  );
}

function getResearchRouteActionStatusMessage({
  href,
  source,
}: Pick<ResearchTrackedLinkProps, 'href' | 'source'>) {
  if (href === '#study-library') {
    return 'Opening cited study cards from the research route.';
  }

  if (href === '/store') {
    return 'Opening technology hubs from the research route.';
  }

  if (href === '/protocols') {
    return 'Opening protocols from the research route.';
  }

  if (href === '/contact') {
    return 'Opening Contact Hylono from the research route.';
  }

  if (href === '/policies') {
    return 'Opening policies from the research route.';
  }

  if (href === '/help') {
    return 'Opening help center from the research route.';
  }

  if (href === '/rental') {
    return 'Opening rental planning from the research route.';
  }

  if (href.startsWith('/product/')) {
    return 'Opening product research destination from the research route.';
  }

  if (href.startsWith('/conditions/')) {
    return 'Opening condition guide from the research route.';
  }

  if (href.startsWith('/protocols/')) {
    return 'Opening protocol research destination from the research route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the research route.`;
}

function announceResearchRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(RESEARCH_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function ResearchRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(RESEARCH_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(RESEARCH_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(RESEARCH_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={RESEARCH_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={RESEARCH_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function ResearchTrackedLink({
  children,
  className,
  ctaRole,
  eventName,
  href,
  modality,
  source,
  statusMessage,
  studyId,
}: ResearchTrackedLinkProps) {
  const transitionEvent = eventName ?? getResearchTransitionEvent(href);
  const routeActionStatusMessage =
    statusMessage ?? getResearchRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={RESEARCH_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceResearchRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceResearchRouteActionStatus(routeActionStatusMessage);

        if (!transitionEvent) {
          return;
        }

        analytics.capture(transitionEvent, {
          cta_role: ctaRole,
          destination: href,
          source,
          ...(studyId ? { study_id: studyId } : {}),
          ...(modality ? { modality } : {}),
        });
      }}
    >
      {children}
    </Link>
  );
}

export function ResearchTrackedExternalLink({
  children,
  className,
  href,
  rel,
  statusMessage = 'Opening source study from the research route.',
  target,
}: ResearchTrackedExternalLinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      aria-describedby={RESEARCH_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceResearchRouteActionStatus(statusMessage);
      }}
      onClick={() => {
        announceResearchRouteActionStatus(statusMessage);
      }}
    >
      {children}
    </a>
  );
}

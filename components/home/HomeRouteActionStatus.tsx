'use client';

export const HOME_ROUTE_ACTION_STATUS_ID = 'home-route-action-status';
export const HOME_ROUTE_ACTION_STATUS_LABEL = 'Home route action status';
export const HOME_ROUTE_ACTION_READY_STATUS =
  'Homepage route handoffs are ready. Use consultation, planner, access, product, research, rental, policy, and support links for next steps.';

export function getHomeRouteActionStatusMessage(destination: string, source = 'homepage') {
  if (destination === '#home-how-it-works') {
    return 'Opening the homepage process section.';
  }

  if (destination === '/consultation') {
    return `Opening consultation from ${source}.`;
  }

  if (destination === '/wellness-planner') {
    return `Opening the wellness planner from ${source}.`;
  }

  if (destination === '/rental') {
    return `Opening rental paths from ${source}.`;
  }

  if (destination === '/store') {
    return `Opening ownership options from ${source}.`;
  }

  if (destination.startsWith('/product/')) {
    return `Opening product hub from ${source}.`;
  }

  if (destination === '/research') {
    return `Opening research hub from ${source}.`;
  }

  if (destination === '/protocols') {
    return `Opening protocol library from ${source}.`;
  }

  if (destination.startsWith('/conditions')) {
    return `Opening condition guide from ${source}.`;
  }

  if (destination === '/for-home') {
    return `Opening the home planning path from ${source}.`;
  }

  if (destination === '/for-professionals') {
    return `Opening the professional path from ${source}.`;
  }

  if (destination === '/contact') {
    return `Opening contact from ${source}.`;
  }

  if (destination === '/delivery-installation-onboarding') {
    return `Opening delivery and onboarding from ${source}.`;
  }

  if (destination === '/service-and-support') {
    return `Opening service and support from ${source}.`;
  }

  if (['/help', '/faq', '/shipping', '/returns', '/warranty'].includes(destination)) {
    return `Opening support and policy route from ${source}.`;
  }

  return `Opening ${destination} from ${source}.`;
}

export function announceHomeRouteAction(destination: string, source?: string) {
  document
    .getElementById(HOME_ROUTE_ACTION_STATUS_ID)
    ?.replaceChildren(getHomeRouteActionStatusMessage(destination, source));
}

export function HomeRouteActionStatus() {
  return (
    <p
      id={HOME_ROUTE_ACTION_STATUS_ID}
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={HOME_ROUTE_ACTION_STATUS_LABEL}
    >
      {HOME_ROUTE_ACTION_READY_STATUS}
    </p>
  );
}

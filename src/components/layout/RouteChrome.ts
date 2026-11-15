const PAGE_NAVIGATOR_HIDDEN_SEGMENTS = new Set(['contact', 'help']);
const CHROMELESS_ROUTE_SEGMENTS = new Set(['login', 'onboarding', 'pl', 'checkout', 'home-new-opus']);

export const shouldUseAppShellRoute = (pathname: string): boolean => {
  const rootSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  return rootSegment === 'nexus';
};

export const shouldHideSiteChrome = (pathname: string): boolean => {
  const rootSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  return shouldUseAppShellRoute(pathname) || CHROMELESS_ROUTE_SEGMENTS.has(rootSegment);
};

export const shouldHideBreadcrumbs = (pathname: string): boolean => {
  if (!pathname || pathname === '/') {
    return true;
  }

  const rootSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  return (
    rootSegment === 'partners' ||
    rootSegment === 'meridian' ||
    rootSegment === 'locator' ||
    rootSegment === 'hylono-elite' ||

    rootSegment === 'checkout' ||
    shouldHideSiteChrome(pathname)
  );
};

export const shouldShowBreadcrumbPageNavigator = (pathname: string): boolean => {
  if (!pathname || shouldHideBreadcrumbs(pathname)) {
    return false;
  }

  const rootSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  return !PAGE_NAVIGATOR_HIDDEN_SEGMENTS.has(rootSegment);
};

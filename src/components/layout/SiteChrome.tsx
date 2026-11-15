'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSelectedLayoutSegments } from 'next/navigation';
import dynamic from 'next/dynamic';
import { GlobalOverlays } from '@/src/components/layout/GlobalOverlays';
import {
  shouldHideBreadcrumbs,
  shouldHideSiteChrome,
  shouldUseAppShellRoute,
} from '@/src/components/layout/RouteChrome';
import analytics from '@/src/lib/analytics';
import { LandingHeader, LandingFooter } from '@/components/landing-2026/LandingChrome';
import { LandingConsent } from '@/components/landing-2026/LandingConsent';

// Keep other routes' rich chrome out of the new landing page's initial bundle.
const RouteBreadcrumbs = dynamic(() => import('@/src/components/layout/RouteBreadcrumbs').then(module => module.RouteBreadcrumbs));
const Header = dynamic(() => import('@/src/components/layout/Header').then(module => module.Header));
const Footer = dynamic(() => import('@/src/components/layout/Footer').then(module => module.Footer));

interface SiteChromeProps {
  slot: 'top' | 'bottom';
}

function HeaderSpacer() {
  return <div aria-hidden="true" className="h-[72px] xl:h-[104px]" />;
}

const normalizePageViewPath = (pathname: string) => pathname || '/';

const getPageViewRouteScope = (pathname: string) => {
  if (pathname.startsWith('/pl')) {
    return 'localized';
  }

  if (shouldUseAppShellRoute(pathname)) {
    return 'app_shell';
  }

  if (shouldHideSiteChrome(pathname)) {
    return 'fullscreen';
  }

  return 'public';
};

export function SiteChrome({ slot }: SiteChromeProps) {
  const pathname = usePathname() ?? '';
  // The 404 page is prerendered once with pathname "/_not-found", but the browser hydrates it
  // under the visitor's real URL, so pathname-derived breadcrumbs differ and React throws #418.
  // The router segments come from the RSC payload and read "/_not-found" on server and client alike.
  const layoutSegments = useSelectedLayoutSegments();
  const isNotFoundPage = layoutSegments.some(
    (segment) => segment.replace(/^\//, '') === '_not-found'
  );
  const lastTrackedPageViewPathRef = useRef<string | null>(null);
  const shouldOmitSiteChrome = shouldHideSiteChrome(pathname);

  useEffect(() => {
    if (slot !== 'top') {
      return;
    }

    const canonicalRoute = normalizePageViewPath(pathname);
    if (lastTrackedPageViewPathRef.current === canonicalRoute) {
      return;
    }

    lastTrackedPageViewPathRef.current = canonicalRoute;
    analytics.pageView(canonicalRoute);
    analytics.capture('page_view', {
      canonical_route: canonicalRoute,
      route_scope: getPageViewRouteScope(canonicalRoute),
    });
  }, [pathname, slot]);

  if (slot === 'top') {
    if (shouldOmitSiteChrome) {
      return null;
    }

    if (pathname === '/') return <LandingHeader />;

    return (
      <>
        <Header />
        {isNotFoundPage || shouldHideBreadcrumbs(pathname) ? <HeaderSpacer /> : <RouteBreadcrumbs />}
      </>
    );
  }

  if (shouldOmitSiteChrome) {
    return <GlobalOverlays />;
  }

  if (pathname === '/') return <><LandingFooter /><LandingConsent /><GlobalOverlays deferTools showConsent={false} /></>;

  const isContactPage = pathname === '/contact' || pathname === '/contact/';

  return (
    <>
      <Footer variant={isContactPage ? 'minimal' : 'default'} />
      <GlobalOverlays />
    </>
  );
}

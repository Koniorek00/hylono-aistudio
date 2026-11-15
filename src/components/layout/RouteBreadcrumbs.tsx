'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/src/components/navigation/Breadcrumbs';
import {
  shouldHideBreadcrumbs,
  shouldShowBreadcrumbPageNavigator,
} from '@/src/components/layout/RouteChrome';

const DARK_BREADCRUMB_ROUTE_FAMILIES = new Set([
  'blog',
  'conditions',
  'contact',
  'homepage-test',
  'preview',
  'product',
  'protocols',
  'rental',
  'research',
  'search',
  'store',
]);

export function RouteBreadcrumbs() {
  const pathname = usePathname();
  const breadcrumbRef = useRef<HTMLDivElement | null>(null);
  const hideBreadcrumbs = !pathname || shouldHideBreadcrumbs(pathname);
  const showPageNavigator = pathname ? shouldShowBreadcrumbPageNavigator(pathname) : false;

  const pathParts = pathname?.split('/').filter(Boolean) ?? [];
  const breadcrumbVariant = DARK_BREADCRUMB_ROUTE_FAMILIES.has(pathParts[0] ?? '')
    ? 'dark'
    : 'light';
  const breadcrumbOffset =
    'calc(var(--route-header-offset, var(--route-header-height, 72px)) - 1px)';
  const breadcrumbSpacerHeight =
    'calc(var(--route-header-stable-height, var(--route-header-height, 72px)) + var(--route-breadcrumb-height, 56px) - 1px)';

  useEffect(() => {
    const root = document.documentElement;
    let animationFrameId: number | null = null;

    if (hideBreadcrumbs) {
      root.style.setProperty('--route-breadcrumb-height', '0px');
      return () => {
        root.style.setProperty('--route-breadcrumb-height', '0px');
      };
    }

    const syncBreadcrumbHeight = () => {
      const measuredHeight = breadcrumbRef.current?.offsetHeight ?? 0;
      const nextHeight = `${measuredHeight}px`;

      if (root.style.getPropertyValue('--route-breadcrumb-height') !== nextHeight) {
        root.style.setProperty('--route-breadcrumb-height', nextHeight);
      }
    };

    const scheduleSync = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = window.requestAnimationFrame(() => {
        syncBreadcrumbHeight();
        animationFrameId = null;
      });
    };

    scheduleSync();

    const observer =
      typeof ResizeObserver !== 'undefined' && breadcrumbRef.current
        ? new ResizeObserver(() => scheduleSync())
        : null;

    if (observer && breadcrumbRef.current) {
      observer.observe(breadcrumbRef.current);
    }

    window.addEventListener('resize', scheduleSync);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      observer?.disconnect();
      window.removeEventListener('resize', scheduleSync);
      root.style.setProperty('--route-breadcrumb-height', '0px');
    };
  }, [hideBreadcrumbs, pathname]);

  if (hideBreadcrumbs) {
    return null;
  }

  return (
    <>
      <div aria-hidden="true" style={{ height: breadcrumbSpacerHeight }} />
      <div
        ref={breadcrumbRef}
        className="fixed left-0 right-0 z-40 py-2.5"
        style={{
          top: breadcrumbOffset,
          width: '100%',
          maxWidth: '100%',
          overflowX: 'clip',
        }}
      >
        <div
          className={`pointer-events-none absolute inset-0 ${
            breadcrumbVariant === 'dark' ? 'bg-[rgba(255,253,248,0.96)]' : 'bg-white'
          }`}
          style={{
            backgroundColor:
              breadcrumbVariant === 'dark' ? 'rgba(255, 253, 248, 0.96)' : '#ffffff',
            opacity: 1,
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
          }}
        />
        <div
          className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent ${
            breadcrumbVariant === 'dark' ? 'via-[var(--border-soft)]' : 'via-slate-300'
          } to-transparent`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 h-[1px] ${
            breadcrumbVariant === 'dark' ? 'bg-[var(--border-soft)]' : 'bg-slate-200'
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-b from-transparent ${
            breadcrumbVariant === 'dark' ? 'to-stone-100/80' : 'to-slate-100/50'
          }`}
        />
        <div className="relative">
          <Breadcrumbs
            pathParts={pathParts}
            showPageNavigator={showPageNavigator}
            variant={breadcrumbVariant}
          />
        </div>
      </div>
    </>
  );
}

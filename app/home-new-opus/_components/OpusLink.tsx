'use client';

import type { ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

const ROUTE = '/home-new-opus';

/** Plain anchor so navigation works without JavaScript; analytics respects consent. */
export function OpusLink({
  href,
  children,
  className,
  source,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  source: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        if (source === 'hero') {
          analytics.capture('hero_cta_click', {
            route: ROUTE,
            destination: href,
            cta_role: primary ? 'primary' : 'supporting',
            source,
          });
        }
        if (href.startsWith('/consultation')) {
          analytics.capture('home_consultation_cta_clicked', {
            destination: href,
            source,
            route: ROUTE,
          });
        }
        analytics.capture('home_access_path_clicked', {
          route: ROUTE,
          destination: href,
          source,
        });
      }}
    >
      {children}
    </a>
  );
}
